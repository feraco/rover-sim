# Gears Simulator - Developer Guide

## Overview
Gears is a web-based educational robotics simulator that allows users to program a virtual EV3 robot using either Blockly (block-based) or Python code. The simulator features a physics engine, 3D rendering, and real-time code execution.

## Architecture

### Core Components

#### 1. **Blockly Integration** ([blockly.js](public/js/blockly.js))
- Manages the Blockly workspace for block-based programming
- Loads custom block definitions from `customBlocks.json`
- Handles two workspaces: a hidden workspace (actual code) and a displayed workspace (UI)
- Mirrors changes between workspaces for UI optimization

**Key Functions:**
- `init()` - Initializes Blockly and loads necessary scripts
- `loadToolBox()` - Loads the block toolbox from toolbox.xml
- `loadCustomBlocks()` - Loads custom block definitions
- `mirrorEvent()` - Syncs hidden and displayed workspaces

#### 2. **Python Code Generation** ([ev3dev2_generator.js](public/js/ev3dev2_generator.js))
- Converts Blockly blocks to Python code
- Generates ev3dev2-compatible Python code
- Auto-detects connected sensors and motors
- Creates appropriate imports and initialization code

**Key Functions:**
- `genCode()` - Main function that converts blocks to Python
- `generators` - Object containing code generators for each block type
- `getPort()` - Maps auto ports to sensor/motor positions

#### 3. **Python Execution** ([simPython.js](public/js/simPython.js))
- Implements the ev3dev2 Python API using Skulpt
- Provides virtual sensor and motor classes
- Bridges Python code to the JavaScript simulator

**Available Classes:**
- `Motor` - Controls motors and wheels
- `ColorSensor` - Reads colors from the environment
- `GyroSensor` - Provides orientation data
- `GPSSensor` - Provides position data
- `UltrasonicSensor` - Measures distances
- `Pen` - Draws on the surface

#### 4. **Physics & Rendering** ([babylon.js](public/js/babylon.js))
- Uses Babylon.js for 3D rendering
- Uses Ammo.js (Bullet physics) for physics simulation
- Manages the robot, world, and physics interactions

#### 5. **Robot Management** ([Robot.js](public/js/Robot.js))
- Defines robot configuration and sensors
- Manages robot components (wheels, sensors, actuators)
- Handles robot initialization and updates

## How It All Works Together

### Code Flow: Blocks → Python → Execution

```
User Creates Blocks
        ↓
    blockly.js (Blockly Workspace)
        ↓
    ev3dev2_generator.js (Code Generation)
        ↓
    Python Code String
        ↓
    skulpt.js (Python Interpreter)
        ↓
    simPython.js (Virtual Hardware API)
        ↓
    Robot.js (Robot Control)
        ↓
    babylon.js (Physics & Rendering)
```

### 1. **Block Definition** (customBlocks.json)
Blocks are defined in JSON format with:
- Type, message, arguments, colors
- Tooltips and help URLs
- Block connections (previous, next, inputs)

Example:
```json
{
  "type": "move_tank",
  "message0": "move tank left %1 right %2 %3",
  "args0": [
    {"type": "input_value", "name": "left", "check": "Number"},
    {"type": "input_value", "name": "right", "check": "Number"},
    {"type": "field_dropdown", "name": "units", "options": [...]}
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 230
}
```

### 2. **Code Generation** (ev3dev2_generator.js)
Each block has a corresponding generator function:

```javascript
'move_tank': function(block) {
  var value_left = Blockly.Python.valueToCode(block, 'left', ...);
  var value_right = Blockly.Python.valueToCode(block, 'right', ...);
  var code = 'tank_drive.on(' + value_left + ', ' + value_right + ')\n';
  return code;
}
```

### 3. **Python Execution** (simPython.js)
The generated Python code is executed by Skulpt, which calls JavaScript implementations:

```javascript
mod.Motor = Sk.misceval.buildClass(mod, function($gbl, $loc) {
  $loc.__init__ = new Sk.builtin.func(function(self, address) {
    // Get the actual motor from robot
    self.motor = robot.getComponentByPort(address.v);
  });
  
  $loc.command = new Sk.builtin.func(function(self, command) {
    // Execute motor commands
    if (command.v == 'run-forever') {
      self.motor.runForever();
    }
  });
});
```

## File Structure

```
public/
├── index.html                    # Main HTML page
├── customBlocks.json            # Block definitions
├── toolbox.xml                  # Blockly toolbox structure
├── js/
│   ├── main.js                  # Application initialization
│   ├── blockly.js               # Blockly workspace management
│   ├── blocklyPanel.js          # Blockly UI panel
│   ├── ev3dev2_generator.js     # Block → Python converter
│   ├── pybricks_generator.js    # Alternative Python API
│   ├── simPython.js             # Python API implementation
│   ├── skulpt.js                # Python interpreter wrapper
│   ├── Robot.js                 # Robot class
│   ├── babylon.js               # 3D rendering & physics
│   ├── simPanel.js              # Simulation UI panel
│   └── pythonPanel.js           # Python editor panel
├── ev3dev2/                     # ev3dev2 Python library
├── pybricks/                    # Pybricks Python library
└── blockly-9.0.0/              # Blockly library
```

## Adding Custom Blocks

### Step 1: Define the Block (customBlocks.json)
Add your block definition:

