export class ApiError extends Error {
  public data: any;
  public statusCode: number;
  public success: boolean;
  public errors: any[];

  /**
   *
   * @param {number} statusCode
   * @param {string} message
   * @param {any[]} errors
   * @param {string} stack
   */
  constructor(
    statusCode: number,
    message:string = "Something went wrong",
    errors:Array<any> = [],
    stack:string = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}