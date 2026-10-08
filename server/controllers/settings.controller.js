import BookingSettings from '../models/BookingSettings.js';
import ActivityLog from '../models/ActivityLog.js';
import { getActiveSettings } from '../services/availability.service.js';

// @desc    Get public jam room booking settings
// @route   GET /api/settings/booking
// @access  Public
export const getBookingSettings = async (req, res, next) => {
  try {
    const settings = await getActiveSettings();
    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update jam room booking settings
// @route   PATCH /api/settings/booking
// @access  Private (Admin)
export const updateBookingSettings = async (req, res, next) => {
  try {
    let settings = await BookingSettings.findOne();
    if (!settings) {
      settings = new BookingSettings(req.body);
    } else {
      Object.assign(settings, req.body);
    }

    await settings.save();

    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: 'ADMIN',
      action: 'SETTINGS_UPDATED',
      details: 'Jam Room booking rules and operating parameters updated',
      entityType: 'SETTINGS',
      entityId: settings._id.toString(),
    });

    res.json({
      success: true,
      message: 'Booking settings updated successfully.',
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload video file for homepage background
// @route   POST /api/settings/upload-video
// @access  Private (Admin)
export const uploadHeroVideo = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select a valid video file (.mp4, .webm, .mov) to upload.',
      });
    }

    const host = req.get('host');
    const protocol = req.protocol;
    const videoUrl = `${protocol}://${host}/uploads/videos/${req.file.filename}`;

    let settings = await BookingSettings.findOne();
    if (!settings) {
      settings = new BookingSettings({
        heroVideoUrl: videoUrl,
        heroVideoEnabled: true,
        heroVideoTitle: req.body.heroVideoTitle || req.file.originalname,
      });
    } else {
      settings.heroVideoUrl = videoUrl;
      settings.heroVideoEnabled = true;
      if (req.body.heroVideoTitle) {
        settings.heroVideoTitle = req.body.heroVideoTitle;
      }
    }

    await settings.save();

    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: 'ADMIN',
      action: 'SETTINGS_UPDATED',
      details: `Uploaded new homepage background video: ${req.file.originalname}`,
      entityType: 'SETTINGS',
      entityId: settings._id.toString(),
    });

    res.status(200).json({
      success: true,
      message: 'Video uploaded and activated on homepage successfully! 🎬',
      videoUrl,
      filename: req.file.filename,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};
