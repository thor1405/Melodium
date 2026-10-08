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

  // Fallback / Dev mode: create test account or log-based transporter
  return null;
};

/**
 * Send Jam Room booking confirmation email to the user
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
  const roomLocation = settings.roomLocation || 'Academic Block 3, Ground Floor, St. Joseph Engineering College, Vamanjoor, Mangaluru, Karnataka 575028';

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

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0; }
    .container { max-width: 600px; margin: 20px auto; background-color: #131826; border-radius: 16px; border: 1px solid rgba(236, 231, 95, 0.25); overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
    .header { background: linear-gradient(135deg, #181f33 0%, #0b0f19 100%); padding: 32px 24px; text-align: center; border-bottom: 2px solid #ece75f; }
    .logo-badge { display: inline-block; background-color: #ece75f; color: #0b0f19; font-weight: 900; font-size: 11px; letter-spacing: 1.5px; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; margin-bottom: 12px; }
    .title { color: #ffffff; font-size: 24px; font-weight: 800; margin: 0 0 6px 0; }
    .subtitle { color: #94a3b8; font-size: 13px; margin: 0; }
    .content { padding: 28px 24px; }
    .greeting { font-size: 16px; color: #ffffff; margin-bottom: 16px; }
    .card { background-color: #1a2236; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 18px; margin-bottom: 20px; }
    .card-title { color: #ece75f; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
    .slot-item { background-color: #0b0f19; border: 1px solid rgba(236, 231, 95, 0.2); border-radius: 8px; padding: 10px 14px; margin-bottom: 8px; }
    .badge { display: inline-block; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
    .badge-sjec { background-color: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4); }
    .badge-outsider { background-color: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4); }
    .guidelines { background-color: rgba(236, 231, 95, 0.05); border-left: 3px solid #ece75f; padding: 12px 16px; border-radius: 4px 8px 8px 4px; margin-top: 20px; font-size: 12px; color: #cbd5e1; line-height: 1.5; }
    .footer { background-color: #0b0f19; padding: 20px 24px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.08); font-size: 11px; color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-badge">MELODIUM SJEC</div>
      <h1 class="title">Rehearsal Session Confirmed! 🎵</h1>
      <p class="subtitle">Your reservation for Studio 1 is active and saved in the schedule.</p>
    </div>

    <div class="content">
      <div class="greeting">
        Hey <strong>${user.name || 'Musician'}</strong>,
      </div>
      <p style="font-size: 14px; color: #cbd5e1; line-height: 1.6; margin-bottom: 20px;">
        Your booking request at <strong>${roomName}</strong> has been successfully confirmed. Below are your pass and session details:
      </p>

      <!-- Booking Summary Card -->
      <div class="card">
        <div class="card-title">Reservation Details</div>
        <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 13px;">
          <tr>
            <td style="color: #94a3b8;">Pass ID(s):</td>
            <td style="color: #ece75f; font-weight: 700; text-align: right; font-family: monospace;">${passIds}</td>
          </tr>
          <tr>
            <td style="color: #94a3b8;">Rehearsal Date:</td>
            <td style="color: #ffffff; font-weight: 600; text-align: right;">${dateFormatted}</td>
          </tr>
          <tr>
            <td style="color: #94a3b8;">Studio Room:</td>
            <td style="color: #ffffff; font-weight: 600; text-align: right;">${roomName}</td>
          </tr>
          <tr>
            <td style="color: #94a3b8;">Location:</td>
            <td style="color: #ffffff; text-align: right;">${roomLocation}</td>
          </tr>
          <tr>
            <td style="color: #94a3b8;">Session Purpose:</td>
            <td style="color: #ffffff; text-align: right;">${firstBooking.purpose || 'Band Rehearsal'}</td>
          </tr>
          <tr>
            <td style="color: #94a3b8;">Membership Type:</td>
            <td style="text-align: right;">
              <span class="badge ${isOutsider ? 'badge-outsider' : 'badge-sjec'}">
                ${isOutsider ? 'Outsider Day Pass' : 'SJEC Student (100% Free)'}
              </span>
            </td>
          </tr>
          <tr>
            <td style="color: #94a3b8;">Fee Paid / Status:</td>
            <td style="color: #ffffff; font-weight: 600; text-align: right;">
              ${isOutsider ? `₹${totalFee} (${paymentStatus} via ${paymentMethod})` : '₹0 (Free Student Pass)'}
            </td>
          </tr>
          ${firstBooking.participantCount ? `
          <tr>
            <td style="color: #94a3b8;">Band Members:</td>
            <td style="color: #ffffff; text-align: right;">${firstBooking.participantCount} Musicians</td>
          </tr>` : ''}
        </table>
      </div>

      <!-- Booked Slots -->
      <div class="card">
        <div class="card-title">Booked Slot Timeline (${slotsSummary.length} Slot${slotsSummary.length > 1 ? 's' : ''})</div>
        ${slotsSummary
          .map(
            (s) => `
          <div class="slot-item">
            <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 13px;">
              <tr>
                <td style="color: #ffffff; font-weight: 700;">🕒 ${s.time}</td>
                <td style="color: #94a3b8; text-align: right;">${s.duration}</td>
              </tr>
            </table>
          </div>`
          )
          .join('')}
      </div>

      <!-- Studio Guidelines -->
      <div class="guidelines">
        <strong style="color: #ece75f;">⚡ Studio House Rules & Entry Protocol:</strong><br>
        • Please arrive 5 minutes prior to your slot time.<br>
        • Show this email or your Digital Pass in the Melodium app at the Studio 1 desk.<br>
        • Handle all acoustic and electrical equipment (amps, drumkits, mics, mixing console) with respect.<br>
        • Food and sugary beverages are strictly prohibited inside the sound-treated rehearsal area.<br>
        • Ensure all cables and equipment are powered down neatly after your session.
      </div>

      <div style="text-align: center; margin-top: 24px;">
        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/jam-room" style="display: inline-block; background: linear-gradient(135deg, #ece75f 0%, #f59e0b 100%); color: #0b0f19; text-decoration: none; font-weight: 800; font-size: 13px; padding: 12px 24px; border-radius: 10px; text-transform: uppercase; letter-spacing: 0.5px;">
          View Live Schedule & Passes
        </a>
      </div>
    </div>

    <div class="footer">
      <p style="margin: 0 0 6px 0;">St. Joseph Engineering College, Vamanjoor, Mangaluru - 575028</p>
      <p style="margin: 0;">© ${new Date().getFullYear()} Melodium SJEC. All rights reserved.</p>
    </div>
  </div>
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

Manage your bookings anytime at ${process.env.CLIENT_URL || 'http://localhost:5173'}/jam-room
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
      console.log(`✉️ [EMAIL DISPATCHED - DEV MODE] (No SMTP credentials configured in .env)`);
      console.log(`   To: ${user.email}`);
      console.log(`   Subject: ${subject}`);
      console.log(`   Pass IDs: ${passIds}`);
      console.log(`   Date: ${dateFormatted} | Slots: ${slotsSummary.map((s) => s.time).join(', ')}`);
      return { success: true, simulated: true };
    }
  } catch (error) {
    console.error(`❌ [EMAIL ERROR] Failed to send booking confirmation email to ${user.email}:`, error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send Jam Room booking cancellation email to the user
 */
