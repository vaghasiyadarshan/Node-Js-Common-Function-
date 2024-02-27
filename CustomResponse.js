class CustomResponse {
  constructor(statusCode, message, isOperational = true, stack = "") {
    this.message = message;
    this.custom_errors = message;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

module.exports = CustomResponse;
