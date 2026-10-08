import GalleryItem from '../models/GalleryItem.js';

// @desc    Get all gallery photos with category filtering
// @route   GET /api/gallery
// @access  Public
export const getGalleryItems = async (req, res, next) => {
  try {
    const { category, featured } = req.query;
    const query = {};

    if (category && category !== 'ALL') query.category = category;
    if (featured === 'true') query.featured = true;

    const items = await GalleryItem.find(query).sort({ order: 1, createdAt: -1 });

    res.json({
      success: true,
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add new photo to gallery
// @route   POST /api/gallery
// @access  Private (Admin)
export const createGalleryItem = async (req, res, next) => {
  try {
    const { title, category, imageUrl, thumbnailUrl, caption, eventDate, location, featured } = req.body;

    const item = await GalleryItem.create({
      title,
      category: category || 'PERFORMANCES',
      imageUrl,
      thumbnailUrl: thumbnailUrl || imageUrl,
      caption,
      eventDate,
      location: location || 'SJEC Campus',
      featured: Boolean(featured),
    });

    res.status(201).json({
      success: true,
      message: 'Photo added to gallery.',
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update gallery photo
// @route   PUT /api/gallery/:id
// @access  Private (Admin)
export const updateGalleryItem = async (req, res, next) => {
  try {
    const item = await GalleryItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found.',
      });
    }

    res.json({
      success: true,
      message: 'Photo updated.',
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete gallery photo
// @route   DELETE /api/gallery/:id
// @access  Private (Admin)
export const deleteGalleryItem = async (req, res, next) => {
  try {
    const item = await GalleryItem.findByIdAndDelete(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found.',
      });
    }

    res.json({
      success: true,
      message: 'Photo removed from gallery.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Like a gallery photo
// @route   POST /api/gallery/:id/like
// @access  Public
export const likeGalleryItem = async (req, res, next) => {
  try {
    const item = await GalleryItem.findByIdAndUpdate(
      req.params.id,
      { $inc: { likesCount: 1 } },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found.',
      });
    }

    res.json({
      success: true,
      likesCount: item.likesCount,
    });
  } catch (error) {
    next(error);
  }
};
