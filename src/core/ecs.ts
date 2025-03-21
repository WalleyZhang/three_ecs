abstract class Data {
  /** 数据是否被销毁 */
  public get destroyed(): boolean {
    return this._destroyed;
  }
  public set destroyed(value: boolean) {
    this._destroyed = value;
  }

  protected _destroyed: boolean = false;
}

//#region Component
export interface ComponentConstructor<T extends Component> {
  new (...args: any[]): T;
  CompName: string;
}
/** 组件：只包含数据，不包含逻辑 */
export abstract class Component extends Data {
  /** 组件的名称，需要确保全局唯一，默认值为 "Component" */
  public static CompName: string = "Component";

  /** 组件所属的实体 */
  public entity: Entity | null = null;
}

//#endregion

//#region Entity
export interface EntityConstructor<T extends Entity> {
  new (...args: any[]): T;
  EntityName: string;
}
/** 实体：容纳组件的容器 */
export abstract class Entity extends Data {
  /** 实体名称，默认为"Entity"，需要确保唯一 */
  public static EntityName: string = "Entity";
  /** 实体的唯一ID，未指定时默认为-1 */
  public id: number = -1;

  /** 实体上的组件 */
  public components: Map<string, Component> = new Map();

  // 只涉及数据的方法可以在内部定义
  /** 添加组件到此实体(同一类组件只能有一个) */
  public addComponent<T extends Component>(component: T): T {
    component.entity = this;
    this.components.set(
      (component.constructor as ComponentConstructor<T>).CompName,
      component
    );
    return component;
  }
  /** 移除组件：todo 暂时不需要动态移除组件 */
  public removeComponent<T extends Component>(component: T): boolean {
    if (
      this.components.has(
        (component.constructor as ComponentConstructor<T>).CompName
      )
    ) {
    }
    return false;
  }
}

//#endregion

//#region System
/** 系统：处理实体上的组件 */
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
//#endregion
