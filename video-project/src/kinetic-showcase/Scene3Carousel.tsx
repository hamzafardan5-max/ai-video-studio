import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {FONT_BODY, FONT_DISPLAY} from "./fonts";
import {KINETIC_COLORS as C, kineticHash} from "./theme";

const CARD_COUNT = 6;
const CARD_ANGLE = 360 / CARD_COUNT;
const RADIUS = 820;

const CARDS = [
  {label: "DESIGN", glyph: "◇", accent: C.cyan},
  {label: "MOTION", glyph: "◈", accent: C.magenta},
  {label: "RENDER", glyph: "▣", accent: C.lime},
  {label: "DEPLOY", glyph: "⬡", accent: C.violet},
  {label: "SCALE", glyph: "△", accent: C.amber},
  {label: "SHIP", glyph: "◉", accent: C.cyan},
];

// Radial particle burst, staggered per burst index.
const ParticleBurst: React.FC<{
  burstFrame: number;
  seed: number;
  centerX: number;
  centerY: number;
}> = ({burstFrame, seed, centerX, centerY}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const local = frame - burstFrame;

  if (local < 0) {
    return null;
  }

  const s = spring({
    frame: local,
    fps,
    config: {damping: 13, stiffness: 120},
  });

  const colors = [C.cyan, C.magenta, C.violet, C.lime];

  return (
    <div
      style={{
        position: "absolute",
        left: centerX,
        top: centerY,
        opacity: interpolate(local, [26, 55], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      }}
    >
      {new Array(14).fill(0).map((_, i) => {
        const angle = kineticHash(seed * 31 + i * 7) * Math.PI * 2;
        const dist = interpolate(
          s,
          [0, 1],
          [0, 110 + kineticHash(seed * 17 + i) * 220],
        );
        const size = 5 + kineticHash(seed * 13 + i * 3) * 9;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              width: size,
              height: size,
              borderRadius: "50%",
              background: colors[i % colors.length],
              boxShadow: `0 0 14px ${colors[i % colors.length]}`,
              translate: `${Math.cos(angle) * dist}px ${Math.sin(angle) * dist}px`,
              scale: interpolate(s, [0, 1], [1, 0.2]),
            }}
          />
        );
      })}
    </div>
  );
};

const Scene3Carousel: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // Slow, continuous carousel rotation across the scene.
  const rotation = interpolate(frame, [0, 229], [10, -160], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.bezier(0.5, 0, 0.3, 1)),
  });

  const titleSpring = spring({
    frame,
    fps,
    config: {damping: 15, stiffness: 110},
    delay: 4,
  });

  const entry = interpolate(frame, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitBlack = interpolate(frame, [208, 229], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: C.bg,
        backgroundImage: `radial-gradient(50% 35% at 50% 52%, rgba(123,97,255,0.18), transparent 72%), radial-gradient(45% 25% at 50% 15%, rgba(255,43,214,0.1), transparent 70%)`,
      }}
    >
      <AbsoluteFill style={{opacity: entry}}>
        {/* Header */}
        <div style={{position: "absolute", top: 130, left: 0, right: 0}}>
          <div
            style={{
              fontFamily: FONT_BODY,
              fontWeight: 700,
              fontSize: 26,
              letterSpacing: 8,
              color: C.violet,
              textAlign: "center",
            }}
          >
            DECK // 03
          </div>
          <div
            style={{
              marginTop: 14,
              fontFamily: FONT_DISPLAY,
              fontWeight: 800,
              fontSize: 76,
              color: C.white,
              textAlign: "center",
              textShadow: `0 0 30px rgba(123,97,255,0.6)`,
              opacity: interpolate(titleSpring, [0, 1], [0, 1]),
              translate: `0px ${interpolate(titleSpring, [0, 1], [60, 0])}px`,
            }}
          >
            FEATURE DECK
          </div>
        </div>

        {/* 3D carousel stage */}
        <div
          style={{
            position: "absolute",
            top: 400,
            left: 0,
            right: 0,
            height: 1000,
            perspective: 1300,
            perspectiveOrigin: "50% 42%",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: 380,
              transformStyle: "preserve-3d",
              transform: `translateZ(${-RADIUS}px)`,
            }}
          >
            {new Array(CARD_COUNT).fill(0).map((_, i) => {
              const card = CARDS[i];
              const angle = i * CARD_ANGLE + rotation;
              const rad = (angle * Math.PI) / 180;
              const facing = Math.cos(rad);

              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: -270,
                    top: -400,
                    width: 540,
                    height: 760,
                    borderRadius: 30,
                    transformStyle: "preserve-3d",
                    transform: `rotateY(${angle}deg) translateZ(${RADIUS}px)`,
                    background: `linear-gradient(165deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02)), ${C.bgLift}`,
                    border: `1.5px solid ${card.accent}66`,
                    boxShadow: `0 40px 80px rgba(0,0,0,0.55), 0 0 50px ${card.accent}22, inset 0 1px 0 rgba(255,255,255,0.2)`,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    padding: 46,
                    opacity: interpolate(facing, [-1, 0.2], [0.12, 1], {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                    }),
                    filter: `brightness(${interpolate(facing, [-1, 1], [0.35, 1.05], {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                    })})`,
                  }}
                >
                  <div
                    style={{
                      fontFamily: FONT_DISPLAY,
                      fontWeight: 900,
                      fontSize: 200,
                      lineHeight: 1,
                      color: "transparent",
                      WebkitTextStroke: `2px ${card.accent}aa`,
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </div>

                  <div>
                    <div
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: 16,
                        background: `${card.accent}22`,
                        border: `1.5px solid ${card.accent}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 34,
                        color: card.accent,
                        marginBottom: 30,
                      }}
                    >
                      {card.glyph}
                    </div>
                    <div
                      style={{
                        fontFamily: FONT_DISPLAY,
                        fontWeight: 800,
                        fontSize: 64,
                        letterSpacing: 4,
                        color: C.white,
                      }}
                    >
                      {card.label}
                    </div>
                    <div
                      style={{
                        marginTop: 12,
                        fontFamily: FONT_BODY,
                        fontWeight: 500,
                        fontSize: 24,
                        letterSpacing: 3,
                        color: C.dim,
                      }}
                    >
                      MODULE {String(i + 1).padStart(2, "0")} / ACTIVE
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Staggered particle bursts around the stage */}
        <ParticleBurst burstFrame={26} seed={1} centerX={210} centerY={480} />
        <ParticleBurst burstFrame={62} seed={2} centerX={880} centerY={700} />
        <ParticleBurst burstFrame={98} seed={3} centerX={330} centerY={980} />
        <ParticleBurst burstFrame={134} seed={4} centerX={760} centerY={420} />
        <ParticleBurst burstFrame={168} seed={5} centerX={540} centerY={1080} />
      </AbsoluteFill>

      {/* Exit to black */}
      <AbsoluteFill style={{backgroundColor: "#000", opacity: exitBlack}} />
    </AbsoluteFill>
  );
};

export {Scene3Carousel};
