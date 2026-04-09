import { Component, System } from "core";
import { EntitiesManager, SystemsManager } from "base";

// Test fixtures: Component and System stubs
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
  /** Accumulated run time, starts at 0 */
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
  /** Accumulated run time, starts at 1 */
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
