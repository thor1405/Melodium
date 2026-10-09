import api from './api';

export const cmsService = {
  // Events
  getEvents: async (params = {}) => {
    const res = await api.get('/events', { params });
    return res.data;
  },
  getEvent: async (slugOrId) => {
    const res = await api.get(`/events/${slugOrId}`);
    return res.data;
  },
  createEvent: async (data) => {
    const res = await api.post('/events', data);
    return res.data;
  },
  updateEvent: async (id, data) => {
    const res = await api.put(`/events/${id}`, data);
    return res.data;
  },
  deleteEvent: async (id) => {
    const res = await api.delete(`/events/${id}`);
    return res.data;
  },
  toggleRsvp: async (id) => {
    const res = await api.post(`/events/${id}/rsvp`);
    return res.data;
  },

  // Gallery
  getGallery: async (params = {}) => {
    const res = await api.get('/gallery', { params });
    return res.data;
  },
  createGalleryItem: async (data) => {
    const res = await api.post('/gallery', data);
    return res.data;
  },
  updateGalleryItem: async (id, data) => {
    const res = await api.put(`/gallery/${id}`, data);
    return res.data;
  },
  deleteGalleryItem: async (id) => {
    const res = await api.delete(`/gallery/${id}`);
    return res.data;
  },
  likeGalleryItem: async (id) => {
    const res = await api.post(`/gallery/${id}/like`);
    return res.data;
  },
  uploadGalleryImage: async (formData) => {
    const res = await api.post('/gallery/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },


  // Team
  getTeam: async (params = {}) => {
    const res = await api.get('/team', { params });
    return res.data;
  },
  createTeamMember: async (data) => {
    const res = await api.post('/team', data);
    return res.data;
  },
  updateTeamMember: async (id, data) => {
    const res = await api.put(`/team/${id}`, data);
    return res.data;
  },
  deleteTeamMember: async (id) => {
    const res = await api.delete(`/team/${id}`);
    return res.data;
  },
  uploadTeamPhoto: async (formData) => {
    const res = await api.post('/team/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  // Equipment & Calibration Gear
  getEquipment: async () => {
    const res = await api.get('/equipment');
    return res.data;
  },
  getAdminEquipment: async () => {
    const res = await api.get('/equipment/admin');
    return res.data;
  },
  createEquipment: async (data) => {
    const res = await api.post('/equipment', data);
    return res.data;
  },
  updateEquipment: async (id, data) => {
    const res = await api.put(`/equipment/${id}`, data);
    return res.data;
  },
  deleteEquipment: async (id) => {
    const res = await api.delete(`/equipment/${id}`);
    return res.data;
  },
  uploadEquipmentPhoto: async (formData) => {
    const res = await api.post('/equipment/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  // Notifications
  getNotifications: async () => {
    const res = await api.get('/notifications');
    return res.data;
  },
  markNotificationRead: async (id) => {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data;
  },
  markAllNotificationsRead: async () => {
    const res = await api.post('/notifications/read-all');
    return res.data;
  },
};
