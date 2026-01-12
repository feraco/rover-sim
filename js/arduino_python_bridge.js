// Python generators for Arduino blocks to enable simulator support
// This allows Arduino blocks to run in the browser simulator

(function() {
  // Wait for Blockly.Python to be loaded
  if (typeof Blockly === 'undefined' || typeof Blockly.Python === 'undefined') {
    setTimeout(arguments.callee, 100);
    return;
  }

  // Ensure forBlock exists
  if (!Blockly.Python.forBlock) {
    Blockly.Python.forBlock = {};
  }

  // Special blocks
  Blockly.Python.forBlock['when_started'] = function(block) {
    return '# Program starts\n';
  };

  // Arduino movement blocks -> Python movement
  Blockly.Python.forBlock['arduino_move_forward'] = function(block) {
    var speed = Blockly.Python.valueToCode(block, 'speed', Blockly.Python.ORDER_ATOMIC) || '255';
    var duration = Blockly.Python.valueToCode(block, 'duration', Blockly.Python.ORDER_ATOMIC) || '1000';
    var speedPercent = 'SpeedPercent(' + Math.round(parseFloat(speed) / 2.55) + ')';  // Convert 0-255 to 0-100
    var durationSec = duration + ' / 1000';
    return 'tank_drive.on_for_seconds(' + speedPercent + ', ' + speedPercent + ', ' + durationSec + ')\n';
  };

  Blockly.Python.forBlock['arduino_move_backward'] = function(block) {
    var speed = Blockly.Python.valueToCode(block, 'speed', Blockly.Python.ORDER_ATOMIC) || '255';
    var duration = Blockly.Python.valueToCode(block, 'duration', Blockly.Python.ORDER_ATOMIC) || '1000';
    var speedPercent = 'SpeedPercent(-' + Math.round(parseFloat(speed) / 2.55) + ')';  // Negative for backward
    var durationSec = duration + ' / 1000';
    return 'tank_drive.on_for_seconds(' + speedPercent + ', ' + speedPercent + ', ' + durationSec + ')\n';
  };

  Blockly.Python.forBlock['arduino_turn_left'] = function(block) {
    var speed = Blockly.Python.valueToCode(block, 'speed', Blockly.Python.ORDER_ATOMIC) || '200';
    var duration = Blockly.Python.valueToCode(block, 'duration', Blockly.Python.ORDER_ATOMIC) || '500';
    var speedPercent = Math.round(parseFloat(speed) / 2.55);
    var durationSec = duration + ' / 1000';
    return 'tank_drive.on_for_seconds(SpeedPercent(-' + speedPercent + '), SpeedPercent(' + speedPercent + '), ' + durationSec + ')\n';
  };

  Blockly.Python.forBlock['arduino_turn_right'] = function(block) {
    var speed = Blockly.Python.valueToCode(block, 'speed', Blockly.Python.ORDER_ATOMIC) || '200';
    var duration = Blockly.Python.valueToCode(block, 'duration', Blockly.Python.ORDER_ATOMIC) || '500';
    var speedPercent = Math.round(parseFloat(speed) / 2.55);
    var durationSec = duration + ' / 1000';
    return 'tank_drive.on_for_seconds(SpeedPercent(' + speedPercent + '), SpeedPercent(-' + speedPercent + '), ' + durationSec + ')\n';
  };

  Blockly.Python.forBlock['arduino_stop'] = function(block) {
    return 'tank_drive.off()\n';
  };

  Blockly.Python.forBlock['arduino_stop_motors'] = function(block) {
    return 'tank_drive.off()\n';
  };

  // Arduino sensor blocks -> Python sensors
  Blockly.Python.forBlock['arduino_get_distance'] = function(block) {
    return ['ultrasonic.distance_centimeters', Blockly.Python.ORDER_ATOMIC];
  };

  Blockly.Python.forBlock['arduino_follow_line'] = function(block) {
    var threshold = Blockly.Python.valueToCode(block, 'threshold', Blockly.Python.ORDER_ATOMIC) || '500';
    var code = 
      '# Line following with threshold ' + threshold + '\n' +
      'left_color = colorLeft.reflected_light_intensity\n' +
      'right_color = colorRight.reflected_light_intensity\n' +
      'if left_color < 50 and right_color > 50:\n' +
      '    tank_drive.on(10, 30)\n' +
      'elif left_color > 50 and right_color < 50:\n' +
      '    tank_drive.on(30, 10)\n' +
      'else:\n' +
      '    tank_drive.on(20, 20)\n';
    return code;
  };

  // Arduino servo blocks -> Python motor
  Blockly.Python.forBlock['arduino_look_left'] = function(block) {
    return '# Look left (servo to 180)\nmedium_motor.on_for_degrees(50, 90)\n';
  };

  Blockly.Python.forBlock['arduino_look_right'] = function(block) {
    return '# Look right (servo to 0)\nmedium_motor.on_for_degrees(50, -90)\n';
  };

  Blockly.Python.forBlock['arduino_look_center'] = function(block) {
    return '# Look center (servo to 90)\nmedium_motor.on_for_degrees(50, 0)\n';
  };

  // Arduino claw blocks -> Python medium motor
  Blockly.Python.forBlock['arduino_open_claw'] = function(block) {
    return '# Open claw\nmedium_motor.on_for_degrees(30, 45)\n';
  };

  Blockly.Python.forBlock['arduino_close_claw'] = function(block) {
    return '# Close claw\nmedium_motor.on_for_degrees(30, -45)\n';
  };

  // Arduino sound blocks -> Python sound
  Blockly.Python.forBlock['arduino_beep'] = function(block) {
    var frequency = Blockly.Python.valueToCode(block, 'frequency', Blockly.Python.ORDER_ATOMIC) || '1000';
    var duration = Blockly.Python.valueToCode(block, 'duration', Blockly.Python.ORDER_ATOMIC) || '200';
    var durationSec = '(' + duration + ' / 1000)';
    return 'sound.beep()\ntime.sleep(' + durationSec + ')\n';
  };

  // Arduino LED blocks -> Python (simulate with print)
  Blockly.Python.forBlock['arduino_light_rgb'] = function(block) {
    var red = Blockly.Python.valueToCode(block, 'red', Blockly.Python.ORDER_ATOMIC) || '255';
    var green = Blockly.Python.valueToCode(block, 'green', Blockly.Python.ORDER_ATOMIC) || '0';
    var blue = Blockly.Python.valueToCode(block, 'blue', Blockly.Python.ORDER_ATOMIC) || '0';
    return 'print("LED: RGB(" + str(' + red + ') + "," + str(' + green + ') + "," + str(' + blue + ') + ")")\n';
  };

  Blockly.Python.forBlock['arduino_light_off'] = function(block) {
    return 'print("LED: OFF")\n';
  };

  console.log('Arduino-Python bridge loaded: Arduino blocks can now run in simulator');
})();
