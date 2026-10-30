import { apiRequest } from './client';

// GET /api/health - is the backend running, and which storage does it use?
export const fetchHealth = (signal) => apiRequest('/health', { signal });
