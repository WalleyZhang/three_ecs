import { System } from "../core";
import { NotFoundError } from "../types/exception";

/**
 * 系统管理器，负责管理所有系统的单例
 * 设计目标：将系统相关的耦合度尽量集中到此
 */
export class SystemsManager {
  private static instance: SystemsManager;

  public layer: number = -1;

  /** 系统管理器状态 */
  public get isRunning(): boolean { return this._isRunning; }
  public get isPaused(): boolean { return this._isPaused; }

  /** 引擎运行时间（单位：毫秒） */
  private clock: number = 0;
  /** 两次 Update 之间的时间间隔（单位：毫秒） */
  private deltaTime: number = 0;
  private _isRunning: boolean = false;
  private _isPaused: boolean = false;
  private systems: Map<number, System[]> = new Map();

  private constructor() {

  }

  public static GetInstance(): SystemsManager {
    if (!SystemsManager.instance) {
      SystemsManager.instance = new SystemsManager();
    }
    return SystemsManager.instance;
  }

  /**
   * 注册系统，注册完成时会调用系统的 Start 方法
   * @param system 系统实例
   */
  public registerSystem(system: System) {
    const layerSystems = this.systems.get(system.layer) || this.systems.set(system.layer, []).get(system.layer)!;
    // 系统都应该是单例模式，所以这里忽略重复的注册请求
    if (layerSystems.includes(system)) {
      return
    }

    system.Start();
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

  public Start(): void {
    if (this._isRunning) {
      return;
    }

    for (let i = 0; i <= 49; i++) {
      const layerSystems = this.systems.get(i) || [];
      layerSystems.forEach((system) => {
        system.Start();
      });
    }

    this._isRunning = true;
    this._isPaused = false;
  }
  public Update(): void {
    if (!this._isRunning || this._isPaused) {
      return;
    }

    // 首次更新先初始化
    if (this.clock === 0) {
      this.clock = Date.now();
    } else {
      const now = Date.now();
      this.deltaTime = now - this.clock;
      this.clock = now;
      // 获取所有 key 并排序
      const sortedKeys = [...this.systems.keys()].sort((a, b) => a - b);
      for (const key of sortedKeys) {
        const layerSystems = this.systems.get(key)!;
        layerSystems.forEach((system) => {
          system.Update(this.deltaTime);
        });
      }
    }
  }

  public LatedUpdate(): void {
    if (!this._isRunning || this._isPaused || this.clock <= 0) {
      return;
    }

    const sortedKeys = [...this.systems.keys()].sort((a, b) => a - b);
    for (const key of sortedKeys) {
      const layerSystems = this.systems.get(key)!;
      layerSystems.forEach((system) => {
        system.LatedUpdate(this.deltaTime);
      });
    }
  }

  public Pause(): void {
    if (!this._isRunning || this._isPaused) {
      return;
    }

    this._isPaused = true;
  }

  public Stop(): void {
    if (!this._isRunning) {
      return;
    }

    // 停止所有系统
    const sortedKeys = [...this.systems.keys()].sort((a, b) => a - b);
    for (const key of sortedKeys) {
      const layerSystems = this.systems.get(key)!;
      layerSystems.forEach((system) => {
        system.Stop();
      });
    }

    this._isRunning = false;
    this._isPaused = false;
    this.clock = 0;
    this.deltaTime = 0;
  }

  /** 获取所有已注册的系统 */
  public getAllSystems(): System[] {
    const allSystems: System[] = [];
    this.systems.forEach(layerSystems => {
      allSystems.push(...layerSystems);
    });
    return allSystems;
  }

  /** 获取指定层级的系统 */
  public getSystemsByLayer(layer: number): System[] {
    return this.systems.get(layer) || [];
  }

  /** 获取系统总数 */
  public getSystemCount(): number {
    let count = 0;
    this.systems.forEach(layerSystems => {
      count += layerSystems.length;
    });
    return count;
  }

  /** 检查系统是否已注册 */
  public hasSystem(system: System): boolean {
    const layerSystems = this.systems.get(system.layer) || [];
    return layerSystems.includes(system);
  }
}
