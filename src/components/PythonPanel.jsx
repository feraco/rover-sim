import { useEffect, useRef, useState } from 'react';
import { useSimulation } from '../hooks/useSimulation';
import { useBlocklyStore } from '../store/blocklyStore';
import { filesManager } from '../utils/filesManager';
import ace from 'ace-builds';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/mode-c_cpp';
import 'ace-builds/src-noconflict/theme-monokai';

export function PythonPanel() {
  const editorRef = useRef(null);
  const [editor, setEditor] = useState(null);
  const [files, setFiles] = useState({});
  const [currentFile, setCurrentFile] = useState('main.py');
  const { runPython, stop, isRunning, output } = useSimulation();
  const { generatedCode } = useBlocklyStore();

  useEffect(() => {
    if (!editorRef.current) return;

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

    setEditor(aceEditor);

    filesManager.loadLocalStorage();
    setFiles(filesManager.getFiles());
    setCurrentFile(filesManager.getCurrentFilename());
    aceEditor.setValue(filesManager.getCurrentContent(), -1);

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

  return (
    <div className="pythonPanel">
      <div className="pythonControls">
        <div className="filesTabs">
          {Object.keys(files).map((filename) => (
            <button
              key={filename}
              className={currentFile === filename ? 'active' : ''}
              onClick={() => handleFileSelect(filename)}>
              {filename}
            </button>
          ))}
          <button onClick={handleAddFile} className="addFileBtn">
            <span className="icon-newFile"></span>
          </button>
        </div>
        <div className="runControls">
          <button onClick={handleRun} disabled={isRunning} className="btn-play">
            <span className="icon-play"></span> Run
          </button>
          <button onClick={stop} disabled={!isRunning} className="btn-stop">
            <span className="icon-stop"></span> Stop
          </button>
        </div>
      </div>
      <div ref={editorRef} className="aceEditor" style={{ width: '100%', height: '60%' }} />
      <div className="consoleOutput">
        <div className="consoleHeader">Console Output</div>
        <pre className="consoleContent">{output || 'Ready to run...'}</pre>
      </div>
    </div>
  );
}
