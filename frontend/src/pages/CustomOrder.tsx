import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WebApp from '@twa-dev/sdk';
import { CheckCircle2, Phone, Send, ArrowLeft, Check } from 'lucide-react';
import api from '../services/api';

const FURNITURE_TYPES = [
  'Oshxona garnituri',
  'Yotoqxona mebeli',
  'Shkaf-kupe',
  'Mehmonxona mebeli',
  'Bolalar mebeli',
  'Ofis mebeli',
  'Stol va stullar',
  'Dahliz (Prixojka)'
];

const MATERIALS = [
  'MDF (Laminat)',
  'Akril (Yaltiroq)',
  'Krashenniy MDF (Bo\'yalgan)',
  'Tabiiy yog\'och (Massiv)',
  'LMDF (Turkiya/Rossiya)',
  'DSP (Oddiy tejamkor)'
];

const COLORS = [
  'Oq / Krem',
  'Jigarrang (Yog\'och rang)',
  'Kulrang / Grafit',
  'Qora mativiy',
  'Yong\'oq / Dub',
  'Ikki rang uyg\'unligi'
];

const STYLES = [
  'Neoklassika',
  'Zamonaviy (Modern)',
  'Minimalizm',
  'Klassika',
  'Haytek / Loft'
];

const CustomOrder = () => {
  const navigate = useNavigate();
  const [customerName, setCustomerName] = useState(WebApp.initDataUnsafe?.user?.first_name || '');
  const [customerPhone, setCustomerPhone] = useState('');
  const [furnitureType, setFurnitureType] = useState(FURNITURE_TYPES[0]);
  const [customFurnitureType, setCustomFurnitureType] = useState('');
  const [material, setMaterial] = useState(MATERIALS[0]);
  const [color, setColor] = useState(COLORS[0]);
  const [style, setStyle] = useState(STYLES[0]);
  const [dimensions, setDimensions] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      setUploadingPhoto(true);
      const res = await api.post('/orders/upload-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setPhotoUrl(res.data.image_url);
    } catch (err) {
      console.error(err);
      WebApp.showAlert('Rasmni yuklashda xatolik yuz berdi.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      WebApp.showAlert('Iltimos, ismingizni kiriting!');
      return;
    }
    if (!customerPhone.trim()) {
      WebApp.showAlert('Iltimos, telefon raqamingizni kiriting!');
      return;
    }
    
    const finalType = customFurnitureType.trim() ? customFurnitureType : furnitureType;
    
    setLoading(true);
    try {
      await api.post('/orders/custom', {
        customer_name: customerName,
        customer_phone: customerPhone,
        furniture_type: finalType,
        dimensions: dimensions || null,
        material: material,
        colors: `${color} (${style})`,
        customer_note: customerNote || null,
        reference_image_url: photoUrl,
        quantity: 1
      });
      setSubmitted(true);
      try {
        WebApp.HapticFeedback?.notificationOccurred('success');
      } catch (e) {}
    } catch (error: any) {
      console.error(error);
      const msg = error?.response?.data?.detail || 'Xatolik yuz berdi. Iltimos qayta urinib ko\'ring.';
      WebApp.showAlert(msg);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[85vh] flex flex-col justify-center items-center px-4 py-8 text-center bg-white">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4 text-green-600">
          <CheckCircle2 size={40} />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Buyurtmangiz qabul qilindi!</h2>
        <p className="text-gray-600 mb-6 text-sm max-w-sm">
          Sizning individual buyurtmangiz muvaffaqiyatli ro'yxatga olindi va mutaxassislarimizga yuborildi.
        </p>

        <div className="w-full bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 text-left">
          <p className="text-amber-900 font-semibold text-sm mb-1">
            💳 To'lov va buyurtmani tasdiqlash:
          </p>
          <p className="text-amber-800 text-xs mb-3">
            Individual mebel narxi o'lcham va materialga qarab hisoblanadi. To'lov shartlarini kelishish uchun administrator bilan bog'laning:
          </p>
          
          <div className="space-y-2">
            <a
              href="tel:880606040"
              className="flex items-center gap-2 text-sm font-medium text-amber-950 bg-white/80 py-2.5 px-3 rounded-xl border border-amber-200"
            >
              <Phone size={16} className="text-amber-700" />
              +998 88 060 60 40
            </a>
            <a
              href="tel:934124604"
              className="flex items-center gap-2 text-sm font-medium text-amber-950 bg-white/80 py-2.5 px-3 rounded-xl border border-amber-200"
            >
              <Phone size={16} className="text-amber-700" />
              +998 93 412 46 04
            </a>
            <a
              href="https://t.me/zjxkdjbd"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-sm font-medium text-white bg-blue-600 py-2.5 px-3 rounded-xl justify-center"
            >
              <Send size={16} />
              Telegramdan yozish (@zjxkdjbd)
            </a>
          </div>
        </div>

        <button
          onClick={() => navigate('/')}
          className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-medium"
        >
          Asosiy sahifaga qaytish
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 pb-20 bg-gray-50 min-h-screen">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-700 active:scale-95 transition-transform"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Individual Buyurtma</h1>
          <p className="text-xs text-gray-500">O'zingiz xohlagan mebelni tanlab buyurtma bering</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        {/* Customer Contact */}
        <div className="space-y-3 pb-3 border-b border-gray-100">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Ismingiz <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Ismingizni kiriting"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Telefon raqamingiz <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              placeholder="+998 90 123 45 67"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Mebel turi (Chips) */}
        <div>
          <label className="block text-xs font-bold text-gray-800 mb-2">
            1. Mebel turini tanlang: <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {FURNITURE_TYPES.map((type) => (
              <button
                type="button"
                key={type}
                onClick={() => {
                  setFurnitureType(type);
                  setCustomFurnitureType('');
                }}
                className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                  furnitureType === type && !customFurnitureType
                    ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Yoki boshqa mebel turini yozing..."
            className="w-full mt-2 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-gray-900"
            value={customFurnitureType}
            onChange={(e) => setCustomFurnitureType(e.target.value)}
          />
        </div>

        {/* Material (Chips) */}
        <div>
          <label className="block text-xs font-bold text-gray-800 mb-2">
            2. Materialni tanlang:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {MATERIALS.map((mat) => (
              <button
                type="button"
                key={mat}
                onClick={() => setMaterial(mat)}
                className={`p-2.5 rounded-xl text-xs font-medium border text-left flex items-center justify-between transition-all ${
                  material === mat
                    ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <span>{mat}</span>
                {material === mat && <Check size={14} />}
              </button>
            ))}
          </div>
        </div>

        {/* Rangi (Chips) */}
        <div>
          <label className="block text-xs font-bold text-gray-800 mb-2">
            3. Rangi:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {COLORS.map((col) => (
              <button
                type="button"
                key={col}
                onClick={() => setColor(col)}
                className={`p-2.5 rounded-xl text-xs font-medium border text-left flex items-center justify-between transition-all ${
                  color === col
                    ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <span>{col}</span>
                {color === col && <Check size={14} />}
              </button>
            ))}
          </div>
        </div>

        {/* Uslubi (Chips) */}
        <div>
          <label className="block text-xs font-bold text-gray-800 mb-2">
            4. Dizayn uslubi:
          </label>
          <div className="flex flex-wrap gap-2">
            {STYLES.map((st) => (
              <button
                type="button"
                key={st}
                onClick={() => setStyle(st)}
                className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                  style === st
                    ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
        
        {/* Dimensions */}
        <div>
          <label className="block text-xs font-bold text-gray-800 mb-1">5. Taxminiy o'lchamlari:</label>
          <input
            type="text"
            placeholder="Masalan: 3x2.5 metr, balandligi 2.4 metr"
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm"
            value={dimensions}
            onChange={(e) => setDimensions(e.target.value)}
          />
        </div>
        
        {/* Photo Upload */}
        <div>
          <label className="block text-xs font-bold text-gray-800 mb-1">
            6. Mebel rasmi yoki chizmasi (ixtiyoriy):
          </label>
          <div className="flex items-center gap-3">
            <label className="flex-1 flex items-center justify-center gap-2 p-3 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors text-xs font-medium text-gray-700">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                disabled={uploadingPhoto}
              />
              {uploadingPhoto ? (
                <span>Rasm yuklanmoqda...</span>
              ) : photoUrl ? (
                <span className="text-green-600 font-bold">✅ Rasm biriktirildi (almashtirish)</span>
              ) : (
                <span>📷 Galereyadan rasm yuklash</span>
              )}
            </label>
            {photoUrl && (
              <img
                src={photoUrl}
                alt="Preview"
                className="w-12 h-12 object-cover rounded-lg border border-gray-200 flex-shrink-0"
              />
            )}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-bold text-gray-800 mb-1">7. Qo'shimcha istaklar:</label>
          <textarea
            placeholder="Mebel haqida qo'shimcha fikr va talablaringiz..."
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 h-20 text-sm"
            value={customerNote}
            onChange={(e) => setCustomerNote(e.target.value)}
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gray-900 hover:bg-black text-white py-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md active:scale-98"
        >
          {loading ? 'Yuborilmoqda...' : 'Individual buyurtmani yuborish'}
        </button>
      </form>
    </div>
  );
};

export default CustomOrder;
