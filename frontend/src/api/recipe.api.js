import api from './axios';

const multipart = { headers: { 'Content-Type': 'multipart/form-data' } };

export const getRecipes = async (params) => (await api.get('/recipes', { params })).data.data;
export const getRecipe = async (id) => (await api.get(`/recipes/${id}`)).data.data.recipe;
export const createRecipe = async (formData) => (await api.post('/recipes', formData, multipart)).data.data.recipe;
export const updateRecipe = async (id, formData) =>
  (await api.put(`/recipes/${id}`, formData, multipart)).data.data.recipe;
export const deleteRecipe = async (id) => (await api.delete(`/recipes/${id}`)).data;