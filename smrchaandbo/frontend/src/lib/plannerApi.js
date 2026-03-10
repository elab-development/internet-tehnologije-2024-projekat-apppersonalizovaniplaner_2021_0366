import { api, getCsrf } from './api';

// Reads require auth cookies (Sanctum session), so keep withCredentials: true.
const readAuthCfg = (params = {}) => ({
  params,
  withCredentials: true,
  headers: { Accept: 'application/json' },
});

// ===== Planners =====
export const getPlanners = (p = {}) => api.get('/api/planners', readAuthCfg(p));

export const getPlanner = (id) => api.get(`/api/planners/${id}`, readAuthCfg());

// create/update/delete need CSRF cookie available
export const createPlanner = async (payload) => {
  await getCsrf();
  return api.post('/api/planners', payload, { withCredentials: true });
};

export const updatePlanner = async (id, payload) => {
  await getCsrf();
  return api.put(`/api/planners/${id}`, payload, { withCredentials: true });
};

export const deletePlanner = async (id) => {
  await getCsrf();
  return api.delete(`/api/planners/${id}`, { withCredentials: true });
};

// ===== Planner Items =====
export const getPlannerItems = (plannerId) =>
  api.get(`/api/planners/${plannerId}/items`, readAuthCfg());

export const addPlannerItem = async (plannerId, payload) => {
  await getCsrf();
  return api.post(`/api/planners/${plannerId}/items`, payload, {
    withCredentials: true,
  });
};

export const updatePlannerItem = async (plannerId, itemId, payload) => {
  await getCsrf();
  return api.put(`/api/planners/${plannerId}/items/${itemId}`, payload, {
    withCredentials: true,
  });
};

export const deletePlannerItem = async (plannerId, itemId) => {
  await getCsrf();
  return api.delete(`/api/planners/${plannerId}/items/${itemId}`, {
    withCredentials: true,
  });
};

// ===== Pricing / totals =====
export const recalcPlanner = async (plannerId) => {
  await getCsrf();
  return api.post(
    `/api/planners/${plannerId}/recalculate`,
    {},
    { withCredentials: true }
  );
};
