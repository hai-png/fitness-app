import React, { useState } from "react";
import { MARKETPLACE_PRODUCTS } from "../data/marketplace";
// A-24: targeted type-only import from schemas — these are pure types
// (MarketplaceProduct, CartItem, Order). The `import type` keyword +
// targeted module path lets the bundler elide this entire statement at
// build time and prevents the engine barrel from pulling the assessment +
// nutrition + adaptiveTdee formula modules into the Marketplace bundle.
import type { MarketplaceProduct, CartItem, Order } from "../engine/schemas";
import { useSafeTimeout } from "../hooks/useSafeTimeout";
import { Modal } from "./Modal";
import {
  ShoppingBag,
  Search,
  Plus,
  Minus,
  Trash2,
  Star,
  Sparkles,
  ShoppingBagIcon,
  Dumbbell,
  MapPin,
  CheckCircle,
  Truck,
  Shirt,
  Package,
  SlidersHorizontal,
  AlertTriangle,
} from "lucide-react";

interface MarketplaceTabProps {
  cart: CartItem[];
  onAddToCart: (item: CartItem) => void;
  onRemoveFromCart: (id: string) => void;
  onUpdateCartQty: (id: string, qty: number) => void;
  onCheckout: (order: Order) => void;
}

export default function MarketplaceTab({
  cart,
  onAddToCart,
  onRemoveFromCart,
  onUpdateCartQty,
  onCheckout,
}: MarketplaceTabProps) {
  // F-H4: useSafeTimeout guards all setTimeout callbacks against firing
  // after unmount (prevents spurious order pushes if the user navigates
  // away mid-checkout).
  const safeTimeout = useSafeTimeout();

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [typedQuery, setTypedQuery] = useState<string>("");
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>("default");

  // Checkout states
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [address, setAddress] = useState<string>("");
  const [isProcessingOrder, setIsProcessingOrder] = useState<boolean>(false);
  const [isOrderSuccess, setIsOrderSuccess] = useState<boolean>(false);

  const filteredProducts = MARKETPLACE_PRODUCTS.filter((prod) => {
    const matchesCategory = selectedCategory === "all" || prod.category === selectedCategory;
    const matchesSearch =
      typedQuery === "" ||
      prod.name.toLowerCase().includes(typedQuery.toLowerCase()) ||
      prod.description.toLowerCase().includes(typedQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-asc") return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    if (sortBy === "rating") return b.rating - a.rating;
    return 0;
  });

  const cartItems = cart.filter((item) => item.type === "marketplace");
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleAddProduct = (prod: MarketplaceProduct) => {
    onAddToCart({
      id: prod.id,
      name: prod.name,
      price: prod.price,
      image: prod.image,
      quantity: 1,
      type: "marketplace",
    });
  };

  const startCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const submitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;

    setIsProcessingOrder(true);

    safeTimeout(() => {
      setIsProcessingOrder(false);
      setIsOrderSuccess(true);

      // Use crypto.randomUUID() for cryptographically safe order IDs.
      // Falls back to timestamp+random for older browsers.
      const orderId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `ord-mkt-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

      const newOrder: Order = {
        id: orderId,
        items: [...cartItems],
        total: cartTotal + 4.99, // adding 4.99 shipping
        date: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
        status: "pending",
        deliveryAddress: address,
        type: "marketplace",
      };

      onCheckout(newOrder);

      safeTimeout(() => {
        setIsOrderSuccess(false);
        setIsCheckoutOpen(false);
        setAddress("");
      }, 3000);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#F9F8F6] text-[#1A1A1A] overflow-y-auto p-4 md:p-6 pb-24">
      {/* Title */}
      <div className="mb-5 flex justify-between items-center">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E63946] underline underline-offset-4 block mb-2">
            04 — FitLife Store
          </span>
          <h1 className="text-3xl font-serif font-black italic text-[#1A1A1A] mt-3 tracking-tight">
            Curated Fitness Marketplace
          </h1>
        </div>

        {/* Floating Cart Icon */}
        <button
          aria-label="Open cart"
          id="btn-open-mkt-cart"
          onClick={() => setIsCartOpen(true)}
          className="relative bg-white border border-[#1A1A1A]/10 p-3 rounded-none hover:border-[#1A1A1A]/30 transition-all shadow-sm"
        >
          <ShoppingBag className="w-5 h-5 text-[#1A1A1A]" />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-[#E63946] text-white text-[9px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      {/* Hero promo card */}
      <div className="bg-white border border-[#1A1A1A]/10 rounded-none p-4 mb-6 flex items-center justify-between gap-4">
        <div className="max-w-[200px]">
          <h4 className="text-[#1A1A1A] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-[#E63946]" /> Free Shipping Threshold
          </h4>
          <p className="text-[10px] text-[#1A1A1A]/60 mt-1 font-serif italic leading-relaxed">
            Spend $75+ on hardware or supplements to secure free express courier dispatch.
          </p>
        </div>
        <div className="bg-[#E63946]/5 border border-[#E63946]/10 px-3 py-1.5 rounded-none text-xs font-bold text-[#E63946] text-center flex-shrink-0 font-mono">
          PROMO: FIT75
        </div>
      </div>

      {/* Search & Categories */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-[#1A1A1A]/40" />
          <input
            id="input-search-mkt"
            type="text"
            placeholder="Search equipment, apparel, supplements..."
            value={typedQuery}
            onChange={(e) => setTypedQuery(e.target.value)}
            className="w-full bg-white border border-[#1A1A1A]/15 rounded-none pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#1A1A1A] text-[#1A1A1A]"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: "all", label: "All Items", icon: <Package className="w-3.5 h-3.5" /> },
            { id: "apparel", label: "Apparel", icon: <Shirt className="w-3.5 h-3.5" /> },
            { id: "supplements", label: "Supplements", icon: <Sparkles className="w-3.5 h-3.5" /> },
            { id: "equipment", label: "Equipment", icon: <Dumbbell className="w-3.5 h-3.5" /> },
            {
              id: "accessories",
              label: "Accessories",
              icon: <ShoppingBagIcon className="w-3.5 h-3.5" />,
            },
          ].map((cat) => (
            <button
              key={cat.id}
              id={`btn-mkt-cat-${cat.id}`}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-none border text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                  : "bg-white border-[#1A1A1A]/10 text-[#1A1A1A]/70 hover:border-[#1A1A1A]/30"
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between mt-1 pt-2 border-t border-[#1A1A1A]/5">
          <span className="text-[10px] uppercase font-bold text-[#1A1A1A]/50 tracking-wider">
            {sortedProducts.length} {sortedProducts.length === 1 ? "Product" : "Products"} found
          </span>
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-3 h-3 text-[#1A1A1A]/50" />
            <select
              id="mkt-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/70 focus:outline-none cursor-pointer border-none p-0 pr-1"
            >
              <option value="default">Sort: Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Rating: Highest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      {sortedProducts.length === 0 ? (
        <div className="bg-white border border-[#1A1A1A]/10 p-8 text-center flex flex-col items-center justify-center">
          <Package className="w-10 h-10 text-[#1A1A1A]/30 mb-2 animate-pulse" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/80">
            No Products Found
          </h4>
          <p className="text-[10px] text-[#1A1A1A]/60 mt-1 font-serif italic max-w-xs">
            We couldn&apos;t find any products matching &quot;{typedQuery}&quot;. Try clearing your
            filters or search keywords.
          </p>
          <button
            id="btn-clear-search-mkt"
            onClick={() => {
              setTypedQuery("");
              setSelectedCategory("all");
            }}
            className="mt-4 px-4 py-1.5 border border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3.5">
          {sortedProducts.map((prod) => (
            <div
              key={prod.id}
              className="bg-white border border-[#1A1A1A]/10 rounded-none overflow-hidden flex flex-col justify-between shadow-sm hover:border-[#1A1A1A]/30 transition-all group"
            >
              {/* Image section */}
              <div className="relative h-28 bg-[#F9F8F6] overflow-hidden">
                <img
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  src={prod.image}
                  alt={prod.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {prod.badge && (
                  <span className="absolute top-2 left-2 bg-[#E63946] text-white text-[8px] font-bold uppercase px-2 py-0.5 rounded-none tracking-widest">
                    {prod.badge}
                  </span>
                )}
              </div>

              {/* Meta */}
              <div className="p-3 flex-grow flex flex-col justify-between">
                <div>
                  <span className="text-[9px] uppercase font-bold text-[#1A1A1A]/40 tracking-wider">
                    {prod.category}
                  </span>
                  <h4 className="text-xs font-bold uppercase tracking-tight text-[#1A1A1A] mt-0.5 line-clamp-1">
                    {prod.name}
                  </h4>
                  <p className="text-[10px] text-[#1A1A1A]/60 mt-1 font-serif italic leading-relaxed line-clamp-2">
                    {prod.description}
                  </p>
                </div>

                <div className="mt-3">
                  {/* Rating & Price */}
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="text-xs text-[#E63946] font-black">${prod.price}</span>
                    <div className="flex items-center gap-0.5 text-[10px] text-amber-500 font-bold">
                      <Star className="w-3 h-3 fill-current" />
                      <span>{prod.rating}</span>
                    </div>
                  </div>

                  <button
                    id={`btn-add-prod-${prod.id}`}
                    onClick={() => handleAddProduct(prod)}
                    className="w-full py-2 bg-[#1A1A1A] hover:opacity-90 text-white rounded-none text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#E63946]" />
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cart Drawer — F-C2: uses the accessible <Modal> component
          (role=dialog, aria-modal, Escape-to-close, focus trap, restore focus).
          The original was a bottom-anchored drawer (items-end); the Modal
          centers vertically, which is more accessible. z-40 keeps it below
          other modals (z-50) but above the tab bar (z-30). */}
      <Modal
        open={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        title="Shopping Basket"
        maxWidthClass="max-w-sm"
        zIndexClass="z-40"
      >
        <div className="max-h-[70vh] flex flex-col justify-between">
          <div className="p-4 flex-grow overflow-y-auto space-y-3">
              {cartItems.length === 0 ? (
                <div className="text-center py-10 text-[#1A1A1A]/40 text-xs font-serif italic">
                  Your gear basket is currently empty. Add products to get equipped!
                </div>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center gap-3 bg-[#F9F8F6] p-2.5 rounded-none border border-[#1A1A1A]/5"
                  >
                    <img
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      src={item.image}
                      alt={item.name}
                      className="w-10 h-10 object-cover rounded-none bg-slate-100"
                    />
                    <div className="flex-grow min-w-0">
                      <h5 className="text-xs font-bold uppercase tracking-tight text-[#1A1A1A] truncate">
                        {item.name}
                      </h5>
                      <p className="text-[10px] text-[#E63946] font-bold mt-0.5">${item.price}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        aria-label="Decrease quantity"
                        id={`btn-cart-minus-mkt-${item.id}`}
                        onClick={() => onUpdateCartQty(item.id, item.quantity - 1)}
                        // F-M11 fix: 44×44 px minimum touch target (WCAG 2.5.5).
                        className="p-1 rounded-none bg-white border border-[#1A1A1A]/10 text-[#1A1A1A] min-w-[44px] min-h-[44px] flex items-center justify-center"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs text-[#1A1A1A] font-bold w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        aria-label="Increase quantity"
                        id={`btn-cart-plus-mkt-${item.id}`}
                        onClick={() => onUpdateCartQty(item.id, item.quantity + 1)}
                        // F-M11 fix: 44×44 px minimum touch target (WCAG 2.5.5).
                        className="p-1 rounded-none bg-white border border-[#1A1A1A]/10 text-[#1A1A1A] min-w-[44px] min-h-[44px] flex items-center justify-center"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        aria-label="Remove item"
                        id={`btn-cart-del-mkt-${item.id}`}
                        onClick={() => onRemoveFromCart(item.id)}
                        className="p-1 text-[#1A1A1A]/40 hover:text-[#E63946] transition-all ml-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="p-4 border-t border-[#1A1A1A]/10 bg-[#F9F8F6]">
                <div className="flex justify-between text-xs text-[#1A1A1A]/60 mb-1">
                  <span>Basket Subtotal</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-[#1A1A1A]/60 mb-2">
                  <span>Express Dispatch</span>
                  <span>{cartTotal >= 75 ? "FREE" : "$4.99"}</span>
                </div>
                <div className="flex justify-between font-extrabold text-sm text-[#1A1A1A] mb-4 pt-2 border-t border-[#1A1A1A]/15">
                  <span>Estimated Total</span>
                  <span className="text-[#E63946] font-black">
                    ${(cartTotal >= 75 ? cartTotal : cartTotal + 4.99).toFixed(2)}
                  </span>
                </div>

                <button
                  id="btn-go-to-checkout-mkt"
                  onClick={startCheckout}
                  className="w-full py-3.5 bg-[#E63946] hover:bg-[#d62828] text-white font-bold text-xs uppercase tracking-widest rounded-none transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </div>
      </Modal>

      {/* Checkout Simulator — F-C2: uses the accessible <Modal> component
          (role=dialog, aria-modal, Escape-to-close, focus trap, restore focus). */}
      <Modal
        open={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        title="Demo Checkout"
        closeOnOverlayClick={!isProcessingOrder}
      >
        {isOrderSuccess ? (
          <div className="p-8 text-center flex flex-col items-center">
            <CheckCircle className="w-12 h-12 text-[#E63946] mb-4 animate-bounce" />
            <h3 className="text-xl font-serif font-black italic text-[#1A1A1A]">
              Demo Order Confirmed
            </h3>
            <p className="text-[#1A1A1A]/60 text-xs mt-1.5 max-w-xs font-serif italic">
              Your simulated order is complete. <strong className="not-italic font-bold text-[#E63946]">No payment was processed</strong> and no items will ship.
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs font-bold uppercase text-[#1A1A1A]/50 bg-[#F9F8F6] border border-[#1A1A1A]/10 px-3 py-2 rounded-none">
              <AlertTriangle className="w-4 h-4 text-[#E63946]" />
              <span>Demo mode — no real transaction</span>
            </div>
          </div>
        ) : (
          <form onSubmit={submitOrder} className="p-5 space-y-4">
            {/* Demo-mode banner — no real payment is processed */}
            <div className="bg-[#E63946]/5 border border-[#E63946]/15 px-3 py-2.5 flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-[#E63946] flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-[#1A1A1A]/70 font-serif italic leading-relaxed">
                <strong className="not-italic font-bold text-[#E63946]">Demo only.</strong> No
                real payment is processed and no card details are collected. Submitting will
                simulate an order confirmation for showcase purposes.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <p className="block text-[9px] font-bold text-[#1A1A1A]/60 uppercase tracking-widest mb-1.5">
                  Purchase Total
                </p>
                <div className="bg-[#F9F8F6] px-3 py-2 rounded-none border border-[#1A1A1A]/5 text-xs flex justify-between font-bold">
                  <span className="text-[#1A1A1A]/60">{cartCount} premium items</span>
                  <span className="text-[#E63946]">
                    ${(cartTotal >= 75 ? cartTotal : cartTotal + 4.99).toFixed(2)}
                  </span>
                </div>
              </div>

              <div>
                <label
                  htmlFor="input-checkout-address-mkt"
                  className="block text-[9px] font-bold text-[#1A1A1A]/60 uppercase tracking-widest mb-1.5"
                >
                  Shipping Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-[#1A1A1A]/40" />
                  <input
                    id="input-checkout-address-mkt"
                    type="text"
                    placeholder="e.g. 742 Evergreen Terrace, Springfield"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    className="w-full bg-white border border-[#1A1A1A]/15 rounded-none pl-9 pr-3 py-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                  />
                </div>
              </div>
            </div>

            <button
              id="btn-submit-order-mkt"
              type="submit"
              disabled={isProcessingOrder}
              className="w-full py-3.5 mt-4 bg-[#E63946] hover:bg-[#d62828] text-white font-bold text-xs uppercase tracking-widest rounded-none transition-all shadow-md flex items-center justify-center gap-2"
            >
              {isProcessingOrder ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Preparing Demo Order...
                </>
              ) : (
                <>
                  Place Demo Order • $
                  {(cartTotal >= 75 ? cartTotal : cartTotal + 4.99).toFixed(2)}
                </>
              )}
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
}
