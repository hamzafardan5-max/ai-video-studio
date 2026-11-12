import {Easing, Interactive, interpolate, useCurrentFrame} from "remotion";

const DATA = [
  {label: "Q1", value: 32},
  {label: "Q2", value: 48},
  {label: "Q3", value: 61},
  {label: "Q4", value: 87},
];

const CHART_HEIGHT = 520;
const BAR_WIDTH = 170;
const STAGGER = 8;
const GROW_FRAMES = 34;

const Bar: React.FC<{
  readonly label: string;
  readonly value: number;
  readonly index: number;
}> = ({label, value, index}) => {
  const frame = useCurrentFrame();
  const start = 14 + index * STAGGER;
  const isLast = index === DATA.length - 1;

  return (
    <Interactive.Div
      name={`${label} column`}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 20,
        height: "100%",
        justifyContent: "flex-end",
      }}
    >
      <Interactive.Div
        name={`${label} value`}
        style={{
          fontFamily: 'Inter, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
          fontSize: 52,
          fontWeight: 700,
          color: isLast ? "#38bdf8" : "#e2e8f0",
          opacity: interpolate(frame, [start, start + 10], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        {Math.round(
          interpolate(frame, [start, start + GROW_FRAMES], [0, value], {
            easing: Easing.spring({damping: 18, stiffness: 90}),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        )}
      </Interactive.Div>
      <Interactive.Div
        name={`${label} bar`}
        style={{
          width: BAR_WIDTH,
          height: interpolate(
            frame,
            [start, start + GROW_FRAMES],
            [0, (value / 100) * CHART_HEIGHT],
            {
            easing: Easing.spring({damping: 18, stiffness: 90}),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          borderRadius: 14,
          backgroundColor: isLast ? "#38bdf8" : "#1e3a5f",
          boxShadow: isLast ? "0 0 60px rgba(56, 189, 248, 0.45)" : "none",
        }}
      />
      <Interactive.Div
        name={`${label} label`}
        style={{
          fontFamily: 'Inter, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
          fontSize: 40,
          fontWeight: 600,
          color: "#64748b",
          opacity: interpolate(frame, [start, start + 12], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        {label}
      </Interactive.Div>
    </Interactive.Div>
  );
};

export const BarChartScene: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <Interactive.Div
      name="Bar chart scene"
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 40,
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
        Revenue by quarter
      </Interactive.Div>
      <Interactive.Div
        name="Chart area"
        style={{
          position: "relative",
          display: "flex",
          alignItems: "flex-end",
          gap: 80,
          padding: "0 0 0 0",
          height: CHART_HEIGHT + 160,
        }}
      >
        <Interactive.Div
          name="Baseline"
          style={{
            position: "absolute",
            left: -40,
            right: -40,
            bottom: 78,
            height: 2,
            backgroundColor: "#1e293b",
            opacity: interpolate(frame, [4, 16], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        />
        {DATA.map((item, i) => (
          <Bar key={item.label} label={item.label} value={item.value} index={i} />
        ))}
      </Interactive.Div>
    </Interactive.Div>
  );
};
