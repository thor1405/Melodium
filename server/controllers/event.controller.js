import Event from '../models/Event.js';

// Helper to generate slug
const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');

// @desc    Get all events with status/category filter
// @route   GET /api/events
// @access  Public
export const getEvents = async (req, res, next) => {
  try {
    const { status, category, featured } = req.query;
    const query = { isPublic: true };

    if (status && status !== 'ALL') query.status = status;
    if (category && category !== 'ALL') query.category = category;
    if (featured === 'true') query.featured = true;

    const events = await Event.find(query).sort({ date: 1, startTime: 1 });

    res.json({
      success: true,
      data: events,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single event by slug or ID
// @route   GET /api/events/:slugOrId
// @access  Public
export const getEvent = async (req, res, next) => {
  try {
    const { slugOrId } = req.params;
    let event;

    if (slugOrId.match(/^[0-9a-fA-F]{24}$/)) {
      event = await Event.findById(slugOrId);
    } else {
      event = await Event.findOne({ slug: slugOrId });
    }

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    res.json({
      success: true,
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private (Admin)
export const createEvent = async (req, res, next) => {
  try {
    const {
      title,
      tagline,
      description,
      category,
      venue,
      date,
      startTime,
      endTime,
      status,
      posterImage,
      registrationUrl,
      featured,
    } = req.body;

    let slug = slugify(title);
    let count = 1;
    while (await Event.findOne({ slug })) {
      slug = `${slugify(title)}-${count++}`;
    }

    const event = await Event.create({
      title,
      slug,
      tagline,
      description,
      category,
      venue,
      date: new Date(date),
      dateString: date.split('T')[0],
      startTime,
      endTime,
      status: status || 'UPCOMING',
      posterImage: posterImage || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1000&auto=format&fit=crop',
      registrationUrl,
      featured: Boolean(featured),
    });

    res.status(201).json({
      success: true,
      message: 'Event created successfully.',
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Admin)
export const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    res.json({
      success: true,
      message: 'Event updated successfully.',
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Admin)
export const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    res.json({
      success: true,
      message: 'Event deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    RSVP / Register Interest for Event
// @route   POST /api/events/:id/rsvp
// @access  Private
export const toggleRsvp = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    const userId = req.user._id;
    const existingIndex = event.rsvps.findIndex(
      (r) => r.userId?.toString() === userId.toString()
    );

    if (existingIndex > -1) {
      event.rsvps.splice(existingIndex, 1);
      await event.save();
      return res.json({
        success: true,
        message: 'RSVP cancelled.',
        isRsvpd: false,
        totalRsvps: event.rsvps.length,
      });
    } else {
      event.rsvps.push({ userId });
      await event.save();
      return res.json({
        success: true,
        message: 'RSVP confirmed! See you there.',
        isRsvpd: true,
        totalRsvps: event.rsvps.length,
      });
    }
  } catch (error) {
    next(error);
  }
};
