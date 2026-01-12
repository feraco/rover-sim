import { create } from 'zustand';

export const useSimulationStore = create((set, get) => ({
  isRunning: false,
  isPaused: false,
  scene: null,
  engine: null,
  canvas: null,
  robot: null,
  world: null,
  mode: 'python',

  setRunning: (isRunning) => set({ isRunning }),
  setPaused: (isPaused) => set({ isPaused }),
  setScene: (scene) => set({ scene }),
  setEngine: (engine) => set({ engine }),
  setCanvas: (canvas) => set({ canvas }),
  setRobot: (robot) => set({ robot }),
  setWorld: (world) => set({ world }),
  setMode: (mode) => set({ mode }),

  startSimulation: () => {
    set({ isRunning: true, isPaused: false });
  },

  stopSimulation: () => {
    set({ isRunning: false, isPaused: false });
  },

  pauseSimulation: () => {
    set({ isPaused: true });
  },

  resumeSimulation: () => {
    set({ isPaused: false });
  },

  reset: () => {
    const { world } = get();
    if (world && world.reset) {
      world.reset();
    }
    set({ isRunning: false, isPaused: false });
  },
}));
