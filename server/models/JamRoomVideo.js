import mongoose from 'mongoose';

const jamRoomVideoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Short video title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    videoUrl: {
      type: String,
      required: [true, 'Video URL or uploaded file path is required'],
      trim: true,
    },
    thumbnailUrl: {
      type: String,
      default: '',
      trim: true,
    },
    duration: {
      type: Number,
      default: 30, // Default 30 seconds
      min: [1, 'Duration must be at least 1 second'],
      max: [120, 'Duration cannot exceed 120 seconds'],
    },
    tag: {
      type: String,
      default: 'Studio Tour',
      enum: [
        'Studio Tour',
        'Acoustics',
        'Drum Kit',
        'Guitars & Amps',
        'Vocal Booth',
        'Mixing Console',
        'Live Rehearsal',
        'Soundcheck',
        'Lionel Mix',
      ],
    },
    isFeatured: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

jamRoomVideoSchema.index({ isActive: 1, order: 1, createdAt: -1 });

export default mongoose.model('JamRoomVideo', jamRoomVideoSchema);
