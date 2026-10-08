import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
    role: {
      type: String,
      enum: ['STUDENT', 'ADMIN'],
      default: 'STUDENT',
    },
    userType: {
      type: String,
      enum: ['SJEC_STUDENT', 'OUTSIDER', 'ADMIN'],
      default: 'SJEC_STUDENT',
      index: true,
    },
    organization: {
      type: String,
      trim: true,
      default: '',
    },
    city: {
      type: String,
      trim: true,
      default: 'Mangaluru',
    },
    usn: {
      type: String,
      trim: true,
      uppercase: true,
      default: '',
    },
    department: {
      type: String,
      trim: true,
      default: 'Computer Science & Engineering',
    },
    year: {
      type: Number,
      min: 0,
      max: 4,
      default: 1,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    instrument: {
      type: String,
      trim: true,
      default: 'Acoustic Guitar / Vocals',
    },
    avatar: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    bio: {
      type: String,
      maxlength: 300,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password || !enteredPassword) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password reset token
userSchema.methods.getResetPasswordToken = function () {
  // Generate random token
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire time (30 minutes)
  this.resetPasswordExpires = Date.now() + 30 * 60 * 1000;

  return resetToken;
};

export default mongoose.model('User', userSchema);
