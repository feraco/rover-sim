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

  Blockly.Blocks['arduino_stop'] = {
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

  Blockly.Blocks['arduino_delay'] = {
    init: function() {
      this.appendValueInput('duration')
          .setCheck('Number')
          .appendField('wait');
      this.appendDummyInput()
          .appendField('ms');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(120);
      this.setTooltip('Wait for specified milliseconds');
      this.setHelpUrl('');
    }
  };

  Blockly.Blocks['arduino_read_ultrasonic'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('read ultrasonic sensor (cm)');
      this.setOutput(true, 'Number');
      this.setColour(260);
      this.setTooltip('Read distance from ultrasonic sensor');
      this.setHelpUrl('');
    }
  };

  Blockly.Blocks['arduino_read_line_sensor'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('read line sensor')
          .appendField(new Blockly.FieldDropdown([
            ['left', 'LEFT'],
            ['center', 'CENTER'],
            ['right', 'RIGHT']
          ]), 'position');
      this.setOutput(true, 'Boolean');
      this.setColour(260);
      this.setTooltip('Read line sensor (returns true if line detected)');
      this.setHelpUrl('');
    }
  };
}

export function defineArduinoGenerators() {
  Blockly.Arduino = Blockly.Arduino || {};

  Blockly.Arduino['arduino_move_forward'] = function(block) {
    const speed = Blockly.Arduino.valueToCode(block, 'speed', Blockly.Arduino.ORDER_ATOMIC) || '255';
    const duration = Blockly.Arduino.valueToCode(block, 'duration', Blockly.Arduino.ORDER_ATOMIC) || '1000';
    return `moveForward(${speed}, ${duration});\n`;
  };

  Blockly.Arduino['arduino_move_backward'] = function(block) {
    const speed = Blockly.Arduino.valueToCode(block, 'speed', Blockly.Arduino.ORDER_ATOMIC) || '255';
    const duration = Blockly.Arduino.valueToCode(block, 'duration', Blockly.Arduino.ORDER_ATOMIC) || '1000';
    return `moveBackward(${speed}, ${duration});\n`;
  };

  Blockly.Arduino['arduino_turn_left'] = function(block) {
    const speed = Blockly.Arduino.valueToCode(block, 'speed', Blockly.Arduino.ORDER_ATOMIC) || '200';
    const duration = Blockly.Arduino.valueToCode(block, 'duration', Blockly.Arduino.ORDER_ATOMIC) || '500';
    return `turnLeft(${speed}, ${duration});\n`;
  };

  Blockly.Arduino['arduino_turn_right'] = function(block) {
    const speed = Blockly.Arduino.valueToCode(block, 'speed', Blockly.Arduino.ORDER_ATOMIC) || '200';
    const duration = Blockly.Arduino.valueToCode(block, 'duration', Blockly.Arduino.ORDER_ATOMIC) || '500';
    return `turnRight(${speed}, ${duration});\n`;
  };

  Blockly.Arduino['arduino_stop'] = function(block) {
    return 'stopMotors();\n';
  };

  Blockly.Arduino['arduino_delay'] = function(block) {
    const duration = Blockly.Arduino.valueToCode(block, 'duration', Blockly.Arduino.ORDER_ATOMIC) || '1000';
    return `delay(${duration});\n`;
  };

  Blockly.Arduino['arduino_read_ultrasonic'] = function(block) {
    return ['readUltrasonic()', Blockly.Arduino.ORDER_ATOMIC];
  };

  Blockly.Arduino['arduino_read_line_sensor'] = function(block) {
    const position = block.getFieldValue('position');
    return [`readLineSensor(${position})`, Blockly.Arduino.ORDER_ATOMIC];
  };
}
