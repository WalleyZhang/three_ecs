import { MoveSystem, VisibleEntity } from "./base";
import { EventSystem } from "./base/baseSystems/eventSystem";
import { EntitiesManager, EventManager, StateManager, SystemsManager, ThreeManager } from "./managers";

/**
 * World类 - ECS引擎的核心类，管理整个游戏世界的生命周期
 *
 * World实例封装了所有ECS管理器，并提供统一的接口来控制整个ECS系统。
 * 每个World实例可以独立运行，也可以共享全局管理器。
 *
 * @example
 * ```typescript
 * const world = new World(container);
 * world.start();
 *
 * const entity = world.createVisibleEntity();
 * // ... 配置实体 ...
 *
 * world.stop();
 * world.destroy();
 * ```
 */
export class World {

  public get systemsManager(): SystemsManager { return this.managers.systemM }
  public get eventManager(): EventManager { return this.managers.eventM }
  public get entitiesManager(): EntitiesManager { return this.managers.entitiesM }
  public get threeManager(): ThreeManager { return this.managers.threeM }
  public get stateManager(): StateManager { return this.managers.stateM }

  /** 是否已启动 */
  public get isRunning(): boolean { return this._isRunning }
  /** 是否已暂停 */
  public get isPaused(): boolean { return this._isPaused }

  private container: HTMLElement;
  private _isRunning: boolean = false;
  private _isPaused: boolean = false;
  private managers: {
    entitiesM: EntitiesManager,
    systemM: SystemsManager,
    threeM: ThreeManager,
    eventM: EventManager,
    stateM: StateManager
  }

  /**
   * 创建一个新的World实例
   * @param container Three.js渲染容器，必须是有效的DOM元素
   * @param useGlobalManagers 是否使用全局单例管理器（默认为true以保持向后兼容）。
   *                         如果为false，将为每个World实例创建独立的非单例管理器（目前未实现）
   * @throws Error 当container无效或useGlobalManagers为false时
   */
  public constructor(container: HTMLElement, useGlobalManagers: boolean = true) {
    this.container = container;

    if (useGlobalManagers) {
      // 使用全局单例管理器（原有行为）
      this.managers = {
        entitiesM: EntitiesManager.GetInstance(),
        systemM: SystemsManager.GetInstance(),
        threeM: ThreeManager.GetInstance(),
        eventM: EventManager.GetInstance(),
        stateM: StateManager.GetInstance()
      }
    } else {
      // 为每个World实例创建独立的非单例管理器
      throw new Error("独立的非单例管理器尚未实现，请使用全局管理器模式");
    }

    this.managers.threeM.Container = this.container;
  }

  /**
   * 启动World
   * @throws Error 如果World已经启动
   */
  public start(): void {
    if (this._isRunning) {
      throw new Error("World is already running");
    }

    try {
      // 开启场景大小自适应容器大小
      this.managers.threeM.AutoResize = true;
      // 启动three的循环渲染
      this.managers.threeM.setAnimationLoop();

      // 内置的系统注册
      this.managers.systemM.registerSystem(MoveSystem.GetInstance());
      this.managers.systemM.registerSystem(EventSystem.GetInstance());

      this._isRunning = true;
      this._isPaused = false;

      this.eventManager.dispatch('world_started', { world: this });
    } catch (error) {
      this._isRunning = false;
      throw error;
    }
  }

  /**
   * 停止World
   */
  public stop(): void {
    if (!this._isRunning) {
      return;
    }

    this.managers.threeM.unsetAnimationLoop();
    this.managers.systemM.Stop();

    this._isRunning = false;
    this._isPaused = false;

    this.eventManager.dispatch('world_stopped', { world: this });
  }

  /**
   * 暂停World
   */
  public pause(): void {
    if (!this._isRunning || this._isPaused) {
      return;
    }

    this.managers.systemM.Pause();
    this._isPaused = true;

    this.eventManager.dispatch('world_paused', { world: this });
  }

  /**
   * 恢复World
   */
  public resume(): void {
    if (!this._isRunning || !this._isPaused) {
      return;
    }

    this._isPaused = false;
    this.eventManager.dispatch('world_resumed', { world: this });
  }

  /**
   * 销毁World，清理所有资源
   */
  public destroy(): void {
    this.stop();

    // 清理所有实体
    const entities = this.entitiesManager.getAllEntities();
    entities.forEach(entity => {
      this.entitiesManager.removeEntity(entity);
    });

    // 清理事件监听器
    this.eventManager.removeAllListeners();

    this.eventManager.dispatch('world_destroyed', { world: this });
  }

  /** 创建一个场景中可见的实体 */
  public createVisibleEntity(): VisibleEntity {
    const ve = new VisibleEntity();
    this.managers.entitiesM.addEntity(ve);
    this.managers.threeM.appendToScene(ve.modelComponent.model);
    return ve
  }

}
