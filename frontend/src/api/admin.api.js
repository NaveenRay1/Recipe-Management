import api from './axios';

export const getStats = async () => (await api.get('/admin/stats')).data.data;
export const getAdminUsers = async (params) => (await api.get('/admin/users', { params })).data.data;
export const setUserStatus = async (id, status) =>
  (await api.patch(`/admin/users/${id}/status`, { status })).data.data.user;
export const getAdminRecipes = async (params) => (await api.get('/admin/recipes', { params })).data.data;
export const deleteAdminRecipe = async (id) => (await api.delete(`/admin/recipes/${id}`)).data;