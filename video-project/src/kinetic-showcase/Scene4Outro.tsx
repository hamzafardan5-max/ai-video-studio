import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {FONT_BODY, FONT_DISPLAY} from "./fonts";
import {KINETIC_COLORS as C, kineticHash} from "./theme";

// Particles that explode outward from the logo impact point.
const ExplosiveParticles: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const local = frame - 10;

  if (local < 0) {
    return null;
  }

  const s = spring({
    frame: local,
    fps,
    config: {damping: 12, stiffness: 90},
  });
  const colors = [C.cyan, C.magenta, C.violet, C.lime, C.white];

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        opacity: interpolate(local, [40, 85], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      }}
    >
      {new Array(26).fill(0).map((_, i) => {
        const angle = kineticHash(i * 13.7) * Math.PI * 2;
        const dist = interpolate(s, [0, 1], [0, 260 + kineticHash(i * 7.3) * 520]);
        const size = 4 + kineticHash(i * 3.1) * 12;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              width: size,
              height: size,
              borderRadius: "50%",
              background: colors[i % colors.length],
              boxShadow: `0 0 16px ${colors[i % colors.length]}`,
              translate: `${Math.cos(angle) * dist}px ${Math.sin(angle) * dist}px`,
              scale: interpolate(s, [0, 1], [1, 0.15]),
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// Expanding neon shockwave rings from the slam moment.
const Shockwave: React.FC = () => {
  const frame = useCurrentFrame();
  const local = frame - 10;

  if (local < 0) {
    return null;
  }

  return [0, 8, 16].map((offset, i) => (
    <div
      key={i}
      style={{
        position: "absolute",
        left: "50%",
        top: "46%",
        width: 500,
        height: 500,
        marginLeft: -250,
        marginTop: -250,
        borderRadius: "50%",
        border: `2px solid ${i === 0 ? C.cyan : i === 1 ? C.magenta : C.violet}`,
        opacity: interpolate(local, [offset, 55], [0.8, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        scale: interpolate(local, [offset, 55], [0.25, 3.6], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      }}
    />
  ));
};

// Glitch ghost layers: RGB split + occasional horizontal slice displacement.
const GlitchLayers: React.FC<{active: boolean; tick: number}> = ({
  active,
  tick,
}) => {
  const rgbOffset = active ? (kineticHash(tick * 7.7) - 0.5) * 36 : 0;
  const sliceOffset = active ? (kineticHash(tick * 3.3) - 0.5) * 90 : 0;
  const sliceTop = 20 + kineticHash(tick * 9.1) * 45;
  const sliceHeight = 8 + kineticHash(tick * 5.9) * 22;

  return (
    <>
      {/* Cyan ghost */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          color: C.cyan,
          translate: `${-rgbOffset}px 0px`,
          mixBlendMode: "screen",
        }}
      >
        KINETIC
      </div>
      {/* Magenta ghost */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          color: C.magenta,
          translate: `${rgbOffset}px 0px`,
          mixBlendMode: "screen",
        }}
      >
        KINETIC
      </div>
      {/* Displaced horizontal slice */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          color: C.white,
          clipPath: `inset(${sliceTop}% 0 ${100 - sliceTop - sliceHeight}% 0)`,
          translate: `${sliceOffset}px 0px`,
          mixBlendMode: "screen",
          textShadow: `0 0 30px rgba(0,240,255,0.9)`,
        }}
      >
        KINETIC
      </div>
    </>
  );
};

const Scene4Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // Logo slam: springs from huge scale down to rest.
  const slam = spring({
    frame,
    fps,
    config: {damping: 10, stiffness: 130, mass: 1.1},
    delay: 10,
  });

  // Glitch bursts are deterministic: active on some 4-frame ticks.
  const tick = Math.floor(frame / 4);
  const active = frame >= 12 && kineticHash(tick) > 0.55;

  const subSpring = spring({
    frame,
    fps,
    config: {damping: 16, stiffness: 100},
    delay: 34,
  });

  const flash = interpolate(frame, [10, 14], [0.85, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const preGlow = interpolate(frame, [0, 10], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitBlack = interpolate(frame, [178, 199], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000",
        backgroundImage: `radial-gradient(45% 30% at 50% 46%, rgba(123,97,255,${0.14 * (1 - preGlow) + 0.02}), transparent 70%)`,
      }}
    >
      {/* Pre-slam convergence glow */}
      <AbsoluteFill
        style={{
          backgroundColor: C.violet,
          opacity: preGlow * 0.25,
          filter: `blur(80px)`,
        }}
      />

      <Shockwave />
      <ExplosiveParticles />

      {/* Logo lockup */}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{marginTop: -120, textAlign: "center"}}>
          <div
            style={{
              position: "relative",
              fontFamily: FONT_DISPLAY,
              fontWeight: 900,
              fontSize: 172,
              lineHeight: 1.1,
              color: C.white,
              textShadow: `0 0 24px rgba(0,240,255,0.65), 0 0 90px rgba(123,97,255,0.5)`,
              scale: interpolate(slam, [0, 1], [3.2, 1]),
              opacity: interpolate(slam, [0, 0.3], [0, 1], {
                extrapolateRight: "clamp",
              }),
            }}
          >
            {frame >= 12 ? (
              <GlitchLayers active={active} tick={tick} />
            ) : null}
            KINETIC
          </div>

          <div
            style={{
              marginTop: 26,
              fontFamily: FONT_BODY,
              fontWeight: 700,
              fontSize: 44,
              letterSpacing: interpolate(subSpring, [0, 1], [60, 26]),
              color: C.cyan,
              opacity: interpolate(subSpring, [0, 1], [0, 1]),
              textShadow: `0 0 22px rgba(0,240,255,0.8)`,
            }}
          >
            STUDIO
          </div>

          <div
            style={{
              marginTop: 46,
              height: 2,
              width: interpolate(subSpring, [0, 1], [0, 560]),
              marginLeft: "auto",
              marginRight: "auto",
              background: `linear-gradient(90deg, transparent, ${C.magenta}, ${C.cyan}, transparent)`,
            }}
          />

          <div
            style={{
              marginTop: 42,
              fontFamily: FONT_BODY,
              fontWeight: 500,
              fontSize: 26,
              letterSpacing: 9,
              color: C.dim,
              opacity: interpolate(frame, [56, 84], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            SHOWCASE REEL — MMXXVI
          </div>
        </div>
      </AbsoluteFill>

      {/* Impact flash */}
      <AbsoluteFill style={{backgroundColor: C.white, opacity: flash}} />
      {/* Final fade out */}
      <AbsoluteFill style={{backgroundColor: "#000", opacity: exitBlack}} />
    </AbsoluteFill>
  );
};

export {Scene4Outro};
