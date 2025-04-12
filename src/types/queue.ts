/** 队列 */
export class Queue<T> {
  /** 使用对象而非数组，使得GC机制对此数据生效 */
  private items: { [key: number]: T } = {};
  private head = 0;
  private tail = 0;

  /** 队列限制 */
  private maxLength: number;
  /** 长度限制：默认 100 */
  public constructor(maxLength: number = 100) {
    this.maxLength = maxLength;
  }

  /** 入队 */
  public enqueue(item: T): void {
    if (this.tail - this.head >= this.maxLength) {
      return;
    }
    this.items[this.tail] = item;
    this.tail++;
  }

  /** 出队 */
  public dequeue(): T | undefined {
    if (this.isEmpty()) return undefined;
    const item = this.items[this.head];
    delete this.items[this.head];
    this.head++;

    return item;
  }

  /** 获取队首元素 */
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
