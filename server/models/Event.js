import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    tagline: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
    },
    category: {
      type: String,
      enum: ['CONCERT', 'WORKSHOP', 'JAM_SESSION', 'COMPETITION', 'FEST', 'AUDITIONS'],
      default: 'CONCERT',
    },
    venue: {
      type: String,
      required: [true, 'Venue is required'],
      default: 'Kalam Auditorium, SJEC',
    },
    date: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    dateString: {
      type: String, // YYYY-MM-DD
    },
    startTime: {
      type: String,
      default: '16:30',
    },
    endTime: {
      type: String,
      default: '19:30',
    },
    status: {
      type: String,
      enum: ['UPCOMING', 'ONGOING', 'COMPLETED'],
      default: 'UPCOMING',
    },
    posterImage: {
      type: String,
      default: '',
    },
    registrationUrl: {
      type: String,
      default: '',
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    rsvps: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Event', eventSchema);