```json
{
  "type": "my_custom_block",
  "message0": "do something %1",
  "args0": [
    {
      "type": "input_value",
      "name": "value",
      "check": "Number"
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 65,
  "tooltip": "Does something cool",
  "helpUrl": ""
}
```

### Step 2: Add to Toolbox (toolbox.xml)
Add the block to the appropriate category:

```xml
<category name="Movement" colour="230">
  <block type="my_custom_block">
    <value name="value">
      <shadow type="math_number">
        <field name="NUM">100</field>
      </shadow>
    </value>
  </block>
</category>
```

### Step 3: Create Python Generator (ev3dev2_generator.js)
Add a generator function in the `generators` object:

```javascript
'my_custom_block': function(block) {
  var value = Blockly.Python.valueToCode(block, 'value', Blockly.Python.ORDER_ATOMIC);
  var code = 'my_function(' + value + ')\n';
  return code;
},
```

### Step 4: Implement Python Function (simPython.js)
If you need a custom Python function, add it to simPython.js:

```javascript
mod.my_function = new Sk.builtin.func(function(value) {
  // Your JavaScript implementation
  console.log('Value:', value.v);
  // Interact with robot or environment
  robot.doSomething(value.v);
});
```

## Building and Running

### Local Development

1. **Start the web server:**
   ```bash
   cd public
   python3 -m http.server 1337
   ```

2. **Open in browser:**
   ```
   http://127.0.0.1:1337
   ```

### No Build Process Required!
The simulator runs entirely in the browser - no compilation or build step needed. All resources are loaded directly by the HTML page.

## Debugging

### Blockly Debugging
- Open browser DevTools (F12)
- Check console for Blockly errors
- Use `blockly.workspace.getAllBlocks()` in console to inspect blocks
- Use `Blockly.Python.workspaceToCode(blockly.workspace)` to see generated code

### Python Code Debugging
- Generated Python code is shown in the Python tab
- Console.log statements in simPython.js will appear in browser console
- Use try-catch blocks in Python code generators

### Common Issues

1. **Block not appearing in toolbox:**
   - Check that block type in customBlocks.json matches toolbox.xml
   - Verify block is in a visible category
   - Clear browser cache and reload

2. **Code generation fails:**
   - Ensure generator function exists in ev3dev2_generator.js
   - Check that generator function name matches block type exactly
   - Verify all required inputs are handled

3. **Python execution errors:**
   - Check that all used Python functions are implemented in simPython.js
   - Verify sensor/motor types match what's configured on robot
   - Look for typos in port names (INPUT_1, OUTPUT_A, etc.)

## Key Concepts

### Blockly Workspaces
Two workspaces exist:
- **Hidden Workspace** (`blockly.workspace`): Stores actual block data
- **Displayed Workspace** (`blockly.displayedWorkspace`): Shown to user
- Changes mirror between them for performance

### Code Generation Order
1. Block values are evaluated recursively
2. Inner blocks generate code first (bottom-up)
3. Final code string is built from generated fragments
4. Header code (imports, initialization) is prepended

### Python-to-JavaScript Bridge
- Skulpt executes Python code in JavaScript
- Custom modules ($builtinmodule) provide hardware access
- Sk.ffi.remapToPy() converts JS → Python
- .v property accesses Python values from JS

## Testing Your Changes

1. **Modify code in appropriate file**
2. **Refresh browser** (Ctrl+R or Cmd+R)
3. **Test in simulator:**
   - Create blocks or write Python code
   - Click Run button
   - Observe robot behavior
   - Check console for errors

## Integration Points

### Blockly ↔ Python Generator
- `ev3dev2_generator.js` reads blocks from `blockly.workspace`
- Each block type has a generator function
- Generators return Python code strings

### Python ↔ Simulator
- `skulpt.js` executes Python code
- `simPython.js` provides Python API implementations
- Functions call `Robot.js` methods to control robot
- `babylon.js` renders results

### UI ↔ Core
- `blocklyPanel.js` manages Blockly UI
- `pythonPanel.js` manages Python editor
- `simPanel.js` manages simulation controls
- `main.js` coordinates everything

## Advanced Topics

### Custom Sensors
1. Define sensor component in `robotComponents.js`
2. Add to robot template in `robotTemplates.js`
3. Implement Python class in `simPython.js`
4. Create blocks and generators

### Custom Worlds
1. Create world file in `js/worlds/`
2. Extend World_Base class
3. Define obstacles, textures, starting position
4. Register world in worlds menu

### Multi-language Support
- Strings use `i18n.get('#key#')` format
- Translations in `js/msg.js`
- Block text supports `#blk-key#` format
- Add new languages in language menu

## Resources

- **Blockly Documentation:** https://developers.google.com/blockly
- **Babylon.js Documentation:** https://doc.babylonjs.com/
- **Skulpt Documentation:** https://skulpt.org/docs/
- **ev3dev2 API:** https://ev3dev-lang.readthedocs.io/

## Summary

The Gears simulator seamlessly integrates Blockly and Python through a well-structured pipeline:

1. **Blockly** provides the visual programming interface
2. **Generators** convert blocks to Python code
3. **Skulpt** executes Python in the browser
4. **Virtual API** bridges Python to JavaScript
5. **Robot & Physics** simulate real hardware
6. **3D Rendering** visualizes everything

All components work together in real-time in the browser without any server-side processing or compilation!
