// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   ArrowLeft,
//   ShoppingCart,
//   Plus,
//   Minus,
//   Trash2,
//   IndianRupee,
//   X,
// } from "lucide-react";
// import { useCart } from "../../contexts/CartContext";
// import axiosInstance from "../../api/axiosInstance";

// const Cart = () => {
//   const navigate = useNavigate();
//   const { cart, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart();
//   const [restaurants, setRestaurants] = useState({});
  

//   useEffect(() => {
//     loadRestaurants();
//   }, []);

//   const loadRestaurants = async () => {
//     try {
//       const res = await axiosInstance.get("/Restaurant");
//       const data = res.data;
//       const restaurantMap = {};
//       data.forEach((r) => {
//         restaurantMap[r.restaurantID] = r;
//       });
//       setRestaurants(restaurantMap);
//     } catch (error) {
//       console.error("Error loading restaurants:", error);
//     }
//   };

//   // const clearCart = () => {
//   //   if (window.confirm("Are you sure you want to clear your cart?")) {
//   //     localStorage.removeItem("cart");
//   //   }
//   // };
  
// const handleClearCart = () => {
//     if (window.confirm("Are you sure you want to clear your cart?")) {
//         clearCart();
//     }
// };

//   const getDeliveryCharge = () => {
//     return 25; // Fixed delivery charge
//   };

//   const getTotal = () => {
//     return getTotalPrice() + getDeliveryCharge();
//   };

//   // Group items by restaurant
//   const groupedCart = cart.reduce((acc, item) => {
//     const restaurantID = item.restaurantID;
//     if (!acc[restaurantID]) {
//       acc[restaurantID] = [];
//     }
//     acc[restaurantID].push(item);
//     return acc;
//   }, {});

//   if (cart.length === 0) {
//     return (
//       <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//         <button
//           onClick={() => navigate("/customer/all-items")}
//           className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-semibold transition"
//         >
//           <ArrowLeft size={20} />
//           Continue Shopping
//         </button>
//         <div className="bg-white rounded-3xl shadow-xl p-16 text-center">
//           <ShoppingCart size={80} className="mx-auto text-gray-300 mb-6" />
//           <h2 className="text-3xl font-black text-gray-900 mb-4">Your cart is empty</h2>
//           <p className="text-gray-600 mb-8">Add delicious items to get started!</p>
//           <button
//             onClick={() => navigate("/customer/all-items")}
//             className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-black text-lg hover:from-orange-600 hover:to-red-700 transition shadow-lg"
//           >
//             Browse Restaurants
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//       <div className="flex items-center justify-between mb-6">
//         <button
//           onClick={() => navigate("/customer/all-items")}
//           className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold transition"
//         >
//           <ArrowLeft size={20} />
//           Continue Shopping
//         </button>
//         {cart.length > 0 && (
//           <button
//             onClick={handleClearCart}
//             className="text-red-600 hover:text-red-700 font-semibold transition"
//           >
//             Clear Cart
//           </button>
//         )}
//       </div>

//       <h1 className="text-4xl font-black text-gray-900 mb-8">Your Cart</h1>

//       {/* Cart Items by Restaurant */}
//       <div className="space-y-6 mb-8">
//         {Object.entries(groupedCart).map(([restaurantID, items]) => {
//           const restaurant = restaurants[restaurantID];
//           const restaurantTotal = items.reduce(
//             (sum, item) => sum + item.menuItemPrice * item.quantity,
//             0
//           );

//           return (
//             <div key={restaurantID} className="bg-white rounded-2xl shadow-xl p-6">
//               <div className="flex items-center justify-between mb-4 pb-4 border-b">
//                 <div>
//                   <h3 className="text-xl font-black text-gray-900">
//                     {restaurant?.name || items[0]?.restaurantName || "Restaurant"}
//                   </h3>
//                   {restaurant?.city && (
//                     <p className="text-sm text-gray-600">{restaurant.city}</p>
//                   )}
//                 </div>
//                 <button
//                   onClick={() => navigate(`/customer/restaurant/${restaurantID}`)}
//                   className="text-orange-600 hover:text-orange-700 font-semibold text-sm"
//                 >
//                   Add More
//                 </button>
//               </div>

