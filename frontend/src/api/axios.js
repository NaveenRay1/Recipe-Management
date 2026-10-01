import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // the httpOnly "token" cookie is sent on every request
});

// AuthContext registers a callback here so the interceptor can clear the user.
let onUnauthorized = null;
export const registerUnauthorizedHandler = (fn) => {
  onUnauthorized = fn;
};

const AUTH_URLS = ['/auth/me', '/auth/login', '/auth/register'];

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    const isAuthCall = AUTH_URLS.some((u) => url.startsWith(u));
    if (status === 401 && !isAuthCall) {
      if (onUnauthorized) onUnauthorized();
      const path = window.location.pathname;
      // Avoid redirect loops when already on an auth page
      if (path !== '/login' && path !== '/register') {
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  }
);

export default api;