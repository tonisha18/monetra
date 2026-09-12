import express from 'express';
import {
  getAllTransactions,
  getTransaction,
  create,
  update,
  remove,
} from '../controllers/transactionController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', requireAuth, getAllTransactions);
router.post('/', requireAuth, create);
router.get('/:id', requireAuth, getTransaction);
router.put('/:id', requireAuth, update);
router.delete('/:id', requireAuth, remove);

export default router;
