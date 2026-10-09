import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    userName: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },
    userEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    userRole: {
      type: String,
      trim: true,
      default: 'Musician / SJEC Student',
      maxlength: [100, 'Role cannot exceed 100 characters'],
    },
    userAvatar: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      required: [true, 'Please select a star rating (1 to 5)'],
      min: [1, 'Rating must be at least 1 star'],
      max: [5, 'Rating cannot exceed 5 stars'],
      default: 5,
    },
    title: {
      type: String,
      required: [true, 'Please provide a review headline or title'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    comment: {
      type: String,
      required: [true, 'Please provide your detailed review experience'],
      trim: true,
      maxlength: [1500, 'Review comment cannot exceed 1500 characters'],
    },
    category: {
      type: String,
      enum: [
        'STUDIO_EXPERIENCE',
        'JAM_ROOM_EQUIPMENT',
        'EVENTS_CONCERTS',
        'GENERAL',
      ],
      default: 'STUDIO_EXPERIENCE',
    },
    status: {
      type: String,
      enum: ['APPROVED', 'PENDING', 'FLAGGED'],
      default: 'APPROVED',
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    likesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    likedBy: {
      type: [String],
      default: [],
    },
    verifiedMusician: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

reviewSchema.index({ status: 1, createdAt: -1 });
reviewSchema.index({ rating: -1 });
reviewSchema.index({ isFeatured: 1 });

const Review = mongoose.model('Review', reviewSchema);

export default Review;
