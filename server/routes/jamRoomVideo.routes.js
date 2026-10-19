import express from 'express';
import {
  getJamRoomVideos,
  getAdminJamRoomVideos,
  getJamRoomVideoById,
  createJamRoomVideo,
  updateJamRoomVideo,
  deleteJamRoomVideo,
  likeJamRoomVideo,
  viewJamRoomVideo,
  uploadVideoFile,
} from '../controllers/jamRoomVideo.controller.js';
import { protect } from '../middleware/auth.js';
import { authorizeAdmin } from '../middleware/admin.js';
import { uploadVideo } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', getJamRoomVideos);
router.get('/detail/:id', getJamRoomVideoById);
router.post('/:id/like', likeJamRoomVideo);
router.post('/:id/view', viewJamRoomVideo);

// Protected Admin routes
router.get('/admin/all', protect, authorizeAdmin, getAdminJamRoomVideos);
router.post('/', protect, authorizeAdmin, uploadVideo.single('video'), createJamRoomVideo);
router.post('/upload', protect, authorizeAdmin, uploadVideo.single('video'), uploadVideoFile);
router.put('/:id', protect, authorizeAdmin, uploadVideo.single('video'), updateJamRoomVideo);
router.delete('/:id', protect, authorizeAdmin, deleteJamRoomVideo);

export default router;