export const sendBookingCancellationEmail = async ({ user, booking, reason }) => {
  if (!user?.email || !booking) return { success: false, reason: 'Missing user email or booking' };

  const dateFormatted = formatDateString(booking.date);
  const slotTime = `${formatTime12h(booking.startTime)} – ${formatTime12h(booking.endTime)}`;
  const subject = `❌ Jam Room Reservation Cancelled (${booking.bookingId}) | Melodium SJEC`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { background-color: #0b0f19; font-family: sans-serif; color: #e2e8f0; margin: 0; padding: 20px; }
    .container { max-width: 550px; margin: 0 auto; background: #131826; border-radius: 12px; border: 1px solid rgba(244,63,94,0.3); padding: 24px; }
    .title { color: #f43f5e; font-size: 20px; font-weight: 800; margin-top: 0; }
  </style>
</head>
<body>
  <div class="container">
    <h2 class="title">Reservation Cancelled</h2>
    <p>Hello <strong>${user.name || 'Musician'}</strong>,</p>
    <p>Your Studio 1 Jam Room reservation <strong>${booking.bookingId}</strong> for <strong>${dateFormatted}</strong> at <strong>${slotTime}</strong> has been cancelled.</p>
    ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
    <p>You can reserve an alternative slot anytime on the Melodium platform.</p>
    <p style="color: #64748b; font-size: 11px; margin-top: 24px;">Melodium SJEC • St. Joseph Engineering College</p>
  </div>
</body>
</html>
  `;

  try {
    const transporter = await createTransporter();
    const fromAddress = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'no-reply@melodium.sjec.ac.in';

    if (transporter) {
      await transporter.sendMail({
        from: `"Melodium SJEC Studio" <${fromAddress}>`,
        to: user.email,
        subject,
        text: `Your reservation ${booking.bookingId} for ${dateFormatted} (${slotTime}) has been cancelled.`,
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
 * Send password reset email with secure verification link
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
  <style>
    body { margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0; }
    .container { max-width: 580px; margin: 20px auto; background-color: #131826; border-radius: 16px; border: 1px solid rgba(236, 231, 95, 0.25); overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
    .header { background: linear-gradient(135deg, #181f33 0%, #0b0f19 100%); padding: 32px 24px; text-align: center; border-bottom: 2px solid #ece75f; }
    .logo-badge { display: inline-block; background-color: #ece75f; color: #0b0f19; font-weight: 900; font-size: 11px; letter-spacing: 1.5px; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; margin-bottom: 12px; }
    .title { color: #ffffff; font-size: 24px; font-weight: 800; margin: 0 0 6px 0; }
    .subtitle { color: #94a3b8; font-size: 13px; margin: 0; }
    .content { padding: 28px 24px; }
    .greeting { font-size: 16px; color: #ffffff; margin-bottom: 16px; }
    .card { background-color: #1a2236; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 18px; margin-bottom: 24px; }
    .btn-container { text-align: center; margin: 28px 0; }
    .btn { display: inline-block; background: linear-gradient(135deg, #ece75f 0%, #f59e0b 100%); color: #0b0f19 !important; text-decoration: none; font-weight: 800; font-size: 14px; padding: 14px 32px; border-radius: 12px; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 15px rgba(236, 231, 95, 0.3); }
    .expiry-note { background-color: rgba(236, 231, 95, 0.08); border-left: 3px solid #ece75f; padding: 12px 16px; border-radius: 4px 8px 8px 4px; margin: 20px 0; font-size: 12px; color: #cbd5e1; line-height: 1.5; }
    .security-note { font-size: 12px; color: #94a3b8; line-height: 1.6; border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 18px; margin-top: 20px; }
    .link-box { word-break: break-all; background-color: #0b0f19; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 10px 14px; font-family: monospace; font-size: 11px; color: #ece75f; margin-top: 8px; }
    .footer { background-color: #0b0f19; padding: 20px 24px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.08); font-size: 11px; color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-badge">MELODIUM SJEC</div>
      <h1 class="title">Password Reset Request 🔐</h1>
      <p class="subtitle">Secure verification for your Melodium account</p>
    </div>

    <div class="content">
      <div class="greeting">
        Hello <strong>${user.name || 'Musician'}</strong>,
      </div>
      <p style="font-size: 14px; color: #cbd5e1; line-height: 1.6; margin-bottom: 20px;">
        We received a request to reset the password for your Melodium account associated with <strong style="color: #ece75f;">${user.email}</strong>.
      </p>

      <div class="btn-container">
        <a href="${resetUrl}" class="btn" target="_blank">
          Reset My Password ➜
        </a>
      </div>

      <div class="expiry-note">
        <strong style="color: #ece75f;">⏳ Important Expiration Notice:</strong><br>
        This password reset link is valid for <strong>${expiresInMinutes} minutes</strong> from the time it was requested. Once expired, you will need to request a new link.
      </div>

      <p style="font-size: 12px; color: #94a3b8; margin-bottom: 6px;">
        If the button above does not work, copy and paste this direct link into your browser:
      </p>
      <div class="link-box">
        ${resetUrl}
      </div>

      <div class="security-note">
        <strong>🛡️ Security Notice:</strong> If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged and your account remains secure.
      </div>
    </div>

    <div class="footer">
      <p style="margin: 0 0 6px 0;">St. Joseph Engineering College, Vamanjoor, Mangaluru - 575028</p>
      <p style="margin: 0;">© ${new Date().getFullYear()} Melodium SJEC. All rights reserved.</p>
    </div>
  </div>
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
      console.log(`✉️ [EMAIL DISPATCHED - DEV MODE] (No SMTP credentials configured)`);
      console.log(`   To: ${user.email}`);
      console.log(`   Reset URL: ${resetUrl}`);
      return { success: true, simulated: true };
    }
  } catch (error) {
    console.error(`❌ [EMAIL ERROR] Failed to send password reset email to ${user.email}:`, error.message);
    return { success: false, error: error.message };
  }
};

