import express from 'express';
import {
  getTeamMembers,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
} from '../controllers/team.controller.js';
import { protect } from '../middleware/auth.js';
import { authorizeAdmin } from '../middleware/admin.js';

const router = express.Router();

router.get('/', getTeamMembers);
router.post('/', protect, authorizeAdmin, createTeamMember);
router.put('/:id', protect, authorizeAdmin, updateTeamMember);
router.delete('/:id', protect, authorizeAdmin, deleteTeamMember);

export default router;
