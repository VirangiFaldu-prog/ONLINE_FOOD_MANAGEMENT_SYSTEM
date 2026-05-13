// import { useEffect, useState } from "react";
// import { useNavigate, useSearchParams } from "react-router-dom";
// import {
//   User, Mail, Phone, Star, X, Save,
//   Plus, Edit2, Trash2, ShoppingCart, Minus, Sparkles, Crown,
// } from "lucide-react";

// const USER_API   = "https://localhost:7217/api/User";
// const REVIEW_API = "https://localhost:7217/api/Review";
// const REST_API   = "https://localhost:7217/api/Restaurant";

// /* ─── Auth header helper ─── */
// const authHeaders = () => {
//   const token = localStorage.getItem("token") || localStorage.getItem("authToken") || localStorage.getItem("jwtToken");
//   return {
//     "Content-Type": "application/json",
//     ...(token ? { Authorization: `Bearer ${token}` } : {}),
//   };
// };

// /* ─── Design tokens ─── */
// const T = {
//   bg: "#f5f0e8", gold: "#b8922a", goldLight: "#d4a843",
//   goldGlow: "rgba(184,146,42,0.25)", text: "#2a1f10",
//   muted: "#7a6a54", mutedWarm: "#9a8060",
//   cardBorder: "rgba(184,146,42,0.22)",
//   red: "#d94f4f", green: "#3a9e6e", white: "#ffffff",
//   heroFrom: "#1c1408", heroTo: "#2e200a",
// };

// const globalCSS = `
// @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Jost:wght@300;400;500;600;700&display=swap');
// *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
// body{background:#f5f0e8}
// @keyframes spin    {to{transform:rotate(360deg)}}
// @keyframes fadeUp  {from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
// @keyframes fadeIn  {from{opacity:0}to{opacity:1}}
// @keyframes orb1    {0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(50px,-35px) scale(1.12)}}
// @keyframes orb2    {0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-40px,25px) scale(0.9)}}
// @keyframes shimmer {0%,100%{opacity:0.6}50%{opacity:1}}
// @keyframes starPop {0%{transform:scale(0.6)}60%{transform:scale(1.3)}100%{transform:scale(1)}}
// @keyframes avatarGlow{0%,100%{box-shadow:0 0 0 3px rgba(212,168,67,0.2),0 0 40px rgba(184,146,42,0.15)}50%{box-shadow:0 0 0 3px rgba(212,168,67,0.5),0 0 60px rgba(184,146,42,0.35)}}
// .page-enter{animation:fadeUp 0.55s ease both}
// .card-enter{animation:fadeUp 0.45s ease both}
// .orb1{animation:orb1 14s ease-in-out infinite}
// .orb2{animation:orb2 18s ease-in-out infinite}
// .avatar-ring{animation:avatarGlow 3s ease-in-out infinite}
// .review-card{transition:transform 0.3s cubic-bezier(.22,1,.36,1),box-shadow 0.3s ease,border-color 0.2s}
// .review-card:hover{transform:translateY(-4px);box-shadow:0 16px 48px rgba(0,0,0,0.1),0 0 0 1px rgba(184,146,42,0.3)!important;border-color:rgba(184,146,42,0.4)!important}
// .gold-btn{transition:all 0.22s ease;cursor:pointer}
// .gold-btn:hover{background:linear-gradient(135deg,#f0d880,#c09030)!important;transform:translateY(-2px);box-shadow:0 10px 28px rgba(201,168,76,0.35)!important}
// .gold-btn:active{transform:scale(0.97)}
// .outline-btn{transition:all 0.2s ease;cursor:pointer}
// .outline-btn:hover{border-color:#d4a843!important;color:#d4a843!important;background:rgba(201,168,76,0.06)!important}
// .star-btn{transition:transform 0.15s ease}
// .star-btn:hover{transform:scale(1.2)}
// .star-active{animation:starPop 0.3s ease}
// .cart-item-row{transition:background 0.18s ease}
// .cart-item-row:hover{background:rgba(184,146,42,0.04)!important}
// .modal-overlay{animation:fadeIn 0.2s ease}
// .info-chip{transition:all 0.18s ease}
// .info-chip:hover{border-color:rgba(212,168,67,0.4)!important;background:rgba(212,168,67,0.07)!important}
// ::-webkit-scrollbar{width:5px}
// ::-webkit-scrollbar-track{background:#f5f0e8}
// ::-webkit-scrollbar-thumb{background:rgba(184,146,42,0.25);border-radius:4px}
// ::-webkit-scrollbar-thumb:hover{background:#b8922a}
// `;

// /* ─── Gold border card ─── */
// const GoldCard = ({ children, style = {}, className = "" }) => (
//   <div className={className} style={{
//     position: "relative", borderRadius: 20,
//     border: "1.5px solid transparent",
//     backgroundImage: `linear-gradient(#fdf8f0,#fdf8f0),linear-gradient(135deg,#d4a843 0%,#f0d070 35%,#b8922a 65%,#e8c060 100%)`,
//     backgroundOrigin: "border-box", backgroundClip: "padding-box,border-box",
//     boxShadow: `0 0 0 1px rgba(212,168,67,0.08),0 4px 28px rgba(0,0,0,0.08),inset 0 1px 0 rgba(240,208,112,0.12)`,
//     ...style,
//   }}>
//     {[{top:8,left:8},{top:8,right:8},{bottom:8,left:8},{bottom:8,right:8}].map((pos,i)=>(
//       <div key={i} style={{ position:"absolute", width:10, height:10, ...pos, opacity:0.5,
//         borderTop:    i<2  ? "1.5px solid #d4a843" : "none",
//         borderBottom: i>=2 ? "1.5px solid #d4a843" : "none",
//         borderLeft:   (i===0||i===2) ? "1.5px solid #d4a843" : "none",
//         borderRight:  (i===1||i===3) ? "1.5px solid #d4a843" : "none",
//       }}/>
//     ))}
//     {children}
//   </div>
// );

// const StarRow = ({ rating, size = 16 }) => (
//   <div style={{ display:"flex", gap:3 }}>
//     {[1,2,3,4,5].map(s=>(
//       <Star key={s} size={size} style={{
//         color: s<=rating ? "#d4a843" : "rgba(184,146,42,0.2)",
//         fill:  s<=rating ? "#d4a843" : "transparent",
//         transition:"all 0.15s",
//       }}/>
//     ))}
//   </div>
// );

// /* ══════════════════════════════════════════════
//    MAIN COMPONENT
// ══════════════════════════════════════════════ */
// const Profile = () => {
//   const [user,          setUser]          = useState(null);
//   const [reviews,       setReviews]       = useState([]);
//   const [restaurants,   setRestaurants]   = useState([]);   // ← array now, not object
//   const [cart,          setCart]          = useState([]);
//   const [loading,       setLoading]       = useState(true);
//   const [showModal,     setShowModal]     = useState(false);
//   const [editingReview, setEditingReview] = useState(null);
//   const [reviewForm,    setReviewForm]    = useState({ restaurantID:"", rating:5, comment:"" });
//   const [restError,     setRestError]     = useState("");

//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();

//   useEffect(() => {
//     loadProfile();
//     loadReviews();
//     loadRestaurants();
//     loadCart();
//     const reviewOrderId = searchParams.get("review");
//     const restaurantId  = searchParams.get("restaurant");
//     if (reviewOrderId && restaurantId) {
//       setReviewForm({ restaurantID: restaurantId, rating:5, comment:"" });
//       setShowModal(true);
//     }
//   }, []);

//   /* ── loadProfile ── */
//   const loadProfile = async () => {
//     try {
//       const userId = localStorage.getItem("customerId") || localStorage.getItem("userId");
//       if (!userId) { navigate("/customer/login"); return; }
//       const res = await fetch(`${USER_API}/${userId}`, { headers: authHeaders() });
//       if (res.ok) setUser(await res.json());
//     } catch (e) { console.error("loadProfile:", e); }
//     finally { setLoading(false); }
//   };

//   /* ── loadReviews — uses /my-reviews with JWT, not /user/{id} ── */
//   const loadReviews = async () => {
//     try {
//       // FIX: your controller has GET /my-reviews (uses JWT claims), not /user/{id}
//       const res = await fetch(`${REVIEW_API}/my-reviews`, { headers: authHeaders() });
//       if (res.ok) {
//         const data = await res.json();
//         setReviews(data);
//       } else {
//         console.warn("loadReviews status:", res.status);
//       }
//     } catch (e) { console.error("loadReviews:", e); }
//   };

//   /* ── loadRestaurants — FIX: store as array, handle both Name and restaurantName ── */
//   const loadRestaurants = async () => {
//     try {
//       setRestError("");
//       const res = await fetch(REST_API, { headers: authHeaders() });
//       if (res.ok) {
//         const data = await res.json();
//         console.log("Restaurants sample:", data[0]); // ← check field names in console
//         setRestaurants(data); // keep as array
//       } else {
//         setRestError(`Failed to load restaurants (${res.status})`);
//         console.warn("loadRestaurants status:", res.status);
//       }
//     } catch (e) {
//       setRestError("Network error loading restaurants");
//       console.error("loadRestaurants:", e);
//     }
//   };

//   /* ── Restaurant name helper — handles Name / name / restaurantName ── */
//   const getRestName = (r) =>
//     r?.name || r?.Name || r?.restaurantName || r?.RestaurantName || "Unknown";

