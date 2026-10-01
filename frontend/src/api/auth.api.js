import api from './axios';

export const registerUser = async (payload) => (await api.post('/auth/register', payload)).data.data;
export const loginUser = async (payload) => (await api.post('/auth/login', payload)).data.data;
export const logoutUser = async () => (await api.post('/auth/logout')).data;
export const fetchMe = async () => (await api.get('/auth/me')).data.data;