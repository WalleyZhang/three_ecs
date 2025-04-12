import { Component, System } from "core";
import { EntitiesManager, SystemsManager } from "base";

// 创建一个测试用的 Component 和 Entity
export class TestComponent1 extends Component {
  public static CompName = "TestComponent1";
  public value: number = 0;
}
export class TestComponent2 extends Component {
  public static CompName = "TestComponent2";
  public value: string = "abc";
}


export class TestSystem1 extends System {
  public layer: number = 0;
  /** 运行时间，从 0 开始 */
  public runTime: number = 0;
  public Start(): void { }
  public Update(delta: number): void {
    this.runTime += delta;
  }
  public LatedUpdate(delta: number): void { }
  public Pause(): void { }
  public Stop(): void { }
}
export class TestSystem2 extends System {
  public layer: number = 0;
  /** 运行时间，从 1 开始 */
  public runTime: number = 1;
  public Start(): void { }
  public Update(delta: number): void {
    this.runTime += delta;
  }
  public LatedUpdate(delta: number): void { }
  public Pause(): void { }
  public Stop(): void { }
}

export const em = EntitiesManager.GetInstance();

export const sm = SystemsManager.GetInstance();
