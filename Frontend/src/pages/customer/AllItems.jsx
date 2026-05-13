// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   Search, ShoppingCart, Plus, Minus,
//   UtensilsCrossed, ClipboardList, ChevronDown, Sparkles,
// } from "lucide-react";
// import axiosInstance from "../../api/axiosInstance";
// import { useCart } from "../../contexts/CartContext";

// const T = {
//   bg:         "#f5f0e8",
//   surface:    "#ffffff",
//   glass:      "rgba(255,255,255,0.7)",
//   glassBorder:"rgba(201,168,76,0.25)",
//   gold:       "#b8922a",
//   goldLight:  "#d4a843",
//   goldGlow:   "rgba(184,146,42,0.25)",
//   goldGlow2:  "rgba(184,146,42,0.10)",
//   text:       "#2a1f10",
//   muted:      "#7a6a54",
//   mutedWarm:  "#9a8060",
//   card:       "#ffffff",
//   cardBorder: "rgba(184,146,42,0.22)",
//   red:        "#d94f4f",
//   green:      "#3a9e6e",
//   white:      "#ffffff",
// };

// const globalCSS = `
// @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Jost:wght@300;400;500;600;700&display=swap');
// *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
// body { background: #f5f0e8; }
// @keyframes spin    { to { transform: rotate(360deg); } }
// @keyframes fadeUp  { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
// @keyframes orb1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(60px,-40px) scale(1.15)} }
// @keyframes orb2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-50px,30px) scale(0.9)} }
// @keyframes pulse-glow {
//   0%,100% { box-shadow: 0 6px 24px rgba(201,168,76,0.25); }
//   50%      { box-shadow: 0 6px 36px rgba(201,168,76,0.55); }
// }
// .page-enter { animation: fadeUp 0.55s ease both; }
// .card-enter { animation: fadeUp 0.45s ease both; }
// .menu-card { transition: transform 0.32s cubic-bezier(.22,1,.36,1), box-shadow 0.32s ease !important; will-change: transform; }
// .menu-card:hover { transform: translateY(-10px) scale(1.015) !important; box-shadow: 0 24px 60px rgba(0,0,0,0.13), 0 0 0 1.5px rgba(184,146,42,0.35) !important; }
// .menu-card:hover .card-img { transform: scale(1.09) !important; }
// .add-btn:hover  { background: linear-gradient(135deg,#f0d880,#c09030) !important; transform:translateY(-2px); box-shadow: 0 10px 28px rgba(201,168,76,0.35) !important; }
// .add-btn:active { transform: scale(0.97) !important; }
// .qty-btn:hover  { background: linear-gradient(135deg,#f0d880,#c09030) !important; }
// .search-inp { transition: border-color 0.2s, box-shadow 0.2s; }
// .search-inp:focus { border-color: #b8922a !important; box-shadow: 0 0 0 3px rgba(184,146,42,0.15) !important; outline: none; }
// .search-inp::placeholder { color: #9a7a50; }
// .pill-btn { transition: all 0.18s ease !important; }
// .pill-btn:hover:not(.pill-active) { border-color: #c9a84c !important; color: #c9a84c !important; background: rgba(201,168,76,0.06) !important; }
// .sel-elem:focus { border-color: #c9a84c !important; outline: none; }
// .cart-btn:hover { border-color: #c9a84c !important; color: #c9a84c !important; transform: translateY(-1px); }
// .fab:hover { transform: translateY(-5px) scale(1.04) !important; box-shadow: 0 22px 52px rgba(201,168,76,0.45) !important; }
// .orb1 { animation: orb1 14s ease-in-out infinite; }
// .orb2 { animation: orb2 18s ease-in-out infinite; }
// select option { background: #ffffff; color: #2a1f10; }
// ::-webkit-scrollbar { width: 5px; }
// ::-webkit-scrollbar-track { background: #f5f0e8; }
// ::-webkit-scrollbar-thumb { background: rgba(184,146,42,0.25); border-radius: 4px; }
// ::-webkit-scrollbar-thumb:hover { background: #b8922a; }
// @media (max-width: 768px) {
//   .hero-inner { flex-direction: column !important; align-items: flex-start !important; }
//   .hero-right  { align-items: flex-start !important; width: 100% !important; }
//   .hero-btns   { width: 100% !important; }
// }
// `;

// const AllItems = () => {
//   const [menuItems,       setMenuItems]   = useState([]);
//   const [categories,      setCategories]  = useState([]);
//   const [filteredItems,   setFiltered]    = useState([]);
//   const [loading,         setLoading]     = useState(true);
//   const [searchTerm,      setSearch]      = useState("");
//   const [selectedCategory,setCategory]   = useState("All");
//   const [sortBy,          setSort]        = useState("name");
//   const [addedItem,       setAddedItem]   = useState(null);

//   const navigate = useNavigate();
//   const { cart, addToCart, removeFromCart } = useCart();

//   useEffect(() => { loadData(); }, []);
//   useEffect(() => { filterSort(); }, [menuItems, searchTerm, selectedCategory, sortBy]);

//   const loadData = async () => {
//     try {
//       setLoading(true);

//       // Fetch menus, categories AND restaurants in parallel
//       const [menuRes, catRes, restRes] = await Promise.all([
//         axiosInstance.get("/MenuItem"),
//         axiosInstance.get("/Category"),
//         axiosInstance.get("/Restaurant"),   // ← needed to cross-check isOpen
//       ]);

//       if (Array.isArray(menuRes.data) && Array.isArray(restRes.data)) {
//         // Build a Set of open restaurant IDs for O(1) lookup
//         const openRestaurantIds = new Set(
//           restRes.data
//             .filter(r => r.isOpen === true)
//             .map(r => r.restaurantID ?? r.restaurantId ?? r.id ?? r.RestaurantID)
//         );

//         // ✅ DUAL FILTER:
//         //   1. item.isAvailable === true   (item-level soft delete)
//         //   2. item belongs to an OPEN restaurant (restaurant-level close)
//         const available = menuRes.data.filter(i =>
//           i.isAvailable === true &&
//           openRestaurantIds.has(i.restaurantID ?? i.RestaurantID ?? i.restaurantId)
//         );

//         setMenuItems(available);
//       }

