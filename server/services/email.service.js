import nodemailer from 'nodemailer';

// Helper to format 24h time to 12h AM/PM
const formatTime12h = (time24) => {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 || 12;
  return `${h12}:${minutes.toString().padStart(2, '0')} ${period}`;
};

// Helper to format YYYY-MM-DD
const formatDateString = (dateStr) => {
  if (!dateStr) return '';
  try {
    const d = new Date(`${dateStr}T00:00:00`);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch (e) {
    return dateStr;
  }
};

// Create transporter dynamically based on environment configuration
const createTransporter = async () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true' || Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // Fallback / Dev mode: log-based simulated transporter
  return null;
};

/**
 * 1. Send Jam Room booking confirmation email to the user
 */
export const sendBookingConfirmationEmail = async ({ user, bookings = [], settings = {} }) => {
  if (!user?.email || bookings.length === 0) return { success: false, reason: 'Missing user email or bookings' };

  const firstBooking = bookings[0];
  const dateFormatted = formatDateString(firstBooking.date);
  const passIds = bookings.map((b) => b.bookingId).join(', ');
  const isOutsider =
    user.userType === 'OUTSIDER' ||
    firstBooking.userType === 'OUTSIDER' ||
    (!user.email.endsWith('@sjec.ac.in') && user.role !== 'ADMIN');

  const roomName = settings.roomName || 'Melodium SJEC Jam Room (Studio 1)';
  const roomLocation =
    settings.roomLocation ||
    'Academic Block 3, Ground Floor, St. Joseph Engineering College, Vamanjoor, Mangaluru';

  const totalFee = isOutsider ? 500 : 0;
  const paymentStatus = firstBooking.paymentStatus || (isOutsider ? 'PAID' : 'FREE');
  const paymentMethod = firstBooking.paymentMethod || (isOutsider ? 'UPI' : 'STUDENT_FREE_PASS');

  // Format slots list
  const slotsSummary = bookings.map((b) => ({
    passId: b.bookingId,
    time: `${formatTime12h(b.startTime)} – ${formatTime12h(b.endTime)}`,
    duration: `${b.durationMinutes || 60} mins`,
  }));

  const subject = isOutsider
    ? `🎸 Studio 1 Jam Room Pass Confirmed (Pass: ${passIds}) | Melodium SJEC`
    : `🎵 Jam Room Slot Confirmed (Pass: ${passIds}) | Melodium SJEC`;

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0b0f19; padding: 24px 12px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #131826; border-radius: 16px; border: 1px solid rgba(250, 204, 21, 0.3); overflow: hidden; box-shadow: 0 12px 35px rgba(0,0,0,0.6);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #182035 0%, #0b0f19 100%); padding: 32px 24px; text-align: center; border-bottom: 2px solid #facc15;">
              <div style="display: inline-block; background-color: #facc15; color: #0b0f19; font-weight: 900; font-size: 11px; letter-spacing: 1.5px; padding: 4px 14px; border-radius: 20px; text-transform: uppercase; margin-bottom: 12px;">
                MELODIUM SJEC
              </div>
              <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 0 0 6px 0; line-height: 1.3;">
                Rehearsal Session Confirmed! 🎵
              </h1>
              <p style="color: #94a3b8; font-size: 13px; margin: 0;">
                Your reservation for Studio 1 is active and saved in the schedule.
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 28px 24px;">
              <p style="font-size: 16px; color: #ffffff; font-weight: 700; margin: 0 0 12px 0;">
                Hey <span style="color: #facc15;">${user.name || 'Musician'}</span>,
              </p>
              <p style="font-size: 14px; color: #e2e8f0; line-height: 1.6; margin: 0 0 20px 0;">
                Your booking request at <strong style="color: #ffffff;">${roomName}</strong> has been successfully confirmed. Below are your pass and session details:
              </p>

              <!-- Reservation Details Card -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #1a2236; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; margin-bottom: 20px; overflow: hidden;">
                <tr>
                  <td style="padding: 16px;">
                    <div style="color: #facc15; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">
                      RESERVATION DETAILS
                    </div>
                    <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 13px;">
                      <tr>
                        <td style="color: #94a3b8; width: 40%;">Pass ID(s):</td>
                        <td style="color: #facc15; font-weight: 800; text-align: right; font-family: monospace; font-size: 14px;">${passIds}</td>
                      </tr>
                      <tr>
                        <td style="color: #94a3b8;">Rehearsal Date:</td>
                        <td style="color: #ffffff; font-weight: 700; text-align: right;">${dateFormatted}</td>
                      </tr>
                      <tr>
                        <td style="color: #94a3b8;">Studio Room:</td>
                        <td style="color: #ffffff; font-weight: 600; text-align: right;">${roomName}</td>
                      </tr>
                      <tr>
                        <td style="color: #94a3b8;">Location:</td>
                        <td style="color: #e2e8f0; text-align: right;">${roomLocation}</td>
                      </tr>
                      <tr>
                        <td style="color: #94a3b8;">Session Purpose:</td>
                        <td style="color: #ffffff; font-weight: 600; text-align: right;">${firstBooking.purpose || 'Band Rehearsal'}</td>
                      </tr>
                      <tr>
                        <td style="color: #94a3b8;">Pass Type:</td>
                        <td style="text-align: right;">
                          <span style="display: inline-block; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; ${isOutsider ? 'background-color: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4);' : 'background-color: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4);'}">
                            ${isOutsider ? 'Outsider Day Pass' : 'SJEC Student (100% Free)'}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #94a3b8;">Fee / Status:</td>
                        <td style="color: #ffffff; font-weight: 700; text-align: right;">
                          ${isOutsider ? `₹${totalFee} (${paymentStatus} via ${paymentMethod})` : '₹0 (Free Student Pass)'}
                        </td>
                      </tr>
                      ${firstBooking.participantCount ? `
                      <tr>
                        <td style="color: #94a3b8;">Band Musicians:</td>
                        <td style="color: #ffffff; font-weight: 600; text-align: right;">${firstBooking.participantCount} Members</td>
                      </tr>` : ''}
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Booked Slots Card -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #1a2236; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; margin-bottom: 20px; overflow: hidden;">
                <tr>
                  <td style="padding: 16px;">
                    <div style="color: #facc15; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">
                      BOOKED TIMELINE (${slotsSummary.length} Slot${slotsSummary.length > 1 ? 's' : ''})
                    </div>
                    ${slotsSummary
                      .map(
                        (s) => `
                      <div style="background-color: #0b0f19; border: 1px solid rgba(250, 204, 21, 0.25); border-radius: 8px; padding: 10px 14px; margin-bottom: 8px;">
                        <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 13px;">
                          <tr>
                            <td style="color: #ffffff; font-weight: 700;">🕒 ${s.time}</td>
                            <td style="color: #94a3b8; text-align: right; font-weight: 600;">${s.duration}</td>
                          </tr>
                        </table>
                      </div>`
                      )
                      .join('')}
                  </td>
                </tr>
              </table>

              <!-- Studio Guidelines -->
              <div style="background-color: rgba(250, 204, 21, 0.08); border-left: 4px solid #facc15; padding: 14px 16px; border-radius: 4px 8px 8px 4px; margin-bottom: 24px;">
                <div style="color: #facc15; font-weight: 800; font-size: 13px; margin-bottom: 6px;">
                  ⚡ Studio House Rules & Entry Protocol:
                </div>
                <div style="color: #e2e8f0; font-size: 12px; line-height: 1.7;">
                  • Please arrive 5 minutes prior to your slot time.<br>
                  • Show this email or your Digital Pass in the Melodium app at the Studio 1 desk.<br>
                  • Handle all acoustic and electrical gear (amps, drumkits, mics, mixing desk) with respect.<br>
                  • Food and sugary beverages are strictly prohibited inside the sound-treated room.<br>
                  • Ensure all cables and amps are powered down neatly after your session.
                </div>
              </div>

              <!-- Button CTA -->
              <div style="text-align: center; margin: 28px 0 10px 0;">
                <a href="${clientUrl}/jam-room" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #facc15 0%, #f59e0b 100%); color: #0b0f19 !important; text-decoration: none; font-weight: 900; font-size: 13px; padding: 14px 28px; border-radius: 12px; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 15px rgba(250, 204, 21, 0.3);">
                  View Live Schedule & Passes
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0b0f19; padding: 20px 24px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.08);">
              <p style="margin: 0 0 6px 0; color: #94a3b8; font-size: 12px;">
                St. Joseph Engineering College, Vamanjoor, Mangaluru - 575028
              </p>
              <p style="margin: 0; color: #64748b; font-size: 11px;">
                © ${new Date().getFullYear()} Melodium SJEC. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const textContent = `
Melodium SJEC — Studio 1 Rehearsal Session Confirmed!

Hello ${user.name || 'Musician'},

Your reservation at ${roomName} is confirmed.

RESERVATION DETAILS:
----------------------------------------
Pass ID(s): ${passIds}
Date: ${dateFormatted}
Studio Room: ${roomName}
Location: ${roomLocation}
Session Purpose: ${firstBooking.purpose || 'Band Rehearsal'}
Pass Type: ${isOutsider ? 'Outsider Day Pass (₹500)' : 'SJEC Student (100% Free)'}
Fee: ${isOutsider ? `₹${totalFee} (${paymentStatus} via ${paymentMethod})` : '₹0 (Free)'}

BOOKED SLOTS:
${slotsSummary.map((s) => `- ${s.time} (${s.duration}) [Pass: ${s.passId}]`).join('\n')}

STUDIO RULES:
- Please arrive 5 minutes before your slot.
- Show your pass ID at the studio entrance.
- Treat all instruments and recording equipment with care.

Manage your bookings anytime at ${clientUrl}/jam-room
  `;

  try {
    const transporter = await createTransporter();
    const fromAddress = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'no-reply@melodium.sjec.ac.in';

    if (transporter) {
      const info = await transporter.sendMail({
        from: `"Melodium SJEC Studio" <${fromAddress}>`,
        to: user.email,
        subject,
        text: textContent,
        html: htmlContent,
      });
      console.log(`✉️ [EMAIL SENT] Booking confirmation delivered to ${user.email} (MessageId: ${info.messageId})`);
      return { success: true, messageId: info.messageId };
    } else {
      console.log(`✉️ [EMAIL DISPATCHED - DEV MODE] Booking confirmation to ${user.email}`);
      return { success: true, simulated: true };
    }
  } catch (error) {
    console.error(`❌ [EMAIL ERROR] Failed to send booking confirmation email to ${user.email}:`, error.message);
    return { success: false, error: error.message };
  }
};

