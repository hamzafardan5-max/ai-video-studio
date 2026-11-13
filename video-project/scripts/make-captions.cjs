// One-off: build src/captions.ts from captions.json (Whisper word timestamps).
// Groups words into short 2-3 word caption lines without splitting phrases
// like "Los Santos" or "asset streaming".
const fs = require("fs");
const words = require("../captions.json");
const path = require("path");

const PHRASES = [
  "Los Santos",
  "GTA V's",
  "Xbox 360",
  "asset streaming",
  "level of detail",
  "no longer",
];

// Greedy chunks: max 3 words, break at sentence ends and >500ms pauses.
const chunks = [];
let cur = [];
let curStart = null;
const flush = () => {
  if (cur.length) {
    chunks.push({ words: cur.slice(), startMs: curStart, endMs: cur[cur.length - 1].endMs });
    cur = [];
    curStart = null;
  }
};
for (let i = 0; i < words.length; i++) {
  const w = words[i];
  const t = w.text.trim();
  if (curStart === null) curStart = w.startMs;
  cur.push({ text: t, startMs: w.startMs, endMs: w.endMs });
  const next = words[i + 1];
  const gap = next ? next.startMs - w.endMs : Infinity;
  if (cur.length >= 3 || /[.?!],?$/.test(t) || gap > 500) flush();
}
flush();

const splitsPhrase = (leftWords, rightWords) => {
  const L = leftWords.map((w) => w.text).join(" ");
  const R = rightWords.map((w) => w.text).join(" ");
  return PHRASES.some((p) => {
    const parts = p.split(" ");
    return parts.some((_, i) => {
      if (i === 0) return false;
      return L.endsWith(parts.slice(0, i).join(" ")) && R.startsWith(parts.slice(i).join(" "));
    });
  });
};

// Merge chunks that split a protected phrase, then rebalance to <=4 words.
const merged = [];
for (const c of chunks) {
  const prev = merged[merged.length - 1];
  if (prev && splitsPhrase(prev.words, c.words)) {
    prev.words = prev.words.concat(c.words);
    prev.endMs = c.endMs;
  } else {
    merged.push({ words: c.words.slice(), startMs: c.startMs, endMs: c.endMs });
  }
}

const balanced = [];
for (const g of merged) {
  if (g.words.length <= 4) {
    balanced.push(g);
    continue;
  }
  // find a split point that does not cut a protected phrase
  let splitAt = -1;
  for (let k = 2; k <= g.words.length - 2; k++) {
    if (!splitsPhrase(g.words.slice(0, k), g.words.slice(k))) {
      splitAt = k;
      break;
    }
  }
  if (splitAt === -1) {
    balanced.push(g);
  } else {
    const a = { words: g.words.slice(0, splitAt), startMs: g.words[0].startMs, endMs: g.words[splitAt - 1].endMs };
    const b = { words: g.words.slice(splitAt), startMs: g.words[splitAt].startMs, endMs: g.words[g.words.length - 1].endMs };
    balanced.push(a, b);
  }
}

const fps = 30;
const lines = balanced.map((g) => {
  const start = Math.round(g.startMs / 1000 * fps);
  const end = Math.max(Math.round(g.endMs / 1000 * fps), start + 2);
  return { text: g.words.map((w) => w.text).join(" ").replace(/\s+([,.])/g, "$1"), start, end };
});

let out = "// Auto-generated from public/script.mp3 (Whisper word timestamps),\n";
out += "// grouped into short 2-3 word caption chunks. Times are frames at 30 FPS.\n";
out += "export type CaptionGroup = { text: string; start: number; end: number };\n\n";
out += "export const CAPTION_GROUPS: CaptionGroup[] = [\n";
for (const l of lines) out += "  { text: " + JSON.stringify(l.text) + ", start: " + l.start + ", end: " + l.end + " },\n";
out += "];\n";
fs.writeFileSync(path.join(__dirname, "..", "src", "captions.ts"), out);
console.log(lines.length + " groups");
for (const l of lines) console.log((l.start / 30).toFixed(2), l.text);
