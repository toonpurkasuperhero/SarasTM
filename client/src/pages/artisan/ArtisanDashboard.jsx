import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../../store/authStore';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

const ARTISAN_IMG = 'https://sebrmbnztijnzbvnpnbq.supabase.co/storage/v1/object/public/product-images/artisans/34a1841b-9fd6-4409-96e3-fb61c5915071/profile.png';
const IMG_MADHUBANI = 'https://sebrmbnztijnzbvnpnbq.supabase.co/storage/v1/object/public/product-images/products/71223fbe-b1c4-49fc-819c-d136650cd3be/main.png';
const IMG_SAREE = 'https://sebrmbnztijnzbvnpnbq.supabase.co/storage/v1/object/public/product-images/products/53b79cfa-3246-4945-8b56-0fc16edfd36d/main.png';
const IMG_POT = 'https://sebrmbnztijnzbvnpnbq.supabase.co/storage/v1/object/public/product-images/products/3000e9ce-dafe-4f1b-b01d-55ad546efb5e/main.png';

const STATUS_COLORS = {
  'AI Optimizing': 'bg-blue-50 text-action-cyan border-blue-100',
  'Live': 'bg-green-50 text-green-700 border-green-200',
  'Compliance Drafted': 'bg-orange-50 text-orange-600 border-orange-200',
  'Draft': 'bg-surface-gray text-on-surface-variant border-outline-variant',
};

