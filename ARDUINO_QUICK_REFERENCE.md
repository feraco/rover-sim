# Arduino CarControl Quick Reference

## Block Examples with Generated Code

### 🚗 Basic Movement

#### Move Forward
**Block:** `arduino move forward speed 200 for 2000 ms`
```cpp
car.moveForward(200, 2000);
```

#### Move Backward
**Block:** `arduino move backward speed 150 for 1000 ms`
```cpp
car.moveBackward(150, 1000);
```

#### Turn Left
**Block:** `arduino turn left speed 180 for 500 ms`
```cpp
car.turnLeft(180, 500);
```

#### Turn Right
**Block:** `arduino turn right speed 180 for 500 ms`
```cpp
car.turnRight(180, 500);
```

#### Stop
**Block:** `arduino stop motors`
```cpp
car.stopMotors();
```

---

### 📡 Sensors

#### Get Distance
**Block:** `arduino get distance`
```cpp
int distance = car.getDistanceToObstacle();
```

#### Line Sensors
**Block:** `arduino left line sensor value`
```cpp
int leftValue = car.getLineSensorLeft();
```

**Block:** `arduino middle line sensor value`
```cpp
int middleValue = car.getLineSensorMiddle();
```

**Block:** `arduino right line sensor value`
```cpp
int rightValue = car.getLineSensorRight();
```

#### Battery Level
**Block:** `arduino battery level`
```cpp
float batteryLevel = car.getBatteryLevel();
```

---

### 🎯 Line Following

#### Follow Line
**Block:** `arduino follow line with threshold 500`
```cpp
car.followLine(500);
```

---

### 🔄 Servo Control

#### Look Left
**Block:** `arduino look left`
```cpp
car.lookLeft();
delay(500);
```

#### Look Right
**Block:** `arduino look right`
```cpp
car.lookRight();
delay(500);
```

#### Look Center
**Block:** `arduino look center`
```cpp
car.centerServo();
delay(500);
```

---

### 🦾 Claw Control

#### Open Claw
**Block:** `arduino open claw`
```cpp
car.openClaw();
delay(500);
```

#### Close Claw
**Block:** `arduino close claw`
```cpp
car.closeClaw();
delay(500);
```

---

### 🔊 Sound

#### Beep
**Block:** `arduino beep pattern single`
```cpp
car.beep(1);
```

**Block:** `arduino beep pattern double`
```cpp
car.beep(2);
```

#### Play Star Wars
**Block:** `arduino play Star Wars theme`
```cpp
car.playStarWars();
```

---

### 💡 RGB LED

#### Light RGB LED
**Block:** `arduino light RGB LED red 255 green 0 blue 0 for 1000 ms`
```cpp
car.lightRGBForDuration(CRGB(255, 0, 0), 1000);
```

**Common Colors:**
- Red: `(255, 0, 0)`
- Green: `(0, 255, 0)`
- Blue: `(0, 0, 255)`
- Yellow: `(255, 255, 0)`
- Purple: `(255, 0, 255)`
- Cyan: `(0, 255, 255)`
- White: `(255, 255, 255)`

---

## Complete Example Programs

### Example 1: Square Path
```cpp
void loop() {
  // Move in a square
  for (int i = 0; i <= 4; i += 1) {
    car.moveForward(200, 2000);
    car.turnRight(180, 500);
  }
  car.stopMotors();
}
```

### Example 2: Obstacle Avoidance
```cpp
void loop() {
  while (true) {
    if (car.getDistanceToObstacle() < 20) {
      car.stopMotors();
      car.beep(2);
      car.turnRight(200, 1000);
    } else {
      car.moveForward(200, 100);
    }
  }
}
```

### Example 3: Line Following
```cpp
void loop() {
  while (true) {
    car.followLine(500);
  }
}
```

### Example 4: Pick and Place
```cpp
void loop() {
  // Move to object
  car.moveForward(200, 2000);
  
  // Open claw
  car.openClaw();
  delay(500);
  
  // Move closer
  car.moveForward(150, 500);
  
  // Close claw
  car.closeClaw();
  delay(500);
  
  // Beep confirmation
  car.beep(1);
  
  // Move back
  car.moveBackward(200, 1000);
  
  // Turn around
  car.turnRight(180, 1000);
  
  // Move to drop zone
  car.moveForward(200, 3000);
  
  // Open claw
  car.openClaw();
  delay(500);
  
  // Stop
  car.stopMotors();
}
```

