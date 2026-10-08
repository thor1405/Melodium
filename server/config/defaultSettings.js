export const defaultBookingSettings = {
  openingTime: "09:00",
  closingTime: "18:00",
  slotDurationMinutes: 60,
  availableDays: [1, 2, 3, 4, 5, 6], // Monday through Saturday (Sunday is a weekly holiday)
  maxAdvanceBookingDays: 31, // Full 1-month advance window
  maxDailyBookingsPerStudent: 8, // Multiple slots permitted on the same active day
  maxWeeklyBookingsPerStudent: 14,
  cancellationCutoffHours: 2,
  requireAdminApproval: false,
  isBookingEnabled: true,
  maintenanceNotice: "",
  operatingTimezone: "Asia/Kolkata",
  allowedEmailDomains: ["sjec.ac.in"],
  enforceEmailDomain: false, // configurable restriction
  roomName: "Melodium SJEC Jam Room (Studio 1)",
  roomLocation: "Activity Block, 2nd Floor, SJEC Campus",
  maxParticipants: 8,
  rulesSummary: [
    "Bookings operate in strict 1-hour slots.",
    "You can book multiple slots on your selected rehearsal day.",
    "Active reservations are limited to 1 date at a time until completed or cancelled.",
    "Cancellations permitted up to 2 hours before the session.",
    "Keep equipment in pristine condition and report damages immediately.",
    "No food or open beverages permitted near amplifiers and pedalboards."
  ],
  heroVideoUrl: "https://cdn.pixabay.com/video/2016/09/13/4998-183792019_large.mp4",
  heroVideoTitle: "Melodium Live Jam Session",
  heroVideoEnabled: true,
  heroVideoOpacity: 0.55,
  heroVideoMuted: true,
  heroVideoPoster: ""
};
