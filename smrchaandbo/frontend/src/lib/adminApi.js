import { api } from './api';

const readAuthCfg = (params = {}) => ({
  params,
  withCredentials: true,
  headers: { Accept: 'application/json' },
});

// Admin: users list
export const getUsers = (p = {}) => api.get('/api/users', readAuthCfg(p));