import { api } from './api';

// READ (admin dashboard should see all)
const readCfg = (params = {}) => ({
  params,
  withCredentials: false,
  headers: { Accept: 'application/json' },
});

export const getSizes = (p = {}) =>
  api.get('/api/catalog/sizes', readCfg({ active_only: 0, ...p }));
export const getPapers = (p = {}) =>
  api.get('/api/catalog/papers', readCfg({ active_only: 0, ...p }));
export const getBindings = (p = {}) =>
  api.get('/api/catalog/bindings', readCfg({ active_only: 0, ...p }));
export const getColors = (p = {}) =>
  api.get('/api/catalog/colors', readCfg({ active_only: 0, ...p }));
export const getCovers = (p = {}) =>
  api.get('/api/catalog/covers', readCfg({ active_only: 0, ...p }));
export const getTemplates = (p = {}) =>
  api.get('/api/catalog/templates', readCfg({ active_only: 0, ...p }));
export const getComponentCategories = (p = {}) =>
  api.get('/api/catalog/component-categories', readCfg(p));
export const getComponents = (p = {}) =>
  api.get('/api/catalog/components', readCfg({ active_only: 0, ...p }));

// WRITE (same as before)
export const createSize = (payload) => api.post('/api/catalog/sizes', payload);
export const updateSize = (id, payload) =>
  api.put(`/api/catalog/sizes/${id}`, payload);
export const deleteSize = (id) => api.delete(`/api/catalog/sizes/${id}`);
export const createPaper = (payload) =>
  api.post('/api/catalog/papers', payload);
export const updatePaper = (id, payload) =>
  api.put(`/api/catalog/papers/${id}`, payload);
export const deletePaper = (id) => api.delete(`/api/catalog/papers/${id}`);
export const createBinding = (payload) =>
  api.post('/api/catalog/bindings', payload);
export const updateBinding = (id, payload) =>
  api.put(`/api/catalog/bindings/${id}`, payload);
export const deleteBinding = (id) => api.delete(`/api/catalog/bindings/${id}`);
export const createColor = (payload) =>
  api.post('/api/catalog/colors', payload);
export const updateColor = (id, payload) =>
  api.put(`/api/catalog/colors/${id}`, payload);
export const deleteColor = (id) => api.delete(`/api/catalog/colors/${id}`);
export const createCover = (payload) =>
  api.post('/api/catalog/covers', payload);
export const updateCover = (id, payload) =>
  api.put(`/api/catalog/covers/${id}`, payload);
export const deleteCover = (id) => api.delete(`/api/catalog/covers/${id}`);
export const createTemplate = (payload) =>
  api.post('/api/catalog/templates', payload);
export const updateTemplate = (id, payload) =>
  api.put(`/api/catalog/templates/${id}`, payload);
export const deleteTemplate = (id) =>
  api.delete(`/api/catalog/templates/${id}`);
export const createComponentCategory = (payload) =>
  api.post('/api/catalog/component-categories', payload);
export const updateComponentCategory = (id, payload) =>
  api.put(`/api/catalog/component-categories/${id}`, payload);
export const deleteComponentCategory = (id) =>
  api.delete(`/api/catalog/component-categories/${id}`);
export const createComponent = (payload) =>
  api.post('/api/catalog/components', payload);
export const updateComponent = (id, payload) =>
  api.put(`/api/catalog/components/${id}`, payload);
export const deleteComponent = (id) =>
  api.delete(`/api/catalog/components/${id}`);
