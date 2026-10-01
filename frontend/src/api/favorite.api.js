import api from './axios';

export const getFavorites = async (params) => (await api.get('/favorites', { params })).data.data;
export const addFavorite = async (recipeId) => (await api.post(`/favorites/${recipeId}`)).data;
export const removeFavorite = async (recipeId) => (await api.delete(`/favorites/${recipeId}`)).data;