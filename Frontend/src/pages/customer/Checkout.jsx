// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   ArrowLeft,
//   MapPin,
//   Phone,
//   CreditCard,
//   CheckCircle,
//   AlertCircle,
//   Loader2,
// } from "lucide-react";
// import { useCart } from "../../contexts/CartContext";
// import { createOrder } from "../../api/orderApi";
// import axiosInstance from "../../api/axiosInstance";
// import { useAuth } from "../../contexts/AuthContext";

// const Checkout = () => {
//   const navigate = useNavigate();
//   const { cart, getTotalPrice, clearCart } = useCart();
//   const { isAuthenticated, hasRole } = useAuth();
//   const [form, setForm] = useState({
//     deliveryAddress: "",
//     phone: "",
//     paymentMode: "Cash",
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState(false);
//   const [orderProgress, setOrderProgress] = useState([]);

//   useEffect(() => {
//     if (cart.length === 0) {
//       navigate("/customer/cart");
//     }
//   }, [cart, navigate]);

//   useEffect(() => {
//     if (!isAuthenticated() || !hasRole("Customer")) {
//       navigate("/login");
//     }
//   }, [isAuthenticated, hasRole, navigate]);

//   const getDeliveryCharge = () => 40;

//   const getTotal = () => getTotalPrice() + getDeliveryCharge();

//   const handlePlaceOrder = async () => {
//     if (!form.deliveryAddress.trim()) {
//       setError("Please enter your delivery address");
//       return;
//     }

//     if (!form.phone.trim()) {
//       setError("Please enter your phone number");
//       return;
//     }

//     if (!cart || cart.length === 0) {
//       setError("Your cart is empty");
//       return;
//     }

//     setLoading(true);
//     setError("");
//     setSuccess(false);

//     try {
//       if (!isAuthenticated() || !hasRole("Customer")) {
//         throw new Error("Please login to place an order");
//       }

//       const userId = localStorage.getItem("customerId") || localStorage.getItem("userId");
//       if (!userId) {
//         throw new Error("Please login again to place order");
//       }

//       const parsedUserId = parseInt(userId);
//       if (isNaN(parsedUserId) || parsedUserId <= 0) {
//         throw new Error("Invalid user ID. Please login again");
//       }

//       // Group items by restaurant
//       const groupedByRestaurant = cart.reduce((acc, item) => {
//         const rid = item.restaurantID;
//         if (!acc[rid]) {
//           acc[rid] = [];
//         }
//         acc[rid].push(item);
//         return acc;
//       }, {});

//       console.log("Grouped cart by restaurant:", groupedByRestaurant);

//       // Validate all items have required fields
//       for (const items of Object.values(groupedByRestaurant)) {
//         for (const item of items) {
//           if (!item.menuItemID || !item.quantity || !item.restaurantID) {
//             throw new Error("Invalid cart item. Please refresh and try again");
//           }
//         }
//       }

//       // Initialize progress
//       const totalOrders = Object.keys(groupedByRestaurant).length;
//       setOrderProgress(Array(totalOrders).fill({ status: 'pending', message: 'Preparing order...' }));

//       // Create orders for each restaurant
//       const orderPromises = Object.entries(groupedByRestaurant).map(
//         async ([restaurantID, items], index) => {
//           setOrderProgress(prev => {
//             const newProgress = [...prev];
//             newProgress[index] = { status: 'processing', message: `Processing order for ${items[0]?.restaurantName || 'Restaurant'}...` };
//             return newProgress;
//           });

//           const parsedRestaurantID = parseInt(restaurantID);

//           if (isNaN(parsedRestaurantID) || parsedRestaurantID <= 0) {
//             setOrderProgress(prev => {
//               const newProgress = [...prev];
//               newProgress[index] = { status: 'error', message: `Invalid restaurant ID: ${restaurantID}` };
//               return newProgress;
//             });
//             throw new Error(`Invalid restaurant ID: ${restaurantID}`);
//           }

//           const validatedItems = items.map((item) => ({
//             MenuItemID: parseInt(item.menuItemID),
//             Quantity: parseInt(item.quantity),
//           }));

//           // Validate items
//           for (const item of validatedItems) {
//             if (isNaN(item.MenuItemID) || item.MenuItemID <= 0) {
//               setOrderProgress(prev => {
//                 const newProgress = [...prev];
//                 newProgress[index] = { status: 'error', message: `Invalid menu item ID: ${item.MenuItemID}` };
//                 return newProgress;
//               });
//               throw new Error(`Invalid menu item ID: ${item.MenuItemID}`);
//             }
//             if (isNaN(item.Quantity) || item.Quantity <= 0) {
//               setOrderProgress(prev => {
//                 const newProgress = [...prev];
//                 newProgress[index] = { status: 'error', message: `Invalid quantity for menu item ${item.MenuItemID}` };
//                 return newProgress;
//               });
//               throw new Error(`Invalid quantity for menu item ${item.MenuItemID}`);
//             }
//           }

//           const payload = {
//     RestaurantID: parsedRestaurantID,
//     Items: validatedItems,
//     DeliveryAddress: form.deliveryAddress,  // ← ADD
//     Phone: form.phone,                       // ← ADD
// };

//           console.log(`Creating order for restaurant ${parsedRestaurantID}:`, payload);
//           console.log("Payload being sent:", payload);

//           try {
//             const result = await createOrder(payload);

//             if (!result.success) {
//               setOrderProgress(prev => {
//                 const newProgress = [...prev];
//                 newProgress[index] = { status: 'error', message: result.error || `Failed to create order for ${items[0]?.restaurantName || 'Restaurant'}` };
//                 return newProgress;
//               });
//               throw new Error(result.error || `Failed to create order for restaurant ${parsedRestaurantID}`);
//             }

//             setOrderProgress(prev => {
//               const newProgress = [...prev];
//               newProgress[index] = { status: 'success', message: `Order placed successfully for ${items[0]?.restaurantName || 'Restaurant'}` };
//               return newProgress;
//             });

//             return {
//               restaurantId: parsedRestaurantID,
//               orderData: result.data,
//               items: items
//             };
//           } catch (apiError) {
//             setOrderProgress(prev => {
//               const newProgress = [...prev];
//               newProgress[index] = { status: 'error', message: `Failed to place order for ${items[0]?.restaurantName || 'Restaurant'}: ${apiError.message}` };
//               return newProgress;
//             });
//             throw apiError;
//           }
//         }
//       );

//       const orders = await Promise.all(orderPromises);

//       console.log("All orders created successfully:", orders);

//       // Show success message
//       setSuccess(true);

//       // Clear cart only after successful order creation
//       console.log("Clearing cart after successful order placement");
//       clearCart();

