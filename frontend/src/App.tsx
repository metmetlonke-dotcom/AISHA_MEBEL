import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import WebApp from '@twa-dev/sdk';
import AppLayout from './layouts/AppLayout';

import Home from './pages/Home';
import Catalog from './pages/Catalog';
import Cart from './pages/Cart';

import Profile from './pages/Profile';
import CustomOrder from './pages/CustomOrder';
import ProductDetail from './pages/ProductDetail';

function App() {
  useEffect(() => {
    try {
      if (WebApp && WebApp.ready) {
        WebApp.ready();
        WebApp.expand();
        WebApp.setHeaderColor('#ffffff');
      }
    } catch (e) {
      console.error(e);
    }

    // Auto version check to clear Telegram Webview cache on updates
    const checkVersion = async () => {
      try {
        const res = await fetch(`/version.json?t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          const serverVersion = data.version;
          const currentVersion = localStorage.getItem('aisha_app_version');

          if (currentVersion && currentVersion !== String(serverVersion)) {
            localStorage.setItem('aisha_app_version', String(serverVersion));
            if ('caches' in window) {
              caches.keys().then((names) => {
                names.forEach((name) => caches.delete(name));
              });
            }
            window.location.reload();
          } else if (!currentVersion) {
            localStorage.setItem('aisha_app_version', String(serverVersion));
          }
        }
      } catch (err) {
        console.error('App version check error:', err);
      }
    };

    checkVersion();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="catalog" element={<Catalog />} />
          <Route path="cart" element={<Cart />} />
          <Route path="profile" element={<Profile />} />
          <Route path="orders" element={<Profile />} />
          <Route path="custom-order" element={<CustomOrder />} />
          <Route path="product/:id" element={<ProductDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
