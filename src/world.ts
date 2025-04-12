import { MoveSystem, VisibleEntity } from "./base";
import { EventSystem } from "./base/baseSystems/eventSystem";
import { EntitiesManager, EventManager, StateManager, SystemsManager, ThreeManager } from "./managers";

/** 引擎与外部的结合点 */
export class World {

  public get systemsManager(): SystemsManager { return this.managers.systemM }
  public get eventManager(): EventManager { return this.managers.eventM }

  private container: HTMLElement;
  private managers: {
    entitiesM: EntitiesManager,
    systemM: SystemsManager,
    threeM: ThreeManager,
    eventM: EventManager,
    stateM: StateManager
  }
  public constructor(container: HTMLElement) {
    this.container = container;

    this.managers = {
      entitiesM: EntitiesManager.GetInstance(),
      systemM: SystemsManager.GetInstance(),
      threeM: ThreeManager.GetInstance(),
      eventM: EventManager.GetInstance(),
      stateM: StateManager.GetInstance()
    }
    this.managers.threeM.Container = this.container;
  }

  public start() {
    // 开启场景大小自适应容器大小
    this.managers.threeM.AutoResize = true;
    // 启动three的循环渲染
    this.managers.threeM.setAnimationLoop()

    // 内置的系统注册
    this.managers.systemM.registerSystem(MoveSystem.GetInstance())
    this.managers.systemM.registerSystem(EventSystem.GetInstance())
  }

  public stop() {
    // 停止three的循环渲染
    this.managers.threeM.unsetAnimationLoop()
  }

  /** 创建一个场景中可见的实体 */
  public createVisibleEntity(): VisibleEntity {
    const ve = new VisibleEntity();
    this.managers.entitiesM.addEntity(ve);
    this.managers.threeM.appendToScene(ve.modelComponent.model);
    return ve
  }

}
