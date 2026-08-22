const express = require('express');
const router = express.Router();
const multer = require('multer');
const sarvam = require('../services/sarvam');
const { generateListing } = require('../services/gemini');
const supabase = require('../db/supabase');
const { v4: uuidv4 } = require('uuid');

const SARVAM_ENABLED = sarvam.SARVAM_ENABLED;

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

router.post('/generate', upload.single('audio'), async (req, res) => {
  try {
    const { language, description, text } = req.body;
    const inputText = description || text;

    let englishText;
    let nativeText;

    if (!SARVAM_ENABLED || inputText) {
      nativeText = inputText || 'एक सुंदर हस्तनिर्मित कलाकृति';
      englishText = language === 'en' ? nativeText : await sarvam.translateToEnglish(nativeText, language || 'hi');
    } else if (req.file) {
      const audioBuffer = req.file.buffer;
      nativeText = await sarvam.transcribeAudio(audioBuffer, language || 'hi');
      englishText = language === 'en' ? nativeText : await sarvam.translateToEnglish(nativeText, language || 'hi');
    } else {
      throw new Error('No audio file or text description provided');
    }
    const listing = await generateListing(englishText);

    const artisanId = req.user?.id;

    const { data, error } = await supabase.from('products').insert({
      id: uuidv4(),
      artisan_id: artisanId,
      title: listing.title,
      story_en: listing.story,
      story_native: nativeText,
      seo_tags: listing.seo_tags,
      price_inr: listing.suggested_price_inr,
      price_usd: listing.suggested_price_usd,
      price_eur: listing.suggested_price_eur,
      price_gbp: listing.suggested_price_gbp,
      craft_type: listing.craft_type,
      region_label: listing.region_label,
      status: 'draft',
    }).select().single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/orders/received', async (req, res) => {
  try {
    const artisanId = req.user?.id || '34a1841b-9fd6-4409-96e3-fb61c5915071';
    
    const { data, error } = await supabase
      .from('orders')
      .select('*, products!inner(*, product_images(*))')
      .eq('products.artisan_id', artisanId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/my', async (req, res) => {
  try {
    const artisanId = req.user?.id;
    const { data, error } = await supabase
      .from('products')
      .select('*, product_images(*), passports(*)')
      .eq('artisan_id', artisanId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_images(*), artisans(*), passports(*)')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const { title, story_en, seo_tags, price_inr, price_usd, price_eur, price_gbp, craft_type, region_label } = req.body;
    const { data, error } = await supabase
      .from('products')
      .update({ title, story_en, seo_tags, price_inr, price_usd, price_eur, price_gbp, craft_type, region_label })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/publish', async (req, res) => {
  try {
    const crypto = require('crypto');
    const { data: product, error: fetchErr } = await supabase
      .from('products')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (fetchErr) throw fetchErr;

    const contentHash = crypto.createHash('sha256').update(JSON.stringify({
      title: product.title, story_en: product.story_en, price_inr: product.price_inr,
    })).digest('hex');

    const { data, error } = await supabase
      .from('products')
      .update({ status: 'published', content_hash: contentHash })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
