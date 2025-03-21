/** 框架出入口，设计目的是将耦合度集中到此类 */
export class World {
  /** 启动引擎 */
  public Start(): void {}
  /** 暂停引擎 */
  public Pause(): void {}

  /** 更新 */
  public Update(deltaTime: number): void {}
  /** 延迟更新， Update 之后调用  */
  public LateUpdate(deltaTime: number): void {}
}
