import { useEffect } from 'react';
import { useBabylon } from '../hooks/useBabylon';
import { useSimulation } from '../hooks/useSimulation';
import { useUIStore } from '../store/uiStore';

export function SimPanel() {
  const { canvasRef, babylonManager, isReady } = useBabylon();
  const { isRunning, stop, reset } = useSimulation();
  const { cameraMode, showSensors, showRuler, setCameraMode } = useUIStore();

  useEffect(() => {
    if (babylonManager && isReady) {
      babylonManager.setCameraMode(cameraMode);
    }
  }, [cameraMode, babylonManager, isReady]);

  return (
    <div className="simPanel">
      <div className="simControls">
        <button onClick={reset} disabled={isRunning} className="btn-reset">
          <span className="icon-reset"></span>
        </button>
        <button onClick={stop} disabled={!isRunning} className="btn-stop">
          <span className="icon-stop"></span>
        </button>
        <div className="cameraControls">
          <button
            onClick={() => setCameraMode('follow')}
            className={cameraMode === 'follow' ? 'active' : ''}
            title="Follow Camera">
            <span className="icon-cameraFollow"></span>
          </button>
          <button
            onClick={() => setCameraMode('top')}
            className={cameraMode === 'top' ? 'active' : ''}
            title="Top View">
            <span className="icon-cameraTop"></span>
          </button>
          <button
            onClick={() => setCameraMode('arc')}
            className={cameraMode === 'arc' ? 'active' : ''}
            title="Arc Camera">
            <span className="icon-cameraArc"></span>
          </button>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        className="babylonCanvas"
        style={{ width: '100%', height: '100%' }}
      />
      {!isReady && (
        <div className="loadingOverlay">
          <div className="loadingSpinner">Loading 3D Engine...</div>
        </div>
      )}
    </div>
  );
}
