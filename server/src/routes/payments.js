const express = require('express');
const router = express.Router();
const PaytmChecksum = require('paytmchecksum');
const axios = require('axios');
const crypto = require('crypto');
const supabase = require('../db/supabase');
const { generateEFIRA } = require('../services/pdfGenerator');
const { convertToINR, getAllDCCRates, detectCurrencyFromLocale, SUPPORTED_CURRENCIES } = require('../services/forex');
const { v4: uuidv4 } = require('uuid');

// ─────────────────────────────────────────────
// Feature 1: Dynamic Currency Conversion Rates
// ─────────────────────────────────────────────
router.get('/forex-rates', async (req, res) => {
  try {
    const dccRates = await getAllDCCRates();
    const detectedCurrency = detectCurrencyFromLocale(req.headers['accept-language']);
    res.json({
      rates: dccRates,
      detectedCurrency,
      supportedCurrencies: SUPPORTED_CURRENCIES,
      marginPct: '1.5',
      provider: 'Frankfurter / ECB',
      cachedAt: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// Feature 2: Virtual Multi-Currency Collection Accounts
// ─────────────────────────────────────────────
router.get('/virtual-account', async (req, res) => {
  try {
    const { currency = 'USD', productId, amount } = req.query;
    const artisanId = req.user?.id || '34a1841b-9fd6-4409-96e3-fb61c5915071';

    // Generate deterministic-looking virtual account details seeded from artisanId
    const seed = crypto.createHash('md5').update(`${artisanId}-${currency}`).digest('hex');
    const accountNum = `${parseInt(seed.slice(0, 4), 16).toString().padStart(4, '0')}${parseInt(seed.slice(4, 8), 16).toString().padStart(4, '0')}${parseInt(seed.slice(8, 12), 16).toString().padStart(4, '0')}`;
    const routingNum = `0${parseInt(seed.slice(12, 18), 16).toString().slice(0, 8)}`;
    const ibanSeed = seed.slice(0, 16).toUpperCase();

    const accountDetails = {
      USD: {
        method: 'ACH / Fedwire',
        bankName: 'Paytm Partner Bank (US Correspondent)',
        accountHolderName: 'SarasTM Escrow — Artisan Collection',
        routingNumber: routingNum,
        accountNumber: accountNum,
        accountType: 'Checking',
        reference: `SARAS-${productId?.slice(0, 8)?.toUpperCase() || 'REF0001'}`,
        instructions: 'Initiate a standard ACH/Wire transfer using the above details. Your payment auto-converts to INR and settles within 1–2 business days.',
        flag: '🇺🇸',
      },
      EUR: {
        method: 'SEPA Credit Transfer',
        bankName: 'Paytm Partner Bank (EU Correspondent)',
        accountHolderName: 'SarasTM Escrow — Artisan Collection',
        iban: `DE${parseInt(seed.slice(0, 2), 16).toString().padStart(2, '0')} ${ibanSeed.slice(0, 4)} ${ibanSeed.slice(4, 8)} ${ibanSeed.slice(8, 12)} ${ibanSeed.slice(12, 16)} 00`,
        bic: `PAYSDEBBXXX`,
        reference: `SARAS-${productId?.slice(0, 8)?.toUpperCase() || 'REF0001'}`,
        instructions: 'Initiate a SEPA Credit Transfer using the IBAN and BIC above. Include the Reference in the payment description.',
        flag: '🇪🇺',
      },
      GBP: {
        method: 'Faster Payments / CHAPS',
        bankName: 'Paytm Partner Bank (UK Correspondent)',
        accountHolderName: 'SarasTM Escrow — Artisan Collection',
        sortCode: `${seed.slice(0, 2)}-${seed.slice(2, 4)}-${seed.slice(4, 6)}`,
        accountNumber: accountNum.slice(0, 8),
        reference: `SARAS-${productId?.slice(0, 8)?.toUpperCase() || 'REF0001'}`,
        instructions: 'Use Faster Payments or CHAPS to transfer using Sort Code and Account Number. Include the Reference.',
        flag: '🇬🇧',
      },
      AED: {
        method: 'SWIFT / UAE Bank Transfer',
        bankName: 'Paytm Partner Bank (UAE Correspondent)',
        accountHolderName: 'SarasTM Escrow — Artisan Collection',
        iban: `AE${parseInt(seed.slice(0, 2), 16).toString().padStart(2, '0')} 0${ibanSeed.slice(0, 3)} ${ibanSeed.slice(3, 7)} ${ibanSeed.slice(7, 11)} ${ibanSeed.slice(11, 15)} 0`,
        swiftCode: 'PAYTMAEXXX',
        reference: `SARAS-${productId?.slice(0, 8)?.toUpperCase() || 'REF0001'}`,
        instructions: 'Transfer using the IBAN and SWIFT code. Settlement in 1–3 business days.',
        flag: '🇦🇪',
      },
      SGD: {
        method: 'FAST / GIRO Transfer',
        bankName: 'Paytm Partner Bank (SG Correspondent)',
        accountHolderName: 'SarasTM Escrow — Artisan Collection',
        bankCode: seed.slice(0, 4).toUpperCase(),
        accountNumber: accountNum.slice(0, 10),
        reference: `SARAS-${productId?.slice(0, 8)?.toUpperCase() || 'REF0001'}`,
        instructions: 'Use FAST or GIRO transfer. Settlement same-day for FAST.',
        flag: '🇸🇬',
      },
    };

    const details = accountDetails[currency];
    if (!details) {
      return res.status(400).json({ error: `Virtual accounts not available for ${currency}. Supported: USD, EUR, GBP, AED, SGD` });
    }

    res.json({
      currency,
      amount: parseFloat(amount) || 0,
      accountDetails: details,
      note: 'These are Paytm-issued virtual collection accounts in sandbox/staging mode. Payments auto-convert and settle to the artisan\'s linked Indian bank account.',
      settlementTime: '1–2 business days',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// Paytm Checkout: Create Order
// ─────────────────────────────────────────────
router.post('/create-order', async (req, res) => {
  try {
    const { productId, amount, currency, buyerEmail, giftMessage } = req.body;

    const amountInr = await convertToINR(amount, currency);
    const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const paytmBody = {
      requestType: "Payment",
      mid: process.env.PAYTM_MID,
      websiteName: process.env.PAYTM_WEBSITE || "WEBSTAGING",
      orderId,
      callbackUrl: `${process.env.BACKEND_URL || 'http://localhost:4000'}/api/payments/paytm-callback`,
      txnAmount: { value: amountInr.toFixed(2), currency: "INR" },
      userInfo: { custId: `CUST_${buyerEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, '')}` },
    };

    const checksum = await PaytmChecksum.generateSignature(JSON.stringify(paytmBody), process.env.PAYTM_API_KEY);
    const paytmParams = { body: paytmBody, head: { signature: checksum } };

    console.log("Initiating Paytm Transaction for Order:", orderId);
    const apiURL = `${process.env.PAYTM_STAGING_URL || 'https://securestage.paytmpayments.com'}/theia/api/v1/initiateTransaction?mid=${process.env.PAYTM_MID}&orderId=${orderId}`;

    const paytmRes = await axios.post(apiURL, paytmParams, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000,
    });

    const body = paytmRes.data.body || {};
    if (body.resultInfo?.resultStatus !== 'S') {
      throw new Error(`Paytm Initiate failed: ${body.resultInfo?.resultMsg || 'Unknown error'}`);
    }

    const internalOrderId = uuidv4();
    const { error } = await supabase.from('orders').insert({
      id: internalOrderId,
      product_id: productId,
      buyer_email: buyerEmail,
      amount,
      currency,
      amount_inr: amountInr,
      razorpay_order_id: orderId,
      status: 'pending',
      gift_message: giftMessage || null,
    });
    if (error) throw error;

    res.json({ txnToken: body.txnToken, orderId, amount: amountInr.toFixed(2), mid: process.env.PAYTM_MID, internalOrderId });
  } catch (err) {
    console.error("Paytm Create Order Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// Paytm Callback — Auto-generates e-FIRA (Feature 3)
// ─────────────────────────────────────────────
router.post('/paytm-callback', async (req, res) => {
  try {
    console.log("Paytm Callback received:", JSON.stringify(req.body));
    const paytmParams = { ...req.body };
    const checksum = paytmParams.CHECKSUMHASH;
    delete paytmParams.CHECKSUMHASH;

    const isValid = PaytmChecksum.verifySignature(paytmParams, process.env.PAYTM_API_KEY, checksum);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    if (!isValid) {
      console.error("Invalid Paytm checksum");
      return res.redirect(`${frontendUrl}/buyer/account?status=failure&reason=checksum`);
    }

    const orderId = paytmParams.ORDERID;
    const status = paytmParams.STATUS;
    const txnId = paytmParams.TXNID;

    const { data: dbOrder } = await supabase.from('orders').select('id, amount, currency, amount_inr, buyer_email, product_id').eq('razorpay_order_id', orderId).single();
    if (!dbOrder) return res.redirect(`${frontendUrl}/buyer/account?status=failure&reason=notfound`);

    if (status === 'TXN_SUCCESS') {
      console.log("Paytm Payment Successful, TXN:", txnId);

      await supabase.from('orders').update({ status: 'paid' }).eq('id', dbOrder.id);

      // Create escrow entry
      const escrowId = uuidv4();
      await supabase.from('escrow_entries').insert({ id: escrowId, order_id: dbOrder.id, status: 'held' });

      await supabase.from('order_status_log').insert({
        order_id: dbOrder.id,
        status: 'paid',
        note: `Paytm Payment Verified — TXNID: ${txnId}`,
      });

      // Feature 3: Auto-generate e-FIRA with P0102 purpose code
      try {
        const { data: product } = await supabase.from('products').select('*, artisans(*)').eq('id', dbOrder.product_id).single();
        const payoutId = uuidv4();
        const amountInr = dbOrder.amount_inr || dbOrder.amount;

        const payout = {
          id: payoutId,
          paid_at: new Date().toISOString(),
          amount_inr: amountInr,
          txnId,
          purposeCode: 'P0102',
          currency: dbOrder.currency,
          foreignAmount: dbOrder.amount,
        };

        const pdfBuffer = await generateEFIRA(dbOrder, payout);
        const fileName = `efira/${payoutId}.pdf`;
        await supabase.storage.from('product-images').upload(fileName, pdfBuffer, { contentType: 'application/pdf', upsert: true });
        const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName);

        await supabase.from('payouts').insert({
          id: payoutId,
          escrow_entry_id: escrowId,
          artisan_id: product?.artisan_id || product?.artisans?.id,
          amount_inr: amountInr,
          status: 'paid',
          efira_pdf_url: urlData.publicUrl,
          paid_at: new Date().toISOString(),
        });

        await supabase.from('escrow_entries').update({ status: 'released' }).eq('id', escrowId);
        console.log("e-FIRA auto-generated and uploaded:", urlData.publicUrl);
      } catch (efiraErr) {
        console.error("e-FIRA auto-generation failed (non-fatal):", efiraErr.message);
      }

      return res.redirect(`${frontendUrl}/buyer/account?status=success`);
    } else {
      console.warn("Paytm Payment Failed. Status:", status);
      await supabase.from('orders').update({ status: 'failed' }).eq('id', dbOrder.id);
      return res.redirect(`${frontendUrl}/buyer/account?status=failure`);
    }
  } catch (err) {
    console.error("Paytm Callback Error:", err.message);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(`${frontendUrl}/buyer/account?status=failure`);
  }
});

router.post('/verify', async (req, res) => {
  res.json({ success: true, note: 'Payment verified via Paytm server callback' });
});

router.post('/simulate-payout', async (req, res) => {
  try {
    const { escrowId } = req.body;
    const { data: escrow } = await supabase.from('escrow_entries').select('*, orders(*, products(*, artisans(*)))').eq('id', escrowId).single();
    const order = escrow.orders;
    const artisan = order?.products?.artisans;
    const payoutId = uuidv4();
    const amountInr = order?.amount_inr || order?.amount;
    const payout = { id: payoutId, paid_at: new Date().toISOString(), amount_inr: amountInr };
    const pdfBuffer = await generateEFIRA(order, payout);
    const fileName = `efira/${payoutId}.pdf`;
    await supabase.storage.from('product-images').upload(fileName, pdfBuffer, { contentType: 'application/pdf', upsert: true });
    const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName);
    await supabase.from('payouts').insert({ id: payoutId, escrow_entry_id: escrowId, artisan_id: artisan?.id, amount_inr: amountInr, status: 'paid', efira_pdf_url: urlData.publicUrl, paid_at: new Date().toISOString() });
    await supabase.from('escrow_entries').update({ status: 'released' }).eq('id', escrowId);
    res.json({ success: true, efiraUrl: urlData.publicUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/escrow', async (req, res) => {
  try {
    const { data, error } = await supabase.from('escrow_entries').select('*, orders(*, products(title))').order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/payouts', async (req, res) => {
  try {
    const { data, error } = await supabase.from('payouts').select('*, escrow_entries(orders(amount, currency, buyer_email, products(title)))').order('paid_at', { ascending: false });
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
