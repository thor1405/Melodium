import Booking from '../models/Booking.js';
import BlockedSlot from '../models/BlockedSlot.js';
import BookingSettings from '../models/BookingSettings.js';
import { defaultBookingSettings } from '../config/defaultSettings.js';

// Helper to convert "HH:mm" to minutes since midnight
const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

// Helper to format minutes to "HH:mm"
const minutesToTime = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
  const minutes = (totalMinutes % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

// Get current date and time in Indian Standard Time (or configured timezone)
export const getNowInTimezone = (timezone = 'Asia/Kolkata') => {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const timeFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const currentDateString = formatter.format(now); // "YYYY-MM-DD"
  const currentTimeString = timeFormatter.format(now); // "HH:mm"

  return { currentDateString, currentTimeString, now };
};

// Get or initialize active settings
export const getActiveSettings = async () => {
  let settings = await BookingSettings.findOne();
  if (!settings) {
    settings = await BookingSettings.create(defaultBookingSettings);
  }
  return settings;
};

/**
 * Generate slots and calculate real-time availability for a given date.
 * @param {string} dateString - Format: "YYYY-MM-DD"
 * @param {string|null} currentUserId - Authenticated user's ID
 * @param {boolean} isAdmin - Whether the caller is an Admin
 */
export const calculateDayAvailability = async (dateString, currentUserId = null, isAdmin = false) => {
  const settings = await getActiveSettings();
  const { currentDateString, currentTimeString } = getNowInTimezone(settings.operatingTimezone);

  const targetDate = new Date(`${dateString}T00:00:00Z`);
  const dayOfWeek = targetDate.getUTCDay(); // 0 = Sun, 1 = Mon ...

  // Check if booking is globally enabled
  if (!settings.isBookingEnabled && !isAdmin) {
    return {
      date: dateString,
      isAvailable: false,
      reason: settings.maintenanceNotice || 'Jam room bookings are temporarily disabled by the administrator.',
      slots: [],
      settings,
    };
  }

  // Check if day is open
  if (!settings.availableDays.includes(dayOfWeek)) {
    return {
      date: dateString,
      isAvailable: false,
      reason:
        dayOfWeek === 0
          ? 'The Jam Room is closed on Sundays (Weekly College Holiday).'
          : 'The Jam Room is closed on this day of the week.',
      slots: [],
      settings,
    };
  }

  // Check advance booking window (Strict 1-Month Window from today)
  const today = new Date(`${currentDateString}T00:00:00Z`);
  const maxAdvanceDate = new Date(today);
  maxAdvanceDate.setUTCMonth(maxAdvanceDate.getUTCMonth() + 1);
  const maxAdvanceDateString = maxAdvanceDate.toISOString().split('T')[0];

  if (dateString < currentDateString && !isAdmin) {
    return {
      date: dateString,
      isAvailable: false,
      reason: 'Cannot view or book slots for past dates.',
      slots: [],
      settings,
    };
  }

  if (dateString > maxAdvanceDateString && !isAdmin) {
    return {
      date: dateString,
      isAvailable: false,
      reason: `Bookings can only be reserved up to 1 month in advance (until ${maxAdvanceDateString}).`,
      slots: [],
      settings,
    };
  }

  // Generate standard time slots
  const startMin = timeToMinutes(settings.openingTime);
  const endMin = timeToMinutes(settings.closingTime);
  const duration = settings.slotDurationMinutes || 60;

  const rawSlots = [];
  for (let m = startMin; m + duration <= endMin; m += duration) {
    const slotStart = minutesToTime(m);
    const slotEnd = minutesToTime(m + duration);
    rawSlots.push({
      startTime: slotStart,
      endTime: slotEnd,
      durationMinutes: duration,
    });
  }

  // Fetch active bookings for this date (CONFIRMED and PENDING)
  const activeBookings = await Booking.find({
    date: dateString,
    status: { $in: ['CONFIRMED', 'PENDING'] },
  }).populate('userId', 'name email usn department phone instrument avatar userType organization city year');

  // Fetch blocked slots for this date
  const blockedSlots = await BlockedSlot.find({ date: dateString });

  const isToday = dateString === currentDateString;
  const currentMinutes = timeToMinutes(currentTimeString);

  // Map slots with status
  const evaluatedSlots = rawSlots.map((slot) => {
    const slotStartMin = timeToMinutes(slot.startTime);

    // 1. Check if slot is in the past (for today)
    const isPast = isToday && slotStartMin <= currentMinutes;

    // 2. Check if blocked by admin
    const blocked = blockedSlots.find((b) => {
      if (b.isAllDay) return true;
      const bStartMin = timeToMinutes(b.startTime);
      const bEndMin = timeToMinutes(b.endTime);
      return slotStartMin >= bStartMin && slotStartMin < bEndMin;
    });

    if (blocked) {
      return {
        ...slot,
        date: dateString,
        status: 'BLOCKED',
        statusLabel: 'Blocked / Unavailable',
        reason: blocked.reason || 'Reserved for College / Maintenance',
        blockedId: blocked._id,
        isPast,
      };
    }

    // 3. Check if booked
    const booking = activeBookings.find((b) => b.startTime === slot.startTime);
    if (booking) {
      const isMine = currentUserId && booking.userId && booking.userId._id.toString() === currentUserId.toString();
      return {
        ...slot,
        date: dateString,
        status: 'BOOKED',
        statusLabel: isMine ? 'Your Booking' : 'Booked',
        bookingId: booking.bookingId,
        bookingDbId: booking._id,
        isMine,
        bookingStatus: booking.status,
        purpose: isAdmin || isMine ? booking.purpose : 'Reserved Band Session',
        bookerName: booking.bookerName || booking.userId?.name,
        userType: booking.userType,
        feeAmount: booking.feeAmount,
        participants: booking.participants || [],
        participantCount: booking.participantCount || 1,
        razorpayPaymentId: booking.razorpayPaymentId,
        razorpayOrderId: booking.razorpayOrderId,
        userId: booking.userId
          ? {
              _id: booking.userId._id,
              name: booking.userId.name,
              email: booking.userId.email,
              usn: booking.userId.usn,
              phone: booking.userId.phone,
              department: booking.userId.department,
              year: booking.userId.year,
              city: booking.userId.city,
              organization: booking.userId.organization,
              avatar: booking.userId.avatar,
            }
          : null,
        student: isAdmin
          ? {
              name: booking.userId?.name,
              usn: booking.userId?.usn,
              department: booking.userId?.department,
              email: booking.userId?.email,
              phone: booking.userId?.phone,
              avatar: booking.userId?.avatar,
            }
          : isMine
          ? { name: 'You' }
          : null,
        isPast,
      };
    }

    // 4. Past slot
    if (isPast) {
      return {
        ...slot,
        status: 'PAST',
        statusLabel: 'Past Slot',
        isPast: true,
      };
    }

    // 5. Available
    return {
      ...slot,
      status: 'AVAILABLE',
      statusLabel: 'Available',
      isPast: false,
    };
  });

  return {
    date: dateString,
    isAvailable: true,
    totalSlots: evaluatedSlots.length,
    availableSlotsCount: evaluatedSlots.filter((s) => s.status === 'AVAILABLE').length,
    slots: evaluatedSlots,
    settings: {
      openingTime: settings.openingTime,
      closingTime: settings.closingTime,
      slotDurationMinutes: settings.slotDurationMinutes,
      cancellationCutoffHours: settings.cancellationCutoffHours,
      requireAdminApproval: settings.requireAdminApproval,
      roomName: settings.roomName,
      roomLocation: settings.roomLocation,
      availableDays: settings.availableDays,
      isBookingEnabled: settings.isBookingEnabled,
    },
  };
};
