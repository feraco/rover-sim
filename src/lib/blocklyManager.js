import * as Blockly from 'blockly';

export class BlocklyManager {
  constructor() {
    this.workspace = null;
    this.generator = 'python';
    this.toolbox = null;
  }

  async init(container, toolbox) {
    this.toolbox = toolbox;

    this.workspace = Blockly.inject(container, {
      toolbox: toolbox,
      scrollbars: true,
      trashcan: true,
      zoom: {
        controls: true,
        wheel: true,
        startScale: 1.0,
        maxScale: 3,
        minScale: 0.3,
        scaleSpeed: 1.2
      },
      grid: {
        spacing: 20,
        length: 3,
        colour: '#ccc',
        snap: true
      }
    });

    await this.loadGenerators();

    return this.workspace;
  }

  async loadGenerators() {
  }

  setGenerator(generator) {
    this.generator = generator;
  }

  generateCode() {
    if (!this.workspace) {
      return '';
    }

    try {
      if (this.generator === 'python') {
        return Blockly.Python.workspaceToCode(this.workspace);
      } else if (this.generator === 'arduino') {
        return this.generateArduinoCode();
      }
    } catch (error) {
      console.error('Error generating code:', error);
      return '';
    }
  }

  generateArduinoCode() {
    return '';
  }

  loadBlocks(xml) {
    if (!this.workspace) {
      return;
    }

    try {
      this.workspace.clear();
      const dom = Blockly.utils.xml.textToDom(xml);
      Blockly.Xml.domToWorkspace(dom, this.workspace);
    } catch (error) {
      console.error('Error loading blocks:', error);
    }
  }

  saveBlocks() {
    if (!this.workspace) {
      return '';
    }

    const dom = Blockly.Xml.workspaceToDom(this.workspace);
    return Blockly.Xml.domToPrettyText(dom);
  }

  clearWorkspace() {
    if (this.workspace) {
      this.workspace.clear();
    }
  }

  dispose() {
    if (this.workspace) {
      this.workspace.dispose();
      this.workspace = null;
    }
  }

  resize() {
    if (this.workspace) {
      Blockly.svgResize(this.workspace);
    }
  }
}
