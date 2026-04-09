import { Entity, System } from "./core";
import { MoveSystem, VisibleEntity } from "./base";
import { EventSystem } from "./base/baseSystems/eventSystem";
import { EntitiesManager, EventManager, StateManager, SystemsManager, ThreeManager } from "./managers";
import type { ThreeManagerOptions } from "./managers/threeManager";
import { ExternalEvent, ExternalEventPayload } from "./types/externalEventMap";
import { InternalEvent } from "./types/internalEventMap";

type EventCallback<T = any> = (payload: T) => void;

/**
 * World — the top-level ECS engine entry point.
 *
 * @example
 * ```typescript
 * const world = new World(document.getElementById('app')!);
 * world.start();
 *
 * const entity = world.createVisibleEntity();
 * world.registerSystem(MyCustomSystem.GetInstance());
 *
 * world.on(ExternalEvent.WORLD_STARTED, () => console.log('running'));
 * ```
 */
export class World {


  public get isRunning(): boolean { return this._isRunning }
  public get isPaused(): boolean { return this._isPaused }

  public get eventManager(): EventManager { return this.managers.eventM }
  public get entitiesManager(): EntitiesManager { return this.managers.entitiesM }

  private container: HTMLElement;
  private _isRunning: boolean = false;
  private _isPaused: boolean = false;
  private managers: {
    entitiesM: EntitiesManager,
    systemM: SystemsManager,
    threeM: ThreeManager,
    eventM: EventManager,
    stateM: StateManager
  }


  public constructor(container: HTMLElement, options?: ThreeManagerOptions) {
    this.container = container;

    if (options) {
      ThreeManager.Configure(options);
    }

    this.managers = {
      entitiesM: EntitiesManager.GetInstance(),
      systemM: SystemsManager.GetInstance(),
      threeM: ThreeManager.GetInstance(),
      eventM: EventManager.GetInstance(),
      stateM: StateManager.GetInstance()
    };

    this.managers.threeM.Container = this.container;
  }

  public start(): void {
    if (this._isRunning) {
      throw new Error("World is already running");
    }

    try {
      this.managers.threeM.AutoResize = true;
      this.managers.threeM.setAnimationLoop();

      this.managers.systemM.registerSystem(MoveSystem.GetInstance());
      this.managers.systemM.registerSystem(EventSystem.GetInstance());

      this._isRunning = true;
      this._isPaused = false;

      this.eventManager.dispatch<ExternalEventPayload[ExternalEvent.WORLD_STARTED]>(
        ExternalEvent.WORLD_STARTED, { world: this }
      );
    } catch (error) {
      this._isRunning = false;
      throw error;
    }
  }

  public stop(): void {
    if (!this._isRunning) return;

    this.managers.threeM.unsetAnimationLoop();
    this.managers.systemM.stop();

    this._isRunning = false;
    this._isPaused = false;

    this.eventManager.dispatch<ExternalEventPayload[ExternalEvent.WORLD_STOPPED]>(
      ExternalEvent.WORLD_STOPPED, { world: this }
    );
  }

  public pause(): void {
    if (!this._isRunning || this._isPaused) return;

    this.managers.systemM.pause();
    this._isPaused = true;

    this.eventManager.dispatch<ExternalEventPayload[ExternalEvent.WORLD_PAUSED]>(
      ExternalEvent.WORLD_PAUSED, { world: this }
    );
  }

  public resume(): void {
    if (!this._isRunning || !this._isPaused) return;

    this.managers.systemM.resume();
    this._isPaused = false;

    this.eventManager.dispatch<ExternalEventPayload[ExternalEvent.WORLD_RESUMED]>(
      ExternalEvent.WORLD_RESUMED, { world: this }
    );
  }

  public destroy(): void {
    this.stop();

    const entities = this.entitiesManager.getAllEntities();
    entities.forEach(entity => {
      this.entitiesManager.removeEntity(entity);
    });

    this.eventManager.dispatch<ExternalEventPayload[ExternalEvent.WORLD_DESTROYED]>(
      ExternalEvent.WORLD_DESTROYED, { world: this }
    );

    this.eventManager.removeAllListeners();
  }

  /** Register a custom system */
  public registerSystem(system: System): void {
    this.managers.systemM.registerSystem(system);
  }

  /** Create a plain entity (no visual representation) */
  public createEntity(): Entity {
    const entity = new Entity();
    this.managers.entitiesM.addEntity(entity);
    return entity;
  }

  /** Create a visible entity with a Three.js model attached to the scene */
  public createVisibleEntity(): VisibleEntity {
    const ve = new VisibleEntity();
    this.managers.entitiesM.addEntity(ve);
    this.managers.threeM.appendToScene(ve.model);
    return ve;
  }

  /** Subscribe to an event */
  public on<K extends ExternalEvent>(
    event: K,
    callback: EventCallback<ExternalEventPayload[K]>
  ): void {
    this.managers.eventM.addEventListener(event, callback);
  }

  /** Unsubscribe from an event */
  public off<K extends ExternalEvent>(
    event: K,
    callback: EventCallback<ExternalEventPayload[K]>
  ): void {
    this.managers.eventM.removeEventListener(event, callback);
  }
}
