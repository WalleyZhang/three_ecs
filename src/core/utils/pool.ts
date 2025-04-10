import {
  Component,
  ComponentConstructor,
  Entity,
} from "../ecs";

/** 
 * 缓存池：单例模式 
 * todo:当前未使用，待扩展
 **/
export class Pool {
  // 静态实例
  private static instance: Pool | undefined;

  private componentPool: Map<string, Component[]>;
  private entityPool: Map<string, Entity[]>;

  // 私有构造函数，防止外部实例化
  private constructor() {
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

  /** 从缓存池中获取一个 Entity 实例 */
  public getEntity() {
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
