import Booking from '../models/Booking.js';
import User from '../models/User.js';
import BookingSettings from '../models/BookingSettings.js';
import { getNowInTimezone, getActiveSettings } from './availability.service.js';

export const getJamRoomAnalytics = async () => {
  const settings = await getActiveSettings();
  const { currentDateString } = getNowInTimezone(settings.operatingTimezone);

  const totalBookings = await Booking.countDocuments();
  const totalStudents = await User.countDocuments({ role: 'STUDENT' });
  const pendingApprovals = await Booking.countDocuments({ status: 'PENDING' });

  // Today's bookings
  const todayBookings = await Booking.countDocuments({
    date: currentDateString,
    status: { $in: ['CONFIRMED', 'COMPLETED', 'PENDING'] },
  });

  // Calculate this week date range (last 7 days to next 7 days)
  const todayDate = new Date(`${currentDateString}T00:00:00Z`);
  const sevenDaysAgo = new Date(todayDate);
  sevenDaysAgo.setUTCDate(todayDate.getUTCDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

  const thirtyDaysAgo = new Date(todayDate);
  thirtyDaysAgo.setUTCDate(todayDate.getUTCDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

  const bookingsThisWeek = await Booking.countDocuments({
    date: { $gte: sevenDaysAgoStr, $lte: currentDateString },
    status: { $in: ['CONFIRMED', 'COMPLETED'] },
  });

  const bookingsThisMonth = await Booking.countDocuments({
    date: { $gte: thirtyDaysAgoStr, $lte: currentDateString },
    status: { $in: ['CONFIRMED', 'COMPLETED'] },
  });

  // Calculate status breakdown
  const statusDistribution = await Booking.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  // Hourly distribution (Popular Hours)
  const hourlyDistribution = await Booking.aggregate([
    { $match: { status: { $in: ['CONFIRMED', 'COMPLETED'] } } },
    {
      $group: {
        _id: '$startTime',
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // 30-Day trend
  const dailyTrends = await Booking.aggregate([
    {
      $match: {
        date: { $gte: thirtyDaysAgoStr, $lte: currentDateString },
        status: { $in: ['CONFIRMED', 'COMPLETED'] },
      },
    },
    {
      $group: {
        _id: '$date',
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Utilization calculation for the past 30 days
  // Available slots per day = (closingTime - openingTime)
  const [openHour] = settings.openingTime.split(':').map(Number);
  const [closeHour] = settings.closingTime.split(':').map(Number);
  const slotsPerDay = Math.max(1, closeHour - openHour);
  const operationalDaysIn30Days = 26; // approx omitting Sundays
  const totalPossibleSlots = operationalDaysIn30Days * slotsPerDay;
  const utilizationRate = Math.min(
    100,
    Math.round((bookingsThisMonth / Math.max(1, totalPossibleSlots)) * 100)
  );

  // Top Active Students
  const topStudents = await Booking.aggregate([
    { $match: { status: { $in: ['CONFIRMED', 'COMPLETED'] } } },
    {
      $group: {
        _id: '$userId',
        totalBookings: { $sum: 1 },
      },
    },
    { $sort: { totalBookings: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'student',
      },
    },
    { $unwind: '$student' },
    {
      $project: {
        _id: 1,
        totalBookings: 1,
        name: '$student.name',
        email: '$student.email',
        usn: '$student.usn',
        department: '$student.department',
        instrument: '$student.instrument',
      },
    },
  ]);

  return {
    overview: {
      totalBookings,
      todayBookings,
      bookingsThisWeek,
      bookingsThisMonth,
      totalStudents,
      pendingApprovals,
      utilizationRate,
    },
    statusDistribution: statusDistribution.map((item) => ({
      status: item._id,
      count: item.count,
    })),
    popularHours: hourlyDistribution.map((item) => ({
      hour: item._id,
      count: item.count,
    })),
    dailyTrends: dailyTrends.map((item) => ({
      date: item._id,
      bookings: item.count,
    })),
    topStudents,
  };
};
