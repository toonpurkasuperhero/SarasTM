const axios = require('axios');

let ratesCache = { rates: null, fetchedAt: null };

async function getRates() {
  const now = Date.now();
  if (ratesCache.rates && ratesCache.fetchedAt && (now - ratesCache.fetchedAt) < 6 * 60 * 60 * 1000) {
    return ratesCache.rates;
  }

  const res = await axios.get('https://api.frankfurter.app/latest?from=INR&to=USD,EUR,GBP');
  ratesCache = { rates: res.data.rates, fetchedAt: now };
  return res.data.rates;
}

async function convertFromINR(amountINR, toCurrency) {
  if (toCurrency === 'INR') return amountINR;
  const rates = await getRates();
  const rate = rates[toCurrency];
  if (!rate) return null;
  return Math.round(amountINR * rate * 100) / 100;
}

async function convertToINR(amount, fromCurrency) {
  if (fromCurrency === 'INR') return amount;
  const rates = await getRates();
  const rate = rates[fromCurrency];
  if (!rate) return amount;
  return Math.round((amount / rate) * 100) / 100;
}

module.exports = { getRates, convertFromINR, convertToINR };
