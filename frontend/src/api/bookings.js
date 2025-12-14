import api from './axios';

export const bookingAPI = {
  checkAvailability: async (params) => {
    return await api.get('/availability', { params });
  },

  previewPricing: async (bookingData) => {
    return await api.post('/pricing/preview', bookingData);
  },

  createBooking: async (bookingData) => {
    return await api.post('/bookings', bookingData);
  },

  getBooking: async (id) => {
    return await api.get(`/bookings/${id}`);
  },

  getUserBookings: async (userId) => {
    return await api.get(`/users/${userId}/bookings`);
  },

  cancelBooking: async (id) => {
    return await api.patch(`/bookings/${id}/cancel`);
  },

  joinWaitlist: async (waitlistData) => {
    return await api.post('/waitlist', waitlistData);
  }
};
