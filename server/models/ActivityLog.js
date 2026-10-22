import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    userName: String,
    userRole: String,
    action: {
      type: String,
      required: true,
    },
    details: {
      type: String,
      default: '',
    },
    entityType: {
      type: String,
      enum: ['BOOKING', 'SLOT_BLOCK', 'SETTINGS', 'EVENT', 'GALLERY', 'TEAM', 'USER', 'REVIEW', 'EQUIPMENT', 'SYSTEM'],
      default: 'SYSTEM',
    },
    entityId: String,
    ip: String,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('ActivityLog', activityLogSchema);
