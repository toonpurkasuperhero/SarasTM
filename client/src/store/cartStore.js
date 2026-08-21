import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      currency: 'INR',

      addItem: (product) => {
        const existing = get().items.find((i) => i.id === product.id);
        if (existing) return;
        set((state) => ({ items: [...state.items, { ...product, quantity: 1 }] }));
      },

      removeItem: (productId) => {
        set((state) => ({ items: state.items.filter((i) => i.id !== productId) }));
      },

      clearCart: () => set({ items: [] }),

      setCurrency: (currency) => set({ currency }),

      getTotal: () => {
        const { items, currency } = get();
        return items.reduce((acc, item) => {
          const price = currency === 'INR' ? item.price_inr
            : currency === 'USD' ? item.price_usd
            : currency === 'EUR' ? item.price_eur
            : item.price_gbp;
          return acc + (price || 0) * item.quantity;
        }, 0);
      },
    }),
    { name: 'sarastm-cart' }
  )
);

export default useCartStore;
