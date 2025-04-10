import { System } from "../core/ecs";
import { AlreadyExistsError, NotFoundError } from "../core/utils/exception";

/**
 * 系统管理器，负责管理所有系统的单例
 * 设计目标：将系统相关的耦合度尽量集中到此
 */
export class SystemsManager {
  private static instance: SystemsManager;

  public layer: number = -1;

  /** 引擎运行时间（单位：毫秒） */
  private clock: number = 0;
  /** 两次 Update 之间的时间间隔（单位：毫秒） */
  private deltaTime: number = 0;
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
    for (let i = 0; i <= 4; i++) {
      const layerSystems = this.systems.get(i) || [];
      layerSystems.forEach((system) => {
        system.Start();
      });
    }
  }
  public Update(): void {
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
    if (this.clock > 0) {
      const sortedKeys = [...this.systems.keys()].sort((a, b) => a - b);
      for (const key of sortedKeys) {
        const layerSystems = this.systems.get(key)!;
        layerSystems.forEach((system) => {
          system.Update(this.deltaTime);
        });
      }
    }
  }
  public Pause(): void {
    throw new Error("Method not implemented.");
  }
  public Stop(): void {
    throw new Error("Method not implemented.");
  }
}
