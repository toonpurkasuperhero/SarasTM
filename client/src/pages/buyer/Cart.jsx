import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useCartStore from '../../store/cartStore';

const SYMBOLS = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };

export default function Cart() {
  const navigate = useNavigate();
  const { items, removeItem, updateQty, clearCart } = useCartStore();

  const total = items.reduce((s, item) => {
    const cur = item.selectedCurrency || 'INR';
    const priceKey = `price_${cur.toLowerCase()}`;
    const price = item[priceKey] || item.price_inr || 0;
    return s + price * item.quantity;
  }, 0);

  const currency = items[0]?.selectedCurrency || 'INR';
  const sym = SYMBOLS[currency] || '₹';

  if (items.length === 0) return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center text-center px-4">
      <span className="material-symbols-outlined text-on-surface-variant mb-4" style={{ fontSize: '80px' }}>shopping_bag</span>
      <h2 className="font-hanken text-primary mb-3" style={{ fontSize: '32px', fontWeight: '600' }}>Your cart is empty</h2>
      <p className="text-on-surface-variant mb-8" style={{ fontFamily: 'Inter', fontSize: '18px' }}>Discover authentic Indian crafts from our artisans</p>
      <Link to="/store" className="bg-trust-blue text-on-primary px-8 py-3 rounded-lg hover:bg-primary transition-colors font-hanken" style={{ fontSize: '18px', fontWeight: '600', textDecoration: 'none' }}>
        Browse Marketplace
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface" style={{ padding: '40px 64px' }}>
      <div className="max-w-container-max mx-auto">
        <h1 className="font-hanken text-primary mb-8" style={{ fontSize: '48px', lineHeight: '56px', fontWeight: '700', letterSpacing: '-0.02em' }}>Your Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {items.map((item) => {
              const cur = item.selectedCurrency || 'INR';
              const priceKey = `price_${cur.toLowerCase()}`;
              const price = item[priceKey] || item.price_inr || 0;
              const img = item.image ||
                item.image_url ||
                item.imageUrl ||
                item.enhanced_url ||
                item.raw_url ||
                item.product_images?.[0]?.enhanced_url ||
                item.product_images?.[0]?.raw_url ||
                (typeof item.product_images?.[0] === 'string' ? item.product_images[0] : null);

              return (
                <div key={item.id} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex gap-5 items-start hover:border-action-cyan transition-colors">
                  <div className="w-24 h-24 rounded-lg overflow-hidden bg-surface-container flex-shrink-0 relative">
                    {img && (
                      <img
                        src={img}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const fallback = e.target.nextElementSibling;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    )}
                    <div
                      className="w-full h-full flex items-center justify-center bg-paytm-cyan/10"
                      style={{ display: img ? 'none' : 'flex' }}
                    >
                      <span className="material-symbols-outlined text-action-cyan" style={{ fontSize: '36px' }}>palette</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    {item.craft_type && <p className="text-action-cyan uppercase tracking-wider mb-1" style={{ fontFamily: 'Inter', fontSize: '11px', fontWeight: '600' }}>{item.craft_type}</p>}
                    <h3 className="font-hanken text-primary font-semibold mb-1 truncate" style={{ fontSize: '18px' }}>{item.title}</h3>
                    {item.artisans?.name && <p className="text-on-surface-variant mb-3" style={{ fontFamily: 'Inter', fontSize: '13px' }}>by {item.artisans.name}</p>}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQty(item.id, item.quantity - 1)} className="w-8 h-8 rounded border border-outline-variant flex items-center justify-center text-on-surface hover:border-action-cyan transition-colors" style={{ fontSize: '16px' }}>−</button>
                        <span className="font-semibold text-on-surface" style={{ fontFamily: 'Inter', fontSize: '15px', minWidth: '24px', textAlign: 'center' }}>{item.quantity}</span>
                        <button onClick={() => updateQty(item.id, item.quantity + 1)} className="w-8 h-8 rounded border border-outline-variant flex items-center justify-center text-on-surface hover:border-action-cyan transition-colors" style={{ fontSize: '16px' }}>+</button>
                      </div>
                      <p className="font-hanken text-primary font-bold" style={{ fontSize: '20px' }}>{SYMBOLS[cur]}{(price * item.quantity).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="text-on-surface-variant hover:text-heritage-red transition-colors flex-shrink-0">
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>delete</span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 sticky top-24">
              <h2 className="font-hanken text-primary mb-4" style={{ fontSize: '20px', fontWeight: '600' }}>Order Summary</h2>
              <div className="flex flex-col gap-3 mb-5">
                <div className="flex justify-between text-on-surface-variant" style={{ fontFamily: 'Inter', fontSize: '15px' }}>
                  <span>Subtotal ({items.length} item{items.length !== 1 ? 's' : ''})</span>
                  <span className="font-semibold text-on-surface">{sym}{total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant" style={{ fontFamily: 'Inter', fontSize: '15px' }}>
                  <span>Escrow Protection</span><span className="text-green-600 font-semibold">Included</span>
                </div>
                <div className="border-t border-outline-variant pt-3 flex justify-between font-bold text-on-surface" style={{ fontFamily: 'Hanken Grotesk', fontSize: '18px' }}>
                  <span>Total</span>
                  <span>{sym}{total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                </div>
              </div>
              <button onClick={() => navigate('/checkout')}
                className="w-full bg-trust-blue text-on-primary py-4 rounded-lg hover:bg-primary transition-colors font-hanken font-semibold flex items-center justify-center gap-2 shadow-sm"
                style={{ fontSize: '18px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>lock</span>
                Secure Checkout
              </button>
              <p className="text-on-surface-variant text-center mt-3" style={{ fontFamily: 'Inter', fontSize: '12px' }}>Funds held in escrow until delivery confirmed</p>
              <div className="mt-4 pt-4 border-t border-outline-variant">
                <div className="flex items-center gap-2 text-on-surface-variant justify-center" style={{ fontFamily: 'Inter', fontSize: '12px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>verified</span>
                  All items verified authentic by Saras AI
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
