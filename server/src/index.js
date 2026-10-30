import { config } from './config/env.js';
import { createApp } from './app.js';

const app = createApp();

app.listen(config.port, () => {
  console.log(`GarmentOS API running on http://localhost:${config.port}/api (${config.nodeEnv})`);
});
