import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import apiRoutes from './routes/index.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

// Builds the Express app without starting it, so tests can reuse it.
export const createApp = () => {
  const app = express();

  // CORS: only the configured frontend origins may call the API from a browser.
  app.use(
    cors({
      origin: (origin, callback) => {
        // Requests without an Origin header (curl, server-to-server) are allowed.
        if (!origin || config.clientOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(null, false);
      },
    }),
  );

  app.use(express.json());

  app.use('/api', apiRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};
