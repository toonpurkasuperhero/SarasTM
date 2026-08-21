const express = require('express');
const router = express.Router();
const supabase = require('../db/supabase');

router.post('/', async (req, res) => {
  try {
    const { orderId, productId, rating, comment } = req.body;
    const buyerId = req.user?.id;

    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be 1-5' });

    const { data: order } = await supabase.from('orders').select('status').eq('id', orderId).single();
    if (!order || order.status !== 'delivered') {
      return res.status(400).json({ error: 'Can only review delivered orders' });
    }

    const { data, error } = await supabase.from('reviews').insert({
      order_id: orderId,
      buyer_id: buyerId,
      product_id: productId,
      rating,
      comment,
    }).select().single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:productId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, buyers(name)')
      .eq('product_id', req.params.productId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
