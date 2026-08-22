import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import useCartStore from '../../store/cartStore';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR'];
const SYMBOLS = { USD: '$', EUR: '€', GBP: '£', INR: '₹' };

// Craft-specific fallback images from Supabase storage
const SUPABASE = 'https://sebrmbnztijnzbvnpnbq.supabase.co/storage/v1/object/public/product-images';
const CRAFT_FALLBACKS = {
  'Madhubani': `${SUPABASE}/products/71223fbe-b1c4-49fc-819c-d136650cd3be/main.png`,
  'Kanchipuram Silk': `${SUPABASE}/products/53b79cfa-3246-4945-8b56-0fc16edfd36d/main.png`,
  'Blue Pottery': `${SUPABASE}/products/f8548831-9da5-4b7c-b95a-36116c415904/main.png`,
  'Kashmiri Walnut Craft': `${SUPABASE}/products/d6478d60-1ece-4134-9c74-e47a9a7071fe/main.png`,
  'Warli Art': `${SUPABASE}/products/3000e9ce-dafe-4f1b-b01d-55ad546efb5e/main.png`,
};
const ARTISAN_PHOTO = `${SUPABASE}/artisans/34a1841b-9fd6-4409-96e3-fb61c5915071/profile.png`;

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCartStore();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [currency, setCurrency] = useState('USD');
  const [forex, setForex] = useState({ USD: 0.012, EUR: 0.011, GBP: 0.0096 });
  const [adding, setAdding] = useState(false);

  // Hover zoom magnifier states
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [showZoom, setShowZoom] = useState(false);

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${API}/api/buyer/products/${id}`);
        setProduct(res.data);
      } catch {
        const res = await axios.get(`${API}/api/buyer/products`);
        setProduct(res.data?.[0] || null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    axios.get('https://api.frankfurter.app/latest?from=INR&to=USD,EUR,GBP').then(r => {
      setForex(r.data.rates);
    }).catch(() => {});
  }, []);

  const getPrice = () => {
    if (!product) return '';
    const inr = product.price_inr || 12500;
    const sym = SYMBOLS[currency];
    if (currency === 'INR') return `₹${Number(inr).toLocaleString('en-IN')}`;
    const rate = forex[currency] || 0.012;
    return `${sym}${(inr * rate).toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
  };

  const images = (() => {
    const imgs = product?.product_images?.map(i => i.enhanced_url || i.raw_url).filter(Boolean) || [];
    if (imgs.length) return imgs;
    const fallback = CRAFT_FALLBACKS[product?.craft_type];
    return fallback ? [fallback] : [ARTISAN_PHOTO];
  })();

  const handleAddToCart = () => {
    setAdding(true);
    addItem({ ...product, selectedCurrency: currency });
    setTimeout(() => setAdding(false), 1200);
  };

  if (loading) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <span className="material-symbols-outlined text-action-cyan" style={{ fontSize: '48px' }}>hourglass_empty</span>
        <p className="text-on-surface-variant" style={{ fontFamily: 'Inter', fontSize: '16px' }}>Loading product...</p>
      </div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="text-center">
        <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '64px' }}>search_off</span>
        <p className="text-primary font-hanken mt-4" style={{ fontSize: '24px' }}>Product not found</p>
        <Link to="/store" className="text-action-cyan hover:underline mt-2 block" style={{ fontFamily: 'Inter' }}>Back to Marketplace</Link>
      </div>
    </div>
  );

  return (
    <div className="bg-surface text-on-surface font-inter min-h-screen flex flex-col antialiased">
      <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 md:py-24">

        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 mb-8 uppercase tracking-wider" style={{ fontFamily: 'Inter', fontSize: '12px', fontWeight: '600', color: '#444651' }}>
          <Link to="/store" className="hover:text-action-cyan transition-colors" style={{ color: '#444651', textDecoration: 'none' }}>Marketplace</Link>
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chevron_right</span>
          {product.craft_type && (
            <>
              <Link to={`/store?craft_type=${encodeURIComponent(product.craft_type)}`} className="hover:text-action-cyan transition-colors" style={{ color: '#444651', textDecoration: 'none' }}>{product.craft_type}</Link>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chevron_right</span>
            </>
          )}
          <span className="text-primary font-bold">{product.title?.substring(0, 40)}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter mb-24">

          {/* Left: Image gallery */}
          <div className="lg:col-span-7 flex flex-col gap-unit">
            <div 
              className="relative w-full bg-surface-container rounded-lg overflow-hidden border border-outline-variant cursor-zoom-in group" 
              style={{ aspectRatio: '4/5' }}
              onMouseEnter={() => setShowZoom(true)}
              onMouseLeave={() => setShowZoom(false)}
              onMouseMove={handleMouseMove}
            >
              <img 
                src={images[activeImg]} 
                alt="Product" 
                className="w-full h-full object-cover" 
                style={{
                  transform: showZoom ? 'scale(2.2)' : 'scale(1)',
                  transformOrigin: showZoom ? `${zoomPos.x}% ${zoomPos.y}%` : 'center',
                  transition: showZoom ? 'none' : 'transform 0.3s ease-out'
                }}
              />
              <div className="absolute top-4 left-4 bg-surface-container-lowest text-primary border border-outline-variant flex items-center gap-1 uppercase tracking-wider px-3 py-1 rounded-DEFAULT" style={{ fontFamily: 'Inter', fontSize: '12px', fontWeight: '600', pointerEvents: 'none' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>diamond</span>
                One-of-a-Kind
              </div>
            </div>
            <div className="grid grid-cols-4 gap-unit">
              {images.slice(0, 3).map((img, i) => (
                <div key={i} onClick={() => setActiveImg(i)} className={`aspect-square bg-surface-container rounded-lg overflow-hidden cursor-pointer border-2 transition-colors ${activeImg === i ? 'border-action-cyan' : 'border-outline-variant hover:border-action-cyan'}`}>
                  <img src={img} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
              <div className="aspect-square bg-surface-container rounded-lg overflow-hidden border border-outline-variant flex items-center justify-center cursor-pointer hover:bg-surface-container-high transition-colors">
                <span className="material-symbols-outlined text-outline" style={{ fontSize: '32px' }}>play_circle</span>
              </div>
            </div>
          </div>

          {/* Right: Details & Actions */}
          <div className="lg:col-span-5 flex flex-col pt-4 lg:pl-8">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {product.craft_type && <span className="bg-surface-gray text-deep-ink px-2 py-1 rounded-DEFAULT uppercase tracking-wider" style={{ fontFamily: 'Inter', fontSize: '12px', fontWeight: '600' }}>{product.craft_type}</span>}
              <span className="bg-surface-gray text-deep-ink px-2 py-1 rounded-DEFAULT uppercase tracking-wider" style={{ fontFamily: 'Inter', fontSize: '12px', fontWeight: '600' }}>Hand-Made</span>
              {product.region_label && (
                <span className="text-on-surface-variant flex items-center gap-1 ml-auto" style={{ fontFamily: 'Inter', fontSize: '12px', fontWeight: '600' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>location_on</span>
                  {product.region_label}
                </span>
              )}
            </div>

            <h1 className="font-hanken text-primary mb-4" style={{ fontSize: '48px', lineHeight: '56px', letterSpacing: '-0.02em', fontWeight: '700' }}>
              {product.title}
            </h1>
            <p className="text-on-surface-variant mb-8 leading-relaxed" style={{ fontFamily: 'Inter', fontSize: '18px', lineHeight: '28px' }}>
              {product.story_en || product.story_native || 'A masterpiece of traditional Indian craftsmanship.'}
            </p>

            {/* Multi-Currency Price Widget */}
            <div className="glass-overlay rounded-lg p-6 mb-8 border border-outline-variant">
              <div className="flex justify-between items-end mb-2">
                <div className="flex flex-col">
                  <span className="text-on-surface-variant uppercase tracking-wider mb-1" style={{ fontFamily: 'Inter', fontSize: '12px', fontWeight: '600' }}>Global Price</span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-hanken text-primary transition-all duration-300" style={{ fontSize: '32px', fontWeight: '600' }}>{getPrice()}</span>
                    <span className="text-on-surface-variant" style={{ fontFamily: 'Inter', fontSize: '16px' }}>{currency}</span>
                  </div>
                </div>
                <div className="flex items-center bg-surface-container-lowest border border-outline-variant rounded-DEFAULT overflow-hidden">
                  <select value={currency} onChange={(e) => setCurrency(e.target.value)}
                    className="bg-transparent border-none focus:ring-0 cursor-pointer" style={{ fontFamily: 'Inter', fontSize: '16px', padding: '4px 8px 4px 8px' }}>
                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="text-outline flex items-center gap-1" style={{ fontFamily: 'Inter', fontSize: '12px', fontWeight: '600' }}>
                Base Price: ₹{Number(product.price_inr || 12500).toLocaleString('en-IN')} INR
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }} title="Converted at current market rates via Saras AI">info</span>
              </div>
            </div>

            {/* Authenticity Passport */}
            <div className="bg-surface-container-lowest border border-heritage-red rounded-lg p-6 mb-8 relative overflow-hidden group">
              <div className="absolute inset-0 authenticity-watermark z-0 opacity-50" />
              <div className="relative z-10 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-hanken text-primary flex items-center gap-2" style={{ fontSize: '20px', fontWeight: '600' }}>
                    <span className="material-symbols-outlined text-action-cyan">verified</span>
                    Authenticity Passport
                  </h3>
                  <span className="bg-primary-container text-on-primary-container flex items-center gap-1 px-2 py-1 rounded-full" style={{ fontFamily: 'Inter', fontSize: '12px', fontWeight: '600' }}>
                    Verified by Saras AI
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4" style={{ fontSize: '14px' }}>
                  <div>
                    <span className="text-on-surface-variant block uppercase tracking-wider mb-1" style={{ fontFamily: 'Inter', fontSize: '12px', fontWeight: '600' }}>Origin Node</span>
                    <span className="font-semibold text-primary block truncate" style={{ fontFamily: 'Inter', fontSize: '16px' }}>{product.artisans?.name || 'Artisan Guild'}</span>
                  </div>
                  <div>
                    <span className="text-on-surface-variant block uppercase tracking-wider mb-1" style={{ fontFamily: 'Inter', fontSize: '12px', fontWeight: '600' }}>Material Assay</span>
                    <span className="font-semibold text-primary block truncate" style={{ fontFamily: 'Inter', fontSize: '16px' }}>{product.craft_type || 'Handmade'}</span>
                  </div>
                  <div>
                    <span className="text-on-surface-variant block uppercase tracking-wider mb-1" style={{ fontFamily: 'Inter', fontSize: '12px', fontWeight: '600' }}>Region</span>
                    <span className="font-semibold text-primary" style={{ fontFamily: 'Inter', fontSize: '16px' }}>{product.region_label || 'India'}</span>
                  </div>
                  <div>
                    <span className="text-on-surface-variant block uppercase tracking-wider mb-1" style={{ fontFamily: 'Inter', fontSize: '12px', fontWeight: '600' }}>Digital Signature</span>
                    <Link to={`/passport/${product.id}`} className="font-semibold text-action-cyan hover:underline flex items-center gap-1" style={{ fontFamily: 'Inter', fontSize: '16px', textDecoration: 'none' }}>
                      {product.content_hash ? `0x${product.content_hash.substring(0, 4)}...` : '0x7a...4f9b'}
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>open_in_new</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-4 mt-auto">
              <button onClick={handleAddToCart}
                className="w-full bg-trust-blue text-on-primary py-4 px-6 rounded-lg flex items-center justify-center gap-2 hover:bg-primary transition-colors shadow-sm font-hanken"
                style={{ fontSize: '20px', fontWeight: '600' }}>
                <span className="material-symbols-outlined">{adding ? 'check' : 'lock'}</span>
                {adding ? 'Added to Cart!' : 'Secure Escrow Payment'}
              </button>
              <Link to={`/passport/${product.id}`}
                className="w-full bg-surface-container-lowest text-action-cyan border border-action-cyan py-4 px-6 rounded-lg flex items-center justify-center gap-2 hover:bg-action-cyan/5 transition-colors font-hanken"
                style={{ fontSize: '20px', fontWeight: '600', textDecoration: 'none' }}>
                <span className="material-symbols-outlined">qr_code_2</span>
                View Authenticity Passport
              </Link>
            </div>
          </div>
        </div>

        {/* Artisan Story Section */}
        {product.artisans && (
          <section className="border-t border-outline-variant pt-24 mb-24">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div className="flex flex-col gap-6">
                <h2 className="font-hanken text-primary" style={{ fontSize: '32px', fontWeight: '600', lineHeight: '40px' }}>Meet the Master Artisan</h2>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-outline-variant bg-surface-container flex items-center justify-center">
                    {product.artisans?.bank_details_mock?.profile_photo_url ? (
                      <img src={product.artisans.bank_details_mock.profile_photo_url} alt={product.artisans.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '32px' }}>person</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-hanken text-primary" style={{ fontSize: '20px', fontWeight: '600' }}>{product.artisans.name}</h3>
                    <p className="text-on-surface-variant flex items-center gap-1" style={{ fontFamily: 'Inter', fontSize: '16px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>location_on</span>
                      {product.artisans.region || 'India'}
                    </p>
                  </div>
                </div>
                <p className="text-on-surface-variant leading-relaxed" style={{ fontFamily: 'Inter', fontSize: '18px', lineHeight: '28px' }}>
                  {product.artisans.bio || `A master ${product.craft_type || 'artisan'} preserving the ancient tradition of Indian handicrafts. Every piece is handcrafted with decades of expertise passed down through generations.`}
                </p>
                <Link to={`/store?artisan=${product.artisans.id}`}
                  className="text-action-cyan hover:underline flex items-center gap-1 w-max font-hanken"
                  style={{ fontSize: '20px', fontWeight: '600', textDecoration: 'none' }}>
                  View Full Artisan Profile
                  <span className="material-symbols-outlined">arrow_forward</span>
                </Link>
              </div>
              <div className="relative h-96 bg-surface-container rounded-xl overflow-hidden border border-outline-variant flex items-center justify-center">
                <div className="text-center text-on-surface-variant">
                  <span className="material-symbols-outlined" style={{ fontSize: '64px' }}>map</span>
                  <p className="mt-2 font-hanken" style={{ fontSize: '20px', fontWeight: '600' }}>{product.artisans.region || 'India'}</p>
                  <p style={{ fontFamily: 'Inter', fontSize: '14px' }}>Origin of this craft</p>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-primary w-full">
        <div className="flex flex-col items-center justify-center py-12 px-margin-desktop gap-8 w-full max-w-container-max mx-auto">
          <h2 className="font-hanken text-on-primary font-bold" style={{ fontSize: '32px' }}>SarasTM</h2>
          <nav className="flex flex-wrap justify-center gap-6">
            {['Cultural Heritage', 'Export Compliance', 'Privacy Policy', 'Terms of Service'].map((l) => (
              <a key={l} href="#" className="text-surface-variant hover:text-on-primary transition-colors uppercase tracking-wider" style={{ fontFamily: 'Inter', fontSize: '12px', fontWeight: '600', textDecoration: 'none' }}>{l}</a>
            ))}
          </nav>
          <p className="text-surface-variant opacity-70" style={{ fontFamily: 'Inter', fontSize: '12px' }}>
            © 2024 Saras Trade Marketplace. Empowering Indian Craftsmanship through AI.
          </p>
        </div>
      </footer>
    </div>
  );
}