//               <div className="space-y-4">
//                 {items.map((item) => (
//                   <div
//                     key={item.menuItemID}
//                     className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
//                   >
//                     <img
//                       src={item.imageUrl || item.menuItemImage || `https://source.unsplash.com/200x200/?food,${encodeURIComponent(item.menuItemName)}`}
//                       alt={item.menuItemName}
//                       className="w-20 h-20 rounded-xl object-cover shadow-md"
//                       onError={(e) => {
//                         e.target.src = `https://source.unsplash.com/200x200/?food,${encodeURIComponent(item.menuItemName)}`;
//                       }}
//                     />
//                     <div className="flex-1">
//                       <h4 className="font-bold text-gray-900 text-lg mb-1">
//                         {item.menuItemName}
//                       </h4>
//                       <p className="text-xl font-black text-gray-900">
//                         ₹{item.menuItemPrice}
//                       </p>
//                     </div>
//                     <div className="flex items-center gap-4">
//                       <div className="flex items-center gap-3 bg-white rounded-xl px-3 py-2 border-2 border-gray-200">
//                         <button
//                           onClick={() => updateQuantity(item.menuItemID, item.quantity - 1)}
//                           className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition"
//                         >
//                           <Minus size={18} />
//                         </button>
//                         <span className="text-lg font-black text-gray-900 w-8 text-center">
//                           {item.quantity}
//                         </span>
//                         <button
//                           onClick={() => updateQuantity(item.menuItemID, item.quantity + 1)}
//                           className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition"
//                         >
//                           <Plus size={18} />
//                         </button>
//                       </div>
//                       <p className="text-xl font-black text-gray-900 w-24 text-right">
//                         ₹{(item.menuItemPrice * item.quantity).toFixed(2)}
//                       </p>
//                       <button
//                         onClick={() => removeFromCart(item.menuItemID)}
//                         className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
//                       >
//                         <Trash2 size={20} />
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               <div className="mt-4 pt-4 border-t text-right">
//                 <p className="text-gray-600 font-semibold">
//                   Subtotal: <span className="text-gray-900 font-black">₹{restaurantTotal.toFixed(2)}</span>
//                 </p>
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* Order Summary */}
//       <div className="bg-white rounded-2xl shadow-xl p-6 sticky bottom-0">
//         <h2 className="text-2xl font-black text-gray-900 mb-4">Order Summary</h2>
//         <div className="space-y-3 mb-6">
//           <div className="flex justify-between text-gray-600">
//             <span>Subtotal</span>
//             <span className="font-semibold">₹{getTotalPrice().toFixed(2)}</span>
//           </div>
//           <div className="flex justify-between text-gray-600">
//             <span>Delivery Charge</span>
//             <span className="font-semibold">₹{getDeliveryCharge().toFixed(2)}</span>
//           </div>
//           <div className="pt-3 border-t flex justify-between text-xl font-black text-gray-900">
//             <span>Total</span>
//             <span>₹{getTotal().toFixed(2)}</span>
//           </div>
//         </div>
//         <button
//           onClick={() => navigate("/customer/checkout")}
//           className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-4 rounded-xl font-black text-lg hover:from-orange-600 hover:to-red-700 transition shadow-lg hover:shadow-xl"
//         >
//           Proceed to Checkout
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Cart;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, ShoppingCart, Plus, Minus, Trash2, MapPin, Store,
} from "lucide-react";
import { useCart } from "../../contexts/CartContext";
import axiosInstance from "../../api/axiosInstance";

