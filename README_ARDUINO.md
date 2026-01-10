# 🤖 Gears Simulator - Arduino CarControl Edition

## What's New? 

The Gears simulator now generates **Arduino C++ code** for your **CarControl library**! 

Design robot programs visually with blocks, then upload directly to Arduino hardware.

---

## 🎯 What You Can Do

✅ **Visual Programming** - Drag and drop blocks to create programs  
✅ **Dual Output** - Generate Python OR Arduino C++ code  
✅ **Real Hardware** - Upload to Arduino boards with CarControl  
✅ **Full CarControl Support** - All library functions available as blocks  
✅ **Educational** - See how blocks convert to real code  

---

## 📚 Documentation

### Quick Start
- **[QUICKSTART.md](QUICKSTART.md)** - Get started in 5 minutes (simulator basics)
- **[ARDUINO_QUICK_REFERENCE.md](ARDUINO_QUICK_REFERENCE.md)** - Arduino block reference with examples

### Integration
- **[ARDUINO_INTEGRATION.md](ARDUINO_INTEGRATION.md)** - How to integrate Arduino generator
- **[ARDUINO_IMPLEMENTATION_SUMMARY.md](ARDUINO_IMPLEMENTATION_SUMMARY.md)** - What was created and why
- **[ARDUINO_ARCHITECTURE.md](ARDUINO_ARCHITECTURE.md)** - System architecture diagrams

### Advanced
- **[DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)** - Complete technical documentation
- **[CUSTOM_BLOCKS_TUTORIAL.md](CUSTOM_BLOCKS_TUTORIAL.md)** - Create your own blocks

---

## 🚀 Quick Start: Arduino Mode

### 1. Run the Simulator
```bash
cd public
python3 -m http.server 1337
```
Open: `http://127.0.0.1:1337`

### 2. Create a Program with Arduino Blocks

**Example: Move in a Square**
```
when started
  repeat 4 times
    arduino move forward speed 200 for 2000 ms
    arduino turn right speed 180 for 500 ms
  arduino stop motors
```

### 3. Generated Arduino Code
```cpp
#include <CarControl.h>

CarControl car(PWMA, PWMB, AIN, BIN, STBY, MODE_SWITCH);

void setup() {
  Serial.begin(9600);
  car.setup();
  car.attachSensorServo(SERVO_PIN);
  car.attachBuzzer(BUZZER_PIN);
  car.initLineSensors();
  delay(1000);
}

void loop() {
  for (int i = 0; i <= 4; i += 1) {
    car.moveForward(200, 2000);
    car.turnRight(180, 500);
  }
  car.stopMotors();
}
```

### 4. Upload to Arduino
1. Copy the generated code
2. Open Arduino IDE
3. Paste and upload
4. Watch your robot move!

---

## 📦 Available Arduino Blocks

### Movement
- Move Forward/Backward
- Turn Left/Right
- Stop Motors
- Follow Line

### Sensors
- Get Distance (Ultrasonic)
- Line Sensors (Left, Middle, Right)
- Battery Level

### Actuators
- Servo Control (Look Left/Right/Center)
- Claw Control (Open/Close)

### Output
- Beep Patterns
- Play Star Wars Theme
- RGB LED Control

### Standard Programming
- If/Else conditions
- Loops (repeat, while, for)
- Variables
- Math operations
- Logic operations

---

## 🎓 Example Programs

### Obstacle Avoidance
```
when started
  repeat forever
    if arduino get distance < 20 then
      arduino stop motors
      arduino beep pattern double
      arduino turn right speed 200 for 1000 ms
    else
      arduino move forward speed 200 for 100 ms
```

### Line Following
```
when started
  repeat forever
    arduino follow line with threshold 500
```

### Pick and Place
```
when started
  arduino move forward speed 200 for 2000 ms
  arduino open claw
  delay 500 ms
  arduino move forward speed 150 for 500 ms
  arduino close claw
  arduino beep pattern single
  arduino move backward speed 200 for 1000 ms
```

---

## 🔧 Integration Steps

### Add Arduino Generator to Simulator

**1. Add script to [index.html](public/index.html):**
```html
<script src="js/arduino_generator.js"></script>
```

**2. Load Arduino blocks in [blockly.js](public/js/blockly.js):**
```javascript
// In loadCustomBlocks():
return fetch('arduinoBlocks.json')
  .then(response => response.text())
  .then(function(response) {
    let json = JSON.parse(response);
    Blockly.defineBlocksWithJsonArray(json);
  });
```

**3. Initialize generator:**
```javascript
arduino_generator.load();
```

**4. Generate code:**
```javascript
var arduinoCode = arduino_generator.genCode();
```

