import { create } from 'zustand';

export const useUIStore = create((set) => ({
  activePanel: 'blocks',
  projectName: 'Untitled',
  isModified: false,
  generator: 'python',
  selectedRobot: null,
  selectedWorld: null,
  cameraMode: 'follow',
  showSensors: true,
  showRuler: false,

  setActivePanel: (panel) => set({ activePanel: panel }),
  setProjectName: (name) => set({ projectName: name }),
  setModified: (isModified) => set({ isModified }),
  setGenerator: (generator) => set({ generator }),
  setSelectedRobot: (robot) => set({ selectedRobot: robot }),
  setSelectedWorld: (world) => set({ selectedWorld: world }),
  setCameraMode: (mode) => set({ cameraMode: mode }),
  setShowSensors: (show) => set({ showSensors: show }),
  setShowRuler: (show) => set({ showRuler: show }),

  toggleSensors: () => set((state) => ({ showSensors: !state.showSensors })),
  toggleRuler: () => set((state) => ({ showRuler: !state.showRuler })),
}));
