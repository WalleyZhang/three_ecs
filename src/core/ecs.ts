import { EntitiesManager, EventManager } from "../managers";
import { AlreadyExistsError } from "../types/exception";
import { InternalEventPayload, InternalEvent } from "../types/internalEventMap";

abstract class Data {
  /** Whether this data object has been destroyed */
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
/** Component: pure data, no logic */
export abstract class Component extends Data {
  /** Globally unique component name. Defaults to "Component". */
  public static CompName: string = "Component";

  /** The entity this component is attached to */
  public entity: Entity | null = null;
}

//#endregion

//#region Entity
/** Entity: a container that holds components */
export class Entity extends Data {

  private static id = 1;
  private static eventM: EventManager | undefined;

  /** Unique entity ID */
  public readonly id: number;
  /** Entity name */
  public name: string = "Entity";
  /** Components attached to this entity, keyed by CompName */
  public components: Map<string, Component> = new Map();

  protected _parent: Entity | null = null;
  protected _children: Entity[] = [];

  public get parent(): Entity | null { return this._parent; }
  public get children(): readonly Entity[] { return this._children; }

  public constructor() {
    super();
    this.id = Entity.id++;
    if (!Entity.eventM) {
      Entity.eventM = EventManager.GetInstance();
    }
  }

  /** Add a child entity. Automatically detaches from its previous parent. */
  public add(child: Entity): this {
    if (child._parent === this) return this;
    child._parent?.remove(child);
    child._parent = this;
    this._children.push(child);
    this.onChildAdded(child);
    return this;
  }

  /** Remove a child entity. */
  public remove(child: Entity): boolean {
    const idx = this._children.indexOf(child);
    if (idx === -1) return false;
    this._children.splice(idx, 1);
    child._parent = null;
    this.onChildRemoved(child);
    return true;
  }

  /** Override in subclasses to react to child additions (e.g. scene graph sync). */
  protected onChildAdded(_child: Entity): void {}
  /** Override in subclasses to react to child removals (e.g. scene graph sync). */
  protected onChildRemoved(_child: Entity): void {}

  /** Add a single component to this entity */
  public addComponent<T extends Component>(component: T): T {
    return this.addComponents([component])[0];
  }

  /** Batch-add multiple components */
  public addComponents<T extends Component>(components: T[]): T[] {
    const compNames = [];
    for (const component of components) {
      compNames.push(this.attachComponent(component));
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

  /** Remove a single component from this entity */
  public removeComponent<T extends Component>(component: T): boolean {
    return this.removeComponents([component]);
  }

  /** Batch-remove multiple components */
  public removeComponents<T extends Component>(components: T[]): boolean {
    const removed: Component[] = [];
    for (const component of components) {
      const compName = (component.constructor as ComponentConstructor<T>).CompName;
      if (this.components.has(compName)) {
        this.components.delete(compName);
        component.entity = null;
        removed.push(component);
      }
    }
    if (removed.length > 0) {
      Entity.eventM!.dispatch<InternalEventPayload[InternalEvent.ENTITY_COMPONENT_REMOVED]>(
        InternalEvent.ENTITY_COMPONENT_REMOVED,
        { entity: this, components: removed }
      );
      return true;
    }
    return false;
  }

  /** Type-safe component retrieval by constructor */
  public getComponent<T extends Component>(ctor: ComponentConstructor<T>): T | undefined {
    return this.components.get(ctor.CompName) as T | undefined;
  }

  /** Check if this entity has a component of the given type */
  public hasComponent<T extends Component>(ctor: ComponentConstructor<T>): boolean {
    return this.components.has(ctor.CompName);
  }

  /** Internal: link a component to this entity and register it by CompName. Throws if duplicate. */
  private attachComponent<T extends Component>(component: T): string {
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
/** System: processes components on entities */
export abstract class System {

  /** Execution priority (0-49: data-physics-logic-animation-render). Lower runs first. */
  public abstract layer: number;

  /** EntitiesManager instance for querying entities */
  protected entitiesM: EntitiesManager;

  public constructor() {
    this.entitiesM = EntitiesManager.GetInstance();
  }

  /** Called once when the system is registered */
  public abstract start(): void;
  /** Called every tick with delta in ms (fixed or variable depending on SystemsManager config) */
  public abstract update(delta: number): void;
  /** Called once per frame after rendering */
  public abstract lateUpdate(delta: number): void;
  /** Called when the world is paused */
  public abstract pause(): void;
  /** Called when the world is stopped */
  public abstract stop(): void;
}
//#endregion
