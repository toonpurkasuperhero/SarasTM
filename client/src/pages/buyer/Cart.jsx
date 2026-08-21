import { Link } from 'react-router-dom';
import useCartStore from '../../store/cartStore';
import Button from '../../components/ui/Button';
import CurrencySelector from '../../components/buyer/CurrencySelector';

export default function Cart() {
  const { items, currency, removeItem, getTotal } = useCartStore();
  const symbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };

  const getPrice = (item) => {
    if (currency === 'INR') return item.price_inr;
    if (currency === 'USD') return item.price_usd;
    if (currency === 'EUR') return item.price_eur;
    return item.price_gbp;
  };

  return (
    <div className="page-container py-8 max-w-3xl mx-auto">
      <h1 className="section-title mb-6">Your Cart</h1>

      {items.length === 0 && (
        <div className="text-center py-24">
          <p className="text-6xl mb-4">🛒</p>
          <p className="text-gray-400 text-lg">Your cart is empty</p>
          <Link to="/store" className="btn-primary inline-block mt-6">
            Explore Crafts
          </Link>
        </div>
      )}

      {items.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="card flex gap-4">
                <Link to={`/product/${item.id}`}>
                  <img
                    src={item.product_images?.[0]?.enhanced_url || item.product_images?.[0]?.raw_url}
                    alt={item.title}
                    className="w-24 h-24 object-cover rounded-xl flex-shrink-0"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${item.id}`}>
                    <h3 className="font-semibold text-paytm-navy hover:text-paytm-cyan transition-colors line-clamp-2">{item.title}</h3>
                  </Link>
                  <p className="text-sm text-gray-400 mt-0.5">{item.craft_type} · {item.region_label}</p>
                  <p className="font-bold text-paytm-navy mt-2">
                    {symbols[currency]}{Number(getPrice(item) || 0).toLocaleString()} {currency}
                  </p>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="p-2 text-gray-300 hover:text-red-500 transition-colors self-start"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="card">
              <h2 className="font-bold text-paytm-navy mb-4">Order Summary</h2>
              <div className="flex justify-between mb-1">
                <span className="text-gray-500">Items ({items.length})</span>
                <span className="font-semibold text-paytm-navy">{symbols[currency]}{Number(getTotal()).toLocaleString()}</span>
              </div>
              <div className="flex justify-between mb-4">
                <span className="text-gray-500">Shipping</span>
                <span className="text-paytm-green font-medium">Calculated at checkout</span>
              </div>
              <div className="border-t border-gray-100 pt-4 flex justify-between mb-6">
                <span className="font-bold text-paytm-navy">Total</span>
                <div className="text-right">
                  <div className="text-2xl font-extrabold text-paytm-navy">{symbols[currency]}{Number(getTotal()).toLocaleString()}</div>
                  <div className="text-xs text-gray-400">{currency}</div>
                </div>
              </div>
              <Link to="/checkout">
                <Button size="lg" className="w-full">Proceed to Checkout</Button>
              </Link>
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-paytm-navy">Display Currency</span>
              </div>
              <CurrencySelector />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
