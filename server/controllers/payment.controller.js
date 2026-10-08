import Stripe from 'stripe';
import { getActiveSettings } from '../services/availability.service.js';

const getStripeInstance = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';
  return new Stripe(secretKey, {
    apiVersion: '2023-10-16',
  });
};

// @desc    Get Stripe Publishable Key & verify config
// @route   GET /api/payments/config
// @access  Public
export const getStripeConfig = async (req, res, next) => {
  try {
    const publishableKey =
      process.env.STRIPE_PUBLISHABLE_KEY ||
      'pk_test_51MelodiumSjecTestKey2026JamRoomPassPubKey999';

    res.json({
      success: true,
      publishableKey,
      feeAmount: 500,
      currency: 'inr',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create Stripe PaymentIntent for Jam Room Day Pass (₹500 INR)
// @route   POST /api/payments/create-payment-intent
// @access  Private (External Musician / Outsider)
export const createPaymentIntent = async (req, res, next) => {
  try {
    const { date, slots, bookerName } = req.body;

    if (!date || !slots || !Array.isArray(slots) || slots.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Booking date and at least one slot are required.',
      });
    }

    const stripe = getStripeInstance();
    const amountInPaise = 500 * 100; // ₹500 = 50,000 paise

    // Check if real Stripe key or demo test mode
    const isMockOrDemoKey =
      !process.env.STRIPE_SECRET_KEY ||
      process.env.STRIPE_SECRET_KEY.startsWith('sk_test_51MelodiumSjecTest');

    if (isMockOrDemoKey) {
      // Provide robust sandbox PaymentIntent format for local testing
      const mockPaymentIntentId = `pi_mock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const mockClientSecret = `${mockPaymentIntentId}_secret_${Math.random().toString(36).substring(2, 9)}`;

      return res.json({
        success: true,
        clientSecret: mockClientSecret,
        paymentIntentId: mockPaymentIntentId,
        publishableKey:
          process.env.STRIPE_PUBLISHABLE_KEY ||
          'pk_test_51MelodiumSjecTestKey2026JamRoomPassPubKey999',
        amount: 500,
        currency: 'inr',
        isSandbox: true,
      });
    }

    // Live or Standard Stripe Test Key
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInPaise,
      currency: 'inr',
      payment_method_types: ['card'],
      description: `Melodium SJEC Jam Room Day Pass - ${date} (${slots.length} slots)`,
      metadata: {
        userId: req.user._id.toString(),
        userEmail: req.user.email,
        date,
        slotsCount: slots.length.toString(),
        bookerName: (bookerName || req.user.name || '').trim(),
      },
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      amount: 500,
      currency: 'inr',
      isSandbox: false,
    });
  } catch (error) {
    console.error('Stripe PaymentIntent Error:', error);
    next(error);
  }
};
