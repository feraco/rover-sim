import { useEffect, useRef, useState } from 'react';
import { useBlocklyStore } from '../store/blocklyStore';
import { useSimulationStore } from '../store/simulationStore';
import { ArduinoExecutor } from '../lib/arduinoExecutor';

export function ArduinoPanel() {
  const editorRef = useRef(null);
  const [editor, setEditor] = useState(null);
  const [error, setError] = useState(null);
  const [executor] = useState(() => new ArduinoExecutor());
  const { generatedCode } = useBlocklyStore();
  const { robot, isRunning, setRunning } = useSimulationStore();

  useEffect(() => {
    console.log('ArduinoPanel mounted');

    if (!editorRef.current) return;

    const loadAce = async () => {
      try {
        const ace = await import('ace-builds');
        await import('ace-builds/src-noconflict/mode-c_cpp');
        await import('ace-builds/src-noconflict/theme-monokai');
        return ace.default || ace;
      } catch (err) {
        console.error('Failed to load Ace:', err);
        setError(err);
        return null;
      }
    };

    const initEditor = async () => {
      const ace = await loadAce();
      if (!ace || !editorRef.current) return;

      const aceEditor = ace.edit(editorRef.current);
      aceEditor.setTheme('ace/theme/monokai');
      aceEditor.session.setMode('ace/mode/c_cpp');
      aceEditor.setOptions({
        fontSize: '14px',
        showPrintMargin: false,
        readOnly: true
      });

      aceEditor.setValue(generatedCode || '// Arduino code will appear here\n', -1);
      setEditor(aceEditor);

      return () => {
        aceEditor.destroy();
      };
    };

    initEditor();
  }, []);

  useEffect(() => {
    if (editor && generatedCode) {
      editor.setValue(generatedCode, -1);
    }
  }, [generatedCode, editor]);

  useEffect(() => {
    if (robot) {
      executor.setRobot(robot);
    }
  }, [robot, executor]);

  const handleRun = async () => {
    if (!generatedCode || !robot) {
      console.error('No code or robot available');
      return;
    }

    setRunning(true);
    try {
      await executor.executeCode(generatedCode);
    } finally {
      setRunning(false);
    }
  };

  const handleStop = () => {
    executor.stop();
    setRunning(false);
  };

  if (error) {
    return (
      <div style={{ padding: '20px', color: '#ff4444' }}>
        <h3>Editor Load Error</h3>
        <pre style={{ fontSize: '12px' }}>{error.toString()}</pre>
      </div>
    );
  }

  return (
    <div className="arduinoPanel" style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#1e1e1e'
    }}>
      <div className="arduinoControls" style={{
        padding: '10px',
        backgroundColor: '#2d2d2d',
        borderBottom: '1px solid #444',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ color: '#fff', fontWeight: 'bold' }}>Arduino C++ Code</div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleRun}
            disabled={isRunning || !robot}
            style={{
              padding: '8px 16px',
              backgroundColor: isRunning || !robot ? '#666' : '#0a0',
              color: '#fff',
              border: 'none',
              cursor: isRunning || !robot ? 'not-allowed' : 'pointer',
              borderRadius: '4px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
            <span className="icon-play"></span>
            Run
          </button>
          <button
            onClick={handleStop}
            disabled={!isRunning}
            style={{
              padding: '8px 16px',
              backgroundColor: !isRunning ? '#666' : '#c00',
              color: '#fff',
              border: 'none',
              cursor: !isRunning ? 'not-allowed' : 'pointer',
              borderRadius: '4px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
            <span className="icon-stop"></span>
            Stop
          </button>
        </div>
      </div>
      <div ref={editorRef} className="aceEditor" style={{
        width: '100%',
        flex: 1,
        backgroundColor: '#2b2b2b',
        position: 'relative'
      }} />
    </div>
  );
}
