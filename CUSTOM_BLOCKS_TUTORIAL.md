# Adding Custom Blocks - Step by Step Example

This guide shows you how to add a custom block to the Gears simulator. We'll create a "spiral drive" block that makes the robot drive in a spiral pattern.

## Example: Creating a "Spiral Drive" Block

### Step 1: Add Block Definition to customBlocks.json

Open `public/customBlocks.json` and add this block definition to the array:

```json
{
  "type": "spiral_drive",
  "message0": "drive in spiral for %1 seconds with starting speed %2",
  "args0": [
    {
      "type": "input_value",
      "name": "duration",
      "check": "Number"
    },
    {
      "type": "input_value",
      "name": "speed",
      "check": "Number"
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 230,
  "tooltip": "Makes the robot drive in an expanding spiral",
  "helpUrl": ""
}
```

**Explanation:**
- `type`: Unique identifier for the block
- `message0`: Display text with %1, %2 for inputs
- `args0`: Defines the inputs (two numbers in this case)
- `previousStatement` / `nextStatement`: Allows stacking blocks
- `colour`: Block color (HSV hue value)

### Step 2: Add Block to Toolbox

Open `public/toolbox.xml` and find the Movement category (around line 50-100). Add your block:

```xml
<category name="Movement" colour="230">
  <!-- Existing blocks here -->
  
  <block type="spiral_drive">
    <value name="duration">
      <shadow type="math_number">
        <field name="NUM">5</field>
      </shadow>
    </value>
    <value name="speed">
      <shadow type="math_number">
        <field name="NUM">30</field>
      </shadow>
    </value>
  </block>
</category>
```

**Explanation:**
- The `<shadow>` blocks provide default values
- Users can replace them with variable blocks or calculations

### Step 3: Add Python Code Generator

Open `public/js/ev3dev2_generator.js` and find the `generators` object (around line 140). Add your generator:

```javascript
'spiral_drive': function(block) {
  var duration = Blockly.Python.valueToCode(block, 'duration', Blockly.Python.ORDER_ATOMIC);
  var speed = Blockly.Python.valueToCode(block, 'speed', Blockly.Python.ORDER_ATOMIC);
  
  var code = 
    '# Spiral drive\n' +
    'start_time = time.time()\n' +
    'while time.time() - start_time < ' + duration + ':\n' +
    '    elapsed = time.time() - start_time\n' +
    '    progress = elapsed / ' + duration + '\n' +
    '    left_speed = ' + speed + ' * (1 + progress)\n' +
    '    right_speed = ' + speed + '\n' +
    '    tank_drive.on(left_speed, right_speed)\n' +
    '    time.sleep(0.05)\n' +
    'tank_drive.stop()\n';
  
  return code;
},
```

**Explanation:**
- Gets input values from the block
- Generates Python code as a string
- Code gradually increases left wheel speed to create spiral
- Returns the complete code with proper indentation

### Step 4: Test Your Block

1. **Refresh the browser** (Ctrl+R / Cmd+R)
2. **Open the Movement category** in the blocks toolbox
3. **Drag your "spiral drive" block** to the workspace
4. **Connect it** below a "when started" block
5. **Click Run** and watch the robot spiral!

## More Complex Example: Block with Dropdown Menu

Let's add a "dance move" block with selectable patterns:

### customBlocks.json:
```json
{
  "type": "dance_move",
  "message0": "perform dance move %1 at speed %2",
  "args0": [
    {
      "type": "field_dropdown",
      "name": "pattern",
      "options": [
        ["spin left", "SPIN_LEFT"],
        ["spin right", "SPIN_RIGHT"],
        ["zigzag", "ZIGZAG"],
        ["square", "SQUARE"]
      ]
    },
    {
      "type": "input_value",
      "name": "speed",
      "check": "Number"
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 230,
  "tooltip": "Makes the robot perform a dance move",
  "helpUrl": ""
}
```

### ev3dev2_generator.js:
```javascript
'dance_move': function(block) {
  var pattern = block.getFieldValue('pattern');
  var speed = Blockly.Python.valueToCode(block, 'speed', Blockly.Python.ORDER_ATOMIC);
  
  var code = '';
  
  if (pattern == 'SPIN_LEFT') {
    code = 
      'tank_drive.on(' + speed + ', -' + speed + ')\n' +
      'time.sleep(2)\n' +
      'tank_drive.stop()\n';
  } else if (pattern == 'SPIN_RIGHT') {
    code = 
      'tank_drive.on(-' + speed + ', ' + speed + ')\n' +
      'time.sleep(2)\n' +
      'tank_drive.stop()\n';
  } else if (pattern == 'ZIGZAG') {
    code = 
      'for i in range(4):\n' +
      '    tank_drive.on(' + speed + ', ' + speed + ' * 0.5)\n' +
      '    time.sleep(0.5)\n' +
      '    tank_drive.on(' + speed + ' * 0.5, ' + speed + ')\n' +
      '    time.sleep(0.5)\n' +
      'tank_drive.stop()\n';
  } else if (pattern == 'SQUARE') {
    code = 
      'for i in range(4):\n' +
      '    tank_drive.on(' + speed + ', ' + speed + ')\n' +
      '    time.sleep(1)\n' +
      '    tank_drive.on(' + speed + ', -' + speed + ')\n' +
      '    time.sleep(0.5)\n' +
      'tank_drive.stop()\n';
  }
  
  return code;
},
```