//       // Navigate to orders page after 3 seconds
//       setTimeout(() => {
//         navigate("/customer/orders?success=true");
//       }, 3000);
//     } catch (error) {
//       console.error("Order placement error:", error);
//       setError(error.message || "Failed to place order. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//       <button
//         onClick={() => navigate("/customer/cart")}
//         className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-semibold transition"
//       >
//         <ArrowLeft size={20} />
//         Back to Cart
//       </button>

//       <h1 className="text-4xl font-black text-gray-900 mb-8">Checkout</h1>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//         {/* Form Section */}
//         <div className="lg:col-span-2 space-y-6">
//           {/* Delivery Address */}
//           <div className="bg-white rounded-2xl shadow-xl p-6">
//             <div className="flex items-center gap-3 mb-4">
//               <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
//                 <MapPin className="text-orange-600" size={24} />
//               </div>
//               <h2 className="text-2xl font-black text-gray-900">Delivery Address</h2>
//             </div>
//             <textarea
//               value={form.deliveryAddress}
//               onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })}
//               placeholder="Enter your complete delivery address"
//               rows={4}
//               className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
//               required
//             />
//           </div>

//           {/* Contact Info */}
//           <div className="bg-white rounded-2xl shadow-xl p-6">
//             <div className="flex items-center gap-3 mb-4">
//               <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
//                 <Phone className="text-blue-600" size={24} />
//               </div>
//               <h2 className="text-2xl font-black text-gray-900">Contact Number</h2>
//             </div>
//             <input
//               type="tel"
//               value={form.phone}
//               onChange={(e) => setForm({ ...form, phone: e.target.value })}
//               placeholder="Enter your phone number"
//               className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
//               required
//             />
//           </div>

//           {/* Payment Method */}
//           <div className="bg-white rounded-2xl shadow-xl p-6">
//             <div className="flex items-center gap-3 mb-4">
//               <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
//                 <CreditCard className="text-green-600" size={24} />
//               </div>
//               <h2 className="text-2xl font-black text-gray-900">Payment Method</h2>
//             </div>
//             <div className="space-y-3">
//               {["Cash", "Card", "UPI"].map((method) => (
//                 <label
//                   key={method}
//                   className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition ${
//                     form.paymentMode === method
//                       ? "border-orange-500 bg-orange-50"
//                       : "border-gray-200 hover:border-gray-300"
//                   }`}
//                 >
//                   <input
//                     type="radio"
//                     name="paymentMode"
//                     value={method}
//                     checked={form.paymentMode === method}
//                     onChange={(e) => setForm({ ...form, paymentMode: e.target.value })}
//                     className="w-5 h-5 text-orange-500"
//                   />
//                   <span className="font-semibold text-gray-900">{method}</span>
//                 </label>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* Order Summary */}
//         <div className="lg:col-span-1">
//           <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-24">
//             <h2 className="text-2xl font-black text-gray-900 mb-4">Order Summary</h2>
//             <div className="space-y-3 mb-6">
//               {cart.slice(0, 3).map((item) => (
//                 <div key={item.menuItemID} className="flex justify-between text-sm">
//                   <span className="text-gray-600">
//                     {item.menuItemName} x{item.quantity}
//                   </span>
//                   <span className="font-semibold">
//                     ₹{(item.menuItemPrice * item.quantity).toFixed(2)}
//                   </span>
//                 </div>
//               ))}
//               {cart.length > 3 && (
//                 <p className="text-sm text-gray-500">+{cart.length - 3} more items</p>
//               )}
//               <div className="pt-3 border-t space-y-2">
//                 <div className="flex justify-between text-gray-600">
//                   <span>Subtotal</span>
//                   <span className="font-semibold">₹{getTotalPrice().toFixed(2)}</span>
//                 </div>
//                 <div className="flex justify-between text-gray-600">
//                   <span>Delivery</span>
//                   <span className="font-semibold">₹{getDeliveryCharge().toFixed(2)}</span>
//                 </div>
//                 <div className="pt-3 border-t flex justify-between text-xl font-black text-gray-900">
//                   <span>Total</span>
//                   <span>₹{getTotal().toFixed(2)}</span>
//                 </div>
//               </div>
//             </div>

//             {error && (
//               <div className="bg-red-100 text-red-700 p-4 rounded-xl mb-4 flex items-center gap-2">
//                 <AlertCircle size={18} />
//                 <span className="text-sm font-semibold">{error}</span>
//               </div>
//             )}

//             {success && (
//               <div className="bg-green-100 text-green-700 p-4 rounded-xl mb-4 flex items-center gap-2">
//                 <CheckCircle size={18} />
//                 <span className="text-sm font-semibold">Order placed successfully! Redirecting to orders page...</span>
//               </div>
//             )}

//             {loading && orderProgress.length > 0 && (
//               <div className="bg-blue-50 p-4 rounded-xl mb-4">
//                 <h3 className="text-sm font-semibold text-blue-900 mb-3">Order Progress</h3>
//                 <div className="space-y-2">
//                   {orderProgress.map((progress, index) => (
//                     <div key={index} className="flex items-center gap-2 text-sm">
//                       {progress.status === 'pending' && <Loader2 size={14} className="animate-spin text-gray-400" />}
//                       {progress.status === 'processing' && <Loader2 size={14} className="animate-spin text-blue-500" />}
//                       {progress.status === 'success' && <CheckCircle size={14} className="text-green-500" />}
//                       {progress.status === 'error' && <AlertCircle size={14} className="text-red-500" />}
//                       <span className={`${
//                         progress.status === 'error' ? 'text-red-700' :
//                         progress.status === 'success' ? 'text-green-700' :
//                         'text-gray-600'
//                       }`}>
//                         {progress.message}
//                       </span>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             <button
//               onClick={handlePlaceOrder}
//               disabled={loading || !form.deliveryAddress.trim() || !form.phone.trim() || success}
//               className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-4 rounded-xl font-black text-lg hover:from-orange-600 hover:to-red-700 transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {loading ? (
//                 <div className="flex items-center justify-center gap-2">
//                   <Loader2 className="animate-spin" size={20} />
//                   Placing Order...
//                 </div>
//               ) : success ? (
//                 "Order Placed Successfully!"
//               ) : (
//                 `Place Order • ₹${getTotal().toFixed(2)}`
//               )}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Checkout;


import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, MapPin, Phone, CheckCircle, AlertCircle,
  Loader2, CreditCard, Smartphone, Banknote, Lock,
  ChevronRight, ShoppingBag, Sparkles, Eye, EyeOff,
} from "lucide-react";
import { useCart } from "../../contexts/CartContext";
import { createOrder } from "../../api/orderApi";
import { useAuth } from "../../contexts/AuthContext";

