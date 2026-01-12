import { useEffect, useState } from 'react';
import { useBabylon } from '../hooks/useBabylon';
import { useSimulation } from '../hooks/useSimulation';
import { useUIStore } from '../store/uiStore';

export function SimPanel() {
  const { canvasRef, babylonManager, isReady } = useBabylon();
  const { isRunning, stop, reset, loadRobot } = useSimulation();
  const { cameraMode, showSensors, showRuler, setCameraMode } = useUIStore();
  const [robotLoaded, setRobotLoaded] = useState(false);

  console.log('SimPanel render:', { isReady, hasManager: !!babylonManager, isRunning });

  useEffect(() => {
    console.log('SimPanel mounted');
    if (babylonManager && isReady && !robotLoaded) {
      console.log('Loading default robot...');
      const defaultRobotConfig = {
        bodyHeight: 12,
        bodyWidth: 14,
        bodyLength: 18,
        wheelDiameter: 5.6,
        wheelWidth: 0.8,
        bodyEdgeToWheelCenterY: 1,
        bodyEdgeToWheelCenterZ: 2,
        bodyMass: 1000,
        wheelMass: 200,
        casterMass: 200,
        wheelToBodyOffset: 0.2,
        bodyFriction: 0,
        wheelFriction: 10,
        casterFriction: 0.1,
        wheelMaxAcceleration: 3000,
        wheelStopActionHoldForce: 2000,
        wheelTireDownwardsForce: 1000,
        color: '#f09c0d',
        caster: true,
        wheels: true
      };

      loadRobot(defaultRobotConfig).then(() => {
        console.log('Default robot loaded successfully');
        setRobotLoaded(true);
      }).catch(err => {
        console.error('Failed to load robot:', err);
      });
    }
  }, [babylonManager, isReady, loadRobot, robotLoaded]);

  useEffect(() => {
    if (babylonManager && isReady) {
      babylonManager.setCameraMode(cameraMode);
    }
  }, [cameraMode, babylonManager, isReady]);

  return (
    <div className="simPanel" style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#1e1e1e',
      position: 'relative'
    }}>
      <div className="simControls" style={{
        padding: '10px',
        backgroundColor: '#2d2d2d',
        borderBottom: '1px solid #444',
        display: 'flex',
        gap: '10px',
        alignItems: 'center'
      }}>
        <button onClick={reset} disabled={isRunning} style={{
          padding: '6px 12px',
          backgroundColor: isRunning ? '#666' : '#f80',
          color: '#fff',
          border: 'none',
          cursor: isRunning ? 'not-allowed' : 'pointer',
          borderRadius: '4px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span className="icon-reset" style={{ fontSize: '16px' }}></span>
          Reset
        </button>
        <button onClick={stop} disabled={!isRunning} style={{
          padding: '6px 12px',
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
          <span className="icon-stop" style={{ fontSize: '16px' }}></span>
          Stop
        </button>
        <div className="cameraControls" style={{ display: 'flex', gap: '5px', marginLeft: 'auto' }}>
          <button
            onClick={() => setCameraMode('follow')}
            style={{
              padding: '6px 12px',
              backgroundColor: cameraMode === 'follow' ? '#0066cc' : '#444',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '4px'
            }}
            title="Follow Camera">
            Follow
          </button>
          <button
            onClick={() => setCameraMode('top')}
            style={{
              padding: '6px 12px',
              backgroundColor: cameraMode === 'top' ? '#0066cc' : '#444',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '4px'
            }}
            title="Top View">
            Top
          </button>
          <button
            onClick={() => setCameraMode('arc')}
            style={{
              padding: '6px 12px',
              backgroundColor: cameraMode === 'arc' ? '#0066cc' : '#444',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '4px'
            }}
            title="Arc Camera">
            Arc
          </button>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        className="babylonCanvas"
        style={{
          flex: 1,
          width: '100%',
          backgroundColor: '#999'
        }}
      />
      {!isReady && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#fff',
          fontSize: '16px',
          textAlign: 'center'
        }}>
          <div>Loading 3D Engine...</div>
        </div>
      )}
    </div>
  );
}
