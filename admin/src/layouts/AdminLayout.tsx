import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Users, Package, Settings, LogOut, Grid } from 'lucide-react';

export default function AdminLayout() {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Buyurtmalar', href: '/orders', icon: ShoppingCart },
    { name: 'Mahsulotlar', href: '/products', icon: Package },
    { name: 'Kategoriyalar', href: '/categories', icon: Grid },
    { name: 'Mijozlar', href: '/customers', icon: Users },
    { name: 'Sozlamalar', href: '/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="flex items-center justify-center h-16 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">AISHA MEBEL</h1>
        </div>
        <nav className="mt-6 px-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActive ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-white' : 'text-gray-400'} />
                <span className="ml-3">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200">
          <button className="flex items-center w-full px-4 py-3 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
            <LogOut size={20} />
            <span className="ml-3">Chiqish</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm">
          <div className="px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              {navigation.find(n => n.href === location.pathname)?.name || 'Admin Panel'}
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">Rahbar</span>
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">
                R
              </div>
            </div>
          </div>
        </header>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
