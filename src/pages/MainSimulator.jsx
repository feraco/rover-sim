import React, { useState, useEffect } from 'react';
import { SimPanel } from '../components/SimPanel';
import { BlocklyPanel } from '../components/BlocklyPanel';
import { PythonPanel } from '../components/PythonPanel';
import { useUIStore } from '../store/uiStore';

function MainSimulator() {
  const { activePanel, setActivePanel } = useUIStore();
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('MainSimulator mounted');
    console.log('Active panel:', activePanel);
  }, [activePanel]);

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h1>Error loading simulator</h1>
        <pre>{error.toString()}</pre>
      </div>
    );
  }

  return (
    <div className="mainSimulator" style={{
      width: '100%',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#1e1e1e',
      color: '#fff'
    }}>
      <nav className="topNav" style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '10px',
        backgroundColor: '#2d2d2d',
        borderBottom: '1px solid #444'
      }}>
        <div className="navTabs" style={{ display: 'flex', gap: '10px' }}>
          <button
            style={{
              padding: '8px 16px',
              backgroundColor: activePanel === 'blocks' ? '#0066cc' : '#444',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '4px'
            }}
            onClick={() => setActivePanel('blocks')}
            id="navBlocks">
            Blocks
          </button>
          <button
            style={{
              padding: '8px 16px',
              backgroundColor: activePanel === 'sim' ? '#0066cc' : '#444',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '4px'
            }}
            onClick={() => setActivePanel('sim')}
            id="navSim">
            Simulator
          </button>
        </div>
        <div className="navActions" style={{ display: 'flex', gap: '10px' }}>
          <button style={{ padding: '8px 16px', backgroundColor: '#444', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>File</button>
          <button style={{ padding: '8px 16px', backgroundColor: '#444', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>Robot</button>
          <button style={{ padding: '8px 16px', backgroundColor: '#444', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>Worlds</button>
          <button style={{ padding: '8px 16px', backgroundColor: '#444', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>Help</button>
        </div>
      </nav>

      <div className="panels" style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {activePanel === 'blocks' && (
          <div className="panel blocklyPanelContainer" style={{ display: 'flex', width: '100%', height: '100%' }}>
            <div className="leftPanel" style={{ flex: 1, borderRight: '1px solid #444', position: 'relative' }}>
              <ErrorBoundary>
                <BlocklyPanel />
              </ErrorBoundary>
            </div>
            <div className="rightPanel" style={{ flex: 1, position: 'relative' }}>
              <ErrorBoundary>
                <PythonPanel />
              </ErrorBoundary>
            </div>
          </div>
        )}

        {activePanel === 'sim' && (
          <div className="panel simPanelContainer" style={{ display: 'flex', width: '100%', height: '100%' }}>
            <div className="leftPanel" style={{ flex: 1, borderRight: '1px solid #444', position: 'relative' }}>
              <ErrorBoundary>
                <SimPanel />
              </ErrorBoundary>
            </div>
            <div className="rightPanel" style={{ flex: 1, position: 'relative' }}>
              <ErrorBoundary>
                <PythonPanel />
              </ErrorBoundary>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: '#ff4444', backgroundColor: '#2d2d2d' }}>
          <h3>Component Error</h3>
          <pre style={{ fontSize: '12px', overflow: 'auto' }}>{this.state.error?.toString()}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}

export default MainSimulator
