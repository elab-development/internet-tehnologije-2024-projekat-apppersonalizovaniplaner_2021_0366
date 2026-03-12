// src/lib/ordersApi.js
import { api, getCsrf } from './api';

// ===== Read (auth) =====
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



// ===== Create (customer) =====
export const createOrder = async (payload) => {
  // payload: { planner_id, shipping_name, shipping_address, shipping_city, shipping_zip, shipping_country }
  await getCsrf();
  return api.post('/api/orders', payload, { withCredentials: true });
};

// ===== Update shipping (owner while pending / admin) =====
export const updateOrder = async (id, payload) => {
  // payload: any subset of shipping_* fields
  await getCsrf();
  return api.put(`/api/orders/${id}`, payload, { withCredentials: true });
};

// ===== Cancel (customer while pending / admin) =====
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
