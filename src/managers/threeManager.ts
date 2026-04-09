import {
  AmbientLight, BackSide, Camera, Color, Mesh,
  Object3D, PerspectiveCamera, Scene, ShaderMaterial,
  SphereGeometry, WebGLRenderer
} from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { SystemsManager } from "./systemsManager";

export interface ThreeManagerOptions {
  antialias?: boolean;
  skybox?: boolean;
  ambientLight?: { color: number; intensity: number } | false;
  camera?: {
    fov?: number;
    near?: number;
    far?: number;
    position?: [number, number, number];
    up?: [number, number, number];
  };
}

const DEFAULT_OPTIONS: Required<ThreeManagerOptions> = {
  antialias: false,
  skybox: true,
  ambientLight: { color: 0xffffff, intensity: 0.5 },
  camera: {
    fov: 35,
    near: 1,
    far: 50000,
    position: [0, 0, 15],
    up: [0, 0, 1],
  },
};

/**
 * Three.js scene manager singleton.
 */
export class ThreeManager {
  private static instance: ThreeManager;
  private static pendingOptions: ThreeManagerOptions = {};

  /** Call before GetInstance() to configure the manager */
  public static Configure(options: ThreeManagerOptions): void {
    ThreeManager.pendingOptions = options;
  }

  public static GetInstance(): ThreeManager {
    if (!ThreeManager.instance) {
      ThreeManager.instance = new ThreeManager(ThreeManager.pendingOptions);
    }
    return ThreeManager.instance;
  }

  public set AutoResize(autoResize: boolean) {
    if (this.autoResize === autoResize || !this.container) return;

    this.autoResize = autoResize;
    if (autoResize) {
      window.addEventListener('resize', this.resizeHandler);
    } else {
      window.removeEventListener('resize', this.resizeHandler);
    }
    this.resizeHandler();
  }

  public set Container(container: HTMLElement) {
    this.container = container;
  }

  public get Scene(): Scene { return this.scene; }
  public get Camera(): Camera { return this.camera; }
  public get Renderer(): WebGLRenderer { return this.renderer; }
  public get Controls(): OrbitControls { return this.controls; }

  private autoResize: boolean = false;
  private container?: HTMLElement;
  private resizeHandler = () => {
    this.container && this.setSize(this.container);
  };

  private renderer: WebGLRenderer;
  private scene: Scene;
  private camera: Camera;
  private controls: OrbitControls;

  private constructor(opts: ThreeManagerOptions = {}) {
    const options = { ...DEFAULT_OPTIONS, ...opts };
    const cameraOpts = { ...DEFAULT_OPTIONS.camera, ...opts.camera };

    this.scene = new Scene();
    this.renderer = new WebGLRenderer({ antialias: options.antialias });
    this.camera = this.createCamera(cameraOpts);
    this.controls = this.createOrbitControls(this.camera, this.renderer.domElement);

    if (options.ambientLight !== false) {
      const al = options.ambientLight as { color: number; intensity: number };
      this.scene.add(new AmbientLight(al.color, al.intensity));
    }

    if (options.skybox) {
      this.addSkyBox();
    }
  }

  public setAnimationLoop() {
    if (!this.container) {
      throw new Error('Container is not set');
    }
    this.container.appendChild(this.renderer.domElement);
    const instance = SystemsManager.GetInstance();
    instance.start();
    this.renderer.setAnimationLoop((time: DOMHighResTimeStamp) => {
      instance.update(time);
      this.renderer.render(this.scene, this.camera);
      instance.lateUpdate();
    });
  }

  public unsetAnimationLoop() {
    this.renderer.setAnimationLoop(null);
    SystemsManager.GetInstance().stop();
  }

  public appendToScene(obj: Object3D) {
    if (obj.parent !== this.scene) {
      this.scene.add(obj);
    }
  }

  public removeFromScene(obj: Object3D) {
    this.scene.remove(obj);
  }

  private setSize(container: HTMLElement) {
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    if (this.camera instanceof PerspectiveCamera) {
      this.camera.aspect = container.clientWidth / container.clientHeight;
      this.camera.updateProjectionMatrix();
    }
  }

  private createCamera(opts: Required<ThreeManagerOptions>['camera']): Camera {
    const camera = new PerspectiveCamera(
      opts.fov ?? 35,
      1,
      opts.near ?? 1,
      opts.far ?? 500
    );
    const up = opts.up ?? [0, 0, 1];
    const pos = opts.position ?? [0, 0, 15];
    camera.up.set(up[0], up[1], up[2]);
    camera.position.set(pos[0], pos[1], pos[2]);
    return camera;
  }

  private createOrbitControls(camera: Camera, canvas: HTMLElement): OrbitControls {
    const controls = new OrbitControls(camera, canvas);
    controls.rotateSpeed = 0.75;
    controls.target.set(0, 0, 0);
    return controls;
  }

  private addSkyBox() {
    const skyGeo = new SphereGeometry(ThreeManager.pendingOptions.camera?.far ?? 500, 32, 32);
    const skyMat = new ShaderMaterial({
      side: BackSide,
      uniforms: {
        topColor: { value: new Color(0x4682b4) },
        bottomColor: { value: new Color(0xdeb887) },
      },
      vertexShader: `
        varying vec3 vPosition;
        void main() {
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vPosition;
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        void main() {
          float h = normalize(vPosition).y * 0.5 + 0.5;
          gl_FragColor = vec4(mix(bottomColor, topColor, h), 1.0);
        }
      `,
    });
    this.scene.add(new Mesh(skyGeo, skyMat));
  }
}
