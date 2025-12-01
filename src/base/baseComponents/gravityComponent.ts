import { Component } from "../../core";

/** 速度组件 */
export class GravityComponent extends Component {
  public static CompName = "GravityComponent";

  public enabled: boolean = true;
  public gravity: number = -9.8;

  public constructor(enabled: boolean = true, gravity: number = -9.8) {
    super();
    this.enabled = enabled;
    this.gravity = gravity;
  }
}