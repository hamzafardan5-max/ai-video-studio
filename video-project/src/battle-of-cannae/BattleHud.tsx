import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {BATTLE, DURATION_IN_FRAMES} from './battleData';

/*
 * YouTube Shorts Safe Zone (1080 x 1920):
 *   top >= 150px, bottom >= 380px, right >= 140px, left >= 60px.
 * All HUD content stays strictly inside these margins.
 */

const SAFE = {top: 150, bottom: 380, right: 140, left: 60};

const cardStyle: React.CSSProperties = {
  background: 'rgba(12, 15, 22, 0.82)',
  border: '1px solid rgba(255, 255, 255, 0.14)',
  borderRadius: 20,
};

export const BattleHud: React.FC = () => {
  const frame = useCurrentFrame();

  const titleOpacity = interpolate(frame, [0, 25], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const titleRise = interpolate(frame, [0, 25], [24, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const phase =
    BATTLE.phases.find((p) => frame >= p.startFrame && frame < p.endFrame) ??
    BATTLE.phases[BATTLE.phases.length - 1];
  const phaseIndex = BATTLE.phases.indexOf(phase);
  const phaseOpacity = interpolate(frame, [phase.startFrame, phase.startFrame + 18], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const phaseRise = interpolate(frame, [phase.startFrame, phase.startFrame + 18], [18, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const phaseProgress =
    (frame - phase.startFrame) / Math.max(1, phase.endFrame - phase.startFrame);

  const outcomeOpacity = interpolate(frame, [800, 850], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const outcomeRise = interpolate(frame, [800, 850], [30, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const attacker = BATTLE.factions.attacker;
  const defender = BATTLE.factions.defender;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* ── Title block (inside top safe zone) ─────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          top: SAFE.top,
          left: SAFE.left,
          right: SAFE.right,
          opacity: titleOpacity,
          transform: `translateY(${titleRise}px)`,
        }}
      >
        <div
          style={{
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: 7,
            color: '#e8b34b',
            textTransform: 'uppercase',
          }}
        >
          {BATTLE.date}
        </div>
        <div
          style={{
            fontSize: 66,
            fontWeight: 900,
            color: '#f5f1e6',
            letterSpacing: 1,
            lineHeight: 1.05,
            marginTop: 8,
            textShadow: '0 3px 14px rgba(0,0,0,0.6)',
          }}
        >
          {BATTLE.title.toUpperCase()}
        </div>
        <div
          style={{
            fontSize: 24,
            fontWeight: 600,
            color: 'rgba(245, 241, 230, 0.72)',
            marginTop: 8,
          }}
        >
          {BATTLE.location}
        </div>

        {/* Commander badges */}
        <div style={{display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20}}>
          {[attacker, defender].map((f, i) => (
            <div
              key={f.name}
              style={{
                ...cardStyle,
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '12px 18px',
                width: 'fit-content',
              }}
            >
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 4,
                  background: f.color,
                  boxShadow: `0 0 12px ${f.color}`,
                }}
              />
              <div
                style={{
                  fontSize: 25,
                  fontWeight: 800,
                  color: '#f5f1e6',
                }}
              >
                {f.name}
                <span
                  style={{
                    fontWeight: 600,
                    color: 'rgba(245,241,230,0.65)',
                    marginLeft: 10,
                    fontSize: 22,
                  }}
                >
                  {i === 0 ? attacker.commander : defender.commander}
                </span>
              </div>
              <div
                style={{
                  marginLeft: 6,
                  fontSize: 22,
                  fontWeight: 700,
                  color: '#e8b34b',
                }}
              >
                {f.strength}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tactical phase banner (above bottom safe margin) ────────────── */}
      <div
        style={{
          position: 'absolute',
          left: SAFE.left,
          right: SAFE.right,
          bottom: SAFE.bottom + 30,
          opacity: phaseOpacity,
          transform: `translateY(${phaseRise}px)`,
        }}
      >
        <div style={{...cardStyle, padding: '20px 26px'}}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <div
              style={{
                fontSize: 19,
                fontWeight: 800,
                letterSpacing: 3,
                color: '#10131a',
                background: '#e8b34b',
                borderRadius: 8,
                padding: '5px 12px',
              }}
            >
              PHASE {phaseIndex + 1}
            </div>
            <div
              style={{
                fontSize: 40,
                fontWeight: 900,
                color: '#f5f1e6',
                letterSpacing: 1,
              }}
            >
              {phase.title.toUpperCase()}
            </div>
          </div>
          <div
            style={{
              fontSize: 25,
              fontWeight: 600,
              color: 'rgba(245,241,230,0.75)',
              marginTop: 10,
            }}
          >
            {phase.subtitle}
          </div>
          <div
            style={{
              marginTop: 16,
              height: 6,
              borderRadius: 3,
              background: 'rgba(255,255,255,0.15)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${Math.min(100, phaseProgress * 100)}%`,
                background: 'linear-gradient(90deg, #e8b34b, #ff7847)',
                borderRadius: 3,
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Outcome card (fade-in finale) ───────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          left: SAFE.left,
          right: SAFE.right,
          top: 560,
          display: 'flex',
          justifyContent: 'center',
          opacity: outcomeOpacity,
          transform: `translateY(${outcomeRise}px)`,
        }}
      >
        <div
          style={{
            ...cardStyle,
            width: '100%',
            padding: '30px 34px',
            borderColor: 'rgba(232, 179, 75, 0.55)',
          }}
        >
          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: 5,
              color: '#e8b34b',
              textTransform: 'uppercase',
            }}
          >
            Outcome
          </div>
          <div
            style={{
              fontSize: 50,
              fontWeight: 900,
              color: '#f5f1e6',
              marginTop: 10,
            }}
          >
            {BATTLE.outcome.winner}
          </div>
          <div
            style={{
              fontSize: 25,
              fontWeight: 600,
              color: 'rgba(245,241,230,0.85)',
              marginTop: 14,
              lineHeight: 1.4,
            }}
          >
            {BATTLE.outcome.summary}
          </div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: '#ff9d7e',
              marginTop: 14,
            }}
          >
            {BATTLE.outcome.casualties}
          </div>
        </div>
      </div>

      {/* ── Total progress strip (within left safe margin) ──────────────── */}
      <div
        style={{
          position: 'absolute',
          left: SAFE.left,
          right: SAFE.right,
          bottom: SAFE.bottom + 12,
          height: 3,
          borderRadius: 2,
          background: 'rgba(255,255,255,0.12)',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${(frame / DURATION_IN_FRAMES) * 100}%`,
            background: 'rgba(245,241,230,0.55)',
            borderRadius: 2,
          }}
        />
      </div>
    </div>
  );
};
