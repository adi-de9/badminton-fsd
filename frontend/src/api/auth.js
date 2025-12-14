import api from './axios';

export const authAPI = {
  login: async (email, password) => {
    return await api.post('/auth/login', { email, password });
  },

  signup: async (userData) => {
    return await api.post('/auth/signup', userData);
  },

  logout: async () => {
    return await api.post('/auth/logout');
  }
};
