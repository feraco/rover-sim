# Arduino Code Generator Integration Guide

## Overview

This guide shows you how to integrate the Arduino C++ code generator into the Gears simulator. The Arduino generator converts Blockly blocks into Arduino C++ code compatible with your CarControl library.

## Files Created

1. **[public/js/arduino_generator.js](public/js/arduino_generator.js)** - Main Arduino code generator
2. **[public/arduinoBlocks.json](public/arduinoBlocks.json)** - Arduino-specific block definitions

## Integration Steps

### Step 1: Load Arduino Generator Script

Add the Arduino generator script to [public/index.html](public/index.html) after the ev3dev2 generator:

```html
<script src="js/ev3dev2_generator.js?v=07a6a28e"></script>
<script src="js/pybricks_generator.js?v=d1f520fe"></script>
<script src="js/arduino_generator.js"></script>  <!-- Add this line -->
<script src="js/blockly.js?v=ee66b3a1"></script>
```

### Step 2: Load Arduino Blocks

Modify [public/js/blockly.js](public/js/blockly.js) to load Arduino blocks. Find the `loadCustomBlocks` function:

```javascript
this.loadCustomBlocks = function() {
  return fetch('customBlocks.json?v=3cd8436f')
    .then(response => response.text())
    .then(function(response) {
      let json = JSON.parse(i18n.replace(response));
      Blockly.defineBlocksWithJsonArray(json);
      
      // Load Arduino blocks
      return fetch('arduinoBlocks.json');
    })
    .then(response => response.text())
    .then(function(response) {
      let json = JSON.parse(response);
      Blockly.defineBlocksWithJsonArray(json);
    });
};
```

### Step 3: Add Generator Selector

Modify [public/js/blockly.js](public/js/blockly.js) to support multiple generators:

```javascript
var blockly = new function() {
  var self = this;
  
  // ... existing code ...
  
  this.generator = ev3dev2_generator;  // Default generator
  this.generatorType = 'python';       // Add this line
  
  // Add method to switch generators
  this.setGenerator = function(type) {
    if (type == 'arduino') {
      self.generator = arduino_generator;
      self.generatorType = 'arduino';
    } else if (type == 'python') {
      self.generator = ev3dev2_generator;
      self.generatorType = 'python';
    }
  };
  
  // ... rest of code ...
};
```

### Step 4: Update Code Generation

Modify the code generation to use the selected generator. Find where Python code is generated and update it:

```javascript
// In blocklyPanel.js or wherever code is generated
function updateCode() {
  if (blockly.generatorType == 'arduino') {
    var code = arduino_generator.genCode();
    // Display Arduino code
    pythonPanel.editor.setValue(code);
    pythonPanel.editor.session.setMode("ace/mode/c_cpp");
  } else {
    var code = ev3dev2_generator.genCode();
    // Display Python code
    pythonPanel.editor.setValue(code);
    pythonPanel.editor.session.setMode("ace/mode/python");
  }
}
```

### Step 5: Add UI Toggle Button

Add a toggle button in the UI to switch between Python and Arduino modes. In [public/index.html](public/index.html):

```html
<div class="codeTypeSelector">
  <button id="pythonMode" class="active">Python</button>
  <button id="arduinoMode">Arduino</button>
</div>
```

And in your JavaScript (e.g., [public/js/main.js](public/js/main.js)):

```javascript
$('#pythonMode').click(function() {
  blockly.setGenerator('python');
  $('#pythonMode').addClass('active');
  $('#arduinoMode').removeClass('active');
  updateCode();
});

$('#arduinoMode').click(function() {
  blockly.setGenerator('arduino');
  $('#arduinoMode').addClass('active');
  $('#pythonMode').removeClass('active');
  updateCode();
});
```

### Step 6: Add Arduino Blocks to Toolbox

Create an Arduino-specific toolbox or add Arduino blocks to existing categories in [public/toolbox.xml](public/toolbox.xml):

