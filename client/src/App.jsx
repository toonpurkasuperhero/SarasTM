import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import useAuthStore from './store/authStore';
import NavBar from './components/ui/NavBar';
import SideNav from './components/ui/SideNav';
import BottomNav from './components/ui/BottomNav';

import Landing from './pages/Landing';
import Login from './pages/Login';
import ArtisanDashboard from './pages/artisan/ArtisanDashboard';
import VoiceListing from './pages/artisan/VoiceListing';
import PhotoStudio from './pages/artisan/PhotoStudio';
import ExportAssistant from './pages/artisan/ExportAssistant';
import PayoutLedger from './pages/artisan/PayoutLedger';
import ArtisanListings from './pages/artisan/ArtisanListings';
import ArtisanSettings from './pages/artisan/ArtisanSettings';
import ArtisanOrders from './pages/artisan/ArtisanOrders';

import Storefront from './pages/buyer/Storefront';
import ProductDetail from './pages/buyer/ProductDetail';
import Passport from './pages/buyer/Passport';
import Cart from './pages/buyer/Cart';
import Checkout from './pages/buyer/Checkout';
import OrderConfirm from './pages/buyer/OrderConfirm';
import BuyerAccount from './pages/buyer/BuyerAccount';
import OrderDetail from './pages/buyer/OrderDetail';

function BuyerLayout({ children }) {
  return (
    <div className="min-h-screen bg-surface pb-20 md:pb-0">
      <NavBar role="buyer" />
      <main>{children}</main>
      <BottomNav role="buyer" />
    </div>
  );
}

function ArtisanLayout({ children }) {
  return (
    <div className="min-h-screen bg-surface flex">
      <SideNav />
      <div className="flex-1 md:ml-64 flex flex-col">
        <main className="flex-1">{children}</main>
      </div>
      <BottomNav role="artisan" />
    </div>
  );
}

function ArtisanRouteGuard({ children }) {
  const { user, loading } = useAuthStore();
  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-action-cyan" style={{ fontSize: '48px' }}>refresh</span>
      </div>
    );
  }
  if (!user || user.role !== 'artisan') {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  const { initialize } = useAuthStore();
  useEffect(() => { initialize(); }, [initialize]);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#001645', color: '#fff', borderRadius: '8px', fontFamily: 'Inter', fontSize: '14px' },
          success: { iconTheme: { primary: '#00BAF2', secondary: '#fff' } },
        }}
      />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/passport/:productId" element={<Passport />} />

        <Route path="/artisan/*" element={
          <ArtisanRouteGuard>
            <ArtisanLayout>
              <Routes>
                <Route path="dashboard" element={<ArtisanDashboard />} />
                <Route path="voice" element={<VoiceListing />} />
                <Route path="photo" element={<PhotoStudio />} />
                <Route path="orders" element={<ArtisanOrders />} />
                <Route path="compliance" element={<ExportAssistant />} />
                <Route path="payouts" element={<PayoutLedger />} />
                <Route path="listings" element={<ArtisanListings />} />
                <Route path="settings" element={<ArtisanSettings />} />
                <Route path="*" element={<ArtisanDashboard />} />
              </Routes>
            </ArtisanLayout>
          </ArtisanRouteGuard>
        } />

        <Route path="/*" element={
          <BuyerLayout>
            <Routes>
              <Route path="store" element={<Storefront />} />
              <Route path="product/:id" element={<ProductDetail />} />
              <Route path="cart" element={<Cart />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="order-confirm" element={<OrderConfirm />} />
              <Route path="account" element={<BuyerAccount />} />
              <Route path="order/:id" element={<OrderDetail />} />
              <Route path="*" element={<Storefront />} />
            </Routes>
          </BuyerLayout>
        } />
      </Routes>
    </BrowserRouter>
  );
}