/* ══════════════════════════════════════════════════════
   STEP INDICATOR
══════════════════════════════════════════════════════ */
const steps = ["Delivery", "Payment", "Review"];

const StepBar = ({ current }) => (
  <div className="ck-steps">
    {steps.map((s, i) => (
      <div key={s} className="ck-step-wrap">
        <div className={`ck-step-dot ${i < current ? "ck-step-done" : i === current ? "ck-step-active" : ""}`}>
          {i < current ? <CheckCircle size={14}/> : <span>{i + 1}</span>}
        </div>
        <span className={`ck-step-lbl ${i === current ? "ck-step-lbl-active" : ""}`}>{s}</span>
        {i < steps.length - 1 && <div className={`ck-step-line ${i < current ? "ck-step-line-done" : ""}`}/>}
      </div>
    ))}
  </div>
);

/* ══════════════════════════════════════════════════════
   CREDIT CARD VISUAL (for Card payment)
══════════════════════════════════════════════════════ */
const CardVisual = ({ number, name, expiry, flipped }) => {
  const fmt = (n) => {
    const raw = (n || "").replace(/\D/g, "").slice(0, 16);
    return raw.padEnd(16, "•").match(/.{1,4}/g).join(" ");
  };
  return (
    <div className={`ck-card-3d ${flipped ? "ck-card-flipped" : ""}`}>
      <div className="ck-card-front">
        <div className="ck-card-shine"/>
        <div className="ck-card-logo">
          <div className="ck-chip"/>
          <svg width="36" height="28" viewBox="0 0 36 28" fill="none">
            <circle cx="14" cy="14" r="14" fill="rgba(255,255,255,.25)"/>
            <circle cx="22" cy="14" r="14" fill="rgba(255,255,255,.15)"/>
          </svg>
        </div>
        <div className="ck-card-number">{fmt(number)}</div>
        <div className="ck-card-bottom">
          <div>
            <div className="ck-card-field-lbl">Card Holder</div>
            <div className="ck-card-field-val">{name || "YOUR NAME"}</div>
          </div>
          <div>
            <div className="ck-card-field-lbl">Expires</div>
            <div className="ck-card-field-val">{expiry || "MM/YY"}</div>
          </div>
        </div>
      </div>
      <div className="ck-card-back">
        <div className="ck-card-stripe"/>
        <div className="ck-cvv-row">
          <span className="ck-card-field-lbl">CVV</span>
          <div className="ck-cvv-box">•••</div>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════
   UPI APPS
══════════════════════════════════════════════════════ */
const UPI_APPS = [
  { id:"gpay",   label:"Google Pay", color:"#4285F4", emoji:"G" },
  { id:"phonepe",label:"PhonePe",    color:"#5F259F", emoji:"P" },
  { id:"paytm",  label:"Paytm",      color:"#00BAF2", emoji:"₹" },
  { id:"bhim",   label:"BHIM",       color:"#FF6B35", emoji:"B" },
];

/* ══════════════════════════════════════════════════════
   ORDER ITEM ROW
══════════════════════════════════════════════════════ */
const OrderItem = ({ item }) => (
  <div className="ck-oi">
    <div className="ck-oi-img">
      {item.imageUrl
        ? <img src={item.imageUrl} alt={item.menuItemName}/>
        : <span>{(item.menuItemName||"?").charAt(0)}</span>}
    </div>
    <div className="ck-oi-info">
      <p className="ck-oi-name">{item.menuItemName}</p>
      <p className="ck-oi-rest">{item.restaurantName || ""}</p>
    </div>
    <div className="ck-oi-right">
      <span className="ck-oi-qty">×{item.quantity}</span>
      <span className="ck-oi-price">₹{(item.menuItemPrice * item.quantity).toFixed(0)}</span>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════
   SUCCESS OVERLAY
══════════════════════════════════════════════════════ */
const SuccessOverlay = ({ onNavigate }) => {
  useEffect(() => { const t = setTimeout(onNavigate, 3200); return () => clearTimeout(t); }, []);
  return (
    <div className="ck-success-overlay">
      <div className="ck-success-box">
        <div className="ck-success-ring">
          <CheckCircle size={52} className="ck-success-icon"/>
        </div>
        <h2 className="ck-success-title">Order Confirmed!</h2>
        <p className="ck-success-sub">Your food is being prepared. Redirecting to orders…</p>
        <div className="ck-success-bar"><div className="ck-success-fill"/></div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════
   MAIN CHECKOUT
══════════════════════════════════════════════════════ */
const Checkout = () => {
  const navigate   = useNavigate();
  const { cart, getTotalPrice, clearCart } = useCart();
  const { isAuthenticated, hasRole }       = useAuth();

  const [step,    setStep]    = useState(0);   // 0=delivery 1=payment 2=review
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState(false);

  /* ─ Delivery form ─ */
  const [addr,  setAddr]  = useState("");
  const [phone, setPhone] = useState("");

  /* ─ Payment ─ */
  const [payMode,   setPayMode]   = useState(""); // "Cash"|"Card"|"UPI"
  const [upiApp,    setUpiApp]    = useState("");
  const [upiId,     setUpiId]     = useState("");
  const [cardNum,   setCardNum]   = useState("");
  const [cardName,  setCardName]  = useState("");
  const [cardExp,   setCardExp]   = useState("");
  const [cardCvv,   setCardCvv]   = useState("");
  const [showCvv,   setShowCvv]   = useState(false);
  const [cardFlip,  setCardFlip]  = useState(false);
  const [cardFocus, setCardFocus] = useState(null);

  const DELIVERY = 25;
  const subtotal = getTotalPrice();
  const total    = subtotal + DELIVERY;

  useEffect(() => {
    if (!isAuthenticated() || !hasRole("Customer")) navigate("/login");
    if (cart.length === 0) navigate("/customer/cart");
  }, []);

  /* ─ Step validation ─ */
  const canGoToPayment = addr.trim().length > 5 && phone.trim().length >= 10;
  const canGoToReview  = () => {
    if (payMode === "Cash") return true;
    if (payMode === "Card") return cardNum.replace(/\D/g,"").length === 16 && cardName && cardExp && cardCvv.length >= 3;
    if (payMode === "UPI")  return upiId.includes("@") || upiApp;
    return false;
  };

  /* ─ Format card number ─ */
  const fmtCard = v => v.replace(/\D/g,"").slice(0,16).replace(/(.{4})/g,"$1 ").trim();
  const fmtExp  = v => {
    const d = v.replace(/\D/g,"").slice(0,4);
    return d.length > 2 ? d.slice(0,2) + "/" + d.slice(2) : d;
  };

  /* ─ Place order ─ */
  const handlePlaceOrder = async () => {
  setLoading(true);
  setError("");

  try {
    if (!isAuthenticated() || !hasRole("Customer"))
      throw new Error("Please login to place an order");

    const userId = parseInt(
      localStorage.getItem("customerId") || localStorage.getItem("userId")
    );

    if (!userId || isNaN(userId))
      throw new Error("Please login again");

    // Group cart items by restaurant
    const grouped = cart.reduce((acc, item) => {
      const rid = item.restaurantID;
      if (!acc[rid]) acc[rid] = [];
      acc[rid].push(item);
      return acc;
    }, {});

    const orders = await Promise.all(
      Object.entries(grouped).map(async ([rid, items]) => {

        // Calculate subtotal for this restaurant
        const restaurantSubtotal = items.reduce(
          (sum, item) => sum + item.menuItemPrice * item.quantity,
          0
        );

        const restaurantTotal = restaurantSubtotal + DELIVERY;

        const payload = {
          RestaurantID: parseInt(rid),
          Items: items.map((i) => ({
            MenuItemID: parseInt(i.menuItemID),
            Quantity: parseInt(i.quantity),
          })),
          DeliveryAddress: addr,
          Phone: phone,
          DeliveryFee: DELIVERY,
          TotalAmount: restaurantTotal,
        };

        const result = await createOrder(payload);

        if (!result.success)
          throw new Error(result.error || "Order failed");

        return result;
      })
    );

    setSuccess(true);
    clearCart();

  } catch (e) {
    setError(e.message || "Failed to place order. Please try again.");
  } finally {
    setLoading(false);
  }
};

  if (success) return (
    <>
      <style>{CSS}</style>
      <SuccessOverlay onNavigate={() => navigate("/customer/orders?success=true")}/>
    </>
  );

  return (
    <>
      <style>{CSS}</style>
      <div className="ck-root">

        {/* ── Header ── */}
        <div className="ck-header">
          <button className="ck-back" onClick={() => step > 0 ? setStep(s => s-1) : navigate("/customer/cart")}>
            <ArrowLeft size={18}/> {step > 0 ? "Back" : "Cart"}
          </button>
          <h1 className="ck-title">Checkout</h1>
          <div style={{width:80}}/>
        </div>

        <StepBar current={step}/>

        <div className="ck-body">

          {/* ══════════ STEP 0 — DELIVERY ══════════ */}
          {step === 0 && (
            <div className="ck-panel ck-animate">
              <div className="ck-panel-head">
                <div className="ck-panel-icon" style={{background:"#fff7ed",color:"#f97316"}}>
                  <MapPin size={20}/>
                </div>
                <div>
                  <h2 className="ck-panel-title">Delivery Details</h2>
                  <p className="ck-panel-sub">Where should we deliver your order?</p>
                </div>
              </div>

              <div className="ck-field">
                <label className="ck-label">Delivery Address</label>
                <textarea
                  className="ck-textarea"
                  placeholder="House / flat no., Street, Area, City — be specific for faster delivery"
                  rows={3}
                  value={addr}
                  onChange={e => setAddr(e.target.value)}
                />
                {addr.length > 0 && addr.length < 6 && (
                  <p className="ck-field-hint ck-hint-err">Please enter a complete address</p>
                )}
              </div>

              <div className="ck-field">
                <label className="ck-label">
                  <Phone size={13}/> Mobile Number
                </label>
                <div className="ck-phone-wrap">
                  <span className="ck-phone-cc">🇮🇳 +91</span>
                  <input
                    className="ck-input ck-input-phone"
                    placeholder="10-digit mobile number"
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g,"").slice(0,10))}
                  />
                </div>
                {phone.length > 0 && phone.length < 10 && (
                  <p className="ck-field-hint ck-hint-err">{10 - phone.length} more digits needed</p>
                )}
                {phone.length === 10 && (
                  <p className="ck-field-hint ck-hint-ok"><CheckCircle size={11}/> Looks good</p>
                )}
              </div>

              <button
                className="ck-next-btn"
                disabled={!canGoToPayment}
                onClick={() => setStep(1)}
              >
                Continue to Payment <ChevronRight size={18}/>
              </button>
            </div>
          )}

          {/* ══════════ STEP 1 — PAYMENT ══════════ */}
          {step === 1 && (
            <div className="ck-panel ck-animate">
              <div className="ck-panel-head">
                <div className="ck-panel-icon" style={{background:"#f0fdf4",color:"#16a34a"}}>
                  <Lock size={20}/>
                </div>
                <div>
                  <h2 className="ck-panel-title">Payment Method</h2>
                  <p className="ck-panel-sub">All transactions are encrypted & secure</p>
                </div>
              </div>

              {/* Payment method selector */}
              <div className="ck-pay-methods">
                {[
                  { id:"UPI",  icon:<Smartphone size={22}/>, label:"UPI",         sub:"GPay, PhonePe, Paytm…", color:"#7c3aed" },
                  { id:"Card", icon:<CreditCard  size={22}/>, label:"Credit/Debit", sub:"Visa, Mastercard…",    color:"#0ea5e9" },
                  { id:"Cash", icon:<Banknote    size={22}/>, label:"Cash",         sub:"Pay on delivery",       color:"#16a34a" },
                ].map(m => (
                  <button
                    key={m.id}
                    className={`ck-pay-tile ${payMode === m.id ? "ck-pay-tile-active" : ""}`}
                    style={payMode === m.id ? { borderColor: m.color, background: m.color + "0d" } : {}}
                    onClick={() => { setPayMode(m.id); setError(""); }}
                  >
                    <span className="ck-pay-tile-icon" style={{ color: m.color, background: m.color + "18" }}>
                      {m.icon}
                    </span>
                    <span className="ck-pay-tile-label">{m.label}</span>
                    <span className="ck-pay-tile-sub">{m.sub}</span>
                    {payMode === m.id && (
                      <span className="ck-pay-tile-check" style={{ background: m.color }}>
                        <CheckCircle size={12}/>
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* ── UPI ── */}
              {payMode === "UPI" && (
                <div className="ck-pay-detail ck-animate">
                  <p className="ck-pay-section-lbl">Quick Pay</p>
                  <div className="ck-upi-apps">
                    {UPI_APPS.map(app => (
                      <button
                        key={app.id}
                        className={`ck-upi-app ${upiApp === app.id ? "ck-upi-app-active" : ""}`}
                        style={upiApp === app.id ? { borderColor: app.color, background: app.color + "18" } : {}}
                        onClick={() => setUpiApp(app.id)}
                      >
                        <span className="ck-upi-logo" style={{ background: app.color }}>{app.emoji}</span>
                        <span className="ck-upi-name">{app.label}</span>
                        {upiApp === app.id && <div className="ck-upi-tick" style={{background:app.color}}/>}
                      </button>
                    ))}
                  </div>
                  <div className="ck-upi-divider"><span>or enter UPI ID</span></div>
                  <div className="ck-field" style={{marginTop:0}}>
                    <input
                      className="ck-input"
                      placeholder="yourname@upi"
                      value={upiId}
                      onChange={e => setUpiId(e.target.value)}
                    />
                    {upiId && !upiId.includes("@") && (
                      <p className="ck-field-hint ck-hint-err">Enter a valid UPI ID (e.g. name@okaxis)</p>
                    )}
                    {upiId.includes("@") && (
                      <p className="ck-field-hint ck-hint-ok"><CheckCircle size={11}/> UPI ID looks valid</p>
                    )}
                  </div>
                </div>
              )}

              {/* ── CARD ── */}
              {payMode === "Card" && (
                <div className="ck-pay-detail ck-animate">
                  <CardVisual number={cardNum} name={cardName} expiry={cardExp} flipped={cardFlip}/>

                  <div className="ck-field" style={{marginTop:20}}>
                    <label className="ck-label">Card Number</label>
                    <input
                      className="ck-input ck-input-mono"
                      placeholder="1234 5678 9012 3456"
                      value={fmtCard(cardNum)}
                      onChange={e => setCardNum(e.target.value.replace(/\D/g,""))}
                      maxLength={19}
                      onFocus={() => { setCardFlip(false); setCardFocus("number"); }}
                    />
                  </div>
                  <div className="ck-field">
                    <label className="ck-label">Name on Card</label>
                    <input
                      className="ck-input"
                      placeholder="As printed on card"
                      value={cardName}
                      onChange={e => setCardName(e.target.value.toUpperCase())}
                      onFocus={() => { setCardFlip(false); setCardFocus("name"); }}
                    />
                  </div>
                  <div className="ck-field-row">
                    <div className="ck-field">
                      <label className="ck-label">Expiry</label>
                      <input
                        className="ck-input ck-input-mono"
                        placeholder="MM/YY"
                        value={fmtExp(cardExp)}
                        onChange={e => setCardExp(e.target.value.replace(/\D/g,""))}
                        maxLength={5}
                        onFocus={() => { setCardFlip(false); setCardFocus("expiry"); }}
                      />
                    </div>
                    <div className="ck-field">
                      <label className="ck-label">CVV</label>
                      <div className="ck-cvv-input-wrap">
                        <input
                          className="ck-input ck-input-mono"
                          placeholder="•••"
                          type={showCvv ? "text" : "password"}
                          value={cardCvv}
                          onChange={e => setCardCvv(e.target.value.replace(/\D/g,"").slice(0,4))}
                          maxLength={4}
                          onFocus={() => setCardFlip(true)}
                          onBlur={() => setCardFlip(false)}
                        />
                        <button className="ck-cvv-eye" onClick={() => setShowCvv(s => !s)} type="button">
                          {showCvv ? <EyeOff size={14}/> : <Eye size={14}/>}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="ck-secure-note">
                    <Lock size={11}/> 256-bit SSL encrypted. We never store your card details.
                  </div>
                </div>
              )}

              {/* ── CASH ── */}
              {payMode === "Cash" && (
                <div className="ck-pay-detail ck-animate">
                  <div className="ck-cash-info">
                    <Banknote size={32} style={{color:"#16a34a"}}/>
                    <div>
                      <p className="ck-cash-title">Pay on Delivery</p>
                      <p className="ck-cash-sub">Keep exact change of <strong>₹{total.toFixed(0)}</strong> ready for a smooth handover.</p>
                    </div>
                  </div>
                </div>
              )}

              <button
                className="ck-next-btn"
                disabled={!canGoToReview()}
                onClick={() => setStep(2)}
                style={!payMode ? {opacity:.5} : {}}
              >
                Review Order <ChevronRight size={18}/>
              </button>
            </div>
          )}

          {/* ══════════ STEP 2 — REVIEW ══════════ */}
          {step === 2 && (
            <div className="ck-panel ck-animate">
              <div className="ck-panel-head">
                <div className="ck-panel-icon" style={{background:"#fdf4ff",color:"#a855f7"}}>
                  <ShoppingBag size={20}/>
                </div>
                <div>
                  <h2 className="ck-panel-title">Review & Confirm</h2>
                  <p className="ck-panel-sub">Check everything before placing your order</p>
                </div>
              </div>

              {/* Summary cards */}
              <div className="ck-review-cards">
                <div className="ck-review-card" onClick={() => setStep(0)}>
                  <MapPin size={15} style={{color:"#f97316", flexShrink:0}}/>
                  <div style={{flex:1, minWidth:0}}>
                    <p className="ck-review-card-lbl">Delivering to</p>
                    <p className="ck-review-card-val">{addr}</p>
                    <p className="ck-review-card-val" style={{color:"#6b7280"}}>+91 {phone}</p>
                  </div>
                  <span className="ck-review-edit">Edit</span>
                </div>
                <div className="ck-review-card" onClick={() => setStep(1)}>
                  {payMode === "UPI"  && <Smartphone size={15} style={{color:"#7c3aed", flexShrink:0}}/>}
                  {payMode === "Card" && <CreditCard  size={15} style={{color:"#0ea5e9", flexShrink:0}}/>}
                  {payMode === "Cash" && <Banknote    size={15} style={{color:"#16a34a", flexShrink:0}}/>}
                  <div style={{flex:1}}>
                    <p className="ck-review-card-lbl">Payment</p>
                    <p className="ck-review-card-val">
                      {payMode === "UPI"  && (upiApp ? UPI_APPS.find(a=>a.id===upiApp)?.label : upiId)}
                      {payMode === "Card" && `•••• •••• •••• ${cardNum.slice(-4)}`}
                      {payMode === "Cash" && "Cash on Delivery"}
                    </p>
                  </div>
                  <span className="ck-review-edit">Edit</span>
                </div>
              </div>

              {/* Items */}
              <div className="ck-items-list">
                {cart.map(item => <OrderItem key={item.menuItemID} item={item}/>)}
              </div>

              {/* Bill */}
              <div className="ck-bill">
                <div className="ck-bill-row">
                  <span>Item total</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="ck-bill-row">
                  <span>Delivery fee</span>
                  <span>₹{DELIVERY.toFixed(2)}</span>
                </div>
                <div className="ck-bill-row">
                  <span>Taxes & charges</span>
                  <span className="ck-free">FREE</span>
                </div>
                <div className="ck-bill-total">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>

              {error && (
                <div className="ck-error-bar">
                  <AlertCircle size={15}/> {error}
                </div>
              )}

              <button
                className="ck-place-btn"
                onClick={handlePlaceOrder}
                disabled={loading}
              >
                {loading
                  ? <><Loader2 size={18} className="ck-spin"/> Placing order…</>
                  : <><Sparkles size={17}/> Place Order · ₹{total.toFixed(0)}</>}
              </button>
              <p className="ck-place-note">
                <Lock size={11}/> Secure checkout. By placing order you agree to our terms.
              </p>
            </div>
          )}

          {/* ── Sticky order summary (always visible on right) ── */}
          <div className="ck-sidebar">
            <div className="ck-sidebar-box">
              <h3 className="ck-sidebar-title">
                <ShoppingBag size={16}/> Your Order
                <span className="ck-sidebar-count">{cart.length} item{cart.length !== 1 ? "s" : ""}</span>
              </h3>
              <div className="ck-sidebar-items">
                {cart.map(item => (
                  <div key={item.menuItemID} className="ck-si">
                    <span className="ck-si-name">{item.menuItemName}</span>
                    <span className="ck-si-qty">×{item.quantity}</span>
                    <span className="ck-si-price">₹{(item.menuItemPrice * item.quantity).toFixed(0)}</span>
                  </div>
                ))}
              </div>
              <div className="ck-sidebar-bill">
                <div className="ck-sb-row"><span>Subtotal</span><span>₹{subtotal.toFixed(0)}</span></div>
                <div className="ck-sb-row"><span>Delivery</span><span>₹{DELIVERY}</span></div>
                <div className="ck-sb-total"><span>Total</span><span>₹{total.toFixed(0)}</span></div>
              </div>
              {step === 2 && (
                <button
                  className="ck-place-btn"
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  style={{marginTop:16}}
                >
                  {loading
                    ? <><Loader2 size={16} className="ck-spin"/> Placing…</>
                    : <>Place Order · ₹{total.toFixed(0)}</>}
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

/* ══════════════════════════════════════════════════════
   CSS
══════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#f6f4f1;
  --surf:#ffffff;
  --ink:#0d0d0d;
  --ink2:#3d3d3d;
  --ink3:#6b6b6b;
  --ink4:#a3a3a3;
  --bdr:#e4e2de;
  --bdr2:#f0eee9;
  --or:#f97316;
  --or-d:#ea580c;
  --sh:0 1px 3px rgba(0,0,0,.06),0 6px 20px rgba(0,0,0,.07);
  --sh-h:0 12px 40px rgba(0,0,0,.12);
  font-family:'Bricolage Grotesque',sans-serif;
}
html,body{background:var(--bg);color:var(--ink);min-height:100vh}

/* ── Root ── */
.ck-root{max-width:1100px;margin:0 auto;padding:28px 20px 80px}

/* ── Header ── */
.ck-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:28px}
.ck-back{display:flex;align-items:center;gap:7px;background:var(--surf);border:1.5px solid var(--bdr);border-radius:10px;padding:8px 14px;font-family:inherit;font-size:13px;font-weight:600;color:var(--ink2);cursor:pointer;transition:all .15s}
.ck-back:hover{border-color:var(--ink);color:var(--ink)}
.ck-title{font-size:26px;font-weight:800;color:var(--ink);letter-spacing:-.4px}

/* ── Steps ── */
.ck-steps{display:flex;align-items:center;justify-content:center;gap:0;margin-bottom:36px}
.ck-step-wrap{display:flex;align-items:center;gap:0}
.ck-step-dot{width:34px;height:34px;border-radius:50%;border:2px solid var(--bdr);background:var(--surf);color:var(--ink4);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;transition:all .25s;flex-shrink:0}
.ck-step-active{border-color:var(--or);background:var(--or);color:#fff;box-shadow:0 4px 14px rgba(249,115,22,.35)}
.ck-step-done{border-color:#22c55e;background:#22c55e;color:#fff}
.ck-step-lbl{font-size:12px;font-weight:600;color:var(--ink4);margin:0 8px;white-space:nowrap}
.ck-step-lbl-active{color:var(--or);font-weight:700}
.ck-step-line{width:52px;height:2px;background:var(--bdr);margin:0 4px;transition:background .25s;flex-shrink:0}
.ck-step-line-done{background:#22c55e}

/* ── Body layout ── */
.ck-body{display:grid;grid-template-columns:1fr 340px;gap:24px;align-items:start}
@media(max-width:820px){.ck-body{grid-template-columns:1fr}.ck-sidebar{display:none}}

/* ── Panel ── */
.ck-panel{background:var(--surf);border-radius:20px;padding:28px;border:1.5px solid var(--bdr);box-shadow:var(--sh)}
.ck-animate{animation:ck-in .3s cubic-bezier(.22,1,.36,1)}
@keyframes ck-in{from{opacity:0;transform:translateY(12px)}}

.ck-panel-head{display:flex;align-items:flex-start;gap:14px;margin-bottom:24px}
.ck-panel-icon{width:44px;height:44px;border-radius:13px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.ck-panel-title{font-size:18px;font-weight:800;color:var(--ink);margin-bottom:3px}
.ck-panel-sub{font-size:12px;color:var(--ink3);font-weight:500}

/* ── Fields ── */
.ck-field{margin-bottom:16px}
.ck-label{display:flex;align-items:center;gap:5px;font-size:11px;font-weight:700;color:var(--ink3);letter-spacing:.06em;text-transform:uppercase;margin-bottom:7px}
.ck-input{width:100%;padding:12px 14px;border:1.5px solid var(--bdr);border-radius:11px;font-family:'Bricolage Grotesque',sans-serif;font-size:14px;font-weight:500;color:var(--ink);background:var(--bg);outline:none;transition:border-color .18s,box-shadow .18s}
.ck-input:focus{border-color:var(--or);box-shadow:0 0 0 3px rgba(249,115,22,.1);background:var(--surf)}
.ck-input::placeholder{color:var(--ink4)}
.ck-input-mono{font-family:'DM Mono',monospace;letter-spacing:.08em}
.ck-textarea{width:100%;padding:12px 14px;border:1.5px solid var(--bdr);border-radius:11px;font-family:'Bricolage Grotesque',sans-serif;font-size:14px;font-weight:500;color:var(--ink);background:var(--bg);outline:none;resize:vertical;transition:border-color .18s,box-shadow .18s;line-height:1.5}
.ck-textarea:focus{border-color:var(--or);box-shadow:0 0 0 3px rgba(249,115,22,.1);background:var(--surf)}
.ck-textarea::placeholder{color:var(--ink4)}
.ck-field-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.ck-field-hint{display:flex;align-items:center;gap:4px;font-size:11px;font-weight:600;margin-top:5px}
.ck-hint-err{color:#dc2626}
.ck-hint-ok {color:#16a34a}

/* Phone input */
.ck-phone-wrap{display:flex;align-items:center;border:1.5px solid var(--bdr);border-radius:11px;background:var(--bg);overflow:hidden;transition:border-color .18s,box-shadow .18s}
.ck-phone-wrap:focus-within{border-color:var(--or);box-shadow:0 0 0 3px rgba(249,115,22,.1);background:var(--surf)}
.ck-phone-cc{padding:0 12px;font-size:13px;font-weight:600;color:var(--ink2);border-right:1.5px solid var(--bdr);white-space:nowrap;background:var(--bdr2)}
.ck-input-phone{border:none!important;box-shadow:none!important;border-radius:0!important;background:transparent!important;flex:1}
.ck-input-phone:focus{box-shadow:none!important}

/* Next button */
.ck-next-btn{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:14px;border-radius:13px;border:none;background:linear-gradient(135deg,var(--or),var(--or-d));font-family:'Bricolage Grotesque',sans-serif;font-size:15px;font-weight:700;color:#fff;cursor:pointer;transition:all .2s;margin-top:8px;box-shadow:0 4px 16px rgba(249,115,22,.3)}
.ck-next-btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 8px 24px rgba(249,115,22,.38)}
.ck-next-btn:disabled{opacity:.45;cursor:not-allowed;transform:none}

/* ── Payment tiles ── */
.ck-pay-methods{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:20px}
.ck-pay-tile{position:relative;display:flex;flex-direction:column;align-items:center;gap:6px;padding:16px 10px 14px;border-radius:14px;border:1.5px solid var(--bdr);background:var(--surf);cursor:pointer;transition:all .2s;text-align:center}
.ck-pay-tile:hover{border-color:var(--ink4);transform:translateY(-2px);box-shadow:var(--sh)}
.ck-pay-tile-active{transform:translateY(-2px)!important;box-shadow:var(--sh-h)!important}
.ck-pay-tile-icon{width:46px;height:46px;border-radius:13px;display:flex;align-items:center;justify-content:center;margin-bottom:2px}
.ck-pay-tile-label{font-size:13px;font-weight:700;color:var(--ink)}
.ck-pay-tile-sub{font-size:10px;color:var(--ink4);font-weight:500}
.ck-pay-tile-check{position:absolute;top:8px;right:8px;width:20px;height:20px;border-radius:50%;color:#fff;display:flex;align-items:center;justify-content:center}

/* UPI apps */
.ck-pay-section-lbl{font-size:11px;font-weight:700;color:var(--ink3);letter-spacing:.07em;text-transform:uppercase;margin-bottom:10px}
.ck-pay-detail{padding-top:4px}
.ck-upi-apps{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px}
.ck-upi-app{position:relative;display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 8px;border-radius:12px;border:1.5px solid var(--bdr);background:var(--surf);cursor:pointer;transition:all .18s}
.ck-upi-app:hover{border-color:var(--ink4)}
.ck-upi-app-active{transform:translateY(-2px);box-shadow:0 6px 18px rgba(0,0,0,.1)}
.ck-upi-logo{width:36px;height:36px;border-radius:10px;color:#fff;font-size:16px;font-weight:800;display:flex;align-items:center;justify-content:center}
.ck-upi-name{font-size:10px;font-weight:600;color:var(--ink2)}
.ck-upi-tick{position:absolute;top:6px;right:6px;width:10px;height:10px;border-radius:50%}
.ck-upi-divider{display:flex;align-items:center;gap:12px;margin:16px 0;color:var(--ink4);font-size:12px;font-weight:500}
.ck-upi-divider::before,.ck-upi-divider::after{content:'';flex:1;height:1px;background:var(--bdr)}

/* Card visual */
.ck-card-3d{width:100%;max-width:340px;height:200px;margin:0 auto 4px;perspective:1200px;cursor:default}
.ck-card-front,.ck-card-back{position:absolute;inset:0;border-radius:18px;padding:22px 26px;backface-visibility:hidden;transition:transform .6s cubic-bezier(.22,1,.36,1)}
.ck-card-front{background:linear-gradient(135deg,#1a1a2e 0%,#16213e 40%,#0f3460 100%);color:#fff;position:relative;overflow:hidden}
.ck-card-back{background:linear-gradient(135deg,#0f3460 0%,#16213e 100%);transform:rotateY(180deg)}
.ck-card-3d.ck-card-flipped .ck-card-front{transform:rotateY(-180deg)}
.ck-card-3d.ck-card-flipped .ck-card-back{transform:rotateY(0)}
.ck-card-shine{position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.06) 0%,transparent 50%);pointer-events:none}
.ck-card-logo{display:flex;align-items:center;justify-content:space-between;margin-bottom:28px}
.ck-chip{width:38px;height:28px;border-radius:5px;background:linear-gradient(135deg,#d4a843,#f0d070);box-shadow:inset 0 0 0 1px rgba(255,255,255,.2)}
.ck-card-number{font-family:'DM Mono',monospace;font-size:18px;letter-spacing:.18em;color:rgba(255,255,255,.95);margin-bottom:20px}
.ck-card-bottom{display:flex;justify-content:space-between}
.ck-card-field-lbl{font-size:9px;text-transform:uppercase;letter-spacing:.12em;color:rgba(255,255,255,.5);margin-bottom:3px}
.ck-card-field-val{font-size:13px;font-weight:600;color:#fff;letter-spacing:.06em}
.ck-card-stripe{height:44px;background:rgba(0,0,0,.6);margin:-22px -26px 20px;width:calc(100% + 52px)}
.ck-cvv-row{display:flex;align-items:center;justify-content:flex-end;gap:16px}
.ck-cvv-box{background:#fff;color:#0d0d0d;font-family:'DM Mono',monospace;padding:6px 14px;border-radius:6px;letter-spacing:.12em;font-size:14px}

.ck-cvv-input-wrap{position:relative}
.ck-cvv-eye{position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--ink4);display:flex;align-items:center}

.ck-secure-note{display:flex;align-items:center;gap:6px;font-size:11px;color:var(--ink4);margin-top:14px;padding:8px 12px;background:var(--bdr2);border-radius:8px}

/* Cash */
.ck-cash-info{display:flex;align-items:flex-start;gap:16px;padding:18px;background:#f0fdf4;border:1.5px solid #bbf7d0;border-radius:14px}
.ck-cash-title{font-size:15px;font-weight:700;color:#15803d;margin-bottom:4px}
.ck-cash-sub{font-size:13px;color:#166534;line-height:1.5}

/* ── Review ── */
.ck-review-cards{display:flex;flex-direction:column;gap:10px;margin-bottom:20px}
.ck-review-card{display:flex;align-items:flex-start;gap:12px;padding:14px 16px;background:var(--bdr2);border:1.5px solid var(--bdr);border-radius:12px;cursor:pointer;transition:border-color .15s}
.ck-review-card:hover{border-color:var(--or)}
.ck-review-card-lbl{font-size:10px;font-weight:700;color:var(--ink4);text-transform:uppercase;letter-spacing:.07em;margin-bottom:3px}
.ck-review-card-val{font-size:13px;font-weight:600;color:var(--ink);line-height:1.4}
.ck-review-edit{font-size:11px;font-weight:700;color:var(--or);white-space:nowrap;padding:3px 8px;border-radius:6px;background:#fff7ed;border:1px solid #fed7aa}

/* Order items */
.ck-items-list{border:1.5px solid var(--bdr);border-radius:14px;overflow:hidden;margin-bottom:16px}
.ck-oi{display:flex;align-items:center;gap:12px;padding:13px 14px;border-bottom:1px solid var(--bdr2)}
.ck-oi:last-child{border-bottom:none}
.ck-oi-img{width:42px;height:42px;border-radius:9px;overflow:hidden;background:var(--bdr2);flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;color:var(--ink3)}
.ck-oi-img img{width:100%;height:100%;object-fit:cover}
.ck-oi-info{flex:1;min-width:0}
.ck-oi-name{font-size:13px;font-weight:700;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ck-oi-rest{font-size:11px;color:var(--ink4);margin-top:1px}
.ck-oi-right{display:flex;flex-direction:column;align-items:flex-end;gap:2px;flex-shrink:0}
.ck-oi-qty{font-size:11px;color:var(--ink4);font-weight:600}
.ck-oi-price{font-size:13px;font-weight:700;color:var(--ink)}

/* Bill */
.ck-bill{padding:14px;background:var(--bdr2);border-radius:12px;margin-bottom:16px}
.ck-bill-row{display:flex;justify-content:space-between;font-size:13px;color:var(--ink3);margin-bottom:8px;font-weight:500}
.ck-free{color:#16a34a;font-weight:700}
.ck-bill-total{display:flex;justify-content:space-between;font-size:17px;font-weight:800;color:var(--ink);padding-top:10px;border-top:1.5px solid var(--bdr);margin-top:4px}

/* Error */
.ck-error-bar{display:flex;align-items:center;gap:8px;padding:12px 14px;background:#fef2f2;border:1.5px solid #fecaca;border-radius:10px;font-size:13px;font-weight:600;color:#dc2626;margin-bottom:14px}

/* Place button */
.ck-place-btn{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:15px;border-radius:13px;border:none;background:linear-gradient(135deg,#111,#2d2d2d);font-family:'Bricolage Grotesque',sans-serif;font-size:15px;font-weight:700;color:#fff;cursor:pointer;transition:all .2s;box-shadow:0 4px 18px rgba(0,0,0,.25)}
.ck-place-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 28px rgba(0,0,0,.3)}
.ck-place-btn:disabled{opacity:.5;cursor:not-allowed;transform:none}
.ck-place-note{text-align:center;font-size:11px;color:var(--ink4);margin-top:10px;display:flex;align-items:center;justify-content:center;gap:4px}

/* Spinner */
.ck-spin{animation:ck-spin .8s linear infinite}
@keyframes ck-spin{to{transform:rotate(360deg)}}

/* ── Sidebar ── */
.ck-sidebar-box{background:var(--surf);border-radius:18px;padding:22px;border:1.5px solid var(--bdr);box-shadow:var(--sh);position:sticky;top:24px}
.ck-sidebar-title{display:flex;align-items:center;gap:8px;font-size:15px;font-weight:800;color:var(--ink);margin-bottom:16px}
.ck-sidebar-count{margin-left:auto;background:var(--bdr2);color:var(--ink3);font-size:11px;font-weight:600;padding:2px 9px;border-radius:100px}
.ck-sidebar-items{border-bottom:1.5px solid var(--bdr);padding-bottom:14px;margin-bottom:14px;display:flex;flex-direction:column;gap:9px}
.ck-si{display:flex;align-items:center;gap:8px;font-size:12px}
.ck-si-name{flex:1;color:var(--ink2);font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ck-si-qty{color:var(--ink4);font-weight:600;flex-shrink:0}
.ck-si-price{color:var(--ink);font-weight:700;flex-shrink:0;min-width:40px;text-align:right}
.ck-sidebar-bill{display:flex;flex-direction:column;gap:7px}
.ck-sb-row{display:flex;justify-content:space-between;font-size:12px;color:var(--ink3);font-weight:500}
.ck-sb-total{display:flex;justify-content:space-between;font-size:16px;font-weight:800;color:var(--ink);padding-top:10px;border-top:1.5px solid var(--bdr);margin-top:4px}

/* ── Success overlay ── */
.ck-success-overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);backdrop-filter:blur(8px);z-index:9999;display:flex;align-items:center;justify-content:center;animation:ck-in .3s ease}
.ck-success-box{background:#fff;border-radius:24px;padding:44px 40px;text-align:center;max-width:380px;width:90%;box-shadow:0 24px 64px rgba(0,0,0,.18);animation:ck-pop .35s cubic-bezier(.22,1,.36,1)}
@keyframes ck-pop{from{opacity:0;transform:scale(.88)}}
.ck-success-ring{width:88px;height:88px;border-radius:50%;background:linear-gradient(135deg,#bbf7d0,#86efac);display:flex;align-items:center;justify-content:center;margin:0 auto 20px;box-shadow:0 8px 28px rgba(34,197,94,.3)}
.ck-success-icon{color:#15803d}
.ck-success-title{font-size:24px;font-weight:800;color:#0d0d0d;margin-bottom:8px}
.ck-success-sub{font-size:14px;color:#6b7280;line-height:1.5;margin-bottom:22px}
.ck-success-bar{height:4px;background:#e5e7eb;border-radius:4px;overflow:hidden}
.ck-success-fill{height:100%;background:linear-gradient(90deg,#22c55e,#16a34a);border-radius:4px;animation:ck-fill 3s linear forwards}
@keyframes ck-fill{from{width:0}to{width:100%}}
`;

export default Checkout;