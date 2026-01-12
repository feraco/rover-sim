import { useEffect, useRef, useState } from 'react';
import { useSimulation } from '../hooks/useSimulation';
import { useBlocklyStore } from '../store/blocklyStore';
import { filesManager } from '../utils/filesManager';

export function PythonPanel() {
  const editorRef = useRef(null);
  const [editor, setEditor] = useState(null);
  const [files, setFiles] = useState({});
  const [currentFile, setCurrentFile] = useState('main.py');
  const [error, setError] = useState(null);
  const { runPython, stop, isRunning, output } = useSimulation();
  const { generatedCode } = useBlocklyStore();

  useEffect(() => {
    console.log('PythonPanel mounted');

    filesManager.loadLocalStorage();
    setFiles(filesManager.getFiles());
    setCurrentFile(filesManager.getCurrentFilename());

    if (!editorRef.current) return;

    const loadAce = async () => {
      try {
        const ace = await import('ace-builds');
        await import('ace-builds/src-noconflict/mode-python');
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
      aceEditor.session.setMode('ace/mode/python');
      aceEditor.setOptions({
        fontSize: '14px',
        showPrintMargin: false,
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true
      });

      aceEditor.session.on('change', () => {
        filesManager.updateCurrentFile(aceEditor.getValue());
      });

      aceEditor.setValue(filesManager.getCurrentContent(), -1);
      setEditor(aceEditor);

      filesManager.onFileChange(() => {
        setFiles(filesManager.getFiles());
        setCurrentFile(filesManager.getCurrentFilename());
        aceEditor.setValue(filesManager.getCurrentContent(), -1);
      });

      const interval = setInterval(() => {
        filesManager.saveLocalStorage();
      }, 2000);

      return () => {
        clearInterval(interval);
        aceEditor.destroy();
      };
    };

    initEditor();
  }, []);

  useEffect(() => {
    if (editor && generatedCode) {
      editor.setValue(generatedCode, -1);
      filesManager.updateCurrentFile(generatedCode);
    }
  }, [generatedCode, editor]);

  const handleRun = () => {
    if (editor) {
      const code = editor.getValue();
      runPython(code);
    }
  };

  const handleFileSelect = (filename) => {
    if (editor) {
      filesManager.updateCurrentFile(editor.getValue());
    }
    filesManager.select(filename);
  };

  const handleAddFile = () => {
    const filename = prompt('Enter filename (e.g., module.py):');
    if (filename && filename.endsWith('.py')) {
      filesManager.add(filename, '');
    }
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
    <div className="pythonPanel" style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#1e1e1e'
    }}>
      <div className="pythonControls" style={{
        padding: '10px',
        backgroundColor: '#2d2d2d',
        borderBottom: '1px solid #444',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div className="filesTabs" style={{ display: 'flex', gap: '5px', flex: 1 }}>
          {Object.keys(files).map((filename) => (
            <button
              key={filename}
              style={{
                padding: '6px 12px',
                backgroundColor: currentFile === filename ? '#0066cc' : '#444',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                borderRadius: '4px',
                fontSize: '12px'
              }}
              onClick={() => handleFileSelect(filename)}>
              {filename}
            </button>
          ))}
          <button onClick={handleAddFile} style={{
            padding: '6px 12px',
            backgroundColor: '#444',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '4px'
          }}>
            + New File
          </button>
        </div>
        <div className="runControls" style={{ display: 'flex', gap: '5px' }}>
          <button onClick={handleRun} disabled={isRunning} style={{
            padding: '6px 16px',
            backgroundColor: isRunning ? '#666' : '#0a0',
            color: '#fff',
            border: 'none',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            borderRadius: '4px',
            fontWeight: 'bold'
          }}>
            ▶ Run
          </button>
          <button onClick={stop} disabled={!isRunning} style={{
            padding: '6px 16px',
            backgroundColor: !isRunning ? '#666' : '#c00',
            color: '#fff',
            border: 'none',
            cursor: !isRunning ? 'not-allowed' : 'pointer',
            borderRadius: '4px',
            fontWeight: 'bold'
          }}>
            ■ Stop
          </button>
        </div>
      </div>
      <div ref={editorRef} className="aceEditor" style={{
        width: '100%',
        height: '60%',
        backgroundColor: '#2b2b2b',
        position: 'relative'
      }} />
      <div className="consoleOutput" style={{
        height: '40%',
        backgroundColor: '#1e1e1e',
        borderTop: '1px solid #444',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div className="consoleHeader" style={{
          padding: '8px 10px',
          backgroundColor: '#2d2d2d',
          color: '#fff',
          fontSize: '12px',
          fontWeight: 'bold',
          borderBottom: '1px solid #444'
        }}>Console Output</div>
        <pre className="consoleContent" style={{
          flex: 1,
          padding: '10px',
          margin: 0,
          color: '#0f0',
          fontFamily: 'monospace',
          fontSize: '12px',
          overflow: 'auto',
          whiteSpace: 'pre-wrap'
        }}>{output || 'Ready to run...'}</pre>
      </div>
    </div>
  );
}
