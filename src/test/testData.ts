import { Component, Entity } from "../core/ecs";
import { Pool } from "../core/pool";
import { EntitiesManager } from "../managers/entitiesManager";

// 创建一个测试用的 Component 和 Entity
export class TestComponent extends Component {
  static CompName = "TestComponent";
  value: number = 0;
}

export class TestEntity extends Entity {
  static EntityName = "TestEntity";
}

export const pool = Pool.GetInstance();

export const em = EntitiesManager.GetInstance();
