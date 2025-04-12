import { ModelComponent, TransformComponent } from "../index";
import { Entity } from "../../core";

/** 场景中支持可视化的实体 */
export class VisibleEntity extends Entity {
  /** 实体可视化的根节点 */
  public readonly modelComponent: ModelComponent;
  /** 可视化模型在引擎中的变换属性 */
  public readonly transformComponent: TransformComponent;
  public constructor() {
    super();
    this.modelComponent = new ModelComponent();
    this.transformComponent = new TransformComponent(this.modelComponent.model.position, this.modelComponent.model.rotation, this.modelComponent.model.scale);
    this.addComponents([this.modelComponent, this.transformComponent]);
  }
}