//       setCategories(Array.isArray(catRes.data) ? catRes.data : []);
//     } catch (e) {
//       console.error("AllItems loadData error:", e);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filterSort = () => {
//     let f = [...menuItems];
//     if (searchTerm)
//       f = f.filter(i => i.menuItemName?.toLowerCase().includes(searchTerm.toLowerCase()));
//     if (selectedCategory !== "All")
//       f = f.filter(i => i.categoryName === selectedCategory);
//     f.sort((a, b) =>
//       sortBy === "price"      ? a.menuItemPrice - b.menuItemPrice :
//       sortBy === "price-desc" ? b.menuItemPrice - a.menuItemPrice :
//       a.menuItemName.localeCompare(b.menuItemName)
//     );
//     setFiltered(f);
//   };

//   const handleAdd = (item) => {
//     addToCart(item);
//     setAddedItem(item.menuItemID);
//     setTimeout(() => setAddedItem(null), 1200);
//   };

//   const totalQty = () => cart.reduce((t, i) => t + i.quantity, 0);
//   const imgSrc   = item =>
//     item.imageUrl ||
//     `https://source.unsplash.com/400x400/?gourmet,${encodeURIComponent(item.menuItemName || "food")}`;

//   if (loading) return (
//     <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh", background:"#f5f0e8", flexDirection:"column", gap:20 }}>
//       <style>{globalCSS}</style>
//       <div style={{ width:50, height:50, border:`3px solid rgba(184,146,42,0.2)`, borderTopColor:"#b8922a", borderRadius:"50%", animation:"spin 0.85s linear infinite" }} />
//       <p style={{ fontFamily:"'Jost',sans-serif", color:"#9a8060", fontWeight:500, letterSpacing:"0.14em", textTransform:"uppercase", fontSize:11 }}>Curating your menu…</p>
//     </div>
//   );

//   const allCats = ["All", ...categories.map(c => c.categoryName)];

//   return (
//     <div style={{ minHeight:"100vh", background:"#f5f0e8", fontFamily:"'Jost',sans-serif", color:T.text, paddingBottom:130 }}>
//       <style>{globalCSS}</style>

//       {/* ══ HERO ══ */}
//       <header style={{ position:"relative", overflow:"hidden", padding:"64px 52px 58px", background:"linear-gradient(155deg,#1c1408 0%,#2e200a 55%,#1a1206 100%)" }}>
//         <div className="orb1" style={{ position:"absolute", top:"-100px", left:"8%", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(201,168,76,0.11) 0%,transparent 70%)", pointerEvents:"none" }} />
//         <div className="orb2" style={{ position:"absolute", bottom:"-120px", right:"4%", width:580, height:580, borderRadius:"50%", background:"radial-gradient(circle,rgba(80,120,220,0.07) 0%,transparent 70%)", pointerEvents:"none" }} />
//         <div style={{ position:"absolute", top:0, left:0, right:0, height:"1.5px", background:"linear-gradient(90deg,transparent 0%,#c9a84c 40%,#e8c97a 60%,transparent 100%)" }} />

//         <div className="hero-inner" style={{ position:"relative", maxWidth:1340, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", gap:48, flexWrap:"wrap" }}>
//           <div style={{ flex:"1 1 360px" }} className="page-enter">
//             <div style={{ position:"relative", padding:"36px 40px 38px", borderRadius:24, border:"1.5px solid transparent", backgroundImage:`linear-gradient(#1e1508, #1e1508), linear-gradient(135deg, #d4a843 0%, #f0d070 35%, #b8922a 65%, #e8c060 100%)`, backgroundOrigin:"border-box", backgroundClip:"padding-box, border-box", boxShadow:`0 0 0 1px rgba(212,168,67,0.08), 0 8px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(240,208,112,0.15)` }}>
//               {[{top:10,left:10},{top:10,right:10},{bottom:10,left:10},{bottom:10,right:10}].map((pos,i) => (
//                 <div key={i} style={{ position:"absolute", width:12, height:12, ...pos, borderTop:i<2?"2px solid #d4a843":"none", borderBottom:i>=2?"2px solid #d4a843":"none", borderLeft:(i===0||i===2)?"2px solid #d4a843":"none", borderRight:(i===1||i===3)?"2px solid #d4a843":"none", opacity:0.7 }} />
//               ))}
//               <div style={{ display:"inline-flex", alignItems:"center", gap:8, marginBottom:22, padding:"5px 16px", border:"1px solid rgba(212,168,67,0.35)", borderRadius:100, background:"rgba(212,168,67,0.1)" }}>
//                 <Sparkles size={11} style={{ color:"#d4a843" }} />
//                 <span style={{ fontSize:10, fontWeight:700, letterSpacing:"0.16em", textTransform:"uppercase", color:"#d4a843" }}>Chef's Selection</span>
//               </div>
//               <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(3rem,6vw,5.2rem)", fontWeight:700, lineHeight:0.96, color:"#f5ead0", marginBottom:20, letterSpacing:"-0.015em" }}>
//                 The&nbsp;
//                 <em style={{ fontStyle:"italic", background:`linear-gradient(135deg,#d4a843,#f0d070)`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Finest</em>
//                 <br/>Dishes, Here.
//               </h1>
//               <p style={{ color:"#9a7a50", fontSize:13, letterSpacing:"0.07em", display:"flex", alignItems:"center", gap:10 }}>
//                 <span style={{ display:"inline-block", width:28, height:1, background:"#d4a843", opacity:0.5 }} />
//                 {filteredItems.length} available items today
//               </p>
//             </div>
//           </div>

