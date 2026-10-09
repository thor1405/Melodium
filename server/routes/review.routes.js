import express from 'express';
import {
  getPublicReviews,
  createReview,
  likeReview,
  getAdminReviews,
  updateReviewStatus,
  deleteReview,
} from '../controllers/review.controller.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { authorizeAdmin } from '../middleware/admin.js';

const router = express.Router();

// Public routes
router.get('/', getPublicReviews);
router.post('/', optionalAuth, createReview);
router.post('/:id/like', optionalAuth, likeReview);

// Admin Moderation routes
router.get('/admin', protect, authorizeAdmin, getAdminReviews);
router.patch('/admin/:id', protect, authorizeAdmin, updateReviewStatus);
router.delete('/admin/:id', protect, authorizeAdmin, deleteReview);

export default router;
