import mongoose from 'mongoose';

const bookingSettingsSchema = new mongoose.Schema(
  {
    openingTime: {
      type: String,
      default: '09:00',
    },
    closingTime: {
      type: String,
      default: '18:00',
    },
    slotDurationMinutes: {
      type: Number,
      default: 60,
    },
    availableDays: {
      type: [Number], // 0: Sun, 1: Mon, ..., 6: Sat
      default: [1, 2, 3, 4, 5, 6],
    },
    maxAdvanceBookingDays: {
      type: Number,
      default: 7,
    },
    maxDailyBookingsPerStudent: {
      type: Number,
      default: 1,
    },
    maxWeeklyBookingsPerStudent: {
      type: Number,
      default: 3,
    },
    cancellationCutoffHours: {
      type: Number,
      default: 2,
    },
    requireAdminApproval: {
      type: Boolean,
      default: false,
    },
    isBookingEnabled: {
      type: Boolean,
      default: true,
    },
    maintenanceNotice: {
      type: String,
      default: '',
    },
    operatingTimezone: {
      type: String,
      default: 'Asia/Kolkata',
    },
    allowedEmailDomains: {
      type: [String],
      default: ['sjec.ac.in'],
    },
    enforceEmailDomain: {
      type: Boolean,
      default: false,
    },
    roomName: {
      type: String,
      default: 'Melodium SJEC Jam Room (Studio 1)',
    },
    roomLocation: {
      type: String,
      default: 'Academic Block 3, Ground Floor, St. Joseph Engineering College, Vamanjoor, Mangaluru, Karnataka 575028',
    },
    maxParticipants: {
      type: Number,
      default: 8,
    },
    rulesSummary: {
      type: [String],
      default: [
        'Bookings operate in strict 1-hour slots.',
        'Maximum 1 booking per student per day.',
        'Cancellations permitted up to 2 hours before the session.',
        'Keep equipment in pristine condition and report damages immediately.',
        'No food or open beverages permitted near amplifiers and pedalboards.',
      ],
    },
    // Homepage Background Video CMS
    heroVideoUrl: {
      type: String,
      default: 'https://cdn.pixabay.com/video/2016/09/13/4998-183792019_large.mp4',
    },
    heroVideoTitle: {
      type: String,
      default: 'Melodium Live Acoustic Session',
    },
    heroVideoEnabled: {
      type: Boolean,
      default: true,
    },
    heroVideoOpacity: {
      type: Number,
      default: 0.45,
    },
    heroVideoMuted: {
      type: Boolean,
      default: true,
    },
    heroVideoPoster: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('BookingSettings', bookingSettingsSchema);
