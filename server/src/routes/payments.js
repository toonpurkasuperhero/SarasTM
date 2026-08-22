const express = require('express');
const router = express.Router();
const PaytmChecksum = require('paytmchecksum');
const axios = require('axios');
const supabase = require('../db/supabase');
const { generateEFIRA } = require('../services/pdfGenerator');
const { convertToINR } = require('../services/forex');
const { v4: uuidv4 } = require('uuid');

router.post('/create-order', async (req, res) => {
  try {
    const { productId, amount, currency, buyerEmail, giftMessage } = req.body;

    const amountInr = await convertToINR(amount, currency);
    const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const paytmParams = {
      body: {
        requestType: "Payment",
        mid: process.env.PAYTM_MID,
        websiteName: process.env.PAYTM_WEBSITE || "WEBSTAGING",
        orderId: orderId,
        callbackUrl: `${process.env.BACKEND_URL || 'http://localhost:4000'}/api/payments/paytm-callback`,
        txnAmount: {
          value: amountInr.toFixed(2),
          currency: "INR"
        },
        userInfo: {
          custId: `CUST_${buyerEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, '')}`
        }
      }
    };

    const checksum = await PaytmChecksum.generateSignature(JSON.stringify(paytmParams.body), process.env.PAYTM_API_KEY);
    paytmParams.head = { signature: checksum };

    console.log("⏳ Initiating Paytm Transaction for Order:", orderId);
    const apiURL = `${process.env.PAYTM_STAGING_URL || 'https://securestage.paytmpayments.com'}/theia/api/v1/initiateTransaction?mid=${process.env.PAYTM_MID}&orderId=${orderId}`;
    
    const paytmRes = await axios.post(apiURL, paytmParams, {
      headers: { 'Content-Type': 'application/json' }
    });

    const body = paytmRes.data.body || {};
    if (body.resultInfo?.resultStatus !== 'S') {
      throw new Error(`Paytm Initiate Transaction failed: ${body.resultInfo?.resultMsg || 'Unknown error'}`);
    }

    const txnToken = body.txnToken;

    // Save order in database with status pending
    const internalOrderId = uuidv4();
    const { error } = await supabase.from('orders').insert({
      id: internalOrderId,
      product_id: productId,
      buyer_email: buyerEmail,
      amount,
      currency,
      amount_inr: amountInr,
      razorpay_order_id: orderId, // Map Paytm's orderId here to keep DB schema intact
      status: 'pending',
      gift_message: giftMessage || null,
    });

    if (error) throw error;

    res.json({
      txnToken,
      orderId,
      amount: amountInr.toFixed(2),
      mid: process.env.PAYTM_MID,
      internalOrderId
    });
  } catch (err) {
    console.error("❌ Paytm Create Order Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

router.post('/paytm-callback', async (req, res) => {
  try {
    console.log("📥 Received Paytm Callback. Parameters:", req.body);
    const paytmParams = { ...req.body };
    const checksum = paytmParams.CHECKSUMHASH;
    delete paytmParams.CHECKSUMHASH;

    const isValid = PaytmChecksum.verifySignature(paytmParams, process.env.PAYTM_API_KEY, checksum);
    if (!isValid) {
      console.error("❌ Invalid Paytm checksum signature verified.");
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/buyer/account?status=failure`);
    }

    const orderId = paytmParams.ORDERID;
    const status = paytmParams.STATUS;

    // Find our database order by Paytm's orderId (stored in razorpay_order_id)
    const { data: dbOrder, error: fetchErr } = await supabase
      .from('orders')
      .select('id')
      .eq('razorpay_order_id', orderId)
      .single();

    if (fetchErr || !dbOrder) {
      console.error("❌ DB Order not found for Paytm orderId:", orderId);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/buyer/account?status=failure`);
    }

    if (status === 'TXN_SUCCESS') {
      console.log("✅ Paytm Payment Successful for Order:", orderId);
      
      const { error: orderErr } = await supabase.from('orders').update({ status: 'paid' }).eq('id', dbOrder.id);
      if (orderErr) throw orderErr;

      const escrowId = uuidv4();
      const { error: escrowErr } = await supabase.from('escrow_entries').insert({
        id: escrowId,
        order_id: dbOrder.id,
        status: 'held',
      });
      if (escrowErr) throw escrowErr;

      const { error: logErr } = await supabase.from('order_status_log').insert({
        order_id: dbOrder.id,
        status: 'paid',
        note: `Paytm Payment Verified — TXNID ${paytmParams.TXNID}`,
      });
      if (logErr) console.error('Status log error:', logErr);

      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/buyer/account?status=success`);
    } else {
      console.warn("⚠️ Paytm Payment Failed/Cancelled. Status:", status);
      await supabase.from('orders').update({ status: 'failed' }).eq('id', dbOrder.id);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/buyer/account?status=failure`);
    }
  } catch (err) {
    console.error("❌ Paytm Callback Error:", err.message);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/buyer/account?status=failure`);
  }
});

// Deprecated Razorpay verify endpoint kept for compatibility, updated to Paytm status checks if needed
router.post('/verify', async (req, res) => {
  res.json({ success: true, note: 'Payment verified via server callback' });
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