//   /* ── Restaurant ID helper ── */
//   const getRestId = (r) =>
//     r?.restaurantID ?? r?.RestaurantID ?? r?.id ?? r?.ID;

//   /* ── Find restaurant by ID (for review cards) ── */
//   const findRestaurant = (id) =>
//     restaurants.find(r => getRestId(r) === id || getRestId(r) === Number(id));

//   const loadCart = () => {
//     try {
//       const saved = localStorage.getItem("cart");
//       if (saved) setCart(JSON.parse(saved));
//     } catch { setCart([]); }
//   };

//   const updateQty = (id, delta) => {
//     const updated = cart
//       .map(i => i.menuItemID === id
//         ? (i.quantity + delta <= 0 ? null : { ...i, quantity: i.quantity + delta })
//         : i)
//       .filter(Boolean);
//     setCart(updated);
//     localStorage.setItem("cart", JSON.stringify(updated));
//   };

//   const removeItem = (id) => {
//     const updated = cart.filter(i => i.menuItemID !== id);
//     setCart(updated);
//     localStorage.setItem("cart", JSON.stringify(updated));
//   };

//   const cartTotal = () => cart.reduce((s, i) => s + i.menuItemPrice * i.quantity, 0);
//   const cartQty   = () => cart.reduce((s, i) => s + i.quantity, 0);

//   /* ── handleSubmitReview — sends auth token ── */
//   const handleSubmitReview = async () => {
//     try {
//       if (!reviewForm.restaurantID) return alert("Please select a restaurant");
//       const url    = editingReview ? `${REVIEW_API}/${editingReview.reviewID}` : `${REVIEW_API}`;
//       const method = editingReview ? "PUT" : "POST";
//       const res = await fetch(url, {
//         method,
//         headers: authHeaders(),
//         body: JSON.stringify({
//           restaurantID: parseInt(reviewForm.restaurantID),
//           rating:       reviewForm.rating,
//           comment:      reviewForm.comment,
//         }),
//       });
//       if (res.ok) {
//         setShowModal(false);
//         setReviewForm({ restaurantID:"", rating:5, comment:"" });
//         setEditingReview(null);
//         loadReviews();
//       } else {
//         const err = await res.json().catch(() => ({}));
//         alert("Failed to save review: " + (err.message || err.Message || res.status));
//       }
//     } catch (e) { alert("Error: " + e.message); }
//   };

//   const openEdit = (review) => {
//     setEditingReview(review);
//     setReviewForm({
//       restaurantID: (review.restaurantID ?? review.RestaurantID)?.toString() || "",
//       rating:       review.rating  ?? review.Rating  ?? 5,
//       comment:      review.comment ?? review.Comment ?? "",
//     });
//     setShowModal(true);
//   };

//   const deleteReview = async (id) => {
//     if (!window.confirm("Delete this review?")) return;
//     try {
//       const res = await fetch(`${REVIEW_API}/${id}`, { method:"DELETE", headers: authHeaders() });
//       if (res.ok) loadReviews();
//       else alert("Failed to delete review: " + res.status);
//     } catch (e) { alert("Error: " + e.message); }
//   };

//   const displayName = user?.userName ?? user?.UserName ?? "Guest";
//   const initials = displayName.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2) || "G";

//   /* ── LOADER ── */
//   if (loading) return (
//     <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh", background:"#f5f0e8", flexDirection:"column", gap:20 }}>
//       <style>{globalCSS}</style>
//       <div style={{ width:50, height:50, border:"3px solid rgba(184,146,42,0.2)", borderTopColor:"#b8922a", borderRadius:"50%", animation:"spin 0.85s linear infinite" }}/>
//       <p style={{ fontFamily:"'Jost',sans-serif", color:"#9a8060", fontWeight:500, letterSpacing:"0.14em", textTransform:"uppercase", fontSize:11 }}>Loading your profile…</p>
//     </div>
//   );

//   /* ══ RENDER ══ */
//   return (
//     <div style={{ minHeight:"100vh", background:"#f5f0e8", fontFamily:"'Jost',sans-serif", color:T.text, paddingBottom:80 }}>
//       <style>{globalCSS}</style>

//       {/* ── HERO HEADER ── */}
//       <header style={{ position:"relative", overflow:"hidden", padding:"60px 52px 52px", background:`linear-gradient(155deg,${T.heroFrom} 0%,${T.heroTo} 55%,#1a1206 100%)` }}>
//         <div className="orb1" style={{ position:"absolute", top:"-80px", left:"5%", width:480, height:480, borderRadius:"50%", background:"radial-gradient(circle,rgba(201,168,76,0.1) 0%,transparent 70%)", pointerEvents:"none" }}/>
//         <div className="orb2" style={{ position:"absolute", bottom:"-100px", right:"3%", width:520, height:520, borderRadius:"50%", background:"radial-gradient(circle,rgba(80,120,220,0.06) 0%,transparent 70%)", pointerEvents:"none" }}/>
//         <div style={{ position:"absolute", top:0, left:0, right:0, height:"1.5px", background:"linear-gradient(90deg,transparent 0%,#c9a84c 40%,#e8c97a 60%,transparent 100%)" }}/>

//         <div className="page-enter" style={{ position:"relative", maxWidth:1100, margin:"0 auto", display:"flex", alignItems:"center", gap:48, flexWrap:"wrap" }}>
//           <div style={{ position:"relative", flexShrink:0 }}>
//             <div className="avatar-ring" style={{ width:110, height:110, borderRadius:"50%", background:`linear-gradient(135deg,${T.gold},#a8721e)`, display:"flex", alignItems:"center", justifyContent:"center" }}>
//               <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:36, fontWeight:700, color:"#1a0c00", letterSpacing:"-0.02em" }}>{initials}</span>
//             </div>
//             <div style={{ position:"absolute", bottom:-4, right:-4, width:30, height:30, borderRadius:"50%", background:`linear-gradient(135deg,#d4a843,#a8721e)`, display:"flex", alignItems:"center", justifyContent:"center", border:"2px solid #f5f0e8" }}>
//               <Crown size={13} style={{ color:"#1a0c00" }}/>
//             </div>
//           </div>

//           <div style={{ flex:1, minWidth:240 }}>
//             <div style={{ display:"inline-flex", alignItems:"center", gap:7, marginBottom:14, padding:"4px 14px", border:"1px solid rgba(212,168,67,0.3)", borderRadius:100, background:"rgba(212,168,67,0.08)" }}>
//               <Sparkles size={10} style={{ color:"#d4a843" }}/>
//               <span style={{ fontSize:10, fontWeight:700, letterSpacing:"0.16em", textTransform:"uppercase", color:"#d4a843" }}>Customer Profile</span>
//             </div>
//             <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(2.2rem,4vw,3.6rem)", fontWeight:700, lineHeight:1, color:"#f5ead0", marginBottom:10, letterSpacing:"-0.01em" }}>
//               Welcome,&nbsp;
//               <em style={{ fontStyle:"italic", background:`linear-gradient(135deg,#d4a843,#f0d070)`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
//                 {displayName}
//               </em>
//               &nbsp;✨
//             </h1>
//             <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginTop:4 }}>
//               {user?.email && (
//                 <div className="info-chip" style={{ display:"inline-flex", alignItems:"center", gap:7, padding:"6px 14px", borderRadius:10, border:"1px solid rgba(255,255,255,0.08)", background:"rgba(255,255,255,0.04)" }}>
//                   <Mail size={12} style={{ color:T.goldLight }}/><span style={{ fontSize:12, color:"rgba(245,234,208,0.7)", fontWeight:500 }}>{user.email}</span>
//                 </div>
//               )}
//               {user?.phone && (
//                 <div className="info-chip" style={{ display:"inline-flex", alignItems:"center", gap:7, padding:"6px 14px", borderRadius:10, border:"1px solid rgba(255,255,255,0.08)", background:"rgba(255,255,255,0.04)" }}>
//                   <Phone size={12} style={{ color:T.goldLight }}/><span style={{ fontSize:12, color:"rgba(245,234,208,0.7)", fontWeight:500 }}>{user.phone}</span>
//                 </div>
//               )}
//               <div style={{ display:"inline-flex", alignItems:"center", gap:7, padding:"6px 14px", borderRadius:10, border:"1px solid rgba(255,255,255,0.08)", background:"rgba(255,255,255,0.04)" }}>
//                 <Star size={12} style={{ color:T.goldLight }}/><span style={{ fontSize:12, color:"rgba(245,234,208,0.7)", fontWeight:500 }}>{reviews.length} Review{reviews.length!==1?"s":""}</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* ── MAIN CONTENT ── */}
//       <div style={{ maxWidth:1100, margin:"40px auto 0", padding:"0 52px", display:"grid", gridTemplateColumns:"340px 1fr", gap:32 }}>

//         {/* LEFT SIDEBAR */}
//         <div style={{ display:"flex", flexDirection:"column", gap:24 }}>

