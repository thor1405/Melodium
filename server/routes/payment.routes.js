import express from 'express';
import {
  createPaymentOrder,
  getPaymentConfig,
  createPaymentIntent,
  getStripeConfig,
} from '../controllers/payment.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/config', getPaymentConfig);
router.post('/create-order', protect, createPaymentOrder);
router.post('/create-razorpay-order', protect, createPaymentOrder);
router.post('/create-payment-intent', protect, createPaymentIntent);

export default router;

