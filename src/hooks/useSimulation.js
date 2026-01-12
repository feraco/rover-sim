import { useState, useCallback } from 'react';
import { useSimulationStore } from '../store/simulationStore';
import { PythonExecutor } from '../lib/pythonExecutor';
import { Robot } from '../lib/Robot';
import { WorldBase } from '../lib/worlds/WorldBase';

export function useSimulation() {
  const [pythonExecutor] = useState(() => new PythonExecutor());
  const [output, setOutput] = useState('');
  const { scene, isRunning, setRunning, robot, world, setRobot, setWorld } = useSimulationStore();

  const loadRobot = useCallback(async (robotConfig) => {
    if (!scene) return null;

    const newRobot = new Robot();
    newRobot.options = robotConfig;
    await newRobot.load(scene, null, null);
    setRobot(newRobot);
    return newRobot;
  }, [scene, setRobot]);

  const loadWorld = useCallback(async (worldConfig) => {
    if (!scene) return null;

    const newWorld = new WorldBase();
    newWorld.options = worldConfig;
    await newWorld.load(scene);
    setWorld(newWorld);
    return newWorld;
  }, [scene, setWorld]);

  const runPython = useCallback(async (code) => {
    if (!scene || !robot || !world) {
      console.error('Scene, robot, or world not ready');
      return;
    }

    setOutput('');
    setRunning(true);

    pythonExecutor.setOutputCallback((text) => {
      setOutput((prev) => prev + text);
    });

    pythonExecutor.setErrorCallback((error) => {
      setOutput((prev) => prev + '\nError: ' + error);
    });

    try {
      await pythonExecutor.run(code, robot, world);
    } catch (error) {
      console.error('Python execution error:', error);
    } finally {
      setRunning(false);
    }
  }, [scene, robot, world, pythonExecutor, setRunning]);

  const stop = useCallback(() => {
    pythonExecutor.stop();
    if (robot) {
      robot.stopAll();
    }
    setRunning(false);
  }, [pythonExecutor, robot, setRunning]);

  const reset = useCallback(() => {
    stop();
    if (robot) {
      robot.reset();
    }
    if (world) {
      world.reset();
    }
    setOutput('');
  }, [stop, robot, world]);

  return {
    isRunning,
    output,
    loadRobot,
    loadWorld,
    runPython,
    stop,
    reset
  };
}
