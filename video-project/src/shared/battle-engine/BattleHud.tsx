import React from 'react';
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { calculateArmyStrengthAtFrame, HistoricalBattleData } from './battleData';

export const BattleHud: React.FC<{ battle: HistoricalBattleData }> = ({ battle }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const attStr = calculateArmyStrengthAtFrame(battle.units, 'attacker', frame);
  const defStr = calculateArmyStrengthAtFrame(battle.units, 'defender', frame);
  const attPct = (attStr / Math.max(0.01, attStr + defStr)) * 100;

  const uRange = new Array<number>(0, 1);
  const dock = interpolate(frame, new Array<number>(50, 75), uRange, {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const introOp = interpolate(frame, new Array<number>(0, 15), uRange, { extrapolateRight: 'clamp' });

  const phase = battle.phases.find((p) => frame >= p.startFrame && frame <= p.endFrame);
  const outStart = Math.round(durationInFrames * 0.86);
  const outSpring = spring({ fps, frame: Math.max(0, frame - outStart), config: { damping: 14, stiffness: 120 } });
  const showOut = frame >= outStart;

  const phaseOp = phase
    ? interpolate(
        frame,
        new Array<number>(phase.startFrame, phase.startFrame + 10, phase.endFrame - 10, phase.endFrame),
        new Array<number>(0, 1, 1, 0),
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      )
    : 0;

  const card: React.CSSProperties = {
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: '10px 14px',
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#F8FAFC',
        background: 'radial-gradient(circle, rgba(0,0,0,0) 58%, rgba(8,10,15,0.58) 100%)',
      }}
    >
      <div style={{ position: 'absolute', top: 155, bottom: 390, left: 60, right: 140, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: interpolate(dock, uRange, new Array<number>(0.35, 1)) }}>
            <div>
              <div style={{ fontSize: 21, fontWeight: 800, textTransform: 'uppercase' }}>{battle.title}</div>
              <div style={{ fontSize: 13, color: '#94A3B8', fontWeight: 600 }}>{battle.date} • {battle.location}</div>
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999, backgroundColor: 'rgba(255,209,102,0.16)', color: '#FFD166', border: '1px solid rgba(255,209,102,0.35)', textTransform: 'uppercase' }}>
              {battle.era}
            </div>
          </div>

          <div style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 700, marginBottom: 6 }}>
              <span style={{ color: battle.factions.attacker.color }}>{battle.factions.attacker.name} ({battle.factions.attacker.commander})</span>
              <span style={{ color: battle.factions.defender.color }}>({battle.factions.defender.commander}) {battle.factions.defender.name}</span>
            </div>
            <div style={{ width: '100%', height: 9, borderRadius: 999, backgroundColor: '#1E293B', overflow: 'hidden', display: 'flex' }}>
              <div style={{ width: `${attPct}%`, height: '100%', backgroundColor: battle.factions.attacker.color }} />
              <div style={{ width: `${100 - attPct}%`, height: '100%', backgroundColor: battle.factions.defender.color }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#CBD5E1', marginTop: 4 }}>
              <span>Est. {battle.factions.attacker.strength}</span>
              <span>Est. {battle.factions.defender.strength}</span>
            </div>
          </div>
        </div>

        {dock < 1 && (
          <div style={{ alignSelf: 'center', textAlign: 'center', backgroundColor: 'rgba(10,14,24,0.9)', border: '1px solid rgba(255,209,102,0.4)', borderRadius: 16, padding: '22px 28px', opacity: introOp * (1 - dock), transform: `scale(${interpolate(dock, uRange, new Array<number>(1, 0.92))})` }}>
            <div style={{ fontSize: 14, letterSpacing: 3, color: '#FFD166', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>{battle.date}</div>
            <div style={{ fontSize: 38, fontWeight: 900, lineHeight: 1.1, textTransform: 'uppercase', marginBottom: 8 }}>{battle.title}</div>
            <div style={{ fontSize: 17, color: '#CBD5E1', fontWeight: 600 }}>{battle.factions.attacker.commander} vs. {battle.factions.defender.commander}</div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {showOut ? (
            <div style={{ ...card, backgroundColor: 'rgba(15,23,42,0.95)', border: '2px solid #FFD166', padding: '16px 18px', transform: `translateY(${interpolate(outSpring, uRange, new Array<number>(28, 0))}px)`, opacity: outSpring }}>
              <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1.5, color: '#FFD166', textTransform: 'uppercase' }}>Decisive Outcome • {battle.outcome.winner}</div>
              <div style={{ fontSize: 20, fontWeight: 800, marginTop: 4, lineHeight: 1.25 }}>{battle.outcome.summary}</div>
              <div style={{ fontSize: 13, color: '#CBD5E1', marginTop: 6 }}>Casualties: {battle.outcome.casualties}</div>
            </div>
          ) : (
            phase && (
              <div style={{ ...card, borderLeft: '5px solid #FFD166', opacity: phaseOp }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#FFD166', textTransform: 'uppercase', letterSpacing: 1 }}>{phase.title}</div>
                <div style={{ fontSize: 19, fontWeight: 700, marginTop: 4, lineHeight: 1.3 }}>{phase.subtitle}</div>
              </div>
            )
          )}
          {battle.historicalSources?.length > 0 && (
            <div style={{ alignSelf: 'flex-start', fontSize: 11, color: '#94A3B8', backgroundColor: 'rgba(15,23,42,0.72)', padding: '4px 10px', borderRadius: 6 }}>
              Sources: {battle.historicalSources.slice(0, 3).join(' • ')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