/**
 * 2. Send Jam Room booking cancellation email to the user (HIGH CONTRAST & BULLETPROOF INLINE STYLES)
 */
export const sendBookingCancellationEmail = async ({ user, booking, reason }) => {
  if (!user?.email || !booking) return { success: false, reason: 'Missing user email or booking' };

  const dateFormatted = formatDateString(booking.date);
  const slotTime = `${formatTime12h(booking.startTime)} – ${formatTime12h(booking.endTime)}`;
  const subject = `❌ Jam Room Reservation Cancelled (${booking.bookingId}) | Melodium SJEC`;
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0b0f19; padding: 24px 12px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #131826; border-radius: 16px; border: 1px solid rgba(244, 63, 94, 0.4); overflow: hidden; box-shadow: 0 12px 35px rgba(0,0,0,0.6);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #22121d 0%, #0b0f19 100%); padding: 32px 24px; text-align: center; border-bottom: 2px solid #f43f5e;">
              <div style="display: inline-block; background-color: rgba(244, 63, 94, 0.2); color: #fb7185; border: 1px solid rgba(244, 63, 94, 0.4); font-weight: 900; font-size: 11px; letter-spacing: 1.5px; padding: 4px 14px; border-radius: 20px; text-transform: uppercase; margin-bottom: 12px;">
                MELODIUM SJEC • CANCELLATION NOTICE
              </div>
              <h1 style="color: #ff4b6e; font-size: 24px; font-weight: 800; margin: 0 0 6px 0; line-height: 1.3;">
                Reservation Cancelled
              </h1>
              <p style="color: #94a3b8; font-size: 13px; margin: 0;">
                Your Studio 1 Jam Room session has been cancelled.
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 28px 24px;">
              <p style="font-size: 16px; color: #ffffff; font-weight: 700; margin: 0 0 12px 0;">
                Hello <span style="color: #facc15;">${user.name || 'Musician'}</span>,
              </p>
              
              <p style="font-size: 14px; color: #e2e8f0; line-height: 1.6; margin: 0 0 20px 0;">
                Your Studio 1 Jam Room reservation <strong style="color: #facc15; font-family: monospace;">${booking.bookingId}</strong> for <strong style="color: #ffffff;">${dateFormatted}</strong> at <strong style="color: #ffffff;">${slotTime}</strong> has been cancelled.
              </p>

              <!-- Cancellation Details Box -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #1a2236; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; margin-bottom: 20px; overflow: hidden;">
                <tr>
                  <td style="padding: 16px;">
                    <div style="color: #f43f5e; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">
                      CANCELLED SESSION DETAILS
                    </div>
                    <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 13px;">
                      <tr>
                        <td style="color: #94a3b8; width: 35%;">Pass ID:</td>
                        <td style="color: #facc15; font-weight: 800; text-align: right; font-family: monospace;">${booking.bookingId}</td>
                      </tr>
                      <tr>
                        <td style="color: #94a3b8;">Date:</td>
                        <td style="color: #ffffff; font-weight: 700; text-align: right;">${dateFormatted}</td>
                      </tr>
                      <tr>
                        <td style="color: #94a3b8;">Slot Time:</td>
                        <td style="color: #ffffff; font-weight: 700; text-align: right;">${slotTime}</td>
                      </tr>
                      <tr>
                        <td style="color: #94a3b8;">Status:</td>
                        <td style="color: #f43f5e; font-weight: 800; text-align: right; text-transform: uppercase;">
                          Cancelled
                        </td>
                      </tr>
                      ${
                        reason
                          ? `
                      <tr>
                        <td style="color: #94a3b8; vertical-align: top; padding-top: 10px;">Reason:</td>
                        <td style="color: #fecdd3; font-weight: 600; text-align: right; padding-top: 10px;">${reason}</td>
                      </tr>`
                          : ''
                      }
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Notice Box -->
              <div style="background-color: rgba(244, 63, 94, 0.08); border-left: 4px solid #f43f5e; padding: 14px 16px; border-radius: 4px 8px 8px 4px; margin-bottom: 24px;">
                <p style="margin: 0; color: #f1f5f9; font-size: 13px; line-height: 1.6;">
                  You can reserve an alternative rehearsal slot anytime on the Melodium SJEC platform.
                </p>
              </div>

              <!-- Button CTA -->
              <div style="text-align: center; margin: 28px 0 10px 0;">
                <a href="${clientUrl}/jam-room" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #facc15 0%, #f59e0b 100%); color: #0b0f19 !important; text-decoration: none; font-weight: 900; font-size: 13px; padding: 14px 28px; border-radius: 12px; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 15px rgba(250, 204, 21, 0.3);">
                  Book Alternative Slot
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0b0f19; padding: 20px 24px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.08);">
              <p style="margin: 0 0 6px 0; color: #94a3b8; font-size: 12px;">
                Melodium SJEC • St. Joseph Engineering College, Mangaluru
              </p>
              <p style="margin: 0; color: #64748b; font-size: 11px;">
                © ${new Date().getFullYear()} Melodium SJEC. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const textContent = `
Melodium SJEC — Reservation Cancelled

Hello ${user.name || 'Musician'},

Your Studio 1 Jam Room reservation ${booking.bookingId} for ${dateFormatted} at ${slotTime} has been cancelled.
${reason ? `Reason: ${reason}\n` : ''}
You can reserve an alternative slot anytime on the Melodium platform: ${clientUrl}/jam-room

Melodium SJEC • St. Joseph Engineering College, Mangaluru
  `;

  try {
    const transporter = await createTransporter();
    const fromAddress = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'no-reply@melodium.sjec.ac.in';

    if (transporter) {
      await transporter.sendMail({
        from: `"Melodium SJEC Studio" <${fromAddress}>`,
        to: user.email,
        subject,
        text: textContent,
        html: htmlContent,
      });
      console.log(`✉️ [EMAIL SENT] Cancellation email sent to ${user.email}`);
    } else {
      console.log(`✉️ [EMAIL DISPATCHED - DEV MODE] Cancellation notice to ${user.email} for ${booking.bookingId}`);
    }
    return { success: true };
  } catch (error) {
    console.error(`❌ [EMAIL ERROR] Failed to send cancellation email:`, error.message);
    return { success: false, error: error.message };
  }
};

