import * as BABYLON from 'babylonjs';
import { Wheel } from './Wheel';

export class Robot {
  constructor() {
    this.options = {};
    this.processedOptions = {};
    this.body = null;
    this.leftWheel = null;
    this.rightWheel = null;
    this.components = [];
    this.sensorCount = 0;
    this.actuatorCount = 2;
    this.motorCount = 2;
    this.componentIndex = 0;
    this.scene = null;
    this.nameLabel = null;
    this.label = null;
    this.name = '';
    this.player = 'single';
    this.mailboxes = {};
    this.hubButtons = {
      backspace: false,
      up: false,
      down: false,
      left: false,
      right: false,
      enter: false
    };

    this.playerIndividualColors = [
      new BABYLON.Color3(0.2, 0.94, 0.94),
      new BABYLON.Color3(0.2, 0.94, 0.2),
      new BABYLON.Color3(0.94, 0.94, 0.2),
      new BABYLON.Color3(0.94, 0.2, 0.2),
      new BABYLON.Color3(0.94, 0.2, 0.94),
      new BABYLON.Color3(0.2, 0.2, 0.94)
    ];

    this.playerTeamColors = [
      new BABYLON.Color3(0.09, 0.09, 0.902),
      new BABYLON.Color3(0.09, 0.495, 0.9),
      new BABYLON.Color3(0.9, 0.09, 0.09),
      new BABYLON.Color3(0.9, 0.09, 0.495)
    ];

    this.defaultOptions = {
      color: '#f09c0d',
      imageType: 'all',
      imageURL: '',
      caster: true,
      wheels: true
    };
  }

