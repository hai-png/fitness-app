import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItem, Order } from "../engine";

/**
 * Commerce store — cart + order history. Persisted so a refresh doesn't
 * wipe an in-progress shopping cart.
 */
interface CommerceState {
  cart: CartItem[];
  orderHistory: Order[];

  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateCartQty: (id: string, qty: number) => void;
  clearCartByType: (type: "meal" | "marketplace") => void;

  addOrder: (order: Order) => void;
  reset: () => void;
}

export const useCommerceStore = create<CommerceState>()(
  persist(
    (set) => ({
      cart: [],
      orderHistory: [],

      addToCart: (item) =>
        set((s) => {
          const existing = s.cart.find((i) => i.id === item.id && i.type === item.type);
          if (existing) {
            return {
              cart: s.cart.map((i) =>
                i.id === item.id && i.type === item.type ? { ...i, quantity: i.quantity + 1 } : i,
              ),
            };
          }
          return { cart: [...s.cart, item] };
        }),

      removeFromCart: (id) => set((s) => ({ cart: s.cart.filter((i) => i.id !== id) })),

      updateCartQty: (id, qty) =>
        set((s) => {
          if (qty < 1) {
            return { cart: s.cart.filter((i) => i.id !== id) };
          }
          return {
            cart: s.cart.map((i) => (i.id === id ? { ...i, quantity: qty } : i)),
          };
        }),

      clearCartByType: (type) => set((s) => ({ cart: s.cart.filter((i) => i.type !== type) })),

      addOrder: (order) =>
        set((s) => ({
          orderHistory: [order, ...s.orderHistory],
          cart: s.cart.filter((i) => i.type !== order.type),
        })),

      reset: () => set({ cart: [], orderHistory: [] }),
    }),
    {
      name: "fitlife:commerce",
      storage: createJSONStorage(() => localStorage),
      version: 1,
      // A-15/F-C1: identity migrate — see useLogsStore for rationale.
      migrate: (persisted: unknown) => persisted,
    },
  ),
);
