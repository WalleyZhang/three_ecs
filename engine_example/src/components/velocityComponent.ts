import { Component } from "@engine/core/ecs";

/** 速度组件 */
export class VelocityComponent extends Component {
  public static CompName = "VelocityComponent";

  public x: number;
  public y: number;
  public z: number;
  public constructor(x: number, y: number, z: number) {
    super();
    this.x = x;
    this.y = y;
    this.z = z;
  }
}