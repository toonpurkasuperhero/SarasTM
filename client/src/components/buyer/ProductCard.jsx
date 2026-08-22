import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useCartStore from '../../store/cartStore';

const CURRENCY_SYMBOLS = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };

function Stars({ rating = 4.2 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} width="12" height="12" viewBox="0 0 24 24" fill={s <= Math.round(rating) ? '#FFA41C' : '#CACACA'}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      <span style={{ fontSize: '11px', color: '#7E7E7E', marginLeft: '4px' }}>{rating}</span>
    </div>
  );
}

export default function ProductCard({ product, currency = 'INR' }) {
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const [adding, setAdding] = useState(false);

  const symbol = CURRENCY_SYMBOLS[currency] || '₹';
  const priceKey = `price_${currency.toLowerCase()}`;
  const price = product[priceKey] || product.price_inr;

  const imageUrl = product.product_images?.[0]?.enhanced_url ||
    product.product_images?.[0]?.raw_url ||
    null;

  const handleAdd = (e) => {
    e.stopPropagation();
    setAdding(true);
    addItem({ ...product, selectedCurrency: currency });
    setTimeout(() => setAdding(false), 1200);
  };

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      style={{
        background: '#fff', borderRadius: '8px', overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)', cursor: 'pointer',
        border: '1px solid transparent', transition: 'all 0.2s',
        display: 'flex', flexDirection: 'column',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,41,112,0.12)'; e.currentTarget.style.borderColor = '#E0F5FD'; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; e.currentTarget.style.borderColor = 'transparent'; }}
    >
      {/* Product Image */}
      <div style={{ aspectRatio: '1', background: '#F7F9FC', overflow: 'hidden', position: 'relative' }}>
        {imageUrl ? (
          <img src={imageUrl} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span style={{ fontSize: '48px' }}>🎨</span>
            <span style={{ fontSize: '11px', color: '#CACACA' }}>{product.craft_type}</span>
          </div>
        )}

        {/* Region badge */}
        {product.region_label && (
          <div style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(0,41,112,0.85)', color: '#fff', fontSize: '10px', fontWeight: '600', padding: '3px 8px', borderRadius: '50px' }}>
            📍 {product.region_label}
          </div>
        )}

        {/* Passport verified */}
        {product.passports?.length > 0 && (
          <div style={{ position: 'absolute', top: '8px', right: '8px', background: '#00BAF2', borderRadius: '50%', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', title: 'Verified Authentic' }}>
            <svg width="14" height="14" fill="none" stroke="#fff" viewBox="0 0 24 24" strokeWidth="2.5">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
            </svg>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {product.craft_type && (
          <span style={{ fontSize: '11px', color: '#00BAF2', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
            {product.craft_type}
          </span>
        )}

        <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#101010', lineHeight: '1.4', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {product.title}
        </h3>

        <Stars rating={4.1 + Math.random() * 0.8} />

        {/* Price */}
        <div style={{ marginTop: '4px' }}>
          <span style={{ fontSize: '11px', verticalAlign: 'super', fontWeight: '700', color: '#101010' }}>{symbol}</span>
          <span style={{ fontSize: '20px', fontWeight: '700', color: '#101010' }}>
            {Number(price).toLocaleString('en-IN')}
          </span>
        </div>

        {/* Artisan */}
        {product.artisans?.name && (
          <div style={{ fontSize: '11px', color: '#7E7E7E', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>by</span>
            <span style={{ fontWeight: '600', color: '#002970' }}>{product.artisans.name}</span>
          </div>
        )}

        {/* Add to Cart */}
        <button
          onClick={handleAdd}
          style={{
            marginTop: '8px', width: '100%', padding: '9px', borderRadius: '50px', border: 'none', cursor: 'pointer',
            background: adding ? '#002970' : '#00BAF2', color: '#fff', fontSize: '13px', fontWeight: '600',
            transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          }}
        >
          {adding ? '✓ Added!' : '🛒 Add to Cart'}
        </button>
      </div>
    </div>
  );
}
