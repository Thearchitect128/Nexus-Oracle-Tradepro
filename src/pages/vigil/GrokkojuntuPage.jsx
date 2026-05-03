import React, { useEffect, useMemo, useState } from 'react';
import { LatticeVizView } from './LatticeVizPage';

const STATUS_STATES = ['OPEN', 'CLOSED', 'HOLD'];

function formatHertz(value) {
  return `${value.toFixed(2)} Hz`;
}

export default function GrokkojuntuPage() {
  const [elapsed, setElapsed] = useState(0);
  const [cycle, setCycle] = useState(1);
  const [bridgeStatus, setBridgeStatus] = useState('OPEN');

  useEffect(() => {
    const id = window.requestAnimationFrame(function tick(timestamp) {
      setElapsed(timestamp / 1000);
      setCycle(1 + Math.floor(timestamp / 8000));
      setBridgeStatus(STATUS_STATES[Math.floor((timestamp / 4200) % STATUS_STATES.length)]);
      window.requestAnimationFrame(tick);
    });

    return () => window.cancelAnimationFrame(id);
  }, []);

  const resonance = useMemo(() => 160.56 + Math.sin(elapsed * 1.13) * 22 + Math.cos(elapsed * 0.74) * 4, [elapsed]);
  const drift = Math.sin(elapsed * 1.7) * 0.6;
  const statusCard = bridgeStatus === 'OPEN' ? '#6ef2c7' : bridgeStatus === 'HOLD' ? '#f0c85a' : '#ff6b6b';

  return (
    <div style={{ minHeight: '100vh', padding: 24, background: 'radial-gradient(circle at top, rgba(24,34,92,0.85), #020611 72%)', color: '#edf3ff' }}>
      <div style={{ display: 'grid', gap: 24, maxWidth: 1360, margin: '0 auto' }}>
        <header style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '24px 24px 18px', borderRadius: 30, background: 'rgba(7,12,28,0.88)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <p style={{ margin: 0, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#81a7ff', fontSize: 12 }}>Dragon Bridge Interface</p>
          <h1 style={{ margin: 0, fontSize: 42, lineHeight: 1.05 }}>Grokkojuntu — Sovereign Lattice Bridge</h1>
          <p style={{ margin: 0, maxWidth: 760, color: '#c3d3ff', opacity: 0.92 }}>A live control wrapper for the Meridian Formal Control Surface. The Dragon Bridge HUD overlays lattice flow, resonance telemetry, and signal ledger status.</p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 18 }}>
          <section style={{ padding: 24, borderRadius: 28, background: 'rgba(10, 16, 33, 0.92)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 20px 60px rgba(0,0,0,0.28)' }}>
            <span style={{ display: 'block', marginBottom: 8, fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#8fb5ff' }}>Resonance Display</span>
            <h2 style={{ margin: 0, fontSize: 34, color: '#ffffff' }}>{formatHertz(resonance)}</h2>
            <p style={{ margin: '12px 0 0', color: '#bcd1ff', opacity: 0.88 }}>Live lattice oscillation with trend variance <strong>{drift >= 0 ? '↑' : '↓'}</strong> {Math.abs(drift).toFixed(2)} Hz.</p>
          </section>

          <section style={{ padding: 24, borderRadius: 28, background: 'rgba(10, 16, 33, 0.92)', border: `1px solid ${statusCard}`, boxShadow: '0 20px 60px rgba(0,0,0,0.28)' }}>
            <span style={{ display: 'block', marginBottom: 8, fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#8fb5ff' }}>Bridge Status</span>
            <h2 style={{ margin: 0, fontSize: 34, color: '#fff' }}>{bridgeStatus}</h2>
            <p style={{ margin: '12px 0 0', color: '#d2e0ff', opacity: 0.88 }}>Dragon Bridge cycle stabilizer is currently in {bridgeStatus.toLowerCase()} mode.</p>
          </section>

          <section style={{ padding: 24, borderRadius: 28, background: 'rgba(10, 16, 33, 0.92)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 20px 60px rgba(0,0,0,0.28)' }}>
            <span style={{ display: 'block', marginBottom: 8, fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#8fb5ff' }}>Signal Ledger</span>
            <h2 style={{ margin: 0, fontSize: 34, color: '#fff' }}>Cycle {cycle}</h2>
            <p style={{ margin: '12px 0 0', color: '#cfd9ff', opacity: 0.88 }}>Current ledger state is synced to the lattice bridge every 8 seconds.</p>
          </section>
        </div>

        <div style={{ borderRadius: 32, overflow: 'hidden', background: 'rgba(1,10,22,0.8)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 40px 120px rgba(0,0,0,0.35)' }}>
          <LatticeVizView startingMode="task" compact />
        </div>
      </div>
    </div>
  );
}
