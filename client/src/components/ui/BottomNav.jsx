import { Link, useLocation } from 'react-router-dom';

const BUYER_TABS = [
  { to: '/store', icon: 'store', label: 'Shop' },
  { to: '/cart', icon: 'shopping_bag', label: 'Cart' },
  { to: '/account', icon: 'package_2', label: 'Orders' },
  { to: '/', icon: 'home', label: 'Home' },
];
const ARTISAN_TABS = [
  { to: '/artisan/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { to: '/artisan/voice', icon: 'mic', label: 'Record' },
  { to: '/artisan/compliance', icon: 'local_shipping', label: 'Logistics' },
  { to: '/artisan/payouts', icon: 'payments', label: 'Payouts' },
];

export default function BottomNav({ role }) {
  const location = useLocation();
  const tabs = role === 'artisan' ? ARTISAN_TABS : BUYER_TABS;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-container-lowest border-t border-outline-variant flex z-50"
      style={{ boxShadow: '0 -4px 12px rgba(0,0,0,0.05)' }}>
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.to || (tab.to !== '/' && tab.to !== '/store' && location.pathname.startsWith(tab.to));
        return (
          <Link key={tab.to + tab.label} to={tab.to} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8px 4px', textDecoration: 'none', color: isActive ? '#001645' : '#444651', borderTop: isActive ? '2px solid #00BAF2' : '2px solid transparent', transition: 'all 0.15s' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>{tab.icon}</span>
            <span style={{ fontFamily: 'Inter', fontSize: '10px', fontWeight: isActive ? '700' : '500', marginTop: '2px' }}>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