//           <div className="hero-right page-enter" style={{ flex:"1 1 390px", display:"flex", flexDirection:"column", gap:18, alignItems:"flex-end" }}>
//             <div style={{ position:"relative", width:"100%", maxWidth:430 }}>
//               <Search size={15} style={{ position:"absolute", left:16, top:"50%", transform:"translateY(-50%)", color:T.mutedWarm, pointerEvents:"none" }} />
//               <input
//                 type="text" placeholder="Search dishes…" value={searchTerm}
//                 onChange={e => setSearch(e.target.value)} className="search-inp"
//                 style={{ width:"100%", padding:"13px 18px 13px 46px", borderRadius:14, border:"1.5px solid rgba(255,255,255,0.08)", background:"rgba(255,255,255,0.04)", color:T.text, fontSize:14, backdropFilter:"blur(14px)", fontFamily:"'Jost',sans-serif", boxSizing:"border-box", letterSpacing:"0.02em" }}
//               />
//             </div>
//             <div className="hero-btns" style={{ display:"flex", gap:12, flexWrap:"wrap", justifyContent:"flex-end", width:"100%" }}>
//               <button className="cart-btn" onClick={() => navigate("/customer/cart")}
//                 style={{ display:"flex", alignItems:"center", gap:9, padding:"12px 22px", borderRadius:13, border:"1.5px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.05)", color:T.text, fontWeight:600, fontSize:13, cursor:"pointer", backdropFilter:"blur(12px)", fontFamily:"'Jost',sans-serif", letterSpacing:"0.04em", transition:"all 0.2s", position:"relative" }}>
//                 <ShoppingCart size={17} />
//                 <span>Cart</span>
//                 {totalQty() > 0 && (
//                   <span style={{ background:`linear-gradient(135deg,${T.gold} 0%,#a8721e 100%)`, color:T.white, borderRadius:100, padding:"2px 8px", fontSize:10, fontWeight:800, marginLeft:2 }}>{totalQty()}</span>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* ══ FILTER BAR ══ */}
//       <div style={{ maxWidth:1340, margin:"0 auto", padding:"30px 52px 0", display:"flex", flexDirection:"column", gap:20 }}>
//         <div style={{ display:"flex", gap:12, flexWrap:"wrap", alignItems:"center" }}>
//           <div style={{ position:"relative" }}>
//             <select className="sel-elem" value={selectedCategory} onChange={e => setCategory(e.target.value)}
//               style={{ appearance:"none", padding:"10px 42px 10px 16px", borderRadius:12, border:"1.5px solid rgba(184,146,42,0.25)", background:"#ffffff", color:T.text, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'Jost',sans-serif", letterSpacing:"0.04em", minWidth:170, transition:"border-color 0.2s", boxShadow:"0 1px 6px rgba(0,0,0,0.06)" }}>
//               <option value="All">All Categories</option>
//               {categories.map(c => <option key={c.categoryID} value={c.categoryName}>{c.categoryName}</option>)}
//             </select>
//             <ChevronDown size={13} style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", color:T.mutedWarm, pointerEvents:"none" }} />
//           </div>
//           <div style={{ position:"relative" }}>
//             <select className="sel-elem" value={sortBy} onChange={e => setSort(e.target.value)}
//               style={{ appearance:"none", padding:"10px 42px 10px 16px", borderRadius:12, border:"1.5px solid rgba(184,146,42,0.25)", background:"#ffffff", color:T.text, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'Jost',sans-serif", letterSpacing:"0.04em", minWidth:160, transition:"border-color 0.2s", boxShadow:"0 1px 6px rgba(0,0,0,0.06)" }}>
//               <option value="name">Sort: A – Z</option>
//               <option value="price">Price: Low → High</option>
//               <option value="price-desc">Price: High → Low</option>
//             </select>
//             <ChevronDown size={13} style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", color:T.mutedWarm, pointerEvents:"none" }} />
//           </div>
//           <span style={{ marginLeft:"auto", fontSize:12, color:T.mutedWarm, fontWeight:500, letterSpacing:"0.07em" }}>{filteredItems.length}&nbsp;items</span>
//         </div>

//         <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
//           {allCats.map(cat => {
//             const active = selectedCategory === cat;
//             return (
//               <button key={cat} className={`pill-btn${active ? " pill-active" : ""}`} onClick={() => setCategory(cat)}
//                 style={{ padding:"7px 20px", borderRadius:100, border:`1.5px solid ${active ? T.gold : "rgba(184,146,42,0.2)"}`, background: active ? `linear-gradient(135deg,${T.gold},#a8721e)` : "#ffffff", color: active ? "#ffffff" : T.mutedWarm, fontWeight: active ? 700 : 500, fontSize:12, cursor:"pointer", fontFamily:"'Jost',sans-serif", letterSpacing:"0.05em", backdropFilter:"blur(6px)", whiteSpace:"nowrap", boxShadow: active ? `0 4px 18px ${T.goldGlow}` : "0 1px 4px rgba(0,0,0,0.06)" }}>
//                 {cat}
//               </button>
//             );
//           })}
//         </div>
//         <div style={{ height:1, background:"linear-gradient(90deg,transparent,rgba(201,168,76,0.18),transparent)" }} />
//       </div>

//       {/* ══ ITEM GRID ══ */}
//       {filteredItems.length === 0 ? (
//         <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"110px 20px", gap:18 }}>
//           <UtensilsCrossed size={52} style={{ color:"rgba(184,146,42,0.2)" }} />
//           <p style={{ color:T.mutedWarm, fontWeight:500, letterSpacing:"0.09em", fontSize:14 }}>
//             {searchTerm ? "No dishes match your search" : "No dishes available right now"}
//           </p>
//         </div>
//       ) : (
//         <div style={{ maxWidth:1340, margin:"34px auto 0", padding:"0 52px", display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(245px,1fr))", gap:26 }}>
//           {filteredItems.map((item, idx) => {
//             const itemId = item.menuItemID;
//             const qty    = cart.find(i => i.menuItemID === itemId)?.quantity || 0;
//             const added  = addedItem === itemId;

//             return (
//               <div key={itemId} className="menu-card card-enter"
//                 style={{ background:"#ffffff", borderRadius:22, overflow:"hidden", border:`1px solid rgba(184,146,42,0.18)`, animationDelay:`${Math.min(idx * 0.045, 0.5)}s`, boxShadow:"0 2px 16px rgba(0,0,0,0.07)" }}>

//                 <div style={{ position:"relative", height:196, overflow:"hidden", background:"#f0ead8" }}>
//                   <img src={imgSrc(item)} alt={item.menuItemName} className="card-img"
//                     style={{ width:"100%", height:"100%", objectFit:"cover", transition:"transform 0.5s cubic-bezier(.22,1,.36,1)", opacity:0.88 }} />
//                   <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(8,12,20,0.65) 0%,transparent 55%)", pointerEvents:"none" }} />
//                   {item.categoryName && (
//                     <span style={{ position:"absolute", top:12, left:12, background:"rgba(8,12,20,0.72)", backdropFilter:"blur(10px)", border:"1px solid rgba(201,168,76,0.2)", color:T.goldLight, fontSize:9, fontWeight:700, padding:"4px 12px", borderRadius:100, letterSpacing:"0.12em", textTransform:"uppercase" }}>
//                       {item.categoryName}
//                     </span>
//                   )}
//                   {/* Restaurant name tag */}
//                   {item.restaurantName && (
//                     <span style={{ position:"absolute", bottom:10, left:12, background:"rgba(0,0,0,0.55)", backdropFilter:"blur(8px)", color:"rgba(255,255,255,0.85)", fontSize:9, fontWeight:600, padding:"3px 10px", borderRadius:100, letterSpacing:"0.08em" }}>
//                       {item.restaurantName}
//                     </span>
//                   )}
//                 </div>

