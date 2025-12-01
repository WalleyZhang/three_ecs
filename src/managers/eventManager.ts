import { EventData } from "../types/event";
import { Queue } from "../types/queue";
import { InternalEvent } from "../types/internalEventMap";
import { ExternalEvent } from "../types/externalEventMap";

type EventCallback<T = any> = (payload: T) => void;

/** 事件管理器：事件注册、触发 */
export class EventManager {
  private static instance: EventManager;
  public static GetInstance(): EventManager {
    if (!EventManager.instance) {
      EventManager.instance = new EventManager();
    }
    return EventManager.instance;
  }

  private eventListeners: { [key: string]: EventCallback[] } = {};
  /** 事件队列：事件分发不会立刻执行，而是放入队列中，等待事件系统在下一帧执行 */
  private eventQueue: Queue<EventData> = new Queue();
  /** 事件集合：用于验证事件是否支持 */
  private eventMap = new Set([...Object.values(InternalEvent), ...Object.values(ExternalEvent)])

  private constructor() { }

  public addEventListener<T>(eventType: ExternalEvent | InternalEvent, callback: EventCallback<T>): void {
    if (!this.eventListeners[eventType]) {
      this.eventListeners[eventType] = [];
    }
    this.eventListeners[eventType].push(callback);
  }

  public removeEventListener<T>(eventType: ExternalEvent | InternalEvent, callback: EventCallback<T>): void {
    if (this.eventListeners[eventType]) {
      const index = this.eventListeners[eventType].indexOf(callback);
      if (index !== -1) {
        this.eventListeners[eventType].splice(index, 1);
      }
    }
  }

  public addEventListenerOnce<T>(eventType: ExternalEvent | InternalEvent, callback: EventCallback<T>): void {
    const onceCallback = (payload: T) => {
      this.removeEventListener(eventType, onceCallback);
      callback(payload);
    };
    this.addEventListener(eventType, onceCallback);
  }

  /** 
   * 事件触发：不应该在外部调用，只能由事件系统触发
   * @param batchNumber 触发事件的数量，默认触发所有事件
   */
  public trigger(batchNumber: number = -1): void {
    if (batchNumber < 0) {
      while (!this.eventQueue.isEmpty()) {
        const eventData = this.eventQueue.dequeue();
        if (eventData) {
          this.triggerEvent(eventData);
        }
      }
    } else {
      for (let i = 0; i < batchNumber; i++) {
        const eventData = this.eventQueue.dequeue();
        if (eventData) {
          this.triggerEvent(eventData);
        } else {
          break;
        }
      }
    }
  }

  /** 事件分发：由外部调用，分发事件不会立刻执行，而是放入队列中，等待事件系统在下一帧执行 */
  public dispatch<T>(eventType: ExternalEvent | InternalEvent, payload?: T): void {
    const eventData: EventData = {
      type: eventType,
      payload: payload,
    };
    this.eventQueue.enqueue(eventData);
  }

  public clear(): void {
    this.eventListeners = {};
  }

  /** 移除指定事件类型的所有监听器 */
  public removeAllListeners(eventType?: ExternalEvent | InternalEvent): void {
    if (eventType) {
      delete this.eventListeners[eventType];
    } else {
      this.eventListeners = {};
    }
  }

  /** 获取监听器数量 */
  public getListenerCount(eventType?: ExternalEvent | InternalEvent): number {
    if (eventType) {
      return this.eventListeners[eventType]?.length || 0;
    }
    let total = 0;
    Object.values(this.eventListeners).forEach(callbacks => {
      total += callbacks.length;
    });
    return total;
  }

  /** 触发事件 */
  private triggerEvent<T = any>(eventData: EventData<T>): void {
    const { type, payload } = eventData;
    const callbacks = this.eventListeners[type];
    if (callbacks?.length > 0) {
      for (const callback of callbacks) {
        callback(payload);
      }
    }
  }

}