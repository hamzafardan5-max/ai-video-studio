import * as THREE from 'three';

export type UnitCategory =
  // Ancient & Medieval
  | 'infantry'         // Sword silhouette
  | 'heavy-infantry'   // Tower shield + sword
  | 'spearman'         // Crossed spears / pike
  | 'phalanx'          // Triple vertical pikes
  | 'archers'          // Bow & arrow
  | 'cavalry'          // Horse + sword badge
  | 'lancers'          // Horse + spear badge
  | 'horse-archers'    // Horse + bow/arrow badge
  | 'war-elephants'    // Elephant silhouette
  // Gunpowder & Modern
  | 'musketeers'       // Crossed muskets/rifles
  | 'artillery'        // Field cannon
  | 'armor'            // Tank silhouette
  | 'air-support'      // Aircraft silhouette
  // Command
  | 'commander';       // Gold crown / star

const textureCache = new Map<string, THREE.CanvasTexture>();

export function getUnitEmblemTexture(
  category: UnitCategory,
  fillColor: string,
  borderColor = '#FFFFFF'
): THREE.CanvasTexture {
  const cacheKey = `${category}-${fillColor}-${borderColor}`;
  const cached = textureCache.get(cacheKey);
  if (cached) return cached;

  const width = 512;
  const height = 256;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // 1. Rich Faction Gradient Fill
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, adjustHexBrightness(fillColor, 18));
  gradient.addColorStop(1, adjustHexBrightness(fillColor, -18));
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // 2. Crisp Double Border Frame
  const pad = 14;
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 12;
  ctx.strokeRect(pad, pad, width - pad * 2, height - pad * 2);

  ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.lineWidth = 4;
  ctx.strokeRect(pad + 8, pad + 8, width - (pad + 8) * 2, height - (pad + 8) * 2);

  // 3. Draw Centered Aspect-Correct Historical/Modern Silhouette
  const cx = width / 2;
  const cy = height / 2;
  ctx.save();
  ctx.fillStyle = borderColor;
  ctx.strokeStyle = borderColor;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  switch (category) {
    case 'infantry':
      drawSword(ctx, cx, cy, 1.0);
      break;

    case 'heavy-infantry':
      drawShield(ctx, cx - 26, cy, 0.95);
      drawSword(ctx, cx + 38, cy, 0.85);
      break;

    case 'spearman':
      drawSpear(ctx, cx - 28, cy, -0.35, 1.0);
      drawSpear(ctx, cx + 28, cy, 0.35, 1.0);
      break;

    case 'phalanx':
      drawSpear(ctx, cx - 44, cy, 0, 1.0);
      drawSpear(ctx, cx, cy, 0, 1.0);
      drawSpear(ctx, cx + 44, cy, 0, 1.0);
      break;

    case 'archers':
      drawBowAndArrow(ctx, cx, cy, 1.0);
      break;

    case 'cavalry':
      drawHorse(ctx, cx - 28, cy + 4, 1.0);
      drawSword(ctx, cx + 68, cy - 8, 0.58);
      break;

    case 'lancers':
      drawHorse(ctx, cx - 28, cy + 4, 1.0);
      drawSpear(ctx, cx + 68, cy - 4, 0.25, 0.62);
      break;

    case 'horse-archers':
      drawHorse(ctx, cx - 32, cy + 4, 1.0);
      drawBowAndArrow(ctx, cx + 68, cy - 4, 0.55);
      break;

    case 'war-elephants':
      drawElephant(ctx, cx, cy + 6);
      break;

    case 'musketeers':
      drawRifle(ctx, cx, cy, -0.55);
      drawRifle(ctx, cx, cy, 0.55);
      break;

    case 'artillery':
      drawCannon(ctx, cx, cy + 6);
      break;

    case 'armor':
      drawTank(ctx, cx, cy + 4);
      break;

    case 'air-support':
      drawAircraft(ctx, cx, cy);
      break;

    case 'commander':
      drawCrown(ctx, cx, cy + 4);
      break;
  }

  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 8;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  textureCache.set(cacheKey, texture);
  return texture;
}

/* --- Clean Vector Silhouette Helpers --- */