//                 <div style={{ padding:"18px 20px 22px" }}>
//                   <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, fontWeight:600, color:"#2a1f10", marginBottom:8, lineHeight:1.22, letterSpacing:"-0.01em" }}>
//                     {item.menuItemName}
//                   </h3>
//                   <div style={{ marginBottom:16 }}>
//                     <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:23, fontWeight:700, background:`linear-gradient(135deg,${T.gold},${T.goldLight})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
//                       ₹{item.menuItemPrice}
//                     </span>
//                   </div>

//                   {qty === 0 ? (
//                     <button className="add-btn" onClick={() => handleAdd(item)}
//                       style={{ width:"100%", padding:"11px", borderRadius:13, border:"none", background: added ? `linear-gradient(135deg,${T.green},#3d9e6e)` : `linear-gradient(135deg,${T.gold},#a8721e)`, color: added ? T.white : "#1a0c00", fontWeight:700, fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:7, fontFamily:"'Jost',sans-serif", letterSpacing:"0.05em", transition:"all 0.25s", boxShadow: added ? "none" : `0 4px 18px rgba(201,168,76,0.2)` }}>
//                       <Plus size={15} />
//                       {added ? "Added ✓" : "Add to Order"}
//                     </button>
//                   ) : (
//                     <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:"rgba(184,146,42,0.07)", border:"1px solid rgba(184,146,42,0.2)", borderRadius:13, padding:"5px" }}>
//                       <button className="qty-btn" onClick={() => removeFromCart(itemId)}
//                         style={{ width:37, height:37, borderRadius:10, border:"none", background:`linear-gradient(135deg,${T.gold},#a8721e)`, color:"#1a0c00", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s" }}>
//                         <Minus size={14} />
//                       </button>
//                       <span style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:21, color:"#b8922a" }}>{qty}</span>
//                       <button className="qty-btn" onClick={() => handleAdd(item)}
//                         style={{ width:37, height:37, borderRadius:10, border:"none", background:`linear-gradient(135deg,${T.gold},#a8721e)`, color:"#1a0c00", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s" }}>
//                         <Plus size={14} />
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}

//       <button className="fab" onClick={() => navigate("/customer/orders")}
//         style={{ position:"fixed", bottom:34, right:34, zIndex:999, background:`linear-gradient(135deg,${T.gold} 0%,#a8721e 100%)`, color:"#1a0c00", border:"none", borderRadius:100, padding:"16px 28px", display:"flex", alignItems:"center", gap:10, fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"'Jost',sans-serif", letterSpacing:"0.06em", boxShadow:`0 10px 44px rgba(201,168,76,0.38), 0 2px 10px rgba(0,0,0,0.5)`, transition:"all 0.28s cubic-bezier(.22,1,.36,1)" }}>
//         <ClipboardList size={20} />
//         <span>My Orders</span>
//       </button>
//     </div>
//   );
// };

// export default AllItems;

import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, ShoppingCart, Plus, Minus, UtensilsCrossed,
  ClipboardList, ChevronLeft, ChevronRight,
  Star, Clock, ChevronDown, X, Flame,
} from "lucide-react";
import axiosInstance from "../../api/axiosInstance";
import { useCart } from "../../contexts/CartContext";

/* ─── same tokens as CustomerLayout ──────────────────────── */
const C = {
  bg:       "#fdf7f0",
  card:     "#ffffff",
  pill:     "#fff4eb",
  border:   "rgba(232,67,28,0.10)",
  borderMd: "rgba(232,67,28,0.20)",

  red:      "#e8431c",
  redDk:    "#c23516",
  saffron:  "#f09010",
  grad:     "linear-gradient(135deg,#e8431c 0%,#f09010 100%)",
  glow:     "rgba(232,67,28,0.24)",

  ink:      "#1a0c00",
  inkMd:    "#5a2e10",
  inkMt:    "#b07850",

  veg:      "#15803d",
  nonveg:   "#dc2626",
  gold:     "#f59e0b",
  success:  "#15803d",
};

/* ─── hero slides ─────────────────────────────────────────── */
const SLIDES = [
  { url:"https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1600&q=85", label:"Crispy Pizzas",      sub:"Hot, cheesy & delivered in 30 min",            badge:"🔥 Trending Now" },
  { url:"https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1600&q=85", label:"Loaded Burgers",     sub:"Stack it high, bite after bite",               badge:"🍔 Best Seller" },
  { url:"https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=1600&q=85", label:"Indulgent Desserts", sub:"Because every meal deserves a sweet ending",    badge:"🍰 Sweet Deals" },
  { url:"https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1600&q=85", label:"Fresh & Healthy",    sub:"Clean food, zero compromise",                  badge:"🥗 Eat Right" },
  { url:"https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&q=85", label:"Chef's Specials",    sub:"Exclusive dishes, only here",                  badge:"⭐ Chef's Pick" },
];

/* ─── css ─────────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,700;1,900&family=Nunito:wght@300;400;600;700;800;900&display=swap');

*, *::before, *::after { box-sizing: border-box; }

@keyframes fadeUp { from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);} }
@keyframes popIn  { from{opacity:0;transform:translateX(-20px);}to{opacity:1;transform:translateX(0);} }
@keyframes spin   { to{transform:rotate(360deg);} }
@keyframes floatUp{ 0%{opacity:1;transform:translateY(0) scale(1);}100%{opacity:0;transform:translateY(-62px) scale(0.4);} }

/* ── dot-grid bg ── */
.ai-bg {
  background-color: #fdf7f0;
  background-image: radial-gradient(circle, rgba(232,67,28,0.05) 1px, transparent 1px);
  background-size: 26px 26px;
  min-height: 100%;
}

