import { AmbientLight, Camera, Color, Mesh, PerspectiveCamera, Scene, WebGLRenderer } from "three";
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
  private constructor() {
    this.scene = new Scene();

    this.scene.background = new Color('floralwhite');

    // ✅ 添加环境光（基础全局亮度）
    const ambientLight = new AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    // 默认使用透视相机
    this.camera = new PerspectiveCamera(
      35,
      1,
      1,
      50000
    );
    this.camera.up.set(0, 0, 1);
    this.camera.position.set(0, 0, 15);
    this.camera.lookAt(0, 0, 0);

    // 默认不启用抗锯齿，以提高性能
    this.renderer = new WebGLRenderer();
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
  public appendToScene(mesh: Mesh) {
    if (mesh.parent !== this.scene) {
      this.scene.add(mesh);
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
}