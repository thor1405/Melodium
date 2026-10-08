const BASE_URL = 'http://localhost:5000/api';

const runTests = async () => {
  console.log('🧪 Starting Melodium SJEC Multi-User Concurrency & Double-Booking Test...\n');

  try {
    // 1. Student 1 Login (Johan)
    const johanRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'johan@sjec.ac.in', password: 'Student@12345' }),
    });
    const johanToken = (await johanRes.json()).token;

    // 2. Student 2 Login (Ananya)
    const ananyaRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ananya@sjec.ac.in', password: 'Student@12345' }),
    });
    const ananyaToken = (await ananyaRes.json()).token;

    // Use a unique upcoming date without existing seed bookings
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 6);
    const dateStr = targetDate.toISOString().split('T')[0];
    const slotTime = '15:00';

    console.log(`🔒 Two different students (Johan & Ananya) booking slot ${dateStr} ${slotTime} at the exact same millisecond...`);

    const p1 = fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${johanToken}`,
      },
      body: JSON.stringify({
        date: dateStr,
        startTime: slotTime,
        purpose: 'Johan Band Rehearsal',
        participantCount: 4,
      }),
    }).then(async (r) => ({ user: 'Johan', ok: r.ok, status: r.status, body: await r.json() }));

    const p2 = fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ananyaToken}`,
      },
      body: JSON.stringify({
        date: dateStr,
        startTime: slotTime,
        purpose: 'Ananya Vocal Session',
        participantCount: 1,
      }),
    }).then(async (r) => ({ user: 'Ananya', ok: r.ok, status: r.status, body: await r.json() }));

    const [r1, r2] = await Promise.all([p1, p2]);

    console.log(`${r1.user} Result:`, r1.ok ? `SUCCESS (Booking ID: ${r1.body.booking?.bookingId})` : `FAILED (${r1.status}: ${r1.body.message})`);
    console.log(`${r2.user} Result:`, r2.ok ? `SUCCESS (Booking ID: ${r2.body.booking?.bookingId})` : `FAILED (${r2.status}: ${r2.body.message})`);

    const hasOneSuccess = (r1.ok && !r2.ok) || (!r1.ok && r2.ok);
    const hasConflict409 = r1.status === 409 || r2.status === 409;

    if (hasOneSuccess && hasConflict409) {
      console.log('\n🏆 RACE CONDITION PROOF: Exactly ONE student won the slot (Status 201), while the other received 409 Conflict: "This slot was just booked by another user. Please select another time."');
    } else {
      console.warn('\n⚠️ Result:', { r1, r2 });
    }
  } catch (err) {
    console.error('❌ Test failed:', err.message);
  }
};

runTests();