/* ── hero ── */
.ai-slide { position:absolute; inset:0; transition:opacity 1s cubic-bezier(0.4,0,0.2,1); }
.ai-slide img { width:100%; height:100%; object-fit:cover; transform:scale(1.06); transition:transform 9s ease; }
.ai-slide.on img { transform:scale(1); }
.ai-dot { width:7px; height:7px; border-radius:100px; background:rgba(255,255,255,0.32); transition:all 0.28s; cursor:pointer; border:none; padding:0; flex-shrink:0; }
.ai-dot.on { background:#fff; width:30px; }

/* hero search */
.ai-hsrch { transition: box-shadow 0.2s; }
.ai-hsrch:focus-within { box-shadow: 0 0 0 3px rgba(232,67,28,0.2) !important; }
.ai-hsrch input { background:transparent; border:none; outline:none; font-family:'Nunito',sans-serif; color:#1a0c00; font-size:15px; width:100%; font-weight:500; }
.ai-hsrch input::placeholder { color:#b07850; }

/* hero arrows */
.ai-arrow { transition: all 0.18s; }
.ai-arrow:hover { background: rgba(255,255,255,0.2) !important; transform: scale(1.1); }

/* chips */
.ai-chip { transition: all 0.18s; cursor: pointer; white-space: nowrap; }
.ai-chip:hover:not(.on) { background: #fff4eb !important; border-color: #f09010 !important; color: #e8431c !important; }

/* quick filter hover */
.ai-qf { transition: all 0.18s; }
.ai-qf:hover { background: #fff4eb !important; border-color: #f09010 !important; color: #e8431c !important; }

/* cards */
.ai-card { animation: fadeUp 0.46s ease both; transition: transform 0.32s cubic-bezier(0.22,1,0.36,1), box-shadow 0.32s; }
.ai-card:hover { transform: translateY(-7px) !important; box-shadow: 0 22px 56px rgba(232,67,28,0.12), 0 0 0 1.5px rgba(232,67,28,0.18) !important; }
.ai-card:hover .ai-cimg { transform: scale(1.08) !important; }

/* add btn */
.ai-add { transition: all 0.2s; }
.ai-add:hover { background: #fff4eb !important; border-color: #c23516 !important; color: #c23516 !important; }
.ai-add:active { transform: scale(0.96); }
.ai-add.done { background: #15803d !important; border-color: #15803d !important; color: #fff !important; }

/* qty buttons */
.ai-qbtn { transition: background 0.15s; }
.ai-qbtn:hover { background: #c23516 !important; }

/* cart bar */
.ai-cbar { transition: all 0.3s cubic-bezier(0.22,1,0.36,1); }
.ai-cbar:hover { filter: brightness(1.08); transform: translateY(-2px); box-shadow: 0 20px 50px rgba(232,67,28,0.42) !important; }

/* fab */
.ai-fab { transition: all 0.25s cubic-bezier(0.22,1,0.36,1); }
.ai-fab:hover { transform: translateY(-4px) scale(1.05) !important; box-shadow: 0 18px 48px rgba(232,67,28,0.4) !important; }

/* particle */
.ai-ptcl { animation: floatUp 0.9s ease forwards; position:fixed; pointer-events:none; font-size:22px; z-index:9999; }

/* chip scroll */
.ai-hscroll { overflow-x:auto; scrollbar-width:none; }
.ai-hscroll::-webkit-scrollbar { display:none; }

/* select */
select { appearance:none; cursor:pointer; font-family:'Nunito',sans-serif; font-weight:600; }
select:focus { outline:none; }
select option { background:#fff; color:#1a0c00; }

@media(max-width:1024px){
  .ai-grid { grid-template-columns: repeat(auto-fill, minmax(228px,1fr)) !important; gap:18px !important; }
}
@media(max-width:640px){
  .ai-grid { grid-template-columns: 1fr 1fr !important; gap:12px !important; }
  .ai-pad  { padding: 0 16px !important; }
  .ai-hero-h1 { font-size: clamp(2.6rem,9.5vw,4.5rem) !important; }
}
`;

/* ─── component ───────────────────────────────────────────── */
export default function AllItems() {
  const [menuItems,  setMenuItems]  = useState([]);
  const [categories, setCategories] = useState([]);
  const [filtered,   setFiltered]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [category,   setCategory]   = useState("All");
  const [sortBy,     setSort]       = useState("name");
  const [addedId,    setAddedId]    = useState(null);
  const [slide,      setSlide]      = useState(0);
  const [particles,  setParticles]  = useState([]);

  const navigate = useNavigate();
  const { cart, addToCart, removeFromCart } = useCart();
  const timerRef = useRef(null);

  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setSlide(s => (s + 1) % SLIDES.length), 4600);
  }, []);

  useEffect(() => {
    loadData(); startTimer();
    return () => clearInterval(timerRef.current);
  }, []);
  useEffect(() => { filterSort(); }, [menuItems, search, category, sortBy]);

  const goSlide = d => { setSlide(s => (s + d + SLIDES.length) % SLIDES.length); startTimer(); };

  const loadData = async () => {
    try {
      setLoading(true);
      const [mR, cR, rR] = await Promise.all([
        axiosInstance.get("/MenuItem"),
        axiosInstance.get("/Category"),
        axiosInstance.get("/Restaurant"),
      ]);
      if (Array.isArray(mR.data) && Array.isArray(rR.data)) {
        const open = new Set(rR.data.filter(r => r.isOpen).map(r => r.restaurantID ?? r.restaurantId ?? r.id));
        setMenuItems(mR.data.filter(i => i.isAvailable && open.has(i.restaurantID ?? i.RestaurantID ?? i.restaurantId)));
      }
      setCategories(Array.isArray(cR.data) ? cR.data : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const filterSort = () => {
    let f = [...menuItems];
    if (search)             f = f.filter(i => i.menuItemName?.toLowerCase().includes(search.toLowerCase()));
    if (category !== "All") f = f.filter(i => i.categoryName === category);
    f.sort((a, b) =>
      sortBy === "price"      ? a.menuItemPrice - b.menuItemPrice :
      sortBy === "price-desc" ? b.menuItemPrice - a.menuItemPrice :
      a.menuItemName.localeCompare(b.menuItemName)
    );
    setFiltered(f);
  };

  const spawnParticle = e => {
    const id   = Date.now();
    const pool = ["🔥","✨","🛒","⭐","🎉"];
    const rect = e.currentTarget.getBoundingClientRect();
    setParticles(p => [...p, { id, emoji: pool[Math.floor(Math.random() * pool.length)], x: rect.left + rect.width / 2, y: rect.top }]);
    setTimeout(() => setParticles(p => p.filter(x => x.id !== id)), 900);
  };

  const handleAdd = (item, e) => {
    spawnParticle(e);
    addToCart(item);
    setAddedId(item.menuItemID);
    setTimeout(() => setAddedId(null), 1200);
  };

  const totalQty   = () => cart.reduce((t, i) => t + i.quantity, 0);
  const totalPrice = () => cart.reduce((t, i) => t + i.menuItemPrice * i.quantity, 0);
  const imgSrc     = item => item.imageUrl ||
    `https://source.unsplash.com/600x500/?food,${encodeURIComponent(item.menuItemName || "dish")}`;

  /* ── loading ── */
  if (loading) return (
    <div className="ai-bg" style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"80vh", gap:16 }}>
      <style>{CSS}</style>
      <div style={{ width:48, height:48, border:"3px solid rgba(232,67,28,0.14)", borderTopColor:C.red, borderRadius:"50%", animation:"spin 0.82s linear infinite" }} />
      <p style={{ fontFamily:"'Nunito',sans-serif", color:C.inkMt, fontSize:11, letterSpacing:"0.24em", textTransform:"uppercase", fontWeight:600 }}>Finding the best food near you…</p>
    </div>
  );

  const allCats = ["All", ...categories.map(c => c.categoryName)];
  const cartQty = totalQty();

  return (
    <div className="ai-bg" style={{ paddingBottom: cartQty > 0 ? 110 : 60 }}>
      <style>{CSS}</style>

      {/* particles */}
      {particles.map(p => (
        <span key={p.id} className="ai-ptcl" style={{ left:p.x, top:p.y }}>{p.emoji}</span>
      ))}

      {/* ══ HERO CAROUSEL ══════════════════════════════════════ */}
      <div style={{ position:"relative", height:"65vh", minHeight:460, maxHeight:660, overflow:"hidden" }}>
        {SLIDES.map((s, i) => (
          <div key={i} className={`ai-slide${i === slide ? " on" : ""}`} style={{ opacity: i === slide ? 1 : 0, zIndex: i === slide ? 1 : 0 }}>
            <img src={s.url} alt={s.label} loading={i === 0 ? "eager" : "lazy"} />
          </div>
        ))}

        {/* overlays */}
        <div style={{ position:"absolute", inset:0, zIndex:2, background:"linear-gradient(to bottom,rgba(26,12,0,0.54) 0%,rgba(26,12,0,0.14) 38%,rgba(26,12,0,0.82) 100%)" }} />

        {/* content */}
        <div style={{ position:"absolute", inset:0, zIndex:3, display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", padding:"0 44px", textAlign:"center" }}>
          <div key={slide} style={{ animation:"popIn 0.6s ease both", display:"flex", flexDirection:"column", alignItems:"center" }}>

            {/* badge */}
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(240,144,16,0.2)", backdropFilter:"blur(12px)", border:"1px solid rgba(240,144,16,0.35)", borderRadius:100, padding:"7px 22px", marginBottom:24, fontSize:11, fontWeight:800, color:"#ffe0a0", letterSpacing:"0.14em", textTransform:"uppercase", fontFamily:"'Nunito',sans-serif" }}>
              {SLIDES[slide].badge}
            </div>

            {/* headline */}
            <h1 className="ai-hero-h1" style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(3.2rem,7.5vw,8rem)", fontWeight:900, fontStyle:"italic", color:"#fff", lineHeight:1.0, marginBottom:20, letterSpacing:"-0.02em", textShadow:"0 4px 40px rgba(0,0,0,0.5)" }}>
              {SLIDES[slide].label}
            </h1>
            <p style={{ fontFamily:"'Nunito',sans-serif", color:"rgba(255,255,255,0.68)", fontSize:17, fontWeight:300, marginBottom:38, maxWidth:500, lineHeight:1.75, letterSpacing:"0.02em" }}>
              {SLIDES[slide].sub}
            </p>

            {/* search bar */}
            <div className="ai-hsrch" style={{ width:"100%", maxWidth:580, background:"#fff", borderRadius:17, border:"2px solid rgba(255,255,255,0.55)", display:"flex", alignItems:"center", padding:"6px 6px 6px 20px", gap:12, boxShadow:"0 10px 44px rgba(0,0,0,0.28)" }}>
              <Search size={19} style={{ color:C.inkMt, flexShrink:0 }} />
              <input placeholder="Search for pizza, biryani, burgers…" value={search} onChange={e => setSearch(e.target.value)} />
              {search && (
                <button onClick={() => setSearch("")} style={{ background:"none", border:"none", cursor:"pointer", color:C.inkMt, display:"flex", flexShrink:0 }}>
                  <X size={16} />
                </button>
              )}
              <button style={{ flexShrink:0, padding:"12px 26px", borderRadius:12, border:"none", background:C.grad, color:"#fff", fontWeight:800, fontSize:14, cursor:"pointer", fontFamily:"'Nunito',sans-serif", whiteSpace:"nowrap", letterSpacing:"0.03em" }}>
                Find Food
              </button>
            </div>

            {/* stat pills */}
            <div style={{ display:"flex", gap:12, marginTop:22, flexWrap:"wrap", justifyContent:"center" }}>
              {[["⚡","25–40 min"], ["🛡","Hygienic"], ["🎁",`${filtered.length}+ dishes`]].map(([icon, txt]) => (
                <div key={txt} style={{ display:"flex", alignItems:"center", gap:7, background:"rgba(255,255,255,0.11)", backdropFilter:"blur(10px)", border:"1px solid rgba(255,255,255,0.18)", borderRadius:100, padding:"7px 16px" }}>
                  <span style={{ fontSize:14 }}>{icon}</span>
                  <span style={{ fontFamily:"'Nunito',sans-serif", color:"rgba(255,255,255,0.86)", fontSize:13, fontWeight:600 }}>{txt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* arrows */}
        {[[-1,"left",<ChevronLeft size={22}/>],[1,"right",<ChevronRight size={22}/>]].map(([d,side,icon])=>(
          <button key={side} className="ai-arrow" onClick={() => goSlide(d)}
            style={{ position:"absolute", [side]:22, top:"50%", transform:"translateY(-50%)", zIndex:4, width:50, height:50, borderRadius:"50%", border:"1.5px solid rgba(255,255,255,0.2)", background:"rgba(0,0,0,0.28)", color:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(8px)" }}>
            {icon}
          </button>
        ))}

        {/* dots */}
        <div style={{ position:"absolute", bottom:26, left:"50%", transform:"translateX(-50%)", zIndex:4, display:"flex", gap:8, alignItems:"center" }}>
          {SLIDES.map((_,i)=>(
            <button key={i} className={`ai-dot${i===slide?" on":""}`} onClick={()=>{setSlide(i);startTimer();}} />
          ))}
        </div>

        {/* slide counter */}
        <div style={{ position:"absolute", bottom:22, right:36, zIndex:4, fontFamily:"'Playfair Display',serif", fontStyle:"italic", fontSize:22, fontWeight:400, color:"rgba(255,255,255,0.28)", letterSpacing:"0.08em" }}>
          {String(slide+1).padStart(2,"0")} / {String(SLIDES.length).padStart(2,"0")}
        </div>
      </div>

      {/* ══ PROMO STRIP ════════════════════════════════════════ */}
      {/* <div style={{ background:C.grad, padding:"11px 44px", overflowX:"hidden" }}>
        <div style={{ maxWidth:1380, margin:"0 auto", display:"flex", alignItems:"center", gap:40, overflowX:"auto" }}>
          {[["🔥 FLASH SALE","Up to 40% off today"],["🚀 FREE DELIVERY","On orders above ₹299"],["🌟 NEW DISHES","Freshly added this week"]].map(([t,d])=>(
            <div key={t} style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
              <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:12, fontWeight:800, color:"#fff", letterSpacing:"0.08em" }}>{t}</span>
              <span style={{ width:1, height:14, background:"rgba(255,255,255,0.3)" }} />
              <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:12, color:"rgba(255,255,255,0.8)" }}>{d}</span>
            </div>
          ))}
        </div>
      </div> */}

      {/* ══ FILTER BAR ═════════════════════════════════════════ */}
      <div style={{ background:"rgba(253,247,240,0.96)", backdropFilter:"blur(18px)", position:"sticky", top:"71px", zIndex:98, borderBottom:`1px solid ${C.border}` }}>
        <div className="ai-pad" style={{ maxWidth:1380, margin:"0 auto", padding:"14px 40px", display:"flex", flexDirection:"column", gap:14 }}>

          {/* chips */}
          <div className="ai-hscroll" style={{ display:"flex", gap:10 }}>
            {allCats.map(cat => {
              const on = category === cat;
              return (
                <button key={cat} className={`ai-chip${on?" on":""}`} onClick={() => setCategory(cat)}
                  style={{ padding:"9px 22px", borderRadius:100, border:`1.5px solid ${on ? C.red : C.border}`, background: on ? C.grad : C.pill, color: on ? "#fff" : C.inkMd, fontWeight: on ? 800 : 600, fontSize:13, fontFamily:"'Nunito',sans-serif", boxShadow: on ? `0 4px 16px ${C.glow}` : "none", letterSpacing:"0.01em" }}>
                  {cat}
                </button>
              );
            })}
          </div>

          {/* sort + quick filters */}
          <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
            <div style={{ position:"relative" }}>
              <select value={sortBy} onChange={e => setSort(e.target.value)}
                style={{ padding:"9px 40px 9px 16px", borderRadius:12, border:`1.5px solid ${C.border}`, background:"#fff", color:C.ink, fontSize:14, fontWeight:600, minWidth:195 }}>
                <option value="name">Sort: Relevance</option>
                <option value="price">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
              </select>
              <ChevronDown size={13} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", color:C.inkMt, pointerEvents:"none" }} />
            </div>

            {[["⚡","Fast Delivery"],["⭐","Top Rated"]].map(([icon,lbl])=>(
              <button key={lbl} className="ai-qf"
                style={{ display:"flex", alignItems:"center", gap:7, padding:"8px 18px", borderRadius:100, border:`1.5px solid ${C.border}`, background:"#fff", color:C.inkMd, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'Nunito',sans-serif", letterSpacing:"0.02em" }}>
                <span>{icon}</span>{lbl}
              </button>
            ))}

            <span style={{ marginLeft:"auto", fontFamily:"'Nunito',sans-serif", fontSize:14, color:C.inkMt }}>
              <span style={{ color:C.red, fontWeight:800, fontSize:18 }}>{filtered.length}</span> items
            </span>
          </div>
        </div>
      </div>

      {/* ══ SECTION HEADING ════════════════════════════════════ */}
      <div className="ai-pad" style={{ maxWidth:1380, margin:"48px auto 0", padding:"0 40px" }}>
        <p style={{ fontFamily:"'Nunito',sans-serif", fontSize:11, fontWeight:800, color:C.red, letterSpacing:"0.20em", textTransform:"uppercase", marginBottom:8 }}>
          {category === "All" ? "🍽 All Dishes" : `📂 ${category}`}
        </p>
        <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", gap:16 }}>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(2.4rem,4.5vw,3.8rem)", fontWeight:900, fontStyle:"italic", color:C.ink, letterSpacing:"-0.015em", lineHeight:1.05 }}>
            {category === "All" ? "What's on the Menu" : category}
          </h2>
          <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:14, color:C.inkMt, marginBottom:3, flexShrink:0 }}>Fresh & available now</span>
        </div>
        {/* underline dots */}
        <div style={{ marginTop:12, display:"flex", gap:4, alignItems:"center" }}>
          <div style={{ height:3, width:52, borderRadius:100, background:C.grad }} />
          <div style={{ height:3, width:18, borderRadius:100, background:"rgba(232,67,28,0.2)" }} />
          <div style={{ height:3, width:8,  borderRadius:100, background:"rgba(232,67,28,0.1)" }} />
        </div>
      </div>

      {/* ══ GRID ═══════════════════════════════════════════════ */}
      {filtered.length === 0 ? (
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"100px 20px", gap:18 }}>
          <UtensilsCrossed size={54} style={{ color:"rgba(232,67,28,0.10)" }} />
          <p style={{ fontFamily:"'Nunito',sans-serif", color:C.inkMt, fontSize:16, fontWeight:500 }}>
            {search ? `No results for "${search}"` : "No dishes available right now"}
          </p>
        </div>
      ) : (
        <div className="ai-grid ai-pad" style={{ maxWidth:1380, margin:"30px auto 0", padding:"0 40px", display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(268px,1fr))", gap:24 }}>
          {filtered.map((item, idx) => {
            const id     = item.menuItemID;
            const qty    = cart.find(i => i.menuItemID === id)?.quantity || 0;
            const done   = addedId === id;
            const disc   = [20,0,15,0,10,0,25,0][idx % 8];
            const isVeg  = idx % 3 !== 0;
            const rating = (3.9 + (idx % 9) * 0.11).toFixed(1);

            return (
              <div key={id} className="ai-card"
                style={{ background:C.card, borderRadius:20, overflow:"hidden", border:`1px solid ${C.border}`, animationDelay:`${Math.min(idx * 0.04, 0.5)}s`, boxShadow:"0 2px 16px rgba(232,67,28,0.05)" }}>

                {/* image */}
                <div style={{ position:"relative", height:210, overflow:"hidden", background:"#ffe8d4" }}>
                  <img src={imgSrc(item)} alt={item.menuItemName} className="ai-cimg"
                    style={{ width:"100%", height:"100%", objectFit:"cover", transition:"transform 0.5s cubic-bezier(0.22,1,0.36,1)" }} />
                  <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(0,0,0,0.48) 0%,transparent 52%)" }} />

                  {/* discount ribbon */}
                  {disc > 0 && (
                    <div style={{ position:"absolute", top:0, left:0, background:C.grad, color:"#fff", fontSize:11, fontWeight:800, padding:"7px 15px", borderBottomRightRadius:14, letterSpacing:"0.05em", fontFamily:"'Nunito',sans-serif" }}>
                      {disc}% OFF
                    </div>
                  )}

                  {/* veg / non-veg dot */}
                  <div style={{ position:"absolute", top:12, right:12, width:22, height:22, borderRadius:5, border:`2px solid ${isVeg ? C.veg : C.nonveg}`, background:"#fff", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <div style={{ width:10, height:10, borderRadius:"50%", background:isVeg ? C.veg : C.nonveg }} />
                  </div>

                  {/* rating */}
                  <div style={{ position:"absolute", bottom:11, left:12, display:"flex", alignItems:"center", gap:5, background:"rgba(0,0,0,0.58)", backdropFilter:"blur(8px)", borderRadius:8, padding:"4px 10px" }}>
                    <Star size={11} fill={C.gold} style={{ color:C.gold }} />
                    <span style={{ fontFamily:"'Nunito',sans-serif", color:"#fff", fontSize:12, fontWeight:700 }}>{rating}</span>
                  </div>

                  {/* delivery time */}
                  <div style={{ position:"absolute", bottom:11, right:12, display:"flex", alignItems:"center", gap:5, background:"rgba(0,0,0,0.58)", backdropFilter:"blur(8px)", borderRadius:8, padding:"4px 10px" }}>
                    <Clock size={11} style={{ color:"rgba(255,255,255,0.85)" }} />
                    <span style={{ fontFamily:"'Nunito',sans-serif", color:"rgba(255,255,255,0.9)", fontSize:12, fontWeight:600 }}>25 min</span>
                  </div>
                </div>

                {/* body */}
                <div style={{ padding:"15px 17px 19px" }}>

                  {/* meta */}
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                    {item.categoryName && (
                      <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:10, fontWeight:800, color:C.red, background:C.pill, padding:"3px 11px", borderRadius:100, letterSpacing:"0.09em", textTransform:"uppercase" }}>
                        {item.categoryName}
                      </span>
                    )}
                    {item.restaurantName && (
                      <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:11, color:C.inkMt, fontWeight:500, maxWidth:130, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                        {item.restaurantName}
                      </span>
                    )}
                  </div>

                  {/* name */}
                  <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:700, color:C.ink, marginBottom:10, lineHeight:1.35, letterSpacing:"0.005em", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
                    {item.menuItemName}
                  </h3>

                  {/* price + cta */}
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <div style={{ display:"flex", alignItems:"baseline", gap:7 }}>
                      <span style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:900, color:C.ink, letterSpacing:"-0.01em" }}>₹{item.menuItemPrice}</span>
                      {disc > 0 && (
                        <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:13, color:C.inkMt, textDecoration:"line-through" }}>
                          ₹{Math.round(item.menuItemPrice * 100 / (100 - disc))}
                        </span>
                      )}
                    </div>

                    {qty === 0 ? (
                      <button className={`ai-add${done ? " done" : ""}`} onClick={e => handleAdd(item, e)}
                        style={{ display:"flex", alignItems:"center", gap:7, padding:"10px 20px", borderRadius:12, border:`2px solid ${done ? C.success : C.red}`, background: done ? C.success : "transparent", color: done ? "#fff" : C.red, fontWeight:900, fontSize:13, cursor:"pointer", fontFamily:"'Nunito',sans-serif", letterSpacing:"0.06em" }}>
                        <Plus size={15} />
                        {done ? "Added!" : "ADD"}
                      </button>
                    ) : (
                      <div style={{ display:"flex", alignItems:"center", border:`2px solid ${C.red}`, borderRadius:12, overflow:"hidden" }}>
                        <button className="ai-qbtn" onClick={() => removeFromCart(id)}
                          style={{ width:38, height:38, border:"none", background:C.grad, color:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                          <Minus size={15} />
                        </button>
                        <span style={{ width:36, textAlign:"center", fontFamily:"'Playfair Display',serif", fontWeight:900, fontSize:20, color:C.red }}>
                          {qty}
                        </span>
                        <button className="ai-qbtn" onClick={e => handleAdd(item, e)}
                          style={{ width:38, height:38, border:"none", background:C.grad, color:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                          <Plus size={15} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* bottom fade */}
      <div style={{ position:"fixed", bottom:0, left:0, right:0, height:80, background:"linear-gradient(to top,#fdf7f0,transparent)", pointerEvents:"none", zIndex:90 }} />

      {/* ══ STICKY CART BAR ════════════════════════════════════ */}
      {cartQty > 0 && (
        <div style={{ position:"fixed", bottom:22, left:"50%", transform:"translateX(-50%)", zIndex:999, width:"100%", maxWidth:520, padding:"0 20px" }}>
          <button className="ai-cbar" onClick={() => navigate("/customer/cart")}
            style={{ width:"100%", background:C.grad, color:"#fff", border:"none", borderRadius:18, padding:"16px 28px", display:"flex", alignItems:"center", justifyContent:"space-between", cursor:"pointer", fontFamily:"'Nunito',sans-serif", boxShadow:`0 14px 44px ${C.glow}` }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:34, height:34, borderRadius:10, background:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <ShoppingCart size={18} />
              </div>
              <div style={{ textAlign:"left" }}>
                <div style={{ fontSize:11, opacity:0.82, fontFamily:"'Nunito',sans-serif", letterSpacing:"0.04em" }}>{cartQty} item{cartQty>1?"s":""} in cart</div>
                <div style={{ fontFamily:"'Playfair Display',serif", fontStyle:"italic", fontSize:21, fontWeight:700 }}>View Cart</div>
              </div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:26, fontWeight:900, letterSpacing:"-0.01em" }}>₹{totalPrice()}</div>
              <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:11, opacity:0.72 }}>+ delivery fee</div>
            </div>
          </button>
        </div>
      )}

      {/* ══ MY ORDERS FAB (when cart empty) ═══════════════════ */}
      {cartQty === 0 && (
        <button className="ai-fab" onClick={() => navigate("/customer/orders")}
          style={{ position:"fixed", bottom:32, right:32, zIndex:100, background:C.grad, color:"#fff", border:"none", borderRadius:100, padding:"14px 28px", display:"flex", alignItems:"center", gap:10, fontWeight:800, fontSize:15, cursor:"pointer", fontFamily:"'Nunito',sans-serif", letterSpacing:"0.04em", boxShadow:`0 12px 38px ${C.glow}` }}>
          <ClipboardList size={19} />
          My Orders
        </button>
      )}
    </div>
  );
}