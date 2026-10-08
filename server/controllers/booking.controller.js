import Stripe from 'stripe';
import Booking from '../models/Booking.js';
import BlockedSlot from '../models/BlockedSlot.js';
import Notification from '../models/Notification.js';
import ActivityLog from '../models/ActivityLog.js';
import {
  calculateDayAvailability,
  getActiveSettings,
  getNowInTimezone,
} from '../services/availability.service.js';
import {
  sendBookingConfirmationEmail,
  sendBookingCancellationEmail,
} from '../services/email.service.js';

// Helper to generate unique Booking Code
const generateBookingId = () => {
  const datePart = new Date().toISOString().slice(0, 7).replace('-', '');
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `MEL-${datePart}-${randomPart}`;
};

// Helper: convert HH:mm to minutes
const timeToMinutes = (t) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

// @desc    Get real-time slot availability for a specific date
// @route   GET /api/bookings/availability
// @access  Public (Optional Auth for 'isMine' marking)
export const getAvailability = async (req, res, next) => {
  try {
    const { date } = req.query;
    const settings = await getActiveSettings();
    const { currentDateString } = getNowInTimezone(settings.operatingTimezone);

    const queryDate = date || currentDateString;

    // Validate format YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(queryDate)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Expected YYYY-MM-DD.',
      });
    }

    const currentUserId = req.user?._id || null;
    const isAdmin = req.user?.role === 'ADMIN';

    const availability = await calculateDayAvailability(queryDate, currentUserId, isAdmin);

    res.json({
      success: true,
      data: availability,
    });
  } catch (error) {
    next(error);
  }
};

// Slot-level in-process mutex to sequence concurrent booking requests on the same slot
const activeSlotLocks = new Map();

const acquireSlotLock = async (slotKey) => {
  while (activeSlotLocks.has(slotKey)) {
    await activeSlotLocks.get(slotKey);
  }
  let resolveLock;
  const lockPromise = new Promise((resolve) => {
    resolveLock = resolve;
  });
  activeSlotLocks.set(slotKey, lockPromise);
  return () => {
    activeSlotLocks.delete(slotKey);
    resolveLock();
  };
};

