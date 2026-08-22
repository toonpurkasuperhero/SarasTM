const express = require('express');
const router = express.Router();
const multer = require('multer');
const { processAndUpload, uploadRaw } = require('../services/imageProcessor');
const supabase = require('../db/supabase');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/upload', upload.array('photos', 3), async (req, res) => {
  try {
    const { productId } = req.body;
    const results = [];

    for (const file of req.files) {
      const rawUrl = await uploadRaw(file.buffer, productId);
      const { data, error } = await supabase.from('product_images').insert({
        product_id: productId,
        raw_url: rawUrl,
      }).select().single();
      if (error) throw error;
      results.push(data);
    }

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/enhance', upload.array('images', 3), async (req, res) => {
  try {
    const { productId, backdrop } = req.body;
    const backdropName = backdrop || 'studio_white';
    const results = [];

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No images uploaded' });
    }

    const prodId = productId && productId !== 'undefined' ? productId : 'temp';

    for (const file of req.files) {
      // 1. Upload raw photo
      const rawUrl = await uploadRaw(file.buffer, prodId);

      // 2. Enhance image
      const enhancedUrl = await processAndUpload(file.buffer, prodId, backdropName);

      // 3. Save to database if productId is provided
      if (prodId !== 'temp') {
        const { data, error } = await supabase
          .from('product_images')
          .insert({
            product_id: prodId,
            raw_url: rawUrl,
            enhanced_url: enhancedUrl
          })
          .select()
          .single();

        if (error) throw error;

        // Update the primary image cover of the product so it is live in the storefront
        await supabase
          .from('products')
          .update({ image: enhancedUrl })
          .eq('id', prodId);

        results.push(data);
      } else {
        results.push({ raw_url: rawUrl, enhanced_url: enhancedUrl });
      }
    }

    res.json(results);
  } catch (err) {
    console.error('Enhancement error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get('/:productId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', req.params.productId);

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
