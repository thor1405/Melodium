import express from 'express';
import {
  getAvailability,
  createBooking,
  getMyBookings,
  getBookingDetails,
  cancelBooking,
} from '../controllers/booking.controller.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/availability', optionalAuth, getAvailability);
router.post('/', protect, createBooking);
router.get('/my', protect, getMyBookings);
router.get('/:id', protect, getBookingDetails);
router.delete('/:id', protect, cancelBooking);

export default router;
