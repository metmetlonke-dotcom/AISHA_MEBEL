import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Search, ShoppingBag, User } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';

export default function AppLayout() {
  const location = useLocation();
  const cartItems = useCartStore(state => state.items);
  const totalCartItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const navItems = [
    { path: '/', icon: Home, label: 'Asosiy' },
    { path: '/catalog', icon: Search, label: 'Katalog' },
    { path: '/cart', icon: ShoppingBag, label: 'Savatcha', badge: totalCartItems },
    { path: '/profile', icon: User, label: 'Profil' },
  ];

  return (
    <div className="pb-16 min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 w-full max-w-md mx-auto bg-white shadow-sm overflow-x-hidden">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 z-50">
        <div className="max-w-md mx-auto flex justify-around items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative flex flex-col items-center justify-center w-full h-full space-y-1 ${
                  isActive ? 'text-accent' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon size={24} />
                <span className="text-[10px] font-medium">{item.label}</span>
                {item.badge ? (
                  <span className="absolute top-2 right-1/4 translate-x-1/2 -translate-y-1/2 bg-accent text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
