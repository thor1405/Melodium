import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB, closeDB } from '../config/db.js';
import User from '../models/User.js';
import Booking from '../models/Booking.js';
import BlockedSlot from '../models/BlockedSlot.js';
import BookingSettings from '../models/BookingSettings.js';
import Event from '../models/Event.js';
import GalleryItem from '../models/GalleryItem.js';
import TeamMember from '../models/TeamMember.js';
import Notification from '../models/Notification.js';
import ActivityLog from '../models/ActivityLog.js';
import { defaultBookingSettings } from '../config/defaultSettings.js';
import { getNowInTimezone } from '../services/availability.service.js';

export const seedDatabase = async () => {
  console.log('🌱 Seeding Melodium SJEC Platform Data...');
  await connectDB();

  // Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    Booking.deleteMany({}),
    BlockedSlot.deleteMany({}),
    BookingSettings.deleteMany({}),
    Event.deleteMany({}),
    GalleryItem.deleteMany({}),
    TeamMember.deleteMany({}),
    Notification.deleteMany({}),
    ActivityLog.deleteMany({}),
  ]);

  console.log('🧹 Cleaned existing database collections.');

  // 1. Create Default Settings
  const settings = await BookingSettings.create(defaultBookingSettings);
  console.log('⚙️ Initialized Jam Room Booking Settings.');

  // 2. Create Single Authentic Admin Account
  const admin = await User.create({
    name: 'Melodium SJEC Admin',
    email: 'admin@sjec.ac.in',
    password: 'Admin@12345',
    role: 'ADMIN',
    usn: 'ADMIN-01',
    department: 'SJEC Cultural Council',
    year: 4,
    phone: '+91 98765 43210',
    instrument: 'Audio Engineering & Production',
    bio: 'Lead coordinator for Melodium SJEC. Managing Jam Room 1 logistics and stage sound.',
    avatar: '',
  });
  console.log('👤 Created Authentic Admin Account (admin@sjec.ac.in).');

  // 3. Populate Authentic Melodium Studio & Jam Room Photographs
  await GalleryItem.create([
    {
      title: 'Sound-Treated Jam Room 1 Live Rehearsal Hall',
      category: 'JAM_SESSIONS',
      imageUrl: '/gallery/sound_treated_live_room.png',
      caption: 'Acoustically isolated rehearsal space at SJEC featuring custom sound dampeners, acoustic wood flooring, and studio vocal booth.',
      eventDate: 'October 2026',
      location: 'Jam Room 1 (Academic Block 3, Ground Floor)',
      featured: true,
      likesCount: 0,
      order: 1,
    },
    {
      title: 'Digital Mixing Console & Audio Control Desk',
      category: 'STUDIO_GEAR',
      imageUrl: '/gallery/sound_engineer_console.png',
      caption: 'Touchscreen digital audio console with motorized channel faders, talkback microphone, and studio monitors for student audio engineers.',
      eventDate: 'October 2026',
      location: 'Melodium Control Booth',
      featured: true,
      likesCount: 0,
      order: 2,
    },
    {
      title: 'Large-Diaphragm Gold Condenser Studio Mic',
      category: 'STUDIO_GEAR',
      imageUrl: '/gallery/gold_condenser_mic.png',
      caption: 'High-precision vocal recording microphone with elastic shockmount and studio monitoring headphones under warm acoustic spotlight.',
      eventDate: 'October 2026',
      location: 'Vocal Isolation Booth',
      featured: true,
      likesCount: 0,
      order: 3,
    },
    {
      title: 'Logic Pro DAW & Multi-Track Production Station',
      category: 'STUDIO_GEAR',
      imageUrl: '/gallery/logic_pro_daw_station.png',
      caption: 'Melodium digital audio workstation featuring MIDI keyboard controller, AKG flight case, and audio sequencing monitors.',
      eventDate: 'October 2026',
      location: 'Studio Production Suite',
      featured: true,
      likesCount: 0,
      order: 4,
    },
    {
      title: 'Shure Beta 57A Dynamic Instrument Microphones',
      category: 'STUDIO_GEAR',
      imageUrl: '/gallery/shure_beta57a_mics.png',
      caption: 'Pair of precision supercardioid Shure Beta 57A microphones ready for guitar cabs, snare drums, and acoustic instruments.',
      eventDate: 'October 2026',
      location: 'Jam Room 1 Gear Rack',
      featured: true,
      likesCount: 0,
      order: 5,
    },
  ]);
  console.log('📸 Seeded 5 Authentic Melodium Studio Photographs into Gallery.');

  // 4. Initial System Setup Activity Log
  await ActivityLog.create({
    userId: admin._id,
    userName: admin.name,
    userRole: 'ADMIN',
    action: 'SYSTEM_INITIALIZED',
    details: 'Melodium SJEC platform initialized with clean production database.',
    entityType: 'SYSTEM',
  });

  console.log('✨ Clean Production Database Ready (Zero Dummy Data).');
};

// If run directly via node seed/seed.js
if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase()
    .then(async () => {
      await closeDB();
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Seeding failed:', err);
      process.exit(1);
    });
}
