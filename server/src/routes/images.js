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

router.post('/enhance', async (req, res) => {
  try {
    const { productId, backdropName } = req.body;

    const { data: images, error: fetchErr } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: true });

    if (fetchErr) throw fetchErr;
    if (!images?.length) return res.status(404).json({ error: 'No images found for product' });

    const firstImage = images[0];
    const rawResponse = await fetch(firstImage.raw_url);
    const rawBuffer = Buffer.from(await rawResponse.arrayBuffer());

    const enhancedUrl = await processAndUpload(rawBuffer, productId, backdropName || 'studio_white');

    const { error: updateErr } = await supabase
      .from('product_images')
      .update({ enhanced_url: enhancedUrl })
      .eq('id', firstImage.id);

    if (updateErr) throw updateErr;
    res.json({ rawUrl: firstImage.raw_url, enhancedUrl });
  } catch (err) {
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
