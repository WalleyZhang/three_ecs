import { EventType, internalEvents, PayloadTypes } from "./utils/event";
import { AlreadyExistsError } from "./utils/exception";

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
  private static id = 1;

  /** 实体的唯一ID，未指定时默认为-1 */
  public readonly id: number;

  /** 实体上的组件 */
  public components: Map<string, Component> = new Map();

  // 只涉及数据的方法可以在内部定义

  public constructor() {
    super();
    this.id = Entity.id++;
  }

  /** 添加组件到此实体：参数只接收数组，批量添加组件以提高效率 */
  public addComponents<T extends Component>(components: T[]): T[] {
    const compNames = [];
    for (const component of components) {
      compNames.push(this.addComponent(component));
    }
    internalEvents.emit<PayloadTypes.AddComponent>(
      EventType.ENTITY_COMPONENT_ADDED,
      {
        entity: this,
        components: components,
        compNames: compNames,
      }
    );
    return components;
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

  private addComponent<T extends Component>(component: T): string {
    const compN = (component.constructor as ComponentConstructor<T>).CompName;
    if (this.components.has(compN)) {
      throw new AlreadyExistsError(
        `Component ${compN} already exists in entity ${this.id}`
      );
    }
    component.entity = this;
    this.components.set(compN, component);
    return compN;
  }
}

//#endregion

//#region System
/** 系统：处理实体上的组件 */
export abstract class System {
  /** 系统优先级（0-4 数据-物理-逻辑-动画-渲染）：越小越先更新，同级更新顺序不定 */
  public abstract layer: number;

  /** 系统启动 */
  public abstract Start(): void;
  /** 系统更新 */
  public abstract Update(delta: number): void;
  /** 系统延迟更新：在Update之后，用于处理有依赖的更新 */
  public abstract LatedUpdate(delta: number): void;
  /** 系统暂停 */
  public abstract Pause(): void;
  /** 系统停止 */
  public abstract Stop(): void;
}
//#endregion
