import { api, getCsrf } from './api';

const readAuthCfg = (params = {}) => ({
  params,
  withCredentials: true,
  headers: { Accept: 'application/json' },
});

// ===== Orders (read) =====
export const getOrders = (p = {}) => api.get('/api/orders', readAuthCfg(p)); // admin sees all; customer sees own

export const getOrder = (id) => api.get(`/api/orders/${id}`, readAuthCfg());

// ===== Orders (write) =====
export const createOrder = async (payload) => {
  // { planner_id, shipping_name, shipping_address, shipping_city, shipping_zip, shipping_country }
  await getCsrf();
  return api.post('/api/orders', payload, { withCredentials: true });
};

export const updateOrder = async (id, payload) => {
  // shipping fields only (unless admin)
  await getCsrf();
  return api.put(`/api/orders/${id}`, payload, { withCredentials: true });
};

export const cancelOrder = async (id) => {
  await getCsrf();
  return api.post(`/api/orders/${id}/cancel`, {}, { withCredentials: true });
};

// ===== Admin transitions =====
export const markPaid = async (id) => {
  await getCsrf();
  return api.post(`/api/orders/${id}/mark-paid`, {}, { withCredentials: true });
};

export const markRefunded = async (id) => {
  await getCsrf();
  return api.post(
    `/api/orders/${id}/mark-refunded`,
    {},
    { withCredentials: true }
  );
};

export const markInProduction = async (id) => {
  await getCsrf();
  return api.post(
    `/api/orders/${id}/in-production`,
    {},
    { withCredentials: true }
  );
};

export const markShipped = async (id) => {
  await getCsrf();
  return api.post(
    `/api/orders/${id}/mark-shipped`,
    {},
    { withCredentials: true }
  );
};

export const markDelivered = async (id) => {
  await getCsrf();
  return api.post(
    `/api/orders/${id}/mark-delivered`,
    {},
    { withCredentials: true }
  );
};
