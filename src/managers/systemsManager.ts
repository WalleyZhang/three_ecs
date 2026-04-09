import { System } from "../core";
import { NotFoundError } from "../types/exception";

/**
 * System manager singleton — owns the update loop and system registry.
 *
 * Two timing modes (global toggle, applies to ALL systems):
 *  - variable (default): update() called once per frame with the real delta.
 *  - fixed:              update() called with a constant timestep via a time
 *                        accumulator; may run 0-N times per frame.
 */
export class SystemsManager {
  private static instance: SystemsManager;

  public layer: number = -1;

  public get isRunning(): boolean { return this._isRunning; }
  public get isPaused(): boolean { return this._isPaused; }

  /** Whether all systems run at a fixed timestep. Default: false (variable). */
  public get useFixedUpdate(): boolean { return this._useFixedUpdate; }
  public get fixedTimeStep(): number { return this._fixedTimeStep; }

  /** Total active scene time in ms, excluding all paused periods. */
  public get elapsedTime(): number { return this._elapsedTime; }
  /** Delta in ms of the most recent tick (fixed step or real frame delta). */
  public get delta(): number { return this.deltaTime; }

  private lastFrameTime: number = 0;
  private deltaTime: number = 0;
  private _elapsedTime: number = 0;
  private _isRunning: boolean = false;
  private _isPaused: boolean = false;
  private _useFixedUpdate: boolean = false;
  private systems: Map<number, System[]> = new Map();

  /** Fixed-update timing */
  private _fixedTimeStep: number = 1000 / 60;   // ~16.67 ms
  private accumulator: number = 0;
  private maxAccumulator: number = 200;          // cap to prevent spiral-of-death

  private constructor() { }

  public static GetInstance(): SystemsManager {
    if (!SystemsManager.instance) {
      SystemsManager.instance = new SystemsManager();
    }
    return SystemsManager.instance;
  }

  /** Enable or disable fixed-timestep mode for all systems. */
  public setUseFixedUpdate(enabled: boolean): void {
    this._useFixedUpdate = enabled;
  }

  /** Set the fixed timestep in milliseconds (e.g. 1000/60 for 60 Hz). */
  public setFixedTimeStep(ms: number): void {
    this._fixedTimeStep = ms;
  }

  /** Register a system. Calls system.start() on first registration. */
  public registerSystem(system: System) {
    const layerSystems = this.systems.get(system.layer)
      || this.systems.set(system.layer, []).get(system.layer)!;
    if (layerSystems.includes(system)) {
      return;
    }

    system.start();
    layerSystems.push(system);
  }

  public unregisterSystem(system: System) {
    const layerSystems = this.systems.get(system.layer) || [];
    const index = layerSystems.indexOf(system);
    if (index === -1) {
      throw new NotFoundError(
        `[SystemsManager] System ${system.constructor.name} not found in layer ${system.layer}`
      );
    }
    layerSystems.splice(index, 1);
  }

  public start(): void {
    if (this._isRunning) {
      return;
    }

    for (let i = 0; i <= 49; i++) {
      const layerSystems = this.systems.get(i) || [];
      layerSystems.forEach((system) => {
        system.start();
      });
    }

    this._isRunning = true;
    this._isPaused = false;
  }

  public update(time: DOMHighResTimeStamp): void {
    if (!this._isRunning || this._isPaused) {
      return;
    }

    if (this.lastFrameTime === 0) {
      this.lastFrameTime = time;
      return;
    }

    this.deltaTime = time - this.lastFrameTime;
    this.lastFrameTime = time;
    this._elapsedTime += this.deltaTime;

    const sortedKeys = [...this.systems.keys()].sort((a, b) => a - b);

    if (this._useFixedUpdate) {
      this.accumulator = Math.min(
        this.accumulator + this.deltaTime,
        this.maxAccumulator,
      );
      while (this.accumulator >= this._fixedTimeStep) {
        this.tickAllSystems(sortedKeys, this._fixedTimeStep);
        this.accumulator -= this._fixedTimeStep;
      }
    } else {
      this.tickAllSystems(sortedKeys, this.deltaTime);
    }
  }

  public lateUpdate(): void {
    if (!this._isRunning || this._isPaused || this.lastFrameTime <= 0) {
      return;
    }

    const sortedKeys = [...this.systems.keys()].sort((a, b) => a - b);
    for (const key of sortedKeys) {
      for (const system of this.systems.get(key)!) {
        system.lateUpdate(this.deltaTime);
      }
    }
  }

  public pause(): void {
    if (!this._isRunning || this._isPaused) {
      return;
    }
    this._isPaused = true;
  }

  public resume(): void {
    if (!this._isRunning || !this._isPaused) {
      return;
    }
    this._isPaused = false;
    this.lastFrameTime = 0;
    this.accumulator = 0;
  }

  public stop(): void {
    if (!this._isRunning) {
      return;
    }

    const sortedKeys = [...this.systems.keys()].sort((a, b) => a - b);
    for (const key of sortedKeys) {
      for (const system of this.systems.get(key)!) {
        system.stop();
      }
    }

    this._isRunning = false;
    this._isPaused = false;
    this.lastFrameTime = 0;
    this.deltaTime = 0;
    this._elapsedTime = 0;
    this.accumulator = 0;
  }

  public getAllSystems(): System[] {
    const allSystems: System[] = [];
    this.systems.forEach(layerSystems => {
      allSystems.push(...layerSystems);
    });
    return allSystems;
  }

  public getSystemsByLayer(layer: number): System[] {
    return this.systems.get(layer) || [];
  }

  public getSystemCount(): number {
    let count = 0;
    this.systems.forEach(layerSystems => {
      count += layerSystems.length;
    });
    return count;
  }

  public hasSystem(system: System): boolean {
    const layerSystems = this.systems.get(system.layer) || [];
    return layerSystems.includes(system);
  }

  private tickAllSystems(sortedKeys: number[], delta: number): void {
    for (const key of sortedKeys) {
      for (const system of this.systems.get(key)!) {
        system.update(delta);
      }
    }
  }
}
