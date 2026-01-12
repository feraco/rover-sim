import * as Blockly from 'blockly';

export function defineArduinoBlocks() {
  Blockly.Blocks['arduino_move_forward'] = {
    init: function() {
      this.appendValueInput('speed')
          .setCheck('Number')
          .appendField('move forward at speed');
      this.appendValueInput('duration')
          .setCheck('Number')
          .appendField('for');
      this.appendDummyInput()
          .appendField('ms');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip('Move the robot forward');
      this.setHelpUrl('');
    }
  };

  Blockly.Blocks['arduino_move_backward'] = {
    init: function() {
      this.appendValueInput('speed')
          .setCheck('Number')
          .appendField('move backward at speed');
      this.appendValueInput('duration')
          .setCheck('Number')
          .appendField('for');
      this.appendDummyInput()
          .appendField('ms');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip('Move the robot backward');
      this.setHelpUrl('');
    }
  };

  Blockly.Blocks['arduino_turn_left'] = {
    init: function() {
      this.appendValueInput('speed')
          .setCheck('Number')
          .appendField('turn left at speed');
      this.appendValueInput('duration')
          .setCheck('Number')
          .appendField('for');
      this.appendDummyInput()
          .appendField('ms');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip('Turn the robot left');
      this.setHelpUrl('');
    }
  };

  Blockly.Blocks['arduino_turn_right'] = {
    init: function() {
      this.appendValueInput('speed')
          .setCheck('Number')
          .appendField('turn right at speed');
      this.appendValueInput('duration')
          .setCheck('Number')
          .appendField('for');
      this.appendDummyInput()
          .appendField('ms');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip('Turn the robot right');
      this.setHelpUrl('');
    }
  };

  Blockly.Blocks['arduino_stop_motors'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('stop motors');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip('Stop all motors');
      this.setHelpUrl('');
    }
  };

  Blockly.Blocks['arduino_get_distance'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('get distance (cm)');
      this.setOutput(true, 'Number');
      this.setColour(160);
      this.setTooltip('Get distance from ultrasonic sensor in cm');
      this.setHelpUrl('');
    }
  };

  Blockly.Blocks['arduino_follow_line'] = {
    init: function() {
      this.appendValueInput('threshold')
          .setCheck('Number')
          .appendField('follow line with threshold');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(160);
      this.setTooltip('Follow a line using line sensors');
      this.setHelpUrl('');
    }
  };

  Blockly.Blocks['arduino_look_left'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('look left');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(260);
      this.setTooltip('Turn servo to look left');
      this.setHelpUrl('');
    }
  };

  Blockly.Blocks['arduino_look_right'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('look right');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(260);
      this.setTooltip('Turn servo to look right');
      this.setHelpUrl('');
    }
  };

  Blockly.Blocks['arduino_look_center'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('look center');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(260);
      this.setTooltip('Center the servo');
      this.setHelpUrl('');
    }
  };

  Blockly.Blocks['arduino_open_claw'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('open claw');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(290);
      this.setTooltip('Open the claw');
      this.setHelpUrl('');
    }
  };

  Blockly.Blocks['arduino_close_claw'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('close claw');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(290);
      this.setTooltip('Close the claw');
      this.setHelpUrl('');
    }
  };

  Blockly.Blocks['arduino_beep'] = {
    init: function() {
      this.appendValueInput('frequency')
          .setCheck('Number')
          .appendField('beep frequency');
      this.appendValueInput('duration')
          .setCheck('Number')
          .appendField('duration');
      this.appendDummyInput()
          .appendField('ms');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(160);
      this.setTooltip('Play a beep sound');
      this.setHelpUrl('');
    }
  };

  Blockly.Blocks['arduino_light_rgb'] = {
    init: function() {
      this.appendValueInput('red')
          .setCheck('Number')
          .appendField('set RGB LED R');
      this.appendValueInput('green')
          .setCheck('Number')
          .appendField('G');
      this.appendValueInput('blue')
          .setCheck('Number')
          .appendField('B');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(160);
      this.setTooltip('Set RGB LED color');
      this.setHelpUrl('');
    }
  };

  Blockly.Blocks['arduino_light_off'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('turn LED off');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(160);
      this.setTooltip('Turn off the LED');
      this.setHelpUrl('');
    }
  };

  Blockly.Blocks['plotter_init'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('initialize plotter');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(20);
      this.setTooltip('Initialize data plotter');
      this.setHelpUrl('');
    }
  };

  Blockly.Blocks['plotter_showHide'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('toggle plotter visibility');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(20);
      this.setTooltip('Show or hide the plotter');
      this.setHelpUrl('');
    }
  };

  Blockly.Blocks['plotter_clear'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('clear plotter');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(20);
      this.setTooltip('Clear the plotter');
      this.setHelpUrl('');
    }
  };

  Blockly.Blocks['plotter_drawGrid'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('draw grid');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(20);
      this.setTooltip('Draw grid on plotter');
      this.setHelpUrl('');
    }
  };

  Blockly.Blocks['plotter_setColor'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('set plotter color');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(20);
      this.setTooltip('Set plotter color');
      this.setHelpUrl('');
    }
  };

  Blockly.Blocks['plotter_setPointSize'] = {
    init: function() {
      this.appendValueInput('size')
          .setCheck('Number')
          .appendField('set point size');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(20);
      this.setTooltip('Set point size for plotter');
      this.setHelpUrl('');
    }
  };

  Blockly.Blocks['plotter_drawPoint'] = {
    init: function() {
      this.appendValueInput('x')
          .setCheck('Number')
          .appendField('draw point at x');
      this.appendValueInput('y')
          .setCheck('Number')
          .appendField('y');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(20);
      this.setTooltip('Draw a point on the plotter');
      this.setHelpUrl('');
    }
  };

  Blockly.Blocks['plotter_drawLine'] = {
    init: function() {
      this.appendValueInput('x1')
          .setCheck('Number')
          .appendField('draw line from x1');
      this.appendValueInput('y1')
          .setCheck('Number')
          .appendField('y1');
      this.appendValueInput('x2')
          .setCheck('Number')
          .appendField('to x2');
      this.appendValueInput('y2')
          .setCheck('Number')
          .appendField('y2');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(20);
      this.setTooltip('Draw a line on the plotter');
      this.setHelpUrl('');
    }
  };

  Blockly.Blocks['plotter_drawTriangle'] = {
    init: function() {
      this.appendValueInput('x')
          .setCheck('Number')
          .appendField('draw triangle at x');
      this.appendValueInput('y')
          .setCheck('Number')
          .appendField('y');
      this.appendValueInput('dir')
          .setCheck('Number')
          .appendField('direction');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(20);
      this.setTooltip('Draw a triangle on the plotter');
      this.setHelpUrl('');
    }
  };

  Blockly.Blocks['sleep'] = {
    init: function() {
      this.appendValueInput('seconds')
          .setCheck('Number')
          .appendField('wait');
      this.appendDummyInput()
          .appendField(new Blockly.FieldDropdown([
            ['seconds', 'SECONDS'],
            ['milliseconds', 'MILLISECONDS']
          ]), 'units');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(120);
      this.setTooltip('Wait for specified time');
      this.setHelpUrl('');
    }
  };
}

