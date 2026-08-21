import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { passportAPI } from '../../lib/api';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';

export default function Passport() {
  const { productId } = useParams();
  const [passport, setPassport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hashMatch, setHashMatch] = useState(null);

  useEffect(() => {
    passportAPI.getByProduct(productId)
      .then((res) => {
        setPassport(res.data);
        setHashMatch(res.data.hashMatch);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [productId]);

  if (loading) return (
    <div className="min-h-screen bg-paytm-bg flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );

  if (!passport) return (
    <div className="min-h-screen bg-paytm-bg flex items-center justify-center">
      <p className="text-gray-400">Passport not found</p>
    </div>
  );

  const { product, artisan } = passport;

  return (
    <div className="min-h-screen bg-paytm-bg py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <span className="text-5xl font-bold text-paytm-navy">saras</span>
          <span className="text-5xl font-bold text-paytm-cyan">TM</span>
          <p className="text-gray-400 mt-2 text-sm uppercase tracking-widest">Authenticity Passport</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-paytm-cyan/20">
          <div className="bg-paytm-navy p-6 text-center">
            <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden border-4 border-paytm-cyan/50">
              <div className="w-full h-full bg-paytm-cyan/20 flex items-center justify-center text-3xl font-bold text-white">
                {artisan?.name?.[0] || '?'}
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white">{product?.title}</h1>
            <p className="text-paytm-cyan mt-1">{artisan?.name} · {artisan?.region || product?.region_label}</p>
          </div>

          <div className="p-6 space-y-6">
            {product?.craft_type && (
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎨</span>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Craft Type</p>
                  <p className="font-semibold text-paytm-navy">{product.craft_type}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <span className="text-2xl">📍</span>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Origin</p>
                <p className="font-semibold text-paytm-navy">{artisan?.region || product?.region_label || 'India'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-2xl">🔐</span>
              <div className="flex-1">
                <p className="text-xs text-gray-400 uppercase tracking-wide">Verification Status</p>
                <div className="mt-1">
                  {passport.verification_status === 'community_verified' ? (
                    <Badge variant="green">✓ Community Verified</Badge>
                  ) : (
                    <Badge variant="orange">⏳ Verification Pending</Badge>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Self-declared by artisan. "Government Verified" requires GI registry integration (roadmap).
                </p>
              </div>
            </div>

            <div className="bg-paytm-bg rounded-2xl p-4">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Tamper Evidence</p>
              <div className="flex items-center gap-2 mb-2">
                {hashMatch ? (
                  <Badge variant="green">✓ Content Unchanged Since Verification</Badge>
                ) : (
                  <Badge variant="red">⚠ Content Modified</Badge>
                )}
              </div>
              <p className="font-mono text-xs text-gray-500 break-all">{passport.content_hash}</p>
              <p className="text-xs text-gray-400 mt-1">SHA-256 hash of listing content · verified on each view</p>
            </div>

            <div className="text-center border-t border-gray-100 pt-6">
              <p className="text-xs text-gray-400 mb-3 uppercase tracking-wide">Authenticity QR</p>
              <div className="flex justify-center">
                <img
                  src={passport.qr_url}
                  alt="Authenticity QR Code"
                  className="w-40 h-40 rounded-xl"
                />
              </div>
              <p className="text-xs text-gray-400 mt-3">Scan to verify on any device</p>
              <p className="text-xs text-gray-300 mt-1 italic">NFC tag writing available on request — QR works on any phone camera today.</p>
            </div>

            {product?.story_en && (
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Craft Story</p>
                <p className="text-sm text-gray-600 leading-relaxed">{product.story_en}</p>
              </div>
            )}
          </div>

          <div className="bg-paytm-bg px-6 py-4 text-center">
            <p className="text-xs text-gray-400">
              Issued by <span className="text-paytm-navy font-bold">SarasTM</span> · {new Date(passport.created_at || Date.now()).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
