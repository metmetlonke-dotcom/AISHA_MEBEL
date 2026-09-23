import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { Minus, Plus, Trash2, ArrowRight, CheckCircle2, Phone, Send, ClipboardList, ShoppingBag } from 'lucide-react';
import WebApp from '@twa-dev/sdk';
import api from '../services/api';

export default function Cart() {
  const navigate = useNavigate();
  const { items, increaseQuantity, decreaseQuantity, removeItem, getTotal, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(WebApp.initDataUnsafe?.user?.first_name || '');
  const [phone, setPhone] = useState('');

  const [address, setAddress] = useState('');
  const [requiresDelivery, setRequiresDelivery] = useState(true);
  const [requiresAssembly, setRequiresAssembly] = useState(false);
  const [note, setNote] = useState('');

  const [orderSuccess, setOrderSuccess] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<{
    orderNumber: string;
    totalAmount: number;
    itemsCount: number;
    customerName: string;
    customerPhone: string;
    address: string;
    requiresDelivery: boolean;
    requiresAssembly: boolean;
  } | null>(null);

  const formatPrice = (price: number) => price.toLocaleString('uz-UZ') + ' so\'m';

  const handleCheckout = async () => {
    if (loading) return;

    if (!name.trim() || !phone.trim()) {
      WebApp.showAlert('Iltimos, ismingiz va telefon raqamingizni kiriting');
      return;
    }

    try {
      setLoading(true);
      const currentTotal = getTotal();
      const currentCount = items.reduce((sum, i) => sum + i.quantity, 0);

      const res = await api.post('/orders/', {
        customer_name: name,
        customer_phone: phone,
        customer_address: address || null,
        requires_delivery: requiresDelivery,
        requires_assembly: requiresAssembly,
        customer_note: note || null,
        items: items.map(i => ({
          product_id: i.product_id,
          quantity: i.quantity
        }))
      });

      const orderNumber = res.data?.order_number || `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

      setPlacedOrder({
        orderNumber,
        totalAmount: currentTotal,
        itemsCount: currentCount,
        customerName: name,
        customerPhone: phone,
        address: address,
        requiresDelivery,
        requiresAssembly
      });

      // Clear cart immediately
      clearCart();
      try {
        localStorage.removeItem('aisha-mebel-cart');
      } catch (e) {}

      if (WebApp && WebApp.HapticFeedback) {
        WebApp.HapticFeedback.notificationOccurred('success');
      }
      
      setOrderSuccess(true);
    } catch (error: any) {
      console.error('Order checkout failed:', error);
      const msg = error?.response?.data?.detail || 'Xatolik yuz berdi. Iltimos qaytadan urinib ko\'ring.';
      WebApp.showAlert(msg);
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess && placedOrder) {
    return (
      <div className="min-h-[85vh] flex flex-col justify-center items-center px-4 py-8 text-center bg-white">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-3 text-green-600">
          <CheckCircle2 size={42} />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-1">Buyurtmangiz qabul qilindi!</h2>
        <div className="inline-block bg-gray-100 text-gray-800 text-xs font-bold px-3 py-1 rounded-full mb-4">
          Buyurtma: #{placedOrder.orderNumber}
        </div>

        <p className="text-gray-600 text-xs mb-5 max-w-sm">
          Buyurtmangiz muvaffaqiyatli ro'yxatga olindi va ishlab chiqarish bo'limiga yuborildi. Savatchangiz tozalandi.
        </p>

        {/* Order Details summary */}
        <div className="w-full bg-gray-50 border border-gray-200/80 rounded-2xl p-3.5 mb-5 text-left text-xs space-y-2">
          <div className="flex justify-between pb-2 border-b border-gray-200">
            <span className="text-gray-500">Mijoz:</span>
            <span className="font-bold text-gray-900">{placedOrder.customerName}</span>
          </div>
          <div className="flex justify-between pb-2 border-b border-gray-200">
            <span className="text-gray-500">Telefon:</span>
            <span className="font-bold text-gray-900">{placedOrder.customerPhone}</span>
          </div>
          {placedOrder.address && (
            <div className="flex justify-between pb-2 border-b border-gray-200">
              <span className="text-gray-500">Manzil:</span>
              <span className="font-bold text-gray-900 truncate max-w-[200px]">{placedOrder.address}</span>
            </div>
          )}
          <div className="flex justify-between pb-2 border-b border-gray-200">
            <span className="text-gray-500">Xizmatlar:</span>
            <span className="font-bold text-gray-900">
              {placedOrder.requiresDelivery ? '🚚 Yetkazib berish' : ''}
              {placedOrder.requiresDelivery && placedOrder.requiresAssembly ? ' + ' : ''}
              {placedOrder.requiresAssembly ? '🔧 Montaj' : ''}
              {!placedOrder.requiresDelivery && !placedOrder.requiresAssembly ? 'Oddiy olib ketish' : ''}
            </span>
          </div>
          <div className="flex justify-between pt-1 text-sm font-black text-gray-900">
            <span>Jami to'lov:</span>
            <span className="text-accent">{formatPrice(placedOrder.totalAmount)}</span>
          </div>
        </div>

        {/* Administrator Contact Box */}
        <div className="w-full bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 text-left">
          <p className="text-amber-900 font-semibold text-sm mb-1 flex items-center gap-1.5">
            💳 To'lov va buyurtmani tasdiqlash:
          </p>
          <p className="text-amber-800 text-xs mb-3 leading-relaxed">
            Buyurtma bo'yicha to'lov shartlari, yetkazib berish va o'rnatish vaqtini kelishish uchun administrator bilan bog'laning:
          </p>
          
          <div className="space-y-2">
            <a
              href="tel:880606040"
              className="flex items-center gap-2 text-sm font-semibold text-amber-950 bg-white/90 py-2.5 px-3 rounded-xl border border-amber-200 active:scale-[0.98] transition-transform"
            >
              <Phone size={16} className="text-amber-700" />
              +998 88 060 60 40
            </a>
            <a
              href="tel:934124604"
              className="flex items-center gap-2 text-sm font-semibold text-amber-950 bg-white/90 py-2.5 px-3 rounded-xl border border-amber-200 active:scale-[0.98] transition-transform"
            >
              <Phone size={16} className="text-amber-700" />
              +998 93 412 46 04
            </a>
            <a
              href="https://t.me/zjxkdjbd"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 py-2.5 px-3 rounded-xl justify-center active:scale-[0.98] transition-transform shadow-sm"
            >
              <Send size={16} />
              Telegramdan yozish (@zjxkdjbd)
            </a>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="w-full space-y-2.5">
          <button
            onClick={() => navigate('/profile')}
            className="w-full bg-gray-900 hover:bg-black text-white py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-all"
          >
            <ClipboardList size={18} />
            Buyurtmalar tarixini ko'rish
          </button>
          
          <button
            onClick={() => navigate('/catalog')}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-xl font-medium text-xs flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          >
            <ShoppingBag size={16} />
            Katalogga qaytish
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] px-4">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <Trash2 size={32} className="text-gray-300" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Savatcha bo'sh</h2>
        <p className="text-gray-500 text-center mb-6">Siz hali hech qanday mahsulot qo'shmadingiz</p>
      </div>
    );
  }

  return (
    <div className="pb-44 pt-6 px-4">
      <h1 className="text-xl font-bold text-gray-800 mb-6">Savatcha</h1>
      
      <div className="flex flex-col gap-4 mb-8">
        {items.map((item) => (
          <div key={item.product_id} className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex gap-4">
            <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
              <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
            </div>
            
            <div className="flex flex-col flex-1 py-1">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 pr-2">{item.name}</h3>
                <button 
                  onClick={() => removeItem(item.product_id)}
                  className="text-gray-400 hover:text-red-500 transition-colors p-1"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              
              <div className="mt-auto flex items-end justify-between">
                <div className="font-bold text-accent text-sm">
                  {formatPrice(item.price)}
                </div>
                
                <div className="flex items-center gap-3 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                  <button 
                    onClick={() => decreaseQuantity(item.product_id)}
                    className="w-6 h-6 flex items-center justify-center text-gray-500 active:text-accent"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                  <button 
                    onClick={() => increaseQuantity(item.product_id)}
                    className="w-6 h-6 flex items-center justify-center text-gray-500 active:text-accent"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Checkout Form */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3 mb-6">
        <h2 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2">
          Buyurtma ma'lumotlari:
        </h2>
        
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 mb-1">Ismingiz *</label>
            <input 
              type="text" 
              placeholder="Ism" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-gray-900"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 mb-1">Telefon raqam *</label>
            <input 
              type="tel" 
              placeholder="+998" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-gray-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-gray-600 mb-1">Yetkazib berish manzili</label>
          <input 
            type="text" 
            placeholder="Shahar, tuman, ko'cha, xonadon..." 
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-gray-900"
          />
        </div>

        {/* Delivery & Assembly Options */}
        <div className="space-y-2 pt-1">
          <label className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer text-xs font-medium text-gray-700">
            <input
              type="checkbox"
              checked={requiresDelivery}
              onChange={(e) => setRequiresDelivery(e.target.checked)}
              className="w-4 h-4 rounded text-gray-900 focus:ring-0"
            />
            <span>🚚 Yetkazib berish xizmati kerak</span>
          </label>

          <label className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer text-xs font-medium text-gray-700">
            <input
              type="checkbox"
              checked={requiresAssembly}
              onChange={(e) => setRequiresAssembly(e.target.checked)}
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
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-gray-900"
          />
        </div>
      </div>

      <div className="fixed bottom-[64px] left-0 w-full bg-white border-t border-gray-200 p-4 pb-6 z-40">
        <div className="max-w-md mx-auto">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-500 font-medium text-sm">Jami summa:</span>
            <span className="text-xl font-black text-gray-900">{formatPrice(getTotal())}</span>
          </div>
          <button 
            onClick={handleCheckout}
            disabled={loading}
            className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-70 text-sm"
          >
            {loading ? 'Yuborilmoqda...' : (
              <>Buyurtmani rasmiylashtirish <ArrowRight size={18} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
