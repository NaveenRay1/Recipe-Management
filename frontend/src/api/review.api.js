import api from './axios';

export const getReviews = async (recipeId, params) =>
  (await api.get(`/reviews/recipe/${recipeId}`, { params })).data.data; // { reviews, pagination }
export const createReview = async (recipeId, payload) =>
  (await api.post(`/reviews/recipe/${recipeId}`, payload)).data.data.review;
export const updateReview = async (id, payload) => (await api.put(`/reviews/${id}`, payload)).data.data.review;
export const deleteReview = async (id) => (await api.delete(`/reviews/${id}`)).data;