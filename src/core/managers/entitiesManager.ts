import {
  Component,
  ComponentConstructor,
  Entity,
  EntityConstructor,
} from "../ecs";
import { Pool } from "../utils/pool";
import { EventType, internalEvents, PayloadTypes } from "../utils/event";
import { EmptyError } from "../utils/exception";

/**
 * 管理所有实体的单例
 */
export class EntitiesManager {
  private static instance: EntitiesManager;
  /** 所有实体：稀疏数组 */
  private entities: (Entity | undefined)[] = [];
  /**固定的组件索引：用于快速定位拥有某个组件的实体*/
  private componentIndex: Map<string, Set<Entity>>;

  private pool: Pool;

  private constructor() {
    this.entities = [];
    this.componentIndex = new Map();
    this.pool = Pool.GetInstance();
    internalEvents.on(
      EventType.ENTITY_COMPONENT_ADDED,
      this.addComponentHandler
    );
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
    this.entities[entity.id] = entity;
    // 记录组件索引，方便快速查询拥有某个组件的实体
    for (const component of entity.components) {
      const compName = (
        component.constructor as ComponentConstructor<Component>
      ).CompName;
      const index = this.componentIndex.get(compName) || new Set();
      if (!this.componentIndex.has(compName)) {
        this.componentIndex.set(compName, index);
      }
      index.add(entity);
    }
    return entity;
  }

  /** 删除实体：若实体不存在，则返回 false */
  public removeEntity(e: Entity): boolean {
    const entity = this.entities[e.id];
    if (entity) {
      // 先从组件索引中删除
      for (const component of entity.components) {
        const compName = (
          component.constructor as ComponentConstructor<Component>
        ).CompName;
        const index = this.componentIndex.get(compName);
        index?.delete(entity);
      }
      // 再从实体数组中删除
      this.entities[entity.id] = undefined;
      // 最后回收到 Pool
      this.pool.releaseEntity(entity);
      return true;
    }
    return false;
  }

  /** 获取有特定组件的实体列表 */
  public getEntitiesWithComponent(
    compNames: string[]
  ): Set<Entity> | undefined {
    if (compNames.length === 0) {
      throw new EmptyError("compNames is empty");
    }
    const entities = this.componentIndex.get(compNames[0]);
    // 没有任何实体拥有该组件，直接返回
    if (!entities || entities.size === 0) return undefined;
    for (let i = 1; i < compNames.length; i++) {
      const index = this.componentIndex.get(compNames[i]);

      if (!index || index.size === 0) return undefined;
      entities.forEach((entity) => {
        if (!index.has(entity)) {
          entities.delete(entity);
        }
      });
    }
    return entities.size > 0 ? entities : undefined;
  }

  /** 重置管理器 */
  public reset() {
    this.entities = [];
    this.componentIndex = new Map();
  }

  /** 实体新增组件处理器：箭头函数确保 this 指向正确 */
  private addComponentHandler = (payload: PayloadTypes.AddComponent) => {
    const { entity, compNames } = payload;
    for (const compName of compNames) {
      const index = this.componentIndex.get(compName) || new Set();
      if (!this.componentIndex.has(compName)) {
        this.componentIndex.set(compName, index);
      }
      index.add(entity);
    }
  };
}
