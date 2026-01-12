import * as Blockly from 'blockly';
import { defineArduinoBlocks, defineArduinoGenerators, getArduinoGenerator } from './arduinoBlocks';

export class BlocklyManager {
  constructor() {
    this.workspace = null;
    this.generator = 'arduino';
    this.toolbox = null;
    this.arduinoGenerator = null;
    this.pythonGenerator = null;
  }

  async init(container, toolbox) {
    this.toolbox = toolbox;

    defineArduinoBlocks();
    defineArduinoGenerators();
    this.arduinoGenerator = getArduinoGenerator();

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
    const python = await import('blockly/python');
    this.pythonGenerator = python.pythonGenerator;
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
        return this.pythonGenerator ? this.pythonGenerator.workspaceToCode(this.workspace) : '';
      } else if (this.generator === 'arduino') {
        return this.generateArduinoCode();
      }
    } catch (error) {
      console.error('Error generating code:', error);
      return '';
    }
  }

  generateArduinoCode() {
    if (!this.workspace || !this.arduinoGenerator) {
      return '// Arduino generator not loaded\n';
    }

    const blocks = this.workspace.getAllBlocks(false);

    if (blocks.length === 0) {
      return '// Drag Arduino blocks from the toolbox to generate code\n' +
             '// Example blocks: moveForward, turnLeft, turnRight, etc.\n';
    }

    let code = '// Arduino Code Generated from Blocks\n\n';
    code += 'void setup() {\n';
    code += '  // Initialization code here\n';
    code += '  Serial.begin(9600);\n';
    code += '}\n\n';
    code += 'void loop() {\n';

    blocks.forEach(block => {
      if (!block.getSurroundParent()) {
        const blockCode = this.arduinoGenerator.blockToCode(block);
        if (blockCode) {
          code += '  ' + blockCode;
        }
      }
    });

    code += '}\n';
    return code;
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
