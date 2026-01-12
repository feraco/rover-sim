import { useEffect, useRef, useState } from 'react';
import { BlocklyManager } from '../lib/blocklyManager';
import { useBlocklyStore } from '../store/blocklyStore';
import { useUIStore } from '../store/uiStore';

export function useBlockly(toolbox) {
  const containerRef = useRef(null);
  const [blocklyManager, setBlocklyManager] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const { setWorkspace } = useBlocklyStore();
  const { generator } = useUIStore();

  useEffect(() => {
    if (!containerRef.current || !toolbox || blocklyManager) return;

    const manager = new BlocklyManager();

    const initBlockly = async () => {
      try {
        const workspace = await manager.init(containerRef.current, toolbox);
        setBlocklyManager(manager);
        setWorkspace(workspace);
        setIsReady(true);

        workspace.addChangeListener(() => {
          const code = manager.generateCode();
          useBlocklyStore.getState().setGeneratedCode(code);
        });
      } catch (error) {
        console.error('Failed to initialize Blockly:', error);
      }
    };

    initBlockly();

    return () => {
      if (manager) {
        manager.dispose();
      }
    };
  }, [toolbox]);

  useEffect(() => {
    if (blocklyManager) {
      blocklyManager.setGenerator(generator);
    }
  }, [generator, blocklyManager]);

  const generateCode = () => {
    return blocklyManager?.generateCode() || '';
  };

  const resize = () => {
    blocklyManager?.resize();
  };

  return {
    containerRef,
    blocklyManager,
    isReady,
    generateCode,
    resize
  };
}
