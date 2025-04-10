import { Component } from "../core/ecs";
import { Euler, Vector3 } from "three";

export class TransformComponent extends Component {
  public position: Vector3;
  public rotation: Euler;
  public scale: Vector3;
  public constructor(pos?: Vector3, rot?: Euler, scale?: Vector3) {
    super();
    this.position = pos || new Vector3(0, 0, 0);
    this.rotation = rot || new Euler(0, 0, 0);
    this.scale = scale || new Vector3(1, 1, 1);
  }
}