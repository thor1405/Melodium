import express from 'express';
import {
  getAdminOverview,
  getTodaySchedule,
  getAllBookings,
  updateBookingStatus,
  createAdminBooking,
  blockSlot,
  getBlockedSlots,
  deleteBlockedSlot,
  getAllUsers,
  updateUserByAdmin,
  deleteUserByAdmin,
  getAnalytics,
  getActivityLogs,
} from '../controllers/admin.controller.js';
import { protect } from '../middleware/auth.js';
import { authorizeAdmin } from '../middleware/admin.js';

const router = express.Router();

// Guard all admin routes with authentication & admin check
router.use(protect, authorizeAdmin);

router.get('/overview', getAdminOverview);
router.get('/today-schedule', getTodaySchedule);
router.get('/bookings', getAllBookings);
router.post('/bookings', createAdminBooking);
router.patch('/bookings/:id/status', updateBookingStatus);
router.post('/blocked-slots', blockSlot);
router.get('/blocked-slots', getBlockedSlots);
router.delete('/blocked-slots/:id', deleteBlockedSlot);
router.get('/users', getAllUsers);
router.patch('/users/:id', updateUserByAdmin);
router.delete('/users/:id', deleteUserByAdmin);
router.get('/analytics', getAnalytics);
router.get('/activity-logs', getActivityLogs);

export default router;
