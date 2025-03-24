import { Component, Entity } from "../core/ecs";
import { Pool } from "../core/utils/pool";
import { EntitiesManager } from "../core/managers/entitiesManager";

// 创建一个测试用的 Component 和 Entity
export class TestComponent1 extends Component {
  public static CompName = "TestComponent1";
  public value: number = 0;
}
export class TestComponent2 extends Component {
  public static CompName = "TestComponent2";
  public value: string = "abc";
}

export class TestEntity1 extends Entity {
  public static EntityName = "TestEntity1";
}

export class TestEntity2 extends Entity {
  public static EntityName = "TestEntity2";
}

export const pool = Pool.GetInstance();

export const em = EntitiesManager.GetInstance();
