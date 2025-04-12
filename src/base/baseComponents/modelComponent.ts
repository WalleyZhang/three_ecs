import { Component } from "../../core";
import { Group } from "three";

export class ModelComponent extends Component {
  public static CompName = "ModelComponent";
  public model: Group;
  public constructor() {
    super();
    this.model = new Group();
  }
}