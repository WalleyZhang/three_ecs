import { System } from "../../core";
import { GravityComponent } from "../baseComponents/gravityComponent";
import { VelocityComponent } from "../index"

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

  public start(): void { }

  public update(delta: number): void {
    const entities = this.entitiesM.getEntitiesWithComponent([GravityComponent.CompName])?.values()
    if (!entities) return
    for (const entity of entities) {
      const gravity = entity.components.get(GravityComponent.CompName) as GravityComponent
      if (!gravity.enabled) continue
      const velocity = entity.components.get(VelocityComponent.CompName) as VelocityComponent
      const deltaS = delta / 1000
      velocity.y += gravity.gravity * deltaS
    }
  }

  public lateUpdate(): void { }
  public pause(): void { }
  public stop(): void { }
}