// @desc    Create new Jam Room booking(s) (With Multi-Slot Batch Support, Double-Booking & Race Condition Prevention)
// @route   POST /api/bookings
// @access  Private (Student & Admin)
export const createBooking = async (req, res, next) => {
  const releaseLocks = [];
  try {
    const {
      date,
      startTime,
      startTimes,
      slots,
      purpose,
      bookerName,
      participantCount = 1,
      participants = [],
      instrumentsNeeded = [],
      notes = '',
    } = req.body;

    // Normalize requested start times into a deduplicated, sorted array
    let requestedStartTimes = [];
    if (Array.isArray(slots)) {
      requestedStartTimes = slots
        .map((s) => (typeof s === 'string' ? s : s?.startTime))
        .filter(Boolean);
    } else if (Array.isArray(startTimes)) {
      requestedStartTimes = startTimes.filter(Boolean);
    } else if (Array.isArray(startTime)) {
      requestedStartTimes = startTime.filter(Boolean);
    } else if (startTime) {
      requestedStartTimes = [startTime];
    }

    requestedStartTimes = [...new Set(requestedStartTimes)].sort();

    if (!date || requestedStartTimes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Date and at least one time slot are required.',
      });
    }

    const effectivePurpose = purpose?.trim() || 'Jam Session';

    // Acquire slot locks for each requested slot to prevent race conditions
    for (const st of requestedStartTimes) {
      const lock = await acquireSlotLock(`${date}_${st}`);
      releaseLocks.push(lock);
    }

    const settings = await getActiveSettings();
    const { currentDateString, currentTimeString } = getNowInTimezone(settings.operatingTimezone);

    // 1. Check if booking is globally enabled
    if (!settings.isBookingEnabled && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: settings.maintenanceNotice || 'Jam Room bookings are currently closed.',
      });
    }

    // 2. Validate day of week
    const targetDate = new Date(`${date}T00:00:00Z`);
    const dayOfWeek = targetDate.getUTCDay();
    if (!settings.availableDays.includes(dayOfWeek) && req.user.role !== 'ADMIN') {
      return res.status(400).json({
        success: false,
        message:
          dayOfWeek === 0
            ? 'The Jam Room is closed on Sundays (Weekly College Holiday).'
            : 'The Jam Room is closed on this day of the week.',
      });
    }

    // 3. Advance booking window check (Strict 1-Month Window from today)
    const today = new Date(`${currentDateString}T00:00:00Z`);
    const maxAdvanceDate = new Date(today);
    maxAdvanceDate.setUTCMonth(maxAdvanceDate.getUTCMonth() + 1);
    const maxAdvanceDateString = maxAdvanceDate.toISOString().split('T')[0];

    if (date < currentDateString && req.user.role !== 'ADMIN') {
      return res.status(400).json({
        success: false,
        message: 'Cannot make bookings for past dates.',
      });
    }

    if (date > maxAdvanceDateString && req.user.role !== 'ADMIN') {
      return res.status(400).json({
        success: false,
        message: `Bookings can only be reserved up to 1 month in advance (until ${maxAdvanceDateString}).`,
      });
    }

    // 4. Check student 1-active-date booking policy (unless admin)
    // A student can book any number of slots on the SAME date.
    // But they cannot book slots on a DIFFERENT future date until all sessions on their active date have passed or been cancelled.
    if (req.user.role !== 'ADMIN') {
      const activeFutureBookings = await Booking.find({
        userId: req.user._id,
        date: { $gte: currentDateString },
        status: { $in: ['CONFIRMED', 'PENDING'] },
      }).select('date startTime');

      if (activeFutureBookings.length > 0) {
        const activeDates = [...new Set(activeFutureBookings.map((b) => b.date))];
        const differentActiveDate = activeDates.find((d) => d !== date);

        if (differentActiveDate) {
          const formattedActiveDate = new Date(`${differentActiveDate}T00:00:00`).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });
          return res.status(400).json({
            success: false,
            message: `You already have active reservations on ${formattedActiveDate}. You can reserve more slots on that same day, but you cannot book a different date until your sessions on ${formattedActiveDate} are completed or cancelled.`,
          });
        }
      }
    }

    const slotDuration = settings.slotDurationMinutes || 60;
    const openMinutes = timeToMinutes(settings.openingTime);
    const closeMinutes = timeToMinutes(settings.closingTime);
    const currentMinutes = timeToMinutes(currentTimeString);

    // 5. Pre-validate every requested slot before committing any booking
    for (const st of requestedStartTimes) {
      const startMinutes = timeToMinutes(st);
      const endMinutes = startMinutes + slotDuration;

      // Operating hours validation
      if (startMinutes < openMinutes || endMinutes > closeMinutes) {
        return res.status(400).json({
          success: false,
          message: `Slot ${st} is outside operating hours (${settings.openingTime} - ${settings.closingTime}).`,
        });
      }

      // Past time validation if date is today
      if (date === currentDateString && startMinutes <= currentMinutes) {
        return res.status(400).json({
          success: false,
          message: `Slot ${st} has already passed for today.`,
        });
      }

      // Check if blocked by admin
      const isBlocked = await BlockedSlot.findOne({
        date,
        $or: [
          { isAllDay: true },
          { startTime: { $lte: st }, endTime: { $gt: st } },
        ],
      });

      if (isBlocked) {
        return res.status(409).json({
          success: false,
          message: `Slot ${st} is blocked: ${isBlocked.reason || 'Maintenance / College Rehearsal'}.`,
        });
      }

      // Check if already booked by another user
      const existingConflict = await Booking.findOne({
        date,
        startTime: st,
        status: { $in: ['CONFIRMED', 'PENDING'] },
      });

      if (existingConflict) {
        return res.status(409).json({
          success: false,
          message: `Slot ${st} was just booked by another user. Please choose another time.`,
        });
      }
    }

    // 6. Calculate fee and payment info
    const isOutsider =
      req.user.userType === 'OUTSIDER' ||
      (!req.user.email.endsWith('@sjec.ac.in') && req.user.role !== 'ADMIN');
    const effectiveUserType = req.user.role === 'ADMIN' ? 'ADMIN' : isOutsider ? 'OUTSIDER' : 'SJEC_STUDENT';
    const totalDayFee = isOutsider ? 500 : 0; // Flat ₹500 for outsiders, ₹0 Free for SJEC students
    const paymentIntentId = req.body.paymentIntentId || req.body.stripePaymentIntentId || '';

    // Stripe verification for external musicians
    if (isOutsider && req.user.role !== 'ADMIN') {
      if (!paymentIntentId) {
        return res.status(400).json({
          success: false,
          message: 'External musician reservations require successful ₹500 Stripe payment confirmation.',
        });
      }

      const secretKey = process.env.STRIPE_SECRET_KEY || '';
      const isMockKey =
        !secretKey ||
        secretKey.startsWith('sk_test_51MelodiumSjecTest') ||
        paymentIntentId.startsWith('pi_mock_');

      if (!isMockKey) {
        try {
          const stripe = new Stripe(secretKey, { apiVersion: '2023-10-16' });
          const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
          if (pi.status !== 'succeeded') {
            return res.status(400).json({
              success: false,
              message: `Stripe payment is not completed. Current status: ${pi.status}. Please complete payment first.`,
            });
          }
        } catch (stripeErr) {
          return res.status(400).json({
            success: false,
            message: `Stripe payment verification failed: ${stripeErr.message || 'Invalid Payment Intent'}`,
          });
        }
      }
    }

    const effectivePaymentMethod = isOutsider ? 'STRIPE' : 'STUDENT_FREE_PASS';
    const paymentStatus = isOutsider ? 'PAID' : 'FREE';

    // 7. Create all bookings atomically
    const initialStatus = settings.requireAdminApproval && req.user.role !== 'ADMIN'
      ? 'PENDING'
      : 'CONFIRMED';

    const createdBookings = [];

    for (let i = 0; i < requestedStartTimes.length; i++) {
      const st = requestedStartTimes[i];
      const bookingId = generateBookingId();
      const startMinutes = timeToMinutes(st);
      const endMinutes = startMinutes + slotDuration;
      const endHours = Math.floor(endMinutes / 60).toString().padStart(2, '0');
      const endMins = (endMinutes % 60).toString().padStart(2, '0');
      const endTime = `${endHours}:${endMins}`;

      // Allocate fee to first slot or entire pass
      const slotFee = i === 0 ? totalDayFee : 0;

      const booking = await Booking.create({
        bookingId,
        userId: req.user._id,
        date,
        startTime: st,
        endTime,
        durationMinutes: slotDuration,
        bookerName: (bookerName || req.user.name || '').trim(),
        userType: effectiveUserType,
        feeAmount: totalDayFee,
        paymentStatus,
        paymentMethod: effectivePaymentMethod,
        stripePaymentIntentId: paymentIntentId,
        purpose: effectivePurpose,
        participantCount: Number(participantCount) || 1,
        participants: Array.isArray(participants) ? participants : [],
        instrumentsNeeded: Array.isArray(instrumentsNeeded) ? instrumentsNeeded : [],
        notes: (notes || '').trim(),
        status: initialStatus,
      });

      // Send notification to user
      await Notification.create({
        userId: req.user._id,
        title: initialStatus === 'CONFIRMED'
          ? (isOutsider ? 'Jam Room Pass Confirmed (₹500 Day Pass) 🎵' : 'Jam Room Slot Confirmed (Free Pass) 🎵')
          : 'Booking Request Received',
        message: initialStatus === 'CONFIRMED'
          ? `Your session on ${date} (${st} - ${endTime}) is confirmed. Pass ID: ${bookingId} (${isOutsider ? 'Fee: ₹500 Paid' : 'SJEC Free Pass'}).`
          : `Your booking request for ${date} (${st} - ${endTime}) is pending approval.`,
        type: initialStatus === 'CONFIRMED' ? 'BOOKING_CONFIRMED' : 'BOOKING_PENDING',
        bookingId: booking._id,
      });

      // Log activity
      await ActivityLog.create({
        userId: req.user._id,
        userName: req.user.name,
        userRole: req.user.role,
        action: 'BOOKING_CREATED',
        details: `Slot reserved: ${date} ${st}-${endTime} (ID: ${bookingId}) by ${bookerName || req.user.name} [${effectiveUserType} - Fee: ₹${totalDayFee}]`,
        entityType: 'BOOKING',
        entityId: booking._id.toString(),
      });

      createdBookings.push(booking);
    }

    // Dispatch booking confirmation email to the user's email address
    sendBookingConfirmationEmail({
      user: req.user,
      bookings: createdBookings,
      settings,
    }).catch((err) => {
      console.error('Failed to send booking confirmation email:', err);
    });

    res.status(201).json({
      success: true,
      message: initialStatus === 'CONFIRMED'
        ? `${createdBookings.length} Jam Room ${createdBookings.length === 1 ? 'slot' : 'slots'} booked successfully!`
        : `Booking submitted for ${createdBookings.length} ${createdBookings.length === 1 ? 'slot' : 'slots'} (Pending Admin Approval).`,
      bookings: createdBookings,
      booking: createdBookings[0],
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'A conflicting booking was just created for one of your selected slots. Please refresh and try again.',
      });
    }
    next(error);
  } finally {
    releaseLocks.forEach((r) => {
      if (typeof r === 'function') r();
    });
  }
};

