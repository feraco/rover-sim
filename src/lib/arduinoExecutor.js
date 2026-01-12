export class ArduinoExecutor {
  constructor() {
    this.robot = null;
    this.isRunning = false;
    this.commandQueue = [];
  }

  setRobot(robot) {
    this.robot = robot;
  }

  async executeCode(code) {
    if (!this.robot) {
      console.error('Robot not loaded');
      return;
    }

    this.isRunning = true;
    console.log('Executing Arduino code:', code);

    try {
      const commands = this.parseArduinoCode(code);

      for (const command of commands) {
        if (!this.isRunning) break;
        await this.executeCommand(command);
      }
    } catch (error) {
      console.error('Arduino execution error:', error);
    } finally {
      this.isRunning = false;
      this.stopAll();
    }
  }

  parseArduinoCode(code) {
    const commands = [];
    const lines = code.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed.includes('moveForward')) {
        const match = trimmed.match(/moveForward\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)/);
        if (match) {
          commands.push({
            type: 'moveForward',
            speed: parseInt(match[1]),
            duration: parseInt(match[2])
          });
        }
      } else if (trimmed.includes('moveBackward')) {
        const match = trimmed.match(/moveBackward\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)/);
        if (match) {
          commands.push({
            type: 'moveBackward',
            speed: parseInt(match[1]),
            duration: parseInt(match[2])
          });
        }
      } else if (trimmed.includes('turnLeft')) {
        const match = trimmed.match(/turnLeft\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)/);
        if (match) {
          commands.push({
            type: 'turnLeft',
            speed: parseInt(match[1]),
            duration: parseInt(match[2])
          });
        }
      } else if (trimmed.includes('turnRight')) {
        const match = trimmed.match(/turnRight\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)/);
        if (match) {
          commands.push({
            type: 'turnRight',
            speed: parseInt(match[1]),
            duration: parseInt(match[2])
          });
        }
      } else if (trimmed.includes('stopMotors')) {
        commands.push({ type: 'stopMotors' });
      } else if (trimmed.includes('delay')) {
        const match = trimmed.match(/delay\s*\(\s*(\d+)\s*\)/);
        if (match) {
          commands.push({
            type: 'delay',
            duration: parseInt(match[1])
          });
        }
      }
    }

    return commands;
  }

  async executeCommand(command) {
    if (!this.robot || !this.robot.leftWheel || !this.robot.rightWheel) {
      console.error('Robot wheels not available');
      return;
    }

    const ev3SpeedFactor = 4.0;

    switch (command.type) {
      case 'moveForward': {
        const speed = command.speed * ev3SpeedFactor;
        this.robot.leftWheel.stop_action = 'hold';
        this.robot.rightWheel.stop_action = 'hold';
        this.robot.leftWheel.speed_sp = speed;
        this.robot.rightWheel.speed_sp = speed;
        this.robot.leftWheel.time_sp = command.duration / 1000;
        this.robot.rightWheel.time_sp = command.duration / 1000;
        this.robot.leftWheel.time_target = Date.now() + command.duration;
        this.robot.rightWheel.time_target = Date.now() + command.duration;
        this.robot.leftWheel.runTimed();
        this.robot.rightWheel.runTimed();
        await this.delay(command.duration);
        break;
      }
      case 'moveBackward': {
        const speed = command.speed * ev3SpeedFactor;
        this.robot.leftWheel.stop_action = 'hold';
        this.robot.rightWheel.stop_action = 'hold';
        this.robot.leftWheel.speed_sp = -speed;
        this.robot.rightWheel.speed_sp = -speed;
        this.robot.leftWheel.time_sp = command.duration / 1000;
        this.robot.rightWheel.time_sp = command.duration / 1000;
        this.robot.leftWheel.time_target = Date.now() + command.duration;
        this.robot.rightWheel.time_target = Date.now() + command.duration;
        this.robot.leftWheel.runTimed();
        this.robot.rightWheel.runTimed();
        await this.delay(command.duration);
        break;
      }
      case 'turnLeft': {
        const speed = command.speed * ev3SpeedFactor;
        this.robot.leftWheel.stop_action = 'hold';
        this.robot.rightWheel.stop_action = 'hold';
        this.robot.leftWheel.speed_sp = -speed;
        this.robot.rightWheel.speed_sp = speed;
        this.robot.leftWheel.time_sp = command.duration / 1000;
        this.robot.rightWheel.time_sp = command.duration / 1000;
        this.robot.leftWheel.time_target = Date.now() + command.duration;
        this.robot.rightWheel.time_target = Date.now() + command.duration;
        this.robot.leftWheel.runTimed();
        this.robot.rightWheel.runTimed();
        await this.delay(command.duration);
        break;
      }
      case 'turnRight': {
        const speed = command.speed * ev3SpeedFactor;
        this.robot.leftWheel.stop_action = 'hold';
        this.robot.rightWheel.stop_action = 'hold';
        this.robot.leftWheel.speed_sp = speed;
        this.robot.rightWheel.speed_sp = -speed;
        this.robot.leftWheel.time_sp = command.duration / 1000;
        this.robot.rightWheel.time_sp = command.duration / 1000;
        this.robot.leftWheel.time_target = Date.now() + command.duration;
        this.robot.rightWheel.time_target = Date.now() + command.duration;
        this.robot.leftWheel.runTimed();
        this.robot.rightWheel.runTimed();
        await this.delay(command.duration);
        break;
      }
      case 'stopMotors':
        this.stopAll();
        break;
      case 'delay':
        await this.delay(command.duration);
        break;
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  stop() {
    this.isRunning = false;
    this.stopAll();
  }

  stopAll() {
    if (this.robot && this.robot.leftWheel && this.robot.rightWheel) {
      this.robot.leftWheel.stop_action = 'hold';
      this.robot.rightWheel.stop_action = 'hold';
      this.robot.leftWheel.stop();
      this.robot.rightWheel.stop();
    }
  }
}