```xml
<category name="Arduino Movement" colour="230">
  <block type="arduino_move_forward">
    <value name="speed">
      <shadow type="math_number">
        <field name="NUM">200</field>
      </shadow>
    </value>
    <value name="duration">
      <shadow type="math_number">
        <field name="NUM">1000</field>
      </shadow>
    </value>
  </block>
  
  <block type="arduino_move_backward">
    <value name="speed">
      <shadow type="math_number">
        <field name="NUM">200</field>
      </shadow>
    </value>
    <value name="duration">
      <shadow type="math_number">
        <field name="NUM">1000</field>
      </shadow>
    </value>
  </block>
  
  <block type="arduino_turn_left">
    <value name="speed">
      <shadow type="math_number">
        <field name="NUM">200</field>
      </shadow>
    </value>
    <value name="duration">
      <shadow type="math_number">
        <field name="NUM">500</field>
      </shadow>
    </value>
  </block>
  
  <block type="arduino_turn_right">
    <value name="speed">
      <shadow type="math_number">
        <field name="NUM">200</field>
      </shadow>
    </value>
    <value name="duration">
      <shadow type="math_number">
        <field name="NUM">500</field>
      </shadow>
    </value>
  </block>
  
  <block type="arduino_stop_motors"></block>
  
  <block type="arduino_follow_line">
    <value name="threshold">
      <shadow type="math_number">
        <field name="NUM">500</field>
      </shadow>
    </value>
  </block>
</category>

<category name="Arduino Sensors" colour="190">
  <block type="arduino_get_distance"></block>
  <block type="arduino_line_sensor_left"></block>
  <block type="arduino_line_sensor_middle"></block>
  <block type="arduino_line_sensor_right"></block>
  <block type="arduino_battery_level"></block>
</category>

<category name="Arduino Actuators" colour="260">
  <block type="arduino_look_left"></block>
  <block type="arduino_look_right"></block>
  <block type="arduino_look_center"></block>
  <block type="arduino_open_claw"></block>
  <block type="arduino_close_claw"></block>
</category>

<category name="Arduino Sound & Light" colour="160">
  <block type="arduino_beep">
    <field name="pattern">1</field>
  </block>
  <block type="arduino_play_star_wars"></block>
  
  <block type="arduino_light_rgb">
    <value name="red">
      <shadow type="math_number"><field name="NUM">255</field></shadow>
    </value>
    <value name="green">
      <shadow type="math_number"><field name="NUM">0</field></shadow>
    </value>
    <value name="blue">
      <shadow type="math_number"><field name="NUM">0</field></shadow>
    </value>
    <value name="duration">
      <shadow type="math_number"><field name="NUM">1000</field></shadow>
    </value>
  </block>
</category>
```

## Example Usage

### Example 1: Simple Movement

**Blocks:**
```
when started
  arduino move forward speed 200 for 2000 ms
  arduino turn right speed 150 for 500 ms
  arduino move forward speed 200 for 1000 ms
  arduino stop motors
```

**Generated Arduino Code:**
```cpp
void loop() {
  // Program starts here
  car.moveForward(200, 2000);
  car.turnRight(150, 500);
  car.moveForward(200, 1000);
  car.stopMotors();
}
```

### Example 2: Line Following with Obstacle Avoidance

**Blocks:**
```
when started
  repeat forever
    if arduino get distance < 20 then
      arduino stop motors
      arduino beep pattern double
      arduino turn right speed 200 for 1000 ms
    else
      arduino follow line with threshold 500
```

**Generated Arduino Code:**
```cpp
void loop() {
  // Program starts here
  while (true) {
    if (car.getDistanceToObstacle() < 20) {
      car.stopMotors();
      car.beep(2);
      car.turnRight(200, 1000);
    } else {
      car.followLine(500);
    }
  }
}
```

### Example 3: RGB LED Color Sequence

**Blocks:**
```
when started
  repeat 3 times
    arduino light RGB LED red 255 green 0 blue 0 for 500 ms
    arduino light RGB LED red 0 green 255 blue 0 for 500 ms
    arduino light RGB LED red 0 green 0 blue 255 for 500 ms
```

**Generated Arduino Code:**
```cpp
void loop() {
  // Program starts here
  for (int i = 0; i <= 3; i += 1) {
    car.lightRGBForDuration(CRGB(255, 0, 0), 500);
    car.lightRGBForDuration(CRGB(0, 255, 0), 500);
    car.lightRGBForDuration(CRGB(0, 0, 255), 500);
  }
}
```

## Block to Arduino Mapping

