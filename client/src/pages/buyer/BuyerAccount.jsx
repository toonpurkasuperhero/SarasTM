import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

const STATUS_STEPS = ['pending', 'paid', 'shipped', 'delivered'];

function StatusTimeline({ status }) {
  const current = STATUS_STEPS.indexOf(status);
  return (
    <div className="flex items-center gap-0">
      {STATUS_STEPS.map((s, i) => {
        const done = i <= current;
        const active = i === current;
        return (
          <div key={s} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 ${done ? 'bg-trust-blue border-trust-blue' : 'bg-surface-container border-outline-variant'}`}>
                {done && <span className="material-symbols-outlined text-white" style={{ fontSize: '14px' }}>check</span>}
                {active && <div className="w-2 h-2 rounded-full bg-trust-blue animate-pulse" />}
              </div>
              <span className={`capitalize text-center ${active ? 'text-primary font-bold' : done ? 'text-on-surface' : 'text-on-surface-variant'}`} style={{ fontFamily: 'Inter', fontSize: '11px', fontWeight: done ? '600' : '400' }}>{s}</span>
            </div>
            {i < STATUS_STEPS.length - 1 && <div className={`flex-1 h-0.5 ${i < current ? 'bg-trust-blue' : 'bg-outline-variant'}`} style={{ margin: '0 4px', marginBottom: '20px' }} />}
          </div>
        );
      })}
    </div>
  );
}

export default function BuyerAccount() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [searched, setSearched] = useState(false);
  const navigate = useNavigate();

  const searchOrders = async () => {
    if (!email.trim()) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/buyer/orders?email=${encodeURIComponent(email)}`);
      setOrders(res.data || []);
    } catch { setOrders([]); }
    finally { setLoading(false); setSearched(true); }
  };

  return (
    <div className="min-h-screen bg-surface" style={{ padding: '40px 64px' }}>
      <div className="max-w-container-max mx-auto">
        <h1 className="font-hanken text-primary mb-3" style={{ fontSize: '48px', lineHeight: '56px', fontWeight: '700', letterSpacing: '-0.02em' }}>My Orders</h1>
        <p className="text-on-surface-variant mb-10" style={{ fontFamily: 'Inter', fontSize: '18px' }}>Track your purchases and download invoices</p>

        {/* Email Search */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 mb-8 flex gap-4">
          <div className="flex-1">
            <label className="text-on-surface-variant uppercase tracking-wider mb-2 block" style={{ fontFamily: 'Inter', fontSize: '12px', fontWeight: '600' }}>Your Email Address</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && searchOrders()}
              placeholder="Enter your email to find orders..."
              className="w-full border border-outline-variant rounded-lg px-4 py-3 focus:outline-none focus:border-action-cyan transition-all bg-surface-container-lowest"
              style={{ fontFamily: 'Inter', fontSize: '15px' }} />
          </div>
          <div className="flex items-end">
            <button onClick={searchOrders} className="bg-trust-blue text-on-primary px-6 py-3 rounded-lg hover:bg-primary transition-colors font-hanken font-semibold" style={{ fontSize: '16px' }}>
              Find Orders
            </button>
          </div>
        </div>

        {!searched ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '80px' }}>package_2</span>
            <h3 className="font-hanken text-primary mt-4" style={{ fontSize: '24px', fontWeight: '600' }}>Enter your email to view orders</h3>
          </div>
        ) : loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2].map(i => <div key={i} className="skeleton h-32 rounded-xl" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '80px' }}>search_off</span>
            <h3 className="font-hanken text-primary mt-4" style={{ fontSize: '24px', fontWeight: '600' }}>No orders found</h3>
            <p className="text-on-surface-variant mt-2" style={{ fontFamily: 'Inter', fontSize: '16px' }}>Try a different email or browse the marketplace</p>
            <Link to="/store" className="inline-block mt-6 bg-trust-blue text-on-primary px-6 py-3 rounded-lg hover:bg-primary transition-colors font-hanken font-semibold" style={{ fontSize: '16px', textDecoration: 'none' }}>
              Browse Marketplace
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {orders.map((order) => {
              const img = order.products?.product_images?.[0]?.enhanced_url || order.products?.product_images?.[0]?.raw_url;
              return (
                <div key={order.id} onClick={() => navigate(`/order/${order.id}`)}
                  className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 hover:border-action-cyan transition-all cursor-pointer"
                  style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div className="flex gap-5 items-start mb-5">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-surface-container flex-shrink-0">
                      {img ? <img src={img} alt={order.products?.title} className="w-full h-full object-cover" /> : (
                        <div className="w-full h-full flex items-center justify-center"><span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '28px' }}>image</span></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-hanken text-primary font-semibold truncate" style={{ fontSize: '18px' }}>{order.products?.title || 'Product'}</h3>
                        <span className="font-hanken text-primary font-bold flex-shrink-0" style={{ fontSize: '20px' }}>
                          {order.currency === 'INR' ? '₹' : order.currency === 'USD' ? '$' : order.currency === 'EUR' ? '€' : '£'}
                          {Number(order.amount / 100).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <p className="text-on-surface-variant" style={{ fontFamily: 'Inter', fontSize: '13px' }}>
                        Order #{order.id?.substring(0, 8)} · {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <StatusTimeline status={order.status || 'pending'} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
