import { useState, useEffect } from 'react';
import { Phone, Package, Compass, Calendar, Truck, Wrench, Trash2 } from 'lucide-react';
import WebApp from '@twa-dev/sdk';
import api from '../services/api';
import type { User, Order, IndividualOrder } from '../types';

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customOrders, setCustomOrders] = useState<IndividualOrder[]>([]);
  const [activeTab, setActiveTab] = useState<'standard' | 'custom'>('standard');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDeleteOrder = async (orderId: number) => {
    if (!window.confirm("Rostdan ham ushbu buyurtmani bekor qilmoqchimisiz?")) return;
    try {
      setDeletingId(orderId);
      await api.delete(`/orders/${orderId}`);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      if (WebApp && WebApp.showAlert) {
        WebApp.showAlert("Buyurtma bekor qilindi");
      }
    } catch (err: any) {
      console.error('Delete order error:', err);
      const msg = err?.response?.data?.detail || "O'chirishda xatolik yuz berdi";
      WebApp.showAlert(msg);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteCustomOrder = async (orderId: number) => {
    if (!window.confirm("Rostdan ham ushbu individual buyurtmani bekor qilmoqchimisiz?")) return;
    try {
      setDeletingId(orderId);
      await api.delete(`/orders/custom/${orderId}`);
      setCustomOrders((prev) => prev.filter((o) => o.id !== orderId));
      if (WebApp && WebApp.showAlert) {
        WebApp.showAlert("Individual buyurtma bekor qilindi");
      }
    } catch (err: any) {
      console.error('Delete custom order error:', err);
      const msg = err?.response?.data?.detail || "O'chirishda xatolik yuz berdi";
      WebApp.showAlert(msg);
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        // Fetch user data
        try {
          const userRes = await api.get('/users/me');
          setUser(userRes.data);
        } catch (e) {
          console.error('User fetch error:', e);
        }
        
        // Fetch orders
        try {
          const ordersRes = await api.get('/orders/');
          setOrders(ordersRes.data || []);
        } catch (e) {
          console.error('Orders fetch error:', e);
        }

        // Fetch custom orders
        try {
          const customOrdersRes = await api.get('/orders/custom');
          setCustomOrders(customOrdersRes.data || []);
        } catch (e) {
          console.error('Custom orders fetch error:', e);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  const formatPrice = (price: number) => price.toLocaleString('uz-UZ') + ' so\'m';

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'new': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'contacted': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'confirmed': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'in_production': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'ready': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'delivering': return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'delivered': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'new': return 'Yangi buyurtma';
      case 'contacted': return 'Bog\'lanildi';
      case 'confirmed': return 'Tasdiqlandi';
      case 'in_production': return 'Ishlab chiqarilmoqda';
      case 'ready': return 'Tayyor';
      case 'delivering': return 'Yetkazilmoqda';
      case 'delivered': return 'Yetkazib berildi';
      case 'cancelled': return 'Bekor qilindi';
      default: return status || 'Kutilmoqda';
    }
  };

  const displayName = user?.first_name 
    ? `${user.first_name} ${user.last_name || ''}`.trim()
    : WebApp.initDataUnsafe?.user?.first_name || 'Mijoz';

  return (
    <div className="pb-28 pt-4 px-4 space-y-5 bg-gray-50 min-h-screen">
      <h1 className="text-xl font-bold text-gray-900">Mijoz Profili</h1>

      {loading ? (
        <div className="animate-pulse flex flex-col gap-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-4">
            <div className="w-14 h-14 bg-gray-200 rounded-full" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-3 bg-gray-200 rounded w-1/3" />
            </div>
          </div>
          <div className="h-28 bg-gray-200 rounded-2xl" />
          <div className="h-28 bg-gray-200 rounded-2xl" />
        </div>
      ) : (
        <>
          {/* User Card */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3.5">
            <div className="w-13 h-13 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="text-base font-bold text-gray-900">{displayName}</h2>
              <div className="flex items-center text-gray-500 text-xs mt-0.5 gap-1">
                <Phone size={12} />
                <span>{user?.phone || 'Telefon: biriktirilmagan'}</span>
              </div>
              {user?.telegram_id && (
                <span className="text-[10px] text-gray-400">ID: {user.telegram_id}</span>
              )}
            </div>
          </div>

          {/* Orders Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Package size={18} className="text-gray-900" /> Buyurtmalar tarixi
              </h3>
            </div>

            {/* Quick Contact Box */}
            <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-3 text-xs space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-medium">
                <Phone size={14} className="text-amber-700 flex-shrink-0" />
                <span>Buyurtma yoki to'lov bo'yicha aloqa:</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <a href="tel:880606040" className="text-amber-950 font-bold bg-white px-2.5 py-1 rounded-lg border border-amber-200 shadow-xs active:scale-95 transition-transform">
                  📞 88 060 60 40
                </a>
                <a href="tel:934124604" className="text-amber-950 font-bold bg-white px-2.5 py-1 rounded-lg border border-amber-200 shadow-xs active:scale-95 transition-transform">
                  📞 93 412 46 04
                </a>
                <a href="https://t.me/zjxkdjbd" target="_blank" rel="noreferrer" className="text-white font-bold bg-blue-600 px-2.5 py-1 rounded-lg shadow-xs active:scale-95 transition-transform">
                  Telegram (@zjxkdjbd)
                </a>
              </div>
            </div>

            {/* Tabs */}
            <div className="grid grid-cols-2 p-1 bg-gray-200/70 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setActiveTab('standard')}
                className={`py-2 rounded-lg transition-all ${
                  activeTab === 'standard'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Katalog ({orders.length})
              </button>
              <button
                onClick={() => setActiveTab('custom')}
                className={`py-2 rounded-lg transition-all ${
                  activeTab === 'custom'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Individual ({customOrders.length})
              </button>
            </div>

            {/* Standard Orders Tab */}
            {activeTab === 'standard' && (
              <div className="space-y-3">
                {orders.length === 0 ? (
                  <div className="text-center py-10 bg-white rounded-2xl border border-gray-100">
                    <Package size={32} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-500 text-xs font-medium">Sizda hali standart buyurtmalar yo'q</p>
                  </div>
                ) : (
                  orders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-3"
                    >
                      <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                        <span className="font-bold text-gray-900 text-sm">{order.order_number}</span>
                        <span
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {getStatusText(order.status)}
                        </span>
                      </div>

                      {/* Items list */}
                      {order.items && order.items.length > 0 && (
                        <div className="space-y-1.5 text-xs text-gray-700 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between">
                              <span className="font-medium truncate max-w-[200px]">
                                • {item.product_name}
                              </span>
                              <span className="text-gray-500">
                                {item.quantity} x {formatPrice(item.unit_price)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Delivery / Assembly badges */}
                      <div className="flex flex-wrap gap-2 text-[10px] text-gray-500">
                        {order.requires_delivery && (
                          <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-medium">
                            <Truck size={12} /> Yetkazib berish
                          </span>
                        )}
                        {order.requires_assembly && (
                          <span className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md font-medium">
                            <Wrench size={12} /> Montaj
                          </span>
                        )}
                        {order.customer_address && (
                          <span className="text-gray-500 truncate max-w-[250px]">
                            📍 {order.customer_address}
                          </span>
                        )}
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-gray-100 text-xs">
                        <div className="text-gray-400 flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(order.created_at).toLocaleDateString('uz-UZ')}
                        </div>
                        <div className="flex items-center gap-3">
                          {order.status === 'new' && (
                            <button
                              onClick={() => handleDeleteOrder(order.id)}
                              disabled={deletingId === order.id}
                              className="text-[11px] text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 bg-red-50 hover:bg-red-100 px-2 py-1 rounded-lg border border-red-200 active:scale-95 transition-all"
                            >
                              <Trash2 size={12} />
                              {deletingId === order.id ? "O'chirilmoqda..." : "Bekor qilish"}
                            </button>
                          )}
                          <div className="text-sm font-black text-gray-900">
                            {formatPrice(order.total_amount)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Custom Orders Tab */}
            {activeTab === 'custom' && (
              <div className="space-y-3">
                {customOrders.length === 0 ? (
                  <div className="text-center py-10 bg-white rounded-2xl border border-gray-100">
                    <Compass size={32} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-500 text-xs font-medium">Sizda hali individual buyurtmalar yo'q</p>
                  </div>
                ) : (
                  customOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-3"
                    >
                      <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                        <span className="font-bold text-gray-900 text-sm">{ord.furniture_type}</span>
                        <span
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${getStatusColor(
                            ord.status
                          )}`}
                        >
                          {getStatusText(ord.status)}
                        </span>
                      </div>

                      <div className="flex gap-3">
                        {ord.reference_image_url && (
                          <img
                            src={ord.reference_image_url}
                            alt=""
                            className="w-16 h-16 rounded-xl object-cover border border-gray-200 flex-shrink-0"
                          />
                        )}
                        <div className="space-y-1 text-xs text-gray-600 flex-1">
                          {ord.dimensions && <p><span className="font-semibold text-gray-700">O'lchami:</span> {ord.dimensions}</p>}
                          {ord.material && <p><span className="font-semibold text-gray-700">Materiali:</span> {ord.material}</p>}
                          {ord.colors && <p><span className="font-semibold text-gray-700">Rangi/Uslubi:</span> {ord.colors}</p>}
                        </div>
                      </div>

                      {ord.customer_note && (
                        <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded-xl italic">
                          "{ord.customer_note}"
                        </p>
                      )}

                      <div className="flex justify-between items-center pt-2 border-t border-gray-100 text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(ord.created_at).toLocaleDateString('uz-UZ')}
                        </div>
                        <div className="flex items-center gap-3">
                          {ord.status === 'new' && (
                            <button
                              onClick={() => handleDeleteCustomOrder(ord.id)}
                              disabled={deletingId === ord.id}
                              className="text-[11px] text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 bg-red-50 hover:bg-red-100 px-2 py-1 rounded-lg border border-red-200 active:scale-95 transition-all"
                            >
                              <Trash2 size={12} />
                              {deletingId === ord.id ? "O'chirilmoqda..." : "Bekor qilish"}
                            </button>
                          )}
                          <span className="text-accent font-semibold text-xs">Kelishilgan narx</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
