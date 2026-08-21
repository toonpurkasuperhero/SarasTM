import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { buyerAPI, passportAPI } from '../../lib/api';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import CurrencySelector from '../../components/buyer/CurrencySelector';
import useCartStore from '../../store/cartStore';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showNative, setShowNative] = useState(false);
  const [generatingPassport, setGeneratingPassport] = useState(false);
  const { currency, addItem, items } = useCartStore();
  const inCart = items.some((i) => i.id === id);

  const symbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };

  useEffect(() => {
    buyerAPI.getProduct(id)
      .then((res) => setProduct(res.data))
      .catch(() => toast.error('Product not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const getPrice = () => {
    if (!product) return 0;
    if (currency === 'INR') return product.price_inr;
    if (currency === 'USD') return product.price_usd;
    if (currency === 'EUR') return product.price_eur;
    return product.price_gbp;
  };

  const handleGeneratePassport = async () => {
    setGeneratingPassport(true);
    try {
      await passportAPI.generate(id);
      toast.success('Passport generated!');
      const res = await buyerAPI.getProduct(id);
      setProduct(res.data);
    } catch {
      toast.error('Failed to generate passport');
    } finally {
      setGeneratingPassport(false);
    }
  };

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;
  if (!product) return <div className="page-container py-24 text-center"><p className="text-gray-400">Product not found</p></div>;

  const images = product.product_images || [];

  return (
    <div className="page-container py-8">
      <nav className="text-sm text-gray-400 mb-6">
        <Link to="/store" className="hover:text-paytm-cyan">Store</Link>
        <span className="mx-2">›</span>
        <span className="text-paytm-navy">{product.craft_type}</span>
        <span className="mx-2">›</span>
        <span className="text-paytm-navy font-medium">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-4">
          <div className="aspect-square bg-paytm-bg rounded-2xl overflow-hidden">
            <img
              src={images[selectedImage]?.enhanced_url || images[selectedImage]?.raw_url || 'https://source.unsplash.com/600x600/?indian,craft'}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-3">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImage === i ? 'border-paytm-cyan' : 'border-transparent'
                  }`}
                >
                  <img src={img.enhanced_url || img.raw_url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              {product.craft_type && <Badge variant="cyan">{product.craft_type}</Badge>}
              {product.region_label && <Badge variant="navy">{product.region_label}</Badge>}
              {product.passports?.verification_status && (
                <Badge variant="green">✓ Passport Verified</Badge>
              )}
            </div>
            <h1 className="text-3xl font-extrabold text-paytm-navy leading-tight">{product.title}</h1>
          </div>

          <div className="flex items-end gap-3">
            <span className="text-4xl font-extrabold text-paytm-navy">
              {symbols[currency]}{Number(getPrice() || 0).toLocaleString()}
            </span>
            <span className="text-gray-400 mb-1">{currency}</span>
            <div className="ml-auto"><CurrencySelector compact /></div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold text-paytm-navy">The Story Behind This Craft</h2>
              {product.story_native && (
                <button
                  onClick={() => setShowNative(!showNative)}
                  className="text-xs text-paytm-cyan hover:underline"
                >
                  {showNative ? 'Read in English' : 'Read in Original Language'}
                </button>
              )}
            </div>
            <p className="text-gray-600 leading-relaxed">
              {showNative ? product.story_native : product.story_en}
            </p>
          </div>

          {product.seo_tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.seo_tags.map((tag) => (
                <span key={tag} className="text-xs px-3 py-1 bg-paytm-bg text-paytm-navy rounded-full">{tag}</span>
              ))}
            </div>
          )}

          {product.artisans && (
            <div className="bg-paytm-bg rounded-xl p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-paytm-cyan/20 flex items-center justify-center text-paytm-navy font-bold text-lg">
                {product.artisans.name?.[0]}
              </div>
              <div>
                <p className="font-semibold text-paytm-navy">{product.artisans.name}</p>
                <p className="text-sm text-gray-500">Artisan · {product.artisans.region}</p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {product.passports?.qr_url ? (
              <Link to={`/passport/${product.id}`}>
                <Button variant="secondary" className="w-full flex items-center justify-center gap-2">
                  🔐 View Authenticity Passport
                </Button>
              </Link>
            ) : (
              <Button
                variant="secondary"
                className="w-full"
                onClick={handleGeneratePassport}
                disabled={generatingPassport}
              >
                {generatingPassport ? 'Generating Passport...' : '🔐 Generate Authenticity Passport'}
              </Button>
            )}

            <Button
              onClick={() => { addItem(product); toast.success('Added to cart!'); }}
              disabled={inCart}
              size="lg"
              className="w-full"
            >
              {inCart ? '✓ In Your Cart' : 'Add to Cart'}
            </Button>

            {inCart && (
              <Button onClick={() => navigate('/cart')} size="lg" variant="secondary" className="w-full">
                Go to Cart →
              </Button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { icon: '🔐', label: 'Verified Provenance' },
              { icon: '🌍', label: 'Global Shipping' },
              { icon: '🔒', label: 'Secure Escrow' },
            ].map((item) => (
              <div key={item.label} className="bg-paytm-bg rounded-xl p-3">
                <div className="text-xl mb-1">{item.icon}</div>
                <p className="text-xs font-medium text-paytm-navy">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