//           {/* Cart Summary */}
//           <GoldCard className="card-enter" style={{ padding:"28px 28px 24px", animationDelay:"0.1s" }}>
//             <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
//               <div style={{ width:34, height:34, borderRadius:10, background:`linear-gradient(135deg,${T.gold},#a8721e)`, display:"flex", alignItems:"center", justifyContent:"center" }}>
//                 <ShoppingCart size={16} style={{ color:"#1a0c00" }}/>
//               </div>
//               <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, fontWeight:700, color:T.text }}>Shopping Cart 🛒</h3>
//             </div>
//             {cart.length===0 ? (
//               <div style={{ textAlign:"center", padding:"28px 0" }}>
//                 <div style={{ fontSize:40, marginBottom:10 }}>🛍️</div>
//                 <p style={{ color:T.mutedWarm, fontSize:13, fontWeight:500 }}>Your cart is empty</p>
//               </div>
//             ) : (
//               <>
//                 <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
//                   <div style={{ padding:12, borderRadius:12, background:"rgba(184,146,42,0.07)", border:"1px solid rgba(184,146,42,0.18)", textAlign:"center" }}>
//                     <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:26, fontWeight:700, color:T.gold, lineHeight:1 }}>{cartQty()}</p>
//                     <p style={{ fontSize:10, color:T.mutedWarm, marginTop:4, letterSpacing:"0.07em", textTransform:"uppercase" }}>Items</p>
//                   </div>
//                   <div style={{ padding:12, borderRadius:12, background:"rgba(58,158,110,0.07)", border:"1px solid rgba(58,158,110,0.2)", textAlign:"center" }}>
//                     <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:26, fontWeight:700, color:T.green, lineHeight:1 }}>₹{cartTotal().toFixed(0)}</p>
//                     <p style={{ fontSize:10, color:T.mutedWarm, marginTop:4, letterSpacing:"0.07em", textTransform:"uppercase" }}>Total</p>
//                   </div>
//                 </div>
//                 <button className="gold-btn" onClick={()=>navigate("/customer/cart")}
//                   style={{ width:"100%", padding:11, borderRadius:13, border:"none", background:`linear-gradient(135deg,${T.gold},#a8721e)`, color:"#1a0c00", fontWeight:700, fontSize:13, fontFamily:"'Jost',sans-serif", letterSpacing:"0.05em", boxShadow:`0 4px 18px ${T.goldGlow}` }}>
//                   View Cart →
//                 </button>
//               </>
//             )}
//           </GoldCard>

//           {/* Quick Stats */}
//           <GoldCard className="card-enter" style={{ padding:"24px 28px", animationDelay:"0.2s" }}>
//             <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:18 }}>
//               <span style={{ fontSize:18 }}>📊</span>
//               <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, fontWeight:700, color:T.text }}>Your Stats</h3>
//             </div>
//             <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
//               {[
//                 { emoji:"⭐", label:"Total Reviews",     val: reviews.length },
//                 { emoji:"🛒", label:"Cart Items",        val: cartQty() },
//                 { emoji:"💰", label:"Cart Value",        val: `₹${cartTotal().toFixed(0)}` },
//                 { emoji:"🏪", label:"Restaurants Rated", val: [...new Set(reviews.map(r=>r.restaurantID??r.RestaurantID))].length },
//               ].map(({ emoji, label, val }) => (
//                 <div key={label} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"9px 12px", borderRadius:10, background:"rgba(184,146,42,0.04)", border:"1px solid rgba(184,146,42,0.12)" }}>
//                   <span style={{ fontSize:13, color:T.muted, display:"flex", alignItems:"center", gap:7 }}><span>{emoji}</span>{label}</span>
//                   <span style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:17, color:T.gold }}>{val}</span>
//                 </div>
//               ))}
//             </div>
//           </GoldCard>
//         </div>

//         {/* RIGHT COLUMN */}
//         <div style={{ display:"flex", flexDirection:"column", gap:28 }}>

//           {/* Cart Items */}
//           {cart.length > 0 && (
//             <GoldCard className="card-enter" style={{ padding:28, animationDelay:"0.15s" }}>
//               <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
//                 <div style={{ display:"flex", alignItems:"center", gap:10 }}>
//                   <span style={{ fontSize:20 }}>🛍️</span>
//                   <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:700, color:T.text }}>
//                     Cart Items <span style={{ fontSize:14, color:T.mutedWarm, fontFamily:"'Jost',sans-serif", fontWeight:500 }}>({cart.length})</span>
//                   </h2>
//                 </div>
//               </div>
//               <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
//                 {cart.map(item=>(
//                   <div key={item.menuItemID} className="cart-item-row" style={{ display:"flex", alignItems:"center", gap:14, padding:"12px 14px", borderRadius:14, border:"1px solid rgba(184,146,42,0.15)", background:"rgba(255,255,255,0.6)" }}>
//                     <div style={{ width:52, height:52, borderRadius:12, overflow:"hidden", flexShrink:0, background:"#f0ead8", display:"flex", alignItems:"center", justifyContent:"center" }}>
//                       {item.imageUrl ? <img src={item.imageUrl} alt={item.menuItemName} style={{ width:"100%", height:"100%", objectFit:"cover" }}/> : <span style={{ fontSize:22 }}>🍽️</span>}
//                     </div>
//                     <div style={{ flex:1, minWidth:0 }}>
//                       <p style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:600, fontSize:16, color:T.text, margin:"0 0 2px", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{item.menuItemName}</p>
//                       <p style={{ fontSize:11, color:T.mutedWarm, margin:0 }}>{item.restaurantName}</p>
//                     </div>
//                     <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:16, fontWeight:700, background:`linear-gradient(135deg,${T.gold},${T.goldLight})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", flexShrink:0 }}>₹{item.menuItemPrice}</span>
//                     <div style={{ display:"flex", alignItems:"center", gap:6, background:"rgba(184,146,42,0.08)", border:"1px solid rgba(184,146,42,0.2)", borderRadius:10, padding:4 }}>
//                       <button onClick={()=>updateQty(item.menuItemID,-1)} style={{ width:28, height:28, borderRadius:7, border:"none", background:`linear-gradient(135deg,${T.gold},#a8721e)`, color:"#1a0c00", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><Minus size={12}/></button>
//                       <span style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:17, color:T.gold, minWidth:22, textAlign:"center" }}>{item.quantity}</span>
//                       <button onClick={()=>updateQty(item.menuItemID,1)} style={{ width:28, height:28, borderRadius:7, border:"none", background:`linear-gradient(135deg,${T.gold},#a8721e)`, color:"#1a0c00", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><Plus size={12}/></button>
//                     </div>
//                     <span style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:16, color:T.text, minWidth:60, textAlign:"right", flexShrink:0 }}>₹{(item.menuItemPrice*item.quantity).toFixed(0)}</span>
//                     <button onClick={()=>removeItem(item.menuItemID)} style={{ width:30, height:30, borderRadius:8, border:"1px solid rgba(217,79,79,0.2)", background:"rgba(217,79,79,0.06)", color:T.red, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><Trash2 size={13}/></button>
//                   </div>
//                 ))}
//               </div>
//               <div style={{ display:"flex", gap:12, marginTop:20, paddingTop:18, borderTop:"1px solid rgba(184,146,42,0.15)" }}>
//                 <button className="outline-btn" onClick={()=>navigate("/customer/all-items")}
//                   style={{ flex:1, padding:11, borderRadius:13, border:"1.5px solid rgba(184,146,42,0.28)", background:"transparent", color:T.muted, fontWeight:600, fontSize:13, fontFamily:"'Jost',sans-serif", letterSpacing:"0.04em" }}>
//                   ← Keep Shopping
//                 </button>
//                 <button className="gold-btn" onClick={()=>navigate("/customer/checkout")}
//                   style={{ flex:1, padding:11, borderRadius:13, border:"none", background:`linear-gradient(135deg,${T.gold},#a8721e)`, color:"#1a0c00", fontWeight:700, fontSize:13, fontFamily:"'Jost',sans-serif", letterSpacing:"0.05em", display:"flex", alignItems:"center", justifyContent:"center", gap:7, boxShadow:`0 4px 18px ${T.goldGlow}` }}>
//                   <ShoppingCart size={15}/> Checkout
//                 </button>
//               </div>
//             </GoldCard>
//           )}

//           {/* REVIEWS SECTION */}
//           <GoldCard className="card-enter" style={{ padding:28, animationDelay:"0.25s" }}>
//             <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
//               <div style={{ display:"flex", alignItems:"center", gap:10 }}>
//                 <span style={{ fontSize:22 }}>⭐</span>
//                 <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:24, fontWeight:700, color:T.text }}>My Reviews</h2>
//               </div>
//               <button className="gold-btn" onClick={()=>{ setEditingReview(null); setReviewForm({restaurantID:"",rating:5,comment:""}); setShowModal(true); }}
//                 style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 20px", borderRadius:12, border:"none", background:`linear-gradient(135deg,${T.gold},#a8721e)`, color:"#1a0c00", fontWeight:700, fontSize:12, fontFamily:"'Jost',sans-serif", letterSpacing:"0.06em", boxShadow:`0 4px 14px ${T.goldGlow}` }}>
//                 <Plus size={14}/> Write Review ✍️
//               </button>
//             </div>
//             <div style={{ height:1, background:"linear-gradient(90deg,transparent,rgba(201,168,76,0.25),transparent)", marginBottom:20 }}/>