  async load(scene, robotStart, babylon) {
    const options = { ...this.defaultOptions, ...this.options };
    this.processedOptions = options;
    this.scene = scene;

    const startPos = robotStart?.position || new BABYLON.Vector3(0, 0, 0);
    const startRot = robotStart?.rotation || new BABYLON.Vector3(0, 0, 0);

    const bodyMat = new BABYLON.StandardMaterial('body', scene);
    const faceUV = new Array(6);
    for (let i = 0; i < 6; i++) {
      faceUV[i] = new BABYLON.Vector4(0, 0, 0, 0);
    }

    const setCustomColors = () => {
      const VALID_IMAGETYPES = ['top', 'front', 'repeat', 'all', 'cylinder', 'sphere'];
      if (VALID_IMAGETYPES.includes(options.imageType) && options.imageURL) {
        if (options.imageType === 'top') {
          faceUV[4] = new BABYLON.Vector4(0, 0, 1, 1);
        } else if (options.imageType === 'front') {
          faceUV[1] = new BABYLON.Vector4(0, 0, 1, 1);
        } else if (options.imageType === 'repeat') {
          for (let i = 0; i < 6; i++) {
            faceUV[i] = new BABYLON.Vector4(0, 0, 1, 1);
          }
        } else if (options.imageType === 'all') {
          faceUV[0] = new BABYLON.Vector4(0, 0, 1 / 3, 1 / 2);
          faceUV[1] = new BABYLON.Vector4(1 / 3, 0, 2 / 3, 1 / 2);
          faceUV[2] = new BABYLON.Vector4(2 / 3, 0, 1, 1 / 2);
          faceUV[3] = new BABYLON.Vector4(0, 1 / 2, 1 / 3, 1);
          faceUV[4] = new BABYLON.Vector4(1 / 3, 1 / 2, 2 / 3, 1);
          faceUV[5] = new BABYLON.Vector4(2 / 3, 1 / 2, 1, 1);
        }
        bodyMat.diffuseTexture = new BABYLON.Texture(options.imageURL, scene);
      } else {
        if (babylon && babylon.getMaterial) {
          Object.assign(bodyMat, babylon.getMaterial(scene, options.color));
        }
      }
    };

    if (this.player === 'single') {
      setCustomColors();
    } else {
      const robotColorMode = babylon?.arena?.robotColorMode;
      if (robotColorMode === 'team') {
        bodyMat.diffuseColor = this.playerTeamColors[this.player];
      } else if (robotColorMode === 'custom') {
        setCustomColors();
      } else {
        bodyMat.diffuseColor = this.playerIndividualColors[this.player];
      }
    }

    bodyMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    bodyMat.freeze();

    const bodyOptions = {
      height: options.bodyHeight,
      width: options.bodyWidth,
      depth: options.bodyLength,
      faceUV: faceUV
    };

    const body = BABYLON.MeshBuilder.CreateBox('body', bodyOptions, scene);
    this.body = body;
    body.material = bodyMat;
    body.visibility = 1;
    body.position.x = 0;
    body.position.y =
      options.bodyHeight / 2 +
      options.wheelDiameter / 2 -
      options.bodyEdgeToWheelCenterY;
    body.position.z = 0;

    if (scene.shadowGenerator) {
      scene.shadowGenerator.addShadowCaster(body);
    }

    body.position.addInPlace(startPos);
    body.rotate(BABYLON.Axis.Y, startRot.y, BABYLON.Space.LOCAL);
    body.rotate(BABYLON.Axis.X, startRot.x, BABYLON.Space.LOCAL);
    body.rotate(BABYLON.Axis.Z, startRot.z, BABYLON.Space.LOCAL);

    this.addLabel(babylon);
    body.paintballCollide = this.paintballCollide.bind(this);

    if (options.caster) {
      const casterMat = new BABYLON.StandardMaterial('caster', scene);
      casterMat.diffuseColor = new BABYLON.Color3(0.6, 0.6, 0.6);
      casterMat.specularColor = new BABYLON.Color3(0.4, 0.4, 0.4);
      casterMat.freeze();

      const casterOptions = {
        diameter: options.casterDiameter || options.wheelDiameter,
        segments: 5
      };

      const caster = BABYLON.MeshBuilder.CreateSphere('sphere', casterOptions, scene);
      caster.material = casterMat;
      caster.position.y =
        -(options.bodyHeight / 2) +
        options.bodyEdgeToWheelCenterY -
        options.wheelDiameter / 2 +
        casterOptions.diameter / 2;
      caster.position.z = -(options.bodyLength / 2) + casterOptions.diameter / 2;

      if (options.casterOffsetZ) {
        caster.position.z += options.casterOffsetZ;
      }

      if (scene.shadowGenerator) {
        scene.shadowGenerator.addShadowCaster(caster);
      }

      caster.parent = body;
      caster.physicsImpostor = new BABYLON.PhysicsImpostor(
        caster,
        BABYLON.PhysicsImpostor.SphereImpostor,
        {
          mass: options.casterMass,
          restitution: 0.0,
          friction: options.casterFriction
        },
        scene
      );
    }

    this.components = [];
    this.sensorCount = 0;
    this.motorCount = options.wheels ? 2 : 0;
    this.componentIndex = 0;

    if (options.components) {
      this.loadComponents(options.components, this.components, this.body);
    }

    this.assignWheelActuatorGroups();

    body.physicsImpostor = new BABYLON.PhysicsImpostor(
      body,
      BABYLON.PhysicsImpostor.BoxImpostor,
      {
        mass: options.bodyMass,
        restitution: 0.4,
        friction: options.bodyFriction
      },
      scene
    );

    const origin = body.physicsImpostor.physicsBody.getWorldTransform().getOrigin();
    let lastOrigin = [origin.x(), origin.y(), origin.z()];

    body.physicsImpostor.registerBeforePhysicsStep(() => {
      if (body.physicsImpostor.getLinearVelocity().lengthSquared() < 0.1) {
        origin.setX(lastOrigin[0]);
        origin.setY(lastOrigin[1]);
        origin.setZ(lastOrigin[2]);
      } else {
        lastOrigin = [origin.x(), origin.y(), origin.z()];
      }
    });

    this.loadJoints(this.components);

    if (options.wheels) {
      const driveWheelOptions = {
        diameter: options.wheelDiameter,
        width: options.wheelWidth,
        mass: options.wheelMass,
        friction: options.wheelFriction,
        maxAcceleration: options.wheelMaxAcceleration,
        stopActionHoldForce: options.wheelStopActionHoldForce,
        tireDownwardsForce: options.wheelTireDownwardsForce
      };

      this.leftWheel = new Wheel(
        scene,
        body,
        [
          -(options.wheelWidth + options.bodyWidth) / 2 - options.wheelToBodyOffset,
          -(options.bodyHeight / 2) + options.bodyEdgeToWheelCenterY,
          options.bodyLength / 2 - options.bodyEdgeToWheelCenterZ
        ],
        [0, 0, 0],
        'outA',
        driveWheelOptions
      );
      this.leftWheel.loadImpostor();
      this.leftWheel.loadJoints();

      this.rightWheel = new Wheel(
        scene,
        body,
        [
          (options.wheelWidth + options.bodyWidth) / 2 + options.wheelToBodyOffset,
          -(options.bodyHeight / 2) + options.bodyEdgeToWheelCenterY,
          options.bodyLength / 2 - options.bodyEdgeToWheelCenterZ
        ],
        [0, 0, 0],
        'outB',
        driveWheelOptions
      );
      this.rightWheel.loadImpostor();
      this.rightWheel.loadJoints();
    }
  }