See **[ARDUINO_INTEGRATION.md](ARDUINO_INTEGRATION.md)** for complete instructions.

---

## 📁 New Files

| File | Purpose |
|------|---------|
| `public/js/arduino_generator.js` | Arduino C++ code generator |
| `public/arduinoBlocks.json` | Arduino-specific block definitions |
| `ARDUINO_INTEGRATION.md` | Integration guide |
| `ARDUINO_QUICK_REFERENCE.md` | Block reference |
| `ARDUINO_IMPLEMENTATION_SUMMARY.md` | Implementation overview |
| `ARDUINO_ARCHITECTURE.md` | System architecture |

---

## 🔄 Python vs Arduino Mode

| Feature | Python Mode | Arduino Mode |
|---------|-------------|--------------|
| **Output** | Python code | Arduino C++ |
| **Target** | Virtual robot | Physical robot |
| **Execution** | Browser simulation | Arduino board |
| **API** | ev3dev2 | CarControl |
| **Testing** | Instant | Upload required |
| **Use Case** | Learn & test | Deploy & run |

---

## 🎯 CarControl Library Support

All CarControl methods are supported:

✅ Movement: `moveForward()`, `moveBackward()`, `turnLeft()`, `turnRight()`, `stopMotors()`  
✅ Line Following: `followLine()`, `getLineSensorLeft/Middle/Right()`  
✅ Sensors: `getDistanceToObstacle()`, `getBatteryLevel()`  
✅ Servos: `lookLeft()`, `lookRight()`, `centerServo()`  
✅ Claw: `openClaw()`, `closeClaw()`  
✅ Sound: `beep()`, `playStarWars()`  
✅ LED: `lightRGBForDuration()`  

---

## 🏆 Benefits

### For Students
- Learn programming visually with blocks
- See generated C++ code immediately
- Deploy programs to real robots
- Understand block-to-code conversion

### For Educators
- Teach visual AND text programming
- Bridge simulation and physical computing
- Use existing CarControl library
- Support various learning styles

### For Developers
- Extend with custom blocks
- Integrate with Arduino IDE
- Map any CarControl function
- Full source code available

---

## 📖 Complete Documentation Index

### Getting Started
1. [README.md](README.md) - Original Gears documentation
2. [QUICKSTART.md](QUICKSTART.md) - 5-minute simulator guide
3. [ARDUINO_QUICK_REFERENCE.md](ARDUINO_QUICK_REFERENCE.md) - Arduino blocks & examples

### Arduino Integration
4. [ARDUINO_INTEGRATION.md](ARDUINO_INTEGRATION.md) - Full integration guide
5. [ARDUINO_IMPLEMENTATION_SUMMARY.md](ARDUINO_IMPLEMENTATION_SUMMARY.md) - What's included
6. [ARDUINO_ARCHITECTURE.md](ARDUINO_ARCHITECTURE.md) - Visual architecture

### Advanced Topics
7. [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) - Technical deep dive
8. [CUSTOM_BLOCKS_TUTORIAL.md](CUSTOM_BLOCKS_TUTORIAL.md) - Create custom blocks

---

## 🛠️ Requirements

### Simulator (Browser)
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Python 3 (for local web server)
- No build process required!

### Arduino Deployment
- Arduino IDE
- Arduino board (Uno, Mega, etc.)
- CarControl library installed
- FastLED library
- Ultrasonic library
- Servo library (built-in)

---

## 🤝 Credits

**Original Gears Simulator:**
- Created by [A Posteriori](https://aposteriori.com.sg)
- Contributors: Steven Murray, humbug99, Yuvix25, and many others

**Arduino Integration:**
- Arduino code generator
- CarControl library support
- Custom Arduino blocks

**Built with:**
- Blockly (Google)
- Babylon.js (3D rendering)
- Skulpt (Python in browser)
- ACE Editor
- FastLED (LED control)

---

## 📜 License

GNU General Public License v3.0

---

## 🎉 Get Started Now!

1. **Start the simulator:**
   ```bash
   cd public && python3 -m http.server 1337
   ```

2. **Open in browser:**
   ```
   http://127.0.0.1:1337
   ```

3. **Create blocks → Generate Arduino code → Upload to robot!**

---

## 📞 Need Help?

- Read the **[ARDUINO_INTEGRATION.md](ARDUINO_INTEGRATION.md)** guide
- Check **[ARDUINO_QUICK_REFERENCE.md](ARDUINO_QUICK_REFERENCE.md)** for examples
- Review **[DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)** for technical details
- See **CarControl.h** for library API reference

---

**Happy Robot Programming!** 🤖✨

*Design visually. Generate code. Deploy to hardware.*
