import Equipment from '../models/Equipment.js';
import ActivityLog from '../models/ActivityLog.js';

const DEFAULT_EQUIPMENT = [
  {
    title: 'Digital Mixing Console & Audio Control Desk',
    tag: 'Mixer Console',
    desc: '16/32-channel digital console with motorized faders, aux monitor routing, and parametric EQ.',
    image: '/gallery/sound_engineer_console.png',
    order: 1,
    isActive: true,
  },
  {
    title: 'Sound-Treated Live Rehearsal Hall',
    tag: 'Jam Room',
    desc: 'Acoustically isolated rehearsal space at SJEC featuring wood flooring and bass absorption.',
    image: '/gallery/sound_treated_live_room.png',
    order: 2,
    isActive: true,
  },
  {
    title: 'Large-Diaphragm Gold Condenser Mic',
    tag: 'Vocal Booth',
    desc: 'High-precision vocal recording microphone with elastic shockmount and studio monitoring.',
    image: '/gallery/gold_condenser_mic.png',
    order: 3,
    isActive: true,
  },
  {
    title: 'Logic Pro DAW & Multitrack Station',
    tag: 'DAW Station',
    desc: 'Production workstation for zero-latency stem recording and post-rehearsal mastering.',
    image: '/gallery/logic_pro_daw_station.png',
    order: 4,
    isActive: true,
  },
  {
    title: 'Shure Beta 57A Dynamic Microphones',
    tag: 'Instrument Mics',
    desc: 'Supercardioid precision mics for guitar cabinets, acoustic instruments, and drum snares.',
    image: '/gallery/shure_beta57a_mics.png',
    order: 5,
    isActive: true,
  },
];

// @desc    Get all active equipment for public website
// @route   GET /api/equipment
// @access  Public
export const getEquipment = async (req, res, next) => {
  try {
    let items = await Equipment.find({ isActive: true }).sort({ order: 1, createdAt: 1 });

    // Auto-seed defaults if collection is empty
    if (!items || items.length === 0) {
      await Equipment.insertMany(DEFAULT_EQUIPMENT);
      items = await Equipment.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
    }

    res.json({
      success: true,
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all equipment (including inactive) for Admin
// @route   GET /api/equipment/admin
// @access  Private (Admin)
export const getAllEquipmentAdmin = async (req, res, next) => {
  try {
    let items = await Equipment.find().sort({ order: 1, createdAt: 1 });

    if (!items || items.length === 0) {
      await Equipment.insertMany(DEFAULT_EQUIPMENT);
      items = await Equipment.find().sort({ order: 1, createdAt: 1 });
    }

    res.json({
      success: true,
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new equipment item
// @route   POST /api/equipment
// @access  Private (Admin)
export const createEquipment = async (req, res, next) => {
  try {
    const { title, tag, desc, image, order, isActive } = req.body;

    if (!title || !image) {
      return res.status(400).json({
        success: false,
        message: 'Title and image are required.',
      });
    }

    const item = await Equipment.create({
      title,
      tag: tag || 'Studio Gear',
      desc: desc || '',
      image,
      order: Number(order) || 0,
      isActive: typeof isActive === 'boolean' ? isActive : true,
    });

    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: 'ADMIN',
      action: 'EQUIPMENT_CREATED',
      details: `Admin added studio equipment item: "${title}"`,
      entityType: 'EQUIPMENT',
      entityId: item._id.toString(),
    });

    res.status(201).json({
      success: true,
      message: 'Studio equipment added successfully.',
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update equipment item
// @route   PUT /api/equipment/:id
// @access  Private (Admin)
export const updateEquipment = async (req, res, next) => {
  try {
    const item = await Equipment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Equipment item not found.',
      });
    }

    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: 'ADMIN',
      action: 'EQUIPMENT_UPDATED',
      details: `Admin updated studio equipment: "${item.title}"`,
      entityType: 'EQUIPMENT',
      entityId: item._id.toString(),
    });

    res.json({
      success: true,
      message: 'Equipment details updated.',
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete equipment item
// @route   DELETE /api/equipment/:id
// @access  Private (Admin)
export const deleteEquipment = async (req, res, next) => {
  try {
    const item = await Equipment.findByIdAndDelete(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Equipment item not found.',
      });
    }

    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: 'ADMIN',
      action: 'EQUIPMENT_DELETED',
      details: `Admin removed equipment item: "${item.title}"`,
      entityType: 'EQUIPMENT',
      entityId: req.params.id,
    });

    res.json({
      success: true,
      message: 'Equipment item removed.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload equipment photo from device
// @route   POST /api/equipment/upload
// @access  Private (Admin)
export const uploadEquipmentPhoto = async (req, res, next) => {
  try {
    const file = req.file || (req.files && req.files.length > 0 ? req.files[0] : null);

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'Please select an image file to upload.',
      });
    }

    const imageUrl = `/uploads/gallery/${file.filename}`;

    res.json({
      success: true,
      message: 'Equipment photo uploaded successfully! 📸',
      imageUrl,
      filename: file.filename,
    });
  } catch (error) {
    next(error);
  }
};
