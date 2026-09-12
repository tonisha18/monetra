import express from 'express';
import { getProfile, updateProfile } from '../controllers/userController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/profile', requireAuth, getProfile);
router.put('/profile', requireAuth, updateProfile);

export default router;
