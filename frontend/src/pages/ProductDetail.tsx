import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Check, ShieldCheck, Truck, Wrench, Minus, Plus, RotateCw, Package, Play, X, Video, ZoomIn, ZoomOut, Maximize2, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showImageZoom, setShowImageZoom] = useState(false);
  
  // Touch Pinch-to-zoom & Drag-to-pan gesture state
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const touchStartRef = useRef<{ dist: number; scale: number; x: number; y: number; posX: number; posY: number } | null>(null);
  const lastTapRef = useRef<number>(0);

  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartRef.current = { dist, scale, x: 0, y: 0, posX: position.x, posY: position.y };
    } else if (e.touches.length === 1) {
      const now = Date.now();
      if (now - lastTapRef.current < 300) {
        if (scale > 1.1) {
          resetZoom();
        } else {
          setScale(2.5);
        }
      }
      lastTapRef.current = now;

      touchStartRef.current = {
        dist: 0,
        scale,
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        posX: position.x,
        posY: position.y,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;

    if (e.touches.length === 2 && touchStartRef.current.dist > 0) {
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const newScale = Math.min(Math.max(touchStartRef.current.scale * (currentDist / touchStartRef.current.dist), 1), 4);
      setScale(newScale);
      if (newScale === 1) {
        setPosition({ x: 0, y: 0 });
      }
    } else if (e.touches.length === 1 && scale > 1) {
      const deltaX = e.touches[0].clientX - touchStartRef.current.x;
      const deltaY = e.touches[0].clientY - touchStartRef.current.y;
      setPosition({
        x: touchStartRef.current.posX + deltaX,
        y: touchStartRef.current.posY + deltaY,
      });
    }
  };

  const handleTouchEnd = () => {
    touchStartRef.current = null;
    if (scale <= 1.05) {
      resetZoom();
    }
  };

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
        {/* Main Image - Natural Aspect Ratio (Touch Pinch Zoom & Tap Fullscreen) */}
        <div 
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={() => {
            if (scale === 1) {
              resetZoom();
              setShowImageZoom(true);
            }
          }}
          className="relative min-h-[280px] max-h-[70vh] bg-slate-900/5 flex items-center justify-center border-b border-gray-100 overflow-hidden p-2 cursor-pointer group touch-none"
        >
          <img
            src={images[activeImageIndex]?.image_url}
            alt={product.name}
            style={{
              transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
              transition: scale === 1 ? 'transform 0.2s ease-out' : 'none'
            }}
            className="w-full max-h-[65vh] object-contain rounded-xl drop-shadow-sm select-none"
          />
          {product.old_price && (
            <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md z-10 pointer-events-none">
              CHEGIRMA
            </div>
          )}

          {/* Zoom hint badge */}
          <div className="absolute bottom-3 right-3 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md active:scale-95 transition-all pointer-events-none">
            <Maximize2 size={13} />
            <span>{scale > 1 ? `${scale.toFixed(1)}x` : 'Kattalashtirish'}</span>
          </div>
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
            <div className="flex items-center justify-between gap-2">
              {product.category && (
                <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                  {product.category.icon} {product.category.name}
                </span>
              )}

              {product.video_url && (
                <button
                  onClick={() => setShowVideoModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-bold shadow-sm active:scale-95 transition-all ml-auto"
                >
                  <Play size={14} className="fill-red-600 text-red-600" />
                  <span>Qisqa video</span>
                </button>
              )}
            </div>
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

            {/* Omborda qolgan soni indicator */}
            <div className="flex items-center gap-2 pt-1">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${
                (product.stock_quantity ?? 0) > 5
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : (product.stock_quantity ?? 0) > 0
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                <Package size={14} />
                <span>
                  {(product.stock_quantity ?? 0) > 5
                    ? `Omborda: ${product.stock_quantity} dona bor`
                    : (product.stock_quantity ?? 0) > 0
                    ? `⚠️ Omborda oz qoldi: ${product.stock_quantity} dona`
                    : '🔴 Omborda tugagan (Buyurtma asosida)'}
                </span>
              </div>
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

      {/* Video Modal - Fullscreen with Prominent Top Close Button */}
      {showVideoModal && product?.video_url && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-2xl flex flex-col justify-between p-2 md:p-6 animate-in fade-in duration-200">
          {/* Top Header & Close X Button */}
          <div className="fixed top-4 right-4 z-[220]">
            <button
              onClick={() => setShowVideoModal(false)}
              className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-md flex items-center justify-center active:scale-90 transition-all shadow-xl border border-white/20"
              title="Yopish"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl mx-auto pt-12 pb-4">
            <div className="w-full flex items-center gap-2 text-white font-bold text-base mb-3 px-2">
              <Video size={20} className="text-red-500" />
              <span className="truncate">{product.name} - Video obzor</span>
            </div>

            <div className="w-full flex-1 flex items-center justify-center bg-black/80 rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative">
              {product.video_url.includes('youtube.com') || product.video_url.includes('youtu.be') ? (
                <iframe
                  src={product.video_url.replace('watch?v=', 'embed/')}
                  title={product.name}
                  className="w-full aspect-video rounded-2xl"
                  allowFullScreen
                />
              ) : (
                <video
                  src={product.video_url}
                  controls
                  autoPlay
                  playsInline
                  className="w-full max-h-[80vh] h-full object-contain rounded-2xl"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Image Zoom Lightbox Modal - Fullscreen Touch & Zoom */}
      {showImageZoom && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-2xl flex flex-col justify-between p-3 select-none animate-in fade-in duration-200">
          {/* Top Controls Bar */}
          <div className="flex items-center justify-between px-2 pt-2 pb-1 z-[210] border-b border-white/10">
            <div className="text-white text-xs font-semibold flex items-center gap-2">
              <span className="bg-white/20 px-2.5 py-1 rounded-lg">
                {activeImageIndex + 1} / {images.length}
              </span>
              <span className="truncate max-w-[180px] text-gray-300">{product?.name}</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Zoom Controls */}
              <button
                onClick={() => setScale((s) => Math.min(s + 0.5, 4))}
                className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 text-white flex items-center justify-center active:scale-95 transition-all"
                title="Yaqinlashtirish"
              >
                <ZoomIn size={18} />
              </button>
              <button
                onClick={() => setScale((s) => {
                  const ns = Math.max(s - 0.5, 1);
                  if (ns === 1) setPosition({ x: 0, y: 0 });
                  return ns;
                })}
                className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 text-white flex items-center justify-center active:scale-95 transition-all"
                title="Uzoqlashtirish"
              >
                <ZoomOut size={18} />
              </button>
              <button
                onClick={resetZoom}
                className="px-2.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold active:scale-95 transition-all"
              >
                1x
              </button>

              {/* Close Button */}
              <button
                onClick={() => {
                  resetZoom();
                  setShowImageZoom(false);
                }}
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center active:scale-90 transition-all ml-2"
              >
                <X size={22} />
              </button>
            </div>
          </div>

          {/* Interactive Zoomable Image Area */}
          <div 
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="flex-1 flex items-center justify-center relative overflow-hidden p-2 touch-none select-none"
          >
            {images.length > 1 && (
              <>
                <button
                  onClick={() => {
                    resetZoom();
                    setActiveImageIndex((i) => (i > 0 ? i - 1 : images.length - 1));
                  }}
                  className="absolute left-2 z-30 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-md active:scale-90 transition-all"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={() => {
                    resetZoom();
                    setActiveImageIndex((i) => (i < images.length - 1 ? i + 1 : 0));
                  }}
                  className="absolute right-2 z-30 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-md active:scale-90 transition-all"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            <div className="w-full h-full flex items-center justify-center">
              <img
                src={images[activeImageIndex]?.image_url}
                alt={product?.name}
                style={{
                  transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                  transition: scale === 1 ? 'transform 0.2s ease-out' : 'none'
                }}
                className="max-h-[82vh] max-w-full object-contain rounded-xl select-none"
              />
            </div>
          </div>

          {/* Bottom Hint */}
          <div className="text-center py-2 text-gray-400 text-xs font-medium border-t border-white/10">
            💡 Rasmni 2 ta barmoq bilan ushlab yaqinlashtirishingiz va surishingiz mumkin
          </div>
        </div>
      )}
    </div>
  );
}
