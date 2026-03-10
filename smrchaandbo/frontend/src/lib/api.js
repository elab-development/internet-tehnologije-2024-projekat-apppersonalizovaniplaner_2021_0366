import axios from 'axios';

export const api = axios.create({
  baseURL: '',
  withCredentials: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  headers: { Accept: 'application/json' },
});

// Helpers to trigger the loading overlay via window events
function emitStart() {
  window.dispatchEvent(new CustomEvent('app:loading-start'));
}
function emitStop() {
  window.dispatchEvent(new CustomEvent('app:loading-stop'));
}

/**
 * Request interceptor:
 * - overlay by default
 * - skip per-request by passing { noSpinner: true } in config
 */
api.interceptors.request.use((config) => {
  if (!config.noSpinner) emitStart();
  return config;
});

/**
 * Response & error interceptors:
 */
api.interceptors.response.use(
  (response) => {
    if (!response.config.noSpinner) emitStop();
    return response;
  },
  (error) => {
    if (!error.config || !error.config.noSpinner) emitStop();
    return Promise.reject(error);
  }
);

// API calls

export async function getCsrf() {
  await api.get('/sanctum/csrf-cookie', { noSpinner: true });
}

export async function registerUser(payload) {
  await getCsrf();
  return api.post('/register', payload);
}

export async function loginUser(payload) {
  await getCsrf();
  return api.post('/login', payload);
}

export async function logoutUser() {
  return api.post('/logout');
}

export async function fetchMe() {
  return api.get('/api/me');
}
