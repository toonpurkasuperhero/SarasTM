import { Link } from 'react-router-dom';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

export default function OrderConfirm() {
  return (
    <div className="page-container py-16 max-w-lg mx-auto text-center">
      <div className="card space-y-6">
        <div className="text-6xl animate-bounce">🎉</div>
        <div>
          <h1 className="text-2xl font-bold text-paytm-navy">Order Placed!</h1>
          <p className="text-gray-500 mt-2">Thank you for supporting Indian artisans</p>
        </div>

        <div className="bg-paytm-cyan/10 border border-paytm-cyan/20 rounded-xl p-4 text-left space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔒</span>
            <div>
              <p className="font-semibold text-paytm-navy">Funds Held in Escrow</p>
              <p className="text-sm text-gray-500">Released to artisan after shipment is confirmed</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">📦</span>
            <div>
              <p className="font-semibold text-paytm-navy">Artisan Notified</p>
              <p className="text-sm text-gray-500">Your order is being prepared with care</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <Badge variant="green">✅ Payment Confirmed — TEST MODE</Badge>
        </div>

        <div className="flex flex-col gap-3">
          <Link to="/account">
            <Button className="w-full">View My Orders</Button>
          </Link>
          <Link to="/store">
            <Button variant="secondary" className="w-full">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
