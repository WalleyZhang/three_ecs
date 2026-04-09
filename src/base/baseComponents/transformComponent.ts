import { Component } from "../../core";
import { Euler, Vector3 } from "three";

export class TransformComponent extends Component {
  public static CompName = "TransformComponent";

  public position: Vector3;
  public rotation: Euler;
  public scale: Vector3;
  public constructor(pos: Vector3, rot: Euler, scale: Vector3) {
    super();
    this.position = pos;
    this.rotation = rot;
    this.scale = scale;
  }
}