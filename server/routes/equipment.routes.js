import express from 'express';
import {
  getEquipment,
  getAllEquipmentAdmin,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  uploadEquipmentPhoto,
} from '../controllers/equipment.controller.js';
import { protect } from '../middleware/auth.js';
import { authorizeAdmin } from '../middleware/admin.js';
import { uploadGalleryImage } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', getEquipment);

// Admin routes
router.get('/admin', protect, authorizeAdmin, getAllEquipmentAdmin);
router.post('/upload', protect, authorizeAdmin, uploadGalleryImage.single('image'), uploadEquipmentPhoto);
router.post('/', protect, authorizeAdmin, createEquipment);
router.put('/:id', protect, authorizeAdmin, updateEquipment);
router.delete('/:id', protect, authorizeAdmin, deleteEquipment);

export default router;
