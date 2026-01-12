import { useEffect, useState } from 'react';
import { useBlockly } from '../hooks/useBlockly';
import { useBlocklyStore } from '../store/blocklyStore';
import { useUIStore } from '../store/uiStore';
import { loadToolbox, loadArduinoToolbox } from '../utils/configLoader';

export function BlocklyPanel() {
  const [toolbox, setToolbox] = useState(null);
  const [error, setError] = useState(null);
  const { containerRef, blocklyManager, isReady, resize } = useBlockly(toolbox);
  const { generatedCode } = useBlocklyStore();
  const { generator, setGenerator } = useUIStore();

  useEffect(() => {
    console.log('BlocklyPanel mounted, generator:', generator);
    const loadToolboxData = async () => {
      try {
        const toolboxXml = generator === 'arduino'
          ? await loadArduinoToolbox()
          : await loadToolbox();
        if (toolboxXml) {
          setToolbox(toolboxXml);
          console.log('Toolbox loaded successfully for', generator);
        } else {
          console.warn('Toolbox is null');
        }
      } catch (err) {
        console.error('Error loading toolbox:', err);
        setError(err);
      }
    };
    loadToolboxData();
  }, [generator]);

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

  if (error) {
    return (
      <div style={{ padding: '20px', color: '#ff4444' }}>
        <h3>Blockly Load Error</h3>
        <pre style={{ fontSize: '12px' }}>{error.toString()}</pre>
      </div>
    );
  }

  return (
    <div className="blocklyPanel" style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#1e1e1e',
      position: 'relative'
    }}>
      <div className="blocklyControls" style={{
        padding: '10px',
        backgroundColor: '#2d2d2d',
        borderBottom: '1px solid #444',
        display: 'flex',
        gap: '10px'
      }}>
        <div className="generatorToggle" style={{ display: 'flex', gap: '5px' }}>
          <button
            style={{
              padding: '6px 12px',
              backgroundColor: generator === 'python' ? '#0066cc' : '#444',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '4px'
            }}
            onClick={() => handleGeneratorChange('python')}
            id="pythonMode">
            Python
          </button>
          <button
            style={{
              padding: '6px 12px',
              backgroundColor: generator === 'arduino' ? '#0066cc' : '#444',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '4px'
            }}
            onClick={() => handleGeneratorChange('arduino')}
            id="arduinoMode">
            Arduino
          </button>
        </div>
      </div>
      <div
        ref={containerRef}
        className="blocklyDiv"
        style={{ flex: 1, width: '100%', backgroundColor: '#fff' }}
      />
      {!isReady && !error && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#fff',
          fontSize: '16px',
          textAlign: 'center'
        }}>
          <div>Loading Blockly...</div>
        </div>
      )}
    </div>
  );
}
