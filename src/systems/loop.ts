import { type Camera, Clock, type Scene, type WebGLRenderer } from 'three';

interface Updatable {
  update: (deltaTime: number) => void;
}

const clock = new Clock();

/**
 * 循环系统，管理每一帧中需要更新的对象
 */
class Loop {
  public constructor(scene: Scene, camera: Camera, renderer: WebGLRenderer) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.updatables = [];
    this.lateUpdatables = [];
    this.renderer.autoClear = false;
  }

  private readonly scene: Scene;
  private readonly camera: Camera;
  private readonly renderer: WebGLRenderer;
  /**
   * 更新列表，用于更新一些需要在渲染器渲染之前更新的对象
   */
  public updatables: Updatable[];
  /**
   * 延迟更新列表，用于更新一些需要在渲染器渲染之后更新的对象
   */
  public lateUpdatables: Updatable[];

  /**
   * 启动渲染循环
   */
  public start() {
    this.renderer.setAnimationLoop(() => {
      // 获取上一帧时间间隔
      const delta = clock.getDelta();
      // 设置动画循环
      this.update(delta);
      // 初始化渲染器渲染场景
      this.renderer.render(this.scene, this.camera);
      // 延迟更新
      this.lateUpdate(delta);
    });
  }

  private update(delta: number) {
    for (const object of this.updatables) {
      object.update(delta);
    }
  }

  private lateUpdate(delta: number) {
    for (const object of this.lateUpdatables) {
      object.update(delta);
    }
  }

  /**
   * 关闭渲染循环
   */
  public stop() {
    this.renderer.setAnimationLoop(null);
  }
}

export default Loop;
