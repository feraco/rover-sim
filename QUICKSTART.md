# Quick Start Guide - Gears Simulator

## Getting Started in 5 Minutes

### 1. Run the Simulator

```bash
cd public
python3 -m http.server 1337
```

Open your browser to: `http://127.0.0.1:1337`

That's it! The simulator is now running.

### 2. Create Your First Program

**Using Blocks:**
1. Click on "Blocks" tab
2. Drag blocks from the left toolbox
3. Connect them like puzzle pieces
4. Click the "Run" button to execute

**Using Python:**
1. Click on "Python" tab
2. Write or edit Python code
3. Click "Run" to execute

### 3. Try This Example

**Block Version:**
1. Drag "when started" block (Starting category)
2. Add "move tank" block below it (Movement category)
3. Set left speed to 50, right speed to 50
4. Add "sleep for" block (Starting category), set to 2 seconds
5. Add "stop moving" block (Movement category)
6. Click Run!

**Python Version:**
```python
#!/usr/bin/env python3

from ev3dev2.motor import *

motorA = LargeMotor(OUTPUT_A)
motorB = LargeMotor(OUTPUT_B)
tank_drive = MoveTank(OUTPUT_A, OUTPUT_B)

# Move forward for 2 seconds
tank_drive.on(50, 50)
time.sleep(2)
tank_drive.stop()
```

### 4. Understanding the Interface

**Left Panel:**
- **Blocks Tab:** Visual block-based programming
- **Python Tab:** Text-based Python programming

**Right Panel:**
- **Sim Tab:** 3D simulation view
- **Sensors Tab:** View sensor readings
- **Configurator Tab:** Configure robot

**Top Menu:**
- **File:** Save/Load programs and robots
- **Robot:** Change robot configuration
- **Worlds:** Select different challenge worlds
- **Help:** Documentation and tutorials

## How Blocks Become Python

When you use blocks, they automatically convert to Python code:

**Block:**
```
[move tank left 50 right 50]
```

**Converts to Python:**
```python
tank_drive.on(50, 50)
```

Click the "Python" tab to see the generated code!

## Switching Between Blocks and Python

You can:
- ✅ Create blocks → See generated Python (automatic)
- ✅ Edit Python directly
- ❌ Edit Python → Convert back to blocks (not supported)

**Tip:** Start with blocks to learn, then switch to Python for advanced features!

## Robot Configuration

### Available Sensors:
- **Color Sensor:** Detects colors on the ground
- **Ultrasonic Sensor:** Measures distance to objects
- **Gyro Sensor:** Measures rotation and tilt
- **GPS Sensor:** Tracks position (x, y)
- **Touch Sensor:** Detects contact
- **Camera Sensor:** Detects objects

### Available Actuators:
- **Wheels:** Drive motors (OUTPUT_A, OUTPUT_B)
- **Additional Motors:** OUTPUT_C, OUTPUT_D, etc.
- **Magnet:** Pick up magnetic objects
- **Pen:** Draw on the surface

## Available Worlds

- **Grid:** Simple practice area
- **Line Following:** Follow a black line
- **Maze:** Navigate through a maze
- **Sumo:** Robot sumo wrestling
- **Fire Rescue:** Find and rescue objects
- **FLL Missions:** First Lego League challenges
- **Custom:** Load your own worlds

## Common Python Patterns

### Moving Forward
```python
tank_drive.on(50, 50)  # Both wheels at 50%
time.sleep(2)
tank_drive.stop()
```

### Turning
```python
tank_drive.on(30, -30)  # Left forward, right backward
time.sleep(1)
tank_drive.stop()
```

### Using Color Sensor
```python
color_sensor_in1 = ColorSensor(INPUT_1)
rgb = color_sensor_in1.value()
print(rgb)  # Shows [R, G, B] values
```

### Using Ultrasonic Sensor
```python
ultrasonic_sensor_in2 = UltrasonicSensor(INPUT_2)
distance = ultrasonic_sensor_in2.distance_centimeters
print(distance)
```

### Using Gyro Sensor
```python
gyro_sensor_in3 = GyroSensor(INPUT_3)
angle = gyro_sensor_in3.heading(False)
print(angle)
```

### Line Following Example
```python
color_sensor = ColorSensor(INPUT_1)
tank_drive = MoveTank(OUTPUT_A, OUTPUT_B)

while True:
    rgb = color_sensor.value()
    brightness = sum(rgb) / 3
    
    if brightness < 50:  # On black line
        tank_drive.on(30, 30)  # Go straight
    else:  # Off line
        tank_drive.on(30, -10)  # Turn left
```

## Keyboard Shortcuts

- **Ctrl+S / Cmd+S:** Save program
- **Ctrl+R / Cmd+R:** Reload page
- **Delete:** Delete selected block

## Troubleshooting

### Robot Not Moving
- Check that motors are on OUTPUT_A and OUTPUT_B
- Verify code has `tank_drive.on()` commands
- Make sure you clicked "Run" button

### Sensor Not Working
- Verify sensor is connected to correct INPUT port
- Check robot configuration (Configurator tab)
- Ensure sensor variable name matches port

### Code Error
- Check console (F12 → Console tab)
- Look for red error messages
- Verify all parentheses and quotes match

### Blocks Not Generating Code
- Make sure blocks are connected to "when started"
- Check that blocks are properly snapped together
- Try refreshing the page

## Next Steps

1. **Try the tutorials** in the Help menu
2. **Experiment with different worlds**
3. **Create custom robot configurations**
4. **Challenge yourself with FLL missions**
5. **Share your programs** with others (File → Save)

## Need Help?

- Check the main README.md for more info
- Read DEVELOPER_GUIDE.md for advanced topics
- Visit: https://gears.aposteriori.com.sg

Happy coding! 🤖
