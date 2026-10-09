import mongoose from 'mongoose';

const equipmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Equipment title is required'],
      trim: true,
    },
    tag: {
      type: String,
      default: 'Studio Gear',
      trim: true,
    },
    desc: {
      type: String,
      default: '',
      trim: true,
    },
    image: {
      type: String,
      required: [true, 'Equipment image is required'],
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

export default mongoose.model('Equipment', equipmentSchema);
