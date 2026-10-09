import Razorpay from 'razorpay';
import crypto from 'crypto';

const getRazorpayInstance = () => {
  const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_51MelodiumSjecTestKey2026';
  const keySecret = process.env.RAZORPAY_KEY_SECRET || 'rzp_sec_placeholder';
  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

// @desc    Get Razorpay Key ID & Payment Configuration
// @route   GET /api/payments/config
// @access  Public
export const getPaymentConfig = async (req, res, next) => {
  try {
    const keyId =
      process.env.RAZORPAY_KEY_ID ||
      'rzp_test_51MelodiumSjecTestKey2026';

    res.json({
      success: true,
      keyId,
      feeAmount: 500,
      currency: 'INR',
      gateway: 'RAZORPAY',
    });
  } catch (error) {
    next(error);
  }
};

// Backwards compatibility alias
export const getStripeConfig = getPaymentConfig;

// @desc    Create Razorpay Order for Jam Room Day Pass (₹500 INR)
// @route   POST /api/payments/create-order, POST /api/payments/create-razorpay-order
// @access  Private (External Musician / Outsider)
export const createPaymentOrder = async (req, res, next) => {
  try {
    const { date, slots, bookerName } = req.body;

    if (!date || !slots || !Array.isArray(slots) || slots.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Booking date and at least one slot are required.',
      });
    }

    const amountInPaise = 500 * 100; // ₹500 = 50,000 paise
    const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_51MelodiumSjecTestKey2026';
    const keySecret = process.env.RAZORPAY_KEY_SECRET || '';

    // Check if real Razorpay credentials are provided or test mock mode
    const isMockOrDemoKey =
      !keySecret ||
      keySecret === 'rzp_sec_placeholder' ||
      keyId.startsWith('rzp_test_51MelodiumSjecTest');

    if (isMockOrDemoKey) {
      // Provide sandbox Order ID for local development & automated tests
      const mockOrderId = `order_mock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      return res.json({
        success: true,
        orderId: mockOrderId,
        amount: amountInPaise,
        currency: 'INR',
        keyId,
        isSandbox: true,
        businessName: 'Melodium SJEC',
        description: `Jam Room Rehearsal Pass - ${date} (${slots.length} slots)`,
      });
    }

    // Live or Standard Razorpay Order
    const razorpay = getRazorpayInstance();
    const shortReceipt = `rcpt_${Date.now()}`.substring(0, 40);

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: shortReceipt,
      notes: {
        userId: req.user._id.toString(),
        userEmail: req.user.email,
        date,
        slotsCount: slots.length.toString(),
        bookerName: (bookerName || req.user.name || '').trim(),
      },
    });

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
      isSandbox: false,
      businessName: 'Melodium SJEC',
      description: `Jam Room Rehearsal Pass - ${date} (${slots.length} slots)`,
    });
  } catch (error) {
    console.error('Razorpay Order Creation Error:', error);
    next(error);
  }
};

// Backwards compatibility alias
export const createPaymentIntent = createPaymentOrder;

// Helper to verify Razorpay signature
export const verifyRazorpaySignature = (orderId, paymentId, signature) => {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret || secret === 'rzp_sec_placeholder') {
    return true; // Sandbox bypass
  }

  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return generatedSignature === signature;
};

