import api from './api';

export const reviewService = {
  // Public
  getPublicReviews: async (params = {}) => {
    const res = await api.get('/reviews', { params });
    return res.data;
  },

  createReview: async (data) => {
    const res = await api.post('/reviews', data);
    return res.data;
  },

  likeReview: async (id) => {
    const res = await api.post(`/reviews/${id}/like`);
    return res.data;
  },

  // Admin
  getAdminReviews: async (params = {}) => {
    const res = await api.get('/reviews/admin', { params });
    return res.data;
  },

  updateReviewStatus: async (id, data) => {
    const res = await api.patch(`/reviews/admin/${id}`, data);
    return res.data;
  },

  deleteReview: async (id) => {
    const res = await api.delete(`/reviews/admin/${id}`);
    return res.data;
  },
};