function drawSword(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  // Blade
  ctx.beginPath();
  ctx.moveTo(0, -72);
  ctx.lineTo(11, -50);
  ctx.lineTo(9, 28);
  ctx.lineTo(-9, 28);
  ctx.lineTo(-11, -50);
  ctx.closePath();
  ctx.fill();
  // Crossguard
  ctx.fillRect(-32, 28, 64, 11);
  // Grip & Pommel
  ctx.fillRect(-6, 39, 12, 24);
  ctx.beginPath();
  ctx.arc(0, 68, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawShield(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.beginPath();
  ctx.moveTo(-34, -56);
  ctx.lineTo(34, -56);
  ctx.lineTo(34, 10);
  ctx.quadraticCurveTo(34, 48, 0, 66);
  ctx.quadraticCurveTo(-34, 48, -34, 10);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawSpear(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, s: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.scale(s, s);
  // Shaft
  ctx.fillRect(-4, -44, 8, 118);
  // Spearhead leaf
  ctx.beginPath();
  ctx.moveTo(0, -78);
  ctx.lineTo(14, -44);
  ctx.lineTo(0, -36);
  ctx.lineTo(-14, -44);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawBowAndArrow(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  // Curved Bow Arc
  ctx.lineWidth = 11;
  ctx.beginPath();
  ctx.arc(-18, 0, 56, -Math.PI * 0.42, Math.PI * 0.42);
  ctx.stroke();
  // Bowstring
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-4, -53);
  ctx.lineTo(-4, 53);
  ctx.stroke();
  // Arrow Shaft + Tip
  ctx.fillRect(-26, -4, 76, 8);
  ctx.beginPath();
  ctx.moveTo(68, 0);
  ctx.lineTo(44, -14);
  ctx.lineTo(44, 14);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawHorse(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  // Iconic Chess-Knight / Cavalry Horse Head & Neck Silhouette
  ctx.beginPath();
  ctx.moveTo(-34, 56);
  ctx.lineTo(-30, 8);
  ctx.quadraticCurveTo(-28, -36, -4, -54);
  ctx.lineTo(-10, -72); // Ear
  ctx.lineTo(6, -58);
  ctx.quadraticCurveTo(28, -54, 46, -24); // Muzzle top
  ctx.lineTo(38, -8); // Nose
  ctx.lineTo(16, -12); // Jaw
  ctx.quadraticCurveTo(14, 16, 28, 56); // Chest
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawElephant(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.arc(-10, -8, 38, Math.PI, 0);
  ctx.lineTo(36, -10);
  ctx.quadraticCurveTo(56, -6, 54, 24); // Trunk
  ctx.lineTo(42, 24);
  ctx.quadraticCurveTo(42, 6, 28, 6);
  ctx.lineTo(28, 46); // Front leg
  ctx.lineTo(10, 46);
  ctx.lineTo(10, 20);
  ctx.lineTo(-18, 20);
  ctx.lineTo(-18, 46); // Rear leg
  ctx.lineTo(-38, 46);
  ctx.lineTo(-48, -8);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawRifle(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillRect(-4, -72, 8, 110);
  ctx.beginPath();
  ctx.moveTo(-4, 34);
  ctx.lineTo(10, 72);
  ctx.lineTo(-8, 72);
  ctx.lineTo(-8, 34);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawCannon(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.translate(x, y);
  // Barrel
  ctx.save();
  ctx.rotate(-0.28);
  ctx.fillRect(-52, -16, 108, 22);
  ctx.restore();
  // Carriage Wheel
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(-10, 18, 28, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(-10, 18, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawTank(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.translate(x, y);
  // Turret + Gun
  ctx.fillRect(-26, -34, 48, 22);
  ctx.fillRect(20, -27, 52, 9);
  // Hull & Treads
  ctx.beginPath();
  ctx.roundRect(-62, -10, 124, 42, 20);
  ctx.fill();
  ctx.restore();
}

function drawAircraft(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.moveTo(0, -68);
  ctx.lineTo(12, -24);
  ctx.lineTo(74, 14);
  ctx.lineTo(74, 28);
  ctx.lineTo(12, 12);
  ctx.lineTo(10, 48);
  ctx.lineTo(30, 62);
  ctx.lineTo(30, 70);
  ctx.lineTo(0, 62);
  ctx.lineTo(-30, 70);
  ctx.lineTo(-30, 62);
  ctx.lineTo(-10, 48);
  ctx.lineTo(-12, 12);
  ctx.lineTo(-74, 28);
  ctx.lineTo(-74, 14);
  ctx.lineTo(-12, -24);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawCrown(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#FFD166';
  ctx.beginPath();
  ctx.moveTo(-54, 34);
  ctx.lineTo(-64, -26);
  ctx.lineTo(-26, 4);
  ctx.lineTo(0, -42);
  ctx.lineTo(26, 4);
  ctx.lineTo(64, -26);
  ctx.lineTo(54, 34);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function adjustHexBrightness(hex: string, percent: number): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return hex;
  const num = parseInt(clean, 16);
  const amt = Math.round(2.55 * percent);
  const r = Math.min(255, Math.max(0, (num >> 16) + amt));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amt));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amt));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
