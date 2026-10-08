import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5000/api';

const testUpload = async () => {
  console.log('🧪 Testing Video File Upload Endpoint...');

  // 1. Admin login
  const adminRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@sjec.ac.in', password: 'Admin@12345' }),
  });
  const adminData = await adminRes.json();
  const token = adminData.token;

  // 2. Create sample mp4 dummy file
  const sampleFilePath = './sample-test.mp4';
  fs.writeFileSync(sampleFilePath, Buffer.from('FAKE_VIDEO_HEADER_DATA_12345'));

  // 3. Upload file via FormData
  const formData = new FormData();
  const fileBlob = new Blob([fs.readFileSync(sampleFilePath)], { type: 'video/mp4' });
  formData.append('video', fileBlob, 'melodium_band_jam.mp4');
  formData.append('heroVideoTitle', 'Melodium SJEC Jam Session');

  const uploadRes = await fetch(`${BASE_URL}/settings/upload-video`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const uploadData = await uploadRes.json();
  console.log('✅ Upload endpoint status:', uploadRes.status, uploadData.success);
  console.log('✅ Generated Static Video URL:', uploadData.videoUrl);

  // 4. Clean up test file
  fs.unlinkSync(sampleFilePath);
};

testUpload();
