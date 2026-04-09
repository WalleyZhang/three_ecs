/** A simple FIFO queue backed by an object (GC-friendly, avoids array shift overhead) */
export class Queue<T> {
  /** Object-based storage instead of array so deleted slots can be garbage-collected */
  private items: { [key: number]: T } = {};
  private head = 0;
  private tail = 0;

  /** Maximum queue capacity */
  private maxLength: number;
  /** @param maxLength Capacity limit. Defaults to 100. */
  public constructor(maxLength: number = 100) {
    this.maxLength = maxLength;
  }

  /** Enqueue an item. Silently drops if at capacity. */
  public enqueue(item: T): void {
    if (this.tail - this.head >= this.maxLength) {
      return;
    }
    this.items[this.tail] = item;
    this.tail++;
  }

  /** Dequeue and return the front item, or undefined if empty */
  public dequeue(): T | undefined {
    if (this.isEmpty()) return undefined;
    const item = this.items[this.head];
    delete this.items[this.head];
    this.head++;

    return item;
  }

  /** Peek at the front item without removing it */
  public peek(): T | undefined {
    return this.items[this.head];
  }

  public isEmpty(): boolean {
    return this.tail === this.head;
  }

  public size(): number {
    return this.tail - this.head;
  }

}
