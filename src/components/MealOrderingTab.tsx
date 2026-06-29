import React, { useState } from "react";
import { MEAL_PRODUCTS } from "../data/meals";
import { Assessment, MealProduct, CartItem, Order } from "../types";
import { 
  ShoppingBag, 
  Plus, 
  Minus, 
  Trash2, 
  UtensilsCrossed, 
  Search, 
  Activity, 
  AlertTriangle,
  Sparkles,
  CreditCard,
  MapPin,
  CheckCircle,
  Clock
} from "lucide-react";

interface MealOrderingTabProps {
  assessment: Assessment;
  cart: CartItem[];
  onAddToCart: (item: CartItem) => void;
  onRemoveFromCart: (id: string) => void;
  onUpdateCartQty: (id: string, qty: number) => void;
  onCheckout: (order: Order) => void;
}

export default function MealOrderingTab({ 
  assessment, 
  cart, 
  onAddToCart, 
  onRemoveFromCart, 
  onUpdateCartQty, 
  onCheckout 
}: MealOrderingTabProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  
  // Checkout states
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [address, setAddress] = useState<string>("");
  const [cardName, setCardName] = useState<string>("");
  const [cardNumber, setCardNumber] = useState<string>("");
  const [isProcessingOrder, setIsProcessingOrder] = useState<boolean>(false);
  const [isOrderSuccess, setIsOrderSuccess] = useState<boolean>(false);

  // Filter products
  const filteredMeals = MEAL_PRODUCTS.filter((meal) => {
    const matchesCategory = selectedCategory === "all" || meal.category === selectedCategory;
    const matchesSearch = meal.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          meal.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const cartMeals = cart.filter(item => item.type === "meal");
  const cartMealsCount = cartMeals.reduce((sum, item) => sum + item.quantity, 0);
  const cartMealsTotal = cartMeals.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleAddProduct = (meal: MealProduct) => {
    onAddToCart({
      id: meal.id,
      name: meal.name,
      price: meal.price,
      image: meal.image,
      quantity: 1,
      type: "meal"
    });
  };

  const startCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
    // pre-fill cardholder name if we have user name
    if (assessment.name) {
      setCardName(assessment.name);
    }
  };

  const submitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim() || !cardNumber.trim()) {
      alert("Please complete delivery address and credit card details.");
      return;
    }

    setIsProcessingOrder(true);
    
    setTimeout(() => {
      setIsProcessingOrder(false);
      setIsOrderSuccess(true);
      
      const newOrder: Order = {
        id: "ord-meal-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
        items: [...cartMeals],
        total: cartMealsTotal + 3.99, // adding 3.99 delivery fee
        date: new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' }),
        status: "processing",
        deliveryAddress: address
      };

      onCheckout(newOrder);

      // Reset cart quantities for meals (done via parent callback in App)
      setTimeout(() => {
        setIsOrderSuccess(false);
        setIsCheckoutOpen(false);
        setAddress("");
        setCardNumber("");
      }, 3000);

    }, 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#F9F8F6] text-[#1A1A1A] overflow-y-auto p-4 md:p-6 pb-24">
      {/* Top Banner / Hero */}
      <div className="relative rounded-none overflow-hidden mb-6 p-5 border border-[#1A1A1A]/10 bg-white">
        <div className="relative z-10 max-w-xs">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E63946] underline underline-offset-4 block mb-2">
            Paid Meal Prep Delivery
          </span>
          <h2 className="text-2xl font-serif font-black italic text-[#1A1A1A] mt-3 mb-2 leading-tight">
            Gourmet, Muscle-Matched Nutrition Delivered Daily
          </h2>
          <p className="text-[#1A1A1A]/60 text-xs font-serif italic leading-relaxed">
            Every meal is calibrated for perfect macros, prepped fresh, and shipped vacuum-sealed.
          </p>
        </div>
        {/* Abstract graphics */}
        <div className="absolute right-0 top-0 bottom-0 w-32 opacity-10 flex items-center justify-center">
          <UtensilsCrossed className="w-16 h-16 text-[#1A1A1A]" />
        </div>
      </div>

      {/* User Preferences Alerts (Match Indicators) */}
      <div className="bg-white border border-[#1A1A1A]/10 rounded-none p-4 mb-6 flex flex-col gap-2">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-[#E63946]" />
          <h3 className="text-[11px] uppercase tracking-widest font-bold text-[#1A1A1A]">Personalized Food Radar</h3>
        </div>
        <p className="text-[11px] text-[#1A1A1A]/60 leading-relaxed font-serif italic">
          Showing meals custom badged for your onboarding diet preference: <span className="text-[#1A1A1A] font-bold uppercase not-italic">{assessment.dietType}</span>.
          {assessment.allergies && (
            <span className="block text-[#E63946] mt-1.5 font-sans not-italic font-semibold uppercase tracking-wider text-[10px]">
              ⚠️ Strict allergen filtering enabled for: {assessment.allergies}.
            </span>
          )}
        </p>
      </div>

      {/* Cart Quick Status / Button */}
      {cartMealsCount > 0 && (
        <button
          id="btn-open-meal-cart"
          onClick={() => setIsCartOpen(true)}
          className="bg-[#1A1A1A] hover:opacity-90 text-white font-bold p-4 rounded-none mb-6 flex items-center justify-between shadow-sm transition-all text-xs uppercase tracking-widest"
        >
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4.5 h-4.5" />
            <span>Review Culinary Box ({cartMealsCount} meals)</span>
          </div>
          <span className="bg-white/20 px-2 py-0.5 rounded-none text-[10px] font-extrabold">
            ${cartMealsTotal.toFixed(2)}
          </span>
        </button>
      )}

      {/* Filters & Search Row */}
      <div className="flex flex-col gap-3 mb-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-[#1A1A1A]/40" />
          <input
            id="input-search-meals"
            type="text"
            placeholder="Search healthy meal preps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-[#1A1A1A]/15 rounded-none pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#1A1A1A] text-[#1A1A1A]"
          />
        </div>

        {/* Categories scroll row */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: "all", label: "All Meals" },
            { id: "high-protein", label: "High Protein" },
            { id: "keto", label: "Ketogenic" },
            { id: "low-carb", label: "Low Carb" },
            { id: "vegan", label: "Vegan" },
            { id: "vegetarian", label: "Vegetarian" },
            { id: "balanced", label: "Balanced Fit" }
          ].map((cat) => (
            <button
              key={cat.id}
              id={`btn-meal-cat-${cat.id}`}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-none border text-xs font-bold uppercase tracking-wider transition-all ${
                selectedCategory === cat.id
                  ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                  : "bg-white border-[#1A1A1A]/10 text-[#1A1A1A]/70 hover:border-[#1A1A1A]/30"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Meals Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredMeals.length === 0 ? (
          <div className="text-center py-12 text-[#1A1A1A]/40 text-xs font-serif italic">
            No preps found matching that criteria. Try adjusting filters or searches!
          </div>
        ) : (
          filteredMeals.map((meal) => {
            // Diet alignment checks
            const fitsDiet = 
              assessment.dietType === "anything" ||
              (assessment.dietType === "vegan" && meal.category === "vegan") ||
              (assessment.dietType === "vegetarian" && (meal.category === "vegetarian" || meal.category === "vegan")) ||
              (assessment.dietType === "keto" && meal.category === "keto") ||
              (assessment.dietType === "low-carb" && (meal.category === "low-carb" || meal.category === "keto"));

            // Check if triggers user's allergies text
            const containsAllergen = assessment.allergies && 
              assessment.allergies.toLowerCase().split(",").some(allergen => 
                meal.name.toLowerCase().includes(allergen.trim()) || 
                meal.description.toLowerCase().includes(allergen.trim())
              );

            return (
              <div 
                key={meal.id}
                className="bg-white border border-[#1A1A1A]/10 rounded-none overflow-hidden flex flex-col xs:flex-row"
              >
                {/* Image */}
                <div className="relative w-full xs:w-28 h-32 xs:h-full bg-slate-100 flex-shrink-0">
                  <img
                    referrerPolicy="no-referrer"
                    src={meal.image}
                    alt={meal.name}
                    className="w-full h-full object-cover"
                  />
                  {fitsDiet && (
                    <span className="absolute top-2 left-2 bg-[#E63946] text-white text-[9px] font-bold px-2 py-0.5 rounded-none uppercase tracking-wider">
                      Diet Match
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex-grow flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="text-sm font-bold uppercase tracking-tight text-[#1A1A1A] leading-tight">
                        {meal.name}
                      </h4>
                      <span className="text-[#E63946] font-black text-sm flex-shrink-0">
                        ${meal.price}
                      </span>
                    </div>
                    <p className="text-[#1A1A1A]/60 text-xs mt-1 font-serif italic leading-relaxed line-clamp-2">
                      {meal.description}
                    </p>

                    {/* Allergies Warn */}
                    {containsAllergen && (
                      <div className="mt-2 flex items-center gap-1.5 text-[10px] text-[#E63946] bg-[#E63946]/5 px-2.5 py-1 border border-[#E63946]/10 rounded-none font-serif italic">
                        <AlertTriangle className="w-3.5 h-3.5 text-[#E63946] flex-shrink-0" />
                        <span>May conflict with allergen limits: {assessment.allergies}</span>
                      </div>
                    )}

                    {/* Macros Grid */}
                    <div className="grid grid-cols-4 gap-1.5 bg-[#F9F8F6] border border-[#1A1A1A]/5 p-2 rounded-none mt-3 text-center">
                      <div className="text-[10px]">
                        <span className="block text-[#1A1A1A]/40 uppercase tracking-wider font-bold">Calories</span>
                        <span className="font-bold text-[#1A1A1A] text-xs">{meal.calories}</span>
                      </div>
                      <div className="text-[10px]">
                        <span className="block text-[#1A1A1A]/40 uppercase tracking-wider font-bold">Protein</span>
                        <span className="font-bold text-[#E63946] text-xs">{meal.protein}g</span>
                      </div>
                      <div className="text-[10px]">
                        <span className="block text-[#1A1A1A]/40 uppercase tracking-wider font-bold">Carbs</span>
                        <span className="font-bold text-[#1A1A1A] text-xs">{meal.carbs}g</span>
                      </div>
                      <div className="text-[10px]">
                        <span className="block text-[#1A1A1A]/40 uppercase tracking-wider font-bold">Fat</span>
                        <span className="font-bold text-[#1A1A1A] text-xs">{meal.fat}g</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3 pt-3 border-t border-[#1A1A1A]/5">
                    <span className="text-[10px] uppercase font-bold text-[#1A1A1A]/40 tracking-wider">
                      {meal.category}
                    </span>
                    <button
                      id={`btn-add-meal-${meal.id}`}
                      onClick={() => handleAddProduct(meal)}
                      className="flex items-center gap-1 bg-[#1A1A1A] hover:opacity-90 text-white text-[10px] uppercase tracking-widest font-bold px-3 py-2 rounded-none transition-all"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#E63946]" />
                      Add prep
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Cart slide-over modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-40 bg-[#1A1A1A]/70 flex items-end justify-center p-4">
          <div className="bg-white border border-[#1A1A1A]/10 rounded-none max-w-sm w-full max-h-[80vh] flex flex-col justify-between overflow-hidden shadow-xl">
            <div className="p-4 border-b border-[#1A1A1A]/10 flex justify-between items-center bg-[#F9F8F6]">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#E63946]" />
                <h3 className="font-serif italic font-black text-[#1A1A1A] text-lg">Culinary Prep Box</h3>
              </div>
              <button
                id="btn-close-meal-cart"
                onClick={() => setIsCartOpen(false)}
                className="text-[#1A1A1A]/60 hover:text-[#1A1A1A] text-xs font-bold uppercase tracking-widest"
              >
                Close
              </button>
            </div>

            <div className="p-4 flex-grow overflow-y-auto space-y-3">
              {cartMeals.map((item) => (
                <div key={item.id} className="flex justify-between items-center gap-3 bg-[#F9F8F6] p-3 rounded-none border border-[#1A1A1A]/5">
                  <img
                    referrerPolicy="no-referrer"
                    src={item.image}
                    alt={item.name}
                    className="w-10 h-10 object-cover rounded-none bg-slate-100"
                  />
                  <div className="flex-grow min-w-0">
                    <h5 className="text-xs font-bold uppercase tracking-tight text-[#1A1A1A] truncate">{item.name}</h5>
                    <p className="text-[10px] text-[#E63946] font-bold mt-0.5">${item.price} each</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      id={`btn-cart-minus-${item.id}`}
                      onClick={() => onUpdateCartQty(item.id, item.quantity - 1)}
                      className="p-1 rounded-none bg-white border border-[#1A1A1A]/10 text-[#1A1A1A]"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs text-[#1A1A1A] font-bold w-4 text-center">{item.quantity}</span>
                    <button
                      id={`btn-cart-plus-${item.id}`}
                      onClick={() => onUpdateCartQty(item.id, item.quantity + 1)}
                      className="p-1 rounded-none bg-white border border-[#1A1A1A]/10 text-[#1A1A1A]"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      id={`btn-cart-del-${item.id}`}
                      onClick={() => onRemoveFromCart(item.id)}
                      className="p-1 text-[#1A1A1A]/40 hover:text-[#E63946] transition-all ml-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-[#1A1A1A]/10 bg-[#F9F8F6]">
              <div className="flex justify-between text-xs text-[#1A1A1A]/60 mb-1">
                <span>Box Items Subtotal</span>
                <span>${cartMealsTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-[#1A1A1A]/60 mb-2">
                <span>Safe Delivery Fee</span>
                <span>$3.99</span>
              </div>
              <div className="flex justify-between font-extrabold text-sm text-[#1A1A1A] mb-4 pt-2 border-t border-[#1A1A1A]/15">
                <span>Estimated Total</span>
                <span className="text-[#E63946] font-black">${(cartMealsTotal + 3.99).toFixed(2)}</span>
              </div>

              <button
                id="btn-go-to-checkout"
                onClick={startCheckout}
                className="w-full py-3.5 bg-[#E63946] hover:bg-[#d62828] text-white font-bold text-xs uppercase tracking-widest rounded-none transition-all shadow-sm flex items-center justify-center gap-2"
              >
                Proceed to Safe Checkout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout simulator modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-[#1A1A1A]/80 flex items-center justify-center p-4">
          <div className="bg-white border border-[#1A1A1A]/10 rounded-none max-w-sm w-full overflow-hidden shadow-xl">
            {isOrderSuccess ? (
              <div className="p-8 text-center flex flex-col items-center">
                <CheckCircle className="w-12 h-12 text-[#E63946] mb-4 animate-bounce" />
                <h3 className="text-xl font-serif font-black italic text-[#1A1A1A]">Order Authenticated!</h3>
                <p className="text-[#1A1A1A]/60 text-xs mt-1.5 max-w-xs font-serif italic">
                  Your payment was securely verified. Kitchen preps have begun!
                </p>
                <div className="mt-6 flex items-center gap-2 text-xs font-bold uppercase text-[#1A1A1A]/50 bg-[#F9F8F6] border border-[#1A1A1A]/10 px-3 py-2 rounded-none">
                  <Clock className="w-4 h-4 text-[#E63946]" />
                  <span>Est. Arrival: Tomorrow 11:30 AM</span>
                </div>
              </div>
            ) : (
              <form onSubmit={submitOrder} className="p-5 space-y-4">
                <div className="flex justify-between items-center border-b border-[#1A1A1A]/10 pb-3">
                  <h3 className="font-serif italic font-black text-lg text-[#1A1A1A] flex items-center gap-2">
                    <CreditCard className="w-4.5 h-4.5 text-[#E63946]" />
                    Paid Delivery Checkout
                  </h3>
                  <button
                    id="btn-close-checkout"
                    type="button"
                    onClick={() => setIsCheckoutOpen(false)}
                    className="text-[#1A1A1A]/50 hover:text-[#1A1A1A] text-xs font-bold uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[9px] font-bold text-[#1A1A1A]/60 uppercase tracking-widest mb-1.5">
                      Box Summary
                    </label>
                    <div className="bg-[#F9F8F6] px-3 py-2 rounded-none border border-[#1A1A1A]/5 text-xs flex justify-between font-bold">
                      <span className="text-[#1A1A1A]/60">{cartMealsCount} vacuum meal preps</span>
                      <span className="text-[#E63946]">${(cartMealsTotal + 3.99).toFixed(2)}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-[#1A1A1A]/60 uppercase tracking-widest mb-1.5">
                      Delivery Address
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-[#1A1A1A]/40" />
                      <input
                        id="input-checkout-address"
                        type="text"
                        placeholder="e.g. 742 Evergreen Terrace, Springfield"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                        className="w-full bg-white border border-[#1A1A1A]/15 rounded-none pl-9 pr-3 py-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-[#1A1A1A]/60 uppercase tracking-widest mb-1.5">
                      Secure Credit Card Number
                    </label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-3.5 w-4 h-4 text-[#1A1A1A]/40" />
                      <input
                        id="input-checkout-card"
                        type="text"
                        placeholder="4111 2222 3333 4444"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        required
                        maxLength={19}
                        className="w-full bg-white border border-[#1A1A1A]/15 rounded-none pl-9 pr-3 py-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-bold text-[#1A1A1A]/60 uppercase tracking-widest mb-1.5">
                        Expiry Date
                      </label>
                      <input
                        id="input-checkout-expiry"
                        type="text"
                        placeholder="MM/YY"
                        required
                        className="w-full bg-white border border-[#1A1A1A]/15 rounded-none px-3 py-2.5 text-xs text-[#1A1A1A] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-[#1A1A1A]/60 uppercase tracking-widest mb-1.5">
                        Security CVV
                      </label>
                      <input
                        id="input-checkout-cvv"
                        type="password"
                        placeholder="***"
                        required
                        maxLength={3}
                        className="w-full bg-white border border-[#1A1A1A]/15 rounded-none px-3 py-2.5 text-xs text-[#1A1A1A] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <button
                  id="btn-submit-order"
                  type="submit"
                  disabled={isProcessingOrder}
                  className="w-full py-3.5 mt-4 bg-[#E63946] hover:bg-[#d62828] text-white font-bold text-xs uppercase tracking-widest rounded-none transition-all shadow-md flex items-center justify-center gap-2"
                >
                  {isProcessingOrder ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Authorizing Payment Gateway...
                    </>
                  ) : (
                    <>
                      Place Paid Order • ${(cartMealsTotal + 3.99).toFixed(2)}
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
