import { AmbientLight, BackSide, Camera, Color, Mesh, MeshBasicMaterial, Object3D, PerspectiveCamera, Scene, ShaderMaterial, SphereGeometry, WebGLRenderer } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { SystemsManager } from "./systemsManager";

/** 
 * three 场景管理器：单例模式
 */
export class ThreeManager {
  private static instance: ThreeManager;
  public static GetInstance(): ThreeManager {
    if (!ThreeManager.instance) {
      ThreeManager.instance = new ThreeManager();
    }
    return ThreeManager.instance;
  }

  /** 自动调整渲染器尺寸和相机aspect以适配容器 */
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

  /** 场景所在的容器 */
  public set Container(container: HTMLElement) {
    this.container = container;
  }

  private autoResize: boolean = false;
  private container?: HTMLElement;
  private resizeHandler = () => {
    this.container && this.setSize(this.container);
  };

  private renderer: WebGLRenderer;
  private scene: Scene;
  private camera: Camera;
  private controls: OrbitControls;

  private constructor() {
    this.scene = new Scene();
    // 默认不启用抗锯齿，以提高性能
    this.renderer = new WebGLRenderer();
    this.camera = this.createCamera();
    this.controls = this.createOrbitControls(this.camera, this.renderer.domElement);

    // 环境光
    const ambientLight = new AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    this.addSkyBox();
  }

  /** 设置（启动） three 中的动画循环 */
  public setAnimationLoop() {
    if (!this.container) {
      throw new Error('场景容器不存在');
    }
    this.container.appendChild(this.renderer.domElement);
    const instance = SystemsManager.GetInstance();
    instance.Start();
    this.renderer.setAnimationLoop(() => {
      instance.Update();
      this.renderer.render(this.scene, this.camera);
      instance.LatedUpdate();
    });
  }

  /** 取消（停止） three 中的动画循环 */
  public unsetAnimationLoop() {
    this.renderer.setAnimationLoop(null);
    SystemsManager.GetInstance().Stop();
  }

  /** 模型添加到场景中 */
  public appendToScene(obj: Object3D) {
    if (obj.parent !== this.scene) {
      this.scene.add(obj);
    }
  }

  /** 容器尺寸发生变化时，更新渲染器尺寸和相机的aspect以适配容器 */
  private setSize(container: HTMLElement) {
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    if (this.camera instanceof PerspectiveCamera) {
      this.camera.aspect = container.clientWidth / container.clientHeight;
      this.camera.updateProjectionMatrix();
    }
  }

  /** 相机初始化 */
  private createCamera(): Camera {
    if (this.camera) return this.camera;
    const camera = new PerspectiveCamera(
      35,
      1,
      1,
      50000
    );
    camera.up.set(0, 0, 1);
    camera.position.set(0, 0, 15);
    return camera;
  }

  /** 相机控制器初始化 */
  private createOrbitControls(camera: Camera, canvas: HTMLElement): OrbitControls {
    if (this.controls) return this.controls;
    const controls = new OrbitControls(camera, canvas);
    controls.rotateSpeed = 0.75;
    controls.target.set(0, 0, 0)
    return controls;
  }

  private addSkyBox() {
    const skyGeo = new SphereGeometry(50000, 32, 32); // 大球体比立方体更自然
    const skyMat = new ShaderMaterial({
      side: BackSide,
      uniforms: {
        topColor: { value: new Color(0x4682b4) },   // 高空深蓝
        bottomColor: { value: new Color(0xdeb887) }, // 地面土色
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
          float h = normalize(vPosition).y * 0.5 + 0.5; // 把 y 归一化到 [0,1]
          gl_FragColor = vec4(mix(bottomColor, topColor, h), 1.0);
        }
      `,
    });
    const skyBox = new Mesh(skyGeo, skyMat);
    this.scene.add(skyBox);
  }
}