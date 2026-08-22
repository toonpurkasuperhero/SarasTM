import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useCartStore from '../../store/cartStore';
import useAuthStore from '../../store/authStore';
import Button from '../../components/ui/Button';
import { paymentsAPI } from '../../lib/api';
import toast from 'react-hot-toast';

const PAYTM_MID = import.meta.env.VITE_PAYTM_MID || 'htVxwo06435735153732';
const PAYTM_STAGING_URL = import.meta.env.VITE_PAYTM_STAGING_URL || 'https://securestage.paytmpayments.com';

export default function Checkout() {
  const { items, currency, getTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [giftMessage, setGiftMessage] = useState('');
  const [buyerEmail, setBuyerEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);

  const symbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };

  const getItemPrice = (item) => {
    if (currency === 'INR') return item.price_inr;
    if (currency === 'USD') return item.price_usd;
    if (currency === 'EUR') return item.price_eur;
    return item.price_gbp;
  };

  const loadPaytmScript = () =>
    new Promise((resolve) => {
      // Already loaded
      if (window.Paytm?.CheckoutJS) { resolve(true); return; }

      const existing = document.getElementById('paytm-checkout-js');
      if (existing) existing.remove();

      const script = document.createElement('script');
      script.id = 'paytm-checkout-js';
      script.type = 'application/javascript';
      script.src = `${PAYTM_STAGING_URL}/merchantpgpui/checkoutjs/merchants/${PAYTM_MID}.js`;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);

      // Poll for CheckoutJS to become available (onLoad is unreliable on Paytm Blink SDK)
      const start = Date.now();
      const poll = setInterval(() => {
        if (window.Paytm?.CheckoutJS) {
          clearInterval(poll);
          resolve(true);
        } else if (Date.now() - start > 10000) {
          clearInterval(poll);
          resolve(false); // Timed out after 10s
        }
      }, 200);

      script.onerror = () => { clearInterval(poll); resolve(false); };
    });

  const handleCheckout = async () => {
    if (!buyerEmail) { toast.error('Please enter your email'); return; }
    setLoading(true);

    try {
      const loaded = await loadPaytmScript();
      if (!loaded) {
        toast.error('Paytm payment gateway failed to load. Please try again.');
        return;
      }

      // Process each cart item
      for (const item of items) {
        const res = await paymentsAPI.createOrder({
          productId: item.id,
          amount: getItemPrice(item),
          currency,
          buyerEmail,
          giftMessage,
        });

        const { txnToken, orderId, amount } = res.data;

        await new Promise((resolve, reject) => {
          const config = {
            root: '',
            style: {
              bodyBackgroundColor: '#fafafb',
              themeBackgroundColor: '#00BAF2',
              themeColor: '#ffffff',
              headerBackgroundColor: '#1a2e44',
              headerColor: '#ffffff',
            },
            data: {
              orderId,
              token: txnToken,
              tokenType: 'TXN_TOKEN',
              amount,
            },
            payMode: {
              labels: {},
              filter: { exclude: [] },
              order: ['CC', 'DC', 'NB', 'UPI', 'PPBL', 'PPI', 'BALANCE'],
            },
            website: 'WEBSTAGING',
            flow: 'DEFAULT',
            merchant: { mid: PAYTM_MID, redirect: false },
            handler: {
              transactionStatus: (paymentStatus) => {
                console.log('Paytm Transaction Status:', paymentStatus);
                window.Paytm.CheckoutJS.close();
                if (paymentStatus.STATUS === 'TXN_SUCCESS') {
                  clearCart();
                  toast.success('Payment successful! Your order has been placed.');
                  navigate('/buyer/account?status=success');
                  resolve();
                } else {
                  toast.error(`Payment failed: ${paymentStatus.RESPMSG || 'Transaction declined'}`);
                  reject(new Error('Payment failed'));
                }
              },
              notifyMerchant: (eventName) => {
                if (eventName === 'SESSION_EXPIRED') {
                  toast.error('Payment session expired. Please try again.');
                  reject(new Error('Session expired'));
                }
              },
            },
          };

          // Directly call init — do not rely on onLoad (unreliable on Paytm Blink SDK)
          window.Paytm.CheckoutJS.init(config)
            .then(() => window.Paytm.CheckoutJS.invoke())
            .catch((err) => {
              console.error('Paytm CheckoutJS init error:', err);
              reject(new Error(`Paytm gateway error: ${err?.message || err}`));
            });
        });
      }
    } catch (err) {
      if (err.message !== 'Payment cancelled') {
        toast.error(err.message || 'Checkout failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    navigate('/store');
    return null;
  }

  return (
    <div className="page-container py-8 max-w-2xl mx-auto space-y-6">
      <h1 className="section-title">Checkout</h1>

      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center gap-3">
        <img src="https://cdn.razorpay.com/static/assets/logo/paytm.svg" alt="Paytm" className="h-6 object-contain" onError={(e) => { e.target.style.display='none'; }} />
        <p className="text-sm font-semibold text-blue-700">Paytm Staging — Secure payment powered by Paytm Gateway</p>
      </div>

      <div className="card space-y-4">
        <h2 className="font-bold text-paytm-navy">Order Details</h2>
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
            <img
              src={item.product_images?.[0]?.enhanced_url || item.product_images?.[0]?.raw_url}
              alt={item.title}
              className="w-14 h-14 object-cover rounded-lg"
            />
            <div className="flex-1">
              <p className="font-medium text-paytm-navy text-sm">{item.title}</p>
              <p className="text-xs text-gray-400">{item.craft_type}</p>
            </div>
            <span className="font-bold text-paytm-navy">
              {symbols[currency]}{Number(getItemPrice(item) || 0).toLocaleString()}
            </span>
          </div>
        ))}
        <div className="flex justify-between pt-2">
          <span className="font-bold text-paytm-navy">Total</span>
          <span className="text-2xl font-extrabold text-paytm-navy">
            {symbols[currency]}{Number(getTotal()).toLocaleString()} {currency}
          </span>
        </div>
      </div>

      <div className="card space-y-4">
        <h2 className="font-bold text-paytm-navy">Contact</h2>
        <input
          type="email"
          value={buyerEmail}
          onChange={(e) => setBuyerEmail(e.target.value)}
          placeholder="Your email address"
          className="input-field"
        />
      </div>

      <div className="card space-y-3">
        <h2 className="font-bold text-paytm-navy">Gift Message (optional)</h2>
        <p className="text-sm text-gray-400">Send a personal note to the artisan</p>
        <textarea
          value={giftMessage}
          onChange={(e) => setGiftMessage(e.target.value)}
          placeholder="I love the craftsmanship — please keep creating!"
          rows={3}
          className="input-field resize-none"
          maxLength={200}
        />
        <p className="text-xs text-gray-400 text-right">{giftMessage.length}/200</p>
      </div>

      <div className="card bg-paytm-cyan/5 border border-paytm-cyan/20">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🔒</span>
          <div>
            <p className="font-semibold text-paytm-navy">Secure Escrow Payment</p>
            <p className="text-sm text-gray-500 mt-1">
              Funds are held in escrow and released to the artisan only after shipment is confirmed. You're protected throughout.
            </p>
          </div>
        </div>
      </div>

      <Button onClick={handleCheckout} disabled={loading} size="lg" className="w-full">
        {loading ? 'Opening Paytm...' : `Pay ${symbols[currency]}${Number(getTotal()).toLocaleString()} ${currency} via Paytm`}
      </Button>
    </div>
  );
}
