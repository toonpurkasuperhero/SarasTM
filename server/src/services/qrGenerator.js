const QRCode = require('qrcode');
const crypto = require('crypto');
const supabase = require('../db/supabase');

async function generateQR(productId) {
  const url = `${process.env.FRONTEND_URL}/passport/${productId}`;
  const qrBuffer = await QRCode.toBuffer(url, {
    type: 'png',
    width: 400,
    margin: 2,
    color: { dark: '#002E6E', light: '#FFFFFF' },
  });

  const fileName = `qr/${productId}.png`;
  const { error } = await supabase.storage
    .from('product-images')
    .upload(fileName, qrBuffer, { contentType: 'image/png', upsert: true });

  if (error) throw error;
  const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName);
  return urlData.publicUrl;
}

function computeContentHash(product) {
  const content = JSON.stringify({
    title: product.title,
    story_en: product.story_en,
    price_inr: product.price_inr,
    artisan_id: product.artisan_id,
    craft_type: product.craft_type,
  });
  return crypto.createHash('sha256').update(content).digest('hex');
}

module.exports = { generateQR, computeContentHash };
