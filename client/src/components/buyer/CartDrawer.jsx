import { Link } from 'react-router-dom';
import useCartStore from '../../store/cartStore';
import Button from '../ui/Button';

export default function CartDrawer({ open, onClose }) {
  const { items, currency, removeItem, getTotal } = useCartStore();
  const symbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };

  const getPrice = (item) => {
    if (currency === 'INR') return item.price_inr;
    if (currency === 'USD') return item.price_usd;
    if (currency === 'EUR') return item.price_eur;
    return item.price_gbp;
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-50 bg-paytm-navy/40 backdrop-blur-sm"
          onClick={onClose}
        />
      )}
      <div
        className={`fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm bg-white shadow-2xl transform transition-transform duration-300 flex flex-col ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-paytm-navy">Your Cart</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-paytm-bg text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🛒</div>
              <p className="text-gray-400">Your cart is empty</p>
              <p className="text-sm text-gray-400 mt-1">Discover beautiful Indian crafts</p>
            </div>
          )}
          {items.map((item) => {
            const itemImg = item.image ||
              item.image_url ||
              item.imageUrl ||
              item.enhanced_url ||
              item.raw_url ||
              item.product_images?.[0]?.enhanced_url ||
              item.product_images?.[0]?.raw_url ||
              (typeof item.product_images?.[0] === 'string' ? item.product_images[0] : null);

            return (
              <div key={item.id} className="flex gap-3 bg-paytm-bg rounded-xl p-3">
                {itemImg && (
                  <img
                    src={itemImg}
                    alt={item.title}
                    className="w-16 h-16 object-cover rounded-lg flex-shrink-0 bg-gray-100"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const fallback = e.target.nextElementSibling;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                )}
                <div
                  className="w-16 h-16 rounded-lg bg-paytm-cyan/10 text-paytm-navy items-center justify-center font-bold text-xl flex-shrink-0"
                  style={{ display: itemImg ? 'none' : 'flex' }}
                >
                  🎨
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-paytm-navy text-sm line-clamp-2">{item.title}</p>
                  <p className="text-paytm-cyan font-bold mt-1">
                    {symbols[currency]}{Number(getPrice(item) || 0).toLocaleString()} {currency}
                  </p>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-gray-100 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Total</span>
              <span className="text-2xl font-bold text-paytm-navy">
                {symbols[currency]}{Number(getTotal()).toLocaleString()} {currency}
              </span>
            </div>
            <Link to="/checkout" onClick={onClose}>
              <Button className="w-full" size="lg">Proceed to Checkout</Button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
