import { Component } from "../../core";

/** Gravity component: applies gravitational acceleration to velocity */
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