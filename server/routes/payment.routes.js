import express from 'express';
import { createPaymentIntent, getStripeConfig } from '../controllers/payment.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/config', getStripeConfig);
router.post('/create-payment-intent', protect, createPaymentIntent);

export default router;
