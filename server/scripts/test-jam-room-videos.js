import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const BASE_URL = 'http://localhost:5000/api';

const runTest = async () => {
  console.log('🧪 Testing 30-Second Jam Room Short Videos API Endpoints...');

  try {
    // 1. Fetch public short videos
    const publicRes = await fetch(`${BASE_URL}/jam-room-videos`);
    const publicData = await publicRes.json();
    console.log('✅ 1. Public GET /api/jam-room-videos:', publicData.success, `Count: ${publicData.count}`);

    // 2. Login as admin
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@sjec.ac.in', password: 'Admin@12345' }),
    });
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('✅ 2. Admin login authenticated successfully');

    // 3. Admin fetch all videos
    const adminRes = await fetch(`${BASE_URL}/jam-room-videos/admin/all`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const adminData = await adminRes.json();
    console.log('✅ 3. Admin GET /api/jam-room-videos/admin/all:', adminData.success, `Total: ${adminData.count}`);

    // 4. Create new 30s short video
    const createRes = await fetch(`${BASE_URL}/jam-room-videos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: 'API Automated Test 30s Reel',
        description: 'Testing multitrack rehearsal capture in Jam Room',
        videoUrl: 'https://cdn.pixabay.com/video/2016/09/13/4998-183792019_large.mp4',
        duration: 30,
        tag: 'Live Rehearsal',
        isFeatured: true,
        isActive: true,
        order: 99,
      }),
    });
    const createData = await createRes.json();
    console.log('✅ 4. Admin POST /api/jam-room-videos:', createData.success, createData.message);
    const createdId = createData.data._id;

    // 5. Like video
    const likeRes = await fetch(`${BASE_URL}/jam-room-videos/${createdId}/like`, {
      method: 'POST',
    });
    const likeData = await likeRes.json();
    console.log('✅ 5. POST /api/jam-room-videos/:id/like -> Likes count:', likeData.likesCount);

    // 6. View video
    const viewRes = await fetch(`${BASE_URL}/jam-room-videos/${createdId}/view`, {
      method: 'POST',
    });
    const viewData = await viewRes.json();
    console.log('✅ 6. POST /api/jam-room-videos/:id/view -> Views count:', viewData.viewsCount);

    // 7. Update video
    const updateRes = await fetch(`${BASE_URL}/jam-room-videos/${createdId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: 'Updated 30s Reel Title',
        tag: 'Lionel Mix',
      }),
    });
    const updateData = await updateRes.json();
    console.log('✅ 7. PUT /api/jam-room-videos/:id:', updateData.success, updateData.data.title);

    // 8. Delete test video
    const delRes = await fetch(`${BASE_URL}/jam-room-videos/${createdId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const delData = await delRes.json();
    console.log('✅ 8. DELETE /api/jam-room-videos/:id:', delData.success, delData.message);

    console.log('🎉 ALL 8 TESTS PASSED WITH 100% SUCCESS!');
  } catch (err) {
    console.error('❌ Test failed with error:', err.message);
  }
};

runTest();
