namespace ECS {
  /** 系统：处理包含特定组件的实体 */
  export abstract class System {

    /** 系统优先级（建议 0-10 之间）：越大越先更新，同级更新顺序不定 */
    public abstract layer: number;

    /** 系统启动 */
    public abstract Start(): void;
    /** 系统更新 */
    public abstract Update(delta: number): void;
    /** 系统暂停 */
    public abstract Pause(): void;
    /** 系统停止 */
    public abstract Stop(): void;
  }
}