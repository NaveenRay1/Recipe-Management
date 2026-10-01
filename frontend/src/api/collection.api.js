import api from './axios';

export const createCollection = async (payload) => (await api.post('/collections', payload)).data.data.collection;
export const getCollections = async () => (await api.get('/collections')).data.data.collections;
export const getCollection = async (id) => (await api.get(`/collections/${id}`)).data.data.collection;
export const updateCollection = async (id, payload) =>
  (await api.put(`/collections/${id}`, payload)).data.data.collection;
export const deleteCollection = async (id) => (await api.delete(`/collections/${id}`)).data;
export const addRecipeToCollection = async (id, recipeId) =>
  (await api.post(`/collections/${id}/recipes/${recipeId}`)).data;
export const removeRecipeFromCollection = async (id, recipeId) =>
  (await api.delete(`/collections/${id}/recipes/${recipeId}`)).data;