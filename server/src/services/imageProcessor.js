const axios = require('axios');
const sharp = require('sharp');
const supabase = require('../db/supabase');
const path = require('path');
const fs = require('fs');

const BACKDROPS = {
  studio_white: { r: 245, g: 245, b: 245 },
  neutral_beige: { r: 255, g: 248, b: 235 },
  dark_slate: { r: 51, g: 65, b: 85 },
  sage_green: { r: 209, g: 250, b: 229 },
};

async function removeBackground(imageBuffer) {
  const res = await axios.post(
    'https://api-inference.huggingface.co/models/briaai/RMBG-1.4',
    imageBuffer,
    {
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_TOKEN}`,
        'Content-Type': 'image/jpeg',
      },
      responseType: 'arraybuffer',
      timeout: 60000,
    }
  );
  return Buffer.from(res.data);
}

async function compositeOnBackdrop(fgBuffer, backdropName) {
  const color = BACKDROPS[backdropName] || BACKDROPS.studio_white;

  const { width, height } = await sharp(fgBuffer).metadata();

  const backdrop = await sharp({
    create: { width, height, channels: 3, background: color },
  }).png().toBuffer();

  const result = await sharp(backdrop)
    .composite([{ input: fgBuffer, blend: 'over' }])
    .jpeg({ quality: 92 })
    .toBuffer();

  return result;
}

async function processAndUpload(imageBuffer, productId, backdropName) {
  const withoutBg = await removeBackground(imageBuffer);
  const enhanced = await compositeOnBackdrop(withoutBg, backdropName || 'studio_white');

  const fileName = `enhanced/${productId}/${Date.now()}.jpg`;
  const { error } = await supabase.storage
    .from('product-images')
    .upload(fileName, enhanced, { contentType: 'image/jpeg', upsert: true });

  if (error) throw error;

  const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName);
  return urlData.publicUrl;
}

async function uploadRaw(imageBuffer, productId) {
  const fileName = `raw/${productId}/${Date.now()}.jpg`;
  const { error } = await supabase.storage
    .from('product-images')
    .upload(fileName, imageBuffer, { contentType: 'image/jpeg', upsert: true });

  if (error) throw error;
  const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName);
  return urlData.publicUrl;
}

module.exports = { processAndUpload, uploadRaw };
