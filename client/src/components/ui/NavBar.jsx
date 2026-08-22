import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import useCartStore from '../../store/cartStore';

export default function NavBar({ role }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();
  const { items } = useCartStore();
  const [search, setSearch] = useState('');
  const [userOpen, setUserOpen] = useState(false);

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/store?search=${encodeURIComponent(search.trim())}`);
  };

  const buyerLinks = [
    { to: '/store', label: 'Marketplace' },
    { to: '/artisan/dashboard', label: 'Artisans' },
    { to: '/artisan/compliance', label: 'Export Desk' },
  ];

  return (
    <header className="bg-surface border-b border-outline-variant sticky top-0 z-50" style={{ boxShadow: 'none' }}>
      <div className="flex justify-between items-center px-margin-desktop py-4 max-w-container-max mx-auto w-full">

        {/* Logo */}
        <Link to={role === 'artisan' ? '/artisan/dashboard' : '/'} className="font-hanken font-bold text-primary" style={{ fontSize: '24px', textDecoration: 'none' }}>
          SarasTM
        </Link>

        {/* Buyer Nav */}
        {role !== 'artisan' && (
          <nav className="hidden md:flex gap-8 items-center">
            {buyerLinks.map(({ to, label }) => {
              const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to.split('?')[0]));
              return (
                <Link key={to} to={to} style={{ textDecoration: 'none', paddingBottom: '4px', borderBottom: isActive ? '2px solid #E31E24' : '2px solid transparent', color: isActive ? '#001645' : '#444651', fontFamily: 'Hanken Grotesk', fontSize: '20px', fontWeight: '600', lineHeight: '28px', transition: 'color 0.2s' }}
                  onMouseEnter={(e) => { if (!isActive) e.target.style.color = '#00BAF2'; }}
                  onMouseLeave={(e) => { if (!isActive) e.target.style.color = '#444651'; }}>
                  {label}
                </Link>
              );
            })}
          </nav>
        )}

        {/* Right icons */}
        <div className="flex gap-4 items-center">
          {role !== 'artisan' && (
            <form onSubmit={handleSearch} className="relative hidden lg:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline" style={{ fontSize: '20px' }}>search</span>
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-DEFAULT focus:outline-none focus:border-action-cyan focus:ring-1 focus:ring-action-cyan text-body-md w-64 transition-all"
                placeholder="Search curated crafts..." style={{ fontFamily: 'Inter', fontSize: '16px' }} />
            </form>
          )}

          {role !== 'artisan' && (
            <Link to="/cart" className="relative p-2 text-on-surface-variant hover:text-action-cyan transition-colors" style={{ textDecoration: 'none' }}>
              <span className="material-symbols-outlined">shopping_bag</span>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-action-cyan text-white rounded-full flex items-center justify-center font-bold" style={{ width: '18px', height: '18px', fontSize: '10px' }}>
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>
          )}

          <span className="material-symbols-outlined text-on-surface-variant hover:text-action-cyan cursor-pointer transition-colors" style={{ fontSize: '24px' }}>language</span>
          <span className="material-symbols-outlined text-on-surface-variant hover:text-action-cyan cursor-pointer transition-colors" style={{ fontSize: '24px' }}>notifications</span>

          <div className="relative" onMouseEnter={() => setUserOpen(true)} onMouseLeave={() => setUserOpen(false)}>
            <span className="material-symbols-outlined text-on-surface-variant hover:text-action-cyan cursor-pointer transition-colors" style={{ fontSize: '24px' }}>account_circle</span>
            {userOpen && (
              <div className="absolute right-0 top-full bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg py-2 z-50" style={{ minWidth: '180px', boxShadow: '0 15px 40px rgba(0,41,112,0.15)' }}>
                {!user ? (
                  <>
                    <MenuItem onClick={() => navigate('/artisan/dashboard')} icon="dashboard" label="Artisan Portal" />
                    <MenuItem onClick={() => navigate('/store')} icon="store" label="Browse Store" />
                  </>
                ) : (
                  <>
                    <div className="px-4 py-3 border-b border-outline-variant">
                      <div className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Signed in as</div>
                      <div className="font-semibold text-primary truncate" style={{ fontSize: '13px' }}>{user.email}</div>
                    </div>
                    {role !== 'artisan' && <MenuItem onClick={() => navigate('/account')} icon="package_2" label="My Orders" />}
                    <MenuItem onClick={signOut} icon="logout" label="Sign Out" danger />
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function MenuItem({ onClick, icon, label, danger }) {
  return (
    <div onClick={onClick} className="flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors hover:bg-surface-container-low" style={{ color: danger ? '#E31E24' : '#191c1e', fontSize: '14px', fontWeight: '500' }}>
      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{icon}</span>
      {label}
    </div>
  );
}
