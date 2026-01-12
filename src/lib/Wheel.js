import * as BABYLON from 'babylonjs';

export class Wheel {
  constructor(scene, parent, pos, rot, port, options) {
    this.parent = parent;
    this.type = 'WheelActuator';
    this.port = port;
    this.options = options;
    this.components = [];

    this.bodyPosition = new BABYLON.Vector3(pos[0], pos[1], pos[2]);
    this.rotation = new BABYLON.Vector3(rot[0], rot[1], rot[2]);
    this.initialQuaternion = BABYLON.Quaternion.FromEulerAngles(rot[0], rot[1], rot[2]);

    this.bodyVector = null;
    this.wheelVector = null;
    this.mesh = null;
    this.joint = null;
    this.scene = scene;

    this.STOP_ACTION_BRAKE_FORCE = 2000;
    this.STOP_ACTION_COAST_FORCE = 1000;
    this.STOP_ACTION_HOLD_FORCE = 30000;
    this.MOTOR_POWER_DEFAULT = 30000;
    this.MAX_SPEED = (800 / 180) * Math.PI;
    this.MAX_ACCELERATION = 20;
    this.TIRE_DOWNWARDS_FORCE = -4000;

    this.modes = {
      STOP: 1,
      RUN: 2,
      RUN_TO_POS: 3,
      RUN_TIL_TIME: 4
    };

    this.states = {
      RUNNING: 'running',
      RAMPING: 'ramping',
      HOLDING: 'holding',
      OVERLOADED: 'overloaded',
      STATE_STALLED: 'stalled',
      NONE: ''
    };

    this.state = this.states.HOLDING;
    this.speed_sp = 0;
    this._speed_sp = 0;
    this.stop_action = 'hold';
    this.position = 0;
    this.speed = 0;
    this.position_target = 0;
    this.prevPosition = 0;
    this.mode = this.modes.STOP;
    this.actualPosition = 0;
    this.positionAdjustment = 0;
    this.rotationRounds = 0;
    this.prevRotation = 0;
    this.angularVelocity = 0;

    this.init();
  }

  init() {
    this.maxAcceleration = this.options.maxAcceleration;
    this.stopActionHoldForce = this.options.stopActionHoldForce;
    this.TIRE_DOWNWARDS_FORCE = new BABYLON.Vector3(
      0,
      this.options.tireDownwardsForce,
      0
    );

    let wheelMat = this.scene.getMaterialByID('wheel');
    if (!wheelMat) {
      wheelMat = new BABYLON.StandardMaterial('wheel', this.scene);
      const wheelTexture = new BABYLON.Texture(
        '/assets/textures/robot/wheel.png',
        this.scene
      );
      wheelMat.diffuseTexture = wheelTexture;
      wheelMat.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
      wheelMat.freeze();
    }

    const faceUV = new Array(3);
    faceUV[0] = new BABYLON.Vector4(0, 0, 200 / 828, 1);
    faceUV[1] = new BABYLON.Vector4(200 / 828, 3 / 4, 1, 1);
    faceUV[2] = new BABYLON.Vector4(0, 0, 200 / 828, 1);

    const wheelOptions = {
      height: this.options.width,
      diameter: this.options.diameter,
      tessellation: 24,
      faceUV: faceUV
    };

    this.mesh = BABYLON.MeshBuilder.CreateCylinder(
      'wheel',
      wheelOptions,
      this.scene
    );
    this.body = this.mesh;
    this.end = this.mesh;
    this.body.component = this;
    this.mesh.material = wheelMat;

    this.mesh.parent = this.parent;
    this.mesh.position = this.bodyPosition;
    this.mesh.rotation.z = -Math.PI / 2;
    this.mesh.rotate(BABYLON.Axis.Y, this.rotation.y, BABYLON.Space.LOCAL);
    this.mesh.rotate(BABYLON.Axis.X, this.rotation.x, BABYLON.Space.LOCAL);
    this.mesh.rotate(BABYLON.Axis.Z, this.rotation.z, BABYLON.Space.LOCAL);
    this.parent.removeChild(this.mesh);

    if (this.scene.shadowGenerator) {
      this.scene.shadowGenerator.addShadowCaster(this.mesh);
    }
  }

