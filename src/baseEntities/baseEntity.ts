import { MeshComponent } from "../baseComponents/meshComponent";
import { TransformComponent } from "../baseComponents/transformComponent";
import { Entity } from "../core/ecs";
import { ThreeManager } from "../managers/threeManager";

export class BaseEntity extends Entity {
  public readonly meshComponent: MeshComponent;
  public readonly transformComponent: TransformComponent;
  public constructor() {
    super();
    this.meshComponent = new MeshComponent();
    this.transformComponent = new TransformComponent(this.meshComponent.mesh.position, this.meshComponent.mesh.rotation, this.meshComponent.mesh.scale);
    this.addComponents([this.meshComponent, this.transformComponent]);
    ThreeManager.GetInstance().appendToScene(this.meshComponent.mesh);
  }
}