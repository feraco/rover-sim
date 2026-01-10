// Arduino Simulator API
// Provides Arduino-compatible car control API that directly controls the robot
// without requiring Python/Skulpt translation

var arduino_sim_api = new function() {
  var self = this;
  
  // CarControl class - mimics Arduino CarControl library
  this.CarControl = class {
    constructor() {
      this.commandQueue = [];
      this.running = false;
      this.stopped = false;
      this.processingPromise = null;
    }
    
    // Execute command with timing
    async executeCommand(command, duration = 0) {
      return new Promise((resolve) => {
        this.commandQueue.push({ command, duration, resolve });
        
        // Start processing if not already running
        if (!this.processingPromise) {
          this.processingPromise = this.processQueue();
        }
      });
    }
    
    // Process command queue sequentially
    async processQueue() {
      this.running = true;
      
      while (this.commandQueue.length > 0 && !this.stopped) {
        let { command, duration, resolve } = this.commandQueue.shift();
        
        console.log('Executing command, queue length:', this.commandQueue.length);
        
        // Execute the command
        try {
          command();
        } catch (e) {
          console.error('Command execution error:', e);
        }
        
        // Wait for duration if specified
        if (duration > 0) {
          await this.delay(duration);
        }
        
        resolve();
      }
      
      this.running = false;
      this.processingPromise = null;
      console.log('Queue processing complete');
    }
    
    // Delay helper
    delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // Stop all queued commands
    stopAll() {
      this.stopped = true;
      this.commandQueue = [];
      robot.leftWheel.stop();
      robot.rightWheel.stop();
      this.running = false;
      this.stopped = false;
    }
    
    // Movement commands
    moveForward(speed, duration) {
      return this.executeCommand(() => {
        console.log('moveForward:', speed, duration);
        let ev3Speed = speed * 4.0; // Convert 0-255 to ~0-1000 deg/sec range
        robot.leftWheel.stop_action = 'hold';
        robot.rightWheel.stop_action = 'hold';
        robot.leftWheel.speed_sp = ev3Speed;
        robot.rightWheel.speed_sp = ev3Speed;
        robot.leftWheel.time_sp = duration / 1000;
        robot.rightWheel.time_sp = duration / 1000;
        robot.leftWheel.time_target = Date.now() + duration;
        robot.rightWheel.time_target = Date.now() + duration;
        robot.leftWheel.runTimed();
        robot.rightWheel.runTimed();
      }, duration);
    }
    
    moveBackward(speed, duration) {
      return this.executeCommand(() => {
        console.log('moveBackward:', speed, duration);
        let ev3Speed = speed * 4.0;
        robot.leftWheel.stop_action = 'hold';
        robot.rightWheel.stop_action = 'hold';
        robot.leftWheel.speed_sp = -ev3Speed;
        robot.rightWheel.speed_sp = -ev3Speed;
        robot.leftWheel.time_sp = duration / 1000;
        robot.rightWheel.time_sp = duration / 1000;
        robot.leftWheel.time_target = Date.now() + duration;
        robot.rightWheel.time_target = Date.now() + duration;
        robot.leftWheel.runTimed();
        robot.rightWheel.runTimed();
      }, duration);
    }
    
    turnLeft(speed, duration) {
      return this.executeCommand(() => {
        console.log('turnLeft:', speed, duration);
        let ev3Speed = speed * 4.0;
        robot.leftWheel.stop_action = 'hold';
        robot.rightWheel.stop_action = 'hold';
        robot.leftWheel.speed_sp = -ev3Speed;
        robot.rightWheel.speed_sp = ev3Speed;
        robot.leftWheel.time_sp = duration / 1000;
        robot.rightWheel.time_sp = duration / 1000;
        robot.leftWheel.time_target = Date.now() + duration;
        robot.rightWheel.time_target = Date.now() + duration;
        robot.leftWheel.runTimed();
        robot.rightWheel.runTimed();
      }, duration);
    }
    
    turnRight(speed, duration) {
      return this.executeCommand(() => {
        console.log('turnRight:', speed, duration);
        let ev3Speed = speed * 4.0;
        robot.leftWheel.stop_action = 'hold';
        robot.rightWheel.stop_action = 'hold';
        robot.leftWheel.speed_sp = ev3Speed;
        robot.rightWheel.speed_sp = -ev3Speed;
        robot.leftWheel.time_sp = duration / 1000;
        robot.rightWheel.time_sp = duration / 1000;
        robot.leftWheel.time_target = Date.now() + duration;
        robot.rightWheel.time_target = Date.now() + duration;
        robot.leftWheel.runTimed();
        robot.rightWheel.runTimed();
      }, duration);
    }
    
    stopMotors() {
      return this.executeCommand(() => {
        robot.leftWheel.stop_action = 'hold';
        robot.rightWheel.stop_action = 'hold';
        robot.leftWheel.stop();
        robot.rightWheel.stop();
      }, 0);
    }
    
    // Sensor commands
    getDistance() {
        // Try port hint, then first ultrasonic component
        let sensor = robot.getComponentByPort && robot.getComponentByPort('in2');
        if (!sensor) {
          sensor = self.getFirstComponentByType('UltrasonicSensor');
        }
        if (sensor && sensor.type === 'UltrasonicSensor' && typeof sensor.getDistance === 'function') {
          return sensor.getDistance();
        }
        return 0;
    }

    getDistanceToObstacle() {
      return this.getDistance();
    }

    // Basic battery stub for plotting
    getBatteryLevel() {
      if (robot && typeof robot.getBatteryLevel === 'function') {
        return robot.getBatteryLevel();
      }
      return 100;
    }

    // Line sensors (reuse color sensor(s) if present)
    getLineSensorLeft() {
      return this.readLineSensor(0);
    }

    getLineSensorMiddle() {
      return this.readLineSensor(1);
    }

    getLineSensorRight() {
      return this.readLineSensor(2);
    }

    readLineSensor(idx) {
      let sensor = robot.getComponentByPort && robot.getComponentByPort('in1');
      if (!sensor) {
        let sensors = self.getComponentsByType('ColorSensor');
        sensor = sensors[idx] || sensors[0];
      }
      if (!sensor) {
        return 0;
      }
      if (typeof sensor.getReflectedLightIntensity === 'function') {
        return sensor.getReflectedLightIntensity();
      }
      if (typeof sensor.getRGB === 'function') {
        let rgb = sensor.getRGB();
        return (rgb[0] + rgb[1] + rgb[2]) / 3;
      }
      return 0;
    }
    
    followLine(speed) {
      // Line following - simplified version
      return this.executeCommand(() => {
        console.log('followLine:', speed);
        let colorSensor = robot.getComponentByPort('in1');
        if (colorSensor && colorSensor.type === 'ColorSensor') {
          // Get RGB or reflected light intensity
          let intensity = 50; // Default
          if (typeof colorSensor.getReflectedLightIntensity === 'function') {
            intensity = colorSensor.getReflectedLightIntensity();
          } else if (typeof colorSensor.getRGB === 'function') {
            let rgb = colorSensor.getRGB();
            intensity = (rgb[0] + rgb[1] + rgb[2]) / 3; // Average brightness
          }
          
          // Simple line follow logic
          if (intensity < 30) {
            // On dark line, turn left
            robot.leftWheel.speed_sp = speed * 2.0;
            robot.rightWheel.speed_sp = speed * 4.0;
          } else {
            // Off line, turn right
            robot.leftWheel.speed_sp = speed * 4.0;
            robot.rightWheel.speed_sp = speed * 2.0;
          }
          
          robot.leftWheel.runForever();
          robot.rightWheel.runForever();
        } else {
          console.log('No color sensor found for line following');
        }
      }, 100); // Check every 100ms
    }
    
    // Servo commands (simulated)
    lookLeft() {
      return this.executeCommand(() => {
        console.log('Arduino Sim: Servo look left');
        // Servo control could be added if robot has servo component
      }, 500);
    }
    
    lookRight() {
      return this.executeCommand(() => {
        console.log('Arduino Sim: Servo look right');
      }, 500);
    }
    
    lookCenter() {
      return this.executeCommand(() => {
        console.log('Arduino Sim: Servo look center');
      }, 500);
    }
    
    centerServo() {
      return this.lookCenter();
    }
    
    // Claw commands (simulated)
    openClaw() {
      return this.executeCommand(() => {
        console.log('Arduino Sim: Claw open');
        // Could control motorC if available
        let motorC = robot.getComponentByPort('outC');
        if (motorC) {
          motorC.speed_sp = 200;
          motorC.time_sp = 0.5;
          motorC.time_target = Date.now() + 500;
          motorC.runTimed();
        }
      }, 500);
    }
    
    closeClaw() {
      return this.executeCommand(() => {
        console.log('Arduino Sim: Claw close');
        let motorC = robot.getComponentByPort('outC');
        if (motorC) {
          motorC.speed_sp = -200;
          motorC.time_sp = 0.5;
          motorC.time_target = Date.now() + 500;
          motorC.runTimed();
        }
      }, 500);
    }
    
    // Sound commands (simulated)
    beep(frequency, duration) {
      return this.executeCommand(() => {
        console.log('Arduino Sim: Beep at ' + frequency + 'Hz for ' + duration + 'ms');
        // Could use Web Audio API for actual sound
        if (typeof spkr !== 'undefined' && spkr.beep) {
          spkr.beep();
        }
      }, duration);
    }
    
    // LED commands (simulated)
    setRGB(red, green, blue) {
      return this.executeCommand(() => {
        console.log('Arduino Sim: RGB LED (' + red + ', ' + green + ', ' + blue + ')');
        // Could control robot LED if available
      }, 0);
    }
    
    // Arduino delay equivalent
    wait(ms) {
      return this.executeCommand(() => {
        // Just wait, no action
      }, ms);
    }
  };
  
  // Global car instance (created when program runs)
  this.car = null;
  
  // Initialize car for program
  this.initCar = function() {
    self.car = new self.CarControl();
    return self.car;
  };

  // Helpers to find components by type when ports differ across templates
  this.getComponentsByType = function(type) {
    let found = [];
    function walk(list) {
      (list || []).forEach(function(c){
        if (c.type === type) {
          found.push(c);
        }
        if (c.components) {
          walk(c.components);
        }
      });
    }
    walk(robot && robot.components);
    return found;
  };

  this.getFirstComponentByType = function(type) {
    let list = self.getComponentsByType(type);
    return list.length ? list[0] : null;
  };
  
  // Stop current program
  this.stop = function() {
    if (self.car) {
      self.car.stopAll();
    }
  };
};

