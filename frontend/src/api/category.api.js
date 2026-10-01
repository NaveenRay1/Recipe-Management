import api from './axios';

export const getCategories = async () => (await api.get('/categories')).data.data.categories;
export const createCategory = async (name) => (await api.post('/categories', { name })).data.data.category;
export const updateCategory = async (id, name) => (await api.put(`/categories/${id}`, { name })).data.data.category;
export const deleteCategory = async (id) => (await api.delete(`/categories/${id}`)).data;