const axios = require('axios');

// Cache rates for 1 hour
let ratesCache = { rates: null, fetchedAt: null };

const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'AED', 'SGD', 'JPY', 'AUD'];
const DCC_MARGIN = 0.015; // 1.5% margin on interbank mid-market rate

async function getRates() {
  const now = Date.now();
  if (ratesCache.rates && ratesCache.fetchedAt && (now - ratesCache.fetchedAt) < 60 * 60 * 1000) {
    return ratesCache.rates;
  }

  try {
    const res = await axios.get(
      `https://api.frankfurter.app/latest?from=INR&to=USD,EUR,GBP,SGD,JPY,AUD`,
      { timeout: 8000 }
    );
    const rates = res.data.rates || {};
    if (rates.USD && !rates.AED) {
      rates.AED = +(rates.USD * 3.6725).toFixed(6);
    }
    ratesCache = { rates, fetchedAt: now };
    return rates;
  } catch (err) {
    // Fallback to last cached rates, or hardcoded fallback
    if (ratesCache.rates) return ratesCache.rates;
    console.warn('[Forex] API unavailable, using fallback rates');
    return { USD: 0.01200, EUR: 0.01103, GBP: 0.00944, AED: 0.04408, SGD: 0.01620, JPY: 1.8120, AUD: 0.01850 };
  }
}

// Interbank mid-market rate (no margin) — used for INR settlement
async function convertFromINR(amountINR, toCurrency) {
  if (toCurrency === 'INR') return amountINR;
  const rates = await getRates();
  const rate = rates[toCurrency];
  if (!rate) return null;
  return Math.round(amountINR * rate * 100) / 100;
}

// Interbank mid-market rate — used for server-side INR conversion
async function convertToINR(amount, fromCurrency) {
  if (fromCurrency === 'INR') return amount;
  const rates = await getRates();
  const rate = rates[fromCurrency];
  if (!rate) return amount;
  return Math.round((amount / rate) * 100) / 100;
}

// DCC display rate WITH margin (what buyer sees). Returns: { rate, displayRate, margin, currency }
async function getDCCRate(toCurrency) {
  const rates = await getRates();
  const midRate = rates[toCurrency];
  if (!midRate) return null;
  const displayRate = midRate * (1 - DCC_MARGIN); // Slightly less per INR = buyer pays slightly more
  return {
    midRate,
    displayRate,
    marginPct: (DCC_MARGIN * 100).toFixed(1),
    currency: toCurrency,
  };
}

// Get all DCC rates for buyer display
async function getAllDCCRates() {
  const rates = await getRates();
  const result = {};
  for (const cur of SUPPORTED_CURRENCIES) {
    const midRate = rates[cur];
    if (midRate) {
      result[cur] = {
        midRate,
        displayRate: +(midRate * (1 - DCC_MARGIN)).toFixed(6),
        marginPct: (DCC_MARGIN * 100).toFixed(1),
      };
    }
  }
  return result;
}

// Detect likely currency from Accept-Language header
function detectCurrencyFromLocale(acceptLanguage) {
  if (!acceptLanguage) return 'USD';
  const lang = acceptLanguage.toLowerCase();
  if (lang.includes('en-gb') || lang.includes('en_gb')) return 'GBP';
  if (lang.includes('en-au') || lang.includes('en_au')) return 'AUD';
  if (lang.includes('ar') || lang.includes('ae')) return 'AED';
  if (lang.includes('de') || lang.includes('fr') || lang.includes('it') || lang.includes('es') || lang.includes('nl')) return 'EUR';
  if (lang.includes('ja')) return 'JPY';
  if (lang.includes('zh') || lang.includes('sg')) return 'SGD';
  if (lang.includes('hi') || lang.includes('en-in')) return 'INR';
  return 'USD'; // Default for en-us and others
}

module.exports = { getRates, convertFromINR, convertToINR, getDCCRate, getAllDCCRates, detectCurrencyFromLocale, SUPPORTED_CURRENCIES };
