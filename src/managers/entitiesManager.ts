import {
  Component,
  ComponentConstructor,
  Entity,
} from "../core";
import { EmptyError } from "../types/exception";
import { InternalEvent, InternalEventPayload } from "../types/internalEventMap";
import { EventManager } from "./eventManager";

/**
 * Singleton that manages all entities and their component index.
 */
export class EntitiesManager {
  private static instance: EntitiesManager;
  /** All entities, stored as a sparse array indexed by entity ID */
  private entities: (Entity | undefined)[] = [];
  /** Component index: maps CompName to the set of entities that own it */
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

  /** Register an entity and index its existing components */
  public addEntity(entity: Entity): Entity {
    this.entities[entity.id] = entity;
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

  /** Remove an entity and clean up its component index entries. Returns false if not found. */
  public removeEntity(e: Entity): boolean {
    const entity = this.entities[e.id];
    if (entity) {
      for (const component of entity.components) {
        const compName = (
          component.constructor as ComponentConstructor<Component>
        ).CompName;
        const index = this.componentIndex.get(compName);
        index?.delete(entity);
      }
      
      this.entities[entity.id] = undefined;

      return true;
    }
    return false;
  }

  /** Get the set of entities that own all specified components */
  public getEntitiesWithComponent(
    compNames: string[]
  ): Set<Entity> | undefined {
    if (compNames.length === 0) {
      throw new EmptyError("compNames is empty");
    }
    const first = this.componentIndex.get(compNames[0]);
    if (!first || first.size === 0) return undefined;

    const result = new Set(first);
    for (let i = 1; i < compNames.length; i++) {
      const index = this.componentIndex.get(compNames[i]);
      if (!index || index.size === 0) return undefined;
      for (const entity of result) {
        if (!index.has(entity)) result.delete(entity);
      }
    }
    return result.size > 0 ? result : undefined;
  }

  /** Get all active (non-removed) entities */
  public getAllEntities(): Entity[] {
    return this.entities.filter(entity => entity !== undefined) as Entity[];
  }

  /** Get the total number of active entities */
  public getEntityCount(): number {
    return this.entities.filter(entity => entity !== undefined).length;
  }

  /** Get the count of entities that own the specified component */
  public getEntityCountWithComponent(compName: string): number {
    return this.componentIndex.get(compName)?.size || 0;
  }

  /**
   * Reset the manager, destroying all entities and clearing the index.
   * Event listeners set up in the constructor are intentionally preserved.
   */
  public reset() {
    this.entities.forEach(entity => {
      if (entity) {
        entity.destroyed = true;
      }
    });

    this.entities = [];
    this.componentIndex = new Map();
  }

  /** Handler for component-added events (arrow fn to preserve `this`) */
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

  /** Handler for component-removed events (arrow fn to preserve `this`) */
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