  loadImpostor() {
    this.mesh.physicsImpostor = new BABYLON.PhysicsImpostor(
      this.mesh,
      BABYLON.PhysicsImpostor.CylinderImpostor,
      {
        mass: this.options.mass,
        restitution: this.options.restitution,
        friction: this.options.friction
      },
      this.scene
    );

    const origin = this.mesh.physicsImpostor.physicsBody
      .getWorldTransform()
      .getOrigin();
    let lastOrigin = [origin.x(), origin.y(), origin.z()];

    this.mesh.physicsImpostor.registerBeforePhysicsStep(() => {
      if (this.mesh.physicsImpostor.getLinearVelocity().lengthSquared() < 0.1) {
        origin.setX(lastOrigin[0]);
        origin.setY(lastOrigin[1]);
        origin.setZ(lastOrigin[2]);
      } else {
        lastOrigin = [origin.x(), origin.y(), origin.z()];
      }
    });
  }

  loadJoints() {
    const wheel2world = this.mesh.absoluteRotationQuaternion;
    const zero = BABYLON.Vector3.Zero();
    let world2body = this.parent.absoluteRotationQuaternion;
    world2body = BABYLON.Quaternion.Inverse(world2body);

    const mainPivot = this.mesh.position.subtract(this.parent.position);
    mainPivot.rotateByQuaternionAroundPointToRef(world2body, zero, mainPivot);

    const mainAxis = new BABYLON.Vector3(0, 1, 0);
    mainAxis.rotateByQuaternionAroundPointToRef(wheel2world, zero, mainAxis);
    mainAxis.rotateByQuaternionAroundPointToRef(world2body, zero, mainAxis);

    this.wheelVector = new BABYLON.Vector3(1, 0, 0);
    this.bodyVector = new BABYLON.Vector3(0, 0, 0);
    this.wheelVector.rotateByQuaternionAroundPointToRef(
      wheel2world,
      zero,
      this.bodyVector
    );
    this.bodyVector.rotateByQuaternionAroundPointToRef(
      world2body,
      zero,
      this.bodyVector
    );

    this.joint = new BABYLON.MotorEnabledJoint(
      BABYLON.PhysicsJoint.HingeJoint,
      {
        mainPivot: mainPivot,
        connectedPivot: new BABYLON.Vector3(0, 0, 0),
        mainAxis: mainAxis,
        connectedAxis: new BABYLON.Vector3(0, 1, 0)
      }
    );

    this.parent.physicsImpostor.addJoint(
      this.mesh.physicsImpostor,
      this.joint
    );
  }

  runForever() {
    this.mode = this.modes.RUN;
  }

  runTimed() {
    this.mode = this.modes.RUN_TIL_TIME;
  }

  runToPosition() {
    this.positionDirectionReversed = this.position_target < this.position;
    this.mode = this.modes.RUN_TO_POS;
  }

  stop() {
    this.mode = this.modes.STOP;
    if (this.stop_action === 'hold') {
      this.joint.setMotor(0, this.stopActionHoldForce);
      this.state = this.states.HOLDING;
      this.position_target = this.position;
    } else if (this.stop_action === 'brake') {
      this.joint.setMotor(0, this.STOP_ACTION_BRAKE_FORCE);
      this.state = this.states.NONE;
    } else {
      this.joint.setMotor(0, this.STOP_ACTION_COAST_FORCE);
      this.state = this.states.NONE;
    }
  }

  reset() {
    this.stop();
    this.position = 0;
    this.actualPosition = 0;
    this.rotationRounds = 0;
    this.prevRotation = 0;
  }

  render(delta) {
    if (!this.joint) return;

    if (this.mode === this.modes.STOP) {
      return;
    }

    if (this.mode === this.modes.RUN) {
      const targetSpeed = (this.speed_sp / 180) * Math.PI;
      this.joint.setMotor(targetSpeed, this.MOTOR_POWER_DEFAULT);
      this.state = this.states.RUNNING;
    }
  }
}
