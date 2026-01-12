import { useEffect, useRef, useState } from 'react';
import { BabylonManager } from '../lib/babylonManager';
import { useSimulationStore } from '../store/simulationStore';

export function useBabylon() {
  const canvasRef = useRef(null);
  const [babylonManager, setBabylonManager] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const { setScene, setEngine, setCanvas } = useSimulationStore();

  useEffect(() => {
    console.log('useBabylon: useEffect triggered', { hasCanvas: !!canvasRef.current, hasManager: !!babylonManager });
    if (!canvasRef.current || babylonManager) return;

    console.log('useBabylon: Creating BabylonManager...');
    const manager = new BabylonManager(canvasRef.current);

    const initBabylon = async () => {
      try {
        console.log('useBabylon: Initializing Babylon...');
        const { engine, scene, camera } = await manager.init();
        console.log('useBabylon: Babylon initialized successfully!');
        setBabylonManager(manager);
        setScene(scene);
        setEngine(engine);
        setCanvas(canvasRef.current);
        setIsReady(true);
        console.log('useBabylon: State updated, isReady = true');
      } catch (error) {
        console.error('useBabylon: Failed to initialize Babylon:', error);
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
