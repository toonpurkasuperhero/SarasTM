import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
const DEMO_PAYOUTS = [
  { id: 'p1', created_at: '2026-08-18', amount_inr: 45000, status: 'completed', products: { title: 'Kanchipuram Bridal Silk Saree' } },
  { id: 'p2', created_at: '2026-08-10', amount_inr: 12500, status: 'completed', products: { title: 'Tree of Life Madhubani Painting' } },
  { id: 'p3', created_at: '2026-07-28', amount_inr: 8200, status: 'pending', products: { title: 'Blue Pottery Vase Set' } },
];

export default function PayoutLedger() {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/api/payments/payouts`).then(r => setPayouts(r.data?.length ? r.data : DEMO_PAYOUTS)).catch(() => setPayouts(DEMO_PAYOUTS)).finally(() => setLoading(false));
  }, []);

  const downloadEFIRA = async (payoutId) => {
    try {
      const res = await axios.get(`${API}/api/payments/efira/${payoutId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a'); a.href = url; a.download = `efira-${payoutId}.pdf`; a.click();
    } catch { toast.error('e-FIRA not available for this payout.'); }
  };

  const total = payouts.filter(p => p.status === 'completed').reduce((s, p) => s + (p.amount_inr || 0), 0);

  return (
    <div className="bg-surface min-h-screen" style={{ padding: '32px 64px' }}>
      <div className="max-w-container-max mx-auto">

        <div className="mb-10">
          <h1 className="font-hanken text-primary mb-3" style={{ fontSize: '48px', lineHeight: '56px', letterSpacing: '-0.02em', fontWeight: '700' }}>Payout Ledger</h1>
          <p className="text-on-surface-variant" style={{ fontFamily: 'Inter', fontSize: '18px', lineHeight: '28px' }}>
            Track your earnings, view payout history, and download e-FIRA documents.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Total Received', value: `₹${total.toLocaleString('en-IN')}`, icon: 'account_balance_wallet', color: 'text-primary' },
            { label: 'Completed', value: payouts.filter(p => p.status === 'completed').length, icon: 'check_circle', color: 'text-green-600' },
            { label: 'Pending', value: payouts.filter(p => p.status === 'pending').length, icon: 'pending', color: 'text-orange-500' },
          ].map(({ label, value, icon, color }) => (
            <div key={label} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <span className={`material-symbols-outlined ${color}`} style={{ fontSize: '24px' }}>{icon}</span>
                <span className="text-on-surface-variant uppercase tracking-wider" style={{ fontFamily: 'Inter', fontSize: '12px', fontWeight: '600' }}>{label}</span>
              </div>
              <p className={`font-hanken font-bold ${color}`} style={{ fontSize: '32px' }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Payouts Table */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between">
            <h2 className="font-hanken text-primary" style={{ fontSize: '20px', fontWeight: '600' }}>Transaction History</h2>
          </div>
          {loading ? (
            <div className="p-8 flex flex-col gap-4">
              {[1, 2, 3].map(i => <div key={i} className="skeleton h-14 rounded-lg" />)}
            </div>
          ) : (
            <div className="divide-y divide-outline-variant">
              {payouts.map((p) => (
                <div key={p.id} className="px-6 py-4 flex items-center gap-4 hover:bg-surface-container-low transition-colors">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${p.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-500'}`}>
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{p.status === 'completed' ? 'check' : 'hourglass_empty'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-on-surface truncate" style={{ fontFamily: 'Inter', fontSize: '15px' }}>{p.products?.title || 'Product Sale'}</p>
                    <p className="text-on-surface-variant" style={{ fontFamily: 'Inter', fontSize: '13px' }}>{new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-hanken font-bold text-primary" style={{ fontSize: '18px' }}>₹{Number(p.amount_inr).toLocaleString('en-IN')}</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${p.status === 'completed' ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-600'}`}>{p.status}</span>
                  </div>
                  {p.status === 'completed' && (
                    <button onClick={() => downloadEFIRA(p.id)} className="ml-4 flex items-center gap-1 text-action-cyan hover:underline flex-shrink-0" style={{ fontFamily: 'Inter', fontSize: '13px', fontWeight: '600' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>download</span>
                      e-FIRA
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notice */}
        <div className="mt-6 p-4 bg-surface-container border border-outline-variant rounded-lg flex items-start gap-3">
          <span className="material-symbols-outlined text-action-cyan flex-shrink-0">info</span>
          <p className="text-on-surface-variant" style={{ fontFamily: 'Inter', fontSize: '14px', lineHeight: '20px' }}>
            e-FIRA documents are generated in sandbox mode and are watermarked "DEMO". For real FIRA, complete AD-II bank certification.
          </p>
        </div>
      </div>
    </div>
  );
}
