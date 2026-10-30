// The one place that talks to the backend with the native Fetch API.
// Module files (healthApi.js, and orders/materials/... in later stages)
// call apiRequest() so error handling is written only once.

// VITE_API_BASE_URL is public (it ends up in the browser bundle), so it must
// only ever hold the backend URL, never secrets.
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api').replace(
  /\/$/,
  '',
);

export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// Sends a request and returns the `data` part of the API's standard response:
//   { success: true, data, message }  or  { success: false, message }
export const apiRequest = async (path, { method = 'GET', body, signal } = {}) => {
  const options = { method, headers: { Accept: 'application/json' }, signal };

  if (body !== undefined) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, options);
  } catch (error) {
    if (error.name === 'AbortError') throw error; // request was cancelled on purpose
    throw new ApiError('Cannot reach the GarmentOS server. Check that the backend is running.');
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    // The body was not JSON; handled by the checks below.
  }

  if (!response.ok || payload?.success === false) {
    throw new ApiError(payload?.message ?? `Request failed with status ${response.status}`, response.status);
  }

  return payload?.data ?? null;
};
