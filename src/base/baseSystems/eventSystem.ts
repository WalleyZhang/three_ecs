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
  /** 每一帧处理事件数量的数量的上限，超出的事件将在下一帧处理 */
  private eventLimit: number = 20;

  private constructor() {
    super();
    this.eventManager = EventManager.GetInstance();
  }

  public Start(): void {
  }
  public Update(delta: number): void {
    this.eventManager.trigger(this.eventLimit);
  }
  public LatedUpdate(delta: number): void {
  }
  public Pause(): void {
  }
  public Stop(): void {
  }
}