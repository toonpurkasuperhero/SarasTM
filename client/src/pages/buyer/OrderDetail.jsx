import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { buyerAPI, paymentsAPI } from '../../lib/api';
import OrderTracker from '../../components/buyer/OrderTracker';
import ReviewForm from '../../components/buyer/ReviewForm';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReview, setShowReview] = useState(false);

  const fetchOrder = async () => {
    try {
      const res = await buyerAPI.getOrder(id);
      setOrder(res.data);
    } catch {
      toast.error('Order not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrder(); }, [id]);

  const handleDownloadEFIRA = async () => {
    try {
      const payoutId = order.escrow_entries?.[0]?.payouts?.[0]?.id;
      if (!payoutId) { toast.error('e-FIRA not yet available'); return; }
      const res = await paymentsAPI.downloadEFIRA(payoutId);
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'efira-sandbox.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to download e-FIRA');
    }
  };

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;
  if (!order) return <div className="page-container py-24 text-center"><p className="text-gray-400">Order not found</p></div>;

  const escrow = order.escrow_entries?.[0];
  const payout = escrow?.payouts?.[0];

  return (
    <div className="page-container py-8 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/account" className="text-paytm-cyan text-sm hover:underline">← My Orders</Link>
      </div>

      <div>
        <h1 className="section-title mb-1">Order Details</h1>
        <p className="text-sm text-gray-400">#{order.id?.slice(0, 8)} · {new Date(order.created_at).toLocaleDateString()}</p>
      </div>

      <div className="card">
        <h2 className="font-bold text-paytm-navy mb-6">Order Progress</h2>
        <OrderTracker currentStatus={order.status} />
      </div>

      <div className="card flex gap-4">
        <img
          src={order.products?.product_images?.[0]?.enhanced_url || 'https://source.unsplash.com/200x200/?craft'}
          alt={order.products?.title}
          className="w-20 h-20 object-cover rounded-xl flex-shrink-0"
        />
        <div>
          <h3 className="font-semibold text-paytm-navy">{order.products?.title}</h3>
          <p className="text-sm text-gray-400">{order.products?.craft_type}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="font-bold text-paytm-navy">₹{order.amount_inr?.toLocaleString()}</span>
            <Badge variant={
              order.status === 'delivered' ? 'green' :
              order.status === 'shipped' ? 'cyan' :
              order.status === 'paid' ? 'orange' : 'navy'
            }>{order.status}</Badge>
          </div>
          {order.gift_message && (
            <p className="text-sm text-paytm-cyan mt-2 italic">💌 "{order.gift_message}"</p>
          )}
        </div>
      </div>

      <div className="card space-y-3">
        <h2 className="font-bold text-paytm-navy">Payment & Escrow</h2>
        <div className="flex items-center gap-3">
          <span className="text-xl">🔒</span>
          <div>
            <p className="font-medium text-paytm-navy">
              {escrow?.status === 'released' ? 'Payment Released to Artisan' : 'Funds Held in Escrow'}
            </p>
            <Badge variant={escrow?.status === 'released' ? 'green' : 'orange'}>
              {escrow?.status === 'released' ? '✅ Released' : '🔒 Held'}
            </Badge>
          </div>
        </div>
        {payout && (
          <button
            onClick={handleDownloadEFIRA}
            className="btn-secondary w-full mt-2"
          >
            📄 Download e-FIRA (Sandbox)
          </button>
        )}
      </div>

      {order.status === 'delivered' && !showReview && (
        <div className="card text-center">
          <p className="text-2xl mb-2">⭐</p>
          <p className="font-semibold text-paytm-navy mb-1">How was your purchase?</p>
          <p className="text-sm text-gray-400 mb-4">Help other buyers discover this artisan's work</p>
          <button onClick={() => setShowReview(true)} className="btn-primary">Write a Review</button>
        </div>
      )}

      {showReview && (
        <div className="card">
          <h2 className="font-bold text-paytm-navy mb-4">Leave a Review</h2>
          <ReviewForm
            orderId={order.id}
            productId={order.product_id}
            onSuccess={() => setShowReview(false)}
          />
        </div>
      )}

      <Link to={`/passport/${order.product_id}`}>
        <div className="card flex items-center gap-3 hover:shadow-card-hover transition-shadow cursor-pointer">
          <span className="text-2xl">🔐</span>
          <div>
            <p className="font-semibold text-paytm-navy">View Authenticity Passport</p>
            <p className="text-sm text-gray-400">Verify provenance anytime</p>
          </div>
          <svg className="w-5 h-5 text-gray-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </Link>
    </div>
  );
}
