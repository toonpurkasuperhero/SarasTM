import { useState } from 'react';
import { CRAFT_TYPES, REGIONS } from '../../lib/constants';
import Button from '../ui/Button';

export default function ListingEditor({ listing, onChange, onPublish, publishing }) {
  const [showNative, setShowNative] = useState(false);

  const update = (field, value) => onChange({ ...listing, [field]: value });

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-paytm-navy mb-2">Product Title</label>
        <input
          type="text"
          value={listing.title || ''}
          onChange={(e) => update('title', e.target.value)}
          className="input-field text-lg font-semibold"
          placeholder="Enter product title"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-paytm-navy">Product Story</label>
          {listing.story_native && (
            <button
              onClick={() => setShowNative(!showNative)}
              className="text-xs text-paytm-cyan hover:underline"
            >
              {showNative ? 'Show English' : 'Show Original'}
            </button>
          )}
        </div>
        <textarea
          value={showNative ? (listing.story_native || '') : (listing.story_en || '')}
          onChange={(e) => update(showNative ? 'story_native' : 'story_en', e.target.value)}
          rows={5}
          className="input-field resize-none"
          placeholder="AI-generated story about your craft..."
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-paytm-navy mb-2">SEO Tags</label>
        <input
          type="text"
          value={(listing.seo_tags || []).join(', ')}
          onChange={(e) => update('seo_tags', e.target.value.split(',').map((t) => t.trim()).filter(Boolean))}
          className="input-field"
          placeholder="handmade, madhubani, traditional art..."
        />
        {listing.seo_tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {listing.seo_tags.map((tag, i) => (
              <span key={i} className="badge-cyan">{tag}</span>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-paytm-navy mb-2">Craft Type</label>
        <select value={listing.craft_type || ''} onChange={(e) => update('craft_type', e.target.value)} className="input-field">
          <option value="">Select craft type</option>
          {CRAFT_TYPES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-paytm-navy mb-2">Region</label>
        <select value={listing.region_label || ''} onChange={(e) => update('region_label', e.target.value)} className="input-field">
          <option value="">Select region</option>
          {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-paytm-navy mb-3">Pricing</label>
        <div className="grid grid-cols-2 gap-4">
          {[
            { currency: 'INR', symbol: '₹', field: 'price_inr' },
            { currency: 'USD', symbol: '$', field: 'price_usd' },
            { currency: 'EUR', symbol: '€', field: 'price_eur' },
            { currency: 'GBP', symbol: '£', field: 'price_gbp' },
          ].map(({ currency, symbol, field }) => (
            <div key={currency} className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">{symbol}</span>
              <input
                type="number"
                value={listing[field] || ''}
                onChange={(e) => update(field, parseFloat(e.target.value) || 0)}
                className="input-field pl-8"
                placeholder={currency}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100">
        <Button onClick={onPublish} disabled={publishing} size="lg" className="w-full">
          {publishing ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Publishing...
            </span>
          ) : '🚀 Publish to Global Store'}
        </Button>
      </div>
    </div>
  );
}
