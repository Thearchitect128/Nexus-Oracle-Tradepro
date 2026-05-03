# FocusFlow Creative - Modern Pomodoro Timer

A *beautiful*, gamified Pomodoro timer with dynamic themes, ambient soundscapes, and focus cards. This isn't just a timer—it's a flow state machine.

## ✨ Creative Features

### 1. **Dynamic Themes** 🎨
- **Time-based color shifts**: Warm orange at sunrise → cool blue during day → deep purple at evening
- **Streak glow effect**: 2+ day streaks unlock particle gradient backgrounds
- **HSL-driven design**: One `--hue` variable controls the entire color palette
- **Glassmorphism UI**: Backdrop blur + gradient shadows for a premium feel

### 2. **3D Focus Cards** 🃏
- **Flip card interface**: Front shows your task, back shows your breakdown
- **Task persistence**: Your task and notes save to browser storage automatically
- **Bonus XP**: Complete named tasks for +5 XP (vs +10 base)
- **Beautiful animations**: Smooth 3D transitions on flip

### 3. **Ambient Soundscapes** 🎵
All generated in-browser using Web Audio API — no files needed:
- **🌧️ Rain**: Pink noise for focus (scientifically calming)
- **☕ Cafe**: Low-frequency hum with modulation (ambient presence)
- **〰️ Brown Noise**: Deep brown noise for grounding/concentration
- **Volume control**: Auto-optimized at 0.12 gain for long sessions

### 4. **Gamification System** 🏆
- **XP Rewards**: +10 XP per focus session, +5 bonus for named tasks
- **Streak Counter**: Tracks consecutive days of focus sessions
- **Streak Badge**: Appears at 2+ day streaks with glowing animation
- **Session Counter**: Real-time tracking of sessions completed today
- **Persistent Stats**: All stats saved daily (reset at midnight)

### 5. **Motivational Quotes** 💭
- 8 curated focus-friendly quotes
- Rotates on each completed session
- Designed for deep work, not hustle culture

## Core Features

### Timer Modes
- **Focus (25 min)**: Default Pomodoro duration
- **Short Break (5 min)**: Quick reset
- **Long Break (15 min)**: Deep recovery (triggered after 4 sessions)

### Statistics Dashboard
- **Sessions**: Completed focus sessions today
- **Focus Time**: Total accumulated focus time (resets daily)
- **XP**: Lifetime XP points earned

### Keyboard Shortcuts
- `Space` - Start/Pause timer
- `R` - Reset timer  
- `1` - Switch to Focus mode
- `2` - Switch to Short Break
- `3` - Switch to Long Break

## How to Use

### Quickstart Flow
1. **Open** `pomodoro-timer.html` in any modern browser
2. **Type** your task: *"Design landing page hero"* → Press **Enter**
3. **Flip card** to add breakdown: *"1. Sketch 2. Fonts 3. Copy"*
4. **Select sound** 🌧️ Rain for focus ambiance
5. **Start timer** and watch the progress ring animate
6. **Complete session** → earn XP + see new quote + watch stats update

### Daily Reset Behavior
- Session counter resets at midnight
- XP carries over forever
- Streak maintains if you complete at least 1 session per day
- Badges persist as long as streak is active

## Technical Stack

### Architecture
- **Pure HTML/CSS/JavaScript** - No dependencies, no build tools
- **Web Audio API** - Real-time noise generation (pink/brown/cafe)
- **localStorage** - Persistent storage for all stats and tasks
- **CSS Grid + Flexbox** - Responsive layout (desktop/tablet/mobile)
- **CSS Custom Properties** - Dynamic theming system

### Browser Compatibility
- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Data & Privacy

- 🔒 **100% Local**: All data stored in browser's localStorage
- 🌐 **Offline-first**: Works without internet (after load)
- 📊 **No analytics**: Zero tracking, no external calls
- 🗑️ **Clear cache**: Clearing browser data removes all stats

## Storage Keys Used
- `ff_sessions` - Sessions completed today
- `ff_minutes` - Total focus time accumulated
- `ff_xp` - Lifetime XP earned
- `ff_streak` - Current streak count
- `ff_date` - Last active date (for streak logic)
- `ff_task` - Current task name
- `ff_notes` - Current task notes

## Tips for Maximum Flow

1. **Name your tasks** - Unlocks +5 XP bonus, makes sessions more intentional
2. **Use soundscapes** - Pick one ambient track and stick with it (consistency = deeper focus)
3. **Respect breaks** - Don't skip breaks—they're not lost time, they're recovery
4. **Track your streak** - Seeing 3+ days builds momentum for longer streaks
5. **Screenshot milestones** - At 100 XP, 500 XP, 1000 XP—celebrate progress
6. **Customize timings** - Not 25/5? Try 50/10 or 45/15—make it yours

## Perfect For

- 🎨 Designers & creatives needing uninterrupted focus
- 💻 Developers doing deep coding sessions
- 📝 Writers tackling long-form content
- 🎓 Students studying for exams
- 🧠 Anyone building a focus habit

---

**Deep work starts here.** Open the file and begin your first focus session. 🚀

