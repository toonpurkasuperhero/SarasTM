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
  try {
    const res = await axios.post(
      'https://api-inference.huggingface.co/models/briaai/RMBG-1.4',
      imageBuffer,
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_TOKEN}`,
          'Content-Type': 'image/jpeg',
        },
        responseType: 'arraybuffer',
        timeout: 25000,
      }
    );
    return { buffer: Buffer.from(res.data), success: true };
  } catch (err) {
    console.warn("⚠️ Hugging Face RMBG-1.4 API call failed. Applying gorgeous product catalog frame effect via Sharp instead:", err.message);
    return { buffer: imageBuffer, success: false };
  }
}

async function compositeOnBackdrop(fgBuffer, backdropName, bgRemovedSuccessfully = true) {
  const color = BACKDROPS[backdropName] || BACKDROPS.studio_white;

  const meta = await sharp(fgBuffer).metadata();
  const width = meta.width || 800;
  const height = meta.height || 1000;

  if (!bgRemovedSuccessfully) {
    // Dropback Fallback: Resize original to 82%, center it, and add a beautiful white card shadow overlay to make it look professional
    const newWidth = Math.floor(width * 0.82);
    const newHeight = Math.floor(height * 0.82);

    const resizedFg = await sharp(fgBuffer)
      .resize(newWidth, newHeight, { fit: 'contain' })
      .toBuffer();

    const backdrop = await sharp({
      create: { width, height, channels: 3, background: color }
    });

    const leftOffset = Math.floor((width - newWidth) / 2);
    const topOffset = Math.floor((height - newHeight) / 2);

    // Overlaying the centered frame
    const result = await backdrop
      .composite([{
        input: resizedFg,
        top: topOffset,
        left: leftOffset,
        blend: 'over'
      }])
      .jpeg({ quality: 95 })
      .toBuffer();

    return result;
  } else {
    // Normal blend with extracted transparent mask
    const backdrop = await sharp({
      create: { width, height, channels: 3, background: color },
    }).png().toBuffer();

    const result = await sharp(backdrop)
      .composite([{ input: fgBuffer, blend: 'over' }])
      .jpeg({ quality: 92 })
      .toBuffer();

    return result;
  }
}

async function processAndUpload(imageBuffer, productId, backdropName) {
  const bgResult = await removeBackground(imageBuffer);
  const enhanced = await compositeOnBackdrop(bgResult.buffer, backdropName || 'studio_white', bgResult.success);

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
