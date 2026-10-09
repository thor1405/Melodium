import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import ActivityLog from '../models/ActivityLog.js';
import { getActiveSettings } from '../services/availability.service.js';
import { sendPasswordResetEmail } from '../services/email.service.js';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'melodium_sjec_super_secret_jwt_key_2026_music_rocks',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

// @desc    Register a new student/user
// @route   POST /api/auth/register
// @desc    Register a new student/user or external musician
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      userType: requestedType,
      organization,
      city,
      usn,
      department,
      year,
      phone,
      instrument,
      bio,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and password are required.',
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const isSjecEmail = cleanEmail.endsWith('@sjec.ac.in');

    // Determine user type:
    // If email is @sjec.ac.in -> SJEC_STUDENT
    // Else if requested as OUTSIDER or non-sjec email -> OUTSIDER
    let effectiveUserType = 'OUTSIDER';
    if (isSjecEmail) {
      effectiveUserType = 'SJEC_STUDENT';
    } else if (requestedType === 'SJEC_STUDENT') {
      return res.status(400).json({
        success: false,
        message: 'SJEC Student registration requires an official @sjec.ac.in email address. External musicians may register as an External Band / Musician.',
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please log in.',
      });
    }

    // Check USN uniqueness if provided for SJEC students
    if (usn && usn.trim()) {
      const usnExists = await User.findOne({ usn: usn.trim().toUpperCase() });
      if (usnExists) {
        return res.status(409).json({
          success: false,
          message: 'An account with this USN / Student ID already exists.',
        });
      }
    }

    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password,
      role: 'STUDENT',
      userType: effectiveUserType,
      organization: organization ? organization.trim() : (effectiveUserType === 'SJEC_STUDENT' ? 'St Joseph Engineering College' : ''),
      city: city ? city.trim() : 'Mangaluru',
      usn: usn ? usn.trim().toUpperCase() : '',
      department: department || (effectiveUserType === 'SJEC_STUDENT' ? 'Computer Science & Engineering' : 'External / Guest Artist'),
      year: year !== undefined && year !== '' ? Number(year) : (effectiveUserType === 'SJEC_STUDENT' ? 3 : 1),
      phone: phone || '',
      instrument: instrument || 'Vocalist / Musician',
      bio: bio || '',
    });

    const token = generateToken(user._id);

    // Create welcome notification
    await Notification.create({
      userId: user._id,
      title: effectiveUserType === 'SJEC_STUDENT' ? 'Welcome to Melodium SJEC! 🎸' : 'Welcome, Guest Musician! 🎵',
      message: effectiveUserType === 'SJEC_STUDENT'
        ? `Hey ${user.name}! Welcome to Melodium SJEC. As a verified SJEC student, your Jam Room rehearsal slots are 100% Free.`
        : `Hey ${user.name}! Welcome to Melodium SJEC Jam Room. You can now reserve Studio rehearsal passes (₹500 Flat Day Pass).`,
      type: 'ANNOUNCEMENT',
    });

    // Log activity
    await ActivityLog.create({
      userId: user._id,
      userName: user.name,
      userRole: user.role,
      action: 'USER_REGISTERED',
      details: `New ${effectiveUserType} registered: ${user.email} (${effectiveUserType === 'SJEC_STUDENT' ? (user.usn || 'No USN') : (user.organization || 'External Musician')})`,
      entityType: 'USER',
      entityId: user._id.toString(),
    });

    res.status(201).json({
      success: true,
      message: effectiveUserType === 'SJEC_STUDENT'
        ? 'SJEC Student account created successfully!'
        : 'External Musician account created successfully!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        userType: user.userType,
        organization: user.organization,
        city: user.city,
        usn: user.usn,
        department: user.department,
        year: user.year,
        instrument: user.instrument,
        avatar: user.avatar,
        phone: user.phone,
        bio: user.bio,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Log in user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact Melodium admin.',
      });
    }

    // Auto-fix userType if not set on older user records
    if (!user.userType) {
      const type = user.role === 'ADMIN' ? 'ADMIN' : (user.email.endsWith('@sjec.ac.in') ? 'SJEC_STUDENT' : 'OUTSIDER');
      user.userType = type;
      await User.updateOne({ _id: user._id }, { userType: type });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        userType: user.userType || (user.email.endsWith('@sjec.ac.in') ? 'SJEC_STUDENT' : 'OUTSIDER'),
        organization: user.organization || '',
        city: user.city || '',
        usn: user.usn,
        department: user.department,
        year: user.year,
        instrument: user.instrument,
        avatar: user.avatar,
        phone: user.phone,
        bio: user.bio,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        userType: user.userType || (user.email.endsWith('@sjec.ac.in') ? 'SJEC_STUDENT' : 'OUTSIDER'),
        organization: user.organization || '',
        city: user.city || '',
        usn: user.usn,
        department: user.department,
        year: user.year,
        instrument: user.instrument,
        avatar: user.avatar,
        phone: user.phone,
        bio: user.bio,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { name, organization, city, usn, department, year, phone, instrument, bio, avatar } = req.body;

    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (organization !== undefined) user.organization = organization;
    if (city !== undefined) user.city = city;
    if (usn !== undefined) user.usn = usn.trim().toUpperCase();
    if (department) user.department = department;
    if (year) user.year = Number(year);
    if (phone !== undefined) user.phone = phone;
    if (instrument) user.instrument = instrument;
    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        userType: user.userType || (user.email.endsWith('@sjec.ac.in') ? 'SJEC_STUDENT' : 'OUTSIDER'),
        organization: user.organization || '',
        city: user.city || '',
        usn: user.usn,
        department: user.department,
        year: user.year,
        instrument: user.instrument,
        avatar: user.avatar,
        phone: user.phone,
        bio: user.bio,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current and new password are required.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters.',
      });
    }

    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect.',
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Request password reset link
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your registered email address.',
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      // Return success message to prevent user enumeration attacks
      return res.json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent.',
      });
    }

    // Generate reset token and set expiry
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Build reset URL
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

    // Send verification email
    const emailResult = await sendPasswordResetEmail({
      user,
      resetUrl,
      expiresInMinutes: 30,
    });

    if (!emailResult.success && !emailResult.simulated) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: 'Email service could not send the reset email. Please try again later.',
      });
    }

    res.json({
      success: true,
      message: 'A password reset link has been sent to your email address.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password using email verification token
// @route   POST /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    const { token } = req.params;

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    // Hash token to compare with database hash
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Password reset link is invalid or has expired. Please request a new link.',
      });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Log activity
    await ActivityLog.create({
      userId: user._id,
      userName: user.name,
      userRole: user.role,
      action: 'PASSWORD_RESET',
      details: `Password reset successfully via email verification link for ${user.email}`,
      entityType: 'USER',
      entityId: user._id.toString(),
    });

    res.json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload profile picture
// @route   POST /api/auth/upload-avatar
// @access  Private
export const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select a valid image file (.jpg, .jpeg, .png, .webp, .gif) to upload.',
      });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.avatar = avatarUrl;
    await user.save();

    await ActivityLog.create({
      userId: user._id,
      userName: user.name,
      userRole: user.role,
      action: 'PROFILE_UPDATED',
      details: `Uploaded new profile photo: ${req.file.originalname}`,
      entityType: 'USER',
      entityId: user._id.toString(),
    });

    res.json({
      success: true,
      message: 'Profile picture updated successfully! 📸',
      avatarUrl,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        userType: user.userType || (user.email.endsWith('@sjec.ac.in') ? 'SJEC_STUDENT' : 'OUTSIDER'),
        organization: user.organization || '',
        city: user.city || '',
        usn: user.usn,
        department: user.department,
        year: user.year,
        instrument: user.instrument,
        avatar: user.avatar,
        phone: user.phone,
        bio: user.bio,
      },
    });
  } catch (error) {
    next(error);
  }
};