### Example 5: Sensor-Based Decision Making
```cpp
void loop() {
  // Read sensors
  int leftValue = car.getLineSensorLeft();
  int middleValue = car.getLineSensorMiddle();
  int rightValue = car.getLineSensorRight();
  int distance = car.getDistanceToObstacle();
  
  // Obstacle ahead
  if (distance < 15) {
    car.stopMotors();
    car.beep(2);
    car.lightRGBForDuration(CRGB(255, 0, 0), 500);
    car.turnRight(200, 1000);
  }
  // Line detected
  else if (middleValue < 500) {
    car.lightRGBForDuration(CRGB(0, 255, 0), 100);
    car.moveForward(200, 100);
  }
  // Turn left
  else if (leftValue < 500) {
    car.turnLeft(150, 50);
  }
  // Turn right
  else if (rightValue < 500) {
    car.turnRight(150, 50);
  }
  // No line detected
  else {
    car.lightRGBForDuration(CRGB(255, 255, 0), 100);
    car.stopMotors();
  }
}
```

### Example 6: Patrol Pattern with LED Feedback
```cpp
void loop() {
  // Patrol forward
  car.lightRGBForDuration(CRGB(0, 255, 0), 200);
  car.moveForward(200, 2000);
  
  // Look left
  car.lookLeft();
  delay(500);
  int leftDist = car.getDistanceToObstacle();
  
  // Look right
  car.lookRight();
  delay(500);
  int rightDist = car.getDistanceToObstacle();
  
  // Look center
  car.centerServo();
  delay(500);
  
  // Choose direction with more space
  if (leftDist > rightDist) {
    car.lightRGBForDuration(CRGB(0, 0, 255), 500);
    car.turnLeft(180, 500);
  } else {
    car.lightRGBForDuration(CRGB(255, 0, 255), 500);
    car.turnRight(180, 500);
  }
}
```

---

## Useful Code Patterns

### Repeat Forever
```cpp
while (true) {
  // Your code here
}
```

### Repeat N Times
```cpp
for (int i = 0; i < 10; i++) {
  // Repeats 10 times
}
```

### If-Else Decision
```cpp
if (car.getDistanceToObstacle() < 20) {
  // Close to obstacle
  car.stopMotors();
} else {
  // Path clear
  car.moveForward(200, 100);
}
```

### Multiple Conditions
```cpp
if (distance < 10) {
  // Very close
  car.moveBackward(200, 500);
} else if (distance < 20) {
  // Close
  car.stopMotors();
} else {
  // Far enough
  car.moveForward(200, 100);
}
```

### Wait Pattern
```cpp
delay(1000);  // Wait 1 second
delay(500);   // Wait 0.5 seconds
delay(100);   // Wait 0.1 seconds
```

---

## Pin Reference

### Motor Pins
- PWMA: 5
- PWMB: 6
- AIN: 7
- BIN: 8
- STBY: 3

### Sensor Pins
- Ultrasonic Trigger: 13
- Ultrasonic Echo: 12
- IR Sensor: A0
- Left Line Sensor: A2
- Middle Line Sensor: A1
- Right Line Sensor: A0

### Actuator Pins
- Sensor Servo: 10
- Claw Servo: 9
- Buzzer: 11
- RGB LED: 4

---

## Speed Reference

### Recommended Speed Values
- **Slow:** 100-150
- **Medium:** 150-200
- **Fast:** 200-255

### Duration Reference
- **1 second:** 1000 ms
- **0.5 seconds:** 500 ms
- **0.1 seconds:** 100 ms

---

## Debugging Tips

### Serial Monitor Output
Add to your code:
```cpp
Serial.println("Debug message");
Serial.print("Value: ");
Serial.println(distance);
```

### LED Feedback
Use different colors to indicate states:
```cpp
car.lightRGBForDuration(CRGB(255, 0, 0), 200);   // Red = Error
car.lightRGBForDuration(CRGB(0, 255, 0), 200);   // Green = OK
car.lightRGBForDuration(CRGB(255, 255, 0), 200); // Yellow = Warning
```

### Sound Feedback
```cpp
car.beep(1);  // Single beep = checkpoint
car.beep(2);  // Double beep = error or obstacle
```

---

## Library Requirements

Make sure these libraries are installed in Arduino IDE:
1. **CarControl** (your custom library)
2. **FastLED**
3. **Ultrasonic**
4. **Servo** (built-in)

Install via: Tools → Manage Libraries → Search and Install

---

## Quick Start Checklist

- [ ] Install CarControl library
- [ ] Install FastLED library
- [ ] Install Ultrasonic library
- [ ] Connect Arduino to computer
- [ ] Select correct board (Tools → Board)
- [ ] Select correct port (Tools → Port)
- [ ] Copy generated code from simulator
- [ ] Paste into Arduino IDE
- [ ] Click Upload (→)
- [ ] Test your robot!

---

**Happy Coding!** 🤖
