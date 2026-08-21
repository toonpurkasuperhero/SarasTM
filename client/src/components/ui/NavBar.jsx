import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import useCartStore from '../../store/cartStore';
import CurrencySelector from '../buyer/CurrencySelector';

export default function NavBar({ role }) {
  const { items } = useCartStore();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const cartCount = items.length;

  const buyerLinks = [
    { to: '/store', label: 'Shop' },
    { to: '/account', label: 'My Orders' },
  ];

  const artisanLinks = [
    { to: '/artisan/dashboard', label: 'Dashboard' },
    { to: '/artisan/voice', label: 'New Listing' },
    { to: '/artisan/compliance', label: 'Export Docs' },
    { to: '/artisan/payouts', label: 'Payouts' },
  ];

  const links = role === 'artisan' ? artisanLinks : buyerLinks;

  return (
    <header className="sticky top-0 z-40 bg-paytm-navy shadow-lg">
      <div className="page-container">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight">
              <span className="text-white">saras</span>
              <span className="text-paytm-cyan">TM</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium transition-colors ${
                  location.pathname.startsWith(link.to)
                    ? 'text-paytm-cyan'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              <CurrencySelector compact />
            </div>

            {role !== 'artisan' && (
              <Link to="/cart" className="relative p-2 text-white hover:text-paytm-cyan transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-paytm-cyan text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            <Link
              to={role === 'artisan' ? '/artisan/dashboard' : '/account'}
              className="p-2 text-white hover:text-paytm-cyan transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>

            <button
              className="md:hidden p-2 text-white"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
              </svg>
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden py-4 border-t border-white/10 animate-fade-in">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="block py-3 text-white/80 hover:text-paytm-cyan transition-colors text-sm font-medium"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3">
              <CurrencySelector />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
