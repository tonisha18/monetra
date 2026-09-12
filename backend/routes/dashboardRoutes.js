import express from 'express';
import { getSummary, getCharts } from '../controllers/dashboardController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/summary', requireAuth, getSummary);
router.get('/charts', requireAuth, getCharts);

export default router;
