const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const supabase = require('../db/supabase');
const { generateEFIRA } = require('../services/pdfGenerator');
const { convertToINR } = require('../services/forex');
const { v4: uuidv4 } = require('uuid');

const getRazorpay = () => new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

router.post('/create-order', async (req, res) => {
  try {
    const { productId, amount, currency, buyerEmail, giftMessage } = req.body;
    const razorpay = getRazorpay();

    const amountInr = await convertToINR(amount, currency);
    const amountInSmallestUnit = Math.round(amount * 100);

    const rzpOrder = await razorpay.orders.create({
      amount: amountInSmallestUnit,
      currency: currency || 'INR',
      receipt: `sarastm_${Date.now()}`,
    });

    const orderId = uuidv4();
    const { error } = await supabase.from('orders').insert({
      id: orderId,
      product_id: productId,
      buyer_email: buyerEmail,
      amount,
      currency,
      amount_inr: amountInr,
      razorpay_order_id: rzpOrder.id,
      status: 'pending',
      gift_message: giftMessage || null,
    });

    if (error) throw error;

    res.json({ razorpayOrderId: rzpOrder.id, amount: amountInSmallestUnit, currency, orderId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/verify', async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, orderId } = req.body;

    const generated = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generated !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const { error: orderErr } = await supabase.from('orders').update({ status: 'paid' }).eq('id', orderId);
    if (orderErr) throw orderErr;

    const escrowId = uuidv4();
    const { error: escrowErr } = await supabase.from('escrow_entries').insert({
      id: escrowId,
      order_id: orderId,
      status: 'held',
    });
    if (escrowErr) throw escrowErr;

    const { error: logErr } = await supabase.from('order_status_log').insert({
      order_id: orderId,
      status: 'paid',
      note: 'Payment verified — funds held in escrow',
    });
    if (logErr) console.error('Status log error:', logErr);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/simulate-payout', async (req, res) => {
  try {
    const { escrowId } = req.body;

    const { data: escrow, error: escrowFetchErr } = await supabase
      .from('escrow_entries')
      .select('*, orders(*, products(*, artisans(*)))')
      .eq('id', escrowId)
      .single();

    if (escrowFetchErr) throw escrowFetchErr;

    const order = escrow.orders;
    const artisan = order?.products?.artisans;

    const payoutId = uuidv4();
    const amountInr = order?.amount_inr || order?.amount;

    const payout = { id: payoutId, paid_at: new Date().toISOString(), amount_inr: amountInr };
    const pdfBuffer = await generateEFIRA(order, payout);

    const fileName = `efira/${payoutId}.pdf`;
    await supabase.storage.from('product-images').upload(fileName, pdfBuffer, { contentType: 'application/pdf', upsert: true });
    const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName);

    const { error: payoutErr } = await supabase.from('payouts').insert({
      id: payoutId,
      escrow_entry_id: escrowId,
      artisan_id: artisan?.id,
      amount_inr: amountInr,
      status: 'paid',
      efira_pdf_url: urlData.publicUrl,
      paid_at: new Date().toISOString(),
    });
    if (payoutErr) throw payoutErr;

    await supabase.from('escrow_entries').update({ status: 'released' }).eq('id', escrowId);

    res.json({ success: true, efiraUrl: urlData.publicUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/escrow', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('escrow_entries')
      .select('*, orders(*, products(title))')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/payouts', async (req, res) => {
  try {
    const { data, error } = await supabase.from('payouts').select('*').order('paid_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/efira/:payoutId', async (req, res) => {
  try {
    const { data: payout } = await supabase.from('payouts').select('*, escrow_entries(*, orders(*))').eq('id', req.params.payoutId).single();
    if (!payout) return res.status(404).json({ error: 'Payout not found' });

    const pdfBuffer = await generateEFIRA(payout.escrow_entries?.orders || {}, payout);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="efira-${req.params.payoutId.slice(0, 8)}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
