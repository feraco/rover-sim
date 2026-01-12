import * as BABYLON from 'babylonjs';

export class WorldBase {
  constructor() {
    this.name = 'base';
    this.shortDescription = 'Base world';
    this.longDescription = '<p>This world is used as a base for other worlds.</p>';
    this.options = {};
    this.animationList = [];
    this.renderTime = 0;
    this.animate = true;
    this.scene = null;

    this.robotStart = {
      position: new BABYLON.Vector3(0, 0, 0),
      rotation: new BABYLON.Vector3(0, 0, 0)
    };

    this.arenaStart = [
      {
        position: new BABYLON.Vector3(0, 0, 0),
        rotation: new BABYLON.Vector3(0, 0, 0)
      },
      {
        position: new BABYLON.Vector3(0, 0, 0),
        rotation: new BABYLON.Vector3(0, 0, 0)
      },
      {
        position: new BABYLON.Vector3(0, 0, 0),
        rotation: new BABYLON.Vector3(0, 0, 0)
      },
      {
        position: new BABYLON.Vector3(0, 0, 0),
        rotation: new BABYLON.Vector3(0, 0, 0)
      }
    ];

    this.defaultOptions = {
      imageURL: '',
      groundType: 'box',
      length: 100,
      width: 100,
      uScale: 1,
      vScale: 1,
      imageScale: 1,
      timer: 'none',
      timerDuration: 60,
      timerEnd: 'continue',
      wall: true,
      wallHeight: 7.7,
      wallThickness: 4.5,
      wallColor: '#1A1A1A',
      groundFriction: 1,
      wallFriction: 0.1,
      groundRestitution: 0.0,
      wallRestitution: 0.1,
      restartAnimationOnRun: false,
      objects: [],
      startPos: 'center',
      startPosXYZStr: '',
      startRotStr: '',
      startPosXYZ: null,
      startRot: null,
      arenaStartPosXYZ: null,
      arenaStartRot: null
    };

    this.objectDefault = {
      type: 'box',
      position: [0, 0, 0],
      rotationMode: 'degrees',
      rotation: [0, 0, 0],
      animationMode: 'none',
      animationKeys: [],
      size: [10, 10, 10],
      modelURL: '',
      modelScale: 10,
      modelAnimation: 'None',
      color: '#80E680',
      imageType: 'repeat',
      imageURL: '',
      uScale: 1,
      vScale: 1,
      physicsOptions: 'fixed',
      magnetic: false,
      laserDetection: null,
      ultrasonicDetection: null,
      receiveShadows: false,
      castShadows: false,
      isPickable: true
    };

    this.physicsDefault = {
      mass: 0,
      friction: 0.1,
      restitution: 0.1,
      dampLinear: 0,
      dampAngular: 0,
      group: 1,
      mask: -1
    };
  }

  mergeOptionsWithDefault(options) {
    Object.assign(this.options, this.defaultOptions);
    for (const name in options) {
      if (typeof this.options[name] === 'undefined') {
        console.log('Unrecognized option: ' + name);
      } else {
        this.options[name] = options[name];
      }
    }
  }

  setOptions(options) {
    this.options = { ...this.defaultOptions, ...options };
  }

  async load(scene) {
    this.scene = scene;
    this.mergeOptionsWithDefault(this.options);
    await this.loadGround();
    await this.loadWalls();
    await this.loadObjects();
  }

  async loadGround() {
    if (this.options.groundType === 'none') {
      return;
    }

    const groundMat = new BABYLON.StandardMaterial('ground', this.scene);
    if (this.options.imageURL) {
      groundMat.diffuseTexture = new BABYLON.Texture(
        this.options.imageURL,
        this.scene
      );
      groundMat.diffuseTexture.uScale = this.options.uScale;
      groundMat.diffuseTexture.vScale = this.options.vScale;
    } else {
      groundMat.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.3);
    }
    groundMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);

    let ground;
    if (this.options.groundType === 'box') {
      ground = BABYLON.MeshBuilder.CreateBox(
        'ground',
        {
          height: 10,
          width: this.options.width,
          depth: this.options.length
        },
        this.scene
      );
      ground.position.y = -5;
    } else if (this.options.groundType === 'cylinder') {
      ground = BABYLON.MeshBuilder.CreateCylinder(
        'ground',
        {
          height: 10,
          diameter: this.options.length
        },
        this.scene
      );
      ground.position.y = -5;
    }

    ground.material = groundMat;
    ground.receiveShadows = true;

    ground.physicsImpostor = new BABYLON.PhysicsImpostor(
      ground,
      BABYLON.PhysicsImpostor.BoxImpostor,
      {
        mass: 0,
        friction: this.options.groundFriction,
        restitution: this.options.groundRestitution
      },
      this.scene
    );
  }

  async loadWalls() {
    if (!this.options.wall) {
      return;
    }

    const wallMat = new BABYLON.StandardMaterial('wall', this.scene);
    wallMat.diffuseColor = BABYLON.Color3.FromHexString(this.options.wallColor);
    wallMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);

    const height = this.options.wallHeight;
    const thickness = this.options.wallThickness;
    const length = this.options.length;
    const width = this.options.width;

    const walls = [
      { x: 0, z: (length + thickness) / 2, width: width + thickness * 2, depth: thickness },
      { x: 0, z: -(length + thickness) / 2, width: width + thickness * 2, depth: thickness },
      { x: (width + thickness) / 2, z: 0, width: thickness, depth: length },
      { x: -(width + thickness) / 2, z: 0, width: thickness, depth: length }
    ];

    walls.forEach((wallSpec, index) => {
      const wall = BABYLON.MeshBuilder.CreateBox(
        `wall${index}`,
        {
          height: height,
          width: wallSpec.width,
          depth: wallSpec.depth
        },
        this.scene
      );

      wall.position.x = wallSpec.x;
      wall.position.y = height / 2;
      wall.position.z = wallSpec.z;
      wall.material = wallMat;

      wall.physicsImpostor = new BABYLON.PhysicsImpostor(
        wall,
        BABYLON.PhysicsImpostor.BoxImpostor,
        {
          mass: 0,
          friction: this.options.wallFriction,
          restitution: this.options.wallRestitution
        },
        this.scene
      );
    });
  }

  async loadObjects() {
  }

  reset() {
    this.renderTime = 0;
  }

  render(delta) {
    if (this.animate) {
      this.renderTime += delta;
    }
  }
}