//             {reviews.length===0 ? (
//               <div style={{ textAlign:"center", padding:"52px 20px" }}>
//                 <div style={{ fontSize:52, marginBottom:14 }}>✍️</div>
//                 <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, fontWeight:600, color:T.muted, marginBottom:6 }}>No reviews yet</p>
//                 <p style={{ fontSize:13, color:T.mutedWarm }}>Share your dining experience with the world 🌍</p>
//               </div>
//             ) : (
//               <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
//                 {reviews.map((review, idx)=>{
//                   const restId = review.restaurantID ?? review.RestaurantID;
//                   const rest   = findRestaurant(restId);
//                   const restName = review.restaurantName ?? review.RestaurantName ?? getRestName(rest) ?? "Restaurant";
//                   return (
//                     <div key={review.reviewID ?? review.ReviewID} className="review-card card-enter"
//                       style={{ padding:"18px 20px", borderRadius:16, border:"1px solid rgba(184,146,42,0.18)", background:"rgba(255,255,255,0.7)", animationDelay:`${idx*0.07}s` }}>
//                       <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:10 }}>
//                         <div>
//                           <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
//                             <span style={{ fontSize:16 }}>🏪</span>
//                             <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, fontWeight:700, color:T.text }}>{restName}</h3>
//                           </div>
//                           <StarRow rating={review.rating ?? review.Rating ?? 0}/>
//                         </div>
//                         <div style={{ display:"flex", gap:6 }}>
//                           <button onClick={()=>openEdit(review)} style={{ width:32, height:32, borderRadius:9, border:"1px solid rgba(184,146,42,0.25)", background:"rgba(184,146,42,0.06)", color:T.gold, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><Edit2 size={13}/></button>
//                           <button onClick={()=>deleteReview(review.reviewID ?? review.ReviewID)} style={{ width:32, height:32, borderRadius:9, border:"1px solid rgba(217,79,79,0.2)", background:"rgba(217,79,79,0.05)", color:T.red, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><Trash2 size={13}/></button>
//                         </div>
//                       </div>
//                       {(review.comment ?? review.Comment) && (
//                         <p style={{ fontSize:13, color:T.muted, lineHeight:1.6, marginBottom:8, fontStyle:"italic", borderLeft:"2px solid rgba(212,168,67,0.3)", paddingLeft:12 }}>
//                           "{review.comment ?? review.Comment}"
//                         </p>
//                       )}
//                       <p style={{ fontSize:11, color:T.mutedWarm, letterSpacing:"0.04em" }}>
//                         📅 {new Date(review.createdAt || review.CreatedAt).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}
//                       </p>
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//           </GoldCard>
//         </div>
//       </div>

//       {/* ══ REVIEW MODAL ══ */}
//       {showModal && (
//         <div className="modal-overlay" style={{ position:"fixed", inset:0, background:"rgba(10,6,2,0.75)", backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:20 }}>
//           <div className="card-enter" style={{
//             position:"relative", width:"100%", maxWidth:480, borderRadius:24,
//             border:"1.5px solid transparent",
//             backgroundImage:`linear-gradient(#fdf8f0,#fdf8f0),linear-gradient(135deg,#d4a843 0%,#f0d070 35%,#b8922a 65%,#e8c060 100%)`,
//             backgroundOrigin:"border-box", backgroundClip:"padding-box,border-box",
//             boxShadow:`0 0 0 1px rgba(212,168,67,0.1),0 32px 80px rgba(0,0,0,0.4)`,
//             padding:"36px 36px 32px",
//           }}>
//             {[{top:10,left:10},{top:10,right:10},{bottom:10,left:10},{bottom:10,right:10}].map((pos,i)=>(
//               <div key={i} style={{ position:"absolute", width:12, height:12, ...pos, opacity:0.5,
//                 borderTop:    i<2  ? "1.5px solid #d4a843" : "none",
//                 borderBottom: i>=2 ? "1.5px solid #d4a843" : "none",
//                 borderLeft:   (i===0||i===2) ? "1.5px solid #d4a843" : "none",
//                 borderRight:  (i===1||i===3) ? "1.5px solid #d4a843" : "none",
//               }}/>
//             ))}
//             <button onClick={()=>{ setShowModal(false); setEditingReview(null); setReviewForm({restaurantID:"",rating:5,comment:""}); }}
//               style={{ position:"absolute", top:16, right:16, width:34, height:34, borderRadius:10, border:"1px solid rgba(184,146,42,0.25)", background:"rgba(184,146,42,0.06)", color:T.muted, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
//               <X size={16}/>
//             </button>

//             <div style={{ display:"inline-flex", alignItems:"center", gap:7, marginBottom:16, padding:"4px 14px", border:"1px solid rgba(212,168,67,0.3)", borderRadius:100, background:"rgba(212,168,67,0.08)" }}>
//               <Sparkles size={10} style={{ color:"#d4a843" }}/>
//               <span style={{ fontSize:10, fontWeight:700, letterSpacing:"0.16em", textTransform:"uppercase", color:"#d4a843" }}>{editingReview ? "Edit Review" : "New Review"}</span>
//             </div>
//             <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, fontWeight:700, color:T.text, marginBottom:24, lineHeight:1 }}>
//               {editingReview ? "Update your review ✏️" : "Share your experience ✍️"}
//             </h2>

//             <div style={{ display:"flex", flexDirection:"column", gap:18 }}>

//               {/* Restaurant select — FIX: uses array, handles both Name variants */}
//               <div>
//                 <label style={{ display:"block", fontSize:11, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:T.mutedWarm, marginBottom:8 }}>🏪 Restaurant *</label>
//                 {restError && (
//                   <p style={{ fontSize:12, color:T.red, marginBottom:8, padding:"6px 10px", borderRadius:8, background:"rgba(217,79,79,0.07)", border:"1px solid rgba(217,79,79,0.2)" }}>
//                     ⚠️ {restError} — <button onClick={loadRestaurants} style={{ background:"none", border:"none", color:T.gold, cursor:"pointer", fontWeight:700, fontSize:12 }}>Retry</button>
//                   </p>
//                 )}
//                 <select
//                   value={reviewForm.restaurantID}
//                   onChange={e=>setReviewForm({...reviewForm, restaurantID:e.target.value})}
//                   disabled={!!editingReview}
//                   style={{ width:"100%", padding:"11px 16px", borderRadius:12, border:"1.5px solid rgba(184,146,42,0.25)", background:"#ffffff", color: reviewForm.restaurantID ? T.text : T.mutedWarm, fontSize:13, fontWeight:600, fontFamily:"'Jost',sans-serif", cursor:"pointer", outline:"none" }}
//                 >
//                   <option value="">
//                     {restaurants.length === 0 ? "Loading restaurants…" : "Select a restaurant…"}
//                   </option>
//                   {restaurants.map(r => (
//                     <option key={getRestId(r)} value={getRestId(r)}>
//                       {getRestName(r)}
//                     </option>
//                   ))}
//                 </select>
//                 {restaurants.length > 0 && (
//                   <p style={{ fontSize:10, color:T.mutedWarm, marginTop:4 }}>
//                     {restaurants.length} restaurant{restaurants.length!==1?"s":""} available
//                   </p>
//                 )}
//               </div>

//               {/* Rating */}
//               <div>
//                 <label style={{ display:"block", fontSize:11, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:T.mutedWarm, marginBottom:10 }}>⭐ Rating *</label>
//                 <div style={{ display:"flex", gap:8, alignItems:"center" }}>
//                   {[1,2,3,4,5].map(star=>(
//                     <button key={star} className={`star-btn ${star<=reviewForm.rating?"star-active":""}`}
//                       onClick={()=>setReviewForm({...reviewForm, rating:star})}
//                       style={{ background:"none", border:"none", cursor:"pointer", padding:0 }}>
//                       <Star size={34} style={{ color:star<=reviewForm.rating?"#d4a843":"rgba(184,146,42,0.2)", fill:star<=reviewForm.rating?"#d4a843":"transparent", transition:"all 0.18s" }}/>
//                     </button>
//                   ))}
//                   <span style={{ fontSize:13, color:T.mutedWarm, marginLeft:4 }}>
//                     {["","Poor","Fair","Good","Great","Excellent!"][reviewForm.rating]}
//                   </span>
//                 </div>
//               </div>

//               {/* Comment */}
//               <div>
//                 <label style={{ display:"block", fontSize:11, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:T.mutedWarm, marginBottom:8 }}>💬 Comment</label>
//                 <textarea value={reviewForm.comment} onChange={e=>setReviewForm({...reviewForm, comment:e.target.value})} rows={4}
//                   placeholder="Describe your experience…"
//                   style={{ width:"100%", padding:"12px 16px", borderRadius:12, border:"1.5px solid rgba(184,146,42,0.22)", background:"#ffffff", color:T.text, fontSize:13, fontFamily:"'Jost',sans-serif", resize:"none", outline:"none", lineHeight:1.6, boxSizing:"border-box" }}/>
//               </div>

//               {/* Submit */}
//               <button className="gold-btn" onClick={handleSubmitReview}
//                 style={{ width:"100%", padding:13, borderRadius:14, border:"none", background:`linear-gradient(135deg,${T.gold},#a8721e)`, color:"#1a0c00", fontWeight:700, fontSize:14, fontFamily:"'Jost',sans-serif", letterSpacing:"0.06em", display:"flex", alignItems:"center", justifyContent:"center", gap:8, boxShadow:`0 6px 24px ${T.goldGlow}` }}>
//                 <Save size={16}/>
//                 {editingReview ? "Update Review" : "Submit Review"} ✨
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Profile;



import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  User, Mail, Phone, Star, X, Save,
  Plus, Edit2, Trash2, ShoppingCart, Minus,
  Crown, MessageSquare, BarChart3, Store,
} from "lucide-react";

const USER_API   = "https://localhost:7217/api/User";
const REVIEW_API = "https://localhost:7217/api/Review";
const REST_API   = "https://localhost:7217/api/Restaurant";

