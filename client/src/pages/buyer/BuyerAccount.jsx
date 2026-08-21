import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { buyerAPI } from '../../lib/api';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import toast from 'react-hot-toast';

export default function BuyerAccount() {
  const { user, signIn, signUp, signOut, signInWithGoogle, loading: authLoading } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [authMode, setAuthMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authLoading2, setAuthLoading2] = useState(false);

  useEffect(() => {
    if (user) {
      Promise.all([buyerAPI.getMyOrders(), buyerAPI.getWishlist()])
        .then(([ordersRes, wishlistRes]) => {
          setOrders(ordersRes.data);
          setWishlist(wishlistRes.data);
        })
        .catch(() => {})
        .finally(() => setOrdersLoading(false));
    }
  }, [user]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthLoading2(true);
    try {
      if (authMode === 'signin') {
        await signIn(email, password);
        toast.success('Welcome back!');
      } else {
        await signUp(email, password, name);
        toast.success('Account created! Check your email to verify.');
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setAuthLoading2(false);
    }
  };

  const getStatusVariant = (status) => {
    if (status === 'delivered') return 'green';
    if (status === 'shipped') return 'cyan';
    if (status === 'paid') return 'orange';
    return 'navy';
  };

  if (authLoading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;

  if (!user) {
    return (
      <div className="page-container py-16 max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="section-title">My Account</h1>
          <p className="text-gray-500 mt-1">Sign in to view your orders and wishlist</p>
        </div>
        <div className="card space-y-4">
          <div className="flex bg-paytm-bg rounded-xl p-1">
            {['signin', 'signup'].map((mode) => (
              <button
                key={mode}
                onClick={() => setAuthMode(mode)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  authMode === mode ? 'bg-white shadow text-paytm-navy' : 'text-gray-400'
                }`}
              >
                {mode === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>
          <form onSubmit={handleAuth} className="space-y-3">
            {authMode === 'signup' && (
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="input-field" />
            )}
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="input-field" required />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="input-field" required />
            <Button type="submit" disabled={authLoading2} className="w-full">
              {authLoading2 ? 'Please wait...' : authMode === 'signin' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>
          <div className="relative text-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
            <span className="relative bg-white px-3 text-xs text-gray-400">or</span>
          </div>
          <Button variant="secondary" className="w-full" onClick={signInWithGoogle}>
            Sign in with Google
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">My Account</h1>
          <p className="text-gray-500">{user.email}</p>
        </div>
        <Button variant="ghost" onClick={signOut}>Sign Out</Button>
      </div>

      <div>
        <h2 className="text-xl font-bold text-paytm-navy mb-4">My Orders</h2>
        {ordersLoading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : orders.length === 0 ? (
          <div className="card text-center py-10">
            <p className="text-5xl mb-3">📦</p>
            <p className="text-gray-400">No orders yet</p>
            <Link to="/store" className="btn-primary inline-block mt-4">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link to={`/order/${order.id}`} key={order.id} className="card flex items-center gap-4 hover:shadow-card-hover transition-shadow cursor-pointer block">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-paytm-navy">{order.products?.title}</span>
                    <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                  </div>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {new Date(order.created_at).toLocaleDateString()} · ₹{order.amount_inr?.toLocaleString()}
                  </p>
                  {order.gift_message && (
                    <p className="text-sm text-paytm-cyan mt-1 italic">💌 "{order.gift_message}"</p>
                  )}
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        )}
      </div>

      {wishlist.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-paytm-navy mb-4">Wishlist ♡</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {wishlist.map((item) => (
              <Link to={`/product/${item.product_id}`} key={item.id} className="card-hover text-center p-4">
                <img
                  src={item.products?.product_images?.[0]?.enhanced_url || 'https://source.unsplash.com/200x200/?craft'}
                  alt={item.products?.title}
                  className="w-full h-28 object-cover rounded-xl mb-2"
                />
                <p className="text-sm font-medium text-paytm-navy line-clamp-2">{item.products?.title}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
