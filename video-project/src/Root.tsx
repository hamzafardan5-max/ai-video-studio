import React from "react";
import {Composition} from "remotion";
import {loadFont} from "@remotion/google-fonts/Inter";
import {GTAOptimization} from "./GTAOptimization";
import {KineticShowcase} from "./kinetic-showcase/KineticShowcase";
import {TOTAL_DURATION} from "./theme";

loadFont("normal", {
  weights: ["400", "600", "700", "800", "900"],
  subsets: ["latin"],
});

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="GTAOptimization"
        component={GTAOptimization}
        durationInFrames={TOTAL_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="KineticShowcase"
        component={KineticShowcase}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
