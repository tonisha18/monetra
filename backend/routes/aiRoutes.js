import express from 'express';
import { getFinancialReport, postFinancialChat } from '../controllers/aiController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/report', requireAuth, getFinancialReport);
router.post('/chat', requireAuth, postFinancialChat);

export default router;