/**
 * 3. Send password reset email with secure verification link
 */
export const sendPasswordResetEmail = async ({ user, resetUrl, expiresInMinutes = 30 }) => {
  if (!user?.email) return { success: false, reason: 'Missing user email' };

  const subject = `🔐 Reset Your Melodium SJEC Password`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0b0f19; padding: 24px 12px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #131826; border-radius: 16px; border: 1px solid rgba(250, 204, 21, 0.3); overflow: hidden; box-shadow: 0 12px 35px rgba(0,0,0,0.6);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #182035 0%, #0b0f19 100%); padding: 32px 24px; text-align: center; border-bottom: 2px solid #facc15;">
              <div style="display: inline-block; background-color: #facc15; color: #0b0f19; font-weight: 900; font-size: 11px; letter-spacing: 1.5px; padding: 4px 14px; border-radius: 20px; text-transform: uppercase; margin-bottom: 12px;">
                MELODIUM SJEC
              </div>
              <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 0 0 6px 0; line-height: 1.3;">
                Password Reset Request 🔐
              </h1>
              <p style="color: #94a3b8; font-size: 13px; margin: 0;">
                Secure verification for your Melodium account
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 28px 24px;">
              <p style="font-size: 16px; color: #ffffff; font-weight: 700; margin: 0 0 12px 0;">
                Hello <span style="color: #facc15;">${user.name || 'Musician'}</span>,
              </p>
              
              <p style="font-size: 14px; color: #e2e8f0; line-height: 1.6; margin: 0 0 20px 0;">
                We received a request to reset the password for your Melodium account associated with <strong style="color: #facc15;">${user.email}</strong>.
              </p>

              <!-- Reset Button CTA -->
              <div style="text-align: center; margin: 28px 0;">
                <a href="${resetUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #facc15 0%, #f59e0b 100%); color: #0b0f19 !important; text-decoration: none; font-weight: 900; font-size: 14px; padding: 14px 32px; border-radius: 12px; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 15px rgba(250, 204, 21, 0.35);">
                  Reset My Password ➜
                </a>
              </div>

              <!-- Expiry Note -->
              <div style="background-color: rgba(250, 204, 21, 0.08); border-left: 4px solid #facc15; padding: 14px 16px; border-radius: 4px 8px 8px 4px; margin: 20px 0;">
                <div style="color: #facc15; font-weight: 800; font-size: 13px; margin-bottom: 4px;">
                  ⏳ Important Expiration Notice:
                </div>
                <div style="color: #e2e8f0; font-size: 12px; line-height: 1.6;">
                  This password reset link is valid for <strong style="color: #ffffff;">${expiresInMinutes} minutes</strong> from the time it was requested. Once expired, you will need to request a new link.
                </div>
              </div>

              <!-- Direct link fallback -->
              <p style="font-size: 12px; color: #94a3b8; margin: 0 0 6px 0;">
                If the button above does not work, copy and paste this direct link into your browser:
              </p>
              <div style="word-break: break-all; background-color: #0b0f19; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 10px 14px; font-family: monospace; font-size: 11px; color: #facc15; margin-bottom: 20px;">
                ${resetUrl}
              </div>

              <!-- Security Note -->
              <div style="border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 18px; margin-top: 20px; font-size: 12px; color: #94a3b8; line-height: 1.6;">
                <strong style="color: #ffffff;">🛡️ Security Notice:</strong> If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged and your account remains secure.
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0b0f19; padding: 20px 24px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.08);">
              <p style="margin: 0 0 6px 0; color: #94a3b8; font-size: 12px;">
                St. Joseph Engineering College, Vamanjoor, Mangaluru - 575028
              </p>
              <p style="margin: 0; color: #64748b; font-size: 11px;">
                © ${new Date().getFullYear()} Melodium SJEC. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const textContent = `
Melodium SJEC — Password Reset Request

Hello ${user.name || 'Musician'},

We received a request to reset your password for ${user.email}.

Please click the link below to set a new password:
${resetUrl}

This link is valid for ${expiresInMinutes} minutes.

If you did not request this, please ignore this email and your password will remain unchanged.

Melodium SJEC • St. Joseph Engineering College, Mangaluru
  `;

  try {
    const transporter = await createTransporter();
    const fromAddress = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'no-reply@melodium.sjec.ac.in';

    if (transporter) {
      const info = await transporter.sendMail({
        from: `"Melodium SJEC Security" <${fromAddress}>`,
        to: user.email,
        subject,
        text: textContent,
        html: htmlContent,
      });
      console.log(`✉️ [EMAIL SENT] Password reset email delivered to ${user.email} (MessageId: ${info.messageId})`);
      return { success: true, messageId: info.messageId };
    } else {
      console.log(`✉️ [EMAIL DISPATCHED - DEV MODE] Password reset URL for ${user.email}: ${resetUrl}`);
      return { success: true, simulated: true };
    }
  } catch (error) {
    console.error(`❌ [EMAIL ERROR] Failed to send password reset email to ${user.email}:`, error.message);
    return { success: false, error: error.message };
  }
};
