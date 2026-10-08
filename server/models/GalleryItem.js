import mongoose from 'mongoose';

const galleryItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['PERFORMANCES', 'JAM_SESSIONS', 'COMPETITIONS', 'COLLEGE_EVENTS', 'BEHIND_THE_SCENES', 'STUDIO_GEAR'],
      default: 'PERFORMANCES',
      index: true,
    },
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    thumbnailUrl: {
      type: String,
      default: '',
    },
    caption: {
      type: String,
      default: '',
      trim: true,
    },
    eventDate: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: 'SJEC Campus',
    },
    featured: {
      type: Boolean,
      default: false,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('GalleryItem', galleryItemSchema);
