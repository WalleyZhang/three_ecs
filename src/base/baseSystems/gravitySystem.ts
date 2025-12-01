import { System } from "../../core";
import { GravityComponent } from "../baseComponents/gravityComponent";
import { VelocityComponent } from "../index"


/** 控制模型的移动 */
export class GravitySystem extends System {

  private static instance: GravitySystem;

  public layer: number = 10;

  public static GetInstance(): GravitySystem {
    if (!GravitySystem.instance) {
      GravitySystem.instance = new GravitySystem();
    }
    return GravitySystem.instance;
  }

  private constructor() {
    super();
  }

  public Start(): void {
  }

  /** 最基础的逻辑：重力加速度 */
  public Update(delta: number): void {
    const entities = this.entitiesM.getEntitiesWithComponent([GravityComponent.CompName])?.values()
    if (!entities) return
    for (const entity of entities) {
      const gravity = entity.components.get(GravityComponent.CompName) as GravityComponent
      const velocity = entity.components.get(VelocityComponent.CompName) as VelocityComponent
      if (!gravity.enabled) return
      const deltaS = delta / 1000
      velocity.y += gravity.gravity * deltaS
    }

  }

  public LatedUpdate(): void {
  }
  public Pause(): void {
  }
  public Stop(): void {
  }
}