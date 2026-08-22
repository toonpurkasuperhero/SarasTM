import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const NAV_ITEMS = [
  { to: '/artisan/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { to: '/artisan/voice', icon: 'mic_none', label: 'Voice Listing' },
  { to: '/artisan/orders', icon: 'shopping_bag', label: 'Orders' },
  { to: '/artisan/compliance', icon: 'local_shipping', label: 'Logistics' },
  { to: '/artisan/payouts', icon: 'payments', label: 'Payments' },
];

export default function SideNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [showSupport, setShowSupport] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');

  const handleSupportSubmit = (e) => {
    e.preventDefault();
    alert(`Support request submitted: "${supportMessage}". We will contact you at +91 ${user?.phone || '9876543210'} shortly!`);
    setSupportMessage('');
    setShowSupport(false);
  };

  const avatar = user?.bank_details_mock?.profile_photo_url || "https://sebrmbnztijnzbvnpnbq.supabase.co/storage/v1/object/public/product-images/artisans/34a1841b-9fd6-4409-96e3-fb61c5915071/profile.png";

  return (
    <>
      <nav aria-label="Sidebar Navigation"
        className="bg-surface-container-low border-r border-outline-variant h-screen w-64 fixed left-0 top-0 flex flex-col p-4 gap-2 z-40 hidden md:flex"
        style={{ boxShadow: 'none' }}>

        {/* Profile header */}
        <div className="mb-8 mt-4 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full overflow-hidden mb-4 border-2 border-primary-container relative">
            <img src={avatar} alt="Artisan Profile" className="w-full h-full object-cover" />
            <div className="absolute bottom-0 right-0 bg-heritage-red rounded-full p-1 border-2 border-surface-container-low">
              <span className="material-symbols-outlined text-white" style={{ fontSize: '10px', fontVariationSettings: "'FILL' 1" }}>check</span>
            </div>
          </div>
          <h2 className="font-hanken font-bold text-primary text-center truncate w-full px-2" style={{ fontSize: '20px', lineHeight: '28px' }}>
            {user?.name || 'Artisan Portal'}
          </h2>
          <span className="text-label-sm text-action-cyan uppercase tracking-wider mt-1" style={{ fontSize: '10px' }}>Verified by Saras AI</span>
        </div>

        {/* Nav links */}
        <div className="flex flex-col gap-1 flex-1">
          {NAV_ITEMS.map(({ to, icon, label }) => {
            const isActive = location.pathname === to || location.pathname.startsWith(to);
            return (
              <Link key={to} to={to} style={{ textDecoration: 'none' }}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-inter ${isActive ? 'bg-primary-container text-on-primary-container font-bold scale-[0.98]' : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'}`}>
                  <span className="material-symbols-outlined">{icon}</span>
                  <span style={{ fontSize: '16px' }}>{label}</span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* New listing CTA */}
        <button onClick={() => navigate('/artisan/voice')}
          className="bg-primary-container text-on-primary w-full py-3 rounded-lg font-inter font-bold mt-4 hover:bg-primary transition-colors flex items-center justify-center gap-2">
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add</span>
          New Listing
        </button>

        {/* Footer links */}
        <div className="mt-4 pt-4 border-t border-outline-variant flex flex-col gap-1">
          <button onClick={() => setShowSupport(true)} className="flex items-center gap-3 px-4 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-all text-left bg-transparent border-0 w-full focus:outline-none" style={{ fontSize: '14px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>help_outline</span>
            Support
          </button>
          <Link to="/artisan/settings" className="flex items-center gap-3 px-4 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-all" style={{ fontSize: '14px', textDecoration: 'none' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>settings</span>
            Settings
          </Link>
        </div>
      </nav>

      {/* Support Modal */}
      {showSupport && (
        <div className="fixed inset-0 bg-primary/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-outline-variant max-w-md w-full p-6 shadow-2xl relative animate-fade-in">
            <button onClick={() => setShowSupport(false)} className="absolute top-4 right-4 text-on-surface-variant hover:text-primary">
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 className="font-hanken text-primary text-2xl font-bold mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-action-cyan">help_center</span>
              Artisan Support
            </h3>
            <p className="text-on-surface-variant text-sm mb-6">Need help with logistics, payments, or listing creations? Speak in your language or write to us.</p>
            <form onSubmit={handleSupportSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Your Message</label>
                <textarea
                  required
                  rows={4}
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  placeholder="Describe your issue or request a callback..."
                  className="w-full bg-surface-lowest border border-outline-variant rounded-md p-3 text-sm focus:outline-none focus:border-action-cyan focus:ring-1 focus:ring-action-cyan resize-none"
                />
              </div>
              <button type="submit" className="w-full bg-trust-blue text-on-primary py-2.5 rounded-lg font-bold hover:bg-primary transition-all shadow-sm">
                Submit Support Request
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
