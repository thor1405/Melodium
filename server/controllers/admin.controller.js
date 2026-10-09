import Booking from '../models/Booking.js';
import User from '../models/User.js';
import BlockedSlot from '../models/BlockedSlot.js';
import Notification from '../models/Notification.js';
import ActivityLog from '../models/ActivityLog.js';
import { getJamRoomAnalytics } from '../services/analytics.service.js';
import {
  calculateDayAvailability,
  getActiveSettings,
  getNowInTimezone,
} from '../services/availability.service.js';
import {
  sendBookingConfirmationEmail,
  sendBookingCancellationEmail,
} from '../services/email.service.js';

// @desc    Get Admin Overview metrics & quick view
// @route   GET /api/admin/overview
// @access  Private (Admin)
export const getAdminOverview = async (req, res, next) => {
  try {
    const settings = await getActiveSettings();
    const { currentDateString } = getNowInTimezone(settings.operatingTimezone);

    // Summary counts
    const totalBookings = await Booking.countDocuments();
    const todayBookingsCount = await Booking.countDocuments({
      date: currentDateString,
      status: { $in: ['CONFIRMED', 'PENDING'] },
    });
    const pendingApprovalsCount = await Booking.countDocuments({ status: 'PENDING' });
    const totalStudentsCount = await User.countDocuments({ role: 'STUDENT' });

    // Today's schedule
    const todaySchedule = await calculateDayAvailability(currentDateString, null, true);

    // Recent 5 bookings
    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'name email usn department phone instrument avatar userType organization city year');

    // Recent activity logs
    const recentLogs = await ActivityLog.find()
      .sort({ createdAt: -1 })
      .limit(8);

    res.json({
      success: true,
      data: {
        metrics: {
          totalBookings,
          todayBookingsCount,
          pendingApprovalsCount,
          totalStudentsCount,
        },
        todayDate: currentDateString,
        todaySchedule: todaySchedule.slots,
        recentBookings,
        recentLogs,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get today's live Jam Room timeline with student details
// @route   GET /api/admin/today-schedule
// @access  Private (Admin)
export const getTodaySchedule = async (req, res, next) => {
  try {
    const { date } = req.query;
    const settings = await getActiveSettings();
    const { currentDateString } = getNowInTimezone(settings.operatingTimezone);
    const targetDate = date || currentDateString;

    const schedule = await calculateDayAvailability(targetDate, null, true);

    // Detailed bookings query for this date
    const detailedBookings = await Booking.find({ date: targetDate })
      .populate('userId', 'name email usn department phone instrument avatar')
      .populate('cancelledBy', 'name email');

    res.json({
      success: true,
      data: {
        date: targetDate,
        isToday: targetDate === currentDateString,
        schedule: schedule.slots,
        bookings: detailedBookings,
        settings: schedule.settings,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings with filters, search, and pagination
// @route   GET /api/admin/bookings
// @access  Private (Admin)
export const getAllBookings = async (req, res, next) => {
  try {
    const {
      search,
      status,
      date,
      startDate,
      endDate,
      page = 1,
      limit = 15,
      sortBy = 'date',
      sortOrder = 'desc',
    } = req.query;

    const query = {};

    if (status && status !== 'ALL') {
      query.status = status;
    }

    if (date) {
      query.date = date;
    } else if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }

    // If search term provided, find matching users first
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      const matchingUsers = await User.find({
        $or: [{ name: searchRegex }, { email: searchRegex }, { usn: searchRegex }],
      }).select('_id');

      const userIds = matchingUsers.map((u) => u._id);

      query.$or = [
        { bookingId: searchRegex },
        { purpose: searchRegex },
        { userId: { $in: userIds } },
      ];
    }

    const sortOptions = {};
    if (sortBy === 'date') {
      sortOptions.date = sortOrder === 'asc' ? 1 : -1;
      sortOptions.startTime = sortOrder === 'asc' ? 1 : -1;
      sortOptions.createdAt = -1;
    } else if (sortBy === 'createdAt') {
      sortOptions.createdAt = sortOrder === 'asc' ? 1 : -1;
      sortOptions.date = -1;
    } else if (sortBy === 'bookingId') {
      sortOptions.bookingId = sortOrder === 'asc' ? 1 : -1;
    } else if (sortBy === 'status') {
      sortOptions.status = sortOrder === 'asc' ? 1 : -1;
      sortOptions.date = -1;
    } else {
      sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
    }

    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('userId', 'name email usn department phone instrument avatar userType organization city year')
      .populate('cancelledBy', 'name email');

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / limit),
          limit: Number(limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking status (Approve, Reject, Cancel, Complete)
// @route   PATCH /api/admin/bookings/:id/status
// @access  Private (Admin)
export const updateBookingStatus = async (req, res, next) => {
  try {
    const { status, adminNotes = '', cancellationReason = '' } = req.body;

    if (!['PENDING', 'CONFIRMED', 'CANCELLED', 'REJECTED', 'COMPLETED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking status provided.',
      });
    }

    const booking = await Booking.findById(req.params.id).populate('userId', 'name email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    booking.status = status;
    if (adminNotes) booking.adminNotes = adminNotes;
    if (cancellationReason) booking.cancellationReason = cancellationReason;

    if (status === 'CANCELLED' || status === 'REJECTED') {
      booking.cancelledBy = req.user._id;
      booking.cancelledAt = new Date();
    }

    await booking.save();

    // Send targeted notification to student
    let notifTitle = 'Booking Status Updated';
    let notifType = 'ANNOUNCEMENT';

    if (status === 'CONFIRMED') {
      notifTitle = 'Jam Room Booking Approved! 🎉';
      notifType = 'BOOKING_CONFIRMED';
    } else if (status === 'REJECTED') {
      notifTitle = 'Booking Request Rejected';
      notifType = 'BOOKING_REJECTED';
    } else if (status === 'CANCELLED') {
      notifTitle = 'Booking Cancelled by Admin';
      notifType = 'BOOKING_CANCELLED';
    }

    await Notification.create({
      userId: booking.userId._id,
      title: notifTitle,
      message: `Your booking for ${booking.date} (${booking.startTime} - ${booking.endTime}) status is now: ${status}. ${adminNotes || cancellationReason || ''}`,
      type: notifType,
      bookingId: booking._id,
    });

    // Log admin action
    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: 'ADMIN',
      action: `BOOKING_STATUS_${status}`,
      details: `Admin changed booking ${booking.bookingId} (${booking.date} ${booking.startTime}) status to ${status}`,
      entityType: 'BOOKING',
      entityId: booking._id.toString(),
    });

    // Send corresponding email notification
    if (status === 'CONFIRMED' && booking.userId?.email) {
      sendBookingConfirmationEmail({
        user: booking.userId,
        bookings: [booking],
        settings,
      }).catch((e) => {});
    } else if (status === 'CANCELLED' && booking.userId?.email) {
      sendBookingCancellationEmail({
        user: booking.userId,
        booking,
        reason: cancellationReason || adminNotes || 'Cancelled by Studio Administrator',
      }).catch((e) => {});
    }

    res.json({
      success: true,
      message: `Booking status updated to ${status}.`,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin manually creates a reservation
// @route   POST /api/admin/bookings
// @access  Private (Admin)
export const createAdminBooking = async (req, res, next) => {
  try {
    const {
      studentEmail,
      studentName,
      date,
      startTime,
      purpose,
      participantCount = 1,
      notes = '',
    } = req.body;

    let targetUserId = req.user._id;

    if (studentEmail) {
      let student = await User.findOne({ email: studentEmail.toLowerCase() });
      if (student) {
        targetUserId = student._id;
      }
    }

    // Check conflict
    const conflict = await Booking.findOne({
      date,
      startTime,
      status: { $in: ['CONFIRMED', 'PENDING'] },
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: 'This slot is already reserved by another booking.',
      });
    }

    const [h, m] = startTime.split(':').map(Number);
    const endH = (h + 1).toString().padStart(2, '0');
    const endTime = `${endH}:${m.toString().padStart(2, '0')}`;

    const datePart = new Date().toISOString().slice(0, 7).replace('-', '');
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    const bookingId = `MEL-${datePart}-${randomPart}`;

    const booking = await Booking.create({
      bookingId,
      userId: targetUserId,
      date,
      startTime,
      endTime,
      durationMinutes: 60,
      purpose: purpose || 'Official Band Rehearsal / College Event',
      participantCount: Number(participantCount) || 1,
      notes: notes || `Created manually by Admin (${studentName || 'Walk-in'})`,
      status: 'CONFIRMED',
    });

    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: 'ADMIN',
      action: 'ADMIN_MANUAL_BOOKING',
      details: `Admin booked ${date} ${startTime} (ID: ${bookingId}) for ${studentName || studentEmail || 'Club Session'}`,
      entityType: 'BOOKING',
      entityId: booking._id.toString(),
    });

    // Send confirmation email asynchronously if target student has an email
    if (studentEmail || targetUserId) {
      User.findById(targetUserId).then((targetUser) => {
        const recipient = targetUser || { email: studentEmail, name: studentName || 'Student' };
        if (recipient.email) {
          getActiveSettings().then((settings) => {
            sendBookingConfirmationEmail({
              user: recipient,
              bookings: [booking],
              settings,
            }).catch((err) => console.error('Failed to send admin booking email:', err));
          });
        }
      }).catch((e) => {});
    }

    res.status(201).json({
      success: true,
      message: 'Booking created successfully.',
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Block time slot(s) for maintenance, rehearsals, or events
// @route   POST /api/admin/blocked-slots
// @access  Private (Admin)
export const blockSlot = async (req, res, next) => {
  try {
    const { date, startTime, endTime, isAllDay = false, reason, category } = req.body;

    if (!date || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Date and reason are required.',
      });
    }

    if (!isAllDay && (!startTime || !endTime)) {
      return res.status(400).json({
        success: false,
        message: 'Start time and end time are required for specific slot block.',
      });
    }

    const blocked = await BlockedSlot.create({
      date,
      startTime: isAllDay ? '00:00' : startTime,
      endTime: isAllDay ? '23:59' : endTime,
      isAllDay: Boolean(isAllDay),
      reason,
      category: category || 'MAINTENANCE',
      createdBy: req.user._id,
    });

    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: 'ADMIN',
      action: 'SLOT_BLOCKED',
      details: `Slot blocked on ${date} (${isAllDay ? 'All Day' : `${startTime}-${endTime}`}) - Reason: ${reason}`,
      entityType: 'SLOT_BLOCK',
      entityId: blocked._id.toString(),
    });

    res.status(201).json({
      success: true,
      message: 'Time slot has been blocked.',
      blockedSlot: blocked,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all blocked slots
// @route   GET /api/admin/blocked-slots
// @access  Private (Admin)
export const getBlockedSlots = async (req, res, next) => {
  try {
    const { date } = req.query;
    const query = date ? { date } : {};

    const blockedSlots = await BlockedSlot.find(query)
      .sort({ date: -1, startTime: 1 })
      .populate('createdBy', 'name email');

    res.json({
      success: true,
      data: blockedSlots,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unblock a time slot
// @route   DELETE /api/admin/blocked-slots/:id
// @access  Private (Admin)
export const deleteBlockedSlot = async (req, res, next) => {
  try {
    const blocked = await BlockedSlot.findById(req.params.id);

    if (!blocked) {
      return res.status(404).json({
        success: false,
        message: 'Blocked slot not found.',
      });
    }

    await BlockedSlot.findByIdAndDelete(req.params.id);

    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: 'ADMIN',
      action: 'SLOT_UNBLOCKED',
      details: `Unblocked slot on ${blocked.date} (${blocked.startTime}-${blocked.endTime})`,
      entityType: 'SLOT_BLOCK',
      entityId: req.params.id,
    });

    res.json({
      success: true,
      message: 'Time slot has been unblocked and is now available for student booking.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all registered users with stats
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getAllUsers = async (req, res, next) => {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role && role !== 'ALL') {
      query.role = role;
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: regex }, { email: regex }, { usn: regex }, { department: regex }];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('-password');

    // Attach booking counts to users
    const usersWithStats = await Promise.all(
      users.map(async (u) => {
        const bookingCount = await Booking.countDocuments({
          userId: u._id,
          status: { $in: ['CONFIRMED', 'COMPLETED'] },
        });
        return {
          ...u.toObject(),
          bookingCount,
        };
      })
    );

    res.json({
      success: true,
      data: {
        users: usersWithStats,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / limit),
          limit: Number(limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role or status
// @route   PATCH /api/admin/users/:id
// @access  Private (Admin)
export const updateUserByAdmin = async (req, res, next) => {
  try {
    const { role, isActive, department, usn, instrument } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Prevent deactivating own account
    if (user._id.toString() === req.user._id.toString() && isActive === false) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own admin account.',
      });
    }

    if (role) user.role = role;
    if (typeof isActive === 'boolean') user.isActive = isActive;
    if (department) user.department = department;
    if (usn !== undefined) user.usn = usn;
    if (instrument) user.instrument = instrument;

    await user.save();

    res.json({
      success: true,
      message: 'User updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get complete Jam Room Analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin)
export const getAnalytics = async (req, res, next) => {
  try {
    const analytics = await getJamRoomAnalytics();
    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get activity logs
// @route   GET /api/admin/activity-logs
// @access  Private (Admin)
export const getActivityLogs = async (req, res, next) => {
  try {
    const { limit = 30 } = req.query;
    const logs = await ActivityLog.find()
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json({
      success: true,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};
