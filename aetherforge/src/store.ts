import { create } from 'zustand';

export type Archetype = 'lion' | 'dragon' | 'butterfly' | 'phoenix' | 'raven' | 'rabbit' | 'om' | 'mirror';

interface AetherState {
  xp: number;
  auraLevel: number;
  streak: number;
  sessions: number;
  minutes: number;
  activeArchetype: Archetype | null;
  archetypeEnergies: Record<Archetype, number>;

  addXP: (amount: number, archetype?: Archetype) => void;
  setActiveArchetype: (arch: Archetype | null) => void;
  completeFocusSession: () => void;
  incrementStreak: () => void;
}

export const useAetherStore = create<AetherState>((set, get) => ({
  xp: 1240,
  auraLevel: 7,
  streak: 12,
  sessions: 87,
  minutes: 1240,
  activeArchetype: null,
  archetypeEnergies: {
    lion: 85, dragon: 92, butterfly: 67, phoenix: 78,
    raven: 55, rabbit: 40, om: 71, mirror: 63
  },

  addXP: (amount, archetype) => set((state) => {
    const newXP = state.xp + amount;
    const newAura = 1 + Math.floor(newXP / 180);
    const energies = { ...state.archetypeEnergies };
    if (archetype) {
      energies[archetype] = Math.min(100, energies[archetype] + Math.floor(amount * 0.7));
    }
    return {
      xp: newXP,
      auraLevel: newAura,
      archetypeEnergies: energies
    };
  }),

  setActiveArchetype: (arch) => set({ activeArchetype: arch }),

  completeFocusSession: () => set((state) => {
    get().addXP(50, 'lion');
    return {
      sessions: state.sessions + 1,
      minutes: state.minutes + 25,
    };
  }),

  incrementStreak: () => set((state) => ({ streak: state.streak + 1 })),
}));
