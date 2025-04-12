/**
 * 自定义的错误类型
 */

export class AlreadyExistsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AlreadyExistsError";
  }
}

export class EmptyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EmptyError";
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}