| Block Type | CarControl Method | Description |
|------------|-------------------|-------------|
| `arduino_move_forward` | `car.moveForward(speed, duration)` | Move forward |
| `arduino_move_backward` | `car.moveBackward(speed, duration)` | Move backward |
| `arduino_turn_left` | `car.turnLeft(speed, duration)` | Turn left |
| `arduino_turn_right` | `car.turnRight(speed, duration)` | Turn right |
| `arduino_stop_motors` | `car.stopMotors()` | Stop all motors |
| `arduino_follow_line` | `car.followLine(threshold)` | Follow line |
| `arduino_get_distance` | `car.getDistanceToObstacle()` | Read ultrasonic |
| `arduino_line_sensor_left` | `car.getLineSensorLeft()` | Read left sensor |
| `arduino_line_sensor_middle` | `car.getLineSensorMiddle()` | Read middle sensor |
| `arduino_line_sensor_right` | `car.getLineSensorRight()` | Read right sensor |
| `arduino_look_left` | `car.lookLeft()` | Turn sensor left |
| `arduino_look_right` | `car.lookRight()` | Turn sensor right |
| `arduino_look_center` | `car.centerServo()` | Center sensor |
| `arduino_open_claw` | `car.openClaw()` | Open claw |
| `arduino_close_claw` | `car.closeClaw()` | Close claw |
| `arduino_beep` | `car.beep(pattern)` | Play beep |
| `arduino_play_star_wars` | `car.playStarWars()` | Play theme |
| `arduino_light_rgb` | `car.lightRGBForDuration(color, duration)` | Light LED |
| `arduino_battery_level` | `car.getBatteryLevel()` | Get battery % |

## CarControl Pin Configuration

The generated code uses these default pin assignments (matching your library):

```cpp
// Motor control pins
#define PWMA 5
#define PWMB 6
#define AIN 7
#define BIN 8
#define STBY 3
#define MODE_SWITCH 2

// Sensor pins
#define TRIG_PIN 13        // Ultrasonic trigger
#define ECHO_PIN 12        // Ultrasonic echo
#define IR_SENSOR_PIN A0   // Infrared sensor
#define SERVO_PIN 10       // Sensor servo
#define BUZZER_PIN 11      // Buzzer
#define CLAW_SERVO_PIN 9   // Claw servo

// Line sensors
#define RIGHT_SENSOR_PIN A0
#define MIDDLE_SENSOR_PIN A1
#define LEFT_SENSOR_PIN A2
```

## Testing the Generated Code

1. **Copy the generated Arduino code** from the Python/Arduino tab
2. **Open Arduino IDE**
3. **Create a new sketch**
4. **Paste the generated code**
5. **Install required libraries:**
   - CarControl (your custom library)
   - FastLED
   - Ultrasonic
   - Servo (built-in)
6. **Upload to your Arduino board**
7. **Test the robot!**

## Troubleshooting

### Code Won't Compile

**Issue:** Missing library includes
```
Solution: Install CarControl library and dependencies
```

**Issue:** Pin conflicts
```
Solution: Adjust pin definitions in generated code header
```

### Blocks Not Appearing

**Issue:** Arduino blocks not in toolbox
```
Solution: Add arduinoBlocks.json to loadCustomBlocks function
```

**Issue:** Generator not loaded
```
Solution: Verify arduino_generator.js is included in index.html
```

### Generated Code Not Updating

**Issue:** Still showing Python code
```
Solution: Call blockly.setGenerator('arduino') before generating
```

## Advanced Customization

### Adding New Arduino Blocks

1. **Define block** in `arduinoBlocks.json`:
```json
{
  "type": "arduino_my_function",
  "message0": "do my thing %1",
  "args0": [{"type": "input_value", "name": "param", "check": "Number"}],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 230
}
```

2. **Add generator** in `arduino_generator.js`:
```javascript
'arduino_my_function': function(block) {
  var param = Blockly.Arduino.valueToCode(block, 'param', Blockly.Arduino.ORDER_ATOMIC);
  return '  car.myFunction(' + param + ');\n';
},
```

3. **Implement in CarControl library**:
```cpp
void CarControl::myFunction(int param) {
  // Your implementation
}
```

### Customizing Pin Definitions

Edit the pin definitions in `arduino_generator.js` `genCode()` function to match your hardware setup.

## Benefits of Arduino Code Generation

✅ **Real Hardware:** Upload code to actual Arduino robots
✅ **CarControl Integration:** Direct support for your library
✅ **Visual Programming:** Use blocks to create Arduino code
✅ **Educational:** Learn both blocks and C++ simultaneously
✅ **Portable:** Code works on physical robots
✅ **No Simulation Limits:** Real sensors and motors

## Next Steps

1. Test the integration in the simulator
2. Generate Arduino code from blocks
3. Upload to your Arduino robot
4. Create custom blocks for advanced features
5. Share your robot programs!

Happy Arduino coding! 🤖
