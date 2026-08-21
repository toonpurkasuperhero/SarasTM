const express = require('express');
const router = express.Router();
const { generateQR, computeContentHash } = require('../services/qrGenerator');
const supabase = require('../db/supabase');

router.post('/generate/:productId', async (req, res) => {
  try {
    const { productId } = req.params;

    const { data: product, error: fetchErr } = await supabase
      .from('products')
      .select('*, artisans(*)')
      .eq('id', productId)
      .single();

    if (fetchErr) throw fetchErr;

    const qrUrl = await generateQR(productId);
    const contentHash = computeContentHash(product);

    const { data: existing } = await supabase.from('passports').select('id').eq('product_id', productId).single();

    let passport;
    if (existing) {
      const { data } = await supabase.from('passports').update({ qr_url: qrUrl, content_hash: contentHash }).eq('product_id', productId).select().single();
      passport = data;
    } else {
      const { data } = await supabase.from('passports').insert({ product_id: productId, qr_url: qrUrl, content_hash: contentHash, verification_status: 'pending' }).select().single();
      passport = data;
    }

    res.json(passport);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:productId', async (req, res) => {
  try {
    const { productId } = req.params;

    const { data: passport, error } = await supabase
      .from('passports')
      .select('*')
      .eq('product_id', productId)
      .single();

    if (error) return res.status(404).json({ error: 'Passport not found' });

    const { data: product } = await supabase
      .from('products')
      .select('*, artisans(*)')
      .eq('id', productId)
      .single();

    const currentHash = computeContentHash(product);
    const hashMatch = currentHash === passport.content_hash;

    res.json({
      ...passport,
      product,
      artisan: product?.artisans,
      hashMatch,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