/* ─── CSS ────────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&family=Nunito:wght@300;400;600;700;800;900&display=swap');

*,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }

:root {
  --red:     #e8431c;
  --red-dk:  #c23516;
  --saffron: #f09010;
  --grad:    linear-gradient(135deg,#e8431c 0%,#f09010 100%);
  --glow:    rgba(232,67,28,0.22);
  --bg:      #fdf7f0;
  --card:    #ffffff;
  --pill:    #fff4eb;
  --border:  rgba(232,67,28,0.10);
  --ink:     #1a0c00;
  --ink-md:  #5a2e10;
  --ink-mt:  #b07850;
  --green:   #16a34a;
  --font-d:  'Playfair Display', serif;
  --font-b:  'Nunito', sans-serif;
}

html, body {
  background: var(--bg);
  background-image: radial-gradient(circle, rgba(232,67,28,0.05) 1px, transparent 1px);
  background-size: 26px 26px;
  font-family: var(--font-b);
  color: var(--ink);
}

@keyframes spin   { to { transform:rotate(360deg); } }
@keyframes fadeUp { from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);} }
@keyframes popIn  { from{opacity:0;transform:scale(0.97);}to{opacity:1;transform:scale(1);} }

::-webkit-scrollbar { width:4px; }
::-webkit-scrollbar-track { background:var(--bg); }
::-webkit-scrollbar-thumb { background:var(--saffron); border-radius:4px; }

/* ── HERO ── */
.ct-hero {
  position:relative; overflow:hidden;
  background:linear-gradient(140deg,#1a0800 0%,#2e1004 55%,#1a0800 100%);
  padding:44px 64px 52px;
}
.ct-hero-orb { position:absolute; border-radius:50%; pointer-events:none; }
.ct-hero-inner {
  max-width:1100px; margin:0 auto; position:relative; z-index:1;
  display:flex; align-items:center; justify-content:space-between; gap:24px;
  flex-wrap:wrap;
}
.ct-hero-label {
  display:inline-flex; align-items:center; gap:8px;
  background:rgba(240,144,16,0.18); border:1px solid rgba(240,144,16,0.32);
  border-radius:100px; padding:6px 20px; margin-bottom:18px;
  font-family:var(--font-b); font-size:11px; font-weight:800;
  color:#ffe0a0; letter-spacing:0.14em; text-transform:uppercase;
}
.ct-hero h1 {
  font-family:var(--font-d); font-style:italic;
  font-size:clamp(2.4rem,5vw,4rem); font-weight:900;
  color:#fff; line-height:1.0; letter-spacing:-0.02em;
  text-shadow:0 4px 40px rgba(0,0,0,0.5);
}
.ct-hero h1 em {
  font-style:italic;
  background:linear-gradient(135deg,#f09010,#ff8c42);
  -webkit-background-clip:text; -webkit-text-fill-color:transparent;
}
.ct-hero-back {
  display:inline-flex; align-items:center; gap:9px;
  padding:11px 22px; border-radius:13px;
  border:1.5px solid rgba(255,255,255,0.15);
  background:rgba(255,255,255,0.08);
  font-family:var(--font-b); font-size:14px; font-weight:700;
  color:rgba(255,255,255,0.82); cursor:pointer;
  transition:all 0.18s; flex-shrink:0;
  backdrop-filter:blur(8px);
}
.ct-hero-back:hover { background:rgba(255,255,255,0.15); color:#fff; border-color:rgba(255,255,255,0.3); }

/* ── PROMO STRIP ── */
.ct-strip {
  background:var(--grad); padding:11px 64px;
  display:flex; align-items:center; gap:40px; overflow-x:auto;
  scrollbar-width:none;
}
.ct-strip::-webkit-scrollbar { display:none; }
.ct-strip-item { display:flex; align-items:center; gap:10px; flex-shrink:0; }
.ct-strip-item strong { font-family:var(--font-b); font-size:12px; font-weight:800; color:#fff; letter-spacing:0.08em; }
.ct-strip-div { width:1px; height:14px; background:rgba(255,255,255,0.28); }
.ct-strip-item span { font-family:var(--font-b); font-size:12px; color:rgba(255,255,255,0.78); }

/* ── PAGE BODY ── */
.ct-body {
  max-width:1100px; margin:0 auto;
  padding:40px 64px 100px;
  display:grid;
  grid-template-columns:1fr 360px;
  gap:28px; align-items:start;
}

/* ── SECTION HEADING ── */
.ct-sec-eyebrow {
  font-family:var(--font-b); font-size:11px; font-weight:800;
  color:var(--red); letter-spacing:0.20em; text-transform:uppercase; margin-bottom:6px;
}
.ct-sec-title {
  font-family:var(--font-d); font-style:italic;
  font-size:clamp(1.8rem,3vw,2.6rem); font-weight:900;
  color:var(--ink); letter-spacing:-0.015em; line-height:1.05; margin-bottom:10px;
}
.ct-sec-rule {
  display:flex; gap:4px; align-items:center; margin-bottom:24px;
}
.ct-sec-rule div:nth-child(1) { height:3px; width:52px; border-radius:100px; background:var(--grad); }
.ct-sec-rule div:nth-child(2) { height:3px; width:18px; border-radius:100px; background:rgba(232,67,28,0.2); }
.ct-sec-rule div:nth-child(3) { height:3px; width:8px;  border-radius:100px; background:rgba(232,67,28,0.1); }

/* ── RESTAURANT GROUP CARD ── */
.ct-rest-card {
  background:var(--card); border-radius:22px;
  border:1px solid var(--border);
  box-shadow:0 2px 16px rgba(232,67,28,0.06);
  overflow:hidden; margin-bottom:20px;
  animation:fadeUp 0.45s ease both;
}
.ct-rest-card:last-child { margin-bottom:0; }
.ct-rest-card-accent { height:4px; background:var(--grad); width:100%; }

/* restaurant header */
.ct-rest-head {
  display:flex; align-items:center; justify-content:space-between;
  padding:18px 24px 16px;
  border-bottom:1px solid var(--border);
}
.ct-rest-name {
  font-family:var(--font-d); font-size:20px; font-weight:700;
  color:var(--ink); margin-bottom:3px;
}
.ct-rest-city {
  display:flex; align-items:center; gap:5px;
  font-family:var(--font-b); font-size:12px; font-weight:600; color:var(--ink-mt);
}
.ct-add-more {
  display:inline-flex; align-items:center; gap:7px;
  padding:8px 18px; border-radius:100px;
  border:1.5px solid var(--border); background:var(--pill);
  font-family:var(--font-b); font-size:12px; font-weight:800;
  color:var(--red); cursor:pointer; flex-shrink:0;
  transition:all 0.18s;
}
.ct-add-more:hover { background:var(--grad); color:#fff; border-color:var(--red); box-shadow:0 4px 14px var(--glow); }

/* ── MENU ITEM ROW ── */
.ct-item {
  display:flex; align-items:center; gap:16px;
  padding:16px 24px; border-bottom:1px solid var(--border);
  transition:background 0.18s;
}
.ct-item:last-child { border-bottom:none; }
.ct-item:hover { background:rgba(232,67,28,0.02); }
.ct-item-img {
  width:72px; height:72px; border-radius:14px;
  object-fit:cover; flex-shrink:0;
  background:#ffe8d4; border:1px solid var(--border);
}
.ct-item-info { flex:1; min-width:0; }
.ct-item-name {
  font-family:var(--font-d); font-size:17px; font-weight:700;
  color:var(--ink); margin-bottom:5px; line-height:1.25;
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
}
.ct-item-price {
  font-family:var(--font-d); font-size:15px; font-weight:900;
  color:var(--ink-md);
}
.ct-item-right { display:flex; align-items:center; gap:16px; flex-shrink:0; }
.ct-qty-wrap {
  display:flex; align-items:center; gap:0;
  border:2px solid var(--red); border-radius:12px; overflow:hidden;
}
.ct-qty-btn {
  width:36px; height:36px; border:none;
  background:var(--grad); color:#fff; cursor:pointer;
  display:flex; align-items:center; justify-content:center;
  transition:filter 0.15s;
}
.ct-qty-btn:hover { filter:brightness(1.12); }
.ct-qty-num {
  width:36px; text-align:center;
  font-family:var(--font-d); font-weight:900; font-size:18px; color:var(--red);
}
.ct-item-total {
  font-family:var(--font-d); font-weight:900; font-size:17px;
  color:var(--ink); min-width:64px; text-align:right;
}
.ct-del-btn {
  width:36px; height:36px; border-radius:11px;
  border:1.5px solid rgba(239,68,68,0.25);
  background:rgba(239,68,68,0.06); color:#dc2626;
  cursor:pointer; display:flex; align-items:center; justify-content:center;
  transition:all 0.15s;
}
.ct-del-btn:hover { background:#ef4444; color:#fff; border-color:#ef4444; }

/* subtotal row inside card */
.ct-subtotal {
  display:flex; justify-content:space-between; align-items:center;
  padding:13px 24px;
  background:var(--pill); border-top:1px solid var(--border);
}
.ct-subtotal-lbl { font-family:var(--font-b); font-size:13px; font-weight:700; color:var(--ink-mt); }
.ct-subtotal-val { font-family:var(--font-d); font-size:18px; font-weight:900; color:var(--ink); }

/* ── ORDER SUMMARY CARD ── */
.ct-summary {
  background:var(--card); border-radius:22px;
  border:1px solid var(--border);
  box-shadow:0 2px 16px rgba(232,67,28,0.06);
  overflow:hidden; position:sticky; top:88px;
  animation:fadeUp 0.45s ease both;
}
.ct-summary-accent { height:4px; background:var(--grad); }
.ct-summary-body { padding:24px 26px 28px; }
.ct-summary-title {
  font-family:var(--font-d); font-style:italic;
  font-size:22px; font-weight:900; color:var(--ink); margin-bottom:22px;
}

.ct-sum-row {
  display:flex; justify-content:space-between; align-items:center;
  padding:10px 0;
}
.ct-sum-row + .ct-sum-row { border-top:1px solid var(--border); }
.ct-sum-lbl { font-family:var(--font-b); font-size:14px; font-weight:600; color:var(--ink-md); }
.ct-sum-val { font-family:var(--font-b); font-size:14px; font-weight:700; color:var(--ink); }

.ct-sum-total-row {
  display:flex; justify-content:space-between; align-items:center;
  padding:16px 0 0; margin-top:6px;
  border-top:2px dashed var(--border);
}
.ct-sum-total-lbl { font-family:var(--font-d); font-size:18px; font-weight:700; color:var(--ink); }
.ct-sum-total-val { font-family:var(--font-d); font-size:26px; font-weight:900; color:var(--red); }

.ct-checkout-btn {
  width:100%; padding:16px; border-radius:16px; border:none;
  background:var(--grad); color:#fff;
  font-family:var(--font-b); font-size:16px; font-weight:800;
  cursor:pointer; display:flex; align-items:center;
  justify-content:center; gap:9px; letter-spacing:0.04em;
  box-shadow:0 8px 28px var(--glow); margin-top:20px;
  transition:filter 0.15s, transform 0.15s;
}
.ct-checkout-btn:hover { filter:brightness(1.1); transform:translateY(-2px); }

.ct-clear-btn {
  width:100%; padding:12px; border-radius:13px; margin-top:10px;
  border:1.5px solid rgba(239,68,68,0.25);
  background:rgba(239,68,68,0.05); color:#dc2626;
  font-family:var(--font-b); font-size:13px; font-weight:800;
  cursor:pointer; display:flex; align-items:center;
  justify-content:center; gap:7px; transition:all 0.15s;
}
.ct-clear-btn:hover { background:#ef4444; color:#fff; border-color:#ef4444; }

/* ── EMPTY STATE ── */
.ct-empty-wrap {
  max-width:560px; margin:80px auto; padding:0 24px; text-align:center;
}
.ct-empty-icon {
  width:90px; height:90px; border-radius:28px; margin:0 auto 24px;
  background:var(--pill); border:1.5px solid var(--border);
  display:flex; align-items:center; justify-content:center;
}
.ct-empty-title {
  font-family:var(--font-d); font-style:italic;
  font-size:2.2rem; font-weight:900; color:var(--ink);
  margin-bottom:10px; letter-spacing:-0.01em;
}
.ct-empty-sub {
  font-family:var(--font-b); font-size:15px; font-weight:400;
  color:var(--ink-mt); margin-bottom:28px; line-height:1.7;
}
.ct-browse-btn {
  display:inline-flex; align-items:center; gap:9px;
  padding:15px 32px; border-radius:15px; border:none;
  background:var(--grad); color:#fff;
  font-family:var(--font-b); font-size:15px; font-weight:800;
  cursor:pointer; letter-spacing:0.04em;
  box-shadow:0 8px 28px var(--glow);
  transition:filter 0.15s, transform 0.15s;
}
.ct-browse-btn:hover { filter:brightness(1.1); transform:translateY(-2px); }
.ct-back-link {
  display:inline-flex; align-items:center; gap:8px;
  font-family:var(--font-b); font-size:14px; font-weight:700;
  color:var(--ink-mt); cursor:pointer; margin-bottom:24px;
  transition:color 0.15s;
}
.ct-back-link:hover { color:var(--red); }

/* ── DELIVERY BADGE ── */
.ct-delivery-badge {
  display:flex; align-items:center; gap:10px;
  padding:12px 16px; border-radius:13px;
  background:rgba(22,163,74,0.07); border:1px solid rgba(22,163,74,0.2);
  margin-bottom:16px;
}
.ct-delivery-badge span { font-family:var(--font-b); font-size:12px; font-weight:700; color:#15803d; }

/* responsive */
@media(max-width:900px) {
  .ct-body { grid-template-columns:1fr; padding:28px 24px 80px; }
  .ct-summary { position:static; }
  .ct-hero { padding:36px 24px 44px; }
  .ct-strip { padding:11px 24px; }
}
@media(max-width:580px) {
  .ct-item { flex-wrap:wrap; gap:12px; }
  .ct-item-right { width:100%; justify-content:flex-end; }
  .ct-body { padding:20px 14px 80px; }
  .ct-hero { padding:28px 16px 36px; }
}
`;

/* ─── Component ──────────────────────────────────────────── */
const Cart = () => {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart();
  const [restaurants, setRestaurants] = useState({});

  useEffect(() => { loadRestaurants(); }, []);

  const loadRestaurants = async () => {
    try {
      const res = await axiosInstance.get("/Restaurant");
      const map = {};
      res.data.forEach(r => { map[r.restaurantID] = r; });
      setRestaurants(map);
    } catch (e) { console.error(e); }
  };

  const handleClearCart = () => {
    if (window.confirm("Clear your cart?")) clearCart();
  };

  const DELIVERY   = 25;
  const getTotal   = () => getTotalPrice() + DELIVERY;

  const groupedCart = cart.reduce((acc, item) => {
    const id = item.restaurantID;
    if (!acc[id]) acc[id] = [];
    acc[id].push(item);
    return acc;
  }, {});

  /* ── EMPTY STATE ── */
  if (cart.length === 0) return (
    <>
      <style>{CSS}</style>
      <div className="ct-empty-wrap">
        <button className="ct-back-link" onClick={() => navigate("/customer/all-items")}>
          <ArrowLeft size={17}/> Continue Shopping
        </button>
        <div className="ct-empty-icon">
          <ShoppingCart size={40} style={{ color:"var(--red)" }}/>
        </div>
        <h2 className="ct-empty-title">Your cart is empty</h2>
        <p className="ct-empty-sub">Looks like you haven't added anything yet.<br/>Explore our menu and find something delicious!</p>
        <button className="ct-browse-btn" onClick={() => navigate("/customer/all-items")}>
          <ShoppingCart size={17}/> Browse Menu
        </button>
      </div>
    </>
  );

  return (
    <>
      <style>{CSS}</style>

      {/* ══ HERO ══════════════════════════════════════════ */}
      <div className="ct-hero">
        <div className="ct-hero-orb" style={{ width:460,height:460,top:-200,right:-60,background:"radial-gradient(circle,rgba(232,67,28,0.10) 0%,transparent 70%)" }}/>
        <div className="ct-hero-orb" style={{ width:280,height:280,bottom:-120,left:80,background:"radial-gradient(circle,rgba(240,144,16,0.08) 0%,transparent 70%)" }}/>
        <div className="ct-hero-inner">
          <div>
            <div className="ct-hero-label">🛒 Your Order</div>
            <h1>Your <em>Cart</em></h1>
          </div>
          <button className="ct-hero-back" onClick={() => navigate("/customer/all-items")}>
            <ArrowLeft size={17}/> Continue Shopping
          </button>
        </div>
      </div>

      {/* ══ PROMO STRIP ═══════════════════════════════════ */}
      {/* <div className="ct-strip">
        {[["🚀 FREE DELIVERY","On orders above ₹299"],["🛡 SAFE CHECKOUT","100% secure payment"],["⏱ FAST DELIVERY","25–40 min to your door"]].map(([t,d])=>(
          <div key={t} className="ct-strip-item">
            <strong>{t}</strong>
            <div className="ct-strip-div"/>
            <span>{d}</span>
          </div>
        ))}
      </div> */}

      {/* ══ BODY ══════════════════════════════════════════ */}
      <div className="ct-body">

        {/* ── LEFT — cart items ── */}
        <div>
          <p className="ct-sec-eyebrow">🛍️ Items</p>
          <h2 className="ct-sec-title">
            {cart.length} Item{cart.length !== 1 ? "s" : ""} in Cart
          </h2>
          <div className="ct-sec-rule"><div/><div/><div/></div>

          {Object.entries(groupedCart).map(([restID, items], gi) => {
            const rest     = restaurants[restID];
            const restName = rest?.name || items[0]?.restaurantName || "Restaurant";
            const subtotal = items.reduce((s,i) => s + i.menuItemPrice * i.quantity, 0);

            return (
              <div key={restID} className="ct-rest-card" style={{ animationDelay:`${gi * 0.08}s` }}>
                <div className="ct-rest-card-accent"/>

                {/* restaurant header */}
                <div className="ct-rest-head">
                  <div>
                    <div className="ct-rest-name">{restName}</div>
                    {rest?.city && (
                      <div className="ct-rest-city">
                        <MapPin size={12}/> {rest.city}
                      </div>
                    )}
                  </div>
                  <button className="ct-add-more" onClick={() => navigate("/customer/all-items")}>
                    <Plus size={13}/> Add More
                  </button>
                </div>

                {/* items */}
                {items.map((item, ii) => (
                  <div key={item.menuItemID} className="ct-item" style={{ animationDelay:`${gi * 0.08 + ii * 0.05}s` }}>
                    <img
                      className="ct-item-img"
                      src={item.imageUrl || item.menuItemImage || `https://source.unsplash.com/200x200/?food,${encodeURIComponent(item.menuItemName)}`}
                      alt={item.menuItemName}
                      onError={e => { e.target.src = `https://source.unsplash.com/200x200/?food,${encodeURIComponent(item.menuItemName)}`; }}
                    />
                    <div className="ct-item-info">
                      <div className="ct-item-name">{item.menuItemName}</div>
                      <div className="ct-item-price">₹{item.menuItemPrice} each</div>
                    </div>
                    <div className="ct-item-right">
                      <div className="ct-qty-wrap">
                        <button className="ct-qty-btn" onClick={() => updateQuantity(item.menuItemID, item.quantity - 1)}>
                          <Minus size={15}/>
                        </button>
                        <span className="ct-qty-num">{item.quantity}</span>
                        <button className="ct-qty-btn" onClick={() => updateQuantity(item.menuItemID, item.quantity + 1)}>
                          <Plus size={15}/>
                        </button>
                      </div>
                      <span className="ct-item-total">₹{(item.menuItemPrice * item.quantity).toFixed(0)}</span>
                      <button className="ct-del-btn" onClick={() => removeFromCart(item.menuItemID)}>
                        <Trash2 size={15}/>
                      </button>
                    </div>
                  </div>
                ))}

                {/* subtotal */}
                <div className="ct-subtotal">
                  <span className="ct-subtotal-lbl">Restaurant Subtotal</span>
                  <span className="ct-subtotal-val">₹{subtotal.toFixed(0)}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── RIGHT — order summary ── */}
        <div>
          <div className="ct-summary">
            <div className="ct-summary-accent"/>
            <div className="ct-summary-body">
              <div className="ct-summary-title">Order Summary</div>

              {/* delivery info badge */}
              {/* <div className="ct-delivery-badge">
                <span style={{ fontSize:18 }}>🚀</span>
                <span>Free delivery on orders above ₹299</span>
              </div> */}

              <div>
                <div className="ct-sum-row">
                  <span className="ct-sum-lbl">Subtotal ({cart.length} items)</span>
                  <span className="ct-sum-val">₹{getTotalPrice().toFixed(0)}</span>
                </div>
                <div className="ct-sum-row">
                  <span className="ct-sum-lbl">Delivery Fee</span>
                  <span className="ct-sum-val">₹{DELIVERY}</span>
                </div>
                <div className="ct-sum-row">
                  <span className="ct-sum-lbl">Taxes & Charges</span>
                  <span className="ct-sum-val" style={{ color:"var(--green)", fontWeight:800 }}>Included</span>
                </div>
              </div>

              <div className="ct-sum-total-row">
                <span className="ct-sum-total-lbl">Grand Total</span>
                <span className="ct-sum-total-val">₹{getTotal().toFixed(0)}</span>
              </div>

              <button className="ct-checkout-btn" onClick={() => navigate("/customer/checkout")}>
                <ShoppingCart size={18}/> Proceed to Checkout
              </button>

              <button className="ct-clear-btn" onClick={handleClearCart}>
                <Trash2 size={14}/> Clear Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cart;