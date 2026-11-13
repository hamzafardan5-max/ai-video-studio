import {Easing} from "remotion";
import {COLORS} from "../theme";
import type {TransitionPresentationComponentProps} from "@remotion/transitions";

// Custom scene transition: the entering scene scales up and rises into
// place while the exiting scene pushes away and fades. Used between all
// scenes so every cut has directional motion.
export const PunchPresentation = ({
  children,
  presentationProgress,
  presentationDirection,
}: TransitionPresentationComponentProps<Record<string, never>>) => {
  const entering = presentationDirection === "entering";
  const p = Math.max(0, Math.min(1, presentationProgress));
  const e = Easing.out(Easing.cubic)(p);

  const opacity = entering ? e : 1 - p * p;
  const scale = entering ? 0.985 + 0.015 * e : 1 + 0.06 * p;
  const translateY = entering ? (1 - e) * 70 : -p * 55;

  return (
    <div style={{position: "absolute", inset: 0, overflow: "hidden", backgroundColor: COLORS.background}}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity,
          transform: `scale(${scale}) translateY(${translateY}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export const punch = {component: PunchPresentation, props: {}};
