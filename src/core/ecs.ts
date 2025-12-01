import { EntitiesManager, EventManager } from "../managers";
import { AlreadyExistsError } from "../types/exception";
import { InternalEventPayload, InternalEvent } from "../types/internalEventMap";

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
  new(...args: any[]): T;
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
/** 实体：容纳组件的容器 */
export class Entity extends Data {

  private static id = 1;
  private static eventM: EventManager | undefined;

  /** 实体的唯一ID */
  public readonly id: number;
  /** 实体名称 */
  public name: string = "Entity";
  /** 实体上的组件 */
  public components: Map<string, Component> = new Map();

  // 只涉及数据的方法可以在内部定义

  public constructor() {
    super();
    this.id = Entity.id++;
    if (!Entity.eventM) {
      Entity.eventM = EventManager.GetInstance();
    }
  }

  /** 添加组件到此实体：参数只接收数组，批量添加组件以提高效率 */
  public addComponents<T extends Component>(components: T[]): T[] {
    const compNames = [];
    for (const component of components) {
      compNames.push(this.addComponent(component));
    }

    Entity.eventM!.dispatch<InternalEventPayload[InternalEvent.ENTITY_COMPONENT_ADDED]>(
      InternalEvent.ENTITY_COMPONENT_ADDED,
      {
        entity: this,
        components: components,
        compNames: compNames,
      }
    );
    return components;
  }


  public removeComponents<T extends Component>(components: T[]): boolean {
    const toBeRemoved: Component[] = [];
    for (const component of components) {
      if (
        this.components.has(
          (component.constructor as ComponentConstructor<T>).CompName
        )
      ) {
        toBeRemoved.push(component);
      }
    }
    if (
      toBeRemoved.length > 0
    ) {
      Entity.eventM!.dispatch<InternalEventPayload[InternalEvent.ENTITY_COMPONENT_REMOVED]>(
        InternalEvent.ENTITY_COMPONENT_REMOVED,
        {
          entity: this,
          components: toBeRemoved
        }
      );
      return true;
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

  /** 系统优先级（0-49 数据-物理-逻辑-动画-渲染）：越小越先更新 */
  public abstract layer: number;

  /** 实体管理器实例，用于获取实体 */
  protected entitiesM: EntitiesManager;

  public constructor() {
    this.entitiesM = EntitiesManager.GetInstance();
  }

  /** 系统启动 */
  public abstract Start(): void;
  /** 系统更新：每一帧的渲染帧之前执行 */
  public abstract Update(delta: number): void;
  /** 系统延迟更新：每一帧的渲染帧之后执行 */
  public abstract LatedUpdate(delta: number): void;
  /** 系统暂停 */
  public abstract Pause(): void;
  /** 系统停止 */
  public abstract Stop(): void;
}
//#endregion
