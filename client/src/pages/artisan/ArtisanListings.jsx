// client/src/pages/artisan/ArtisanListings.jsx
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../../store/authStore';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

const STATUS_COLORS = {
  'AI Optimizing': 'bg-blue-50 text-action-cyan border-blue-100',
  'Live': 'bg-green-50 text-green-700 border-green-200',
  'Compliance Drafted': 'bg-orange-50 text-orange-600 border-orange-200',
  'Draft': 'bg-surface-gray text-on-surface-variant border-outline-variant',
};

export default function ArtisanListings() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');

  const DEMO_LISTINGS = [
    { id: '1', title: 'Tree of Life Madhubani Painting', description: 'Natural dyes on handmade paper', craft_type: 'Painting', region_label: 'Mithila, BR', status: 'AI Optimizing', image: 'https://sebrmbnztijnzbvnpnbq.supabase.co/storage/v1/object/public/product-images/products/71223fbe-b1c4-49fc-819c-d136650cd3be/main.png', price_inr: 4500 },
    { id: '2', title: 'Kanchipuram Bridal Silk Saree', description: 'Pure mulberry silk with gold zari', craft_type: 'Textile', region_label: 'Kanchipuram, TN', status: 'Live', image: 'https://sebrmbnztijnzbvnpnbq.supabase.co/storage/v1/object/public/product-images/products/53b79cfa-3246-4945-8b56-0fc16edfd36d/main.png', price_inr: 12500 },
    { id: '3', title: 'Engraved Terracotta Vase', description: 'Hand-thrown clay with tribal motifs', craft_type: 'Ceramics', region_label: 'Bishnupur, WB', status: 'Compliance Drafted', image: 'https://sebrmbnztijnzbvnpnbq.supabase.co/storage/v1/object/public/product-images/products/3000e9ce-dafe-4f1b-b01d-55ad546efb5e/main.png', price_inr: 3200 },
  ];

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const token = localStorage.getItem('sarastm_token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(`${API}/api/listing/my`, { headers });
        
        // Remove duplicate items if any matching ID
        const dbItems = res.data || [];
        const combined = [...dbItems, ...DEMO_LISTINGS.filter(d => !dbItems.some(db => db.title === d.title))];
        setListings(combined);
      } catch (err) {
        console.error(err);
        setListings(DEMO_LISTINGS);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, [user]);

  const filteredListings = listings.filter(item => {
    if (filterStatus === 'All') return true;
    const status = item.status === 'published' ? 'Live' : item.status === 'draft' ? 'Draft' : item.status;
    return status === filterStatus;
  });

  return (
    <div className="bg-surface min-h-screen font-inter p-8 md:p-12">
      <div className="max-w-container-max mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-hanken text-primary text-4xl font-bold">My Product Listings</h1>
            <p className="text-on-surface-variant mt-2 text-sm">View, manage, and edit your craft listings catalog.</p>
          </div>
          <button onClick={() => navigate('/artisan/voice')} className="bg-primary-container text-on-primary py-2.5 px-5 rounded-lg font-bold hover:bg-primary transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined">add</span> New Listing
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 border-b border-outline-variant pb-4">
          {['All', 'Live', 'Draft', 'AI Optimizing', 'Compliance Drafted'].map((status) => (
            <button key={status} onClick={() => setFilterStatus(status)}
              className={`px-4 py-1.5 rounded-full border text-xs font-semibold transition-all ${filterStatus === status ? 'bg-primary-container text-on-primary border-primary-container' : 'bg-white text-on-surface border-outline-variant hover:border-action-cyan'}`}>
              {status}
            </button>
          ))}
        </div>

        {/* Listings Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white p-4 rounded-xl border border-surface-container-highest flex flex-col gap-4 animate-pulse">
                <div className="bg-surface-container h-48 rounded" />
                <div className="h-5 bg-surface-container w-3/4 rounded" />
                <div className="h-4 bg-surface-container w-1/2 rounded" />
              </div>
            ))}
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="text-center py-20 bg-white border border-outline-variant rounded-xl">
            <span className="material-symbols-outlined text-[64px] text-on-surface-variant">inventory_2</span>
            <h3 className="font-hanken text-primary mt-4 text-xl font-bold">No listings found</h3>
            <p className="text-on-surface-variant text-sm mt-1">Try changing your status filter or create a new listing.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((item) => {
              const img = item.product_images?.[0]?.enhanced_url || item.product_images?.[0]?.raw_url || item.image;
              const status = item.status === 'published' ? 'Live' : item.status === 'draft' ? 'Draft' : item.status || 'Draft';
              const statusIcon = status === 'Live' ? 'public' : status === 'AI Optimizing' ? 'autorenew' : status === 'Compliance Drafted' ? 'description' : 'edit';
              const colorClass = STATUS_COLORS[status] || STATUS_COLORS['Draft'];

              return (
                <div key={item.id} className="bg-white rounded-xl border border-outline-variant hover:border-action-cyan transition-all overflow-hidden flex flex-col shadow-sm cursor-pointer group"
                  onClick={() => navigate(`/product/${item.id}`)}>
                  
                  {/* Card Image */}
                  <div className="h-48 bg-surface-container overflow-hidden relative">
                    {img ? (
                      <img src={img} alt={item.title} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
                        <span className="material-symbols-outlined text-[48px]">image</span>
                      </div>
                    )}
                    <span className={`absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full border uppercase tracking-wider text-[10px] font-semibold bg-white/95 backdrop-blur-sm ${colorClass}`}>
                      <span className="material-symbols-outlined text-[12px]">{statusIcon}</span>
                      {status}
                    </span>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex-grow flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-hanken text-primary text-lg font-bold line-clamp-1">{item.title}</h3>
                      </div>
                      <p className="text-on-surface-variant text-sm line-clamp-2 mb-4">{item.description || item.story_en || 'Draft listing waiting for AI review.'}</p>
                    </div>

                    <div className="flex justify-between items-center border-t border-outline-variant/30 pt-4 mt-auto">
                      <span className="text-primary font-hanken font-bold text-lg">₹{Number(item.price_inr || item.suggested_price_inr || 0).toLocaleString('en-IN')}</span>
                      <span className="text-xs text-on-surface-variant bg-surface-gray px-2 py-0.5 rounded font-semibold">{item.craft_type || 'Craft'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
