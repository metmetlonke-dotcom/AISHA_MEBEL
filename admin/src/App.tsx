import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';

const Dashboard = () => <div className="bg-white p-6 rounded-lg shadow-sm">Dashboard statiskalari (Tez orada...)</div>;
const Orders = () => <div className="bg-white p-6 rounded-lg shadow-sm">Buyurtmalar ro'yxati (Tez orada...)</div>;
const Products = () => <div className="bg-white p-6 rounded-lg shadow-sm">Mahsulotlar ro'yxati (Tez orada...)</div>;
const Customers = () => <div className="bg-white p-6 rounded-lg shadow-sm">Mijozlar ro'yxati (Tez orada...)</div>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<Orders />} />
          <Route path="products" element={<Products />} />
          <Route path="customers" element={<Customers />} />
          <Route path="*" element={<div className="bg-white p-6 rounded-lg shadow-sm">Tez orada...</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
