import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
const CRAFTS = ['All', 'Madhubani', 'Kanchipuram Silk', 'Blue Pottery', 'Kashmiri Walnut Craft', 'Warli Art', 'Embroidery', 'Pashmina'];
const REGIONS = ['All', 'Rajasthan', 'Tamil Nadu', 'Bihar', 'Jammu & Kashmir', 'Maharashtra', 'Uttar Pradesh', 'West Bengal'];
const PRICE_BANDS = [{ label: 'All Prices', value: '' }, { label: 'Under ₹2,000', value: 'low' }, { label: '₹2,000 – ₹10,000', value: 'mid' }, { label: 'Above ₹10,000', value: 'high' }];
const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP'];
const SYMBOLS = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };

function ProductCard({ product, currency, forex }) {
  const [adding, setAdding] = useState(false);
  const inr = product.price_inr || 0;
  const price = currency === 'INR' ? inr : (inr * (forex[currency] || 0.012));
  const sym = SYMBOLS[currency];
  const img = product.product_images?.[0]?.enhanced_url || product.product_images?.[0]?.raw_url;

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    setTimeout(() => setAdding(false), 1200);
  };

  return (
    <Link to={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant hover:border-action-cyan transition-all duration-200 overflow-hidden cursor-pointer group" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
        onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,41,112,0.10)'}
        onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'}>
        <div className="aspect-square bg-surface-container overflow-hidden relative">
          {img ? (
            <img src={img} alt={product.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-on-surface-variant">
              <span className="material-symbols-outlined" style={{ fontSize: '48px' }}>image</span>
              <span style={{ fontFamily: 'Inter', fontSize: '12px' }}>{product.craft_type}</span>
            </div>
          )}
          {product.region_label && (
            <div className="absolute top-3 left-3 bg-primary/80 text-on-primary px-2 py-0.5 rounded-DEFAULT uppercase tracking-wider" style={{ fontFamily: 'Inter', fontSize: '10px', fontWeight: '600', backdropFilter: 'blur(4px)' }}>
              📍 {product.region_label}
            </div>
          )}
        </div>
        <div className="p-4">
          {product.craft_type && <p className="text-action-cyan uppercase tracking-wider mb-1" style={{ fontFamily: 'Inter', fontSize: '11px', fontWeight: '600' }}>{product.craft_type}</p>}
          <h3 className="font-hanken text-on-surface font-semibold mb-1 line-clamp-2" style={{ fontSize: '16px', lineHeight: '22px' }}>{product.title}</h3>
          {product.artisans?.name && (
            <p className="text-on-surface-variant mb-3" style={{ fontFamily: 'Inter', fontSize: '12px' }}>by <span className="font-semibold text-primary">{product.artisans.name}</span></p>
          )}
          <div className="flex items-baseline gap-1 mb-3">
            <span className="text-primary" style={{ fontFamily: 'Inter', fontSize: '11px', fontWeight: '700', verticalAlign: 'super' }}>{sym}</span>
            <span className="font-hanken text-primary font-bold" style={{ fontSize: '22px' }}>{Number(price).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
          </div>
          <button onClick={handleAdd} className="w-full py-2.5 rounded-lg border border-action-cyan text-action-cyan hover:bg-action-cyan hover:text-white transition-all font-hanken" style={{ fontSize: '14px', fontWeight: '600' }}>
            {adding ? '✓ Added!' : '+ Add to Cart'}
          </button>
        </div>
      </div>
    </Link>
  );
}

export default function Storefront() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState('INR');
  const [forex, setForex] = useState({ USD: 0.012, EUR: 0.011, GBP: 0.0096 });

  const search = searchParams.get('search') || '';
  const craftType = searchParams.get('craft_type') || '';
  const region = searchParams.get('region') || '';
  const priceBand = searchParams.get('price_band') || '';

  useEffect(() => {
    axios.get('https://api.frankfurter.app/latest?from=INR&to=USD,EUR,GBP').then(r => setForex(r.data.rates)).catch(() => {});
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (craftType) params.set('craft_type', craftType);
      if (region) params.set('region', region);
      if (priceBand) params.set('price_band', priceBand);
      const res = await axios.get(`${API}/api/buyer/products?${params}`);
      setProducts(res.data || []);
    } catch { setProducts([]); }
    finally { setLoading(false); }
  }, [search, craftType, region, priceBand]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const setFilter = (key, val) => {
    const p = new URLSearchParams(searchParams);
    if (val && val !== 'All' && val !== '') p.set(key, val); else p.delete(key);
    setSearchParams(p);
  };

  return (
    <div className="bg-surface min-h-screen font-inter">

      {/* Category bar */}
      <div className="bg-surface-container-lowest border-b border-outline-variant sticky top-16 z-30">
        <div className="max-w-container-max mx-auto px-margin-desktop py-3 flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {CRAFTS.map((c) => {
            const active = c === 'All' ? !craftType : c === craftType;
            return (
              <button key={c} onClick={() => setFilter('craft_type', c)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full border font-inter transition-all ${active ? 'bg-primary-container text-on-primary border-primary-container' : 'bg-surface-container-lowest text-on-surface border-outline-variant hover:border-action-cyan'}`}
                style={{ fontSize: '13px', fontWeight: '600' }}>
                {c}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-container-max mx-auto px-margin-desktop py-8 flex gap-8 items-start">

        {/* Sidebar */}
        <aside className="w-56 flex-shrink-0 hidden md:block">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-5" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div className="font-hanken text-primary font-bold pb-3 border-b border-outline-variant mb-4" style={{ fontSize: '16px' }}>Filters</div>

            <div className="mb-5">
              <div className="text-primary uppercase tracking-wider mb-3" style={{ fontFamily: 'Inter', fontSize: '12px', fontWeight: '600' }}>Region</div>
              {REGIONS.map((r) => {
                const active = r === 'All' ? !region : r === region;
                return (
                  <label key={r} className="flex items-center gap-2 py-1.5 cursor-pointer" style={{ fontFamily: 'Inter', fontSize: '14px', color: active ? '#001645' : '#444651', fontWeight: active ? '600' : '400' }}>
                    <input type="radio" name="region" checked={active} onChange={() => setFilter('region', r)} style={{ accentColor: '#002970' }} />
                    {r}
                  </label>
                );
              })}
            </div>

            <div className="mb-5">
              <div className="text-primary uppercase tracking-wider mb-3" style={{ fontFamily: 'Inter', fontSize: '12px', fontWeight: '600' }}>Price Range</div>
              {PRICE_BANDS.map((pb) => {
                const active = pb.value === priceBand;
                return (
                  <label key={pb.value} className="flex items-center gap-2 py-1.5 cursor-pointer" style={{ fontFamily: 'Inter', fontSize: '14px', color: active ? '#001645' : '#444651', fontWeight: active ? '600' : '400' }}>
                    <input type="radio" name="price" checked={active} onChange={() => setFilter('price_band', pb.value)} style={{ accentColor: '#002970' }} />
                    {pb.label}
                  </label>
                );
              })}
            </div>

            <div>
              <div className="text-primary uppercase tracking-wider mb-3" style={{ fontFamily: 'Inter', fontSize: '12px', fontWeight: '600' }}>Currency</div>
              <div className="grid grid-cols-2 gap-1.5">
                {CURRENCIES.map((cur) => (
                  <button key={cur} onClick={() => setCurrency(cur)}
                    className="py-1.5 rounded-lg border transition-all font-inter font-semibold" style={{ fontSize: '12px', borderColor: currency === cur ? '#002970' : '#c4c6d2', background: currency === cur ? '#002970' : '#fff', color: currency === cur ? '#fff' : '#191c1e' }}>
                    {cur}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Grid */}
        <main className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-6">
            <p className="text-on-surface-variant" style={{ fontFamily: 'Inter', fontSize: '14px' }}>
              {loading ? 'Loading...' : <><span className="font-bold text-on-surface">{products.length}</span> results{search && <> for "<span className="text-primary font-semibold">{search}</span>"</>}{craftType && <> in <span className="text-primary font-semibold">{craftType}</span></>}</>}
            </p>
            <p className="text-on-surface-variant" style={{ fontFamily: 'Inter', fontSize: '13px' }}>Showing in <span className="font-bold text-primary">{currency}</span></p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
                  <div className="skeleton aspect-square" />
                  <div className="p-4 flex flex-col gap-2">
                    <div className="skeleton h-3 w-1/2" />
                    <div className="skeleton h-5" />
                    <div className="skeleton h-6 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '80px' }}>search_off</span>
              <h3 className="font-hanken text-primary mt-4" style={{ fontSize: '24px', fontWeight: '600' }}>No products found</h3>
              <p className="text-on-surface-variant mt-2" style={{ fontFamily: 'Inter', fontSize: '16px' }}>Try adjusting your filters or search terms</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map(p => <ProductCard key={p.id} product={p} currency={currency} forex={forex} />)}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
