import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: String, // Format: YYYY-MM-DD
      required: true,
      index: true,
    },
    startTime: {
      type: String, // Format: HH:mm (e.g., "14:00")
      required: true,
    },
    endTime: {
      type: String, // Format: HH:mm (e.g., "15:00")
      required: true,
    },
    durationMinutes: {
      type: Number,
      default: 60,
    },
    bookerName: {
      type: String,
      default: '',
      trim: true,
    },
    purpose: {
      type: String,
      default: 'Jam Session',
      trim: true,
      maxlength: 200,
    },
    participantCount: {
      type: Number,
      default: 1,
      min: 1,
      max: 15,
    },
    participants: {
      type: [String],
      default: [],
    },
    instrumentsNeeded: {
      type: [String],
      default: [],
    },
    notes: {
      type: String,
      maxlength: 500,
      default: '',
    },
    userType: {
      type: String,
      enum: ['SJEC_STUDENT', 'OUTSIDER', 'ADMIN'],
      default: 'SJEC_STUDENT',
      index: true,
    },
    feeAmount: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['FREE', 'PAID', 'PENDING_AT_DESK'],
      default: 'FREE',
    },
    paymentMethod: {
      type: String,
      default: 'STUDENT_FREE_PASS',
    },
    razorpayOrderId: {
      type: String,
      default: '',
      index: true,
    },
    razorpayPaymentId: {
      type: String,
      default: '',
      index: true,
    },
    razorpaySignature: {
      type: String,
      default: '',
    },
    stripePaymentIntentId: {
      type: String,
      default: '',
    },
    stripeReceiptUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'REJECTED', 'COMPLETED'],
      default: 'CONFIRMED',
      index: true,
    },
    cancellationReason: {
      type: String,
      default: '',
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    cancelledAt: {
      type: Date,
    },
    adminNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Unique compound index preventing duplicate confirmed bookings on the exact same date and startTime
bookingSchema.index(
  { date: 1, startTime: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'CONFIRMED' },
  }
);
bookingSchema.index({ userId: 1, date: 1 });

export default mongoose.model('Booking', bookingSchema);
