import { Camera, Color, PerspectiveCamera, Scene, WebGLRenderer } from "three";

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

    // 默认使用透视相机
    this.camera = new PerspectiveCamera(
      35,
      1,
      1,
      50000
    );
    this.camera.up.set(0, 0, 1);
    this.camera.position.set(0, 3000, 3000);

    // 默认不启用抗锯齿，以提高性能
    this.renderer = new WebGLRenderer();
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