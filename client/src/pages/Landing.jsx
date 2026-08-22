import { Link } from 'react-router-dom';

const HERO_IMAGE = 'https://sebrmbnztijnzbvnpnbq.supabase.co/storage/v1/object/public/product-images/artisans/34a1841b-9fd6-4409-96e3-fb61c5915071/profile.png';
// Flag emojis used inline — no external dependency
const FLAG_US = null;
const FLAG_EU = null;
const FLAG_UK = null;

export default function Landing() {
  return (
    <div className="bg-surface text-on-surface font-inter min-h-screen flex flex-col">

      {/* ── Hero Section ── */}
      <section className="relative pt-24 pb-32 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto overflow-hidden w-full">
        <div className="absolute inset-0 bg-mandala opacity-50 pointer-events-none" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter items-center relative z-10">

          {/* Left: Headline */}
          <div className="flex flex-col gap-6">
            <h1 className="font-hanken text-primary" style={{ fontSize: '48px', lineHeight: '56px', letterSpacing: '-0.02em', fontWeight: '700' }}>
              Your Voice.<br />The World's Marketplace.
            </h1>
            <p className="text-on-surface-variant" style={{ fontFamily: 'Inter', fontSize: '18px', lineHeight: '28px', maxWidth: '480px' }}>
              Turn your craft into a global brand with AI. No English needed. No agency required.
            </p>
            <div className="flex gap-4 mt-4 flex-wrap">
              <Link to="/artisan/dashboard"
                className="bg-trust-blue text-on-primary px-8 py-3 rounded-lg hover:bg-primary transition-colors shadow-sm font-hanken"
                style={{ fontSize: '20px', fontWeight: '600', lineHeight: '28px', textDecoration: 'none' }}>
                Start Selling
              </Link>
              <Link to="/store"
                className="border border-action-cyan text-trust-blue px-8 py-3 rounded-lg hover:bg-action-cyan/10 transition-colors font-hanken"
                style={{ fontSize: '20px', fontWeight: '600', lineHeight: '28px', textDecoration: 'none', background: 'rgba(0,186,242,0.05)' }}>
                See How it Works
              </Link>
            </div>
          </div>

          {/* Right: Hero image */}
          <div className="relative h-[500px] w-full rounded-xl overflow-hidden shadow-lg border border-outline-variant/30">
            <img src={HERO_IMAGE} alt="Madhubani artisan with tablet" className="object-cover w-full h-full absolute inset-0" />
            <div className="absolute bottom-4 left-4 right-4 border border-outline-variant p-4 rounded-lg flex items-center justify-between"
              style={{ background: 'rgba(247,249,252,0.9)', backdropFilter: 'blur(12px)', boxShadow: '0 4px 24px rgba(0,41,112,0.08)' }}>
              <div>
                <p className="font-hanken font-semibold text-primary" style={{ fontSize: '20px' }}>Radha Devi</p>
                <p className="text-on-surface-variant uppercase tracking-wider" style={{ fontFamily: 'Inter', fontSize: '12px', fontWeight: '600', letterSpacing: '0.05em' }}>Madhubani, Bihar</p>
              </div>
              <div className="text-right">
                <p className="font-hanken font-semibold text-trust-blue" style={{ fontSize: '20px' }}>Sold for $450</p>
                <p className="text-on-surface-variant" style={{ fontFamily: 'Inter', fontSize: '12px' }}>To a buyer in New York</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Bento Grid ── */}
      <section className="py-24 px-margin-mobile md:px-margin-desktop bg-surface-container-lowest border-t border-outline-variant/20">
        <div className="max-w-container-max mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-hanken text-primary mb-4" style={{ fontSize: '32px', lineHeight: '40px', fontWeight: '600' }}>
              Empowering Artisans with AI
            </h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto" style={{ fontFamily: 'Inter', fontSize: '18px', lineHeight: '28px' }}>
              Seamlessly bridge the gap between local craftsmanship and global buyers using advanced technology tailored for simplicity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Feature 1: Voice to Listing (2 cols) */}
            <div className="md:col-span-2 bg-surface border border-outline-variant/50 rounded-xl p-8 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-surface-container-high opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 flex flex-col h-full">
                <div className="mb-6 w-12 h-12 rounded-full flex items-center justify-center text-action-cyan" style={{ background: 'rgba(0,186,242,0.1)' }}>
                  <span className="material-symbols-outlined">mic</span>
                </div>
                <h3 className="font-hanken text-primary mb-2" style={{ fontSize: '20px', fontWeight: '600' }}>Voice to Global Listing</h3>
                <p className="text-on-surface-variant mb-6 flex-grow" style={{ fontFamily: 'Inter', fontSize: '16px', lineHeight: '24px' }}>
                  Speak in Hindi, Tamil, Urdu, or your local language. Our AI instantly translates and formats it into a professional, SEO-optimized English product listing.
                </p>
                <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-4 shadow-sm flex items-center gap-4">
                  <div className="bg-surface-gray p-3 rounded-full">
                    <span className="material-symbols-outlined text-on-surface-variant">graphic_eq</span>
                  </div>
                  <div className="flex-grow">
                    <p className="text-on-surface-variant uppercase tracking-wider mb-1" style={{ fontFamily: 'Inter', fontSize: '12px', fontWeight: '600' }}>Hindi Input</p>
                    <p className="text-primary italic" style={{ fontFamily: 'Inter', fontSize: '16px' }}>"यह सिल्क की साड़ी हाथ से बुनी गई है..."</p>
                  </div>
                  <span className="material-symbols-outlined text-action-cyan">arrow_forward</span>
                  <div className="flex-grow text-right">
                    <p className="text-on-surface-variant uppercase tracking-wider mb-1" style={{ fontFamily: 'Inter', fontSize: '12px', fontWeight: '600' }}>Global Listing</p>
                    <p className="text-primary font-semibold" style={{ fontFamily: 'Inter', fontSize: '16px' }}>Handwoven Pure Silk Saree</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2: Authenticity Passport */}
            <div className="bg-surface border border-heritage-red/20 rounded-xl p-8 relative overflow-hidden group" style={{ boxShadow: 'inset 0 0 20px rgba(227,30,36,0.02)' }}>
              <div className="absolute inset-0 bg-mandala opacity-20 pointer-events-none" />
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-heritage-red" style={{ background: 'rgba(227,30,36,0.1)' }}>
                    <span className="material-symbols-outlined">verified</span>
                  </div>
                  <span className="bg-heritage-red/10 text-heritage-red uppercase tracking-wider px-3 py-1 rounded-full" style={{ fontFamily: 'Inter', fontSize: '12px', fontWeight: '600' }}>
                    Verified by Saras AI
                  </span>
                </div>
                <h3 className="font-hanken text-primary mb-2" style={{ fontSize: '20px', fontWeight: '600' }}>Authenticity Passport</h3>
                <p className="text-on-surface-variant mb-6" style={{ fontFamily: 'Inter', fontSize: '16px', lineHeight: '24px' }}>
                  Cryptographically verified certificates ensuring the origin, materials, and authenticity of every handcrafted item.
                </p>
                <div className="mt-auto border border-outline-variant/30 p-4 rounded-lg bg-surface-container-lowest flex justify-center items-center">
                  <div className="w-24 h-24 border-2 border-dashed border-outline-variant/50 flex flex-col items-center justify-center text-on-surface-variant">
                    <span className="material-symbols-outlined mb-1">qr_code_2</span>
                    <span style={{ fontFamily: 'Inter', fontSize: '12px', fontWeight: '600', textAlign: 'center' }}>Scan to Verify</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 3: Multi-Currency */}
            <div className="md:col-span-3 bg-surface border border-outline-variant/50 rounded-xl p-8 flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <div className="mb-6 w-12 h-12 rounded-full flex items-center justify-center text-trust-blue" style={{ background: 'rgba(0,41,112,0.1)' }}>
                  <span className="material-symbols-outlined">currency_exchange</span>
                </div>
                <h3 className="font-hanken text-primary mb-2" style={{ fontSize: '20px', fontWeight: '600' }}>Live Multi-Currency Pricing</h3>
                <p className="text-on-surface-variant" style={{ fontFamily: 'Inter', fontSize: '16px', lineHeight: '24px' }}>
                  Reach buyers worldwide with real-time global pricing. You set your price in INR, and we handle the conversion, ensuring you get paid exactly what you expect.
                </p>
              </div>
              <div className="flex-1 w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-6 relative overflow-hidden" style={{ boxShadow: '0 8px 32px rgba(0,41,112,0.06)' }}>
                <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full pointer-events-none" style={{ background: 'rgba(0,186,242,0.05)', filter: 'blur(32px)' }} />
                <div className="flex justify-between items-end mb-4 border-b border-outline-variant/20 pb-4">
                  <div>
                    <p className="text-on-surface-variant uppercase tracking-wider mb-1" style={{ fontFamily: 'Inter', fontSize: '12px', fontWeight: '600' }}>Your Price (Base)</p>
                    <p className="font-hanken text-primary" style={{ fontSize: '24px', fontWeight: '600' }}>₹12,500</p>
                  </div>
                  <span className="material-symbols-outlined text-action-cyan">sync_alt</span>
                </div>
                <div className="space-y-3">
                  {[{ flag: '🇺🇸', code: 'USD', val: '$152.40' }, { flag: '🇪🇺', code: 'EUR', val: '€138.25' }, { flag: '🇬🇧', code: 'GBP', val: '£120.10' }].map(({ flag, code, val }) => (
                    <div key={code} className="flex justify-between items-center">
                      <span className="text-on-surface-variant flex items-center gap-2" style={{ fontFamily: 'Inter', fontSize: '16px' }}>
                        <span style={{ fontSize: '20px' }}>{flag}</span> {code}
                      </span>
                      <span className="font-hanken text-primary font-semibold" style={{ fontSize: '20px' }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-primary flex flex-col items-center justify-center py-12 px-margin-desktop gap-8 w-full">
        <div className="font-hanken text-on-primary" style={{ fontSize: '32px', fontWeight: '600' }}>SarasTM</div>
        <div className="flex gap-6 flex-wrap justify-center">
          {['Cultural Heritage', 'Export Compliance', 'Privacy Policy', 'Terms of Service'].map((l) => (
            <a key={l} href="#" className="text-surface-variant hover:text-on-primary transition-colors uppercase tracking-wider" style={{ fontFamily: 'Inter', fontSize: '12px', fontWeight: '600', textDecoration: 'none' }}>{l}</a>
          ))}
        </div>
        <p className="text-surface-variant text-center opacity-70" style={{ fontFamily: 'Inter', fontSize: '12px' }}>
          © 2024 Saras Trade Marketplace. Empowering Indian Craftsmanship through AI.
        </p>
      </footer>
    </div>
  );
}
