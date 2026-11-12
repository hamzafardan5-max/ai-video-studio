import {Easing, Interactive, interpolate, useCurrentFrame} from "remotion";

const DATA = [12, 18, 15, 22, 28, 26, 34, 41, 38, 47, 55, 68];

const WIDTH = 1100;
const HEIGHT = 430;
const PAD_X = 40;
const PAD_TOP = 60;
const PAD_BOTTOM = 60;

const MAX = Math.max(...DATA);
const MIN = Math.min(...DATA);

const pointX = (i: number) => PAD_X + (i * (WIDTH - 2 * PAD_X)) / (DATA.length - 1);
const pointY = (v: number) =>
  HEIGHT - PAD_BOTTOM - ((v - MIN) / (MAX - MIN)) * (HEIGHT - PAD_TOP - PAD_BOTTOM);

const toPath = (values: number[]) =>
  values.map((v, i) => `${i === 0 ? "M" : "L"} ${pointX(i)} ${pointY(v)}`).join(" ");

const LINE_PATH = toPath(DATA);
const AREA_PATH = `${LINE_PATH} L ${pointX(DATA.length - 1)} ${HEIGHT - PAD_BOTTOM} L ${PAD_X} ${HEIGHT - PAD_BOTTOM} Z`;

const DASH_LENGTH = 3600;

const Dot: React.FC<{readonly index: number}> = ({index}) => {
  const frame = useCurrentFrame();
  const start = 10 + index * 8;
  const isLast = index === DATA.length - 1;

  return (
    <Interactive.Div
      name={`Data point ${index + 1}`}
      style={{
        position: "absolute",
        left: pointX(index),
        top: pointY(DATA[index]),
        translate: "-50% -50%",
        width: isLast ? 26 : 16,
        height: isLast ? 26 : 16,
        borderRadius: "50%",
        backgroundColor: isLast ? "#38bdf8" : "#7dd3fc",
        scale: interpolate(frame, [start, start + 10], [0, 1], {
          output: "perceptual-scale",
          easing: Easing.spring({damping: 13, stiffness: 140}),
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        opacity: interpolate(frame, [start, start + 8], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        boxShadow: isLast ? "0 0 40px rgba(56, 189, 248, 0.8)" : "none",
      }}
    />
  );
};

export const LineChartScene: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <Interactive.Div
      name="Line chart scene"
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 48,
        backgroundColor: "#07090f",
      }}
    >
      <Interactive.Div
        name="Chart title"
        style={{
          fontFamily: 'Inter, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
          fontSize: 84,
          fontWeight: 700,
          color: "#f8fafc",
          letterSpacing: "-0.01em",
          opacity: interpolate(frame, [0, 14], [0, 1], {
            easing: Easing.bezier(0.16, 1, 0.3, 1),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(frame, [0, 16], ["0px 60px", "0px 0px"], {
            easing: Easing.spring({damping: 15, stiffness: 120}),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        User growth
      </Interactive.Div>
      <Interactive.Div
        name="Chart canvas"
        style={{
          position: "relative",
          width: WIDTH,
          height: HEIGHT,
          opacity: interpolate(frame, [0, 12], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
          <Interactive.Path
            name="Area fill"
            d={AREA_PATH}
            fill="rgba(56, 189, 248, 0.12)"
            style={{
              opacity: interpolate(frame, [55, 80], [0, 1], {
                easing: Easing.bezier(0.16, 1, 0.3, 1),
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          />
          <Interactive.Path
            name="Growth line"
            d={LINE_PATH}
            fill="none"
            stroke="#38bdf8"
            strokeWidth={7}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              strokeDasharray: DASH_LENGTH,
              strokeDashoffset: interpolate(frame, [12, 78], [DASH_LENGTH, 0], {
                easing: Easing.bezier(0.5, 0, 0.2, 1),
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          />
        </svg>
        {DATA.map((_, i) => (
          <Dot key={i} index={i} />
        ))}
      </Interactive.Div>
      <Interactive.Div
        name="Growth badge"
        style={{
          fontFamily: 'Inter, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
          fontSize: 56,
          fontWeight: 800,
          color: "#0f172a",
          backgroundColor: "#38bdf8",
          padding: "18px 44px",
          borderRadius: 999,
          opacity: interpolate(frame, [86, 100], [0, 1], {
            easing: Easing.bezier(0.16, 1, 0.3, 1),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          scale: interpolate(frame, [86, 102], [0, 1], {
            output: "perceptual-scale",
            easing: Easing.spring({damping: 12, stiffness: 130}),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        +68K users in 12 months
      </Interactive.Div>
    </Interactive.Div>
  );
};
