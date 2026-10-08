import Notification from '../models/Notification.js';

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
export const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      $or: [{ userId: req.user._id }, { userId: null }],
    })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({
      $or: [{ userId: req.user._id }, { userId: null }],
      isRead: false,
    });

    res.json({
      success: true,
      unreadCount,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req, res, next) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({
      success: true,
      message: 'Marked as read.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all as read
// @route   POST /api/notifications/read-all
// @access  Private
export const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { $or: [{ userId: req.user._id }, { userId: null }], isRead: false },
      { isRead: true }
    );
    res.json({
      success: true,
      message: 'All notifications marked as read.',
    });
  } catch (error) {
    next(error);
  }
};
