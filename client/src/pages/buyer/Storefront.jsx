import { useState, useEffect, useCallback } from 'react';
import ProductCard from '../../components/buyer/ProductCard';
import CurrencySelector from '../../components/buyer/CurrencySelector';
import Spinner from '../../components/ui/Spinner';
import { buyerAPI } from '../../lib/api';
import { CRAFT_TYPES, REGIONS } from '../../lib/constants';
import { useSearchParams } from 'react-router-dom';

export default function Storefront() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    craft_type: searchParams.get('craft_type') || '',
    region: searchParams.get('region') || '',
    price_band: searchParams.get('price_band') || '',
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await buyerAPI.getProducts(filters);
      setProducts(res.data);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateFilter = (key, value) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
    const params = {};
    Object.entries(updated).forEach(([k, v]) => { if (v) params[k] = v; });
    setSearchParams(params);
  };

  return (
    <div className="page-container py-8">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="section-title">Discover Indian Heritage Crafts</h1>
            <p className="text-gray-500 mt-1">Every piece verified, every artisan known</p>
          </div>
          <CurrencySelector />
        </div>

        <div className="bg-white rounded-card shadow-card p-4 space-y-3">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              placeholder="Search crafts, artisans, regions..."
              className="input-field pl-10"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select
              value={filters.craft_type}
              onChange={(e) => updateFilter('craft_type', e.target.value)}
              className="input-field"
            >
              <option value="">All Craft Types</option>
              {CRAFT_TYPES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>

            <select
              value={filters.region}
              onChange={(e) => updateFilter('region', e.target.value)}
              className="input-field"
            >
              <option value="">All Regions</option>
              {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>

            <select
              value={filters.price_band}
              onChange={(e) => updateFilter('price_band', e.target.value)}
              className="input-field"
            >
              <option value="">All Price Ranges</option>
              <option value="low">Under ₹2,000</option>
              <option value="mid">₹2,000 – ₹10,000</option>
              <option value="high">Above ₹10,000</option>
            </select>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      )}

      {!loading && products.length === 0 && (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🎨</p>
          <p className="text-gray-500 text-lg">No crafts found</p>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
        </div>
      )}

      {!loading && (
        <>
          <p className="text-sm text-gray-400 mb-4">{products.length} craft{products.length !== 1 ? 's' : ''} found</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
