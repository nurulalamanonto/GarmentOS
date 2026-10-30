import { config } from '../config/env.js';
import { sendError } from '../utils/response.js';
import { AppError } from '../utils/AppError.js';

// Runs when a route has no match (after all real routes).
export const notFound = (req, res) =>
  sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);

// Central error handler (Express recognises it by its 4 parameters).
// Expected errors (AppError) show their message; unexpected errors are logged on
// the server and the client only sees a generic message, so stack traces and
// internal details are never exposed.
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode);
  }

  // Malformed JSON body sent by the client
  if (err.type === 'entity.parse.failed') {
    return sendError(res, 'Request body is not valid JSON', 400);
  }

  if (!config.isProduction) {
    console.error(err);
  } else {
    console.error(`[error] ${err.name}: ${err.message}`);
  }
  return sendError(res, 'Internal server error', 500);
};
