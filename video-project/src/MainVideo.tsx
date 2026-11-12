import {Audio} from "@remotion/media";
import {
  Sequence,
  staticFile,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {IntroTitle} from "./scenes/IntroTitle";
import {BarChartScene} from "./scenes/BarChartScene";
import {LineChartScene} from "./scenes/LineChartScene";
import {OutroScene} from "./scenes/OutroScene";

export const MainVideo: React.FC = () => {
  const {fps, durationInFrames} = useVideoConfig();
  const frame = useCurrentFrame();

  return (
    <>
      <Sequence name="Intro title" durationInFrames={6 * fps} layout="none">
        <IntroTitle />
      </Sequence>
      <Sequence
        name="Quarterly bar chart"
        from={6 * fps}
        durationInFrames={9 * fps}
        layout="none"
      >
        <BarChartScene />
      </Sequence>
      <Sequence
        name="Growth line chart"
        from={15 * fps}
        durationInFrames={9 * fps}
        layout="none"
      >
        <LineChartScene />
      </Sequence>
      <Sequence
        name="Outro"
        from={24 * fps}
        durationInFrames={6 * fps}
        layout="none"
      >
        <OutroScene />
      </Sequence>
      <Audio
        name="Background music"
        src={staticFile("music.mp3")}
        volume={interpolate(
          frame,
          [0, 1 * fps, durationInFrames - 2 * fps, durationInFrames],
          [0, 0.6, 0.6, 0],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          },
        )}
      />
    </>
  );
};