const authHeaders = () => {
  const token = localStorage.getItem("token") || localStorage.getItem("authToken") || localStorage.getItem("jwtToken");
  return { "Content-Type":"application/json", ...(token ? { Authorization:`Bearer ${token}` } : {}) };
};

/* ─── CSS ────────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,700;1,900&family=Nunito:wght@300;400;600;700;800;900&display=swap');

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

html,body {
  background: var(--bg);
  background-image: radial-gradient(circle, rgba(232,67,28,0.05) 1px, transparent 1px);
  background-size: 26px 26px;
  font-family: var(--font-b);
  color: var(--ink);
}

@keyframes spin      { to { transform:rotate(360deg); } }
@keyframes fadeUp    { from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);} }
@keyframes fadeIn    { from{opacity:0;}to{opacity:1;} }
@keyframes popIn     { from{opacity:0;transform:scale(0.94);}to{opacity:1;transform:scale(1);} }
@keyframes pulse-av  { 0%,100%{box-shadow:0 0 0 4px rgba(232,67,28,0.15),0 0 40px rgba(232,67,28,0.10);}50%{box-shadow:0 0 0 6px rgba(232,67,28,0.28),0 0 60px rgba(232,67,28,0.22);} }
@keyframes starPop   { 0%{transform:scale(0.6);}60%{transform:scale(1.3);}100%{transform:scale(1);} }
@keyframes pulse-dot { 0%,100%{transform:scale(1);opacity:.9}50%{transform:scale(1.8);opacity:0} }

/* scrollbar */
::-webkit-scrollbar { width:4px; }
::-webkit-scrollbar-track { background:var(--bg); }
::-webkit-scrollbar-thumb { background:var(--saffron); border-radius:4px; }

/* ── SPLASH ── */
.pf-splash {
  min-height:70vh; display:flex; flex-direction:column;
  align-items:center; justify-content:center; gap:18px;
}
.pf-ring {
  width:52px; height:52px; border-radius:50%;
  border:3px solid rgba(232,67,28,0.14);
  border-top-color:var(--red);
  animation:spin 0.82s linear infinite;
}
.pf-splash p {
  font-family:var(--font-b); font-size:11px; font-weight:600;
  color:var(--ink-mt); letter-spacing:0.2em; text-transform:uppercase;
}

