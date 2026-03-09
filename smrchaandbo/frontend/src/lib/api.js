import axios from 'axios';

export const api = axios.create({
  baseURL: '',
  withCredentials: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
});

export async function getCsrf() {
  await api.get('/sanctum/csrf-cookie');
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
