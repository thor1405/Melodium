import api from './api';

export const adminService = {
  getOverview: async () => {
    const res = await api.get('/admin/overview');
    return res.data;
  },

  getTodaySchedule: async (date) => {
    const res = await api.get(`/admin/today-schedule${date ? `?date=${date}` : ''}`);
    return res.data;
  },

  getAllBookings: async (params = {}) => {
    const res = await api.get('/admin/bookings', { params });
    return res.data;
  },

  updateBookingStatus: async (id, statusData) => {
    const res = await api.patch(`/admin/bookings/${id}/status`, statusData);
    return res.data;
  },

  createAdminBooking: async (bookingData) => {
    const res = await api.post('/admin/bookings', bookingData);
    return res.data;
  },

  blockSlot: async (blockData) => {
    const res = await api.post('/admin/blocked-slots', blockData);
    return res.data;
  },

  getBlockedSlots: async (date) => {
    const res = await api.get(`/admin/blocked-slots${date ? `?date=${date}` : ''}`);
    return res.data;
  },

  deleteBlockedSlot: async (id) => {
    const res = await api.delete(`/admin/blocked-slots/${id}`);
    return res.data;
  },

  getAllUsers: async (params = {}) => {
    const res = await api.get('/admin/users', { params });
    return res.data;
  },

  updateUser: async (id, userData) => {
    const res = await api.patch(`/admin/users/${id}`, userData);
    return res.data;
  },

  getAnalytics: async () => {
    const res = await api.get('/admin/analytics');
    return res.data;
  },

  updateBookingSettings: async (settings) => {
    const res = await api.patch('/settings/booking', settings);
    return res.data;
  },

  uploadHeroVideo: async (formData) => {
    const res = await api.post('/settings/upload-video', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  getActivityLogs: async (limit = 30) => {
    const res = await api.get(`/admin/activity-logs?limit=${limit}`);
    return res.data;
  },
};
