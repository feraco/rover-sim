import React, { useState, useEffect } from 'react';
import { SimPanel } from '../components/SimPanel';
import { BlocklyPanel } from '../components/BlocklyPanel';
import { PythonPanel } from '../components/PythonPanel';
import { ArduinoPanel } from '../components/ArduinoPanel';
import { useUIStore } from '../store/uiStore';

function MainSimulator() {
  const { activePanel, setActivePanel, generator } = useUIStore();
  const [error, setError] = useState(null);
  const [showRobotModal, setShowRobotModal] = useState(false);
  const [showWorldsModal, setShowWorldsModal] = useState(false);
  const [showFileMenu, setShowFileMenu] = useState(false);

  useEffect(() => {
    console.log('MainSimulator mounted');
    console.log('Active panel:', activePanel);
  }, [activePanel]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showFileMenu && !e.target.closest('.fileMenuContainer')) {
        setShowFileMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showFileMenu]);

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
            Arduino Blocks
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
            3D Simulator
          </button>
        </div>
        <div className="navActions" style={{ display: 'flex', gap: '10px', position: 'relative' }}>
          <div className="fileMenuContainer">
            <button onClick={() => setShowFileMenu(!showFileMenu)} style={{ padding: '8px 16px', backgroundColor: '#444', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>File</button>
            {showFileMenu && (
              <div style={{
                position: 'absolute',
                top: '40px',
                left: '0',
                backgroundColor: '#2d2d2d',
                border: '1px solid #444',
                borderRadius: '4px',
                padding: '10px',
                minWidth: '150px',
                zIndex: 100
              }}>
                <div style={{ color: '#fff', padding: '8px', cursor: 'pointer', borderRadius: '4px' }}
                     onMouseEnter={(e) => e.target.style.backgroundColor = '#444'}
                     onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                     onClick={() => { alert('New project'); setShowFileMenu(false); }}>
                  New
                </div>
                <div style={{ color: '#fff', padding: '8px', cursor: 'pointer', borderRadius: '4px' }}
                     onMouseEnter={(e) => e.target.style.backgroundColor = '#444'}
                     onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                     onClick={() => { alert('Open project'); setShowFileMenu(false); }}>
                  Open
                </div>
                <div style={{ color: '#fff', padding: '8px', cursor: 'pointer', borderRadius: '4px' }}
                     onMouseEnter={(e) => e.target.style.backgroundColor = '#444'}
                     onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                     onClick={() => { alert('Save project'); setShowFileMenu(false); }}>
                  Save
                </div>
              </div>
            )}
          </div>
          <button onClick={() => setShowRobotModal(true)} style={{ padding: '8px 16px', backgroundColor: '#444', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>Robot</button>
          <button onClick={() => setShowWorldsModal(true)} style={{ padding: '8px 16px', backgroundColor: '#444', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>Worlds</button>
          <button onClick={() => window.open('https://github.com/QuirkyCort/gears', '_blank')} style={{ padding: '8px 16px', backgroundColor: '#444', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>Help</button>
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
                {generator === 'arduino' ? <ArduinoPanel /> : <PythonPanel />}
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
                {generator === 'arduino' ? <ArduinoPanel /> : <PythonPanel />}
              </ErrorBoundary>
            </div>
          </div>
        )}
      </div>

      {showRobotModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setShowRobotModal(false)}>
          <div style={{
            backgroundColor: '#2d2d2d',
            padding: '30px',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, color: '#fff' }}>Select Robot</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px', marginTop: '20px' }}>
              <div style={{
                padding: '15px',
                backgroundColor: '#444',
                borderRadius: '4px',
                textAlign: 'center',
                cursor: 'pointer',
                border: '2px solid #0066cc'
              }}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>🤖</div>
                <div style={{ color: '#fff', fontSize: '14px' }}>Default Robot</div>
                <div style={{ color: '#888', fontSize: '11px', marginTop: '5px' }}>Currently loaded</div>
              </div>
            </div>
            <button
              onClick={() => setShowRobotModal(false)}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                backgroundColor: '#0066cc',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                width: '100%',
                fontWeight: 'bold'
              }}>
              Close
            </button>
          </div>
        </div>
      )}

      {showWorldsModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setShowWorldsModal(false)}>
          <div style={{
            backgroundColor: '#2d2d2d',
            padding: '30px',
            borderRadius: '8px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, color: '#fff' }}>Select World</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px', marginTop: '20px' }}>
              <div style={{
                padding: '15px',
                backgroundColor: '#444',
                borderRadius: '4px',
                textAlign: 'center',
                cursor: 'pointer',
                border: '2px solid #0066cc'
              }}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>🌍</div>
                <div style={{ color: '#fff', fontSize: '14px' }}>Default Arena</div>
                <div style={{ color: '#888', fontSize: '11px', marginTop: '5px' }}>Currently loaded</div>
              </div>
              <div style={{
                padding: '15px',
                backgroundColor: '#444',
                borderRadius: '4px',
                textAlign: 'center',
                cursor: 'pointer'
              }}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>📏</div>
                <div style={{ color: '#fff', fontSize: '14px' }}>Grid World</div>
              </div>
              <div style={{
                padding: '15px',
                backgroundColor: '#444',
                borderRadius: '4px',
                textAlign: 'center',
                cursor: 'pointer'
              }}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔷</div>
                <div style={{ color: '#fff', fontSize: '14px' }}>Maze</div>
              </div>
            </div>
            <button
              onClick={() => setShowWorldsModal(false)}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                backgroundColor: '#0066cc',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                width: '100%',
                fontWeight: 'bold'
              }}>
              Close
            </button>
          </div>
        </div>
      )}

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
