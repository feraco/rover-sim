var arduino_generator = new function() {
  var self = this;

  this.autoPorts = {
    ColorSensor: 1,
    UltrasonicSensor: 1,
    GyroSensor: 1,
    GPSSensor: 1,
    TouchSensor: 1,
    Pen: 1,
    CameraSensor: 1
  };

  // Load Arduino C++ generators
  this.load = function() {
    // Arduino doesn't use indentation, uses braces
    Blockly.Arduino = new Blockly.Generator('Arduino');
    
    // Define order of operations for Arduino C++
    Blockly.Arduino.ORDER_ATOMIC = 0;
    Blockly.Arduino.ORDER_UNARY_POSTFIX = 1;
    Blockly.Arduino.ORDER_UNARY_PREFIX = 2;
    Blockly.Arduino.ORDER_MULTIPLICATIVE = 3;
    Blockly.Arduino.ORDER_ADDITIVE = 4;
    Blockly.Arduino.ORDER_SHIFT = 5;
    Blockly.Arduino.ORDER_RELATIONAL = 6;
    Blockly.Arduino.ORDER_EQUALITY = 7;
    Blockly.Arduino.ORDER_BITWISE_AND = 8;
    Blockly.Arduino.ORDER_BITWISE_XOR = 9;
    Blockly.Arduino.ORDER_BITWISE_OR = 10;
    Blockly.Arduino.ORDER_LOGICAL_AND = 11;
    Blockly.Arduino.ORDER_LOGICAL_OR = 12;
    Blockly.Arduino.ORDER_CONDITIONAL = 13;
    Blockly.Arduino.ORDER_ASSIGNMENT = 14;
    Blockly.Arduino.ORDER_NONE = 99;

    // Initialize Arduino code blocks
    for (let generator in self.generators) {
      Blockly.Arduino[generator] = self.generators[generator];
    }
    
    // Helper function to quote strings
    Blockly.Arduino.quote_ = function(string) {
      string = string.replace(/\\/g, '\\\\')
                     .replace(/\n/g, '\\\n')
                     .replace(/"/g, '\\"');
      return '"' + string + '"';
    };

    // Helper function to convert statements to code
    Blockly.Arduino.statementToCode = function(block, name) {
      var targetBlock = block.getInputTargetBlock(name);
      var code = Blockly.Arduino.blockToCode(targetBlock);
      if (typeof code === 'string') {
        return code;
      }
      return '';
    };

    // Helper function to convert values to code
    Blockly.Arduino.valueToCode = function(block, name, order) {
      if (isNaN(order)) {
        throw TypeError('Expecting valid order from block: ' + block.type);
      }
      var targetBlock = block.getInputTargetBlock(name);
      if (!targetBlock) {
        return '';
      }
      var tuple = Blockly.Arduino.blockToCode(targetBlock);
      if (tuple === '') {
        return '';
      }
      if (!Array.isArray(tuple)) {
        return tuple;
      }
      var code = tuple[0];
      var innerOrder = tuple[1];
      if (isNaN(innerOrder)) {
        throw TypeError('Expecting valid order from value block: ' + targetBlock.type);
      }
      if (order <= innerOrder) {
        return code;
      }
      return '(' + code + ')';
    };

    // Main block to code conversion
    Blockly.Arduino.blockToCode = function(block) {
      if (!block) {
        return '';
      }
      if (block.isInsertionMarker()) {
        return '';
      }
      
      var func = Blockly.Arduino[block.type];
      if (typeof func !== 'function') {
        throw Error('Language "Arduino" does not know how to generate code for block type "' + block.type + '".');
      }
      
      var code = func.call(block, block);
      if (Array.isArray(code)) {
        return [Blockly.Arduino.scrub_(block, code[0]), code[1]];
      } else if (typeof code === 'string') {
        var nextCode = Blockly.Arduino.blockToCode(block.getNextBlock());
        return code + nextCode;
      } else if (code === null) {
        return '';
      } else {
        throw SyntaxError('Invalid code generated: ' + code);
      }
    };

    // Workspace to code conversion
    Blockly.Arduino.workspaceToCode = function(workspace) {
      if (!workspace) {
        console.warn('No workspace passed to workspaceToCode.');
        return '';
      }
      var code = [];
      Blockly.Arduino.init(workspace);
      var blocks = workspace.getTopBlocks(true);
      for (var i = 0, block; block = blocks[i]; i++) {
        var line = Blockly.Arduino.blockToCode(block);
        if (Array.isArray(line)) {
          line = line[0];
        }
        if (line) {
          code.push(line);
        }
      }
      code = code.join('\n');
      code = Blockly.Arduino.finish(code);
      return code;
    };

    // Initialize the generator
    Blockly.Arduino.init = function(workspace) {
      if (!Blockly.Arduino.nameDB_) {
        Blockly.Arduino.nameDB_ = new Blockly.Names(Blockly.Arduino.RESERVED_WORDS_);
      } else {
        Blockly.Arduino.nameDB_.reset();
      }
      
      Blockly.Arduino.nameDB_.setVariableMap(workspace.getVariableMap());
      
      var defvars = [];
      var variables = workspace.getVariableMap().getAllVariables();
      for (var i = 0; i < variables.length; i++) {
        defvars.push('int ' +
            Blockly.Arduino.nameDB_.getName(variables[i].getId(),
                Blockly.VARIABLE_CATEGORY_NAME) + ' = 0;');
      }
      Blockly.Arduino.definitions_ = Object.create(null);
      Blockly.Arduino.setups_ = Object.create(null);
    };

    // Finish code generation
    Blockly.Arduino.finish = function(code) {
      var definitions = [];
      for (var name in Blockly.Arduino.definitions_) {
        definitions.push(Blockly.Arduino.definitions_[name]);
      }
      return definitions.join('\n\n') + '\n\n' + code;
    };

    // Scrub for formatting
    Blockly.Arduino.scrub_ = function(block, code) {
      var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
      var nextCode = Blockly.Arduino.blockToCode(nextBlock);
      return code + nextCode;
    };

    // Reserved words in Arduino C++
    Blockly.Arduino.RESERVED_WORDS_ =
        'setup,loop,if,else,for,switch,case,while,do,break,continue,return,' +
        'goto,define,include,HIGH,LOW,INPUT,OUTPUT,INPUT_PULLUP,true,false,' +
        'integer,constants,floating,point,void,boolean,char,unsigned,byte,int,' +
        'word,long,float,double,string,String,array,static,volatile,const,' +
        'sizeof,pinMode,digitalWrite,digitalRead,analogRead,analogWrite,tone,' +
        'noTone,shiftOut,shitIn,pulseIn,millis,micros,delay,delayMicroseconds,' +
        'min,max,abs,constrain,map,pow,sqrt,sin,cos,tan,randomSeed,random,' +
        'Serial';
  };

  // Generate Arduino C++ code
  this.genCode = function() {
    let workspaceCode = '';
    
    // Try to generate code from workspace
    try {
      if (typeof Blockly !== 'undefined' && Blockly.Arduino && blockly.workspace) {
        workspaceCode = Blockly.Arduino.workspaceToCode(blockly.workspace);
      }
    } catch (e) {
      console.error('Error generating Arduino code:', e);
      workspaceCode = '  // Error generating code from blocks\n';
    }

    // Header comments
    let code =
      '/*\n' +
      ' * Generated Arduino Code for CarControl Robot\n' +
      ' * Author: Generated by Gears Simulator\n' +
      ' * Date: ' + new Date().toLocaleDateString() + '\n' +
      ' */\n\n';

    // Includes
    code +=
      '#include <CarControl.h>\n' +
      '#include <Servo.h>\n' +
      '#include <FastLED.h>\n' +
      '#include <Ultrasonic.h>\n\n';

    // Pin definitions
    code +=
      '// Motor control pins\n' +
      '#define PWMA 5\n' +
      '#define PWMB 6\n' +
      '#define AIN 7\n' +
      '#define BIN 8\n' +
      '#define STBY 3\n' +
      '#define MODE_SWITCH 2\n\n';

    // Sensor pins
    code +=
      '// Sensor pins\n' +
      '#define TRIG_PIN 13\n' +
      '#define ECHO_PIN 12\n' +
      '#define IR_SENSOR_PIN A0\n' +
      '#define SERVO_PIN 10\n' +
      '#define BUZZER_PIN 11\n' +
      '#define CLAW_SERVO_PIN 9\n\n';

    // Create CarControl object
    code +=
      '// Create car control object\n' +
      'CarControl car(PWMA, PWMB, AIN, BIN, STBY, MODE_SWITCH);\n\n';

    // Setup function
    code +=
      'void setup() {\n' +
      '  Serial.begin(9600);\n' +
      '  car.setup();\n' +
      '  car.attachSensorServo(SERVO_PIN);\n' +
      '  car.attachBuzzer(BUZZER_PIN);\n' +
      '  car.attachClaw(CLAW_SERVO_PIN);\n' +
      '  car.initLineSensors();\n' +
      '  car.centerServo();\n' +
      '  delay(1000); // Wait for initialization\n' +
      '}\n\n';

    // Loop function
    code +=
      'void loop() {\n' +
      workspaceCode +
      '}\n';

    return code;
  };

  // Generate JavaScript code for simulator
  this.genJavaScript = function() {
    let jsCode = '';
    
    // Generate JavaScript from Arduino blocks
    try {
      if (typeof blockly !== 'undefined' && blockly.workspace) {
        // Get all top-level blocks
        var blocks = blockly.workspace.getTopBlocks(true);
        
        for (var i = 0; i < blocks.length; i++) {
          var block = blocks[i];
          var blockCode = self.blockToJavaScript(block);
          if (blockCode) {
            jsCode += blockCode;
          }
        }
      }
    } catch (e) {
      console.error('Error generating JavaScript code:', e);
      jsCode = '  // Error generating code from blocks\n';
    }

    return jsCode;
  };

  // Convert a single block to JavaScript
  this.blockToJavaScript = function(block) {
    if (!block || block.disabled) {
      return '';
    }
    
    var code = '';
    var blockType = block.type;
    
    // Generate code for this block
    if (self.jsGenerators[blockType]) {
      code = self.jsGenerators[blockType](block);
    }
    
    // Process next block in chain
    var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
    if (nextBlock) {
      code += self.blockToJavaScript(nextBlock);
    }
    
    return code;
  };

  //
  // Arduino C++ Generators
  //

  this.generators = {
    //
    // Special generators
    //
    'math_change': function(block) {
      var argument0 = Blockly.Arduino.valueToCode(block, 'DELTA',
          Blockly.Arduino.ORDER_ADDITIVE) || '0';
      var varName = Blockly.Arduino.nameDB_.getName(block.getFieldValue('VAR'), 
          Blockly.VARIABLE_CATEGORY_NAME);
      return varName + ' += ' + argument0 + ';\n';
    },

    // Start
    'when_started': function(block) {
      var code = '  // Program starts here\n';
      return code;
    },

    // Move tank - maps to CarControl movement
    'move_tank': function(block) {
      var value_left = Blockly.Arduino.valueToCode(block, 'left', Blockly.Arduino.ORDER_ATOMIC);
      var value_right = Blockly.Arduino.valueToCode(block, 'right', Blockly.Arduino.ORDER_ATOMIC);
      
      // Calculate average speed and differential for turning
      var code = '  // Move with left: ' + value_left + ', right: ' + value_right + '\n';
      code += '  car.customMovement(true, true, ' + value_left + ' * 2.55, ' + value_right + ' * 2.55, 100);\n';
      
      return code;
    },

    // Move tank for duration
    'move_tank_for': function(block) {
      var value_left = Blockly.Arduino.valueToCode(block, 'left', Blockly.Arduino.ORDER_ATOMIC);
      var value_right = Blockly.Arduino.valueToCode(block, 'right', Blockly.Arduino.ORDER_ATOMIC);
      var value_duration = Blockly.Arduino.valueToCode(block, 'duration', Blockly.Arduino.ORDER_ATOMIC);
      var dropdown_units2 = block.getFieldValue('units2');

      var duration = value_duration;
      if (dropdown_units2 == 'SECONDS') {
        duration = value_duration + ' * 1000';
      } else if (dropdown_units2 == 'ROTATIONS') {
        duration = value_duration + ' * 360'; // Approximate
      }

      var code = '  car.customMovement(true, true, ' + value_left + ' * 2.55, ' + 
                 value_right + ' * 2.55, ' + duration + ');\n';
      return code;
    },

    // Move steering
    'move_steering': function(block) {
      var value_steering = Blockly.Arduino.valueToCode(block, 'steering', Blockly.Arduino.ORDER_ATOMIC);
      var value_speed = Blockly.Arduino.valueToCode(block, 'speed', Blockly.Arduino.ORDER_ATOMIC);

      var code = '  // Steering: ' + value_steering + ', Speed: ' + value_speed + '\n';
      code += '  {\n';
      code += '    int leftSpeed = ' + value_speed + ' - (' + value_steering + ' * 0.5);\n';
      code += '    int rightSpeed = ' + value_speed + ' + (' + value_steering + ' * 0.5);\n';
      code += '    car.customMovement(true, true, leftSpeed * 2.55, rightSpeed * 2.55, 100);\n';
      code += '  }\n';
      
      return code;
    },

    // Stop
    'stop': function(block) {
      var code = '  car.stopMotors();\n';
      return code;
    },

    // Sleep
    'sleep': function(block) {
      var value_seconds = Blockly.Arduino.valueToCode(block, 'seconds', Blockly.Arduino.ORDER_ATOMIC);
      var dropdown_units = block.getFieldValue('units');

      if (dropdown_units == 'SECONDS') {
        var code = '  delay(' + value_seconds + ' * 1000);\n';
      } else {
        var code = '  delay(' + value_seconds + ');\n';
      }
      
      return code;
    },

    // Ultrasonic sensor
    'ultrasonic_sensor': function(block) {
      var dropdown_port = block.getFieldValue('port');
      var code = 'car.getDistanceToObstacle()';
      return [code, Blockly.Arduino.ORDER_ATOMIC];
    },

    // Color sensor
    'color_sensor': function(block) {
      var dropdown_port = block.getFieldValue('port');
      var dropdown_mode = block.getFieldValue('mode');

      if (dropdown_mode == 'LEFT') {
        var code = 'car.getLineSensorLeft()';
      } else if (dropdown_mode == 'MIDDLE') {
        var code = 'car.getLineSensorMiddle()';
      } else {
        var code = 'car.getLineSensorRight()';
      }
      
      return [code, Blockly.Arduino.ORDER_ATOMIC];
    },

    // Gyro sensor heading
    'gyro_sensor': function(block) {
      var code = '0'; // Placeholder - would need IMU integration
      return [code, Blockly.Arduino.ORDER_ATOMIC];
    },

    // If statement
    'controls_if': function(block) {
      var n = 0;
      var code = '', branchCode, conditionCode;
      
      do {
        conditionCode = Blockly.Arduino.valueToCode(block, 'IF' + n,
            Blockly.Arduino.ORDER_NONE) || 'false';
        branchCode = Blockly.Arduino.statementToCode(block, 'DO' + n);
        
        code += (n > 0 ? '  else ' : '  ') + 'if (' + conditionCode + ') {\n' +
                branchCode + '  }\n';
        ++n;
      } while (block.getInput('IF' + n));
      
      if (block.getInput('ELSE')) {
        branchCode = Blockly.Arduino.statementToCode(block, 'ELSE');
        code += '  else {\n' + branchCode + '  }\n';
      }
      
      return code;
    },

    // While loop
    'controls_whileUntil': function(block) {
      var until = block.getFieldValue('MODE') == 'UNTIL';
      var argument0 = Blockly.Arduino.valueToCode(block, 'BOOL',
          until ? Blockly.Arduino.ORDER_LOGICAL_NOT :
          Blockly.Arduino.ORDER_NONE) || 'false';
      var branch = Blockly.Arduino.statementToCode(block, 'DO');
      
      if (until) {
        argument0 = '!' + argument0;
      }
      
      return '  while (' + argument0 + ') {\n' + branch + '  }\n';
    },

    // For loop
    'controls_for': function(block) {
      var variable0 = Blockly.Arduino.nameDB_.getName(
          block.getFieldValue('VAR'), Blockly.VARIABLE_CATEGORY_NAME);
      var argument0 = Blockly.Arduino.valueToCode(block, 'FROM',
          Blockly.Arduino.ORDER_ASSIGNMENT) || '0';
      var argument1 = Blockly.Arduino.valueToCode(block, 'TO',
          Blockly.Arduino.ORDER_ASSIGNMENT) || '0';
      var increment = Blockly.Arduino.valueToCode(block, 'BY',
          Blockly.Arduino.ORDER_ASSIGNMENT) || '1';
      var branch = Blockly.Arduino.statementToCode(block, 'DO');
      
      var code = '  for (int ' + variable0 + ' = ' + argument0 + '; ' +
          variable0 + ' <= ' + argument1 + '; ' +
          variable0 + ' += ' + increment + ') {\n' +
          branch + '  }\n';
      return code;
    },

    // Logic compare
    'logic_compare': function(block) {
      var OPERATORS = {
        'EQ': '==',
        'NEQ': '!=',
        'LT': '<',
        'LTE': '<=',
        'GT': '>',
        'GTE': '>='
      };
      var operator = OPERATORS[block.getFieldValue('OP')];
      var order = Blockly.Arduino.ORDER_RELATIONAL;
      var argument0 = Blockly.Arduino.valueToCode(block, 'A', order) || '0';
      var argument1 = Blockly.Arduino.valueToCode(block, 'B', order) || '0';
      var code = argument0 + ' ' + operator + ' ' + argument1;
      return [code, order];
    },

    // Logic operation
    'logic_operation': function(block) {
      var operator = (block.getFieldValue('OP') == 'AND') ? '&&' : '||';
      var order = (operator == '&&') ? Blockly.Arduino.ORDER_LOGICAL_AND :
          Blockly.Arduino.ORDER_LOGICAL_OR;
      var argument0 = Blockly.Arduino.valueToCode(block, 'A', order);
      var argument1 = Blockly.Arduino.valueToCode(block, 'B', order);
      if (!argument0 && !argument1) {
        argument0 = 'false';
        argument1 = 'false';
      } else {
        var defaultArgument = (operator == '&&') ? 'true' : 'false';
        if (!argument0) {
          argument0 = defaultArgument;
        }
        if (!argument1) {
          argument1 = defaultArgument;
        }
      }
      var code = argument0 + ' ' + operator + ' ' + argument1;
      return [code, order];
    },

    // Logic negate
    'logic_negate': function(block) {
      var order = Blockly.Arduino.ORDER_UNARY_PREFIX;
      var argument0 = Blockly.Arduino.valueToCode(block, 'BOOL', order) || 'true';
      var code = '!' + argument0;
      return [code, order];
    },

    // Logic boolean
    'logic_boolean': function(block) {
      var code = (block.getFieldValue('BOOL') == 'TRUE') ? 'true' : 'false';
      return [code, Blockly.Arduino.ORDER_ATOMIC];
    },

    // Math number
    'math_number': function(block) {
      var code = parseFloat(block.getFieldValue('NUM'));
      return [code, Blockly.Arduino.ORDER_ATOMIC];
    },

    // Math arithmetic
    'math_arithmetic': function(block) {
      var OPERATORS = {
        'ADD': [' + ', Blockly.Arduino.ORDER_ADDITIVE],
        'MINUS': [' - ', Blockly.Arduino.ORDER_ADDITIVE],
        'MULTIPLY': [' * ', Blockly.Arduino.ORDER_MULTIPLICATIVE],
        'DIVIDE': [' / ', Blockly.Arduino.ORDER_MULTIPLICATIVE],
        'POWER': [null, Blockly.Arduino.ORDER_NONE]
      };
      var tuple = OPERATORS[block.getFieldValue('OP')];
      var operator = tuple[0];
      var order = tuple[1];
      var argument0 = Blockly.Arduino.valueToCode(block, 'A', order) || '0';
      var argument1 = Blockly.Arduino.valueToCode(block, 'B', order) || '0';
      var code;
      if (!operator) {
        code = 'pow(' + argument0 + ', ' + argument1 + ')';
        return [code, Blockly.Arduino.ORDER_FUNCTION_CALL];
      }
      code = argument0 + operator + argument1;
      return [code, order];
    },

    // Variables get
    'variables_get': function(block) {
      var code = Blockly.Arduino.nameDB_.getName(block.getFieldValue('VAR'),
          Blockly.VARIABLE_CATEGORY_NAME);
      return [code, Blockly.Arduino.ORDER_ATOMIC];
    },

    // Variables set
    'variables_set': function(block) {
      var argument0 = Blockly.Arduino.valueToCode(block, 'VALUE',
          Blockly.Arduino.ORDER_ASSIGNMENT) || '0';
      var varName = Blockly.Arduino.nameDB_.getName(
          block.getFieldValue('VAR'), Blockly.VARIABLE_CATEGORY_NAME);
      return '  ' + varName + ' = ' + argument0 + ';\n';
    },

    // Text
    'text': function(block) {
      var code = Blockly.Arduino.quote_(block.getFieldValue('TEXT'));
      return [code, Blockly.Arduino.ORDER_ATOMIC];
    },

    // Print
    'text_print': function(block) {
      var msg = Blockly.Arduino.valueToCode(block, 'TEXT',
          Blockly.Arduino.ORDER_NONE) || '""';
      return '  Serial.println(' + msg + ');\n';
    },

    //
    // CarControl-specific blocks
    //

    // Line following
    'arduino_follow_line': function(block) {
      var threshold = Blockly.Arduino.valueToCode(block, 'threshold', Blockly.Arduino.ORDER_ATOMIC) || '500';
      return '  car.followLine(' + threshold + ');\n';
    },

    // Look directions
    'arduino_look_left': function(block) {
      return '  car.lookLeft();\n  delay(500);\n';
    },

    'arduino_look_right': function(block) {
      return '  car.lookRight();\n  delay(500);\n';
    },

    'arduino_look_center': function(block) {
      return '  car.centerServo();\n  delay(500);\n';
    },

    // Claw control
    'arduino_open_claw': function(block) {
      return '  car.openClaw();\n  delay(500);\n';
    },

    'arduino_close_claw': function(block) {
      return '  car.closeClaw();\n  delay(500);\n';
    },

    // Sound
    'arduino_beep': function(block) {
      var pattern = block.getFieldValue('pattern') || '1';
      return '  car.beep(' + pattern + ');\n';
    },

    'arduino_play_star_wars': function(block) {
      return '  car.playStarWars();\n';
    },

    // RGB LED
    'arduino_light_rgb': function(block) {
      var red = Blockly.Arduino.valueToCode(block, 'red', Blockly.Arduino.ORDER_ATOMIC) || '0';
      var green = Blockly.Arduino.valueToCode(block, 'green', Blockly.Arduino.ORDER_ATOMIC) || '0';
      var blue = Blockly.Arduino.valueToCode(block, 'blue', Blockly.Arduino.ORDER_ATOMIC) || '0';
      var duration = Blockly.Arduino.valueToCode(block, 'duration', Blockly.Arduino.ORDER_ATOMIC) || '1000';
      
      return '  car.lightRGBForDuration(CRGB(' + red + ', ' + green + ', ' + blue + '), ' + duration + ');\n';
    },

    // Battery level
    'arduino_battery_level': function(block) {
      var code = 'car.getBatteryLevel()';
      return [code, Blockly.Arduino.ORDER_ATOMIC];
    },

    // Line sensors
    'arduino_line_sensor_left': function(block) {
      var code = 'car.getLineSensorLeft()';
      return [code, Blockly.Arduino.ORDER_ATOMIC];
    },

    'arduino_line_sensor_middle': function(block) {
      var code = 'car.getLineSensorMiddle()';
      return [code, Blockly.Arduino.ORDER_ATOMIC];
    },

    'arduino_line_sensor_right': function(block) {
      var code = 'car.getLineSensorRight()';
      return [code, Blockly.Arduino.ORDER_ATOMIC];
    },

    // Distance sensor
    'arduino_get_distance': function(block) {
      var code = 'car.getDistanceToObstacle()';
      return [code, Blockly.Arduino.ORDER_ATOMIC];
    },

    // Movement blocks
    'arduino_move_forward': function(block) {
      var speed = Blockly.Arduino.valueToCode(block, 'speed', Blockly.Arduino.ORDER_ATOMIC) || '200';
      var duration = Blockly.Arduino.valueToCode(block, 'duration', Blockly.Arduino.ORDER_ATOMIC) || '1000';
      return '  car.moveForward(' + speed + ', ' + duration + ');\n';
    },

    'arduino_move_backward': function(block) {
      var speed = Blockly.Arduino.valueToCode(block, 'speed', Blockly.Arduino.ORDER_ATOMIC) || '200';
      var duration = Blockly.Arduino.valueToCode(block, 'duration', Blockly.Arduino.ORDER_ATOMIC) || '1000';
      return '  car.moveBackward(' + speed + ', ' + duration + ');\n';
    },

    'arduino_turn_left': function(block) {
      var speed = Blockly.Arduino.valueToCode(block, 'speed', Blockly.Arduino.ORDER_ATOMIC) || '200';
      var duration = Blockly.Arduino.valueToCode(block, 'duration', Blockly.Arduino.ORDER_ATOMIC) || '500';
      return '  car.turnLeft(' + speed + ', ' + duration + ');\n';
    },

    'arduino_turn_right': function(block) {
      var speed = Blockly.Arduino.valueToCode(block, 'speed', Blockly.Arduino.ORDER_ATOMIC) || '200';
      var duration = Blockly.Arduino.valueToCode(block, 'duration', Blockly.Arduino.ORDER_ATOMIC) || '500';
      return '  car.turnRight(' + speed + ', ' + duration + ');\n';
    },

    'arduino_stop_motors': function(block) {
      return '  car.stopMotors();\n';
    },

    // Plotter blocks
    'plotter_init': function(block) {
      var minX = Blockly.Arduino.valueToCode(block, 'minX', Blockly.Arduino.ORDER_ATOMIC) || '0';
      var minY = Blockly.Arduino.valueToCode(block, 'minY', Blockly.Arduino.ORDER_ATOMIC) || '0';
      var maxX = Blockly.Arduino.valueToCode(block, 'maxX', Blockly.Arduino.ORDER_ATOMIC) || '100';
      var maxY = Blockly.Arduino.valueToCode(block, 'maxY', Blockly.Arduino.ORDER_ATOMIC) || '100';

      var code = '  // Plotter initialized (' + minX + ', ' + minY + ', ' + maxX + ', ' + maxY + ')\n';
      return code;
    },

    'plotter_showHide': function(block) {
      var action = block.getFieldValue('action');
      var code = '  // Plotter ' + action + '\n';
      return code;
    },

    'plotter_clear': function(block) {
      var code = '  // Clear plotter\n';
      return code;
    },

    'plotter_drawGrid': function(block) {
      var type = block.getFieldValue('type') || '';
      var size = Blockly.Arduino.valueToCode(block, 'size', Blockly.Arduino.ORDER_ATOMIC) || '10';

      var code = '  // Draw grid ' + type + ' (' + size + ')\n';
      return code;
    },

    'plotter_setColor': function(block) {
      var color = block.getFieldValue('color');
      var code = '  // Set plotter color: ' + color + '\n';
      return code;
    },

    'plotter_setPointSize': function(block) {
      var size = Blockly.Arduino.valueToCode(block, 'size', Blockly.Arduino.ORDER_ATOMIC) || '2';
      var code = '  // Set point size: ' + size + '\n';
      return code;
    },

    'plotter_drawPoint': function(block) {
      var x = Blockly.Arduino.valueToCode(block, 'x', Blockly.Arduino.ORDER_ATOMIC) || '0';
      var y = Blockly.Arduino.valueToCode(block, 'y', Blockly.Arduino.ORDER_ATOMIC) || '0';

      var code = '  // Draw point at (' + x + ', ' + y + ')\n';
      return code;
    },

    'plotter_drawLine': function(block) {
      var x1 = Blockly.Arduino.valueToCode(block, 'x1', Blockly.Arduino.ORDER_ATOMIC) || '0';
      var y1 = Blockly.Arduino.valueToCode(block, 'y1', Blockly.Arduino.ORDER_ATOMIC) || '0';
      var x2 = Blockly.Arduino.valueToCode(block, 'x2', Blockly.Arduino.ORDER_ATOMIC) || '100';
      var y2 = Blockly.Arduino.valueToCode(block, 'y2', Blockly.Arduino.ORDER_ATOMIC) || '100';

      var code = '  // Draw line from (' + x1 + ', ' + y1 + ') to (' + x2 + ', ' + y2 + ')\n';
      return code;
    },

    'plotter_drawTriangle': function(block) {
      var x = Blockly.Arduino.valueToCode(block, 'x', Blockly.Arduino.ORDER_ATOMIC) || '0';
      var y = Blockly.Arduino.valueToCode(block, 'y', Blockly.Arduino.ORDER_ATOMIC) || '0';
      var dir = Blockly.Arduino.valueToCode(block, 'dir', Blockly.Arduino.ORDER_ATOMIC) || '90';

      var code = '  // Draw triangle at (' + x + ', ' + y + ') direction ' + dir + '\n';
      return code;
    },
  };

  //
  // JavaScript Generators for Simulator
  //
  this.jsGenerators = {
    // Start block
    'when_started': function(block) {
      return '  // Program starts\n';
    },

    // Movement blocks
    'arduino_move_forward': function(block) {
      var speed = block.getFieldValue('speed') || '200';
      var duration = block.getFieldValue('duration') || '1000';
      return '  await car.moveForward(' + speed + ', ' + duration + ');\n';
    },

    'arduino_move_backward': function(block) {
      var speed = block.getFieldValue('speed') || '200';
      var duration = block.getFieldValue('duration') || '1000';
      return '  await car.moveBackward(' + speed + ', ' + duration + ');\n';
    },

    'arduino_turn_left': function(block) {
      var speed = block.getFieldValue('speed') || '200';
      var duration = block.getFieldValue('duration') || '500';
      return '  await car.turnLeft(' + speed + ', ' + duration + ');\n';
    },

    'arduino_turn_right': function(block) {
      var speed = block.getFieldValue('speed') || '200';
      var duration = block.getFieldValue('duration') || '500';
      return '  await car.turnRight(' + speed + ', ' + duration + ');\n';
    },

    'arduino_stop_motors': function(block) {
      return '  await car.stopMotors();\n';
    },

    // Sensor blocks
    'arduino_get_distance': function(block) {
      var code = 'car.getDistance()';
      return [code, 0];
    },

    'arduino_follow_line': function(block) {
      var speed = block.getFieldValue('speed') || '100';
      return '  await car.followLine(' + speed + ');\n';
    },

    // Servo blocks
    'arduino_look_left': function(block) {
      return '  await car.lookLeft();\n';
    },

    'arduino_look_right': function(block) {
      return '  await car.lookRight();\n';
    },

    'arduino_look_center': function(block) {
      return '  await car.lookCenter();\n';
    },

    // Claw blocks
    'arduino_claw_open': function(block) {
      return '  await car.openClaw();\n';
    },

    'arduino_claw_close': function(block) {
      return '  await car.closeClaw();\n';
    },

    // Sound block
    'arduino_beep': function(block) {
      var frequency = block.getFieldValue('frequency') || '1000';
      var duration = block.getFieldValue('duration') || '500';
      return '  await car.beep(' + frequency + ', ' + duration + ');\n';
    },

    // LED block
    'arduino_light_rgb': function(block) {
      var red = block.getFieldValue('red') || '0';
      var green = block.getFieldValue('green') || '0';
      var blue = block.getFieldValue('blue') || '0';
      return '  await car.setRGB(' + red + ', ' + green + ', ' + blue + ');\n';
    },

    // Plotter blocks
    'plotter_init': function(block) {
      var minX = Blockly.Arduino.valueToCode(block, 'minX', Blockly.Arduino.ORDER_ATOMIC) || '0';
      var minY = Blockly.Arduino.valueToCode(block, 'minY', Blockly.Arduino.ORDER_ATOMIC) || '0';
      var maxX = Blockly.Arduino.valueToCode(block, 'maxX', Blockly.Arduino.ORDER_ATOMIC) || '100';
      var maxY = Blockly.Arduino.valueToCode(block, 'maxY', Blockly.Arduino.ORDER_ATOMIC) || '100';
      return '  plotter = new Plotter(' + minX + ', ' + minY + ', ' + maxX + ', ' + maxY + ');\n';
    },

    'plotter_showHide': function(block) {
      var action = block.getFieldValue('action');
      return action === 'SHOW' ? '  plotter.show();\n' : '  plotter.hide();\n';
    },

    'plotter_clear': function(block) {
      return '  plotter.clear();\n';
    },

    'plotter_drawGrid': function(block) {
      var type = block.getFieldValue('type') || '';
      var size = Blockly.Arduino.valueToCode(block, 'size', Blockly.Arduino.ORDER_ATOMIC) || '10';
      return '  plotter.drawGrid' + type + '(' + size + ');\n';
    },

    'plotter_setColor': function(block) {
      var color = block.getFieldValue('color');
      return '  plotter.setColor(\'' + color + '\');\n';
    },

    'plotter_setPointSize': function(block) {
      var size = Blockly.Arduino.valueToCode(block, 'size', Blockly.Arduino.ORDER_ATOMIC) || '2';
      return '  plotter.setPointSize(' + size + ');\n';
    },

    'plotter_drawPoint': function(block) {
      var x = Blockly.Arduino.valueToCode(block, 'x', Blockly.Arduino.ORDER_ATOMIC) || '0';
      var y = Blockly.Arduino.valueToCode(block, 'y', Blockly.Arduino.ORDER_ATOMIC) || '0';
      return '  plotter.drawPoint(' + x + ', ' + y + ');\n';
    },

    'plotter_drawLine': function(block) {
      var x1 = Blockly.Arduino.valueToCode(block, 'x1', Blockly.Arduino.ORDER_ATOMIC) || '0';
      var y1 = Blockly.Arduino.valueToCode(block, 'y1', Blockly.Arduino.ORDER_ATOMIC) || '0';
      var x2 = Blockly.Arduino.valueToCode(block, 'x2', Blockly.Arduino.ORDER_ATOMIC) || '100';
      var y2 = Blockly.Arduino.valueToCode(block, 'y2', Blockly.Arduino.ORDER_ATOMIC) || '100';
      return '  plotter.drawLine(' + x1 + ', ' + y1 + ', ' + x2 + ', ' + y2 + ');\n';
    },

    'plotter_drawTriangle': function(block) {
      var x = Blockly.Arduino.valueToCode(block, 'x', Blockly.Arduino.ORDER_ATOMIC) || '0';
      var y = Blockly.Arduino.valueToCode(block, 'y', Blockly.Arduino.ORDER_ATOMIC) || '0';
      var dir = Blockly.Arduino.valueToCode(block, 'dir', Blockly.Arduino.ORDER_ATOMIC) || '90';
      return '  plotter.drawTriangle(' + x + ', ' + y + ', ' + dir + ');\n';
    },
  };
};
