// An error we throw on purpose (bad input, record not found, ...).
// The error handler shows its message to the client because it is safe by design.
export class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
  }
}
