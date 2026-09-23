import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Check, ShieldCheck, Truck, Wrench, Minus, Plus, RotateCw } from 'lucide-react';
import WebApp from '@twa-dev/sdk';
import api from '../services/api';
import type { Product } from '../types';
import { useCartStore } from '../store/useCartStore';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  // Quick buy state
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [buyName, setBuyName] = useState(WebApp.initDataUnsafe?.user?.first_name || '');
  const [buyPhone, setBuyPhone] = useState('');
  const [buyAddress, setBuyAddress] = useState('');
  const [buyDelivery, setBuyDelivery] = useState(true);
  const [buyAssembly, setBuyAssembly] = useState(false);
  const [buyNote, setBuyNote] = useState('');
  const [buyLoading, setBuyLoading] = useState(false);
  const [buySuccess, setBuySuccess] = useState(false);

  const forceReload = () => {
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => caches.delete(name));
      });
    }
    window.location.href = window.location.pathname + '?t=' + Date.now();
  };

  const handleQuickCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !buyName.trim() || !buyPhone.trim()) {
      WebApp.showAlert('Iltimos, ismingiz va telefon raqamingizni kiriting!');
      return;
    }

    try {
      setBuyLoading(true);
      await api.post('/orders/', {
        customer_name: buyName,
        customer_phone: buyPhone,
        customer_address: buyAddress || null,
        requires_delivery: buyDelivery,
        requires_assembly: buyAssembly,
        customer_note: buyNote || null,
        items: [
          {
            product_id: product.id,
            quantity: quantity
          }
        ]
      });

      if (WebApp && WebApp.HapticFeedback) {
        WebApp.HapticFeedback.notificationOccurred('success');
      }

      setShowBuyModal(false);
      setBuySuccess(true);
    } catch (error: any) {
      console.error('Quick checkout failed:', error);
      const msg = error?.response?.data?.detail || 'Xatolik yuz berdi. Iltimos qaytadan urinib ko\'ring.';
      WebApp.showAlert(msg);
    } finally {
      setBuyLoading(false);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error('Failed to fetch product:', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  const formatPrice = (price: number) => price.toLocaleString('uz-UZ') + ' so\'m';

  const handleAddToCart = () => {
    if (!product) return;
    for (let i = 0; i < quantity; i++) {
      addItem({
        product_id: product.id,
        name: product.name,
        price: product.price,
        old_price: product.old_price,
        image_url: product.images?.[0]?.image_url || '',
      });
    }

    setAdded(true);
    try {
      WebApp.HapticFeedback?.notificationOccurred('success');
    } catch (e) {}

    setTimeout(() => {
      setAdded(false);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4 animate-pulse">
        <div className="w-10 h-10 bg-gray-200 rounded-xl" />
        <div className="aspect-square bg-gray-200 rounded-2xl w-full" />
        <div className="h-6 bg-gray-200 rounded w-3/4" />
        <div className="h-8 bg-gray-200 rounded w-1/2" />
        <div className="h-20 bg-gray-200 rounded w-full" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-gray-500">Mahsulot topilmadi</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium"
        >
          Orqaga qaytish
        </button>
      </div>
    );
  }

  const images = product.images && product.images.length > 0
    ? product.images
    : [{ id: 0, image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800', is_main: true, sort_order: 0 }];

  return (
    <div className="pb-32 bg-gray-50 min-h-screen">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-30 bg-white/80 backdrop-blur-md px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700 active:scale-95 transition-transform"
        >
          <ArrowLeft size={20} />
        </button>
        <span className="font-semibold text-gray-800 text-sm max-w-[200px] truncate">
          {product.name}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={forceReload}
            title="Yangilash"
            className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700 active:rotate-180 transition-transform"
          >
            <RotateCw size={18} />
          </button>
          <button
            onClick={() => navigate('/cart')}
            className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700 active:scale-95 transition-transform relative"
          >
            <ShoppingCart size={20} />
          </button>
        </div>
      </div>

      <div className="pt-16">
        {/* Main Image */}
        <div className="relative aspect-square bg-white border-b border-gray-100">
          <img
            src={images[activeImageIndex]?.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          {product.old_price && (
            <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
              CHEGIRMA
            </div>
          )}
        </div>

        {/* Thumbnail gallery if multiple */}
        {images.length > 1 && (
          <div className="flex gap-2 px-4 py-3 bg-white overflow-x-auto border-b border-gray-100">
            {images.map((img, idx) => (
              <button
                key={img.id || idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`w-16 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                  activeImageIndex === idx ? 'border-gray-900 scale-105' : 'border-transparent opacity-70'
                }`}
              >
                <img src={img.image_url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Info Container */}
        <div className="p-4 space-y-4">
          {/* Title & Price */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 space-y-3">
            {product.category && (
              <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                {product.category.icon} {product.category.name}
              </span>
            )}
            <h1 className="text-xl font-bold text-gray-900 leading-snug">{product.name}</h1>
            
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-2xl font-black text-gray-900">
                {formatPrice(product.price)}
              </span>
              {product.old_price && (
                <span className="text-sm text-gray-400 line-through">
                  {formatPrice(product.old_price)}
                </span>
              )}
            </div>

            {/* In-page Prominent Buy Action Buttons */}
            <div className="pt-2 space-y-2.5 border-t border-gray-100">
              <button
                onClick={() => setShowBuyModal(true)}
                className="w-full py-4 px-4 bg-gray-900 hover:bg-black text-white rounded-xl font-bold text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-md"
              >
                🛒 Sotib olish (Tezkor buyurtma)
              </button>

              <button
                onClick={handleAddToCart}
                className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all border ${
                  added
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200 active:scale-[0.98]'
                }`}
              >
                {added ? (
                  <>
                    <Check size={18} /> Savatchaga qo'shildi!
                  </>
                ) : (
                  <>
                    <ShoppingCart size={18} /> Savatchaga solish
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="bg-white p-4 rounded-2xl border border-gray-100 space-y-2">
              <h2 className="text-sm font-bold text-gray-900">Mahsulot haqida ma'lumot:</h2>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {/* Specifications */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 space-y-3">
            <h2 className="text-sm font-bold text-gray-900">Xususiyatlari:</h2>
            <div className="divide-y divide-gray-100 text-sm">
              {product.dimensions && (
                <div className="py-2 flex justify-between">
                  <span className="text-gray-500">O'lchamlari:</span>
                  <span className="font-medium text-gray-800">{product.dimensions}</span>
                </div>
              )}
              {product.material && (
                <div className="py-2 flex justify-between">
                  <span className="text-gray-500">Materiali:</span>
                  <span className="font-medium text-gray-800">{product.material}</span>
                </div>
              )}
              {product.colors && (
                <div className="py-2 flex justify-between">
                  <span className="text-gray-500">Rangi:</span>
                  <span className="font-medium text-gray-800">{product.colors}</span>
                </div>
              )}
              <div className="py-2 flex justify-between">
                <span className="text-gray-500">Kafolat:</span>
                <span className="font-medium text-green-600 flex items-center gap-1">
                  <ShieldCheck size={16} /> 12 oy kafolat
                </span>
              </div>
            </div>
          </div>

          {/* Service badges */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded-2xl border border-gray-100 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                <Truck size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Yetkazib berish</p>
                <p className="text-[11px] text-gray-500">O'zbekiston bo'ylab</p>
              </div>
            </div>
            
            <div className="bg-white p-3 rounded-2xl border border-gray-100 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                <Wrench size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">O'rnatib berish</p>
                <p className="text-[11px] text-gray-500">Professional ustalar</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar positioned above fixed bottom nav (bottom-[64px]) */}
      <div className="fixed bottom-[64px] left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-3 shadow-lg max-w-md mx-auto">
        <div className="flex items-center gap-2">
          {/* Quantity Controls */}
          <div className="flex items-center bg-gray-100 rounded-xl p-1 border border-gray-200 flex-shrink-0">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-7 h-7 flex items-center justify-center text-gray-700 active:scale-90"
            >
              <Minus size={14} />
            </button>
            <span className="w-6 text-center font-bold text-xs text-gray-900">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-7 h-7 flex items-center justify-center text-gray-700 active:scale-90"
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className={`py-3 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all border ${
              added
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200 active:scale-95'
            }`}
          >
            {added ? (
              <>
                <Check size={16} /> Savatda
              </>
            ) : (
              <>
                <ShoppingCart size={16} /> Savatchaga
              </>
            )}
          </button>

          {/* Instant Buy Button */}
          <button
            onClick={() => setShowBuyModal(true)}
            className="flex-1 py-3.5 px-4 bg-gray-900 hover:bg-black text-white rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 active:scale-98 transition-all shadow-md text-center"
          >
            Sotib olish ➔
          </button>
        </div>
      </div>

      {/* Quick Buy Modal */}
      {showBuyModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-5 pb-8 mb-16 sm:mb-0 space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom shadow-2xl border-t border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-base">Tezkor buyurtma</h3>
              <button
                onClick={() => setShowBuyModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
              >
                ✕
              </button>
            </div>

            {/* Product summary */}
            <div className="flex gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
              <img
                src={images[0]?.image_url}
                alt={product.name}
                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
              />
              <div className="flex flex-col justify-center">
                <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{product.name}</h4>
                <p className="text-xs text-gray-500">{quantity} dona</p>
                <p className="text-sm font-black text-gray-900 mt-0.5">
                  {formatPrice(product.price * quantity)}
                </p>
              </div>
            </div>

            <form onSubmit={handleQuickCheckout} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">Ismingiz *</label>
                <input
                  type="text"
                  placeholder="Ismingizni kiriting"
                  value={buyName}
                  onChange={(e) => setBuyName(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">Telefon raqamingiz *</label>
                <input
                  type="tel"
                  placeholder="+998"
                  value={buyPhone}
                  onChange={(e) => setBuyPhone(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">Yetkazib berish manzili</label>
                <input
                  type="text"
                  placeholder="Shahar, tuman, ko'cha, uy..."
                  value={buyAddress}
                  onChange={(e) => setBuyAddress(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-900"
                />
              </div>

              <div className="space-y-1.5 pt-1">
                <label className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer text-xs font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={buyDelivery}
                    onChange={(e) => setBuyDelivery(e.target.checked)}
                    className="w-4 h-4 rounded text-gray-900 focus:ring-0"
                  />
                  <span>🚚 Yetkazib berish xizmati kerak</span>
                </label>

                <label className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer text-xs font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={buyAssembly}
                    onChange={(e) => setBuyAssembly(e.target.checked)}
                    className="w-4 h-4 rounded text-gray-900 focus:ring-0"
                  />
                  <span>🔧 O'rnatib berish (montaj) xizmati kerak</span>
                </label>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">Qo'shimcha izoh (ixtiyoriy)</label>
                <input
                  type="text"
                  placeholder="Qo'shimcha istaklaringiz..."
                  value={buyNote}
                  onChange={(e) => setBuyNote(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-900"
                />
              </div>

              <button
                type="submit"
                disabled={buyLoading}
                className="w-full bg-gray-900 hover:bg-black text-white py-3.5 rounded-xl font-bold text-sm shadow-md transition-all active:scale-98 disabled:opacity-50 mt-2"
              >
                {buyLoading ? 'Yuborilmoqda...' : 'Buyurtmani tasdiqlash'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Quick Buy Success Modal */}
      {buySuccess && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 text-center space-y-4 animate-in zoom-in-95">
            <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto text-green-600">
              <Check size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Buyurtmangiz qabul qilindi!</h3>
            <p className="text-xs text-gray-600">
              Ushbu mahsulot uchun buyurtmangiz rasmiylashtirildi va adminlarimizga yuborildi.
            </p>
            <button
              onClick={() => {
                setBuySuccess(false);
                navigate('/catalog');
              }}
              className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold text-sm"
            >
              Katalogga o'tish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
