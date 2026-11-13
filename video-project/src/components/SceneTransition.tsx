import React from "react";
import {useCurrentFrame} from "remotion";
import {anim, easeInOutCubic, easeOutQuart} from "../lib/anim";

// Consistent scene transitions: content fades in at the start and out at the
// end of its sequence; an optional black overlay fades over everything.
export const SceneTransition: React.FC<{
  readonly children: React.ReactNode;
  readonly durationInFrames: number;
  readonly fadeIn?: number;
  readonly fadeOut?: number;
  readonly blackOut?: {start: number; frames: number};
}> = ({children, durationInFrames, fadeIn = 10, fadeOut = 10, blackOut}) => {
  const frame = useCurrentFrame();
  const inP = anim(frame, [0, fadeIn], [0, 1], easeOutQuart);
  const outP =
    fadeOut > 0
      ? anim(frame, [durationInFrames - fadeOut, durationInFrames], [1, 0], easeInOutCubic)
      : 1;
  const black = blackOut
    ? anim(frame, [blackOut.start, blackOut.start + blackOut.frames], [0, 1], easeInOutCubic)
    : 0;

  return (
    <div style={{position: "absolute", inset: 0}}>
      <div style={{position: "absolute", inset: 0, opacity: Math.min(inP, outP)}}>{children}</div>
      {blackOut ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "#000000",
            opacity: black,
          }}
        />
      ) : null}
    </div>
  );
};