let arduinoGenerator = null;

export function getArduinoGenerator() {
  if (!arduinoGenerator) {
    arduinoGenerator = new Blockly.Generator('Arduino');

    arduinoGenerator.ORDER_ATOMIC = 0;
    arduinoGenerator.ORDER_MEMBER = 1;
    arduinoGenerator.ORDER_FUNCTION_CALL = 2;
    arduinoGenerator.ORDER_UNARY_POSTFIX = 3;
    arduinoGenerator.ORDER_UNARY_PREFIX = 4;
    arduinoGenerator.ORDER_MULTIPLICATIVE = 5;
    arduinoGenerator.ORDER_ADDITIVE = 6;
    arduinoGenerator.ORDER_SHIFT = 7;
    arduinoGenerator.ORDER_RELATIONAL = 8;
    arduinoGenerator.ORDER_EQUALITY = 9;
    arduinoGenerator.ORDER_BITWISE_AND = 10;
    arduinoGenerator.ORDER_BITWISE_XOR = 11;
    arduinoGenerator.ORDER_BITWISE_OR = 12;
    arduinoGenerator.ORDER_LOGICAL_AND = 13;
    arduinoGenerator.ORDER_LOGICAL_OR = 14;
    arduinoGenerator.ORDER_CONDITIONAL = 15;
    arduinoGenerator.ORDER_ASSIGNMENT = 16;
    arduinoGenerator.ORDER_NONE = 99;

    arduinoGenerator.init = function(workspace) {
      this.nameDB_ = new Blockly.Names(this.RESERVED_WORDS_);
    };

    arduinoGenerator.finish = function(code) {
      return code;
    };

    arduinoGenerator.scrubNakedValue = function(line) {
      return line + ';\n';
    };

    arduinoGenerator.scrub_ = function(block, code, opt_thisOnly) {
      const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
      let nextCode = '';
      if (nextBlock && !opt_thisOnly) {
        nextCode = arduinoGenerator.blockToCode(nextBlock);
      }
      return code + nextCode;
    };
  }
  return arduinoGenerator;
}

