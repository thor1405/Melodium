import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import mongoose from 'mongoose';
import { connectDB, closeDB } from '../config/db.js';
import JamRoomVideo from '../models/JamRoomVideo.js';

export const initialJamRoomVideos = [
  {
    title: 'Jam Room 360° Studio Tour & Acoustics',
    description: 'Take a quick 30-second tour inside Melodium Jam Room at Academic Block 3, featuring isolated acoustic treatment, vocal booth, and ambient stage lighting.',
    videoUrl: 'https://cdn.pixabay.com/video/2016/09/13/4998-183792019_large.mp4',
    thumbnailUrl: '/gallery/sound_treated_live_room.png',
    duration: 30,
    tag: 'Studio Tour',
    isFeatured: true,
    isActive: true,
    order: 1,
    viewsCount: 142,
    likesCount: 38,
  },
  {
    title: 'Mapex Drum Kit Isolation & Soundcheck',
    description: 'Listen to the punchy dynamic mic setup on the snare, toms, and Zildjian cymbals inside the isolated drum corner.',
    videoUrl: 'https://cdn.pixabay.com/video/2016/08/17/4397-178652397_large.mp4',
    thumbnailUrl: '/gallery/logic_pro_daw_station.png',
    duration: 30,
    tag: 'Drum Kit',
    isFeatured: true,
    isActive: true,
    order: 2,
    viewsCount: 198,
    likesCount: 52,
  },
  {
    title: 'Marshall & Fender Tube Amp Line Check',
    description: 'Testing high-gain guitar heads, pedalboard loops, and zero-hum ground loops before student rehearsal sessions.',
    videoUrl: 'https://cdn.pixabay.com/video/2020/05/25/40149-425121683_large.mp4',
    thumbnailUrl: '/gallery/shure_beta57a_mics.png',
    duration: 30,
    tag: 'Guitars & Amps',
    isFeatured: true,
    isActive: true,
    order: 3,
    viewsCount: 220,
    likesCount: 65,
  },
  {
    title: 'Lionel Tuning the 32-Channel Digital Console',
    description: 'Watch Sound Engineer Lionel balance monitor aux sends, parametric EQ, and DAW stem recording in real time.',
    videoUrl: 'https://cdn.pixabay.com/video/2021/08/04/83875-584058983_large.mp4',
    thumbnailUrl: '/gallery/sound_engineer_console.png',
    duration: 30,
    tag: 'Mixing Console',
    isFeatured: true,
    isActive: true,
    order: 4,
    viewsCount: 175,
    likesCount: 44,
  },
];

export const seedJamRoomVideos = async () => {
  try {
    await JamRoomVideo.deleteMany({});
    console.log('🎬 Seeding refined 30-second Jam Room short videos...');
    await JamRoomVideo.insertMany(initialJamRoomVideos);
    console.log(`✅ Seeded ${initialJamRoomVideos.length} Jam Room short videos.`);
  } catch (err) {
    console.error('❌ Error seeding Jam Room short videos:', err.message);
  }
};

// If run directly
if (process.argv[1]?.endsWith('seedJamRoomVideos.js')) {
  (async () => {
    await connectDB();
    await seedJamRoomVideos();
    await closeDB();
  })();
}
