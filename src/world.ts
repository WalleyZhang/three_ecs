import { BaseEntity } from "./baseEntities/baseEntity";
import { EntitiesManager } from "./managers/entitiesManager";
import { SystemsManager } from "./managers/systemsManager";
import { ThreeManager } from "./managers/threeManager";

/** 引擎与外部的结合点 */
export class World {
  private container: HTMLElement;
  private managers: {
    em: EntitiesManager,
    sm: SystemsManager,
    tm: ThreeManager
  }
  public constructor(container: HTMLElement) {
    this.container = container;

    this.managers = {
      em: EntitiesManager.GetInstance(),
      sm: SystemsManager.GetInstance(),
      tm: ThreeManager.GetInstance()
    }
    this.managers.tm.Container = this.container;
  }

  public start() {
    // 开启场景大小自适应容器大小
    this.managers.tm.AutoResize = true;
    // 启动three的循环渲染
    this.managers.tm.setAnimationLoop()
  }

  public stop() {
    // 停止three的循环渲染
    this.managers.tm.unsetAnimationLoop()
  }

  /** 创建一个空的实体 */
  public createEntity(): BaseEntity {
    return this.managers.em.addEntity(new BaseEntity()) as BaseEntity;
  }

}
