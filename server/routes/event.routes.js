import express from 'express';
import {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  toggleRsvp,
} from '../controllers/event.controller.js';
import { protect } from '../middleware/auth.js';
import { authorizeAdmin } from '../middleware/admin.js';

const router = express.Router();

router.get('/', getEvents);
router.get('/:slugOrId', getEvent);
router.post('/', protect, authorizeAdmin, createEvent);
router.put('/:id', protect, authorizeAdmin, updateEvent);
router.delete('/:id', protect, authorizeAdmin, deleteEvent);
router.post('/:id/rsvp', protect, toggleRsvp);

export default router;
