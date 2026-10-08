import api from './api';

export const bookingService = {
  getAvailability: async (date) => {
    const res = await api.get(`/bookings/availability${date ? `?date=${date}` : ''}`);
    return res.data;
  },

  createBooking: async (bookingData) => {
    const res = await api.post('/bookings', bookingData);
    return res.data;
  },

  getMyBookings: async () => {
    const res = await api.get('/bookings/my');
    return res.data;
  },

  getBookingDetails: async (id) => {
    const res = await api.get(`/bookings/${id}`);
    return res.data;
  },

  cancelBooking: async (id, reason) => {
    const res = await api.delete(`/bookings/${id}`, { data: { reason } });
    return res.data;
  },

  getBookingSettings: async () => {
    const res = await api.get('/settings/booking');
    return res.data;
  },
};
