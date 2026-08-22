import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useCartStore from '../../store/cartStore';
import useAuthStore from '../../store/authStore';
import Button from '../../components/ui/Button';
import { paymentsAPI } from '../../lib/api';
import axios from 'axios';
import toast from 'react-hot-toast';

const PAYTM_MID = import.meta.env.VITE_PAYTM_MID || 'htVxwo06435735153732';
const PAYTM_STAGING_URL = import.meta.env.VITE_PAYTM_STAGING_URL || 'https://securestage.paytmpayments.com';
const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

const CURRENCY_FLAGS = { INR: '🇮🇳', USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧', AED: '🇦🇪', SGD: '🇸🇬', JPY: '🇯🇵', AUD: '🇦🇺' };
const CURRENCY_SYMBOLS = { INR: '₹', USD: '$', EUR: '€', GBP: '£', AED: 'د.إ', SGD: 'S$', JPY: '¥', AUD: 'A$' };

export default function Checkout() {
  const { items, getTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Hydration guard — wait 300ms for Zustand persist to rehydrate from localStorage
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setHydrated(true), 300); return () => clearTimeout(t); }, []);

  const [payTab, setPayTab] = useState('paytm'); // 'paytm' | 'bank'
  const [giftMessage, setGiftMessage] = useState('');
  const [buyerEmail, setBuyerEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [bankLoading, setBankLoading] = useState(false);
  const [bankDetails, setBankDetails] = useState(null);

  // DCC state
  const [dccRates, setDccRates] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState('INR');
  const [dccLoading, setDccLoading] = useState(true);

  // Fetch live DCC rates on mount
  useEffect(() => {
    axios.get(`${API}/api/payments/forex-rates`)
      .then(res => {
        setDccRates(res.data.rates);
        setSelectedCurrency(res.data.detectedCurrency || 'USD');
      })
      .catch(() => {
        // Fallback rates if API fails
        setDccRates({ USD: { displayRate: 0.01183, midRate: 0.012, marginPct: '1.5' } });
        setSelectedCurrency('USD');
      })
      .finally(() => setDccLoading(false));
  }, []);

  const getItemPriceINR = (item) => Number(item.price_inr || 0);

  const convertPrice = (priceINR) => {
    if (selectedCurrency === 'INR') return priceINR;
    if (!dccRates?.[selectedCurrency]) return priceINR;
    return +(priceINR * dccRates[selectedCurrency].displayRate).toFixed(2);
  };

  const getTotalConverted = () => {
    const totalInr = items.reduce((s, item) => s + getItemPriceINR(item), 0);
    return convertPrice(totalInr);
  };

  const sym = CURRENCY_SYMBOLS[selectedCurrency] || selectedCurrency;
  const flag = CURRENCY_FLAGS[selectedCurrency] || '';

  // ── Paytm CheckoutJS loader ──────────────────
  const loadPaytmScript = () =>
    new Promise((resolve) => {
      if (window.Paytm?.CheckoutJS) { resolve(true); return; }
      const existing = document.getElementById('paytm-checkout-js');
      if (existing) existing.remove();
      const script = document.createElement('script');
      script.id = 'paytm-checkout-js';
      script.type = 'application/javascript';
      script.src = `${PAYTM_STAGING_URL}/merchantpgpui/checkoutjs/merchants/${PAYTM_MID}.js`;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
      const start = Date.now();
      const poll = setInterval(() => {
        if (window.Paytm?.CheckoutJS) { clearInterval(poll); resolve(true); }
        else if (Date.now() - start > 10000) { clearInterval(poll); resolve(false); }
      }, 200);
      script.onerror = () => { clearInterval(poll); resolve(false); };
    });

  // ── Paytm Payment ────────────────────────────
  const handlePaytm = async () => {
    if (!buyerEmail) { toast.error('Please enter your email'); return; }
    setLoading(true);
    try {
      const loaded = await loadPaytmScript();
      if (!loaded) { toast.error('Paytm gateway failed to load. Please try again.'); return; }

      for (const item of items) {
        const totalInr = getItemPriceINR(item);
        const res = await paymentsAPI.createOrder({
          productId: item.id,
          amount: totalInr,
          currency: 'INR',
          buyerEmail,
          giftMessage,
        });

        const { txnToken, orderId, amount } = res.data;

        await new Promise((resolve, reject) => {
          const config = {
            root: '',
            style: { bodyBackgroundColor: '#fafafb', themeBackgroundColor: '#00BAF2', themeColor: '#ffffff', headerBackgroundColor: '#1a2e44', headerColor: '#ffffff' },
            data: { orderId, token: txnToken, tokenType: 'TXN_TOKEN', amount },
            payMode: { labels: {}, filter: { exclude: [] }, order: ['CC', 'DC', 'NB', 'UPI', 'PPBL', 'PPI', 'BALANCE'] },
            website: 'WEBSTAGING',
            flow: 'DEFAULT',
            merchant: { mid: PAYTM_MID, redirect: false },
            handler: {
              transactionStatus: (ps) => {
                window.Paytm.CheckoutJS.close();
                if (ps.STATUS === 'TXN_SUCCESS') { clearCart(); toast.success('Payment successful!'); navigate('/buyer/account?status=success'); resolve(); }
                else { toast.error(`Payment failed: ${ps.RESPMSG || 'Declined'}`); reject(new Error('failed')); }
              },
              notifyMerchant: (ev) => { if (ev === 'SESSION_EXPIRED') { toast.error('Session expired'); reject(new Error('expired')); } },
            },
          };
          window.Paytm.CheckoutJS.init(config)
            .then(() => window.Paytm.CheckoutJS.invoke())
            .catch((err) => reject(new Error(`Gateway error: ${err?.message || err}`)));
        });
      }
    } catch (err) {
      if (err.message !== 'failed' && err.message !== 'expired') toast.error(err.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  // ── Virtual Bank Transfer ────────────────────
  const handleFetchBankDetails = async () => {
    if (!buyerEmail) { toast.error('Please enter your email first'); return; }
    setBankLoading(true);
    try {
      const res = await axios.get(`${API}/api/payments/virtual-account`, {
        params: { currency: selectedCurrency, productId: items[0]?.id, amount: getTotalConverted() }
      });
      setBankDetails(res.data);
    } catch (err) {
      toast.error('Could not load virtual account. Try USD, EUR, GBP, AED, or SGD.');
    } finally {
      setBankLoading(false);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(() => toast.success(`${label} copied!`));
  };

  if (!hydrated) return <div className="page-container py-20 text-center text-gray-400">Loading cart...</div>;
  if (items.length === 0) { navigate('/store'); return null; }

  const totalInr = items.reduce((s, item) => s + getItemPriceINR(item), 0);
  const totalConverted = getTotalConverted();
  const liveRate = dccRates?.[selectedCurrency];

  return (
    <div className="page-container py-8 max-w-3xl mx-auto space-y-6">
      <h1 className="section-title">Checkout</h1>

      {/* ── DCC Currency Selector ─────────────────── */}
      <div className="card space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-paytm-navy flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">currency_exchange</span>
            Dynamic Currency Conversion
          </h2>
          {dccLoading && <span className="text-xs text-gray-400 animate-pulse">Fetching live rates...</span>}
          {liveRate && !dccLoading && (
            <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-1 rounded-full font-semibold">
              Live Rate • {liveRate.marginPct}% margin included
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD', 'JPY', 'AUD'].map(cur => (
            <button
              key={cur}
              onClick={() => { setSelectedCurrency(cur); setBankDetails(null); }}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition-all ${selectedCurrency === cur ? 'bg-paytm-navy text-white border-paytm-navy' : 'bg-white text-gray-600 border-gray-200 hover:border-paytm-navy'}`}
            >
              {CURRENCY_FLAGS[cur]} {cur}
            </button>
          ))}
        </div>
        {liveRate && selectedCurrency !== 'INR' && (
          <p className="text-xs text-gray-500">
            Interbank mid-rate: 1 INR = {liveRate.midRate.toFixed(6)} {selectedCurrency} &nbsp;|&nbsp; Your display rate (with 1.5% margin): 1 INR = {liveRate.displayRate.toFixed(6)} {selectedCurrency}
          </p>
        )}
      </div>

      {/* ── Order Items ───────────────────────────── */}
      <div className="card space-y-4">
        <h2 className="font-bold text-paytm-navy">Order Details</h2>
        {items.map((item) => {
          const priceInr = getItemPriceINR(item);
          const priceConverted = convertPrice(priceInr);
          return (
            <div key={item.id} className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
              <img src={item.product_images?.[0]?.enhanced_url || item.product_images?.[0]?.raw_url} alt={item.title} className="w-14 h-14 object-cover rounded-lg" />
              <div className="flex-1">
                <p className="font-medium text-paytm-navy text-sm">{item.title}</p>
                <p className="text-xs text-gray-400">{item.craft_type}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-paytm-navy">{sym}{priceConverted.toLocaleString()}</p>
                {selectedCurrency !== 'INR' && <p className="text-xs text-gray-400">₹{priceInr.toLocaleString()} INR</p>}
              </div>
            </div>
          );
        })}
        <div className="flex justify-between pt-2 border-t border-gray-100">
          <span className="font-bold text-paytm-navy">Total</span>
          <div className="text-right">
            <span className="text-2xl font-extrabold text-paytm-navy">{flag} {sym}{totalConverted.toLocaleString()} {selectedCurrency}</span>
            {selectedCurrency !== 'INR' && <p className="text-xs text-gray-400 mt-1">≈ ₹{totalInr.toLocaleString()} INR (settlement amount)</p>}
          </div>
        </div>
      </div>

      {/* ── Contact ───────────────────────────────── */}
      <div className="card space-y-4">
        <h2 className="font-bold text-paytm-navy">Contact</h2>
        <input type="email" value={buyerEmail} onChange={(e) => setBuyerEmail(e.target.value)} placeholder="Your email address" className="input-field" />
      </div>

      {/* ── Gift Message ──────────────────────────── */}
      <div className="card space-y-3">
        <h2 className="font-bold text-paytm-navy">Gift Message (optional)</h2>
        <textarea value={giftMessage} onChange={(e) => setGiftMessage(e.target.value)} placeholder="I love the craftsmanship — please keep creating!" rows={3} className="input-field resize-none" maxLength={200} />
        <p className="text-xs text-gray-400 text-right">{giftMessage.length}/200</p>
      </div>

      {/* ── Payment Method Tabs ───────────────────── */}
      <div className="card space-y-4">
        <h2 className="font-bold text-paytm-navy">Payment Method</h2>
        <div className="flex rounded-xl overflow-hidden border border-gray-200">
          <button onClick={() => setPayTab('paytm')} className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${payTab === 'paytm' ? 'bg-paytm-navy text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
            <span className="material-symbols-outlined text-[18px]">credit_card</span> Paytm Gateway
          </button>
          <button onClick={() => { setPayTab('bank'); setBankDetails(null); }} className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 border-l border-gray-200 transition-colors ${payTab === 'bank' ? 'bg-paytm-navy text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
            <span className="material-symbols-outlined text-[18px]">account_balance</span> Bank Transfer
          </button>
        </div>

        {/* Paytm Tab */}
        {payTab === 'paytm' && (
          <div className="space-y-3">
            <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 flex items-center gap-3">
              <span className="text-blue-500 material-symbols-outlined">lock</span>
              <p className="text-sm text-blue-700">Secure Paytm Staging Gateway. Supports UPI, Cards, Net Banking & Wallets.</p>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
              <p className="text-xs text-amber-700 font-semibold">Payment is always settled in INR. Your selected currency is for display only. The INR equivalent (₹{totalInr.toLocaleString()}) is charged.</p>
            </div>
            <Button onClick={handlePaytm} disabled={loading} size="lg" className="w-full">
              {loading ? 'Opening Paytm...' : `Pay ₹${totalInr.toLocaleString()} via Paytm`}
            </Button>
          </div>
        )}

        {/* Bank Transfer Tab */}
        {payTab === 'bank' && (
          <div className="space-y-4">
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg px-4 py-3">
              <p className="text-sm text-indigo-700 font-semibold">Virtual Multi-Currency Collection Account</p>
              <p className="text-xs text-indigo-600 mt-1">Paytm issues a virtual {selectedCurrency} account on behalf of the merchant. Your domestic bank transfer auto-converts and settles to INR within 1–2 business days.</p>
            </div>

            {['USD', 'EUR', 'GBP', 'AED', 'SGD'].includes(selectedCurrency) ? (
              <>
                {!bankDetails ? (
                  <Button onClick={handleFetchBankDetails} disabled={bankLoading} size="lg" className="w-full" variant="secondary">
                    {bankLoading ? 'Loading account details...' : `Get ${selectedCurrency} Virtual Account Details`}
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-white border border-outline-variant rounded-xl p-4 space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{bankDetails.accountDetails.flag}</span>
                        <div>
                          <p className="font-bold text-paytm-navy text-sm">{bankDetails.accountDetails.method}</p>
                          <p className="text-xs text-gray-500">{bankDetails.accountDetails.bankName}</p>
                        </div>
                        <span className="ml-auto bg-green-50 text-green-700 text-xs font-semibold px-2 py-1 rounded-full border border-green-200">Paytm Issued</span>
                      </div>

                      {Object.entries(bankDetails.accountDetails)
                        .filter(([k]) => !['method', 'bankName', 'flag', 'instructions'].includes(k))
                        .map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                            <div>
                              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                              <p className="text-sm font-mono font-semibold text-paytm-navy">{value}</p>
                            </div>
                            <button onClick={() => copyToClipboard(value, key)} className="p-1.5 text-gray-400 hover:text-paytm-navy rounded-lg hover:bg-gray-100 transition-colors">
                              <span className="material-symbols-outlined text-[18px]">content_copy</span>
                            </button>
                          </div>
                        ))}

                      <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 mt-2">
                        <p className="text-xs text-amber-700">{bankDetails.accountDetails.instructions}</p>
                      </div>

                      <div className="border-t border-gray-100 pt-3 flex justify-between text-sm">
                        <span className="text-gray-500">Amount to Transfer:</span>
                        <span className="font-bold text-paytm-navy">{sym}{totalConverted.toLocaleString()} {selectedCurrency}</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Settlement:</span>
                        <span>{bankDetails.settlementTime}</span>
                      </div>
                    </div>

                    <div className="bg-surface-container border border-outline-variant rounded-lg p-3 flex items-start gap-2">
                      <span className="material-symbols-outlined text-action-cyan text-[18px] flex-shrink-0 mt-0.5">info</span>
                      <p className="text-xs text-on-surface-variant">After completing your bank transfer, an e-FIRA with RBI Purpose Code P0102 will be automatically generated and available in your Payout Ledger within 2 business days.</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600">Virtual bank accounts are available for <span className="font-semibold">USD, EUR, GBP, AED, SGD</span>.</p>
                <p className="text-xs text-gray-400 mt-1">Please select one of these currencies above.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Escrow Notice ─────────────────────────── */}
      <div className="card bg-paytm-cyan/5 border border-paytm-cyan/20">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🔒</span>
          <div>
            <p className="font-semibold text-paytm-navy">Secure Escrow + Auto e-FIRA</p>
            <p className="text-sm text-gray-500 mt-1">Funds are held in escrow and released only after delivery. An e-FIRA with RBI Purpose Code P0102 is auto-generated on settlement.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
