import { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { paymentsAPI, buyerAPI } from '../../lib/api';
import toast from 'react-hot-toast';

export default function PayoutLedger() {
  const [escrowEntries, setEscrowEntries] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(null);

  const fetchData = async () => {
    try {
      const [escrowRes, payoutRes] = await Promise.all([
        paymentsAPI.getEscrowEntries(),
        paymentsAPI.getPayouts(),
      ]);
      setEscrowEntries(escrowRes.data);
      setPayouts(payoutRes.data);
    } catch {
      toast.error('Failed to load ledger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSimulatePayout = async (escrowId, orderId) => {
    setSimulating(escrowId);
    try {
      await paymentsAPI.simulatePayout(escrowId);
      toast.success('💰 Payout simulated! e-FIRA generated.');
      await fetchData();
    } catch {
      toast.error('Simulation failed');
    } finally {
      setSimulating(null);
    }
  };

  const handleDownloadEFIRA = async (payoutId) => {
    try {
      const res = await paymentsAPI.downloadEFIRA(payoutId);
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'efira-sandbox.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to download');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await buyerAPI.updateOrderStatus(orderId, newStatus);
      toast.success('Order status updated');
      await fetchData();
    } catch {
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;
  }

  return (
    <div className="page-container py-8 space-y-6">
      <div>
        <h1 className="section-title mb-2">Payout Ledger</h1>
        <p className="text-gray-500">Manage escrow entries and simulate payouts</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
        <span className="text-amber-500 font-bold text-lg">🔬</span>
        <p className="text-sm font-semibold text-amber-700">TEST MODE — No real money moves. All payouts are sandbox simulations.</p>
      </div>

      <div>
        <h2 className="text-xl font-bold text-paytm-navy mb-4">Escrow Entries</h2>
        {escrowEntries.length === 0 ? (
          <Card className="text-center py-10">
            <p className="text-gray-400">No orders yet</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {escrowEntries.map((entry) => (
              <Card key={entry.id} className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-paytm-navy">{entry.orders?.products?.title}</span>
                    <Badge variant={entry.status === 'held' ? 'orange' : entry.status === 'released' ? 'green' : 'navy'}>
                      {entry.status === 'held' ? '🔒 Held in Escrow' : entry.status === 'released' ? '✅ Released' : entry.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Order: {entry.order_id?.slice(0, 8)} · Buyer: {entry.orders?.buyer_email}
                  </p>
                  <p className="font-bold text-paytm-navy mt-1">
                    ₹{entry.orders?.amount_inr?.toLocaleString()}
                  </p>
                  {entry.orders?.gift_message && (
                    <p className="text-sm text-paytm-cyan mt-1 italic">
                      💌 "{entry.orders.gift_message}"
                    </p>
                  )}

                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-gray-400">Order status:</span>
                    {['pending', 'paid', 'shipped', 'delivered'].map((s) => (
                      <button
                        key={s}
                        onClick={() => handleUpdateOrderStatus(entry.order_id, s)}
                        className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                          entry.orders?.status === s
                            ? 'bg-paytm-cyan text-white border-paytm-cyan'
                            : 'border-gray-200 text-gray-500 hover:border-paytm-cyan'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {entry.status === 'held' && (
                  <Button
                    onClick={() => handleSimulatePayout(entry.id, entry.order_id)}
                    disabled={simulating === entry.id}
                    size="sm"
                    className="flex-shrink-0"
                  >
                    {simulating === entry.id ? <Spinner size="sm" color="white" /> : '💰 Simulate Payout'}
                  </Button>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {payouts.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-paytm-navy mb-4">Completed Payouts</h2>
          <div className="space-y-4">
            {payouts.map((payout) => (
              <Card key={payout.id} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="green">✅ Paid Out</Badge>
                    <span className="font-bold text-paytm-navy">₹{payout.amount_inr?.toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    {new Date(payout.paid_at).toLocaleString()}
                  </p>
                </div>
                {payout.efira_pdf_url && (
                  <Button variant="secondary" size="sm" onClick={() => handleDownloadEFIRA(payout.id)}>
                    Download e-FIRA
                  </Button>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
