export * as THREE from "three";

// Core ECS primitives
export { Entity, Component, System } from "./core";
export type { ComponentConstructor } from "./core";

// World
export { World } from "./world";

// Base components
export {
    MeshComponent,
    TransformComponent,
    VelocityComponent,
    GravityComponent,
} from "./base";

// Base entities
export { VisibleEntity } from "./base";

// Base systems
export { MoveSystem, GravitySystem, EventSystem } from "./base";

// Managers
export {
    EntitiesManager,
    SystemsManager,
    EventManager,
    ThreeManager,
    StateManager,
} from "./managers";
export type { ThreeManagerOptions } from "./managers";

// Types
export { InternalEvent } from "./types/internalEventMap";
export type { InternalEventPayload } from "./types/internalEventMap";
export { ExternalEvent } from "./types/externalEventMap";
export type { ExternalEventPayload } from "./types/externalEventMap";
export type { EventData } from "./types/event";
export { State } from "./types/state";
export { AlreadyExistsError, EmptyError, NotFoundError } from "./types/exception";