console.log('Arduino Simulator API loaded');

// Plotter API for Arduino simulator
class Plotter {
  constructor(minX, minY, maxX, maxY) {
    this.div = document.getElementById('plotter');
    this.canvas = document.getElementById('plotterCanvas');
    this.ctx = this.canvas.getContext('2d');

    this.canvas.minX = minX;
    this.canvas.minY = minY;
    this.canvas.maxX = maxX;
    this.canvas.maxY = maxY;

    this.minX = minX;
    this.minY = minY;
    this.maxX = maxX;
    this.maxY = maxY;
    this.width = maxX - minX;
    this.height = maxY - minY;

    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = 'black';
    this.ctx.strokeStyle = 'black';
    this.pointSize = 2;

    this.div.classList.remove('hide');
  }

  getPos(x, y) {
    x = (x - this.minX) / this.width * this.canvas.width;
    y = this.canvas.height - (y - this.minY) / this.height * this.canvas.height;
    return [x, y];
  }

  show() {
    this.div.classList.remove('hide');
  }

  hide() {
    this.div.classList.add('hide');
  }

  clear() {
    let color = this.ctx.fillStyle;
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = color;
  }

  setColor(color) {
    this.ctx.fillStyle = color;
    this.ctx.strokeStyle = color;
  }

  setPointSize(size) {
    this.pointSize = size;
  }

