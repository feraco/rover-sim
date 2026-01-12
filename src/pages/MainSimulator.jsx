import { SimPanel } from '../components/SimPanel';
import { BlocklyPanel } from '../components/BlocklyPanel';
import { PythonPanel } from '../components/PythonPanel';
import { useUIStore } from '../store/uiStore';

function MainSimulator() {
  const { activePanel, setActivePanel } = useUIStore();

  return (
    <div className="mainSimulator">
      <nav className="topNav">
        <div className="navTabs">
          <button
            className={activePanel === 'blocks' ? 'active' : ''}
            onClick={() => setActivePanel('blocks')}
            id="navBlocks">
            Blocks
          </button>
          <button
            className={activePanel === 'sim' ? 'active' : ''}
            onClick={() => setActivePanel('sim')}
            id="navSim">
            Simulator
          </button>
        </div>
        <div className="navActions">
          <button className="fileMenu">File</button>
          <button className="robotMenu">Robot</button>
          <button className="worldsMenu">Worlds</button>
          <button className="helpMenu">Help</button>
        </div>
      </nav>

      <div className="panels">
        {activePanel === 'blocks' && (
          <div className="panel blocklyPanelContainer">
            <div className="leftPanel">
              <BlocklyPanel />
            </div>
            <div className="rightPanel">
              <PythonPanel />
            </div>
          </div>
        )}

        {activePanel === 'sim' && (
          <div className="panel simPanelContainer">
            <div className="leftPanel">
              <SimPanel />
            </div>
            <div className="rightPanel">
              <PythonPanel />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MainSimulator
