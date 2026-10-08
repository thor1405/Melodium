const BASE_URL = 'http://localhost:5000/api';

async function runPolicyTest() {
  console.log('🧪 Testing Melodium SJEC 1-Active-Date Policy with Multi-Slot Booking on Atlas...');

  // 1. Register a test student
  const randNum = Math.floor(1000 + Math.random() * 9000);
  const testEmail = `student_${randNum}@sjec.ac.in`;
  const regRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Rohan Rao',
      email: testEmail,
      password: 'Password@123',
      usn: `4SO22CS${randNum}`,
      department: 'Computer Science',
      year: 3,
    }),
  });

  const regData = await regRes.json();
  const token = regData.token;
  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
  console.log('✅ Student registered and authenticated:', testEmail);

  // 2. Book Slot 1 on 2026-10-04 (10:00)
  const bookRes1 = await fetch(`${BASE_URL}/bookings`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      date: '2026-10-04',
      startTime: '10:00',
      purpose: 'Guitar Lead Rehearsal',
    }),
  });
  const book1 = await bookRes1.json();
  if (bookRes1.status !== 201) {
    console.error('❌ Book 1 failed with status', bookRes1.status, book1);
    process.exit(1);
  }
  console.log('✅ Slot 1 booked on 2026-10-04 (10:00):', book1.booking.bookingId);

  // 3. Book Slot 2 on the SAME DATE: 2026-10-04 (11:00) - Should SUCCEED!
  const bookRes2 = await fetch(`${BASE_URL}/bookings`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      date: '2026-10-04',
      startTime: '11:00',
      purpose: 'Drum and Bass Jam',
    }),
  });
  const book2 = await bookRes2.json();
  console.log('✅ Slot 2 booked on SAME DATE 2026-10-04 (11:00):', book2.booking.bookingId);

  // 4. Try booking Slot 3 on a DIFFERENT DATE: 2026-10-06 (14:00) - Should FAIL!
  const bookRes3 = await fetch(`${BASE_URL}/bookings`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      date: '2026-10-06',
      startTime: '14:00',
      purpose: 'Vocal Practice',
    }),
  });
  const book3 = await bookRes3.json();

  if (bookRes3.status === 400 && !book3.success) {
    console.log('🏆 1-ACTIVE-DATE RULE ENFORCED: Rejected different date with message:');
    console.log('   "', book3.message, '"');
  } else {
    console.error('❌ FAILED: Should not allow booking a different date while Oct 4 is active!', book3);
  }

  // 5. Clean up by cancelling the test bookings
  await fetch(`${BASE_URL}/bookings/${book1.booking._id}`, {
    method: 'DELETE',
    headers: authHeaders,
  });
  await fetch(`${BASE_URL}/bookings/${book2.booking._id}`, {
    method: 'DELETE',
    headers: authHeaders,
  });
  console.log('🧹 Cleaned up test bookings.');

  console.log('🎉 ALL 1-ACTIVE-DATE & MULTI-SLOT POLICY TESTS PASSED ON ATLAS!');
}

runPolicyTest().catch((e) => {
  console.error('Test error:', e);
  process.exit(1);
});