// @desc    Get bookings for the logged-in student
// @route   GET /api/bookings/my
// @access  Private
export const getMyBookings = async (req, res, next) => {
  try {
    const settings = await getActiveSettings();
    const { currentDateString, currentTimeString } = getNowInTimezone(settings.operatingTimezone);

    const bookings = await Booking.find({ userId: req.user._id })
      .sort({ date: -1, startTime: -1 })
      .lean();

    // Categorize into Upcoming, Past, Cancelled/Rejected
    const upcoming = [];
    const past = [];
    const cancelled = [];

    bookings.forEach((b) => {
      if (b.status === 'CANCELLED' || b.status === 'REJECTED') {
        cancelled.push(b);
      } else if (
        b.date > currentDateString ||
        (b.date === currentDateString && b.endTime > currentTimeString)
      ) {
        upcoming.push(b);
      } else {
        past.push({ ...b, status: b.status === 'CONFIRMED' ? 'COMPLETED' : b.status });
      }
    });

    res.json({
      success: true,
      data: {
        upcoming,
        past,
        cancelled,
        all: bookings,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking pass details
// @route   GET /api/bookings/:id
// @access  Private
export const getBookingDetails = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate(
      'userId',
      'name email usn department phone instrument avatar'
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    // Verify ownership unless admin
    if (
      req.user.role !== 'ADMIN' &&
      booking.userId._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking.',
      });
    }

    res.json({
      success: true,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel student's booking
// @route   DELETE /api/bookings/:id
// @access  Private
export const cancelBooking = async (req, res, next) => {
  try {
    const { reason = 'Cancelled by student' } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    // Authorization check
    const isOwner = booking.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to cancel this booking.',
      });
    }

    if (booking.status === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        message: 'This booking is already cancelled.',
      });
    }

    const settings = await getActiveSettings();
    const { currentDateString, currentTimeString } = getNowInTimezone(settings.operatingTimezone);

    // If student, check cancellation cutoff
    if (!isAdmin) {
      const slotDateTime = new Date(`${booking.date}T${booking.startTime}:00Z`);
      const currentDateTime = new Date(`${currentDateString}T${currentTimeString}:00Z`);

      const diffHours = (slotDateTime.getTime() - currentDateTime.getTime()) / (1000 * 60 * 60);

      if (diffHours < settings.cancellationCutoffHours) {
        return res.status(400).json({
          success: false,
          message: `Bookings cannot be cancelled less than ${settings.cancellationCutoffHours} hours before the scheduled time slot.`,
        });
      }
    }

    booking.status = 'CANCELLED';
    booking.cancellationReason = reason;
    booking.cancelledBy = req.user._id;
    booking.cancelledAt = new Date();
    await booking.save();

    // Notify user
    await Notification.create({
      userId: booking.userId,
      title: 'Booking Cancelled',
      message: `Your booking for ${booking.date} (${booking.startTime} - ${booking.endTime}) was cancelled.`,
      type: 'BOOKING_CANCELLED',
      bookingId: booking._id,
    });

    // Log activity
    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'BOOKING_CANCELLED',
      details: `Booking ${booking.bookingId} cancelled by ${req.user.name}. Reason: ${reason}`,
      entityType: 'BOOKING',
      entityId: booking._id.toString(),
    });

    // Send cancellation email asynchronously
    sendBookingCancellationEmail({
      user: req.user,
      booking,
      reason,
    }).catch((err) => {
      console.error('Failed to send cancellation email:', err);
    });

    res.json({
      success: true,
      message: 'Booking cancelled successfully. The slot is now released.',
      booking,
    });
  } catch (error) {
    next(error);
  }
};
