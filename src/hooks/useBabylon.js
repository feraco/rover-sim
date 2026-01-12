import { useEffect, useRef, useState } from 'react';
import { BabylonManager } from '../lib/babylonManager';
import { useSimulationStore } from '../store/simulationStore';

export function useBabylon() {
  const canvasRef = useRef(null);
  const [babylonManager, setBabylonManager] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const { setScene, setEngine, setCanvas } = useSimulationStore();

  useEffect(() => {
    if (!canvasRef.current || babylonManager) return;

    const manager = new BabylonManager(canvasRef.current);

    const initBabylon = async () => {
      try {
        const { engine, scene, camera } = await manager.init();
        setBabylonManager(manager);
        setScene(scene);
        setEngine(engine);
        setCanvas(canvasRef.current);
        setIsReady(true);
      } catch (error) {
        console.error('Failed to initialize Babylon:', error);
      }
    };

    initBabylon();

    return () => {
      if (manager) {
        manager.dispose();
      }
    };
  }, []);

  return {
    canvasRef,
    babylonManager,
    isReady
  };
}
