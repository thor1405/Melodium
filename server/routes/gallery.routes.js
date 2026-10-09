import express from 'express';
import {
  getGalleryItems,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  likeGalleryItem,
  uploadGalleryPhoto,
} from '../controllers/gallery.controller.js';
import { protect } from '../middleware/auth.js';
import { authorizeAdmin } from '../middleware/admin.js';
import { uploadGalleryImage } from '../middleware/upload.js';

const router = express.Router();

router.get('/', getGalleryItems);
router.post('/upload', protect, authorizeAdmin, uploadGalleryImage.single('photo'), uploadGalleryPhoto);
router.post('/', protect, authorizeAdmin, createGalleryItem);
router.put('/:id', protect, authorizeAdmin, updateGalleryItem);
router.delete('/:id', protect, authorizeAdmin, deleteGalleryItem);
router.post('/:id/like', likeGalleryItem);

export default router;
