import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB, closeDB } from '../config/db.js';
import User from '../models/User.js';
import Booking from '../models/Booking.js';
import Notification from '../models/Notification.js';
import ActivityLog from '../models/ActivityLog.js';
import Review from '../models/Review.js';

const targetEmail = process.argv[2] || '23b29.johan@sjec.ac.in';

async function removeUser() {
  console.log(`\n🔍 Searching for user with email: "${targetEmail}"...`);
  await connectDB();

  const user = await User.findOne({ email: targetEmail.toLowerCase() });

  if (!user) {
    console.log(`❌ No user document found with email: ${targetEmail}`);
    // Check if there are orphaned bookings or reviews
    const orphanedBookings = await Booking.find({
      $or: [{ studentEmail: targetEmail.toLowerCase() }, { notes: { $regex: targetEmail, $options: 'i' } }]
    });
    const orphanedReviews = await Review.find({ userEmail: targetEmail.toLowerCase() });
    
    console.log(`Found ${orphanedBookings.length} bookings and ${orphanedReviews.length} reviews associated with this email.`);
    
    if (orphanedBookings.length > 0 || orphanedReviews.length > 0) {
      console.log('Cleaning orphaned records...');
      if (orphanedBookings.length > 0) {
        await Booking.deleteMany({
          $or: [{ studentEmail: targetEmail.toLowerCase() }, { notes: { $regex: targetEmail, $options: 'i' } }]
        });
      }
      if (orphanedReviews.length > 0) {
        await Review.deleteMany({ userEmail: targetEmail.toLowerCase() });
      }
      console.log('✅ Orphaned records cleaned successfully.');
    }

    await closeDB();
    process.exit(0);
  }

  console.log(`\n👤 Found User:`);
  console.log(`   ID:         ${user._id}`);
  console.log(`   Name:       ${user.name}`);
  console.log(`   Email:      ${user.email}`);
  console.log(`   Role:       ${user.role}`);
  console.log(`   Department: ${user.department}`);

  // Count related records
  const userBookings = await Booking.find({ userId: user._id });
  const userNotifications = await Notification.find({ userId: user._id });
  const userReviews = await Review.find({
    $or: [{ userId: user._id }, { userEmail: targetEmail.toLowerCase() }]
  });
  const userLogs = await ActivityLog.find({ userId: user._id });

  console.log(`\n📊 Associated Records:`);
  console.log(`   - Bookings:      ${userBookings.length}`);
  console.log(`   - Notifications: ${userNotifications.length}`);
  console.log(`   - Reviews:       ${userReviews.length}`);
  console.log(`   - Activity Logs: ${userLogs.length}`);

  // Delete all associated records
  if (userBookings.length > 0) {
    await Booking.deleteMany({ userId: user._id });
    console.log(`   🗑️  Deleted ${userBookings.length} booking(s)`);
  }

  if (userNotifications.length > 0) {
    await Notification.deleteMany({ userId: user._id });
    console.log(`   🗑️  Deleted ${userNotifications.length} notification(s)`);
  }

  if (userReviews.length > 0) {
    await Review.deleteMany({
      $or: [{ userId: user._id }, { userEmail: targetEmail.toLowerCase() }]
    });
    console.log(`   🗑️  Deleted ${userReviews.length} review(s)`);
  }

  // Delete the user
  await User.findByIdAndDelete(user._id);
  console.log(`\n✅ Successfully deleted user "${user.email}" from the database!`);

  await closeDB();
  process.exit(0);
}

removeUser().catch((err) => {
  console.error('❌ Error removing user:', err);
  process.exit(1);
});
