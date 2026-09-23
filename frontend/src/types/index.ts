export interface ProductImage {
  id: number;
  image_url: string;
  is_main: boolean;
  sort_order: number;
}

export interface Category {
  id: number;
  name: string;
  icon?: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface Product {
  id: number;
  name: string;
  category_id: number;
  price: number;
  old_price?: number;
  description?: string;
  dimensions?: string;
  material?: string;
  colors?: string;
  stock_quantity?: number;
  is_new?: boolean;
  is_popular?: boolean;
  is_promotion?: boolean;
  delivery_info?: string;
  assembly_info?: string;
  is_active?: boolean;
  category?: Category;
  images?: ProductImage[];
}

export interface User {
  id: number;
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: string;
  location_lat?: number;
  location_lon?: number;
  telegram_id?: number;
  username?: string;
  role?: string;
  is_blocked?: boolean;
  created_at?: string;
}

export interface OrderItem {
  id: number;
  product_name: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_address?: string;
  requires_delivery?: boolean;
  requires_assembly?: boolean;
  customer_note?: string;
  total_amount: number;
  status: string;
  created_at: string;
  items?: OrderItem[];
}

export interface IndividualOrder {
  id: number;
  customer_name: string;
  customer_phone: string;
  furniture_type: string;
  dimensions?: string;
  material?: string;
  colors?: string;
  design?: string;
  quantity: number;
  reference_image_url?: string;
  customer_note?: string;
  status: string;
  created_at: string;
}
