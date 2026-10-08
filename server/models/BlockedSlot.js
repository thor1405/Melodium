import mongoose from 'mongoose';

const blockedSlotSchema = new mongoose.Schema(
  {
    date: {
      type: String, // Format: YYYY-MM-DD
      required: true,
      index: true,
    },
    startTime: {
      type: String, // Format: HH:mm (e.g. "12:00")
      required: true,
    },
    endTime: {
      type: String, // Format: HH:mm (e.g. "13:00")
      required: true,
    },
    isAllDay: {
      type: Boolean,
      default: false,
    },
    reason: {
      type: String,
      required: [true, 'Reason for blocking slot is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['MAINTENANCE', 'COLLEGE_EVENT', 'BAND_PRACTICE', 'SOUND_CHECK', 'HOLIDAY', 'OTHER'],
      default: 'MAINTENANCE',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

blockedSlotSchema.index({ date: 1, startTime: 1 });

export default mongoose.model('BlockedSlot', blockedSlotSchema);
