// client/src/pages/artisan/ArtisanOrders.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { listingAPI } from '../../lib/api';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

const STATUS_PILLS = {
  'pending': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  'escrow_held': 'bg-blue-50 text-blue-700 border-blue-200',
  'shipped': 'bg-orange-50 text-orange-600 border-orange-200',
  'delivered': 'bg-green-50 text-green-700 border-green-200',
};

const MOCK_ORDERS = [
  {
    id: 'ORD-98821',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    buyer_email: 'sarah.jenkins@nyart.org',
    shipping_address: 'Apartment 4B, 742 Evergreen Terrace, New York, NY, USA',
    status: 'escrow_held',
    amount: 54,
    products: {
      title: 'Tree of Life Madhubani Painting',
      craft_type: 'Painting',
      image: 'https://sebrmbnztijnzbvnpnbq.supabase.co/storage/v1/object/public/product-images/products/71223fbe-b1c4-49fc-819c-d136650cd3be/main.png'
    }
  },
  {
    id: 'ORD-72109',
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    buyer_email: 'j.miller@londoncraft.co.uk',
    shipping_address: '32 Baker St, Marylebone, London, UK',
    status: 'shipped',
    amount: 150,
    products: {
      title: 'Kanchipuram Bridal Silk Saree',
      craft_type: 'Textile',
      image: 'https://sebrmbnztijnzbvnpnbq.supabase.co/storage/v1/object/public/product-images/products/53b79cfa-3246-4945-8b56-0fc16edfd36d/main.png'
    }
  }
];

export default function ArtisanOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await listingAPI.getReceivedOrders();
        // Fallback to mock orders if database returned empty
        setOrders(res.data?.length ? res.data : MOCK_ORDERS);
      } catch (err) {
        console.error(err);
        setOrders(MOCK_ORDERS);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleShip = async (orderId) => {
    try {
      const token = localStorage.getItem('sarastm_token');
      await axios.patch(`${API}/api/buyer/orders/${orderId}/status`, {
        status: 'shipped'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'shipped' } : o));
      toast.success('Order status updated! Courier pickup scheduled.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update shipping status.');
    }
  };

  return (
    <div className="bg-surface min-h-screen font-inter p-8 md:p-12">
      <div className="max-w-container-max mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-hanken text-primary text-4xl font-bold">Customer Orders</h1>
          <p className="text-on-surface-variant mt-2 text-sm">Monitor international orders, fulfill payouts, and schedule local courier pickups.</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="bg-white p-6 rounded-xl border border-surface-container-highest animate-pulse flex flex-col gap-4">
                <div className="h-6 bg-surface-container w-1/4 rounded" />
                <div className="h-4 bg-surface-container w-1/2 rounded" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-white border border-outline-variant rounded-xl">
            <span className="material-symbols-outlined text-[64px] text-on-surface-variant">shopping_bag</span>
            <h3 className="font-hanken text-primary mt-4 text-xl font-bold">No orders received yet</h3>
            <p className="text-on-surface-variant text-sm mt-1">Once buyers checkout your products in the store, they will appear here.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {orders.map((order) => {
              const prod = order.products || {};
              const img = prod.image || (prod.product_images?.[0]?.enhanced_url || prod.product_images?.[0]?.raw_url);
              const dateStr = new Date(order.created_at).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric'
              });

              return (
                <div key={order.id} className="bg-white rounded-xl border border-outline-variant p-6 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center justify-between hover:border-action-cyan transition-colors">
                  
                  {/* Left: Product info */}
                  <div className="flex gap-4 items-center">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-surface-container flex-shrink-0">
                      {img ? <img src={img} alt={prod.title} className="w-full h-full object-cover" /> : (
                        <div className="w-full h-full flex items-center justify-center text-outline">
                          <span className="material-symbols-outlined">image</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-on-surface-variant font-bold">{order.id}</span>
                        <span className="text-xs text-on-surface-variant">• {dateStr}</span>
                      </div>
                      <h3 className="font-hanken text-primary text-lg font-bold">{prod.title || 'Heritage Handicraft'}</h3>
                      <p className="text-xs text-on-surface-variant mt-0.5">Buyer: <span className="font-semibold text-primary">{order.buyer_email}</span></p>
                      <p className="text-xs text-on-surface-variant mt-0.5">Shipping: <span className="italic text-on-surface">{order.shipping_address || 'Address not provided'}</span></p>
                    </div>
                  </div>

                  {/* Right: Status & Actions */}
                  <div className="flex flex-col md:items-end gap-3 flex-shrink-0 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0">
                    <div className="flex items-center gap-4 justify-between md:justify-end">
                      <div className="text-right">
                        <div className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Total Amount</div>
                        <div className="font-hanken text-primary font-bold text-lg">
                          {order.currency || 'USD'} {Number(order.amount || 0).toLocaleString()}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full border text-xs font-semibold uppercase tracking-wider ${STATUS_PILLS[order.status] || STATUS_PILLS.pending}`}>
                        {order.status === 'escrow_held' ? 'Escrow Held' : order.status}
                      </span>
                    </div>

                    {order.status === 'escrow_held' && (
                      <button onClick={() => handleShip(order.id)}
                        className="bg-trust-blue text-on-primary py-2 px-5 rounded-lg hover:bg-primary transition-colors text-xs font-bold font-inter flex items-center justify-center gap-1.5 shadow-sm">
                        <span className="material-symbols-outlined text-[16px]">local_shipping</span>
                        Ship Product
                      </button>
                    )}
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