  addLabel(babylon) {
    if (babylon?.gui && this.name) {
      this.nameLabel = new BABYLON.GUI.Rectangle();
      this.nameLabel.height = '30px';
      this.nameLabel.width = '200px';
      this.nameLabel.cornerRadius = 0;
      this.nameLabel.thickness = 0;
      babylon.gui.addControl(this.nameLabel);

      const label = new BABYLON.GUI.TextBlock();
      this.label = label;
      label.fontFamily = 'sans';
      label.text = this.name;
      label.color = '#FFFF77';
      label.outlineWidth = 1;
      label.outlineColor = 'black';
      label.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
      label.fontSize = 20;
      this.nameLabel.addControl(label);

      this.nameLabel.linkWithMesh(this.body);
      this.nameLabel.linkOffsetY = -50;
      this.nameLabel.isVisible = false;
    }
  }

  hideLabel() {
    if (this.nameLabel) {
      this.nameLabel.isVisible = false;
    }
  }

  showLabel() {
    if (this.nameLabel) {
      this.nameLabel.isVisible = true;
    }
  }

  paintballCollide(thisImpostor, otherImpostor, hit) {
  }

  loadJoints(components) {
    components.forEach((component) => {
      if (component.components) {
        this.loadJoints(component.components);
      }
      if (component.loadJoints) {
        component.loadJoints();
      }
    });
  }

  loadComponents(componentsConfig, components, parent) {
    const PORT_LETTERS = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    componentsConfig.forEach((componentConfig) => {
      let component = null;

      if (component) {
        component.componentIndex = this.componentIndex++;
        if (componentConfig.components) {
          this.loadComponents(
            componentConfig.components,
            component.components,
            component.end
          );
        }
        if (component.loadImpostor) {
          component.loadImpostor();
        }
        components.push(component);
      }
    });
  }

  getComponentByPort(port) {
    return this._getComponentByPort(port, this.components);
  }

  _getComponentByPort(port, components) {
    for (let i = 0; i < components.length; i++) {
      if (components[i].port === port) {
        return components[i];
      } else if (components[i].components) {
        const result = this._getComponentByPort(port, components[i].components);
        if (result) {
          return result;
        }
      }
    }
    return null;
  }

  getComponentsByType(type) {
    const found = [];
    const search = (list) => {
      list.forEach((component) => {
        if (component.type === type) {
          found.push(component);
        }
        if (component.components) {
          search(component.components);
        }
      });
    };
    search(this.components);
    return found;
  }

