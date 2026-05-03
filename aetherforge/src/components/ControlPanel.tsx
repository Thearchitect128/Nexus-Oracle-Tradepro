import { useState, useEffect, useRef } from 'react';
import { useAetherStore } from '../store';

export default function ControlPanel() {
  const { xp, streak, sessions, minutes, addXP, completeFocusSession, incrementStreak } = useAetherStore();

  // Timer State
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<'focus' | 'short' | 'long'>('focus');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const customTimes = { focus: 25, short: 5, long: 15 };

  const totalTime = customTimes[mode] * 60;

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning]);

  const handleSessionComplete = () => {
    setIsRunning(false);
    completeFocusSession();
    incrementStreak();
    addXP(50, 'lion');

    // Celebration toast simulation
    const notif = document.createElement('div');
    notif.className = "fixed bottom-24 left-1/2 -translate-x-1/2 bg-emerald-500/90 text-white px-6 py-3 rounded-2xl shadow-xl z-50";
    notif.textContent = "🌟 Session Complete! +50 XP";
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 2800);
  };

  const toggleTimer = () => setIsRunning(!isRunning);
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(totalTime);
  };

  const changeMode = (newMode: 'focus' | 'short' | 'long') => {
    setMode(newMode);
    setTimeLeft(customTimes[newMode] * 60);
    setIsRunning(false);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progress = (timeLeft / totalTime) * 100;

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-10">
      <div className="glass rounded-3xl p-6 shadow-2xl border border-white/10">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#61dafb] to-[#a78bfa] bg-clip-text text-transparent">
            AetherForge
          </h1>
          <div className="flex gap-3">
            <div className="text-sm px-3 py-1 bg-white/5 rounded-full">🔥 {streak}</div>
            <div className="text-sm px-3 py-1 bg-white/5 rounded-full">Lv.{Math.floor(xp/180)+1}</div>
          </div>
        </div>

        {/* Timer */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-56 h-56">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 220 220">
              <circle cx="110" cy="110" r="98" fill="none" stroke="#1e2937" strokeWidth="14"/>
              <circle 
                cx="110" cy="110" r="98" 
                fill="none" 
                stroke="#61dafb" 
                strokeWidth="14"
                strokeDasharray={615}
                strokeDashoffset={615 * (1 - progress/100)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-5xl font-mono font-bold tabular-nums">{formatTime(timeLeft)}</div>
              <div className="text-sm uppercase tracking-widest mt-1 text-white/60">
                {mode === 'focus' ? 'DEEP FOCUS' : mode === 'short' ? 'SHORT BREAK' : 'LONG BREAK'}
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            {(['focus','short','long'] as const).map(m => (
              <button
                key={m}
                onClick={() => changeMode(m)}
                className={`px-5 py-2 text-xs font-bold rounded-2xl transition-all ${mode === m ? 'bg-white/10 text-white' : 'text-white/50'}`}
              >
                {m === 'focus' ? 'Focus' : m === 'short' ? 'Short' : 'Long'}
              </button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={toggleTimer}
            className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-[#61dafb] to-[#a78bfa] text-black font-bold text-lg active:scale-95 transition-all"
          >
            {isRunning ? '⏸ Pause' : '▶ Start'}
          </button>
          <button
            onClick={resetTimer}
            className="px-8 py-4 rounded-2xl border border-white/20 hover:bg-white/10 transition-all"
          >
            ↺
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mt-8 text-center text-sm">
          <div>
            <div className="text-[#61dafb] font-mono text-2xl">{xp}</div>
            <div className="text-white/50 text-xs">XP</div>
          </div>
          <div>
            <div className="text-[#61dafb] font-mono text-2xl">{sessions}</div>
            <div className="text-white/50 text-xs">SESSIONS</div>
          </div>
          <div>
            <div className="text-[#61dafb] font-mono text-2xl">{minutes}</div>
            <div className="text-white/50 text-xs">MINUTES</div>
          </div>
        </div>
      </div>
    </div>
  );
}
