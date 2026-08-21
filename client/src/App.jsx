import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import useAuthStore from './store/authStore';
import NavBar from './components/ui/NavBar';
import BottomNav from './components/ui/BottomNav';

import Landing from './pages/Landing';
import ArtisanDashboard from './pages/artisan/ArtisanDashboard';
import VoiceListing from './pages/artisan/VoiceListing';
import PhotoStudio from './pages/artisan/PhotoStudio';
import ExportAssistant from './pages/artisan/ExportAssistant';
import PayoutLedger from './pages/artisan/PayoutLedger';

import Storefront from './pages/buyer/Storefront';
import ProductDetail from './pages/buyer/ProductDetail';
import Passport from './pages/buyer/Passport';
import Cart from './pages/buyer/Cart';
import Checkout from './pages/buyer/Checkout';
import OrderConfirm from './pages/buyer/OrderConfirm';
import BuyerAccount from './pages/buyer/BuyerAccount';
import OrderDetail from './pages/buyer/OrderDetail';

function Layout({ children, role }) {
  return (
    <div className="min-h-screen bg-paytm-bg pb-20 md:pb-0">
      <NavBar role={role} />
      <main>{children}</main>
      <BottomNav role={role} />
    </div>
  );
}

export default function App() {
  const { initialize } = useAuthStore();
  useEffect(() => { initialize(); }, [initialize]);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#002E6E', color: '#fff', borderRadius: '12px' },
          success: { iconTheme: { primary: '#00BAF2', secondary: '#fff' } },
        }}
      />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/passport/:productId" element={<Passport />} />

        <Route path="/artisan/*" element={
          <Layout role="artisan">
            <Routes>
              <Route path="dashboard" element={<ArtisanDashboard />} />
              <Route path="voice" element={<VoiceListing />} />
              <Route path="photo" element={<PhotoStudio />} />
              <Route path="compliance" element={<ExportAssistant />} />
              <Route path="payouts" element={<PayoutLedger />} />
            </Routes>
          </Layout>
        } />

        <Route path="/*" element={
          <Layout role="buyer">
            <Routes>
              <Route path="store" element={<Storefront />} />
              <Route path="product/:id" element={<ProductDetail />} />
              <Route path="cart" element={<Cart />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="order-confirm" element={<OrderConfirm />} />
              <Route path="account" element={<BuyerAccount />} />
              <Route path="order/:id" element={<OrderDetail />} />
            </Routes>
          </Layout>
        } />
      </Routes>
    </BrowserRouter>
  );
}
