export class NotFoundError extends Error {
  public readonly name = "NotFoundError";

  constructor(message = "Resource not found") {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
