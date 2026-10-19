import api from './api';

export const jamRoomVideoService = {
  // Public: get active 30s short videos
  getVideos: async (params = {}) => {
    const res = await api.get('/jam-room-videos', { params });
    return res.data;
  },

  // Public: get single video details
  getVideoById: async (id) => {
    const res = await api.get(`/jam-room-videos/detail/${id}`);
    return res.data;
  },

  // Public: like a video
  likeVideo: async (id) => {
    const res = await api.post(`/jam-room-videos/${id}/like`);
    return res.data;
  },

  // Public: record a view
  viewVideo: async (id) => {
    const res = await api.post(`/jam-room-videos/${id}/view`);
    return res.data;
  },

  // Admin: get all videos (including inactive)
  getAdminVideos: async () => {
    const res = await api.get('/jam-room-videos/admin/all');
    return res.data;
  },

  // Admin: create short video (supports multipart upload with onProgress)
  createVideo: async (formData, onProgress) => {
    const isFormData = formData instanceof FormData;
    const config = {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    };
    const res = await api.post('/jam-room-videos', formData, config);
    return res.data;
  },

  // Admin: update short video
  updateVideo: async (id, formData, onProgress) => {
    const isFormData = formData instanceof FormData;
    const config = {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    };
    const res = await api.put(`/jam-room-videos/${id}`, formData, config);
    return res.data;
  },

  // Admin: delete short video
  deleteVideo: async (id) => {
    const res = await api.delete(`/jam-room-videos/${id}`);
    return res.data;
  },

  // Admin: standalone video file upload
  uploadVideoFile: async (formData, onProgress) => {
    const config = {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    };
    const res = await api.post('/jam-room-videos/upload', formData, config);
    return res.data;
  },
};
