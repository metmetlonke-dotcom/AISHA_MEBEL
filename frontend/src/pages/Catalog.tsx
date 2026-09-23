import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import api from '../services/api';
import type { Category, Product } from '../types';
import ProductCard from '../components/ProductCard';

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategoryId = searchParams.get('category') ? Number(searchParams.get('category')) : null;
  const [searchQuery, setSearchQuery] = useState('');
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [catRes, prodRes] = await Promise.all([
          api.get('/categories/'),
          api.get('/products/')
        ]);
        setCategories(catRes.data);
        setProducts(prodRes.data);
      } catch (error) {
        console.error('Failed to fetch catalog data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProducts = products.filter(p => {
    if (activeCategoryId && p.category_id !== activeCategoryId) return false;
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="pb-6">
      <div className="bg-white px-4 pt-6 pb-2 sticky top-0 z-20 shadow-sm">
        <h1 className="text-xl font-bold text-gray-800 mb-4">Katalog</h1>
        
        {/* Search */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Qidirish..." 
              className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-accent focus:bg-white"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          </div>
          <button className="w-11 h-11 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center text-gray-600 active:bg-gray-100">
            <SlidersHorizontal size={20} />
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
          <button 
            onClick={() => setSearchParams({})}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              !activeCategoryId ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Barchasi
          </button>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-9 w-24 bg-gray-200 rounded-full animate-pulse flex-shrink-0" />
            ))
          ) : (
            categories.map(cat => (
              <button 
                key={cat.id}
                onClick={() => setSearchParams({ category: cat.id.toString() })}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategoryId === cat.id ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {cat.name}
              </button>
            ))
          )}
        </div>
      </div>

      <div className="px-4 mt-4">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col h-48 animate-pulse">
                <div className="aspect-[4/3] bg-gray-200" />
                <div className="p-3 flex flex-col flex-1 gap-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="mt-auto h-5 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <p>Mahsulot topilmadi</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
