import { System } from "@engine/core/ecs";
import { TransformComponent } from "@engine/baseComponents/transformComponent"
import { VelocityComponent } from "../components/velocityComponent";


/** 控制模型的移动 */
export class MoveSystem extends System {

  private static instance: MoveSystem;

  public layer: number = 1;

  public static GetInstance(): MoveSystem {
    if (!MoveSystem.instance) {
      MoveSystem.instance = new MoveSystem();
    }
    return MoveSystem.instance;
  }

  private constructor() {
    super();
  }

  public Start(): void {
  }

  /** 系统逻辑，目前只实现了 平移 */
  public Update(delta: number): void {
    const entities = this.entitiesM.getEntitiesWithComponent([VelocityComponent.CompName])?.values()
    if (!entities) return
    for (const entity of entities) {
      const velocity = entity.components.get(VelocityComponent.CompName) as VelocityComponent
      const transform = entity.components.get(TransformComponent.CompName) as TransformComponent

      const deltaS = delta / 1000
      transform.position.x += velocity.x * deltaS
      transform.position.y += velocity.y * deltaS
      transform.position.z += velocity.z * deltaS
    }

  }

  public LatedUpdate(): void {
  }
  public Pause(): void {
  }
  public Stop(): void {
  }
}