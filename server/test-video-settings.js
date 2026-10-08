const BASE_URL = 'http://localhost:5000/api';

const testVideoSettings = async () => {
  console.log('🧪 Testing Video Background Settings API...');

  // 1. Admin login
  const adminRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@sjec.ac.in', password: 'Admin@12345' }),
  });
  const adminData = await adminRes.json();
  const token = adminData.token;
  console.log('✅ Admin login succeeded');

  // 2. Patch video settings
  const patchRes = await fetch(`${BASE_URL}/settings/booking`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      heroVideoUrl: 'https://www.youtube.com/watch?v=kYxRk57QoZg',
      heroVideoTitle: 'Melodium Live Acoustic Jam Rehearsal',
      heroVideoEnabled: true,
      heroVideoOpacity: 0.60,
      heroVideoPoster: '',
    }),
  });
  const patchData = await patchRes.json();
  console.log('✅ Video settings patch response:', patchData.success, patchData.data.heroVideoTitle);

  // 3. Fetch public settings
  const getRes = await fetch(`${BASE_URL}/settings/booking`);
  const getData = await getRes.json();
  console.log('✅ Public settings response has video:', {
    enabled: getData.data.heroVideoEnabled,
    title: getData.data.heroVideoTitle,
    opacity: getData.data.heroVideoOpacity,
    url: getData.data.heroVideoUrl,
  });
};

testVideoSettings();
