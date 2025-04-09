import { EntitiesManager } from "./core/managers/entitiesManager";
import { SystemsManager } from "./core/managers/systemsManager";
import { ThreeManager } from "./core/managers/threeManager";

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

  public init() {

  }

  /** 开启场景大小自适应容器大小 */
  public autoResize(autoResize: boolean): void {
    this.managers.tm.AutoResize = autoResize;
  }
}
