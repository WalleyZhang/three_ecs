import {
  Component,
  ComponentConstructor,
  Entity,
  EntityConstructor,
} from "./ecs";

/** 缓存池：单例模式 */
export class Pool {
  // 静态实例
  private static instance: Pool | undefined;

  private eId: number;
  private componentPool: Map<string, Component[]>;
  private entityPool: Map<string, Entity[]>;

  // 私有构造函数，防止外部实例化
  private constructor() {
    this.eId = 0;
    this.componentPool = new Map();
    this.entityPool = new Map();
  }

  /** 全局访问点 */
  public static GetInstance(): Pool {
    if (!Pool.instance) {
      Pool.instance = new Pool();
    }
    return Pool.instance;
  }

  /** 从缓存池中获取一个 Entity */
  public getEntity<T extends Entity>(ec: EntityConstructor<T>): T {
    let entity = this.entityPool.get(ec.EntityName)?.shift() as T | undefined;
    if (!entity) {
      entity = new ec();
      entity.id = this.eId++;
    }
    entity.destroyed = false;
    return entity;
  }

  /** 从缓存池中获取一个 Component */
  public getComponent<T extends Component>(cc: ComponentConstructor<T>): T {
    let component = this.componentPool.get(cc.CompName)?.shift() as
      | T
      | undefined;
    if (!component) {
      component = new cc();
    }
    component.destroyed = false;
    return component;
  }

  /** 释放一个 Entity */
  public releaseEntity(entity: Entity): void {
    entity.destroyed = true;
    const entities = this.entityPool.get(
      (entity.constructor as EntityConstructor<Entity>).EntityName
    );
    if (entities) {
      entities.push(entity);
    } else {
      this.entityPool.set(
        (entity.constructor as EntityConstructor<Entity>).EntityName,
        [entity]
      );
    }
  }

  /** 释放一个 Component */
  public releaseComponent(component: Component): void {
    component.destroyed = true;
    const components = this.componentPool.get(
      (component.constructor as ComponentConstructor<Component>).CompName
    );
    if (components) {
      components.push(component);
    } else {
      this.componentPool.set(
        (component.constructor as ComponentConstructor<Component>).CompName,
        [component]
      );
    }
  }

  /** 清空缓存池 */
  public clear(): void {
    this.componentPool.clear();
    this.entityPool.clear();
  }
}
