import { System } from "../../core";
import { EventManager } from "../../managers";

export class EventSystem extends System {
  private static instance: EventSystem;
  public static GetInstance(): EventSystem {
    if (!EventSystem.instance) {
      EventSystem.instance = new EventSystem();
    }
    return EventSystem.instance;
  }

  public layer: number = 0;
  private eventManager: EventManager;
  private eventLimit: number = 20;

  private constructor() {
    super();
    this.eventManager = EventManager.GetInstance();
  }

  public start(): void { }
  public update(_delta: number): void {
    this.eventManager.trigger(this.eventLimit);
  }
  public lateUpdate(_delta: number): void { }
  public pause(): void { }
  public stop(): void { }
}
