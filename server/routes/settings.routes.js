import express from 'express';
import {
  getBookingSettings,
  updateBookingSettings,
  uploadHeroVideo,
} from '../controllers/settings.controller.js';
import { protect } from '../middleware/auth.js';
import { authorizeAdmin } from '../middleware/admin.js';
import { uploadVideo } from '../middleware/upload.js';

const router = express.Router();

router.get('/booking', getBookingSettings);
router.patch('/booking', protect, authorizeAdmin, updateBookingSettings);
router.post('/upload-video', protect, authorizeAdmin, uploadVideo.single('video'), uploadHeroVideo);

export default router;
