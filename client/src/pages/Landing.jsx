import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-paytm-navy">
      <div className="page-container py-20 text-center">
        <div className="animate-fade-in">
          <span className="badge-cyan mb-6 inline-flex">Build for India AI Hackathon — Paytm</span>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6">
            <span className="text-white">saras</span>
            <span className="text-paytm-cyan">TM</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/70 max-w-3xl mx-auto mb-4 leading-relaxed">
            Heritage-to-Global OS for Indian Artisans
          </p>
          <p className="text-base text-white/50 max-w-2xl mx-auto mb-12">
            Speak in your language, get a studio-quality global listing, a tamper-proof authenticity passport, auto-generated export paperwork, and money in your bank account.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/store" className="btn-primary text-lg px-10 py-4 rounded-2xl">
              Browse Crafts
            </Link>
            <Link to="/artisan/dashboard" className="btn-secondary text-lg px-10 py-4 rounded-2xl">
              I'm an Artisan →
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-24 animate-slide-up">
          {[
            { icon: '🎙️', title: 'Voice Listings', desc: 'Speak in 11 languages, get global-ready copy instantly' },
            { icon: '📸', title: 'AI Photo Studio', desc: 'Transform raw photos into premium product shots' },
            { icon: '🔐', title: 'Authenticity Passport', desc: 'QR-linked, tamper-evident provenance for every piece' },
            { icon: '📦', title: 'Export Compliance', desc: 'AI-assisted HSN codes and draft export documents' },
          ].map((feat) => (
            <div key={feat.title} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-left">
              <div className="text-3xl mb-3">{feat.icon}</div>
              <h3 className="font-bold text-white mb-2">{feat.title}</h3>
              <p className="text-sm text-white/50">{feat.desc}</p>
            </div>
          ))}
        </div>

        <p className="mt-16 text-xs text-white/30">
          Unofficial hackathon concept built for Build for India AI Hackathon — not an official Paytm product.
        </p>
      </div>
    </div>
  );
}
