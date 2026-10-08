import express from 'express';
import {
  getGalleryItems,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  likeGalleryItem,
} from '../controllers/gallery.controller.js';
import { protect } from '../middleware/auth.js';
import { authorizeAdmin } from '../middleware/admin.js';

const router = express.Router();

router.get('/', getGalleryItems);
router.post('/', protect, authorizeAdmin, createGalleryItem);
router.put('/:id', protect, authorizeAdmin, updateGalleryItem);
router.delete('/:id', protect, authorizeAdmin, deleteGalleryItem);
router.post('/:id/like', likeGalleryItem);

export default router;