  drawPoint(x, y) {
    [x, y] = this.getPos(x, y);
    this.ctx.fillRect(x - this.pointSize / 2, y - this.pointSize / 2, this.pointSize, this.pointSize);
  }

  drawLine(x1, y1, x2, y2) {
    [x1, y1] = this.getPos(x1, y1);
    [x2, y2] = this.getPos(x2, y2);
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
  }

  drawTriangle(x, y, dir) {
    let angle = dir / 180 * Math.PI;
    [x, y] = this.getPos(x, y);
    let tipX = x + 8 * Math.cos(angle);
    let tipY = y - 8 * Math.sin(angle);
    let leftX = x + 5 * Math.cos(angle + Math.PI / 3 * 2);
    let leftY = y - 5 * Math.sin(angle + Math.PI / 3 * 2);
    let rightX = x + 5 * Math.cos(angle - Math.PI / 3 * 2);
    let rightY = y - 5 * Math.sin(angle - Math.PI / 3 * 2);
    this.ctx.fillRect(x - 1, y - 1, 2, 2);
    this.ctx.beginPath();
    this.ctx.moveTo(tipX, tipY);
    this.ctx.lineTo(leftX, leftY);
    this.ctx.lineTo(rightX, rightY);
    this.ctx.closePath();
    this.ctx.stroke();
  }

  drawGrid(size) {
    let [x, y] = this.getPos(0, 0);
    let [rx, ry] = this.getPos(size, size);
    rx -= x;
    ry = y - ry;

    let color = this.ctx.strokeStyle;
    this.ctx.strokeStyle = 'lightgray';
    this.ctx.beginPath();
    
    for (let i = Math.floor(this.minX / size); i < Math.ceil(this.maxX / size); i++) {
      let x2 = Math.round(x + i * rx);
      this.ctx.moveTo(x2, 0);
      this.ctx.lineTo(x2, this.canvas.height);
    }
    for (let i = Math.floor(this.minY / size); i < Math.ceil(this.maxY / size); i++) {
      let [x2, y2] = this.getPos(0, i * size);
      y2 = Math.round(y2);
      this.ctx.moveTo(0, y2);
      this.ctx.lineTo(this.canvas.width, y2);
    }
    
    this.ctx.stroke();
    this.ctx.strokeStyle = color;
  }

  drawLegend(entries) {
    // entries: [{label, color}]
    const padding = 8;
    const lineH = 16;
    const boxW = entries.reduce((w, e) => Math.max(w, this.ctx.measureText(e.label).width), 0) + 50;
    const boxH = entries.length * lineH + padding * 2;
    const x = this.canvas.width - boxW - 10;
    const y = 10;

    this.ctx.save();
    this.ctx.fillStyle = 'rgba(0,0,0,0.45)';
    this.ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.rect(x, y, boxW, boxH);
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.font = '12px Arial';
    entries.forEach((e, i) => {
      const yPos = y + padding + (i + 0.8) * lineH;
      this.ctx.fillStyle = e.color;
      this.ctx.fillRect(x + padding, yPos - 10, 14, 8);
      this.ctx.fillStyle = 'white';
      this.ctx.fillText(e.label, x + padding + 20, yPos - 2);
    });

    this.ctx.restore();
  }
}