  assignWheelActuatorGroups() {
    if (this.leftWheel || this.rightWheel) {
      return;
    }

    const wheels = this.getComponentsByType('WheelActuator');
    if (wheels.length === 0) {
      return;
    }

    const makeGroup = (list) => {
      if (list.length === 0) {
        return null;
      }

      const group = {
        type: 'WheelActuator',
        port: list[0].port,
        members: list,
        runForever: () => list.forEach((w) => w.runForever()),
        runTimed: () => list.forEach((w) => w.runTimed()),
        runToPosition: () => list.forEach((w) => w.runToPosition()),
        stop: () => list.forEach((w) => w.stop()),
        reset: () => list.forEach((w) => w.reset()),
        render: () => {}
      };

      ['speed_sp', 'time_sp', 'time_target', 'stop_action', 'position_target', 'mode'].forEach(
        (prop) => {
          Object.defineProperty(group, prop, {
            get: () => list[0][prop],
            set: (val) => list.forEach((w) => { w[prop] = val; }),
            enumerable: true
          });
        }
      );

      Object.defineProperty(group, 'position', {
        get: () => list[0].position,
        set: (val) => list.forEach((w) => { w.position = val; }),
        enumerable: true
      });

      return group;
    };

    const leftWheels = wheels.filter((w) => w.bodyPosition.x <= 0);
    const rightWheels = wheels.filter((w) => w.bodyPosition.x > 0);

    this.leftWheel = makeGroup(leftWheels);
    this.rightWheel = makeGroup(rightWheels);
  }

  reset() {
    if (this.leftWheel) {
      this.leftWheel.reset();
    }
    if (this.rightWheel) {
      this.rightWheel.reset();
    }
    this.components.forEach((component) => {
      if (component.reset) {
        component.reset();
      }
    });
  }

  render(delta) {
    if (this.leftWheel) {
      this.leftWheel.render(delta);
    }
    if (this.rightWheel) {
      this.rightWheel.render(delta);
    }
    this.components.forEach((component) => {
      if (component.render) {
        component.render(delta);
      }
    });
  }

  stopAll() {
    if (this.leftWheel) {
      this.leftWheel.stop();
    }
    if (this.rightWheel) {
      this.rightWheel.stop();
    }
    this.components.forEach((component) => {
      if (component.stop) {
        component.stop();
      }
    });
  }

  radioSend(dest, mailbox, value) {
    const TEAM_MATES = [[1], [0], [3], [2]];
    const ALL = [0, 1, 2, 3];

    let destList = dest;
    if (dest === 'all') {
      destList = ALL;
    } else if (dest === 'team') {
      destList = this.player === 'single' ? [1] : TEAM_MATES[this.player];
    } else if (typeof dest === 'number') {
      destList = [dest];
    }

    destList.forEach((d) => {
      if (d === this.player) {
        return;
      }
      const recipient = window.robots?.[d];
      if (recipient) {
        if (!recipient.mailboxes[mailbox]) {
          recipient.mailboxes[mailbox] = [];
        }
        recipient.mailboxes[mailbox].push([value, this.player]);
      }
    });
  }

  radioAvailable(mailbox) {
    return this.mailboxes[mailbox]?.length || 0;
  }

  radioRead(mailbox) {
    if (!this.mailboxes[mailbox] || this.mailboxes[mailbox].length === 0) {
      return null;
    }
    return this.mailboxes[mailbox].shift();
  }

  radioEmpty(mailbox) {
    if (mailbox === undefined) {
      this.mailboxes = {};
    } else if (this.mailboxes[mailbox]) {
      this.mailboxes[mailbox] = [];
    }
  }

  setHubButton(btn, state) {
    this.hubButtons[btn] = state;
  }

  getHubButtons() {
    return this.hubButtons;
  }
}
