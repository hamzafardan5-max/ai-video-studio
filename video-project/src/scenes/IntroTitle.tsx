import {
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
} from "remotion";

const HEADLINE = ["DATA", "TELLS", "A", "STORY"];

export const IntroTitle: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <Interactive.Div
      name="Intro scene"
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
        name="Headline"
        style={{
          display: "flex",
          gap: 32,
          alignItems: "baseline",
        }}
      >
        {HEADLINE.map((word, i) => (
          <Interactive.Div
            key={word}
            name={`Word ${i + 1}`}
            style={{
              fontFamily:
                'Inter, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
              fontSize: 130,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: i === 3 ? "#38bdf8" : "#f8fafc",
              opacity: interpolate(frame, [i * 6, i * 6 + 12], [0, 1], {
                easing: Easing.bezier(0.16, 1, 0.3, 1),
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              translate: interpolate(
                frame,
                [i * 6, i * 6 + 16],
                ["0px 100px", "0px 0px"],
                {
                  easing: Easing.spring({ damping: 15, stiffness: 130 }),
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                },
              ),
            }}
          >
            {word}
          </Interactive.Div>
        ))}
      </Interactive.Div>
      <Interactive.Div
        name="Subtitle"
        style={{
          fontFamily: 'Inter, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
          fontSize: 44,
          fontWeight: 500,
          letterSpacing: "0.18em",
          color: "#94a3b8",
          textTransform: "uppercase",
          opacity: interpolate(frame, [30, 46], [0, 1], {
            easing: Easing.bezier(0.16, 1, 0.3, 1),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(frame, [30, 48], ["0px 40px", "0px 0px"], {
            easing: Easing.spring({ damping: 16, stiffness: 110 }),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        Quarterly report · 2026
      </Interactive.Div>
      <Interactive.Div
        name="Accent bar"
        style={{
          width: 220,
          height: 6,
          borderRadius: 3,
          backgroundColor: "#38bdf8",
          scale: interpolate(frame, [40, 65], [0, 1], {
            output: "perceptual-scale",
            easing: Easing.spring({ damping: 14, stiffness: 100 }),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      />
    </Interactive.Div>
  );
};
