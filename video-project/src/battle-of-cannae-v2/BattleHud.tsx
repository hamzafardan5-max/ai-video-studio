import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {BATTLE, getArmyStrength} from './battleData';

const GOLD = '#e7c873';
const INK = '#f4eee1';
const MUTED = '#b9b2a4';

/**
 * Documentary HUD for 1080x1920.
 * Safe zone kept at: top >= 150, bottom >= 380, left >= 60, right >= 140.
 */
export const BattleHud: React.FC = () => {
  const frame = useCurrentFrame();

  const rome = getArmyStrength('attacker', frame);
  const carthage = getArmyStrength('defender', frame);
  const total = rome + carthage || 1;
  const romeShare = (rome / total) * 100;
  const carthShare = (carthage / total) * 100;

  const titleOpacity = interpolate(frame, [0, 12, 60, 82], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const titleRise = interpolate(frame, [0, 60], [36, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const badgeOpacity = interpolate(frame, [76, 96], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const outcomeOpacity = interpolate(frame, [828, 852], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const outcomeRise = interpolate(frame, [828, 860], [28, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        pointerEvents: 'none',
        fontFamily: 'Inter, Arial, sans-serif',
        color: INK,
      }}
    >
      {/* cinematic edge falloff (drawn first so it never dims the cards) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(6,8,12,0.55) 0%, rgba(6,8,12,0) 24%, rgba(6,8,12,0) 66%, rgba(6,8,12,0.62) 100%)',
        }}
      />

      {/* ------------------------------------------------ opening title card */}
      <div
        style={{
          position: 'absolute',
          top: 250,
          left: 60,
          right: 140,
          opacity: titleOpacity,
          transform: `translateY(${titleRise}px)`,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: 22,
            letterSpacing: 7,
            color: GOLD,
            fontWeight: 700,
            textTransform: 'uppercase',
          }}
        >
          Second Punic War · 216 BC
        </div>
        <div
          style={{
            fontSize: 138,
            fontWeight: 900,
            letterSpacing: 6,
            lineHeight: 1.02,
            marginTop: 10,
            textShadow: '0 8px 40px rgba(0,0,0,0.55)',
          }}
        >
          CANNAE
        </div>
        <div
          style={{
            width: 210,
            height: 3,
            margin: '26px auto 24px',
            background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
          }}
        />
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 34,
            alignItems: 'flex-start',
          }}
        >
          <FactionCrest
            name="ROME"
            commander="VARRO & PAULLUS"
            strength="86,400"
            color={BATTLE.factions.attacker.color}
            align="right"
          />
          <div
            style={{
              fontSize: 30,
              fontWeight: 800,
              color: MUTED,
              paddingTop: 6,
            }}
          >
            VS
          </div>
          <FactionCrest
            name="CARTHAGE"
            commander="HANNIBAL"
            strength="50,000"
            color={BATTLE.factions.defender.color}
            align="left"
          />
        </div>
      </div>

      {/* ------------------------------------------------------ compact badge */}
      <div
        style={{
          position: 'absolute',
          top: 150,
          left: 60,
          right: 140,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          opacity: badgeOpacity,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '10px 20px',
            borderRadius: 999,
            background: 'rgba(8,10,15,0.62)',
            border: '1px solid rgba(231,200,115,0.35)',
          }}
        >
          <span style={{color: GOLD, fontSize: 20, fontWeight: 800, letterSpacing: 4}}>
            CANNAE
          </span>
          <span style={{color: MUTED, fontSize: 18, letterSpacing: 3}}>216 BC</span>
        </div>
        <div
          style={{
            fontSize: 17,
            letterSpacing: 4,
            color: MUTED,
            fontWeight: 600,
          }}
        >
          APULIA · ITALY
        </div>
      </div>

      {/* ---------------------------------------------------- strength meter */}
      <div
        style={{
          position: 'absolute',
          top: 208,
          left: 60,
          right: 140,
          opacity: badgeOpacity,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 18,
            letterSpacing: 2.5,
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          <span style={{color: '#e79a90'}}>
            ROME · {Math.round(rome * 100)}%
          </span>
          <span style={{color: '#bdb2f2'}}>
            CARTHAGE · {Math.round(carthage * 100)}%
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            height: 11,
            borderRadius: 6,
            overflow: 'hidden',
            background: 'rgba(255,255,255,0.09)',
            border: '1px solid rgba(255,255,255,0.14)',
          }}
        >
          <div
            style={{
              width: `${romeShare}%`,
              background: `linear-gradient(90deg, #8e2c25, ${BATTLE.factions.attacker.color})`,
            }}
          />
          <div
            style={{
              width: `${carthShare}%`,
              background: `linear-gradient(90deg, ${BATTLE.factions.defender.color}, #a99cf0)`,
            }}
          />
        </div>
      </div>

      {/* ------------------------------------------------------ phase captions */}
      {(() => {
        // Render only the active phase so consecutive cards never stack.
        const phase = BATTLE.phases.find(
          (p) =>
            p.startFrame >= 120 &&
            p.endFrame < 900 &&
            frame >= p.startFrame &&
            frame <= p.endFrame,
        );
        if (!phase) return null;

        const fadeIn = interpolate(
          frame,
          [phase.startFrame, phase.startFrame + 14],
          [0, 1],
          {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
        );
        const fadeOut = interpolate(
          frame,
          [phase.endFrame - 12, phase.endFrame],
          [1, 0],
          {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
        );
        const opacity = Math.min(fadeIn, fadeOut);
        const slide = interpolate(
          frame,
          [phase.startFrame, phase.startFrame + 18],
          [26, 0],
          {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
        );
        const accented = phase.startFrame >= 540;

        return (
          <div
            style={{
              position: 'absolute',
              bottom: 400,
              left: 60,
              right: 140,
              opacity,
              transform: `translateX(${slide}px)`,
              borderLeft: `6px solid ${
                accented
                  ? BATTLE.factions.defender.color
                  : BATTLE.factions.attacker.color
              }`,
              padding: '18px 22px 20px',
              background:
                'linear-gradient(90deg, rgba(8,10,15,0.9) 0%, rgba(8,10,15,0.55) 78%, rgba(8,10,15,0) 100%)',
            }}
          >
            <div
              style={{
                fontSize: 34,
                fontWeight: 900,
                letterSpacing: 3,
                lineHeight: 1.1,
              }}
            >
              {phase.title}
            </div>
            <div
              style={{
                fontSize: 25,
                fontWeight: 500,
                color: MUTED,
                marginTop: 8,
                letterSpacing: 0.4,
              }}
            >
              {phase.subtitle}
            </div>
          </div>
        );
      })()}

      {/* --------------------------------------------------------- outcome card */}
      <div
        style={{
          position: 'absolute',
          bottom: 400,
          left: 60,
          right: 140,
          opacity: outcomeOpacity,
          transform: `translateY(${outcomeRise}px)`,
          padding: '26px 26px 24px',
          borderRadius: 4,
          background: 'rgba(8,10,15,0.9)',
          border: `1px solid rgba(231,200,115,0.4)`,
          borderLeft: `8px solid ${GOLD}`,
        }}
      >
        <div
          style={{
            fontSize: 20,
            letterSpacing: 5,
            color: GOLD,
            fontWeight: 800,
          }}
        >
          OUTCOME
        </div>
        <div
          style={{
            fontSize: 52,
            fontWeight: 900,
            letterSpacing: 2,
            marginTop: 6,
          }}
        >
          {BATTLE.outcome.winner} WINS
        </div>
        <div
          style={{
            fontSize: 24,
            lineHeight: 1.42,
            color: '#ddd5c6',
            marginTop: 10,
          }}
        >
          {BATTLE.outcome.summary}
        </div>
        <div
          style={{
            fontSize: 19,
            color: MUTED,
            marginTop: 14,
            letterSpacing: 0.5,
          }}
        >
          {BATTLE.outcome.casualties}
        </div>
      </div>

    </AbsoluteFill>
  );
};

const FactionCrest: React.FC<{
  name: string;
  commander: string;
  strength: string;
  color: string;
  align: 'left' | 'right';
}> = ({name, commander, strength, color, align}) => (
  <div style={{textAlign: align, minWidth: 250}}>
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: align === 'right' ? 'flex-end' : 'flex-start',
        gap: 10,
      }}
    >
      <span
        style={{
          width: 14,
          height: 14,
          borderRadius: 3,
          background: color,
          boxShadow: `0 0 14px ${color}`,
        }}
      />
      <span style={{fontSize: 27, fontWeight: 800, letterSpacing: 3}}>{name}</span>
    </div>
    <div style={{fontSize: 19, color: MUTED, marginTop: 6, letterSpacing: 1.5}}>
      {commander}
    </div>
    <div style={{fontSize: 22, color: GOLD, fontWeight: 700, marginTop: 2}}>
      {strength} men
    </div>
  </div>
);
