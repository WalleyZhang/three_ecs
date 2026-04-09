import { System } from "../../core"
import { TransformComponent, VelocityComponent } from "../index"

const TWO_PI = Math.PI * 2

export class MoveSystem extends System {

  private static instance: MoveSystem

  public layer: number = 15;

  public static GetInstance(): MoveSystem {
    if (!MoveSystem.instance) {
      MoveSystem.instance = new MoveSystem()
    }
    return MoveSystem.instance
  }

  private constructor() {
    super()
  }

  public start(): void { }

  public update(delta: number): void {
    const entities = this.entitiesM.getEntitiesWithComponent([VelocityComponent.CompName])?.values()
    if (!entities) return
    for (const entity of entities) {
      const velocity = entity.components.get(VelocityComponent.CompName) as VelocityComponent
      const transform = entity.components.get(TransformComponent.CompName) as TransformComponent

      const deltaS = delta / 1000
      transform.position.x += velocity.x * deltaS
      transform.position.y += velocity.y * deltaS
      transform.position.z += velocity.z * deltaS

      transform.rotation.x = (transform.rotation.x + velocity.rx * deltaS) % TWO_PI
      transform.rotation.y = (transform.rotation.y + velocity.ry * deltaS) % TWO_PI
      transform.rotation.z = (transform.rotation.z + velocity.rz * deltaS) % TWO_PI
    }
  }

  public lateUpdate(): void { }
  public pause(): void { }
  public stop(): void { }
}
