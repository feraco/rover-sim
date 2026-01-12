import { useEffect, useState } from 'react';
import { useBlockly } from '../hooks/useBlockly';
import { useBlocklyStore } from '../store/blocklyStore';
import { useUIStore } from '../store/uiStore';
import { loadToolbox } from '../utils/configLoader';

export function BlocklyPanel() {
  const [toolbox, setToolbox] = useState(null);
  const { containerRef, blocklyManager, isReady, resize } = useBlockly(toolbox);
  const { generatedCode } = useBlocklyStore();
  const { generator, setGenerator } = useUIStore();

  useEffect(() => {
    const loadToolboxData = async () => {
      const toolboxXml = await loadToolbox();
      if (toolboxXml) {
        setToolbox(toolboxXml);
      }
    };
    loadToolboxData();
  }, []);

  useEffect(() => {
    const handleResize = () => resize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [resize]);

  const handleGeneratorChange = (newGenerator) => {
    setGenerator(newGenerator);
    if (blocklyManager) {
      blocklyManager.setGenerator(newGenerator);
    }
  };

  return (
    <div className="blocklyPanel">
      <div className="blocklyControls">
        <div className="generatorToggle">
          <button
            className={generator === 'python' ? 'active' : ''}
            onClick={() => handleGeneratorChange('python')}
            id="pythonMode">
            Python
          </button>
          <button
            className={generator === 'arduino' ? 'active' : ''}
            onClick={() => handleGeneratorChange('arduino')}
            id="arduinoMode">
            Arduino
          </button>
        </div>
      </div>
      <div
        ref={containerRef}
        className="blocklyDiv"
        style={{ width: '100%', height: '100%' }}
      />
      {!isReady && (
        <div className="loadingOverlay">
          <div className="loadingSpinner">Loading Blockly...</div>
        </div>
      )}
    </div>
  );
}
