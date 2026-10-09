import mongoose from 'mongoose';

const teamMemberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['FACULTY', 'CORE_COMMITTEE', 'BAND_LEADS', 'MEMBERS', 'SOUND_ENGINEER'],
      default: 'SOUND_ENGINEER',
      index: true,
    },
    instrument: {
      type: String,
      default: 'Vocals & Acoustic Guitar',
      trim: true,
    },
    bio: {
      type: String,
      default: '',
      maxlength: 300,
    },
    photo: {
      type: String,
      default: '',
    },
    usn: {
      type: String,
      default: '',
    },
    department: {
      type: String,
      default: '',
    },
    year: {
      type: Number,
      min: 1,
      max: 4,
    },
    socialLinks: {
      instagram: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      spotify: { type: String, default: '' },
      youtube: { type: String, default: '' },
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('TeamMember', teamMemberSchema);