/* ── HERO ── */
.pf-hero {
  position:relative; overflow:hidden;
  background:linear-gradient(140deg,#1a0800 0%,#2e1004 55%,#1a0800 100%);
  padding:52px 64px 60px;
}
.pf-hero-orb { position:absolute; border-radius:50%; pointer-events:none; }
.pf-hero-label {
  display:inline-flex; align-items:center; gap:8px;
  background:rgba(240,144,16,0.18); border:1px solid rgba(240,144,16,0.32);
  border-radius:100px; padding:6px 20px; margin-bottom:22px;
  font-family:var(--font-b); font-size:11px; font-weight:800;
  color:#ffe0a0; letter-spacing:0.14em; text-transform:uppercase;
}
.pf-hero-inner {
  max-width:1340px; margin:0 auto;
  display:flex; align-items:center; gap:48px; flex-wrap:wrap;
  position:relative; z-index:1;
}
.pf-avatar-ring {
  width:110px; height:110px; border-radius:50%; flex-shrink:0;
  background:var(--grad); display:flex; align-items:center; justify-content:center;
  box-shadow:0 6px 28px var(--glow);
  animation:pulse-av 3s ease-in-out infinite;
  position:relative;
}
.pf-avatar-ring span {
  font-family:var(--font-d); font-size:36px; font-weight:900; color:#fff;
}
.pf-avatar-badge {
  position:absolute; bottom:-4px; right:-4px;
  width:30px; height:30px; border-radius:50%;
  background:var(--grad); border:2.5px solid #1a0800;
  display:flex; align-items:center; justify-content:center;
}
.pf-hero-text { flex:1; min-width:240px; }
.pf-hero h1 {
  font-family:var(--font-d); font-style:italic;
  font-size:clamp(2rem,4.5vw,3.8rem); font-weight:900;
  color:#fff; line-height:1.05; margin-bottom:14px;
  letter-spacing:-0.02em; text-shadow:0 4px 40px rgba(0,0,0,0.5);
}
.pf-hero h1 em {
  font-style:italic;
  background:linear-gradient(135deg,#f09010,#ff8c42);
  -webkit-background-clip:text; -webkit-text-fill-color:transparent;
}
.pf-hero-chips { display:flex; gap:10px; flex-wrap:wrap; }
.pf-hero-chip {
  display:inline-flex; align-items:center; gap:7px;
  padding:7px 15px; border-radius:10px;
  border:1px solid rgba(255,255,255,0.10);
  background:rgba(255,255,255,0.06);
  font-family:var(--font-b); font-size:12px; font-weight:600;
  color:rgba(245,234,208,0.75);
}

/* ── PROMO STRIP ── */
.pf-strip {
  background:var(--grad); padding:11px 64px;
  display:flex; align-items:center; gap:40px; overflow-x:auto;
  scrollbar-width:none;
}
.pf-strip::-webkit-scrollbar { display:none; }
.pf-strip-item { display:flex; align-items:center; gap:10px; flex-shrink:0; }
.pf-strip-item strong { font-family:var(--font-b); font-size:12px; font-weight:800; color:#fff; letter-spacing:0.08em; }
.pf-strip-div { width:1px; height:14px; background:rgba(255,255,255,0.28); }
.pf-strip-item span { font-family:var(--font-b); font-size:12px; color:rgba(255,255,255,0.78); }

/* ── PAGE BODY ── */
.pf-body {
  max-width:1340px; margin:0 auto;
  padding:44px 64px 100px;
  display:grid;
  grid-template-columns:320px 1fr;
  gap:28px;
  align-items:start;
}

/* ── CARD ── */
.pf-card {
  background:var(--card); border-radius:22px;
  border:1px solid var(--border);
  box-shadow:0 2px 16px rgba(232,67,28,0.06);
  overflow:hidden;
  animation:fadeUp 0.45s ease both;
}
.pf-card-accent { height:4px; background:var(--grad); width:100%; }
.pf-card-body { padding:24px 26px; }

/* ── CARD TITLES ── */
.pf-card-title {
  font-family:var(--font-d); font-style:italic;
  font-size:20px; font-weight:700; color:var(--ink); margin-bottom:20px;
  display:flex; align-items:center; gap:10px;
}
.pf-card-title-icon {
  width:36px; height:36px; border-radius:11px;
  background:var(--grad); display:flex; align-items:center; justify-content:center;
  box-shadow:0 3px 12px var(--glow); flex-shrink:0;
}

/* ── STAT GRID (2-col) ── */
.pf-stat-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:18px; }
.pf-stat-box {
  padding:14px 12px; border-radius:14px;
  background:var(--pill); border:1px solid var(--border); text-align:center;
}
.pf-stat-val {
  font-family:var(--font-d); font-size:26px; font-weight:900;
  color:var(--red); line-height:1; display:block; margin-bottom:4px;
}
.pf-stat-lbl {
  font-family:var(--font-b); font-size:10px; font-weight:700;
  color:var(--ink-mt); text-transform:uppercase; letter-spacing:0.10em;
}

/* ── STAT ROWS ── */
.pf-stat-row {
  display:flex; align-items:center; justify-content:space-between;
  padding:11px 14px; border-radius:12px;
  background:var(--pill); border:1px solid var(--border);
  margin-bottom:8px;
}
.pf-stat-row:last-child { margin-bottom:0; }
.pf-stat-row-lbl {
  display:flex; align-items:center; gap:9px;
  font-family:var(--font-b); font-size:13px; font-weight:600; color:var(--ink-md);
}
.pf-stat-row-val {
  font-family:var(--font-d); font-weight:900; font-size:18px; color:var(--red);
}

/* ── VIEW CART BTN ── */
.pf-view-cart {
  width:100%; padding:13px; border-radius:14px; border:none;
  background:var(--grad); color:#fff;
  font-family:var(--font-b); font-size:14px; font-weight:800;
  cursor:pointer; display:flex; align-items:center;
  justify-content:center; gap:8px; letter-spacing:0.04em;
  box-shadow:0 6px 20px var(--glow);
  transition:filter 0.15s, transform 0.15s;
}
.pf-view-cart:hover { filter:brightness(1.1); transform:translateY(-2px); }

/* ── CART ITEM ROW ── */
.pf-ci-row {
  display:flex; align-items:center; gap:14px;
  padding:13px 16px; border-radius:16px;
  border:1px solid var(--border); background:var(--pill);
  margin-bottom:10px;
  transition:box-shadow 0.2s;
}
.pf-ci-row:hover { box-shadow:0 4px 18px rgba(232,67,28,0.08); }
.pf-ci-row:last-child { margin-bottom:0; }
.pf-ci-img {
  width:56px; height:56px; border-radius:13px;
  overflow:hidden; flex-shrink:0; background:#ffe8d4;
  display:flex; align-items:center; justify-content:center;
  font-size:24px; border:1px solid var(--border);
}
.pf-ci-img img { width:100%; height:100%; object-fit:cover; }
.pf-ci-name {
  font-family:var(--font-d); font-size:16px; font-weight:700;
  color:var(--ink); margin-bottom:3px;
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
}
.pf-ci-rest {
  font-family:var(--font-b); font-size:11px; font-weight:600; color:var(--ink-mt);
}
.pf-ci-price {
  font-family:var(--font-d); font-size:15px; font-weight:900; color:var(--ink-md);
  flex-shrink:0;
}
.pf-qty-wrap {
  display:flex; align-items:center; gap:0;
  border:2px solid var(--red); border-radius:11px; overflow:hidden; flex-shrink:0;
}
.pf-qty-btn {
  width:32px; height:32px; border:none;
  background:var(--grad); color:#fff; cursor:pointer;
  display:flex; align-items:center; justify-content:center;
  transition:filter 0.15s;
}
.pf-qty-btn:hover { filter:brightness(1.12); }
.pf-qty-num {
  width:30px; text-align:center;
  font-family:var(--font-d); font-weight:900; font-size:16px; color:var(--red);
}
.pf-ci-total {
  font-family:var(--font-d); font-weight:900; font-size:16px; color:var(--ink);
  min-width:52px; text-align:right; flex-shrink:0;
}
.pf-del-btn {
  width:32px; height:32px; border-radius:10px;
  border:1.5px solid rgba(239,68,68,0.25);
  background:rgba(239,68,68,0.06);
  color:#dc2626; cursor:pointer;
  display:flex; align-items:center; justify-content:center;
  flex-shrink:0; transition:all 0.15s;
}
.pf-del-btn:hover { background:#ef4444; color:#fff; border-color:#ef4444; }

/* ── CART TOTAL BAR ── */
.pf-cart-total-bar {
  display:flex; align-items:center; justify-content:space-between;
  padding:14px 18px; border-radius:14px;
  background:var(--pill); border:1.5px dashed var(--border);
  margin-bottom:14px;
}
.pf-cart-total-lbl { font-family:var(--font-b); font-size:14px; font-weight:700; color:var(--ink-md); }
.pf-cart-total-val { font-family:var(--font-d); font-size:22px; font-weight:900; color:var(--red); }

/* cart action btns */
.pf-cart-actions { display:flex; gap:10px; }
.pf-cart-sec-btn {
  flex:1; padding:12px; border-radius:13px;
  border:1.5px solid var(--border); background:transparent;
  font-family:var(--font-b); font-size:13px; font-weight:700;
  color:var(--ink-md); cursor:pointer; transition:all 0.15s;
}
.pf-cart-sec-btn:hover { background:var(--pill); border-color:var(--saffron); color:var(--red); }
.pf-cart-pri-btn {
  flex:1; padding:12px; border-radius:13px; border:none;
  background:var(--grad); color:#fff;
  font-family:var(--font-b); font-size:13px; font-weight:800;
  cursor:pointer; display:flex; align-items:center; justify-content:center; gap:7px;
  box-shadow:0 4px 16px var(--glow); transition:filter 0.15s, transform 0.15s;
}
.pf-cart-pri-btn:hover { filter:brightness(1.1); transform:translateY(-1px); }

/* ── SECTION HEADING ── */
.pf-sec-eyebrow {
  font-family:var(--font-b); font-size:11px; font-weight:800;
  color:var(--red); letter-spacing:0.20em; text-transform:uppercase; margin-bottom:7px;
}
.pf-sec-title {
  font-family:var(--font-d); font-style:italic;
  font-size:clamp(1.6rem,2.8vw,2.4rem); font-weight:900;
  color:var(--ink); letter-spacing:-0.015em; line-height:1.05; margin-bottom:10px;
}
.pf-sec-rule {
  display:flex; gap:4px; align-items:center; margin-bottom:24px;
}
.pf-sec-rule div:nth-child(1) { height:3px; width:52px; border-radius:100px; background:var(--grad); }
.pf-sec-rule div:nth-child(2) { height:3px; width:18px; border-radius:100px; background:rgba(232,67,28,0.2); }
.pf-sec-rule div:nth-child(3) { height:3px; width:8px;  border-radius:100px; background:rgba(232,67,28,0.1); }

/* ── REVIEWS HEADER ── */
.pf-reviews-head {
  display:flex; align-items:center; justify-content:space-between;
  margin-bottom:6px;
}
.pf-write-btn {
  display:flex; align-items:center; gap:8px;
  padding:11px 22px; border-radius:13px; border:none;
  background:var(--grad); color:#fff;
  font-family:var(--font-b); font-size:13px; font-weight:800;
  cursor:pointer; letter-spacing:0.04em;
  box-shadow:0 4px 16px var(--glow);
  transition:filter 0.15s, transform 0.15s;
}
.pf-write-btn:hover { filter:brightness(1.1); transform:translateY(-2px); }

/* ── REVIEW CARD ── */
.pf-review {
  padding:20px 22px; border-radius:18px;
  border:1px solid var(--border); background:var(--card);
  margin-bottom:14px;
  transition:transform 0.28s cubic-bezier(0.22,1,0.36,1), box-shadow 0.28s;
}
.pf-review:last-child { margin-bottom:0; }
.pf-review:hover {
  transform:translateY(-4px);
  box-shadow:0 14px 44px rgba(232,67,28,0.10), 0 0 0 1.5px rgba(232,67,28,0.15);
}
.pf-review-head {
  display:flex; align-items:flex-start; justify-content:space-between;
  margin-bottom:12px;
}
.pf-review-rest {
  font-family:var(--font-d); font-size:18px; font-weight:700;
  color:var(--ink); margin-bottom:7px; display:flex; align-items:center; gap:8px;
}
.pf-star-row { display:flex; gap:4px; }
.pf-star { transition:all 0.15s; }
.pf-review-actions { display:flex; gap:8px; flex-shrink:0; }
.pf-edit-btn {
  width:34px; height:34px; border-radius:10px;
  border:1.5px solid var(--border); background:var(--pill);
  color:var(--red); cursor:pointer;
  display:flex; align-items:center; justify-content:center;
  transition:all 0.15s;
}
.pf-edit-btn:hover { background:var(--red); color:#fff; border-color:var(--red); }
.pf-review-comment {
  font-family:var(--font-b); font-size:13px; color:var(--ink-md);
  line-height:1.7; font-style:italic;
  border-left:3px solid var(--border);
  padding-left:14px; margin-bottom:10px;
}
.pf-review-date {
  font-family:var(--font-b); font-size:11px; font-weight:600;
  color:var(--ink-mt); letter-spacing:0.04em;
}

/* ── EMPTY STATES ── */
.pf-empty {
  text-align:center; padding:52px 20px;
}
.pf-empty-emoji { font-size:48px; margin-bottom:14px; }
.pf-empty-title {
  font-family:var(--font-d); font-style:italic;
  font-size:20px; font-weight:700; color:var(--ink); margin-bottom:6px;
}
.pf-empty-sub { font-family:var(--font-b); font-size:13px; color:var(--ink-mt); }

/* ── MODAL ── */
.pf-modal-bg {
  position:fixed; inset:0; z-index:1000;
  background:rgba(26,12,0,0.60); backdrop-filter:blur(7px);
  display:flex; align-items:center; justify-content:center;
  padding:20px; animation:fadeIn 0.22s ease;
}
.pf-modal {
  background:var(--card); border-radius:24px;
  border:1px solid var(--border);
  width:100%; max-width:500px;
  box-shadow:0 28px 70px rgba(26,12,0,0.28);
  animation:popIn 0.26s cubic-bezier(0.22,1,0.36,1);
  overflow:hidden;
}
.pf-modal-accent { height:5px; background:var(--grad); }
.pf-modal-inner { padding:28px 32px 32px; }
.pf-modal-head {
  display:flex; align-items:flex-start; justify-content:space-between;
  margin-bottom:24px;
}
.pf-modal-label {
  display:inline-flex; align-items:center; gap:7px;
  background:var(--pill); border:1px solid var(--border);
  border-radius:100px; padding:5px 16px; margin-bottom:10px;
  font-family:var(--font-b); font-size:10px; font-weight:800;
  color:var(--red); letter-spacing:0.14em; text-transform:uppercase;
}
.pf-modal-title {
  font-family:var(--font-d); font-style:italic;
  font-size:26px; font-weight:900; color:var(--ink); line-height:1.05;
}
.pf-modal-close {
  width:34px; height:34px; border-radius:50%; flex-shrink:0;
  border:1.5px solid var(--border); background:var(--pill);
  color:var(--ink-mt); cursor:pointer;
  display:flex; align-items:center; justify-content:center;
  transition:all 0.15s; margin-left:12px; margin-top:4px;
}
.pf-modal-close:hover { background:var(--red); color:#fff; border-color:var(--red); }

/* form fields */
.pf-field { margin-bottom:20px; }
.pf-field label {
  display:block; font-family:var(--font-b); font-size:11px; font-weight:800;
  color:var(--ink-mt); letter-spacing:0.14em; text-transform:uppercase;
  margin-bottom:9px;
}
.pf-select, .pf-textarea {
  width:100%; border:1.5px solid var(--border);
  border-radius:13px; background:var(--pill);
  font-family:var(--font-b); font-size:14px; font-weight:500;
  color:var(--ink); outline:none;
  transition:border-color 0.2s, box-shadow 0.2s;
}
.pf-select  { padding:12px 16px; appearance:none; cursor:pointer; }
.pf-textarea { padding:12px 16px; resize:none; line-height:1.65; }
.pf-select:focus, .pf-textarea:focus {
  border-color:var(--red); background:#fff;
  box-shadow:0 0 0 3px rgba(232,67,28,0.08);
}
.pf-select::placeholder, .pf-textarea::placeholder { color:var(--ink-mt); }

.pf-stars-row { display:flex; gap:10px; align-items:center; }
.pf-star-btn  { background:none; border:none; cursor:pointer; padding:0; transition:transform 0.15s; }
.pf-star-btn:hover { transform:scale(1.2); }
.pf-star-hint { font-family:var(--font-b); font-size:13px; font-weight:700; color:var(--ink-mt); margin-left:4px; }

.pf-submit-btn {
  width:100%; padding:15px; border-radius:15px; border:none;
  background:var(--grad); color:#fff;
  font-family:var(--font-b); font-size:15px; font-weight:800;
  cursor:pointer; display:flex; align-items:center;
  justify-content:center; gap:9px; letter-spacing:0.04em;
  box-shadow:0 8px 26px var(--glow);
  transition:filter 0.15s, transform 0.15s;
}
.pf-submit-btn:hover { filter:brightness(1.1); transform:translateY(-2px); }

/* responsive */
@media(max-width:1024px) {
  .pf-body { grid-template-columns:1fr; padding:32px 28px 80px; }
  .pf-hero { padding:40px 28px 48px; }
  .pf-strip { padding:11px 28px; }
}
@media(max-width:640px) {
  .pf-hero { padding:32px 20px 40px; }
  .pf-body { padding:24px 16px 80px; }
  .pf-modal-inner { padding:22px 20px 26px; }
  .pf-strip { padding:11px 16px; }
}
`;

/* ─── StarRow ────────────────────────────────────────────── */
const StarRow = ({ rating, size = 16 }) => (
  <div className="pf-star-row">
    {[1,2,3,4,5].map(s => (
      <Star key={s} size={size} className="pf-star"
        style={{ color: s<=rating ? "#f59e0b" : "rgba(232,67,28,0.18)",
                 fill:  s<=rating ? "#f59e0b" : "transparent" }} />
    ))}
  </div>
);

/* ─── Main Component ─────────────────────────────────────── */
const Profile = () => {
  const [user,          setUser]          = useState(null);
  const [reviews,       setReviews]       = useState([]);
  const [restaurants,   setRestaurants]   = useState([]);
  const [cart,          setCart]          = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [showModal,     setShowModal]     = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [reviewForm,    setReviewForm]    = useState({ restaurantID:"", rating:5, comment:"" });
  const [restError,     setRestError]     = useState("");

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    loadProfile(); loadReviews(); loadRestaurants(); loadCart();
    const rId = searchParams.get("review");
    const rid = searchParams.get("restaurant");
    if (rId && rid) { setReviewForm({ restaurantID:rid, rating:5, comment:"" }); setShowModal(true); }
  }, []);

  const loadProfile = async () => {
    try {
      const uid = localStorage.getItem("customerId") || localStorage.getItem("userId");
      if (!uid) { navigate("/customer/login"); return; }
      const res = await fetch(`${USER_API}/${uid}`, { headers: authHeaders() });
      if (res.ok) setUser(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const loadReviews = async () => {
    try {
      const res = await fetch(`${REVIEW_API}/my-reviews`, { headers: authHeaders() });
      if (res.ok) setReviews(await res.json());
    } catch (e) { console.error(e); }
  };

  const loadRestaurants = async () => {
    try {
      setRestError("");
      const res = await fetch(REST_API, { headers: authHeaders() });
      if (res.ok) setRestaurants(await res.json());
      else setRestError(`Failed to load restaurants (${res.status})`);
    } catch (e) { setRestError("Network error loading restaurants"); }
  };

  const getRestName = r => r?.name || r?.Name || r?.restaurantName || r?.RestaurantName || "Unknown";
  const getRestId   = r => r?.restaurantID ?? r?.RestaurantID ?? r?.id ?? r?.ID;
  const findRest    = id => restaurants.find(r => getRestId(r) === id || getRestId(r) === Number(id));

  const loadCart = () => {
    try { const s = localStorage.getItem("cart"); if (s) setCart(JSON.parse(s)); }
    catch { setCart([]); }
  };

  const updateQty = (id, delta) => {
    const u = cart.map(i => i.menuItemID===id
      ? (i.quantity+delta<=0 ? null : { ...i, quantity:i.quantity+delta })
      : i).filter(Boolean);
    setCart(u); localStorage.setItem("cart", JSON.stringify(u));
  };

  const removeItem = id => {
    const u = cart.filter(i => i.menuItemID!==id);
    setCart(u); localStorage.setItem("cart", JSON.stringify(u));
  };

  const cartTotal = () => cart.reduce((s,i) => s + i.menuItemPrice * i.quantity, 0);
  const cartQty   = () => cart.reduce((s,i) => s + i.quantity, 0);

  const handleSubmit = async () => {
    if (!reviewForm.restaurantID) return alert("Please select a restaurant");
    try {
      const url    = editingReview ? `${REVIEW_API}/${editingReview.reviewID}` : REVIEW_API;
      const method = editingReview ? "PUT" : "POST";
      const res = await fetch(url, {
        method, headers: authHeaders(),
        body: JSON.stringify({ restaurantID:parseInt(reviewForm.restaurantID), rating:reviewForm.rating, comment:reviewForm.comment }),
      });
      if (res.ok) {
        setShowModal(false); setReviewForm({ restaurantID:"", rating:5, comment:"" }); setEditingReview(null);
        loadReviews();
      } else { const e = await res.json().catch(()=>{}); alert("Failed: " + (e?.message || res.status)); }
    } catch (e) { alert("Error: " + e.message); }
  };

  const openEdit = rev => {
    setEditingReview(rev);
    setReviewForm({
      restaurantID: (rev.restaurantID ?? rev.RestaurantID)?.toString() || "",
      rating: rev.rating ?? rev.Rating ?? 5,
      comment: rev.comment ?? rev.Comment ?? "",
    });
    setShowModal(true);
  };

  const deleteReview = async id => {
    if (!window.confirm("Delete this review?")) return;
    const res = await fetch(`${REVIEW_API}/${id}`, { method:"DELETE", headers:authHeaders() });
    if (res.ok) loadReviews(); else alert("Failed: " + res.status);
  };

  const closeModal = () => { setShowModal(false); setEditingReview(null); setReviewForm({ restaurantID:"", rating:5, comment:"" }); };

  const displayName = user?.userName ?? user?.UserName ?? "Guest";
  const initials    = displayName.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2) || "G";

  /* ── LOADING ── */
  if (loading) return (
    <div className="pf-splash">
      <style>{CSS}</style>
      <div className="pf-ring"/>
      <p>Loading your profile…</p>
    </div>
  );

  /* ── RENDER ── */
  return (
    <div style={{ minHeight:"100vh" }}>
      <style>{CSS}</style>

      {/* ══ HERO ══════════════════════════════════════════ */}
      <div className="pf-hero">
        <div className="pf-hero-orb" style={{ width:500,height:500,top:-220,right:-80,background:"radial-gradient(circle,rgba(232,67,28,0.11) 0%,transparent 70%)" }}/>
        <div className="pf-hero-orb" style={{ width:320,height:320,bottom:-140,left:60,background:"radial-gradient(circle,rgba(240,144,16,0.09) 0%,transparent 70%)" }}/>

        <div className="pf-hero-inner">
          <div style={{ position:"relative", flexShrink:0 }}>
            <div className="pf-avatar-ring">
              <span>{initials}</span>
            </div>
            <div className="pf-avatar-badge">
              <Crown size={13} color="#fff"/>
            </div>
          </div>

          <div className="pf-hero-text">
            <div className="pf-hero-label">👤 Customer Profile</div>
            <h1>Welcome, <em>{displayName}</em></h1>
            <div className="pf-hero-chips">
              {user?.email && (
                <div className="pf-hero-chip">
                  <Mail size={13} style={{ color:"#f09010" }}/>
                  <span>{user.email}</span>
                </div>
              )}
              {user?.phone && (
                <div className="pf-hero-chip">
                  <Phone size={13} style={{ color:"#f09010" }}/>
                  <span>{user.phone}</span>
                </div>
              )}
              <div className="pf-hero-chip">
                <Star size={13} style={{ color:"#f09010" }}/>
                <span>{reviews.length} Review{reviews.length!==1?"s":""}</span>
              </div>
              <div className="pf-hero-chip">
                <ShoppingCart size={13} style={{ color:"#f09010" }}/>
                <span>{cartQty()} in cart</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══ PROMO STRIP ═══════════════════════════════════ */}
      {/* <div className="pf-strip">
        {[["⭐ YOUR REVIEWS","Share your dining experience"],["🛒 CART SUMMARY","View & manage your items"],["🏪 RESTAURANTS","Explore more places"]].map(([t,d])=>(
          <div key={t} className="pf-strip-item">
            <strong>{t}</strong>
            <div className="pf-strip-div"/>
            <span>{d}</span>
          </div>
        ))}
      </div> */}

      {/* ══ BODY ══════════════════════════════════════════ */}
      <div className="pf-body">

        {/* ── LEFT SIDEBAR ── */}
        <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

          {/* Cart Summary Card */}
          <div className="pf-card" style={{ animationDelay:"0.05s" }}>
            <div className="pf-card-accent"/>
            <div className="pf-card-body">
              <div className="pf-card-title">
                <div className="pf-card-title-icon"><ShoppingCart size={17} color="#fff"/></div>
                Cart Summary
              </div>
              {cart.length === 0 ? (
                <div className="pf-empty" style={{ padding:"36px 0" }}>
                  <div className="pf-empty-emoji">🛍️</div>
                  <p className="pf-empty-title">Cart is empty</p>
                  <p className="pf-empty-sub">Add items to get started</p>
                </div>
              ) : (
                <>
                  <div className="pf-stat-grid">
                    <div className="pf-stat-box">
                      <span className="pf-stat-val">{cartQty()}</span>
                      <span className="pf-stat-lbl">Items</span>
                    </div>
                    <div className="pf-stat-box">
                      <span className="pf-stat-val">₹{cartTotal().toFixed(0)}</span>
                      <span className="pf-stat-lbl">Total</span>
                    </div>
                  </div>
                  <button className="pf-view-cart" onClick={() => navigate("/customer/cart")}>
                    <ShoppingCart size={16}/> View Cart →
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Stats Card */}
          <div className="pf-card" style={{ animationDelay:"0.10s" }}>
            <div className="pf-card-accent"/>
            <div className="pf-card-body">
              <div className="pf-card-title">
                <div className="pf-card-title-icon"><BarChart3 size={17} color="#fff"/></div>
                Your Stats
              </div>
              {[
                { icon:"⭐", label:"Total Reviews",     val: reviews.length },
                { icon:"🛒", label:"Cart Items",        val: cartQty() },
                { icon:"💰", label:"Cart Value",        val: `₹${cartTotal().toFixed(0)}` },
                { icon:"🏪", label:"Restaurants Rated", val: [...new Set(reviews.map(r=>r.restaurantID??r.RestaurantID))].length },
              ].map(({ icon, label, val }) => (
                <div key={label} className="pf-stat-row">
                  <span className="pf-stat-row-lbl"><span style={{ fontSize:15 }}>{icon}</span>{label}</span>
                  <span className="pf-stat-row-val">{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div style={{ display:"flex", flexDirection:"column", gap:24 }}>

          {/* Cart Items (if any) */}
          {cart.length > 0 && (
            <div className="pf-card" style={{ animationDelay:"0.08s" }}>
              <div className="pf-card-accent"/>
              <div className="pf-card-body">
                <div className="pf-card-title">
                  <div className="pf-card-title-icon"><ShoppingCart size={17} color="#fff"/></div>
                  Cart Items
                  <span style={{ fontFamily:"var(--font-b)", fontSize:13, fontWeight:700, color:"var(--ink-mt)", marginLeft:4 }}>({cart.length})</span>
                </div>

                {cart.map(item => (
                  <div key={item.menuItemID} className="pf-ci-row">
                    <div className="pf-ci-img">
                      {item.imageUrl
                        ? <img src={item.imageUrl} alt={item.menuItemName}/>
                        : <span>🍽</span>}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p className="pf-ci-name">{item.menuItemName}</p>
                      <p className="pf-ci-rest">{item.restaurantName}</p>
                    </div>
                    <span className="pf-ci-price">₹{item.menuItemPrice}</span>
                    <div className="pf-qty-wrap">
                      <button className="pf-qty-btn" onClick={()=>updateQty(item.menuItemID,-1)}><Minus size={13}/></button>
                      <span className="pf-qty-num">{item.quantity}</span>
                      <button className="pf-qty-btn" onClick={()=>updateQty(item.menuItemID,1)}><Plus size={13}/></button>
                    </div>
                    <span className="pf-ci-total">₹{(item.menuItemPrice*item.quantity).toFixed(0)}</span>
                    <button className="pf-del-btn" onClick={()=>removeItem(item.menuItemID)}><Trash2 size={13}/></button>
                  </div>
                ))}

                <div style={{ height:1, background:"var(--border)", margin:"16px 0" }}/>
                <div className="pf-cart-total-bar">
                  <span className="pf-cart-total-lbl">Grand Total</span>
                  <span className="pf-cart-total-val">₹{cartTotal().toFixed(0)}</span>
                </div>
                <div className="pf-cart-actions">
                  <button className="pf-cart-sec-btn" onClick={()=>navigate("/customer/all-items")}>
                    ← Keep Shopping
                  </button>
                  <button className="pf-cart-pri-btn" onClick={()=>navigate("/customer/checkout")}>
                    <ShoppingCart size={15}/> Checkout
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Reviews */}
          <div className="pf-card" style={{ animationDelay:"0.14s" }}>
            <div className="pf-card-accent"/>
            <div className="pf-card-body">
              <div className="pf-reviews-head">
                <div>
                  <p className="pf-sec-eyebrow">⭐ Reviews</p>
                  <h2 className="pf-sec-title">My Reviews</h2>
                </div>
                <button className="pf-write-btn"
                  onClick={()=>{ setEditingReview(null); setReviewForm({restaurantID:"",rating:5,comment:""}); setShowModal(true); }}>
                  <Plus size={15}/> Write Review
                </button>
              </div>
              <div className="pf-sec-rule"><div/><div/><div/></div>

              {reviews.length === 0 ? (
                <div className="pf-empty">
                  <div className="pf-empty-emoji">✍️</div>
                  <p className="pf-empty-title">No reviews yet</p>
                  <p className="pf-empty-sub">Share your dining experience with the world 🌍</p>
                </div>
              ) : (
                <div>
                  {reviews.map((rev, idx) => {
                    const restId   = rev.restaurantID ?? rev.RestaurantID;
                    const rest     = findRest(restId);
                    const restName = rev.restaurantName ?? rev.RestaurantName ?? getRestName(rest) ?? "Restaurant";
                    return (
                      <div key={rev.reviewID ?? rev.ReviewID} className="pf-review"
                        style={{ animationDelay:`${idx*0.06}s` }}>
                        <div className="pf-review-head">
                          <div>
                            <div className="pf-review-rest">
                              <span style={{ fontSize:16 }}>🏪</span>
                              {restName}
                            </div>
                            <StarRow rating={rev.rating ?? rev.Rating ?? 0}/>
                          </div>
                          <div className="pf-review-actions">
                            <button className="pf-edit-btn" onClick={()=>openEdit(rev)}><Edit2 size={14}/></button>
                            <button className="pf-del-btn" onClick={()=>deleteReview(rev.reviewID ?? rev.ReviewID)}><Trash2 size={14}/></button>
                          </div>
                        </div>
                        {(rev.comment ?? rev.Comment) && (
                          <p className="pf-review-comment">"{rev.comment ?? rev.Comment}"</p>
                        )}
                        <p className="pf-review-date">
                          📅 {new Date(rev.createdAt || rev.CreatedAt).toLocaleDateString("en-IN",{ day:"numeric", month:"short", year:"numeric" })}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ══ REVIEW MODAL ═══════════════════════════════════ */}
      {showModal && (
        <div className="pf-modal-bg" onClick={e => { if(e.target.classList.contains("pf-modal-bg")) closeModal(); }}>
          <div className="pf-modal">
            <div className="pf-modal-accent"/>
            <div className="pf-modal-inner">
              <div className="pf-modal-head">
                <div>
                  <div className="pf-modal-label">✍️ {editingReview ? "Edit Review" : "New Review"}</div>
                  <h2 className="pf-modal-title">
                    {editingReview ? "Update your review" : "Share your experience"}
                  </h2>
                </div>
                <button className="pf-modal-close" onClick={closeModal}><X size={16}/></button>
              </div>

              {/* Restaurant */}
              <div className="pf-field">
                <label>🏪 Restaurant *</label>
                {restError && (
                  <p style={{ fontSize:12, color:"#dc2626", marginBottom:8, padding:"8px 12px", borderRadius:10, background:"rgba(239,68,68,0.06)", border:"1px solid rgba(239,68,68,0.2)" }}>
                    ⚠️ {restError} —{" "}
                    <button onClick={loadRestaurants} style={{ background:"none", border:"none", color:"var(--red)", cursor:"pointer", fontWeight:800, fontSize:12 }}>Retry</button>
                  </p>
                )}
                <select className="pf-select"
                  value={reviewForm.restaurantID}
                  onChange={e => setReviewForm({...reviewForm, restaurantID:e.target.value})}
                  disabled={!!editingReview}>
                  <option value="">{restaurants.length===0 ? "Loading…" : "Select a restaurant…"}</option>
                  {restaurants.map(r=>(
                    <option key={getRestId(r)} value={getRestId(r)}>{getRestName(r)}</option>
                  ))}
                </select>
              </div>

              {/* Rating */}
              <div className="pf-field">
                <label>⭐ Rating *</label>
                <div className="pf-stars-row">
                  {[1,2,3,4,5].map(s=>(
                    <button key={s} className="pf-star-btn"
                      onClick={()=>setReviewForm({...reviewForm, rating:s})}>
                      <Star size={36}
                        style={{ color: s<=reviewForm.rating?"#f59e0b":"rgba(232,67,28,0.18)",
                                 fill:  s<=reviewForm.rating?"#f59e0b":"transparent" }}/>
                    </button>
                  ))}
                  <span className="pf-star-hint">
                    {["","Poor","Fair","Good","Great","Excellent!"][reviewForm.rating]}
                  </span>
                </div>
              </div>

              {/* Comment */}
              <div className="pf-field">
                <label>💬 Comment</label>
                <textarea className="pf-textarea" rows={4}
                  placeholder="Describe your experience…"
                  value={reviewForm.comment}
                  onChange={e=>setReviewForm({...reviewForm, comment:e.target.value})}/>
              </div>

              <button className="pf-submit-btn" onClick={handleSubmit}>
                <Save size={16}/>
                {editingReview ? "Update Review" : "Submit Review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;