import { useState, useEffect } from 'react';
import PhotoUploader from '../../components/artisan/PhotoUploader';
import BeforeAfterSlider from '../../components/artisan/BeforeAfterSlider';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { imagesAPI, listingAPI } from '../../lib/api';
import toast from 'react-hot-toast';

const BACKDROPS = [
  { name: 'studio_white', label: 'Studio White', preview: 'bg-gray-100' },
  { name: 'neutral_beige', label: 'Warm Beige', preview: 'bg-amber-50' },
  { name: 'dark_slate', label: 'Dark Slate', preview: 'bg-slate-700' },
  { name: 'sage_green', label: 'Sage Green', preview: 'bg-emerald-100' },
];

export default function PhotoStudio() {
  const [files, setFiles] = useState([]);
  const [productId, setProductId] = useState('');
  const [products, setProducts] = useState([]);
  const [selectedBackdrop, setSelectedBackdrop] = useState('studio_white');
  const [uploading, setUploading] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    listingAPI.getMyListings().then((res) => setProducts(res.data)).catch(() => {});
  }, []);

  const handleUploadAndEnhance = async () => {
    if (!files.length || !productId) {
      toast.error('Please select a product and upload photos');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append('photos', f));
      formData.append('productId', productId);
      await imagesAPI.upload(formData);
      toast.success('Photos uploaded!');

      setUploading(false);
      setEnhancing(true);
      const res = await imagesAPI.enhance(productId, selectedBackdrop);
      setResult(res.data);
      toast.success('✨ Enhancement complete!');
    } catch {
      toast.error('Enhancement failed. Please try again.');
    } finally {
      setUploading(false);
      setEnhancing(false);
    }
  };

  return (
    <div className="page-container py-8 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="section-title mb-2">AI Photo Studio</h1>
        <p className="text-gray-500">Transform raw craft photos into premium product shots</p>
      </div>

      <Card>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-paytm-navy mb-2">Select Product</label>
            <select value={productId} onChange={(e) => setProductId(e.target.value)} className="input-field">
              <option value="">Choose a listing to enhance</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>

          <PhotoUploader onFilesSelected={setFiles} maxFiles={3} />

          <div>
            <label className="block text-sm font-semibold text-paytm-navy mb-3">Studio Backdrop</label>
            <div className="grid grid-cols-4 gap-3">
              {BACKDROPS.map((b) => (
                <button
                  key={b.name}
                  onClick={() => setSelectedBackdrop(b.name)}
                  className={`aspect-square rounded-xl border-3 transition-all overflow-hidden relative ${
                    selectedBackdrop === b.name ? 'ring-2 ring-paytm-cyan ring-offset-2' : 'border-transparent'
                  }`}
                >
                  <div className={`w-full h-full ${b.preview}`} />
                  <span className="absolute bottom-1 left-0 right-0 text-center text-xs font-medium text-paytm-navy bg-white/80 py-0.5">
                    {b.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleUploadAndEnhance}
            disabled={uploading || enhancing || !files.length || !productId}
            size="lg"
            className="w-full"
          >
            {uploading ? 'Uploading...' : enhancing ? 'AI Enhancing...' : '✨ Enhance Photos'}
          </Button>

          {(uploading || enhancing) && (
            <div className="text-center py-4 space-y-3">
              <Spinner size="lg" />
              <p className="text-sm text-gray-500">
                {uploading ? 'Uploading your photos...' : 'Removing background & compositing studio backdrop...'}
              </p>
            </div>
          )}
        </div>
      </Card>

      {result && (
        <Card>
          <h2 className="text-lg font-bold text-paytm-navy mb-4">Enhancement Result</h2>
          <BeforeAfterSlider beforeUrl={result.rawUrl} afterUrl={result.enhancedUrl} />
          <div className="mt-4 flex gap-3">
            <a
              href={result.enhancedUrl}
              download="enhanced-photo.jpg"
              className="btn-secondary flex-1 text-center"
            >
              Download Enhanced
            </a>
            <Button className="flex-1">Use for Listing</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
