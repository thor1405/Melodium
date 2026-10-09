import Review from '../models/Review.js';
import ActivityLog from '../models/ActivityLog.js';

// @desc    Get all approved public reviews with statistics
// @route   GET /api/reviews
// @access  Public
export const getPublicReviews = async (req, res, next) => {
  try {
    const {
      category,
      rating,
      featured,
      search,
      sortBy = 'newest', // 'newest' | 'highest' | 'lowest' | 'helpful' | 'featured'
      page = 1,
      limit = 24,
    } = req.query;

    const query = { status: 'APPROVED' };

    if (category && category !== 'ALL') {
      query.category = category;
    }

    if (rating && rating !== 'ALL') {
      const numRating = Number(rating);
      if (!isNaN(numRating) && numRating >= 1 && numRating <= 5) {
        query.rating = numRating;
      }
    }

    if (featured === 'true') {
      query.isFeatured = true;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { comment: searchRegex },
        { userName: searchRegex },
        { userRole: searchRegex },
      ];
    }

    let sortOptions = { createdAt: -1 };
    if (sortBy === 'highest') {
      sortOptions = { rating: -1, createdAt: -1 };
    } else if (sortBy === 'lowest') {
      sortOptions = { rating: 1, createdAt: -1 };
    } else if (sortBy === 'helpful') {
      sortOptions = { likesCount: -1, createdAt: -1 };
    } else if (sortBy === 'featured') {
      sortOptions = { isFeatured: -1, createdAt: -1 };
    }

    const total = await Review.countDocuments(query);
    const reviews = await Review.find(query)
      .sort(sortOptions)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean();

    // Calculate overall statistics across all approved reviews
    const allApproved = await Review.find({ status: 'APPROVED' }).select('rating category isFeatured likesCount').lean();
    const totalApproved = allApproved.length;

    let averageRating = 5.0;
    const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    const categoryCounts = {};

    if (totalApproved > 0) {
      let sumRating = 0;
      allApproved.forEach((r) => {
        sumRating += r.rating;
        if (starCounts[r.rating] !== undefined) {
          starCounts[r.rating] += 1;
        }
        categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
      });
      averageRating = Number((sumRating / totalApproved).toFixed(1));
    }

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / Number(limit)) || 1,
          limit: Number(limit),
        },
        stats: {
          totalReviews: totalApproved,
          averageRating,
          starCounts,
          categoryCounts,
          satisfactionRate: totalApproved > 0 ? Math.round(((starCounts[5] + starCounts[4]) / totalApproved) * 100) : 100,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit a new musician review
// @route   POST /api/reviews
// @access  Public / Authenticated
export const createReview = async (req, res, next) => {
  try {
    const {
      userName,
      userEmail,
      userRole,
      userAvatar,
      rating,
      title,
      comment,
      category,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a headline or title for your review.',
      });
    }

    if (!comment || !comment.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your review feedback experience.',
      });
    }

    const ratingNum = Number(rating) || 5;
    if (ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5 stars.',
      });
    }

    // Authenticated user enrichment
    let effectiveUserId = null;
    let effectiveName = (userName || '').trim();
    let effectiveEmail = (userEmail || '').trim();
    let effectiveRole = (userRole || 'Musician / SJEC Student').trim();
    let effectiveAvatar = (userAvatar || '').trim();
    let isVerified = false;

    if (req.user) {
      effectiveUserId = req.user._id;
      effectiveName = effectiveName || req.user.name;
      effectiveEmail = effectiveEmail || req.user.email;
      effectiveAvatar = effectiveAvatar || req.user.avatar;
      isVerified = true;

      if (!userRole || userRole === 'Musician / SJEC Student') {
        effectiveRole = req.user.department || 'Computer Science & Engineering';
      }
    }

    if (!effectiveName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your name or band title.',
      });
    }

    const review = await Review.create({
      userId: effectiveUserId,
      userName: effectiveName,
      userEmail: effectiveEmail,
      userRole: effectiveRole,
      userAvatar: effectiveAvatar,
      rating: ratingNum,
      title: title.trim(),
      comment: comment.trim(),
      category: category || 'STUDIO_EXPERIENCE',
      status: 'APPROVED', // Auto-approved
      verifiedMusician: isVerified || true,
    });

    // Log Activity
    await ActivityLog.create({
      userId: effectiveUserId || null,
      userName: effectiveName,
      userRole: req.user ? req.user.role : 'STUDENT',
      action: 'REVIEW_SUBMITTED',
      details: `Review submitted: "${review.title}" (${review.rating}⭐) by ${effectiveName}`,
      entityType: 'REVIEW',
      entityId: review._id.toString(),
    });

    res.status(201).json({
      success: true,
      message: 'Thank you! Your review has been published live.',
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Like / mark review as helpful
// @route   POST /api/reviews/:id/like
// @access  Public
export const likeReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const identifier = req.user ? req.user._id.toString() : (req.ip || 'anonymous');

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found.',
      });
    }

    const hasLiked = review.likedBy.includes(identifier);
    if (hasLiked) {
      // Toggle unlike
      review.likedBy = review.likedBy.filter((x) => x !== identifier);
      review.likesCount = Math.max(0, review.likesCount - 1);
    } else {
      // Add like
      review.likedBy.push(identifier);
      review.likesCount += 1;
    }

    await review.save();

    res.json({
      success: true,
      hasLiked: !hasLiked,
      likesCount: review.likesCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reviews for Admin Console
// @route   GET /api/reviews/admin
// @access  Private (Admin)
export const getAdminReviews = async (req, res, next) => {
  try {
    const { status, category, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && status !== 'ALL') {
      query.status = status;
    }
    if (category && category !== 'ALL') {
      query.category = category;
    }
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { comment: searchRegex },
        { userName: searchRegex },
        { userRole: searchRegex },
      ];
    }

    const total = await Review.countDocuments(query);
    const reviews = await Review.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean();

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / Number(limit)) || 1,
          limit: Number(limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update review status (Approve, Flag, Feature)
// @route   PATCH /api/reviews/admin/:id
// @access  Private (Admin)
export const updateReviewStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, isFeatured } = req.body;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found.',
      });
    }

    if (status) review.status = status;
    if (typeof isFeatured === 'boolean') review.isFeatured = isFeatured;

    await review.save();

    res.json({
      success: true,
      message: 'Review updated successfully.',
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/admin/:id
// @access  Private (Admin)
export const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found.',
      });
    }

    await Review.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Review deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
