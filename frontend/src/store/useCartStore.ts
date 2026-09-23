import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  product_id: number;
  name: string;
  price: number;
  old_price?: number;
  image_url: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (product_id: number) => void;
  increaseQuantity: (product_id: number) => void;
  decreaseQuantity: (product_id: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (newItem) => set((state) => {
        const existing = state.items.find((i) => i.product_id === newItem.product_id);
        if (existing) {
          return {
            items: state.items.map((i) => 
              i.product_id === newItem.product_id ? { ...i, quantity: i.quantity + 1 } : i
            )
          };
        }
        return { items: [...state.items, { ...newItem, quantity: 1 }] };
      }),
      removeItem: (id) => set((state) => ({
        items: state.items.filter((i) => i.product_id !== id)
      })),
      increaseQuantity: (id) => set((state) => ({
        items: state.items.map((i) => 
          i.product_id === id ? { ...i, quantity: i.quantity + 1 } : i
        )
      })),
      decreaseQuantity: (id) => set((state) => ({
        items: state.items.map((i) => 
          i.product_id === id && i.quantity > 1 ? { ...i, quantity: i.quantity - 1 } : i
        )
      })),
      clearCart: () => set({ items: [] }),
      getTotal: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
      }
    }),
    {
      name: 'aisha-mebel-cart',
    }
  )
);
