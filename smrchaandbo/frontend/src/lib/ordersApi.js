import { api, getCsrf } from './api';

// Read (auth)
export const getOrders = (p = {}) =>
  api.get('/api/orders', {
    params: p,
    withCredentials: true,
    headers: { Accept: 'application/json' },
  });
export const getOrder = (id) =>
  api.get(`/api/orders/${id}`, {
    withCredentials: true,
    headers: { Accept: 'application/json' },
  });



// Admin transitions
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
