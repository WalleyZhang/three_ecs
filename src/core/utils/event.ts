import { Component, Entity } from "../ecs";

type EventCallback<T = any> = (payload: T) => void;

class Events {
  static instance: Events | null = null;
  private events: Map<EventType, Set<EventCallback>> = new Map();

  private constructor() {}

  static getInstance(): Events {
    if (!Events.instance) {
      Events.instance = new Events();
    }
    return Events.instance;
  }

  public on<T>(eventType: EventType, callback: EventCallback<T>) {
    if (!this.events.has(eventType)) {
      this.events.set(eventType, new Set());
    }
    this.events.get(eventType)!.add(callback);
  }

  public emit<T>(eventType: EventType, payload: T) {
    this.events.get(eventType)?.forEach((callback) => callback(payload));
  }

  public off<T>(eventType: EventType, callback: EventCallback<T>) {
    this.events.get(eventType)?.delete(callback);
  }

  public clear() {
    this.events.clear();
  }
}

export enum EventType {
  ENTITY_COMPONENT_ADDED = "entity_component_added",
  ENTITY_COMPONENT_REMOVED = "entity_component_removed",
  ENTITY_ADDED = "entity_created",
  ENTITY_REMOVED = "entity_removed",
  SYSTEM_ADDED = "system_added",
  SYSTEM_REMOVED = "system_removed",
}

/** 引擎内部事件管理器 */
export const internalEvents = Events.getInstance();
export namespace PayloadTypes {
  export type AddComponent = {
    entity: Entity;
    components: Component[];
    compNames: string[];
  };
}
