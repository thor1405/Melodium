import dotenv from 'dotenv';
dotenv.config();

import { sendBookingConfirmationEmail, sendBookingCancellationEmail } from './services/email.service.js';

async function testEmail() {
  console.log('--- Testing Melodium SJEC Email Service ---');

  // Test 1: SJEC Student Booking Email
  const studentResult = await sendBookingConfirmationEmail({
    user: {
      name: 'Rohan Pinto',
      email: 'rohan.pinto@sjec.ac.in',
      userType: 'SJEC_STUDENT',
      usn: '4SO23CS099',
      department: 'CSE',
    },
    bookings: [
      {
        bookingId: 'MEL-202610-STUD',
        date: '2026-10-06',
        startTime: '10:00',
        endTime: '11:00',
        durationMinutes: 60,
        purpose: 'Western Band Annual Day Rehearsal',
        userType: 'SJEC_STUDENT',
        feeAmount: 0,
        paymentStatus: 'FREE',
        paymentMethod: 'STUDENT_FREE_PASS',
        participantCount: 5,
      },
      {
        bookingId: 'MEL-202610-STU2',
        date: '2026-10-06',
        startTime: '11:00',
        endTime: '12:00',
        durationMinutes: 60,
        purpose: 'Western Band Annual Day Rehearsal',
        userType: 'SJEC_STUDENT',
        feeAmount: 0,
        paymentStatus: 'FREE',
        paymentMethod: 'STUDENT_FREE_PASS',
        participantCount: 5,
      }
    ],
    settings: {
      roomName: 'Melodium SJEC Jam Room (Studio 1)',
      roomLocation: 'Activity Block, 2nd Floor, SJEC Campus, Vamanjoor, Mangaluru',
    }
  });

  console.log('Student email test result:', studentResult);

  // Test 2: External Musician Booking Email (₹500 Day Pass)
  const outsiderResult = await sendBookingConfirmationEmail({
    user: {
      name: 'Vikram Rao',
      email: 'vikram.coastline@gmail.com',
      userType: 'OUTSIDER',
      organization: 'The Coastline Rockers',
    },
    bookings: [
      {
        bookingId: 'MEL-202610-OUT1',
        date: '2026-10-07',
        startTime: '14:00',
        endTime: '15:00',
        durationMinutes: 60,
        purpose: 'EP Album Recording Prep',
        userType: 'OUTSIDER',
        feeAmount: 500,
        paymentStatus: 'PAID',
        paymentMethod: 'UPI',
        participantCount: 4,
      }
    ],
    settings: {
      roomName: 'Melodium SJEC Jam Room (Studio 1)',
      roomLocation: 'Activity Block, 2nd Floor, SJEC Campus, Vamanjoor, Mangaluru',
    }
  });

  console.log('Outsider email test result:', outsiderResult);

  // Test 3: Cancellation Email
  const cancelResult = await sendBookingCancellationEmail({
    user: {
      name: 'Rohan Pinto',
      email: 'rohan.pinto@sjec.ac.in',
    },
    booking: {
      bookingId: 'MEL-202610-STUD',
      date: '2026-10-06',
      startTime: '10:00',
      endTime: '11:00',
    },
    reason: 'Rescheduled band practice to Wednesday',
  });

  console.log('Cancellation email test result:', cancelResult);
}

testEmail().catch(console.error);
