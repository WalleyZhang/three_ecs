import {
  Component,
  ComponentConstructor,
  Entity,
  EntityConstructor,
} from "../core/ecs";
import { Pool } from "../core/pool";

/**
 * 管理所有实体的单例
 */
export class EntitiesManager {
  private static instance: EntitiesManager;
  /** 这里的数组是 稀疏数组 */
  private entities: Entity[];
  /** 组件索引，快速定位拥有某个组件的实体：这里的数组是 稀疏数组 */
  private componentIndex: Map<string, Entity[]>;

  private pool: Pool;

  private constructor() {
    this.entities = [];
    this.componentIndex = new Map();
    this.pool = Pool.GetInstance();
  }

  public static GetInstance(): EntitiesManager {
    if (!EntitiesManager.instance) {
      EntitiesManager.instance = new EntitiesManager();
    }
    return EntitiesManager.instance;
  }

  /** 添加实体的唯一入口 */
  public addEntity<T extends Entity>(ec: EntityConstructor<T>): T {
    const entity = this.pool.getEntity(ec);
    // id 的唯一性由 Pool 保证
    this.entities[entity.id] = entity;
    // 记录组件索引，方便快速查询拥有某个组件的实体
    for (const component of entity.components) {
      const compName = (
        component.constructor as ComponentConstructor<Component>
      ).CompName;
      const index = this.componentIndex.get(compName) || [];
      if (this.componentIndex.get(compName)) {
        index[entity.id] = entity;
      } else {
        index[entity.id] = entity;
        this.componentIndex.set(compName, index);
      }
    }
    return entity;
  }

  /** 删除实体：若实体不存在，则返回 false */
  public removeEntityById(id: number): boolean {
    const entity = this.entities[id];
    if (entity) {
      // 先从组件索引中删除
      for (const component of entity.components) {
        const compName = (
          component.constructor as ComponentConstructor<Component>
        ).CompName;
        const index = this.componentIndex.get(compName) || [];
        delete index[id];
      }
      // 再从实体数组中删除
      delete this.entities[id];
      // 最后回收到 Pool
      this.pool.releaseEntity(entity);
      return true;
    }
    return false;
  }

  /**  */
}
