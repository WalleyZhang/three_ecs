import {
  Component,
  ComponentConstructor,
  Entity,
} from "../core";
import { EmptyError } from "../types/exception";
import { InternalEvent, InternalEventPayload } from "../types/internalEventMap";
import { EventManager } from "./eventManager";

/**
 * 管理所有实体的单例
 */
export class EntitiesManager {
  private static instance: EntitiesManager;
  /** 所有实体：稀疏数组 */
  private entities: (Entity | undefined)[] = [];
  /**固定的组件索引：用于快速定位拥有某个组件的实体*/
  private componentIndex: Map<string, Set<Entity>>;

  private constructor() {
    this.entities = [];
    this.componentIndex = new Map();
    EventManager.GetInstance().addEventListener(
      InternalEvent.ENTITY_COMPONENT_ADDED,
      this.addComponentHandler
    );
    EventManager.GetInstance().addEventListener(
      InternalEvent.ENTITY_COMPONENT_REMOVED,
      this.removeComponentHandler
    );
  }

  public static GetInstance(): EntitiesManager {
    if (!EntitiesManager.instance) {
      EntitiesManager.instance = new EntitiesManager();
    }
    return EntitiesManager.instance;
  }

  /** 添加实体的唯一入口 */
  public addEntity(entity: Entity): Entity {
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

  /** 获取所有活跃的实体 */
  public getAllEntities(): Entity[] {
    return this.entities.filter(entity => entity !== undefined) as Entity[];
  }

  /** 获取实体总数 */
  public getEntityCount(): number {
    return this.entities.filter(entity => entity !== undefined).length;
  }

  /** 获取拥有特定组件的实体数量 */
  public getEntityCountWithComponent(compName: string): number {
    return this.componentIndex.get(compName)?.size || 0;
  }

  /**
   * 重置管理器，清理所有实体和索引
   * 注意：此方法不会清理事件监听器，因为它们在构造函数中设置
   */
  public reset() {
    // 销毁所有实体
    this.entities.forEach(entity => {
      if (entity) {
        // 标记实体为已销毁
        entity.destroyed = true;
      }
    });

    this.entities = [];
    this.componentIndex = new Map();
  }

  /** 实体新增组件处理器：箭头函数确保 this 指向正确 */
  private addComponentHandler = (payload: InternalEventPayload[InternalEvent.ENTITY_COMPONENT_ADDED]) => {
    const { entity, compNames } = payload;
    for (const compName of compNames) {
      const index = this.componentIndex.get(compName) || new Set();
      if (!this.componentIndex.has(compName)) {
        this.componentIndex.set(compName, index);
      }
      index.add(entity);
    }
  };

  /** 实体删除组件处理器：箭头函数确保 this 指向正确 */
  private removeComponentHandler = (payload: InternalEventPayload[InternalEvent.ENTITY_COMPONENT_REMOVED]) => {
    const { entity, components } = payload;
    for (const component of components) {
      const compName = (
        component.constructor as ComponentConstructor<Component>
      ).CompName;
      const index = this.componentIndex.get(compName);
      index?.delete(entity);
    }
  }
}
