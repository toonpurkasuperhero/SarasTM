import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useCartStore from '../../store/cartStore';
import useAuthStore from '../../store/authStore';
import Button from '../../components/ui/Button';
import { paymentsAPI } from '../../lib/api';
import toast from 'react-hot-toast';

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

  const loadRazorpay = () =>
    new Promise((resolve) => {
      if (window.Razorpay) { resolve(true); return; }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handleCheckout = async () => {
    if (!buyerEmail) { toast.error('Please enter your email'); return; }
    setLoading(true);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) { toast.error('Payment gateway failed to load'); return; }

      for (const item of items) {
        const res = await paymentsAPI.createOrder({
          productId: item.id,
          amount: getItemPrice(item),
          currency,
          buyerEmail,
          giftMessage,
        });

        const { razorpayOrderId, amount: orderAmount, currency: orderCurrency, orderId } = res.data;

        await new Promise((resolve, reject) => {
          const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: orderAmount,
            currency: orderCurrency,
            name: 'SarasTM',
            description: item.title,
            order_id: razorpayOrderId,
            theme: { color: '#00BAF2' },
            prefill: { email: buyerEmail },
            handler: async (response) => {
              try {
                await paymentsAPI.verify({
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                  orderId,
                });
                resolve();
              } catch {
                reject(new Error('Payment verification failed'));
              }
            },
            modal: { ondismiss: () => reject(new Error('Payment cancelled')) },
          };
          const rzp = new window.Razorpay(options);
          rzp.open();
        });
      }

      clearCart();
      toast.success('Order placed successfully!');
      navigate('/account');
    } catch (err) {
      if (err.message !== 'Payment cancelled') {
        toast.error(err.message || 'Checkout failed');
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

      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-2">
        <span className="text-amber-500 font-bold">🧪</span>
        <p className="text-sm font-semibold text-amber-700">TEST MODE — No real money moves. Use test card: 4111 1111 1111 1111</p>
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
        {loading ? 'Processing...' : `Pay ${symbols[currency]}${Number(getTotal()).toLocaleString()} ${currency}`}
      </Button>
    </div>
  );
}
