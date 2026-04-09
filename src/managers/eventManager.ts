import { EventData } from "../types/event";
import { Queue } from "../types/queue";
import { InternalEvent } from "../types/internalEventMap";
import { ExternalEvent } from "../types/externalEventMap";

type EventCallback<T = any> = (payload: T) => void;

/** Event manager singleton: listener registration, queued dispatch, and trigger */
export class EventManager {
  private static instance: EventManager;
  public static GetInstance(): EventManager {
    if (!EventManager.instance) {
      EventManager.instance = new EventManager();
    }
    return EventManager.instance;
  }

  private eventListeners: { [key: string]: EventCallback[] } = {};
  /** Event queue: dispatched events are not executed immediately but deferred until the EventSystem processes them next frame */
  private eventQueue: Queue<EventData> = new Queue();

  private constructor() { }

  public addEventListener<T>(eventType: ExternalEvent | InternalEvent, callback: EventCallback<T>): void {
    if (!this.eventListeners[eventType]) {
      this.eventListeners[eventType] = [];
    }
    if (this.eventListeners[eventType].includes(callback)) return;
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
   * Flush queued events. Should only be called by the EventSystem, not externally.
   * @param batchNumber Max events to process. Negative value processes all.
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

  /** Enqueue an event for deferred processing by the EventSystem next frame */
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

  /** Remove all listeners, or all listeners for a specific event type */
  public removeAllListeners(eventType?: ExternalEvent | InternalEvent): void {
    if (eventType) {
      delete this.eventListeners[eventType];
    } else {
      this.eventListeners = {};
    }
  }

  /** Get listener count, optionally filtered by event type */
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

  /** Execute all callbacks for a single event */
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