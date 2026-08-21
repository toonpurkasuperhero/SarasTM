import { Link } from 'react-router-dom';
import Badge from '../ui/Badge';
import useCartStore from '../../store/cartStore';

export default function ProductCard({ product }) {
  const { currency, addItem, items } = useCartStore();
  const inCart = items.some((i) => i.id === product.id);

  const price = currency === 'INR' ? product.price_inr
    : currency === 'USD' ? product.price_usd
    : currency === 'EUR' ? product.price_eur
    : product.price_gbp;

  const symbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };

  const image = product.product_images?.[0]?.enhanced_url
    || product.product_images?.[0]?.raw_url
    || `https://source.unsplash.com/400x300/?indian,craft,${encodeURIComponent(product.craft_type || 'art')}`;

  return (
    <div className="bg-white rounded-card shadow-card hover:shadow-card-hover transition-all duration-200 overflow-hidden group">
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative overflow-hidden h-56">
          <img
            src={image}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {product.craft_type && (
            <div className="absolute top-3 left-3">
              <Badge variant="cyan">{product.craft_type}</Badge>
            </div>
          )}
          {product.passports?.verification_status === 'community_verified' && (
            <div className="absolute top-3 right-3">
              <Badge variant="green">✓ Verified</Badge>
            </div>
          )}
        </div>

        <div className="p-4">
          <p className="text-xs text-gray-400 mb-1">{product.artisans?.region || product.region_label}</p>
          <h3 className="font-semibold text-paytm-navy leading-snug line-clamp-2 mb-2 group-hover:text-paytm-cyan transition-colors">
            {product.title}
          </h3>
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">{product.story_en}</p>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-xl font-bold text-paytm-navy">{symbols[currency]}{Number(price || 0).toLocaleString()}</span>
              <span className="text-xs text-gray-400 ml-1">{currency}</span>
            </div>
            <div className="flex items-center gap-2">
              {product.passports?.qr_url && (
                <Link
                  to={`/passport/${product.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 rounded-lg bg-paytm-bg hover:bg-paytm-cyan/10 transition-colors"
                  title="View Authenticity Passport"
                >
                  <svg className="w-4 h-4 text-paytm-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </Link>
              )}
            </div>
          </div>
        </div>
      </Link>

      <div className="px-4 pb-4">
        <button
          onClick={() => addItem(product)}
          disabled={inCart}
          className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all duration-150 ${
            inCart
              ? 'bg-paytm-green/15 text-paytm-green cursor-default'
              : 'bg-paytm-cyan text-white hover:bg-paytm-cyan-dark active:scale-95'
          }`}
        >
          {inCart ? '✓ Added to Cart' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}