export function defineArduinoGenerators() {
  const Arduino = getArduinoGenerator();

  Arduino.forBlock['arduino_move_forward'] = function(block) {
    const speed = Arduino.valueToCode(block, 'speed', Arduino.ORDER_ATOMIC) || '255';
    const duration = Arduino.valueToCode(block, 'duration', Arduino.ORDER_ATOMIC) || '1000';
    return `moveForward(${speed}, ${duration});\n`;
  };

  Arduino.forBlock['arduino_move_backward'] = function(block) {
    const speed = Arduino.valueToCode(block, 'speed', Arduino.ORDER_ATOMIC) || '255';
    const duration = Arduino.valueToCode(block, 'duration', Arduino.ORDER_ATOMIC) || '1000';
    return `moveBackward(${speed}, ${duration});\n`;
  };

  Arduino.forBlock['arduino_turn_left'] = function(block) {
    const speed = Arduino.valueToCode(block, 'speed', Arduino.ORDER_ATOMIC) || '200';
    const duration = Arduino.valueToCode(block, 'duration', Arduino.ORDER_ATOMIC) || '500';
    return `turnLeft(${speed}, ${duration});\n`;
  };

  Arduino.forBlock['arduino_turn_right'] = function(block) {
    const speed = Arduino.valueToCode(block, 'speed', Arduino.ORDER_ATOMIC) || '200';
    const duration = Arduino.valueToCode(block, 'duration', Arduino.ORDER_ATOMIC) || '500';
    return `turnRight(${speed}, ${duration});\n`;
  };

  Arduino.forBlock['arduino_stop_motors'] = function(block) {
    return 'stopMotors();\n';
  };

  Arduino.forBlock['arduino_get_distance'] = function(block) {
    return ['getDistance()', Arduino.ORDER_ATOMIC];
  };

  Arduino.forBlock['arduino_follow_line'] = function(block) {
    const threshold = Arduino.valueToCode(block, 'threshold', Arduino.ORDER_ATOMIC) || '500';
    return `followLine(${threshold});\n`;
  };

  Arduino.forBlock['arduino_look_left'] = function(block) {
    return 'lookLeft();\n';
  };

  Arduino.forBlock['arduino_look_right'] = function(block) {
    return 'lookRight();\n';
  };

  Arduino.forBlock['arduino_look_center'] = function(block) {
    return 'lookCenter();\n';
  };

  Arduino.forBlock['arduino_open_claw'] = function(block) {
    return 'openClaw();\n';
  };

  Arduino.forBlock['arduino_close_claw'] = function(block) {
    return 'closeClaw();\n';
  };

  Arduino.forBlock['arduino_beep'] = function(block) {
    const frequency = Arduino.valueToCode(block, 'frequency', Arduino.ORDER_ATOMIC) || '1000';
    const duration = Arduino.valueToCode(block, 'duration', Arduino.ORDER_ATOMIC) || '200';
    return `tone(BUZZER_PIN, ${frequency}, ${duration});\n`;
  };

  Arduino.forBlock['arduino_light_rgb'] = function(block) {
    const red = Arduino.valueToCode(block, 'red', Arduino.ORDER_ATOMIC) || '0';
    const green = Arduino.valueToCode(block, 'green', Arduino.ORDER_ATOMIC) || '0';
    const blue = Arduino.valueToCode(block, 'blue', Arduino.ORDER_ATOMIC) || '0';
    return `setRGB(${red}, ${green}, ${blue});\n`;
  };

  Arduino.forBlock['arduino_light_off'] = function(block) {
    return 'setRGB(0, 0, 0);\n';
  };

  Blockly.Arduino['plotter_init'] = function(block) {
    return '// Plotter initialized\n';
  };

  Blockly.Arduino['plotter_showHide'] = function(block) {
    return '// Toggle plotter\n';
  };

  Blockly.Arduino['plotter_clear'] = function(block) {
    return '// Clear plotter\n';
  };

  Blockly.Arduino['plotter_drawGrid'] = function(block) {
    return '// Draw grid\n';
  };

  Blockly.Arduino['plotter_setColor'] = function(block) {
    return '// Set color\n';
  };

  Blockly.Arduino['plotter_setPointSize'] = function(block) {
    const size = Blockly.Arduino.valueToCode(block, 'size', Blockly.Arduino.ORDER_ATOMIC) || '2';
    return `// Set point size: ${size}\n`;
  };

  Blockly.Arduino['plotter_drawPoint'] = function(block) {
    const x = Blockly.Arduino.valueToCode(block, 'x', Blockly.Arduino.ORDER_ATOMIC) || '0';
    const y = Blockly.Arduino.valueToCode(block, 'y', Blockly.Arduino.ORDER_ATOMIC) || '0';
    return `// Draw point at (${x}, ${y})\n`;
  };

  Blockly.Arduino['plotter_drawLine'] = function(block) {
    const x1 = Blockly.Arduino.valueToCode(block, 'x1', Blockly.Arduino.ORDER_ATOMIC) || '0';
    const y1 = Blockly.Arduino.valueToCode(block, 'y1', Blockly.Arduino.ORDER_ATOMIC) || '0';
    const x2 = Blockly.Arduino.valueToCode(block, 'x2', Blockly.Arduino.ORDER_ATOMIC) || '0';
    const y2 = Blockly.Arduino.valueToCode(block, 'y2', Blockly.Arduino.ORDER_ATOMIC) || '0';
    return `// Draw line from (${x1}, ${y1}) to (${x2}, ${y2})\n`;
  };

  Blockly.Arduino['plotter_drawTriangle'] = function(block) {
    const x = Blockly.Arduino.valueToCode(block, 'x', Blockly.Arduino.ORDER_ATOMIC) || '0';
    const y = Blockly.Arduino.valueToCode(block, 'y', Blockly.Arduino.ORDER_ATOMIC) || '0';
    const dir = Blockly.Arduino.valueToCode(block, 'dir', Blockly.Arduino.ORDER_ATOMIC) || '0';
    return `// Draw triangle at (${x}, ${y}) dir ${dir}\n`;
  };

  Blockly.Arduino['sleep'] = function(block) {
    const value = Blockly.Arduino.valueToCode(block, 'seconds', Blockly.Arduino.ORDER_ATOMIC) || '1';
    const units = block.getFieldValue('units');
    if (units === 'SECONDS') {
      return `delay(${value} * 1000);\n`;
    } else {
      return `delay(${value});\n`;
    }
  };
}
