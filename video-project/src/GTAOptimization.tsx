import React from "react";
import {TransitionSeries, linearTiming} from "@remotion/transitions";
import {Audio, staticFile} from "remotion";
import {Captions} from "./components/Captions";
import {punch} from "./components/PunchPresentation";
import {Scene1Memory} from "./scenes/Scene1Memory";
import {Scene2Streaming} from "./scenes/Scene2Streaming";
import {Scene3LOD} from "./scenes/Scene3LOD";
import {Scene4Combined} from "./scenes/Scene4Combined";
import {
  SCENE1_DURATION,
  SCENE2_DURATION,
  SCENE3_DURATION,
  SCENE4_DURATION,
  TRANSITION_FRAMES,
} from "./theme";

// GTA V: how a huge world fit into 512 MB.
// Scene boundaries follow the voiceover (public/script.mp3); the 12-frame
// overlaps between scenes keep the scene starts locked to the narration.
export const GTAOptimization: React.FC = () => {
  return (
    <>
      <TransitionSeries>
        <TransitionSeries.Sequence name="Scene 1 · Memory limitation" durationInFrames={SCENE1_DURATION}>
          <Scene1Memory />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={punch} timing={linearTiming({durationInFrames: TRANSITION_FRAMES})} />
        <TransitionSeries.Sequence name="Scene 2 · Asset streaming" durationInFrames={SCENE2_DURATION}>
          <Scene2Streaming />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={punch} timing={linearTiming({durationInFrames: TRANSITION_FRAMES})} />
        <TransitionSeries.Sequence name="Scene 3 · Level of detail" durationInFrames={SCENE3_DURATION}>
          <Scene3LOD />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={punch} timing={linearTiming({durationInFrames: TRANSITION_FRAMES})} />
        <TransitionSeries.Sequence name="Scene 4 · Combined optimisation" durationInFrames={SCENE4_DURATION}>
          <Scene4Combined />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      {/* Synced 2-3 word captions */}
      <Captions />

      {/* Narration only — no music, no audio effects */}
      <Audio name="Narration" src={staticFile("script.mp3")} />
    </>
  );
};
