import JamRoomVideo from '../models/JamRoomVideo.js';
import ActivityLog from '../models/ActivityLog.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Get all active 30s Jam Room short videos (Public)
// @route   GET /api/jam-room-videos
// @access  Public
export const getJamRoomVideos = async (req, res, next) => {
  try {
    const { tag, featured } = req.query;
    const filter = { isActive: true };

    if (tag && tag !== 'ALL') {
      filter.tag = tag;
    }
    if (featured === 'true') {
      filter.isFeatured = true;
    }

    const videos = await JamRoomVideo.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: videos.length,
      data: videos,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all Jam Room short videos including inactive (Admin)
// @route   GET /api/jam-room-videos/admin/all
// @access  Private (Admin)
export const getAdminJamRoomVideos = async (req, res, next) => {
  try {
    const videos = await JamRoomVideo.find()
      .sort({ order: 1, createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: videos.length,
      data: videos,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single Jam Room short video
// @route   GET /api/jam-room-videos/:id
// @access  Public
export const getJamRoomVideoById = async (req, res, next) => {
  try {
    const video = await JamRoomVideo.findById(req.params.id);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Jam Room short video not found.',
      });
    }

    res.json({
      success: true,
      data: video,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new 30s Jam Room short video (Admin)
// @route   POST /api/jam-room-videos
// @access  Private (Admin)
export const createJamRoomVideo = async (req, res, next) => {
  try {
    const { title, description, videoUrl, thumbnailUrl, duration, tag, isFeatured, isActive, order } = req.body;

    let finalVideoUrl = videoUrl;
    if (req.file) {
      finalVideoUrl = `/uploads/videos/${req.file.filename}`;
    }

    if (!finalVideoUrl || !finalVideoUrl.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a video file or direct video URL.',
      });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a title for the short video.',
      });
    }

    const video = await JamRoomVideo.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      videoUrl: finalVideoUrl.trim(),
      thumbnailUrl: thumbnailUrl ? thumbnailUrl.trim() : '',
      duration: duration ? Number(duration) : 30,
      tag: tag || 'Studio Tour',
      isFeatured: isFeatured !== undefined ? isFeatured === true || isFeatured === 'true' : true,
      isActive: isActive !== undefined ? isActive === true || isActive === 'true' : true,
      order: order ? Number(order) : 0,
    });

    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: 'ADMIN',
      action: 'JAM_ROOM_VIDEO_CREATED',
      details: `Added new 30s Jam Room short video: "${video.title}" (${video.tag})`,
      entityType: 'JAM_ROOM_VIDEO',
      entityId: video._id.toString(),
    });

    res.status(201).json({
      success: true,
      message: 'Jam Room 30s short video added successfully! 🎬',
      data: video,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update 30s Jam Room short video (Admin)
// @route   PUT /api/jam-room-videos/:id
// @access  Private (Admin)
export const updateJamRoomVideo = async (req, res, next) => {
  try {
    const video = await JamRoomVideo.findById(req.params.id);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Jam Room short video not found.',
      });
    }

    const { title, description, videoUrl, thumbnailUrl, duration, tag, isFeatured, isActive, order } = req.body;

    if (title !== undefined) video.title = title.trim();
    if (description !== undefined) video.description = description.trim();
    if (thumbnailUrl !== undefined) video.thumbnailUrl = thumbnailUrl.trim();
    if (duration !== undefined) video.duration = Number(duration);
    if (tag !== undefined) video.tag = tag;
    if (isFeatured !== undefined) video.isFeatured = isFeatured === true || isFeatured === 'true';
    if (isActive !== undefined) video.isActive = isActive === true || isActive === 'true';
    if (order !== undefined) video.order = Number(order);

    // If replacement video file was uploaded
    if (req.file) {
      // Clean up previous local file if applicable
      if (video.videoUrl && video.videoUrl.startsWith('/uploads/videos/')) {
        const oldPath = path.join(__dirname, '../..', video.videoUrl);
        if (fs.existsSync(oldPath)) {
          try {
            fs.unlinkSync(oldPath);
          } catch (e) {
            console.warn('Failed to delete old video file:', e.message);
          }
        }
      }
      video.videoUrl = `/uploads/videos/${req.file.filename}`;
    } else if (videoUrl !== undefined && videoUrl.trim()) {
      video.videoUrl = videoUrl.trim();
    }

    await video.save();

    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: 'ADMIN',
      action: 'JAM_ROOM_VIDEO_UPDATED',
      details: `Updated Jam Room short video: "${video.title}"`,
      entityType: 'JAM_ROOM_VIDEO',
      entityId: video._id.toString(),
    });

    res.json({
      success: true,
      message: 'Jam Room short video updated successfully! ✨',
      data: video,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete 30s Jam Room short video (Admin)
// @route   DELETE /api/jam-room-videos/:id
// @access  Private (Admin)
export const deleteJamRoomVideo = async (req, res, next) => {
  try {
    const video = await JamRoomVideo.findById(req.params.id);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Jam Room short video not found.',
      });
    }

    // Clean up local file if exists
    if (video.videoUrl && video.videoUrl.startsWith('/uploads/videos/')) {
      const filePath = path.join(__dirname, '../..', video.videoUrl);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.warn('Failed to delete local video file:', e.message);
        }
      }
    }

    await video.deleteOne();

    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: 'ADMIN',
      action: 'JAM_ROOM_VIDEO_DELETED',
      details: `Deleted Jam Room short video: "${video.title}"`,
      entityType: 'JAM_ROOM_VIDEO',
      entityId: video._id.toString(),
    });

    res.json({
      success: true,
      message: 'Jam Room short video deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Like a 30s short video (Public)
// @route   POST /api/jam-room-videos/:id/like
// @access  Public
export const likeJamRoomVideo = async (req, res, next) => {
  try {
    const video = await JamRoomVideo.findByIdAndUpdate(
      req.params.id,
      { $inc: { likesCount: 1 } },
      { new: true }
    );

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found.',
      });
    }

    res.json({
      success: true,
      likesCount: video.likesCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Record a view for 30s short video (Public)
// @route   POST /api/jam-room-videos/:id/view
// @access  Public
export const viewJamRoomVideo = async (req, res, next) => {
  try {
    const video = await JamRoomVideo.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewsCount: 1 } },
      { new: true }
    );

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found.',
      });
    }

    res.json({
      success: true,
      viewsCount: video.viewsCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload video file standalone endpoint
// @route   POST /api/jam-room-videos/upload
// @access  Private (Admin)
export const uploadVideoFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select a valid video file (.mp4, .webm, .mov) to upload.',
      });
    }

    const videoUrl = `/uploads/videos/${req.file.filename}`;

    res.status(200).json({
      success: true,
      message: 'Video file uploaded successfully.',
      videoUrl,
      filename: req.file.filename,
      size: req.file.size,
    });
  } catch (error) {
    next(error);
  }
};
