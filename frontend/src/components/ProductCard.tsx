import type { Product } from '../types';
import { useCartStore } from '../store/useCartStore';
import { ShoppingCart } from 'lucide-react';
import WebApp from '@twa-dev/sdk';

import { useNavigate } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);

  const formatPrice = (price: number) => {
    return price.toLocaleString('uz-UZ') + ' so\'m';
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({
      product_id: product.id,
      name: product.name,
      price: product.price,
      old_price: product.old_price,
      image_url: product.images?.[0]?.image_url || '',
    });
    
    if (WebApp && WebApp.HapticFeedback) {
      WebApp.HapticFeedback.impactOccurred('light');
    }
  };

  const imageUrl = product.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800';

  return (
    <div 
      onClick={() => navigate(`/product/${product.id}`)}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col cursor-pointer active:scale-98 transition-transform hover:shadow-md"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img 
          src={imageUrl} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        {product.old_price && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
            CHEGIRMA
          </div>
        )}
      </div>
      
      <div className="p-3 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-800 text-sm mb-1 line-clamp-2 leading-tight">
          {product.name}
        </h3>

        <div className="mb-1">
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${
            (product.stock_quantity ?? 0) > 0
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-rose-50 text-rose-700'
          }`}>
            {(product.stock_quantity ?? 0) > 0
              ? `Omborda: ${product.stock_quantity} dona`
              : 'Buyurtma asosida'}
          </span>
        </div>
        
        <div className="mt-auto pt-2 flex items-end justify-between">
          <div className="flex flex-col">
            {product.old_price && (
              <span className="text-[10px] text-gray-400 line-through">
                {formatPrice(product.old_price)}
              </span>
            )}
            <span className="font-bold text-gray-900 text-sm">
              {formatPrice(product.price)}
            </span>
          </div>
          
          <button 
            onClick={handleAddToCart}
            className="w-8 h-8 flex items-center justify-center bg-gray-900 text-white rounded-full hover:bg-black transition-colors shadow-sm active:scale-90"
            title="Savatchaga qo'shish"
          >
            <ShoppingCart size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
