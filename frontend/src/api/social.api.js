import api from './axios';

export const followUser = async (userId) => (await api.post(`/social/follow/${userId}`)).data;
export const unfollowUser = async (userId) => (await api.delete(`/social/follow/${userId}`)).data;
export const getFollowers = async (userId, params) =>
  (await api.get(`/social/followers/${userId}`, { params })).data.data;
export const getFollowing = async (userId, params) =>
  (await api.get(`/social/following/${userId}`, { params })).data.data;
export const getFeed = async (params) => (await api.get('/social/feed', { params })).data.data; // { items, page, limit, hasMore }