## Block with Multiple Inputs and Outputs

For blocks that return values (can be plugged into other blocks):

### customBlocks.json:
```json
{
  "type": "calculate_distance",
  "message0": "distance from (%1, %2) to (%3, %4)",
  "args0": [
    {"type": "input_value", "name": "x1", "check": "Number"},
    {"type": "input_value", "name": "y1", "check": "Number"},
    {"type": "input_value", "name": "x2", "check": "Number"},
    {"type": "input_value", "name": "y2", "check": "Number"}
  ],
  "output": "Number",
  "colour": 230,
  "tooltip": "Calculate distance between two points",
  "helpUrl": ""
}
```

### ev3dev2_generator.js:
```javascript
'calculate_distance': function(block) {
  var x1 = Blockly.Python.valueToCode(block, 'x1', Blockly.Python.ORDER_ATOMIC);
  var y1 = Blockly.Python.valueToCode(block, 'y1', Blockly.Python.ORDER_ATOMIC);
  var x2 = Blockly.Python.valueToCode(block, 'x2', Blockly.Python.ORDER_ATOMIC);
  var y2 = Blockly.Python.valueToCode(block, 'y2', Blockly.Python.ORDER_ATOMIC);
  
  var code = 'math.sqrt((' + x2 + ' - ' + x1 + ')**2 + (' + y2 + ' - ' + y1 + ')**2)';
  
  // Return [code, ORDER] for blocks that return values
  return [code, Blockly.Python.ORDER_FUNCTION_CALL];
},
```

**Note:** Blocks that return values use `output` instead of `previousStatement`/`nextStatement`, and generators must return `[code, ORDER]` tuple.

## Adding Custom Python Functions

If your block needs Python functions that don't exist in ev3dev2, add them to `public/js/simPython.js`:

```javascript
// Add at the end of the $builtinmodule function
mod.custom_spiral = new Sk.builtin.func(function(duration, start_speed) {
  return Sk.misceval.callsimOrSuspend(function() {
    // Your JavaScript implementation
    var dur = Sk.ffi.remapToJs(duration);
    var speed = Sk.ffi.remapToJs(start_speed);
    
    // Access the robot
    var startTime = Date.now();
    
    // Create animation loop
    var spiralLoop = function() {
      var elapsed = (Date.now() - startTime) / 1000;
      if (elapsed < dur) {
        var progress = elapsed / dur;
        var leftSpeed = speed * (1 + progress);
        var rightSpeed = speed;
        
        robot.leftWheel.runForever(leftSpeed);
        robot.rightWheel.runForever(rightSpeed);
        
        setTimeout(spiralLoop, 50);
      } else {
        robot.leftWheel.stop();
        robot.rightWheel.stop();
      }
    };
    
    spiralLoop();
  });
});
```

## Debugging Tips

### 1. Check Block Definition
- Open browser console (F12)
- Type: `Blockly.Blocks` to see all registered blocks
- Verify your block type appears

### 2. Check Generated Code
- Switch to Python tab
- Look for your block's generated code
- Check for syntax errors (quotes, parentheses, indentation)

### 3. Test Generator Function
```javascript
// In browser console
var myBlock = blockly.workspace.getBlockById('YOUR_BLOCK_ID');
ev3dev2_generator.generators.spiral_drive(myBlock);
```

### 4. Common Mistakes

❌ **Wrong:** Block type doesn't match generator name
```json
{"type": "spiral_drive"}
```
```javascript
'spiral_move': function(block) { ... }  // Wrong name!
```

✅ **Correct:** Names must match exactly
```json
{"type": "spiral_drive"}
```
```javascript
'spiral_drive': function(block) { ... }  // Correct!
```

❌ **Wrong:** Missing indentation in Python code
```javascript
var code = 
  'while True:\n' +
  'tank_drive.on(50, 50)\n';  // Should be indented!
```

✅ **Correct:** Proper Python indentation
```javascript
var code = 
  'while True:\n' +
  '    tank_drive.on(50, 50)\n';  // Properly indented
```

## Testing Checklist

- [ ] Block appears in toolbox
- [ ] Block can be dragged to workspace
- [ ] Block connects to other blocks properly
- [ ] Input fields accept values
- [ ] Generated Python code is syntactically correct
- [ ] Code executes without errors
- [ ] Robot behaves as expected

## Summary

To add a custom block:
1. ✏️ Define block in `customBlocks.json`
2. 🗂️ Add to toolbox in `toolbox.xml`
3. 🐍 Create generator in `ev3dev2_generator.js`
4. 🔄 Refresh browser
5. ✅ Test!

That's all there is to it! The simulator automatically integrates your custom blocks with the Python code generation system.
