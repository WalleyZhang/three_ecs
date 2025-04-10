import { Component } from "../core/ecs";
import { Mesh } from "three";

export class MeshComponent extends Component {
  public static CompName = "MeshComponent";
  public mesh: Mesh;
  public constructor(mesh?: Mesh) {
    super();
    this.mesh = mesh || new Mesh();
  }
}