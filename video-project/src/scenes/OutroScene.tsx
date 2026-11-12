import {Easing, Interactive, interpolate, useCurrentFrame} from "remotion";

export const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <Interactive.Div
      name="Outro scene"
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
        name="Big number"
        style={{
          fontFamily: 'Inter, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
          fontSize: 260,
          fontWeight: 800,
          letterSpacing: "-0.03em",
          color: "#38bdf8",
          lineHeight: 1,
          opacity: interpolate(frame, [4, 18], [0, 1], {
            easing: Easing.bezier(0.16, 1, 0.3, 1),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          scale: interpolate(frame, [4, 24], [0.6, 1], {
            output: "perceptual-scale",
            easing: Easing.spring({damping: 13, stiffness: 110}),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        {Math.round(
          interpolate(frame, [4, 40], [0, 87], {
            easing: Easing.spring({damping: 18, stiffness: 80}),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        )}
        %
      </Interactive.Div>
      <Interactive.Div
        name="Caption"
        style={{
          fontFamily: 'Inter, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
          fontSize: 64,
          fontWeight: 600,
          color: "#f8fafc",
          letterSpacing: "-0.01em",
          opacity: interpolate(frame, [26, 42], [0, 1], {
            easing: Easing.bezier(0.16, 1, 0.3, 1),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(frame, [26, 44], ["0px 50px", "0px 0px"], {
            easing: Easing.spring({damping: 15, stiffness: 110}),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        Year-over-year growth
      </Interactive.Div>
      <Interactive.Div
        name="Tagline"
        style={{
          fontFamily: 'Inter, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
          fontSize: 40,
          fontWeight: 500,
          color: "#94a3b8",
          opacity: interpolate(frame, [44, 60], [0, 1], {
            easing: Easing.bezier(0.16, 1, 0.3, 1),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        The story continues · 2027
      </Interactive.Div>
    </Interactive.Div>
  );
};
