import express from 'express';
import {
  login,
  register,
  confirmEmail,
  resendConfirmation,
  checkEmailStatus,
  getConfigStatus,
} from '../controllers/authController.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.post('/confirm-email', confirmEmail);
router.post('/resend-confirmation', resendConfirmation);
router.get('/email-status', checkEmailStatus);
router.get('/config-status', getConfigStatus);

export default router;
