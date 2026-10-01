import api from './axios';

export const getMyProfile = async () => (await api.get('/users/me')).data.data; // { user, counts }
export const updateMyProfile = async (formData) =>
  (await api.put('/users/me', formData, { headers: { 'Content-Type': 'multipart/form-data' } })).data.data;
export const getMyRecipes = async (params) => (await api.get('/users/me/recipes', { params })).data.data;
export const getMyFavorites = async (params) => (await api.get('/users/me/favorites', { params })).data.data;
export const getUser = async (id) => (await api.get(`/users/${id}`)).data.data; // { user, counts, isFollowing }
export const getUserRecipes = async (id, params) => (await api.get(`/users/${id}/recipes`, { params })).data.data;