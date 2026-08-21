const express = require('express');
const router = express.Router();
const supabase = require('../db/supabase');
const { v4: uuidv4 } = require('uuid');

router.get('/products', async (req, res) => {
  try {
    const { search, craft_type, region, price_band, limit = 50, offset = 0 } = req.query;

    let query = supabase
      .from('products')
      .select('*, product_images(*), artisans(name, region), passports(qr_url, verification_status)')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (craft_type) query = query.eq('craft_type', craft_type);
    if (region) query = query.eq('region_label', region);
    if (search) query = query.or(`title.ilike.%${search}%,story_en.ilike.%${search}%,craft_type.ilike.%${search}%`);

    if (price_band === 'low') query = query.lt('price_inr', 2000);
    else if (price_band === 'mid') query = query.gte('price_inr', 2000).lte('price_inr', 10000);
    else if (price_band === 'high') query = query.gt('price_inr', 10000);

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/products/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_images(*), artisans(*), passports(*)')
      .eq('id', req.params.id)
      .single();

    if (error) return res.status(404).json({ error: 'Product not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/orders', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, products(title, craft_type, product_images(enhanced_url, raw_url))')
      .eq('buyer_email', req.query.email || '')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/orders/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, products(title, craft_type, product_images(enhanced_url, raw_url)), escrow_entries(*, payouts(*))')
      .eq('id', req.params.id)
      .single();

    if (error) return res.status(404).json({ error: 'Order not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    await supabase.from('order_status_log').insert({
      order_id: req.params.id,
      status,
      note: `Status updated to ${status}`,
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/wishlist/toggle', async (req, res) => {
  try {
    const { productId } = req.body;
    const buyerId = req.user?.id;

    const { data: existing } = await supabase.from('wishlists').select('id').eq('buyer_id', buyerId).eq('product_id', productId).single();

    if (existing) {
      await supabase.from('wishlists').delete().eq('id', existing.id);
      res.json({ wishlisted: false });
    } else {
      await supabase.from('wishlists').insert({ buyer_id: buyerId, product_id: productId });
      res.json({ wishlisted: true });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/wishlist', async (req, res) => {
  try {
    const buyerId = req.user?.id;
    const { data, error } = await supabase
      .from('wishlists')
      .select('*, products(title, product_images(enhanced_url))')
      .eq('buyer_id', buyerId);

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
