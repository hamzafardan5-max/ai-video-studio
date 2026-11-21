import React from "react";
import {Composition} from "remotion";
import {loadFont} from "@remotion/google-fonts/Inter";
import {KineticShowcase} from "./kinetic-showcase/KineticShowcase";
import {ThreeShowcase} from "./three-showcase/ThreeShowcase";
import {BattleOfCannae} from "./battle-of-cannae";
import {BattleOfCannaeV2} from "./battle-of-cannae-v2";
import {BattleOfCannaeV3} from "./battle-of-cannae-v3";

loadFont("normal", {
  weights: ["400", "600", "700", "800", "900"],
  subsets: ["latin"],
});

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="KineticShowcase"
        component={KineticShowcase}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="ThreeShowcase"
        component={ThreeShowcase}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="BattleOfCannae"
        component={BattleOfCannae}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="BattleOfCannaeV2"
        component={BattleOfCannaeV2}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="BattleOfCannaeV3"
        component={BattleOfCannaeV3}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
