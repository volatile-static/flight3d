import * as THREE from 'three/webgpu';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export type AnimationCallback = (time: number) => void;

export class SceneManager {
  public readonly scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGPURenderer;
  private controls: OrbitControls;
  private animationCallbacks = new Set<AnimationCallback>();

  constructor() {
    // Scene
    this.scene = new THREE.Scene();

    // Camera
    this.camera = new THREE.PerspectiveCamera(25, this.width / this.height, 0.1, 100);
    this.camera.position.set(-3, 3, -3);
    this.scene.add(this.camera);

    // Renderer
    this.renderer = new THREE.WebGPURenderer({ antialias: true });
    this.renderer.setPixelRatio(this.pixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor('#000011');
    document.body.appendChild(this.renderer.domElement);

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;

    // Animation loop
    this.renderer.setAnimationLoop(this.animate);

    // Resize handler
    window.addEventListener('resize', this.handleResize);
  }

  private get width() {
    return window.innerWidth;
  }

  private get height() {
    return window.innerHeight;
  }

  private get pixelRatio() {
    return Math.min(window.devicePixelRatio, 2);
  }

  private animate = (time: number) => {
    this.controls.update();
    // 调用所有注册的回调
    for (const cb of this.animationCallbacks) {
      cb(time);
    }
    this.renderer.render(this.scene, this.camera);
  };

  private handleResize = () => {
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(this.pixelRatio);
  };

  public addAnimationCallback(cb: AnimationCallback) {
    this.animationCallbacks.add(cb);
  }

  public removeAnimationCallback(cb: AnimationCallback) {
    this.animationCallbacks.delete(cb);
  }
}
