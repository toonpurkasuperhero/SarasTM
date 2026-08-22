const axios = require('axios');
require('dotenv').config({ path: '../server/.env' });

(async () => {
  const token = process.env.HUGGINGFACE_API_TOKEN;
  console.log('Testing HF Token:', token?.slice(0, 8) + '...');
  
  // Dummy 1x1 transparent PNG buffer
  const dummyBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');

  try {
    const res = await axios.post(
      'https://api-inference.huggingface.co/models/briaai/RMBG-1.4',
      dummyBuffer,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'image/png',
        },
        responseType: 'arraybuffer'
      }
    );
    console.log('✅ HuggingFace Success! Response buffer length:', res.data.byteLength);
  } catch (err) {
    console.error('❌ HuggingFace Failed!');
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Data:', Buffer.from(err.response.data).toString('utf-8'));
    } else {
      console.error('Error:', err.message);
    }
  }
})();
