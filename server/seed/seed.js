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
import Review from '../models/Review.js';
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
    Review.deleteMany({}),
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
    usn: '',
    department: 'Melodium Studio Management',
    phone: '+91 98765 43210',
    bio: 'Lead coordinator & studio custodian for Melodium SJEC. Managing Jam Room logistics and console sound.',
    avatar: '',
  });
  console.log('👤 Created Authentic Admin Account (admin@sjec.ac.in).');

  // 2.5 Seed Lionel — Sound Engineer & Studio Manager
  await TeamMember.create({
    name: 'Lionel',
    role: 'Sound Engineer & Studio Custodian',
    category: 'SOUND_ENGINEER',
    instrument: 'Live Sound, Multitrack DAW & Studio Acoustics',
    bio: 'Official Resident Sound Engineer for Melodium SJEC. Manages live rehearsal acoustics, multitrack studio recording, digital mixing console routing, and audio calibration at Jam Room (Academic Block 3).',
    photo: '/team/lionel.jpg',
    department: 'Studio Audio Engineering',
    socialLinks: {
      instagram: 'https://instagram.com',
    },
    order: 1,
    isActive: true,
  });
  console.log('🎧 Seeded Lionel as Official Sound Engineer.');

  // 3. Populate Authentic Melodium Studio & Jam Room Photographs
  await GalleryItem.create([
    {
      title: 'Sound-Treated Jam Room Live Rehearsal Hall',
      category: 'JAM_SESSIONS',
      imageUrl: '/gallery/sound_treated_live_room.png',
      caption: 'Acoustically isolated rehearsal space at SJEC featuring custom sound dampeners, acoustic wood flooring, and studio vocal booth.',
      eventDate: 'October 2026',
      location: 'Jam Room (Academic Block 3, Ground Floor)',
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
      location: 'Jam Room Gear Rack',
      featured: true,
      likesCount: 0,
      order: 5,
    },
  ]);
  // 3.5 Populate Authentic Initial Musician Reviews
  await Review.create([
    {
      userName: 'Aarav Shenoy',
      userEmail: 'aarav.shenoy@sjec.ac.in',
      userRole: 'Lead Guitarist • SJEC College Band',
      rating: 5,
      title: 'Flawless Acoustics & Marshall Amp Stack Power!',
      comment: 'Rehearsing for the inter-college fest at Melodium was an absolute game changer. The Marshall DSL amplifiers and sound isolation panels let us push our heavy riffs without muddy frequencies. Lionel dialled in our monitor mix in under 5 minutes.',
      category: 'JAM_ROOM_EQUIPMENT',
      status: 'APPROVED',
      isFeatured: true,
      likesCount: 14,
      verifiedMusician: true,
    },
    {
      userName: 'Rhea DSouza',
      userEmail: 'rhea.dsouza@sjec.ac.in',
      userRole: 'Vocalist & Keyboardist • ECE Dept',
      rating: 5,
      title: 'The Best Vocal Isolation Booth on Campus',
      comment: 'The gold condenser mic and quiet noise floor made tracking vocals so smooth. No ambient hallway noise, crystal-clear monitoring headphones, and instant booking without delays.',
      category: 'ACOUSTICS_SOUND',
      status: 'APPROVED',
      isFeatured: true,
      likesCount: 9,
      verifiedMusician: true,
    },
    {
      userName: 'Karthik Rao',
      userEmail: 'karthik.rao@gmail.com',
      userRole: 'Drummer • The Mangalore Groove Collective',
      rating: 5,
      title: 'Top Tier Pearl Export Drum Kit & Tight Rebound',
      comment: 'As a guest drummer playing with our progressive rock quartet, finding an acoustic room with tuned drum heads and heavy cymbal stands is rare. The ₹500 day pass is insane value for money.',
      category: 'JAM_ROOM_EQUIPMENT',
      status: 'APPROVED',
      isFeatured: true,
      likesCount: 18,
      verifiedMusician: true,
    },
    {
      userName: 'Shawn Mendonca',
      userEmail: 'shawn.m@sjec.ac.in',
      userRole: 'Bass & Synth Producer • CSE Dept',
      rating: 5,
      title: 'Seamless Digital Booking & Instant Multi-Slot Access',
      comment: 'Being able to schedule our 3-hour weekend practice blocks online in seconds from our phones is so convenient. Melodium is genuinely the pride of SJEC musicians.',
      category: 'STUDIO_EXPERIENCE',
      status: 'APPROVED',
      isFeatured: false,
      likesCount: 7,
      verifiedMusician: true,
    },
  ]);
  console.log('⭐ Seeded 4 Authentic Musician Reviews & Testimonials.');

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
