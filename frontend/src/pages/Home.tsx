import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronRight, Package } from 'lucide-react';
import api from '../services/api';
import type { Category, Product } from '../types';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [catRes, prodRes] = await Promise.all([
          api.get('/categories/'),
          api.get('/products/')
        ]);
        setCategories(catRes.data.slice(0, 4)); // Get top 4 categories
        setFeaturedProducts(prodRes.data.slice(0, 4)); // Get top 4 products
      } catch (error) {
        console.error('Failed to fetch home data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="pb-6">
      {/* Header / Search */}
      <div className="bg-accent px-4 pt-6 pb-4 rounded-b-3xl shadow-sm relative z-10">
        <h1 className="text-white text-xl font-bold mb-4">AISHA MEBEL</h1>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Mebel qidirish..." 
            className="w-full bg-white/20 text-white placeholder-white/70 border-none rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-white/50"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70" size={18} />
        </div>
      </div>

      {/* Banner */}
      <div className="px-4 mt-6">
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10 w-2/3">
            <h2 className="text-lg font-bold leading-tight mb-2">Yangi mavsum kolleksiyasi</h2>
            <p className="text-xs text-gray-300 mb-3">Barcha mahsulotlarga 20% gacha chegirma</p>
            <Link to="/catalog" className="inline-block bg-white text-gray-900 text-xs font-bold px-4 py-2 rounded-lg">
              Ko'rish
            </Link>
          </div>
          {/* Decorative shapes */}
          <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-accent rounded-full opacity-50 blur-2xl"></div>
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-white rounded-full opacity-10 blur-xl"></div>
        </div>
      </div>

      {/* Categories */}
      <div className="mt-8 px-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-gray-800">Kategoriyalar</h2>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center flex-shrink-0 w-[72px] animate-pulse">
                <div className="w-14 h-14 bg-gray-200 rounded-2xl mb-2" />
                <div className="h-3 bg-gray-200 rounded w-12" />
              </div>
            ))
          ) : (
            categories.map((cat) => (
              <Link 
                key={cat.id} 
                to={`/catalog?category=${cat.id}`}
                className="flex flex-col items-center flex-shrink-0 w-[72px]"
              >
                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-500 mb-2 transition-transform active:scale-95">
                  <Package size={24} />
                </div>
                <span className="text-[10px] font-medium text-gray-600 text-center truncate w-full px-1">{cat.name}</span>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Featured Products */}
      <div className="mt-8 px-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-gray-800">Ommabop mahsulotlar</h2>
          <Link to="/catalog" className="text-accent text-xs font-medium flex items-center">
            Barchasi <ChevronRight size={14} />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col h-48 animate-pulse">
                <div className="aspect-[4/3] bg-gray-200" />
                <div className="p-3 flex flex-col flex-1 gap-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="mt-auto h-5 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))
          ) : (
            featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
