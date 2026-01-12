import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';

export class BabylonManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.engine = null;
    this.scene = null;
    this.camera = null;
    this.light = null;
    this.shadowGenerator = null;
    this.gui = null;
  }

  async init() {
    console.log('BabylonManager: Starting initialization...');
    this.engine = new BABYLON.Engine(this.canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true
    });
    console.log('BabylonManager: Engine created');

    this.scene = new BABYLON.Scene(this.engine);
    this.scene.clearColor = new BABYLON.Color4(0.9, 0.9, 0.9, 1);
    console.log('BabylonManager: Scene created');

    console.log('BabylonManager: Loading physics engine...');
    await this.loadPhysicsEngine();
    console.log('BabylonManager: Physics engine loaded');

    this.scene.enablePhysics(
      new BABYLON.Vector3(0, -98.1, 0),
      new BABYLON.AmmoJSPlugin()
    );
    console.log('BabylonManager: Physics enabled');

    this.setupCamera();
    this.setupLighting();
    this.setupShadows();
    console.log('BabylonManager: Camera, lighting, and shadows set up');

    this.engine.runRenderLoop(() => {
      this.scene.render();
    });

    window.addEventListener('resize', () => {
      this.engine.resize();
    });

    console.log('BabylonManager: Initialization complete!');
    return {
      engine: this.engine,
      scene: this.scene,
      camera: this.camera
    };
  }

  async loadPhysicsEngine() {
    if (!window.Ammo) {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = '/vendor/ammo/ammo-20210414.wasm.js';
        script.onload = async () => {
          if (window.Ammo) {
            window.Ammo = await window.Ammo();
            resolve();
          } else {
            reject(new Error('Ammo.js failed to load'));
          }
        };
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }
  }

  setupCamera() {
    this.camera = new BABYLON.ArcRotateCamera(
      'camera',
      -Math.PI / 2,
      Math.PI / 2.5,
      150,
      new BABYLON.Vector3(0, 0, 0),
      this.scene
    );

    this.camera.lowerRadiusLimit = 30;
    this.camera.upperRadiusLimit = 500;
    this.camera.lowerBetaLimit = 0.1;
    this.camera.upperBetaLimit = Math.PI / 2;
    this.camera.attachControl(this.canvas, true);
    this.camera.wheelPrecision = 50;
  }

  setupLighting() {
    this.light = new BABYLON.DirectionalLight(
      'light',
      new BABYLON.Vector3(-0.5, -1, -0.5),
      this.scene
    );
    this.light.position = new BABYLON.Vector3(20, 40, 20);
    this.light.intensity = 0.7;

    const hemiLight = new BABYLON.HemisphericLight(
      'hemiLight',
      new BABYLON.Vector3(0, 1, 0),
      this.scene
    );
    hemiLight.intensity = 0.6;
  }

  setupShadows() {
    this.shadowGenerator = new BABYLON.ShadowGenerator(1024, this.light);
    this.shadowGenerator.useBlurExponentialShadowMap = true;
    this.shadowGenerator.blurKernel = 32;
    this.scene.shadowGenerator = this.shadowGenerator;
  }

  setCameraMode(mode, target) {
    if (mode === 'follow' && target) {
      this.camera.lockedTarget = target;
    } else if (mode === 'top') {
      this.camera.lockedTarget = null;
      this.camera.beta = 0.1;
      this.camera.alpha = -Math.PI / 2;
    } else if (mode === 'arc') {
      this.camera.lockedTarget = null;
      this.camera.beta = Math.PI / 2.5;
    }
  }

  getMaterial(scene, color) {
    const mat = new BABYLON.StandardMaterial('mat_' + color, scene);
    mat.diffuseColor = BABYLON.Color3.FromHexString(color);
    mat.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    return mat;
  }

  dispose() {
    if (this.engine) {
      this.engine.stopRenderLoop();
      this.scene.dispose();
      this.engine.dispose();
    }
  }

  resetScene() {
    if (this.scene) {
      const meshesToRemove = this.scene.meshes.filter(
        (mesh) => !mesh.name.startsWith('ground') && !mesh.name.startsWith('wall')
      );
      meshesToRemove.forEach((mesh) => {
        if (mesh.physicsImpostor) {
          mesh.physicsImpostor.dispose();
        }
        mesh.dispose();
      });
    }
  }
}
