import { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { complianceAPI, listingAPI } from '../../lib/api';
import toast from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';

export default function ExportAssistant() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState(searchParams.get('productId') || '');
  const [description, setDescription] = useState('');
  const [hsnResult, setHsnResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    listingAPI.getMyListings()
      .then((res) => {
        setProducts(res.data);
        if (productId) {
          const product = res.data.find((p) => p.id === productId);
          if (product) setDescription(product.story_en || '');
        }
      })
      .catch(() => {});
  }, [productId]);

  const handleGetHSN = async () => {
    if (!description) { toast.error('Please enter a product description'); return; }
    setLoading(true);
    try {
      const res = await complianceAPI.getHSN(description);
      setHsnResult(res.data);
    } catch {
      toast.error('Failed to get HSN suggestion');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!productId) { toast.error('Please select a product first'); return; }
    setPdfLoading(true);
    try {
      const res = await complianceAPI.generateExportPDF(productId);
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'export-declaration-draft.pdf';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Draft PDF downloaded');
    } catch {
      toast.error('Failed to generate PDF');
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="page-container py-8 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="section-title mb-2">Export Compliance Assistant</h1>
        <p className="text-gray-500">AI-assisted HSN codes and draft export documents</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <span className="text-amber-500 text-xl flex-shrink-0">⚠️</span>
        <p className="text-sm text-amber-700">
          All AI suggestions are drafts for review. Please confirm with a licensed customs professional before filing any export declaration.
        </p>
      </div>

      <Card>
        <h2 className="text-lg font-bold text-paytm-navy mb-4">HSN Code Finder</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-paytm-navy mb-2">Select Product (optional)</label>
            <select
              value={productId}
              onChange={(e) => {
                setProductId(e.target.value);
                const p = products.find((p) => p.id === e.target.value);
                if (p) setDescription(p.story_en || '');
              }}
              className="input-field"
            >
              <option value="">Manual description</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-paytm-navy mb-2">Product Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="input-field resize-none"
              placeholder="Describe your craft product — material, technique, use..."
            />
          </div>

          <Button onClick={handleGetHSN} disabled={loading} className="w-full">
            {loading ? <Spinner size="sm" color="white" /> : '🔍 Find HSN Code'}
          </Button>
        </div>

        {hsnResult && (
          <div className="mt-6 space-y-4 animate-fade-in">
            <div className="bg-paytm-cyan/10 border border-paytm-cyan/20 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-paytm-navy text-lg">{hsnResult.code}</span>
                <Badge variant={hsnResult.confidence === 'high' ? 'green' : hsnResult.confidence === 'medium' ? 'cyan' : 'orange'}>
                  {hsnResult.confidence} confidence
                </Badge>
              </div>
              <p className="text-sm font-medium text-paytm-navy">{hsnResult.description}</p>
              <p className="text-sm text-gray-500 mt-2">{hsnResult.explanation}</p>
            </div>

            {hsnResult.alternatives?.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-paytm-navy mb-2">Alternative codes to consider:</p>
                <div className="space-y-2">
                  {hsnResult.alternatives.map((alt) => (
                    <div key={alt.code} className="bg-paytm-bg rounded-lg p-3">
                      <span className="font-semibold text-paytm-navy">{alt.code}</span>
                      <span className="text-gray-500 text-sm ml-2">— {alt.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      <Card>
        <h2 className="text-lg font-bold text-paytm-navy mb-2">Draft Export Declaration</h2>
        <p className="text-sm text-gray-500 mb-4">
          Generate a draft export declaration PDF for your product. Clearly watermarked as a draft — not a legal filing document.
        </p>
        <Button onClick={handleDownloadPDF} disabled={pdfLoading || !productId} variant="secondary" className="w-full">
          {pdfLoading ? 'Generating PDF...' : '📄 Download Draft PDF'}
        </Button>
        <p className="text-xs text-gray-400 mt-2 text-center">
          PDF will be watermarked: "DRAFT — NOT A LEGAL DOCUMENT"
        </p>
      </Card>
    </div>
  );
}
