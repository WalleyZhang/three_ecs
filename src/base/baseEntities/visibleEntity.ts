import { MeshComponent, TransformComponent } from "../index";
import { Component, Entity } from "../../core";
import { Group } from "three";

/** A scene-visible entity that owns a Three.js Group via composition */
export class VisibleEntity extends Entity {
  public readonly transformComponent: TransformComponent;
  public readonly model: Group;

  /** Convenience getter — returns the MeshComponent if one has been added. */
  public get meshComponent(): MeshComponent | undefined {
    return this.getComponent(MeshComponent);
  }

  public constructor(model?: Group) {
    super();
    this.model = model || new Group();
    this.transformComponent = new TransformComponent(
      this.model.position,
      this.model.rotation,
      this.model.scale,
    );
    this.addComponents([this.transformComponent]);
  }

  /**
   * When a MeshComponent is added, its mesh is automatically
   * attached to this entity's model Group in the scene graph.
   */
  public override addComponents<T extends Component>(components: T[]): T[] {
    const result = super.addComponents(components);
    for (const comp of result) {
      if (comp instanceof MeshComponent && comp.mesh) {
        this.model.add(comp.mesh);
      }
    }
    return result;
  }

  /**
   * When a MeshComponent is removed, its mesh is automatically
   * detached from this entity's model Group.
   */
  public override removeComponents<T extends Component>(components: T[]): boolean {
    for (const comp of components) {
      if (comp instanceof MeshComponent && comp.mesh) {
        this.model.remove(comp.mesh);
      }
    }
    return super.removeComponents(components);
  }

  /** Sync the Three.js scene graph when a child VisibleEntity is added. */
  protected override onChildAdded(child: Entity): void {
    if (child instanceof VisibleEntity) {
      this.model.add(child.model);
    }
  }

  /** Sync the Three.js scene graph when a child VisibleEntity is removed. */
  protected override onChildRemoved(child: Entity): void {
    if (child instanceof VisibleEntity) {
      this.model.remove(child.model);
    }
  }
}
