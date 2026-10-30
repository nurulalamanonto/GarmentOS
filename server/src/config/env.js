// Loads variables from server/.env into process.env (dotenv), then exposes
// them as one tidy config object so the rest of the app never reads
// process.env directly.
import 'dotenv/config';

const {
  PORT = '5000',
  NODE_ENV = 'development',
  CLIENT_URL = 'http://localhost:5173',
  DATABASE_URL = '',
} = process.env;

export const config = {
  port: Number(PORT),
  nodeEnv: NODE_ENV,
  isProduction: NODE_ENV === 'production',
  // CLIENT_URL may hold several origins separated by commas
  clientOrigins: CLIENT_URL.split(',').map((origin) => origin.trim()).filter(Boolean),
  databaseUrl: DATABASE_URL,
};