export default function ArtisanDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const DEMO_LISTINGS = [
    { id: '1', title: 'Tree of Life Madhubani Painting', description: 'Natural dyes on handmade paper', region: 'Mithila, BR', tag: 'Painting', status: 'AI Optimizing', statusIcon: 'autorenew', image: IMG_MADHUBANI },
    { id: '2', title: 'Kanchipuram Bridal Silk Saree', description: 'Pure mulberry silk with gold zari', region: 'Kanchipuram, TN', tag: 'Textile', status: 'Live', statusIcon: 'public', image: IMG_SAREE },
    { id: '3', title: 'Engraved Terracotta Vase', description: 'Hand-thrown clay with tribal motifs', region: 'Bishnupur, WB', tag: 'Ceramics', status: 'Compliance Drafted', statusIcon: 'description', image: IMG_POT },
  ];

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const token = user?.access_token || localStorage.getItem('sarastm_token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(`${API}/api/listing/my`, { headers });
        
        const dbItems = res.data || [];
        const combined = [...dbItems, ...DEMO_LISTINGS.filter(d => !dbItems.some(db => db.title === d.title))];
        setListings(combined);
      } catch {
        setListings(DEMO_LISTINGS);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, [user]);

  return (
    <div className="bg-surface text-on-surface font-inter antialiased min-h-screen flex">

      {/* Main Content */}
      <main className="flex-1 md:ml-64 min-h-screen bg-surface" style={{ padding: '32px 64px' }}>
        {/* Mobile Header */}
        <header className="md:hidden flex justify-between items-center mb-8 border-b border-outline-variant pb-4">
          <h1 className="font-hanken text-primary font-bold" style={{ fontSize: '24px' }}>{user?.name || 'Artisan Portal'}</h1>
          <button className="text-primary">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </header>

        <div className="max-w-container-max mx-auto grid grid-cols-1 lg:grid-cols-12 gap-gutter">

          {/* Left: Main Content */}
          <div className="lg:col-span-8 flex flex-col gap-8">

            {/* Voice Listing Hero Card */}
            <section className="bg-white rounded-xl border border-surface-container-highest overflow-hidden relative shadow-sm">
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-dot-pattern" />
              <div className="p-8 relative z-10 flex flex-col items-center text-center">
                <h2 className="font-hanken text-primary mb-2" style={{ fontSize: '20px', fontWeight: '600' }}>Record Your Product</h2>
                <p className="text-on-surface-variant mb-8 max-w-md" style={{ fontFamily: 'Inter', fontSize: '16px', lineHeight: '24px' }}>
                  Describe your latest creation in your own language. Saras AI will translate, optimize, and list it globally.
                </p>
                <button onClick={() => navigate('/artisan/voice')}
                  className="w-24 h-24 rounded-full bg-primary-container text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform duration-300 group relative">
                  <div className="absolute inset-0 rounded-full border border-action-cyan opacity-0 group-hover:animate-ping" />
                  <span className="material-symbols-outlined text-white group-hover:text-action-cyan transition-colors" style={{ fontSize: '40px', fontVariationSettings: "'FILL' 1" }}>mic</span>
                </button>
                <p className="mt-4 text-primary uppercase tracking-wider" style={{ fontFamily: 'Inter', fontSize: '12px', fontWeight: '600' }}>Tap to Speak</p>
              </div>
              <div className="bg-surface-container-low px-6 py-4 border-t border-surface-container-highest flex justify-between items-center">
                <div className="flex items-center gap-2 text-on-surface-variant" style={{ fontSize: '14px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>translate</span>
                  <span>Supports 11+ Indian Languages</span>
                </div>
                <Link to="/artisan/voice" className="text-action-cyan font-semibold hover:underline" style={{ fontSize: '14px', textDecoration: 'none' }}>View Guidelines</Link>
              </div>
            </section>

            {/* Recent Listings */}
            <section>
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-hanken text-primary" style={{ fontSize: '20px', fontWeight: '600' }}>Recent Listings</h3>
                <Link to="/artisan/listings" className="text-action-cyan font-semibold hover:underline" style={{ fontSize: '14px', textDecoration: 'none' }}>View All</Link>
              </div>
              <div className="flex flex-col gap-4">
                {loading ? (
                  [1, 2, 3].map(i => (
                    <div key={i} className="bg-white p-4 rounded-lg border border-surface-container-highest flex gap-6 items-center shadow-sm">
                      <div className="skeleton w-24 h-24 rounded flex-shrink-0" />
                      <div className="flex-1 flex flex-col gap-2">
                        <div className="skeleton h-5 w-3/4" />
                        <div className="skeleton h-4 w-1/2" />
                      </div>
                    </div>
                  ))
                ) : listings.map((item) => {
                  const img = item.image || item.product_images?.[0]?.enhanced_url || item.product_images?.[0]?.raw_url;
                  const status = item.status === 'published' ? 'Live' : item.status === 'draft' ? 'Draft' : item.status || 'Draft';
                  const statusIcon = status === 'Live' ? 'public' : status === 'AI Optimizing' ? 'autorenew' : status === 'Compliance Drafted' ? 'description' : 'edit';
                  const colorClass = STATUS_COLORS[status] || STATUS_COLORS['Draft'];

                  return (
                    <div key={item.id} className="bg-white p-4 rounded-lg border border-surface-container-highest flex gap-6 items-center shadow-sm hover:border-action-cyan transition-colors cursor-pointer"
                      onClick={() => navigate(`/product/${item.id}`)}>
                      <div className="w-24 h-24 rounded bg-surface-container-high overflow-hidden flex-shrink-0">
                        {img ? <img src={img} alt={item.title} className="w-full h-full object-cover" /> : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '32px' }}>image</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1 gap-2">
                          <h4 className="font-semibold text-on-surface truncate" style={{ fontFamily: 'Inter', fontSize: '18px', lineHeight: '28px' }}>{item.title}</h4>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border uppercase tracking-wider flex-shrink-0 ${colorClass}`} style={{ fontFamily: 'Inter', fontSize: '10px', fontWeight: '600' }}>
                            <span className={`material-symbols-outlined ${statusIcon === 'autorenew' ? 'animate-spin' : ''}`} style={{ fontSize: '12px' }}>{statusIcon}</span>
                            {status}
                          </span>
                        </div>
                        <p className="text-on-surface-variant mb-2" style={{ fontFamily: 'Inter', fontSize: '14px' }}>{item.description || item.story_en?.substring(0, 60) || ''}</p>
                        <div className="flex gap-2 flex-wrap">
                          {(item.region || item.region_label) && <span className="px-2 py-0.5 bg-surface-gray text-deep-ink rounded" style={{ fontSize: '12px' }}>{item.region || item.region_label}</span>}
                          {item.tag && <span className="px-2 py-0.5 bg-surface-gray text-deep-ink rounded" style={{ fontSize: '12px' }}>{item.tag}</span>}
                          {item.craft_type && <span className="px-2 py-0.5 bg-surface-gray text-deep-ink rounded" style={{ fontSize: '12px' }}>{item.craft_type}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Right: Analytics Sidebar */}
          <div className="lg:col-span-4 flex flex-col gap-6">

            {/* Global Sales Widget */}
            <div className="bg-white rounded-xl border border-surface-container-highest p-6 shadow-sm">
              <h3 className="text-on-surface-variant uppercase tracking-wider mb-4 flex items-center gap-1.5" style={{ fontFamily: 'Inter', fontSize: '12px', fontWeight: '600' }}>
                Total Global Sales (Annual Forecast)
                <span className="material-symbols-outlined text-[16px] text-outline cursor-pointer" title="Projections representing unified ONDC + Global listing reach. Received payout is currently ₹55,000 due to active buyer escrow holds.">info</span>
              </h3>
              <div className="flex items-end gap-2 mb-2">
                <span className="font-hanken text-primary" style={{ fontSize: '40px', lineHeight: '1', fontWeight: '700' }}>₹1,42,500</span>
                <span className="text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-semibold text-xs border border-green-200 mb-2 whitespace-nowrap">
                  <span className="material-symbols-outlined text-[14px]">trending_up</span> +12%
                </span>
              </div>
              <div className="flex gap-4 mt-2 p-2 bg-surface-container-low rounded" style={{ fontSize: '12px', color: '#444651' }}>
                {[['USD', '~$1,710'], ['EUR', '~€1,580'], ['GBP', '~£1,350']].map(([code, val]) => (
                  <div key={code} className="flex flex-col flex-1 border-l border-outline-variant/30 pl-3 first:pl-0 first:border-0">
                    <span style={{ fontSize: '10px', textTransform: 'uppercase' }}>{code}</span>
                    <span className="font-semibold text-on-surface">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Markets */}
            <div className="bg-white rounded-xl border border-surface-container-highest p-6 shadow-sm">
              <h3 className="text-on-surface-variant uppercase tracking-wider mb-4" style={{ fontFamily: 'Inter', fontSize: '12px', fontWeight: '600' }}>Top Markets</h3>
              <div className="flex flex-col gap-4">
                {[['United States', 45, 'bg-action-cyan'], ['United Kingdom', 30, 'bg-primary-container'], ['Germany', 15, 'bg-secondary'], ['Australia', 10, 'bg-surface-container-high']].map(([country, pct, color]) => (
                  <div key={country}>
                    <div className="flex justify-between mb-1" style={{ fontSize: '14px' }}>
                      <span className="font-semibold">{country}</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                      <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Logistics Alert */}
            <div className="bg-white rounded-xl border border-surface-container-highest p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-on-surface-variant uppercase tracking-wider" style={{ fontFamily: 'Inter', fontSize: '12px', fontWeight: '600' }}>Logistics Alert</h3>
                <span className="material-symbols-outlined text-outline">local_shipping</span>
              </div>
              <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 flex gap-3">
                <span className="material-symbols-outlined text-orange-600">warning</span>
                <div>
                  <h4 className="font-semibold text-orange-800 mb-1" style={{ fontSize: '14px' }}>Action Required</h4>
                  <p className="text-orange-700" style={{ fontSize: '12px' }}>2 orders ready for pickup. Schedule Saras courier collection.</p>
                  <button onClick={() => navigate('/artisan/compliance')} className="mt-3 font-bold text-orange-800 border border-orange-300 px-3 py-1.5 rounded hover:bg-orange-100 transition-colors" style={{ fontSize: '12px' }}>
                    Schedule Now
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-surface-container-highest p-6 shadow-sm">
              <h3 className="text-on-surface-variant uppercase tracking-wider mb-4" style={{ fontFamily: 'Inter', fontSize: '12px', fontWeight: '600' }}>Quick Actions</h3>
              <div className="flex flex-col gap-2">
                {[
                  { icon: 'photo_camera', label: 'Photo Studio', to: '/artisan/photo' },
                  { icon: 'description', label: 'Export Compliance', to: '/artisan/compliance' },
                  { icon: 'payments', label: 'Payout Ledger', to: '/artisan/payouts' },
                ].map(({ icon, label, to }) => (
                  <Link key={to} to={to} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-all" style={{ fontFamily: 'Inter', fontSize: '14px', textDecoration: 'none' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{icon}</span>
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
