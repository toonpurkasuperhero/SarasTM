import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listingAPI, passportAPI } from '../../lib/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

export default function ArtisanDashboard() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ondcToggle, setOndcToggle] = useState({});

  useEffect(() => {
    listingAPI.getMyListings()
      .then((res) => setListings(res.data))
      .catch(() => toast.error('Failed to load listings'))
      .finally(() => setLoading(false));
  }, []);

  const handleONDC = (id) => {
    setOndcToggle((prev) => ({ ...prev, [id]: !prev[id] }));
    toast.success('ONDC sync simulated ✓');
  };

  const quickActions = [
    { icon: '🎙️', label: 'New Voice Listing', to: '/artisan/voice', color: 'bg-paytm-cyan' },
    { icon: '📸', label: 'Photo Studio', to: '/artisan/photo', color: 'bg-paytm-navy-light' },
    { icon: '📋', label: 'Export Docs', to: '/artisan/compliance', color: 'bg-paytm-green' },
    { icon: '💰', label: 'Payouts', to: '/artisan/payouts', color: 'bg-orange-500' },
  ];

  return (
    <div className="page-container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Artisan Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your crafts and global sales</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <Link
            key={action.to}
            to={action.to}
            className={`${action.color} text-white rounded-card p-5 flex flex-col items-center gap-3 hover:opacity-90 active:scale-95 transition-all duration-150 shadow-md`}
          >
            <span className="text-3xl">{action.icon}</span>
            <span className="text-sm font-semibold text-center">{action.label}</span>
          </Link>
        ))}
      </div>

      <div>
        <h2 className="text-xl font-bold text-paytm-navy mb-4">My Listings</h2>
        {loading && (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        )}
        {!loading && listings.length === 0 && (
          <Card className="text-center py-12">
            <p className="text-5xl mb-4">🎨</p>
            <p className="text-gray-500">No listings yet</p>
            <Link to="/artisan/voice" className="btn-primary inline-block mt-4">
              Create Your First Listing
            </Link>
          </Card>
        )}
        <div className="space-y-4">
          {listings.map((listing) => (
            <Card key={listing.id} className="flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-32 h-32 flex-shrink-0">
                <img
                  src={listing.product_images?.[0]?.enhanced_url || listing.product_images?.[0]?.raw_url || 'https://source.unsplash.com/200x200/?craft'}
                  alt={listing.title}
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <h3 className="font-bold text-paytm-navy">{listing.title}</h3>
                  <Badge variant={listing.status === 'published' ? 'green' : 'navy'}>
                    {listing.status === 'published' ? '● Published' : '○ Draft'}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{listing.story_en}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {listing.seo_tags?.slice(0, 4).map((tag) => (
                    <span key={tag} className="badge-cyan text-xs">{tag}</span>
                  ))}
                </div>
                <div className="flex items-center gap-4 mt-3 flex-wrap">
                  <span className="font-bold text-paytm-navy">₹{listing.price_inr?.toLocaleString()}</span>
                  <span className="text-gray-400 text-sm">${listing.price_usd} · €{listing.price_eur}</span>
                  <Link to={`/artisan/compliance?productId=${listing.id}`} className="text-paytm-cyan text-sm hover:underline">
                    Export Docs
                  </Link>
                  <Link to={`/passport/${listing.id}`} className="text-paytm-cyan text-sm hover:underline">
                    Passport
                  </Link>

                  <div className="flex items-center gap-2 ml-auto">
                    <span className="text-xs text-gray-400">ONDC</span>
                    <button
                      onClick={() => handleONDC(listing.id)}
                      className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                        ondcToggle[listing.id] ? 'bg-paytm-green' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform ${
                          ondcToggle[listing.id] ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    {ondcToggle[listing.id] && <Badge variant="green">Synced ✓ (Simulated)</Badge>}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
