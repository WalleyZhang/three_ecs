/** 
 * 引擎内部的事件主题
 */

import type { Component, Entity } from "../core";


export enum InternalEvent {
  ENTITY_COMPONENT_ADDED = "entity_component_added",
  ENTITY_COMPONENT_REMOVED = "entity_component_removed",
  ENTITY_ADDED = "entity_created",
  ENTITY_REMOVED = "entity_removed",
  SYSTEM_ADDED = "system_added",
  SYSTEM_REMOVED = "system_removed",
}


type AddComponent = {
  entity: Entity;
  components: Component[];
  compNames: string[];
};

export type InternalEventPayload = {
  [InternalEvent.ENTITY_COMPONENT_ADDED]: AddComponent;
};