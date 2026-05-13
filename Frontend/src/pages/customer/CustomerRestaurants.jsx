
// import { useEffect, useMemo, useState, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   Search, Star, MapPin, Clock, ShoppingCart,
//   Plus, Minus, X, UtensilsCrossed,
// } from "lucide-react";
// import { useCart } from "../../contexts/CartContext";

// const REST_API     = "https://localhost:7217/api/Restaurant";
// const MENU_API     = "https://localhost:7217/api/MenuItem";
// const REVIEW_API   = "https://localhost:7217/api/Review";
// const CATEGORY_API = "https://localhost:7217/api/Category";

// const authHeaders = () => {
//   const token =
//     localStorage.getItem("token") ||
//     localStorage.getItem("authToken") ||
//     localStorage.getItem("jwtToken");
//   return {
//     "Content-Type": "application/json",
//     ...(token ? { Authorization: `Bearer ${token}` } : {}),
//   };
// };

// const css = `
// @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
// *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
// :root{--brand:#FF4500;--brand-d:#d63800;--brand-l:#fff3ef;--ink:#0f0f0f;--muted:#6b6b6b;--border:#e8e8e8;--bg:#fafaf9;--white:#fff}
// @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
// @keyframes slideUp{from{opacity:0;transform:translateY(100%)}to{opacity:1;transform:translateY(0)}}
// @keyframes fadeIn{from{opacity:0}to{opacity:1}}
// @keyframes spin{to{transform:rotate(360deg)}}
// @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}

// .cr-page{max-width:1200px;margin:0 auto;padding:32px 24px 120px;font-family:'DM Sans',sans-serif}

// .cr-hero{border-radius:24px;background:linear-gradient(135deg,#0f0f0f 0%,#2a0a00 60%,#1a0500 100%);padding:52px 48px;margin-bottom:36px;position:relative;overflow:hidden}
// .cr-hero-orb{position:absolute;border-radius:50%;pointer-events:none}
// .cr-hero h1{font-family:'Syne',sans-serif;font-size:clamp(1.8rem,3.5vw,3rem);font-weight:800;color:#fff;line-height:1.1;margin-bottom:12px;position:relative}
// .cr-hero h1 em{font-style:normal;color:#FF6B35}
// .cr-hero p{color:rgba(255,255,255,.55);font-size:15px;margin-bottom:28px;max-width:480px;position:relative}
// .cr-hero-search{display:flex;align-items:center;gap:10px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.15);border-radius:16px;padding:6px 6px 6px 18px;max-width:520px;position:relative}
// .cr-hero-search input{flex:1;background:none;border:none;outline:none;color:#fff;font-family:'DM Sans',sans-serif;font-size:14px}
// .cr-hero-search input::placeholder{color:rgba(255,255,255,.35)}
// .cr-hero-search-btn{padding:10px 22px;border-radius:12px;background:var(--brand);border:none;color:#fff;font-weight:700;font-size:13px;cursor:pointer;font-family:'DM Sans',sans-serif;transition:background .15s;flex-shrink:0}
// .cr-hero-search-btn:hover{background:var(--brand-d)}

// .cr-filters{display:flex;align-items:center;gap:10px;margin-bottom:28px;flex-wrap:wrap}
// .cr-chip{padding:8px 18px;border-radius:100px;border:1.5px solid var(--border);background:var(--white);font-size:13px;font-weight:500;color:var(--muted);cursor:pointer;transition:all .15s;font-family:'DM Sans',sans-serif}
// .cr-chip:hover{border-color:var(--brand);color:var(--brand)}
// .cr-chip.on{background:var(--brand);border-color:var(--brand);color:#fff;font-weight:600}
// .cr-sort{margin-left:auto;padding:8px 14px;border-radius:100px;border:1.5px solid var(--border);background:var(--white);font-size:13px;font-weight:500;color:var(--ink);cursor:pointer;outline:none;font-family:'DM Sans',sans-serif}

// .cr-sec{display:flex;align-items:center;gap:10px;margin-bottom:20px}
// .cr-sec h2{font-family:'Syne',sans-serif;font-size:20px;font-weight:700;color:var(--ink)}
// .cr-sec-count{font-size:12px;color:var(--muted);padding:3px 10px;border-radius:100px;background:#f0f0f0;font-weight:500}

// .cr-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:20px;margin-bottom:48px}
// .cr-card{background:var(--white);border-radius:20px;border:1.5px solid var(--border);overflow:hidden;cursor:pointer;transition:transform .22s cubic-bezier(.22,1,.36,1),box-shadow .22s,border-color .2s;animation:fadeUp .4s both}
// .cr-card:hover{transform:translateY(-5px);box-shadow:0 16px 48px rgba(0,0,0,.1);border-color:rgba(255,69,0,.25)}
// .cr-img-wrap{position:relative;overflow:hidden;height:180px}
// .cr-img-wrap img{width:100%;height:100%;object-fit:cover;transition:transform .35s;background:#f0f0f0}
// .cr-card:hover .cr-img-wrap img{transform:scale(1.04)}
// .cr-badge{position:absolute;top:12px;right:12px;padding:4px 10px;border-radius:100px;font-size:11px;font-weight:700}
// .cr-badge.open{background:rgba(34,197,94,.9);color:#fff}
// .cr-badge.closed{background:rgba(239,68,68,.85);color:#fff}
// .cr-body{padding:16px 18px 18px}
// .cr-name{font-family:'Syne',sans-serif;font-size:17px;font-weight:700;color:var(--ink);margin-bottom:6px}
// .cr-meta{display:flex;align-items:center;gap:12px;font-size:12px;color:var(--muted);margin-bottom:12px;flex-wrap:wrap}
// .cr-tags{display:flex;gap:6px;flex-wrap:wrap}
// .cr-tag{padding:3px 10px;border-radius:100px;background:#f5f5f5;font-size:11px;font-weight:500;color:var(--muted)}

// /* ── Closed restaurant overlay on card ── */
// .cr-card-closed{opacity:0.55;filter:grayscale(0.4);cursor:not-allowed}
// .cr-card-closed:hover{transform:none!important;box-shadow:none!important}
// .cr-closed-banner{position:absolute;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;backdrop-filter:blur(1px)}
// .cr-closed-text{background:rgba(239,68,68,.9);color:#fff;font-family:'Syne',sans-serif;font-size:13px;font-weight:700;padding:7px 18px;border-radius:100px;letter-spacing:.04em}

// .cr-modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.55);backdrop-filter:blur(6px);z-index:500;display:flex;align-items:flex-end;justify-content:center;animation:fadeIn .2s ease}
// @media(min-width:700px){.cr-modal-bg{align-items:center}}
// .cr-sheet{background:var(--white);width:100%;max-width:880px;border-radius:28px 28px 0 0;max-height:92vh;overflow:hidden;display:flex;flex-direction:column;animation:slideUp .3s cubic-bezier(.16,1,.3,1)}
// @media(min-width:700px){.cr-sheet{border-radius:24px;max-height:88vh;margin:16px}}

// .cr-sh-header{position:relative;flex-shrink:0}
// .cr-sh-img{width:100%;height:190px;object-fit:cover;display:block;background:#f0f0f0}
// .cr-sh-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.75) 0%,transparent 55%)}
// .cr-sh-info{position:absolute;bottom:0;left:0;right:0;padding:20px 24px}
// .cr-sh-name{font-family:'Syne',sans-serif;font-size:22px;font-weight:800;color:#fff;margin-bottom:6px}
// .cr-sh-pills{display:flex;gap:8px;flex-wrap:wrap}
// .cr-sh-pill{display:flex;align-items:center;gap:5px;padding:4px 12px;border-radius:100px;background:rgba(255,255,255,.18);backdrop-filter:blur(8px);font-size:12px;font-weight:600;color:#fff}
// .cr-sh-close{position:absolute;top:14px;right:14px;width:36px;height:36px;border-radius:50%;background:rgba(0,0,0,.45);backdrop-filter:blur(8px);border:none;color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .15s}
// .cr-sh-close:hover{background:rgba(0,0,0,.7)}

// /* ── Closed restaurant sheet banner ── */
// .cr-sh-closed-notice{display:flex;align-items:center;gap:10px;background:#fef2f2;border-bottom:1.5px solid #fecaca;padding:12px 24px;font-size:13px;font-weight:700;color:#dc2626;flex-shrink:0}

// .cr-sh-body{overflow-y:auto;flex:1;padding:0 24px 24px}
// .cr-sh-search-wrap{padding:16px 0 12px;position:sticky;top:0;background:var(--white);z-index:10}
// .cr-sh-search-inner{position:relative}
// .cr-sh-search-icon{position:absolute;left:13px;top:50%;transform:translateY(-50%);color:#aaa;pointer-events:none}
// .cr-sh-search-inp{width:100%;padding:10px 16px 10px 42px;border:1.5px solid var(--border);border-radius:12px;font-family:'DM Sans',sans-serif;font-size:14px;outline:none;background:#f7f7f7;transition:border-color .2s}
// .cr-sh-search-inp:focus{border-color:var(--brand);background:#fff}

// .cr-shimmer{height:90px;border-radius:12px;background:linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%);background-size:200% 100%;animation:shimmer 1.2s infinite}

// .cr-cat-lbl{font-family:'Syne',sans-serif;font-size:14px;font-weight:700;color:var(--ink);padding:16px 0 10px;border-bottom:1.5px solid var(--border);margin-bottom:14px;letter-spacing:.02em}

// .cr-mitem{display:flex;gap:14px;padding:14px 0;border-bottom:1px solid #f3f3f3;align-items:center}
// .cr-mitem:last-child{border-bottom:none}
// .cr-mitem-img{width:90px;height:90px;border-radius:14px;object-fit:cover;flex-shrink:0;background:#f0f0f0}
// .cr-mitem-info{flex:1;min-width:0}
// .cr-mitem-name{font-family:'Syne',sans-serif;font-weight:700;font-size:15px;color:var(--ink);margin-bottom:4px}
// .cr-mitem-desc{font-size:12px;color:var(--muted);line-height:1.5;margin-bottom:6px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
// .cr-mitem-price{font-family:'Syne',sans-serif;font-weight:700;font-size:16px;color:var(--ink)}
// .cr-mitem-right{display:flex;flex-direction:column;align-items:flex-end;gap:8px;flex-shrink:0}
// .cr-add-btn{padding:8px 18px;border-radius:12px;border:1.5px solid var(--brand);background:var(--brand-l);color:var(--brand);font-weight:700;font-size:13px;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .15s}
// .cr-add-btn:hover{background:var(--brand);color:#fff}
// .cr-qty-wrap{display:flex;align-items:center;gap:8px;background:var(--brand-l);border-radius:12px;padding:6px 10px}
// .cr-qty-btn{width:28px;height:28px;border-radius:8px;border:none;background:var(--brand);color:#fff;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-weight:700;transition:background .15s}
// .cr-qty-btn:hover{background:var(--brand-d)}
// .cr-qty-num{font-family:'Syne',sans-serif;font-weight:700;font-size:15px;color:var(--ink);min-width:20px;text-align:center}
// .cr-unavail{padding:8px 14px;border-radius:10px;background:#f3f3f3;color:#aaa;font-size:12px;font-weight:500}

// .cr-cart-bar{position:fixed;bottom:0;left:0;right:0;z-index:600;padding:14px 24px env(safe-area-inset-bottom,14px);background:rgba(255,255,255,.96);backdrop-filter:blur(20px);border-top:1px solid var(--border);animation:slideUp .3s ease}
// .cr-cart-inner{max-width:880px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:16px}
// .cr-cart-info p:first-child{font-size:12px;color:var(--muted);font-family:'DM Sans',sans-serif}
// .cr-cart-info p:last-child{font-family:'Syne',sans-serif;font-weight:800;font-size:20px;color:var(--ink)}
// .cr-cart-btn{display:flex;align-items:center;gap:8px;padding:13px 28px;border-radius:14px;background:var(--brand);color:#fff;font-weight:700;font-size:14px;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;transition:background .15s,transform .1s;box-shadow:0 6px 20px rgba(255,69,0,.3)}
// .cr-cart-btn:hover{background:var(--brand-d);transform:translateY(-1px)}

// .cr-empty{text-align:center;padding:80px 20px;grid-column:1/-1}
// .cr-empty-icon{width:72px;height:72px;border-radius:22px;background:var(--brand-l);display:flex;align-items:center;justify-content:center;margin:0 auto 20px;color:var(--brand)}
// .cr-empty h3{font-family:'Syne',sans-serif;font-size:20px;font-weight:700;color:var(--ink);margin-bottom:8px}
// .cr-empty p{color:var(--muted);font-size:14px}

// .cr-splash{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;gap:16px}
// .cr-ring{width:48px;height:48px;border-radius:50%;border:3px solid #fed7aa;border-top-color:var(--brand);animation:spin .85s linear infinite}
// `;

// const CustomerRestaurants = () => {
//   const navigate = useNavigate();
//   const { cart, addToCart, removeFromCart, getCartItemQuantity } = useCart();

//   const [restaurants,  setRestaurants]  = useState([]);
//   const [loading,      setLoading]      = useState(true);
//   const [searchQ,      setSearchQ]      = useState("");
//   const [filter,       setFilter]       = useState("All");
//   const [sort,         setSort]         = useState("default");

//   const [activeRest,   setActiveRest]   = useState(null);
//   const [menuItems,    setMenuItems]    = useState([]);
//   const [categories,   setCategories]   = useState([]);
//   const [reviews,      setReviews]      = useState([]);
//   const [menuLoading,  setMenuLoading]  = useState(false);
//   const [menuSearch,   setMenuSearch]   = useState("");
//   const [activeTab,    setActiveTab]    = useState("menu");

//   /* ─── Load restaurants ───
//      FILTER: only show restaurants where isOpen === true
//      Closed restaurants are completely hidden from customers */
//   useEffect(() => {
//     (async () => {
//       try {
//         const res = await fetch(REST_API, { headers: authHeaders() });
//         if (res.status === 401) { navigate("/customer/login"); return; }
//         if (res.ok) {
//           const all = await res.json();
//           // ✅ KEY FILTER: only show open restaurants to customers
//           const openOnly = Array.isArray(all) ? all.filter(r => r.isOpen === true) : [];
//           setRestaurants(openOnly);
//         }
//       } catch (e) { console.error(e); }
//       finally { setLoading(false); }
//     })();
//   }, []);

//   /* ─── Open restaurant modal ───
//      FILTER: only show available menu items inside the modal */
//   const openRestaurant = useCallback(async (rest) => {
//     // ✅ Block clicking on closed restaurants (belt-and-suspenders)
//     if (!rest.isOpen) return;

//     setActiveRest(rest);
//     setMenuSearch("");
//     setActiveTab("menu");
//     setMenuLoading(true);
//     setMenuItems([]); setCategories([]); setReviews([]);
//     try {
//       const [mRes, cRes, rRes] = await Promise.all([
//         fetch(`${MENU_API}/restaurant/${rest.restaurantID}`, { headers: authHeaders() }),
//         fetch(CATEGORY_API,                                   { headers: authHeaders() }),
//         fetch(`${REVIEW_API}/restaurant/${rest.restaurantID}`, { headers: authHeaders() }),
//       ]);
//       if (mRes.ok) {
//         const items = await mRes.json();
//         // ✅ KEY FILTER: only show items where isAvailable === true
//         setMenuItems(Array.isArray(items) ? items.filter(i => i.isAvailable === true) : []);
//       }
//       if (cRes.ok) setCategories(await cRes.json());
//       if (rRes.ok) setReviews(await rRes.json());
//     } catch (e) { console.error(e); }
//     finally { setMenuLoading(false); }
//   }, []);

//   /* Filtered restaurants */
//   const visibleRests = useMemo(() => {
//     // All restaurants here are already open (filtered on load)
//     let list = [...restaurants];
//     // "Open Now" filter is effectively same as "All" since we already filtered,
//     // but keep it for UX consistency
//     if (filter === "Top Rated") list = list.filter(r => (r.rating ?? 0) >= 4.5);
//     if (searchQ.trim()) {
//       const q = searchQ.toLowerCase();
//       list = list.filter(r =>
//         r.name?.toLowerCase().includes(q) || r.city?.toLowerCase().includes(q)
//       );
//     }
//     if (sort === "rating") list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
//     if (sort === "name")   list.sort((a, b) => a.name.localeCompare(b.name));
//     return list;
//   }, [restaurants, filter, searchQ, sort]);

//   /* Filtered + grouped menu */
//   const groupedMenu = useMemo(() => {
//     // menuItems are already filtered to isAvailable === true
//     const items = !menuSearch.trim() ? menuItems
//       : menuItems.filter(i =>
//           i.menuItemName?.toLowerCase().includes(menuSearch.toLowerCase()) ||
//           i.menuItemDescription?.toLowerCase().includes(menuSearch.toLowerCase())
//         );
//     const groups = {};
//     items.forEach(item => {
//       const cat =
//         item.categoryName ||
//         categories.find(c =>
//           (c.categoryID ?? c.CategoryID) === (item.categoryID ?? item.CategoryID)
//         )?.categoryName ||
//         "Menu";
//       if (!groups[cat]) groups[cat] = [];
//       groups[cat].push(item);
//     });
//     return groups;
//   }, [menuItems, categories, menuSearch]);

//   const handleAdd = (item) => {
//     addToCart({
//       menuItemID:     item.menuItemID ?? item.menuItemId ?? item.id,
//       menuItemName:   item.menuItemName,
//       menuItemPrice:  item.menuItemPrice,
//       imageUrl:       item.imageUrl ?? item.menuItemImage,
//       restaurantID:   activeRest?.restaurantID,
//       restaurantName: activeRest?.name,
//     });
//   };

//   const handleRemove = (item) => removeFromCart(item.menuItemID ?? item.menuItemId ?? item.id);
//   const getQty       = (item) => getCartItemQuantity(item.menuItemID ?? item.menuItemId ?? item.id);

//   const cartQty   = cart.reduce((s, i) => s + i.quantity, 0);
//   const cartTotal = cart.reduce((s, i) => s + i.menuItemPrice * i.quantity, 0);

//   if (loading) return (
//     <div className="cr-page">
//       <style>{css}</style>
//       <div className="cr-splash">
//         <div className="cr-ring"/>
//         <p style={{ color:"#a8703a", fontWeight:500, fontSize:14, fontFamily:"'DM Sans',sans-serif" }}>
//           Loading restaurants…
//         </p>
//       </div>
//     </div>
//   );

//   return (
//     <div className="cr-page">
//       <style>{css}</style>

//       {/* HERO */}
//       <div className="cr-hero">
//         <div className="cr-hero-orb" style={{ width:400, height:400, top:-200, right:-100, background:"radial-gradient(circle,rgba(255,69,0,.15) 0%,transparent 70%)" }}/>
//         <div className="cr-hero-orb" style={{ width:260, height:260, bottom:-100, left:40, background:"radial-gradient(circle,rgba(255,140,50,.1) 0%,transparent 70%)" }}/>
//         <h1>Discover <em>Great</em><br/>Restaurants Near You</h1>
//         <p>Fresh food, fast delivery — browse every open restaurant and order in seconds.</p>
//         <div className="cr-hero-search">
//           <Search size={16} color="rgba(255,255,255,.5)"/>
//           <input
//             placeholder="Search restaurant or city…"
//             value={searchQ}
//             onChange={e => setSearchQ(e.target.value)}
//           />
//           <button className="cr-hero-search-btn">Search</button>
//         </div>
//       </div>

//       {/* FILTERS */}
//       <div className="cr-filters">
//         {[["All","All"], ["Top Rated","⭐ Top Rated"]].map(([val, label]) => (
//           <button
//             key={val}
//             className={`cr-chip ${filter === val ? "on" : ""}`}
//             onClick={() => setFilter(val)}
//           >
//             {label}
//           </button>
//         ))}
//         <select className="cr-sort" value={sort} onChange={e => setSort(e.target.value)}>
//           <option value="default">Sort: Default</option>
//           <option value="rating">Highest Rated</option>
//           <option value="name">A–Z</option>
//         </select>
//       </div>

//       {/* SECTION HEADER */}
//       <div className="cr-sec">
//         <h2>Open Restaurants</h2>
//         <span className="cr-sec-count">
//           {visibleRests.length} place{visibleRests.length !== 1 ? "s" : ""}
//         </span>
//       </div>

//       {/* GRID — only open restaurants */}
//       <div className="cr-grid">
//         {visibleRests.length === 0 ? (
//           <div className="cr-empty">
//             <div className="cr-empty-icon"><UtensilsCrossed size={32}/></div>
//             <h3>No open restaurants right now</h3>
//             <p>Check back later — restaurants open and close throughout the day.</p>
//           </div>
//         ) : visibleRests.map((r, idx) => (
//           <div
//             key={r.restaurantID}
//             className="cr-card"
//             style={{ animationDelay:`${idx * 50}ms` }}
//             onClick={() => openRestaurant(r)}
//           >
//             <div className="cr-img-wrap">
//               <img
//                 src={r.imageUrl || `https://source.unsplash.com/600x400/?restaurant,${encodeURIComponent(r.name)}`}
//                 alt={r.name}
//                 loading="lazy"
//               />
//               {/* Always "Open" since we filtered — but badge still shown for clarity */}
//               <div className="cr-badge open">● Open</div>
//             </div>
//             <div className="cr-body">
//               <div className="cr-name">{r.name}</div>
//               <div className="cr-meta">
//                 {r.rating != null && (
//                   <span style={{ display:"flex", alignItems:"center", gap:4 }}>
//                     <Star size={13} style={{ fill:"#f59e0b", color:"#f59e0b" }}/>
//                     {Number(r.rating).toFixed(1)}
//                   </span>
//                 )}
//                 {r.city && (
//                   <span style={{ display:"flex", alignItems:"center", gap:4 }}>
//                     <MapPin size={12}/> {r.city}
//                   </span>
//                 )}
//                 <span style={{ display:"flex", alignItems:"center", gap:4 }}>
//                   <Clock size={12}/> 25-35 min
//                 </span>
//               </div>
//               <div className="cr-tags">
//                 <span className="cr-tag">🔥 Accepting orders</span>
//                 {r.city && <span className="cr-tag">{r.city}</span>}
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* MODAL — only opens for open restaurants */}
//       {activeRest && (
//         <div
//           className="cr-modal-bg"
//           onClick={e => { if (e.target.classList.contains("cr-modal-bg")) setActiveRest(null); }}
//         >
//           <div className="cr-sheet">

//             {/* Header */}
//             <div className="cr-sh-header">
//               <img
//                 className="cr-sh-img"
//                 src={activeRest.imageUrl || `https://source.unsplash.com/1200x400/?restaurant,${encodeURIComponent(activeRest.name)}`}
//                 alt={activeRest.name}
//               />
//               <div className="cr-sh-overlay"/>
//               <div className="cr-sh-info">
//                 <div className="cr-sh-name">{activeRest.name}</div>
//                 <div className="cr-sh-pills">
//                   {activeRest.rating != null && (
//                     <div className="cr-sh-pill">
//                       <Star size={12} style={{ fill:"#fbbf24", color:"#fbbf24" }}/>
//                       {Number(activeRest.rating).toFixed(1)}
//                     </div>
//                   )}
//                   {reviews.length > 0 && <div className="cr-sh-pill">💬 {reviews.length} reviews</div>}
//                   {activeRest.city && (
//                     <div className="cr-sh-pill"><MapPin size={12}/> {activeRest.city}</div>
//                   )}
//                   <div className="cr-sh-pill"><Clock size={12}/> 25-35 min</div>
//                   <div className="cr-sh-pill" style={{ background:"rgba(34,197,94,.8)" }}>
//                     ● Open Now
//                   </div>
//                 </div>
//               </div>
//               <button className="cr-sh-close" onClick={() => setActiveRest(null)}>
//                 <X size={16}/>
//               </button>
//             </div>

//             {/* Tabs */}
//             <div style={{ display:"flex", gap:0, borderBottom:"1px solid #f0f0f0", flexShrink:0 }}>
//               {[["menu","Menu"], ["reviews", `Reviews (${reviews.length})`]].map(([tab, label]) => (
//                 <button
//                   key={tab}
//                   onClick={() => setActiveTab(tab)}
//                   style={{
//                     flex:1, padding:"13px 0", border:"none", background:"none",
//                     fontFamily:"'DM Sans',sans-serif",
//                     fontWeight: tab === activeTab ? 700 : 500,
//                     fontSize:14, cursor:"pointer",
//                     color: tab === activeTab ? "var(--brand)" : "var(--muted)",
//                     borderBottom: tab === activeTab ? "2.5px solid var(--brand)" : "2.5px solid transparent",
//                     transition:"all .15s",
//                   }}
//                 >
//                   {label}
//                 </button>
//               ))}
//             </div>

//             {/* Body */}
//             <div className="cr-sh-body">
//               {activeTab === "menu" ? (
//                 <>
//                   <div className="cr-sh-search-wrap">
//                     <div className="cr-sh-search-inner">
//                       <Search className="cr-sh-search-icon" size={16}/>
//                       <input
//                         className="cr-sh-search-inp"
//                         placeholder="Search menu…"
//                         value={menuSearch}
//                         onChange={e => setMenuSearch(e.target.value)}
//                       />
//                     </div>
//                   </div>

//                   {menuLoading ? (
//                     <div style={{ display:"flex", flexDirection:"column", gap:12, paddingTop:8 }}>
//                       {[1,2,3].map(i => <div key={i} className="cr-shimmer"/>)}
//                     </div>
//                   ) : Object.keys(groupedMenu).length === 0 ? (
//                     <div className="cr-empty">
//                       <div className="cr-empty-icon"><UtensilsCrossed size={32}/></div>
//                       <h3>No items available</h3>
//                       <p>
//                         {menuSearch
//                           ? "Try a different search term."
//                           : "This restaurant hasn't added any available items yet."}
//                       </p>
//                     </div>
//                   ) : Object.entries(groupedMenu).map(([cat, items]) => (
//                     <div key={cat}>
//                       <div className="cr-cat-lbl">{cat}</div>
//                       {items.map(item => {
//                         // Items are already filtered to isAvailable===true, so no need
//                         // to show "Unavailable" badge — every item here can be ordered
//                         const qty = getQty(item);
//                         return (
//                           <div key={item.menuItemID ?? item.id} className="cr-mitem">
//                             <img
//                               className="cr-mitem-img"
//                               src={
//                                 item.imageUrl ?? item.menuItemImage ??
//                                 `https://source.unsplash.com/200x200/?food,${encodeURIComponent(item.menuItemName)}`
//                               }
//                               alt={item.menuItemName}
//                               loading="lazy"
//                             />
//                             <div className="cr-mitem-info">
//                               <div className="cr-mitem-name">{item.menuItemName}</div>
//                               {item.menuItemDescription && (
//                                 <div className="cr-mitem-desc">{item.menuItemDescription}</div>
//                               )}
//                               <div className="cr-mitem-price">₹{item.menuItemPrice}</div>
//                             </div>
//                             <div className="cr-mitem-right">
//                               {qty === 0 ? (
//                                 <button className="cr-add-btn" onClick={() => handleAdd(item)}>
//                                   + Add
//                                 </button>
//                               ) : (
//                                 <div className="cr-qty-wrap">
//                                   <button className="cr-qty-btn" onClick={() => handleRemove(item)}>
//                                     <Minus size={13}/>
//                                   </button>
//                                   <span className="cr-qty-num">{qty}</span>
//                                   <button className="cr-qty-btn" onClick={() => handleAdd(item)}>
//                                     <Plus size={13}/>
//                                   </button>
//                                 </div>
//                               )}
//                             </div>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   ))}
//                 </>
//               ) : (
//                 <div style={{ paddingTop:16 }}>
//                   {reviews.length === 0 ? (
//                     <div className="cr-empty">
//                       <div className="cr-empty-icon"><Star size={32}/></div>
//                       <h3>No reviews yet</h3>
//                       <p>Be the first to review this restaurant!</p>
//                     </div>
//                   ) : reviews.map(rev => (
//                     <div
//                       key={rev.reviewID ?? rev.ReviewID}
//                       style={{ padding:"16px 0", borderBottom:"1px solid #f3f3f3" }}
//                     >
//                       <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:8 }}>
//                         <div>
//                           <p style={{ fontWeight:700, fontSize:14, color:"var(--ink)", marginBottom:5 }}>
//                             {rev.userName ?? rev.UserName ?? "Anonymous"}
//                           </p>
//                           <div style={{ display:"flex", gap:3 }}>
//                             {[1,2,3,4,5].map(s => (
//                               <Star
//                                 key={s} size={14}
//                                 style={{
//                                   fill: s <= (rev.rating ?? rev.Rating ?? 0) ? "#f59e0b" : "transparent",
//                                   color: s <= (rev.rating ?? rev.Rating ?? 0) ? "#f59e0b" : "#d1d5db",
//                                 }}
//                               />
//                             ))}
//                           </div>
//                         </div>
//                         <p style={{ fontSize:11, color:"var(--muted)" }}>
//                           {new Date(rev.createdAt ?? rev.CreatedAt).toLocaleDateString("en-IN", {
//                             day:"numeric", month:"short", year:"numeric",
//                           })}
//                         </p>
//                       </div>
//                       {(rev.comment ?? rev.Comment) && (
//                         <p style={{ fontSize:13, color:"var(--muted)", lineHeight:1.6 }}>
//                           {rev.comment ?? rev.Comment}
//                         </p>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* CART BAR */}
//       {cartQty > 0 && (
//         <div className="cr-cart-bar">
//           <div className="cr-cart-inner">
//             <div className="cr-cart-info">
//               <p>{cartQty} item{cartQty !== 1 ? "s" : ""} in cart</p>
//               <p>₹{cartTotal.toFixed(2)}</p>
//             </div>
//             <button className="cr-cart-btn" onClick={() => navigate("/customer/cart")}>
//               <ShoppingCart size={18}/> View Cart
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export { CustomerRestaurants };
// export default CustomerRestaurants;



import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, Star, MapPin, Clock, ShoppingCart,
  Plus, Minus, X, UtensilsCrossed, ChevronRight,
  Flame, Tag, Zap,
} from "lucide-react";
import { useCart } from "../../contexts/CartContext";

const REST_API     = "https://localhost:7217/api/Restaurant";
const MENU_API     = "https://localhost:7217/api/MenuItem";
const REVIEW_API   = "https://localhost:7217/api/Review";
const CATEGORY_API = "https://localhost:7217/api/Category";

const authHeaders = () => {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("jwtToken");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

/* ─── design tokens — matches CustomerLayout + AllItems ──── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&family=Nunito:wght@300;400;600;700;800;900&display=swap');

*,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }

:root {
  --red:      #e8431c;
  --red-dk:   #c23516;
  --saffron:  #f09010;
  --grad:     linear-gradient(135deg,#e8431c 0%,#f09010 100%);
  --glow:     rgba(232,67,28,0.24);
  --bg:       #fdf7f0;
  --card:     #ffffff;
  --pill:     #fff4eb;
  --border:   rgba(232,67,28,0.10);
  --ink:      #1a0c00;
  --ink-md:   #5a2e10;
  --ink-mt:   #b07850;
  --gold:     #f59e0b;
  --green:    #16a34a;
  --font-d:   'Playfair Display', serif;
  --font-b:   'Nunito', sans-serif;
}

@keyframes spin    { to { transform:rotate(360deg); } }
@keyframes fadeUp  { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
@keyframes slideUp { from { opacity:0; transform:translateY(40px); } to { opacity:1; transform:translateY(0); } }
@keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
@keyframes popIn   { from { opacity:0; transform:scale(0.96) translateY(12px); } to { opacity:1; transform:scale(1) translateY(0); } }

/* ── dot-grid page bg ── */
.rp-page {
  font-family: var(--font-b);
  background-color: var(--bg);
  background-image: radial-gradient(circle, rgba(232,67,28,0.05) 1px, transparent 1px);
  background-size: 26px 26px;
  min-height: 100vh;
  padding: 0 0 120px;
  color: var(--ink);
}

/* ────────────────────────────────────────────────
   HERO
──────────────────────────────────────────────── */
.rp-hero {
  position: relative;
  overflow: hidden;
  background: linear-gradient(140deg, #1a0800 0%, #2e1004 50%, #1a0800 100%);
  padding: 56px 48px 60px;
  margin-bottom: 0;
}
.rp-hero-orb {
  position:absolute; border-radius:50%; pointer-events:none;
}
.rp-hero-label {
  display: inline-flex; align-items:center; gap:8px;
  background: rgba(240,144,16,0.18);
  border: 1px solid rgba(240,144,16,0.32);
  border-radius: 100px;
  padding: 6px 20px;
  font-family: var(--font-b);
  font-size: 9px; font-weight:600;
  color: #ffe0a0;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  margin-bottom: 22px;
}
.rp-hero h1 {
  font-family: var(--font-d);
  font-size: clamp(2.6rem, 5vw, 4.6rem);
  font-weight: 900;
  font-style: italic;
  color: #fff;
  line-height: 1.05;
  margin-bottom: 16px;
  letter-spacing: -0.02em;
  text-shadow: 0 4px 40px rgba(0,0,0,0.5);
  max-width: 680px;
}
.rp-hero p {
  font-family: var(--font-b);
  color: rgba(255,255,255,0.58);
  font-size: 16px;
  font-weight: 300;
  margin-bottom: 36px;
  max-width: 480px;
  line-height: 1.75;
  letter-spacing: 0.01em;
}
.rp-hero-search {
  display: flex; align-items: center; gap: 12px;
  background: #fff;
  border-radius: 17px;
  border: 2px solid rgba(255,255,255,0.5);
  padding: 7px 7px 7px 22px;
  max-width: 580px;
  box-shadow: 0 10px 44px rgba(0,0,0,0.28);
  transition: box-shadow 0.2s;
}
.rp-hero-search:focus-within {
  box-shadow: 0 0 0 3px rgba(232,67,28,0.2), 0 10px 44px rgba(0,0,0,0.28);
}
.rp-hero-search input {
  flex: 1; background: none; border: none; outline: none;
  font-family: var(--font-b); font-size: 15px; font-weight: 500;
  color: var(--ink);
}
.rp-hero-search input::placeholder { color: var(--ink-mt); }
.rp-hero-search-btn {
  flex-shrink: 0;
  padding: 12px 26px; border-radius: 12px; border: none;
  background: var(--grad);
  color: #fff; font-weight: 800; font-size: 14px;
  cursor: pointer; font-family: var(--font-b);
  letter-spacing: 0.03em;
  transition: filter 0.15s;
}
.rp-hero-search-btn:hover { filter: brightness(1.1); }

/* hero stats */
.rp-hero-stats {
  display: flex; gap: 36px; margin-top: 28px; flex-wrap: wrap;
}
.rp-hero-stat {
  display: flex; align-items: center; gap: 10px;
  background: rgba(255,255,255,0.08);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.14);
  border-radius: 100px;
  padding: 8px 20px;
}
.rp-hero-stat span { color:rgba(255,255,255,0.82); font-size:13px; font-weight:600; }

/* ────────────────────────────────────────────────
   PROMO STRIP
──────────────────────────────────────────────── */
.rp-strip {
  background: var(--grad);
  padding: 11px 48px;
  display: flex; align-items:center; gap:40px;
  overflow-x: auto; scrollbar-width:none;
}
.rp-strip::-webkit-scrollbar { display:none; }
.rp-strip-item { display:flex; align-items:center; gap:10px; flex-shrink:0; }
.rp-strip-item strong { font-family:var(--font-b); font-size:12px; font-weight:800; color:#fff; letter-spacing:0.08em; }
.rp-strip-div { width:1px; height:14px; background:rgba(255,255,255,0.28); }
.rp-strip-item span  { font-family:var(--font-b); font-size:12px; color:rgba(255,255,255,0.78); }

/* ────────────────────────────────────────────────
   FILTER BAR
──────────────────────────────────────────────── */
.rp-filters {
  background: rgba(253,247,240,0.96);
  backdrop-filter: blur(18px);
  position: sticky; top: 71px; z-index: 98;
  border-bottom: 1px solid var(--border);
  padding: 14px 48px;
  display: flex; align-items:center; gap:12px; flex-wrap:wrap;
}
.rp-chip {
  padding: 9px 22px; border-radius: 100px;
  border: 1.5px solid var(--border);
  background: var(--pill);
  font-family: var(--font-b); font-size:13px; font-weight:600;
  color: var(--ink-md); cursor:pointer;
  transition: all 0.18s; white-space:nowrap;
}
.rp-chip:hover { border-color: var(--saffron); color: var(--red); background: #fff4eb; }
.rp-chip.on {
  background: var(--grad); border-color: var(--red);
  color: #fff; font-weight:800;
  box-shadow: 0 4px 16px var(--glow);
}
.rp-sort {
  appearance:none; margin-left:auto;
  padding: 9px 40px 9px 16px; border-radius:12px;
  border: 1.5px solid var(--border); background:#fff;
  color: var(--ink); font-size:14px; font-weight:600;
  font-family: var(--font-b); cursor:pointer; min-width:190px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23b07850' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
}
.rp-sort:focus { outline:none; border-color:var(--red); }
.rp-count { font-family:var(--font-b); font-size:14px; color:var(--ink-mt); }
.rp-count strong { color:var(--red); font-size:18px; font-weight:800; }

/* ────────────────────────────────────────────────
   SECTION HEADING
──────────────────────────────────────────────── */
.rp-section {
  max-width: 1380px; margin: 52px auto 0; padding: 0 48px;
}
.rp-section-eyebrow {
  font-family:var(--font-b); font-size:11px; font-weight:800;
  color:var(--red); letter-spacing:0.20em; text-transform:uppercase;
  margin-bottom:8px;
}
.rp-section-title {
  font-family:var(--font-d); font-style:italic;
  font-size: clamp(2rem,4vw,3.2rem); font-weight:900;
  color:var(--ink); letter-spacing:-0.015em; line-height:1.05;
  margin-bottom:16px;
}
.rp-section-rule {
  display:flex; gap:4px; align-items:center; margin-bottom:32px;
}
.rp-section-rule div:nth-child(1) { height:3px; width:52px; border-radius:100px; background:var(--grad); }
.rp-section-rule div:nth-child(2) { height:3px; width:18px; border-radius:100px; background:rgba(232,67,28,0.2); }
.rp-section-rule div:nth-child(3) { height:3px; width:8px;  border-radius:100px; background:rgba(232,67,28,0.1); }

/* ────────────────────────────────────────────────
   RESTAURANT GRID
──────────────────────────────────────────────── */
.rp-grid {
  max-width: 1380px; margin:0 auto; padding:0 48px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 26px;
}

.rp-card {
  background: var(--card);
  border-radius: 22px;
  border: 1px solid var(--border);
  overflow: hidden;
  cursor: pointer;
  animation: fadeUp 0.45s ease both;
  transition: transform 0.32s cubic-bezier(0.22,1,0.36,1), box-shadow 0.32s;
  box-shadow: 0 2px 16px rgba(232,67,28,0.05);
}
.rp-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 24px 60px rgba(232,67,28,0.13), 0 0 0 1.5px rgba(232,67,28,0.18);
}
.rp-card:hover .rp-card-img { transform: scale(1.07); }

.rp-card-img-wrap {
  position:relative; height:200px; overflow:hidden; background:#ffe8d4;
}
.rp-card-img {
  width:100%; height:100%; object-fit:cover;
  transition: transform 0.5s cubic-bezier(0.22,1,0.36,1);
}
.rp-card-img-overlay {
  position:absolute; inset:0;
  background: linear-gradient(to top, rgba(0,0,0,0.52) 0%, transparent 52%);
}
.rp-card-open-badge {
  position:absolute; top:13px; left:13px;
  display:flex; align-items:center; gap:5px;
  background:rgba(22,163,74,0.9); backdrop-filter:blur(8px);
  color:#fff; font-size:11px; font-weight:800;
  padding:4px 12px; border-radius:100px;
  font-family:var(--font-b); letter-spacing:0.06em;
}
.rp-card-open-badge .dot {
  width:6px; height:6px; border-radius:50%; background:#fff;
  animation: pulse-dot 1.5s ease infinite;
}
@keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.4} }

.rp-card-rating {
  position:absolute; top:13px; right:13px;
  display:flex; align-items:center; gap:5px;
  background:rgba(0,0,0,0.55); backdrop-filter:blur(8px);
  color:#fff; font-size:12px; font-weight:700;
  padding:4px 10px; border-radius:8px;
  font-family:var(--font-b);
}
.rp-card-time {
  position:absolute; bottom:12px; right:13px;
  display:flex; align-items:center; gap:5px;
  background:rgba(0,0,0,0.55); backdrop-filter:blur(8px);
  color:rgba(255,255,255,0.9); font-size:11px; font-weight:600;
  padding:4px 10px; border-radius:8px;
  font-family:var(--font-b);
}
.rp-card-body { padding:17px 19px 21px; }
.rp-card-name {
  font-family: var(--font-d);
  font-size:19px; font-weight:700;
  color: var(--ink); margin-bottom:7px; line-height:1.25;
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
}
.rp-card-meta {
  display:flex; align-items:center; gap:14px;
  font-size:12px; color:var(--ink-mt); margin-bottom:12px;
  flex-wrap:wrap;
}
.rp-card-meta span { display:flex; align-items:center; gap:4px; }
.rp-card-tags { display:flex; gap:7px; flex-wrap:wrap; }
.rp-card-tag {
  padding:3px 11px; border-radius:100px;
  background:var(--pill); border:1px solid var(--border);
  font-size:11px; font-weight:700; color:var(--red);
  font-family:var(--font-b); letter-spacing:0.04em;
}

/* ────────────────────────────────────────────────
   EMPTY STATE
──────────────────────────────────────────────── */
.rp-empty {
  grid-column:1/-1; text-align:center; padding:90px 20px;
}
.rp-empty-icon {
  width:76px; height:76px; border-radius:24px;
  background:var(--pill); border:1.5px solid var(--border);
  display:flex; align-items:center; justify-content:center;
  margin:0 auto 22px; color:var(--red);
}
.rp-empty h3 { font-family:var(--font-d); font-style:italic; font-size:24px; font-weight:700; color:var(--ink); margin-bottom:8px; }
.rp-empty p  { font-family:var(--font-b); color:var(--ink-mt); font-size:14px; }

/* ────────────────────────────────────────────────
   LOADING SPLASH
──────────────────────────────────────────────── */
.rp-splash {
  display:flex; flex-direction:column;
  align-items:center; justify-content:center;
  min-height:70vh; gap:18px;
}
.rp-ring {
  width:52px; height:52px; border-radius:50%;
  border:3px solid rgba(232,67,28,0.14);
  border-top-color:var(--red);
  animation:spin 0.82s linear infinite;
}
.rp-splash p {
  font-family:var(--font-b); color:var(--ink-mt);
  font-size:11px; font-weight:600;
  letter-spacing:0.22em; text-transform:uppercase;
}

/* ────────────────────────────────────────────────
   SHIMMER SKELETON
──────────────────────────────────────────────── */
.rp-shimmer {
  background:linear-gradient(90deg,#f5ede3 25%,#ffe8d4 50%,#f5ede3 75%);
  background-size:200% 100%;
  animation:shimmer 1.4s infinite;
  border-radius:12px;
}

/* ────────────────────────────────────────────────
   MODAL OVERLAY
──────────────────────────────────────────────── */
.rp-modal-bg {
  position:fixed; inset:0; z-index:500;
  background:rgba(26,12,0,0.60);
  backdrop-filter:blur(7px);
  display:flex; align-items:flex-end; justify-content:center;
  animation:fadeIn 0.22s ease;
}
@media(min-width:720px) { .rp-modal-bg { align-items:center; } }

/* ────────────────────────────────────────────────
   MODAL SHEET
──────────────────────────────────────────────── */
.rp-sheet {
  background:#fff;
  width:100%; max-width:900px;
  border-radius:28px 28px 0 0;
  max-height:93vh; overflow:hidden;
  display:flex; flex-direction:column;
  animation:popIn 0.32s cubic-bezier(0.16,1,0.3,1);
  box-shadow:0 -8px 60px rgba(26,12,0,0.22);
}
@media(min-width:720px) {
  .rp-sheet { border-radius:24px; max-height:88vh; margin:20px; }
}

/* sheet header image */
.rp-sh-imgwrap { position:relative; flex-shrink:0; height:220px; overflow:hidden; background:#ffe8d4; }
.rp-sh-imgwrap img { width:100%; height:100%; object-fit:cover; }
.rp-sh-overlay {
  position:absolute; inset:0;
  background:linear-gradient(to top,rgba(10,4,0,0.80) 0%,rgba(10,4,0,0.1) 55%,transparent 100%);
}
.rp-sh-close {
  position:absolute; top:15px; right:15px;
  width:38px; height:38px; border-radius:50%;
  border:1.5px solid rgba(255,255,255,0.22);
  background:rgba(0,0,0,0.42); backdrop-filter:blur(10px);
  color:#fff; cursor:pointer;
  display:flex; align-items:center; justify-content:center;
  transition:background 0.15s;
}
.rp-sh-close:hover { background:rgba(0,0,0,0.65); }

/* sheet header info — overlaid on image */
.rp-sh-info {
  position:absolute; bottom:0; left:0; right:0;
  padding:22px 26px;
}
.rp-sh-name {
  font-family:var(--font-d); font-style:italic;
  font-size:26px; font-weight:900;
  color:#fff; margin-bottom:10px; line-height:1.1;
  text-shadow:0 2px 16px rgba(0,0,0,0.4);
}
.rp-sh-pills { display:flex; gap:8px; flex-wrap:wrap; }
.rp-sh-pill {
  display:flex; align-items:center; gap:5px;
  padding:5px 13px; border-radius:100px;
  background:rgba(255,255,255,0.15); backdrop-filter:blur(10px);
  border:1px solid rgba(255,255,255,0.22);
  font-size:12px; font-weight:700; color:#fff;
  font-family:var(--font-b);
}
.rp-sh-pill.open-pill { background:rgba(22,163,74,0.75); border-color:rgba(22,163,74,0.5); }

/* tabs */
.rp-tabs {
  display:flex; flex-shrink:0;
  border-bottom:1.5px solid rgba(232,67,28,0.10);
  background:#fff;
}
.rp-tab {
  flex:1; padding:14px 0; border:none; background:none;
  font-family:var(--font-b); font-size:14px; cursor:pointer;
  color:var(--ink-mt); font-weight:600;
  border-bottom:2.5px solid transparent;
  transition:all 0.15s;
}
.rp-tab.on { color:var(--red); font-weight:800; border-bottom-color:var(--red); }

/* sheet body */
.rp-sh-body { overflow-y:auto; flex:1; padding:0 26px 26px; }

/* sticky inner search */
.rp-sh-search-wrap {
  position:sticky; top:0; background:#fff; z-index:10;
  padding:16px 0 12px;
}
.rp-sh-search-inner { position:relative; }
.rp-sh-search-inner svg { position:absolute; left:14px; top:50%; transform:translateY(-50%); color:var(--ink-mt); pointer-events:none; }
.rp-sh-search-inp {
  width:100%; padding:11px 16px 11px 44px;
  border:1.5px solid var(--border); border-radius:13px;
  font-family:var(--font-b); font-size:14px; font-weight:500;
  background:#fdf7f0; color:var(--ink); outline:none;
  transition:border-color 0.2s, box-shadow 0.2s;
}
.rp-sh-search-inp::placeholder { color:var(--ink-mt); }
.rp-sh-search-inp:focus {
  border-color:var(--red); background:#fff;
  box-shadow:0 0 0 3px rgba(232,67,28,0.08);
}

/* category label */
.rp-cat-lbl {
  font-family:var(--font-d); font-style:italic;
  font-size:17px; font-weight:700; color:var(--ink);
  padding:18px 0 10px;
  border-bottom:1.5px solid var(--border);
  margin-bottom:14px; letter-spacing:0.01em;
}

/* menu item row */
.rp-mitem {
  display:flex; gap:16px; padding:16px 0;
  border-bottom:1px solid rgba(232,67,28,0.07);
  align-items:center;
}
.rp-mitem:last-child { border-bottom:none; }
.rp-mitem-img {
  width:96px; height:96px; border-radius:16px;
  object-fit:cover; flex-shrink:0; background:#ffe8d4;
  border:1px solid var(--border);
}
.rp-mitem-info { flex:1; min-width:0; }
.rp-mitem-name {
  font-family:var(--font-d); font-size:16px; font-weight:700;
  color:var(--ink); margin-bottom:5px; line-height:1.3;
}
.rp-mitem-desc {
  font-family:var(--font-b); font-size:12px; color:var(--ink-mt);
  line-height:1.6; margin-bottom:7px;
  overflow:hidden; display:-webkit-box;
  -webkit-line-clamp:2; -webkit-box-orient:vertical;
}
.rp-mitem-price {
  font-family:'Playfair Display',serif;
  font-weight:900; font-size:18px; color:var(--ink);
  letter-spacing:-0.01em;
}
.rp-mitem-right { display:flex; flex-direction:column; align-items:flex-end; gap:10px; flex-shrink:0; }

/* add button */
.rp-add-btn {
  padding:9px 20px; border-radius:12px;
  border:2px solid var(--red);
  background:transparent; color:var(--red);
  font-weight:900; font-size:13px; cursor:pointer;
  font-family:var(--font-b); letter-spacing:0.05em;
  transition:all 0.18s; display:flex; align-items:center; gap:6px;
}
.rp-add-btn:hover { background:var(--red); color:#fff; }
.rp-add-btn.done { background:var(--green); border-color:var(--green); color:#fff; }

/* qty stepper */
.rp-qty-wrap {
  display:flex; align-items:center; gap:0;
  border:2px solid var(--red); border-radius:12px; overflow:hidden;
}
.rp-qty-btn {
  width:36px; height:36px; border:none;
  background:var(--grad); color:#fff;
  font-size:16px; cursor:pointer; font-weight:700;
  display:flex; align-items:center; justify-content:center;
  transition:filter 0.15s;
}
.rp-qty-btn:hover { filter:brightness(1.1); }
.rp-qty-num {
  width:34px; text-align:center;
  font-family:var(--font-d); font-weight:900; font-size:17px;
  color:var(--red);
}

/* reviews */
.rp-review {
  padding:18px 0; border-bottom:1px solid rgba(232,67,28,0.08);
}
.rp-review:last-child { border-bottom:none; }
.rp-review-name { font-family:var(--font-d); font-weight:700; font-size:15px; color:var(--ink); margin-bottom:5px; }
.rp-review-comment { font-family:var(--font-b); font-size:13px; color:var(--ink-mt); line-height:1.65; margin-top:8px; }
.rp-review-date { font-family:var(--font-b); font-size:11px; color:var(--ink-mt); }

/* ────────────────────────────────────────────────
   STICKY CART BAR
──────────────────────────────────────────────── */
.rp-cart-bar {
  position:fixed; bottom:0; left:0; right:0; z-index:600;
  padding:0 20px 22px;
  pointer-events:none;
}
.rp-cart-inner {
  max-width:540px; margin:0 auto;
  background:var(--grad); color:#fff;
  border-radius:18px; padding:16px 28px;
  display:flex; align-items:center; justify-content:space-between;
  box-shadow:0 14px 44px var(--glow);
  cursor:pointer; pointer-events:all;
  transition:filter 0.2s, transform 0.2s;
}
.rp-cart-inner:hover { filter:brightness(1.08); transform:translateY(-2px); }
.rp-cart-left { display:flex; align-items:center; gap:14px; }
.rp-cart-icon {
  width:36px; height:36px; border-radius:11px;
  background:rgba(255,255,255,0.2);
  display:flex; align-items:center; justify-content:center;
}
.rp-cart-label-sm { font-family:var(--font-b); font-size:11px; opacity:0.82; }
.rp-cart-label-lg { font-family:var(--font-d); font-style:italic; font-size:20px; font-weight:700; }
.rp-cart-price { font-family:var(--font-d); font-weight:900; font-size:24px; letter-spacing:-0.01em; text-align:right; }
.rp-cart-fee   { font-family:var(--font-b); font-size:11px; opacity:0.72; text-align:right; }

/* scrollbar */
::-webkit-scrollbar { width:4px; }
::-webkit-scrollbar-track { background:var(--bg); }
::-webkit-scrollbar-thumb { background:var(--saffron); border-radius:4px; }

/* responsive */
@media(max-width:900px) {
  .rp-hero { padding:40px 28px 44px; }
  .rp-filters { padding:14px 20px; }
  .rp-section { padding:0 20px; }
  .rp-grid { padding:0 20px; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:18px; }
  .rp-strip { padding:11px 20px; }
}
@media(max-width:580px) {
  .rp-grid { grid-template-columns:1fr 1fr; gap:12px; }
  .rp-sh-body { padding:0 16px 20px; }
  .rp-mitem-img { width:80px; height:80px; }
}
`;

/* ─────────────────────────────────────────────────────────── */

const CustomerRestaurants = () => {
  const navigate = useNavigate();
  const { cart, addToCart, removeFromCart, getCartItemQuantity } = useCart();

  const [restaurants, setRestaurants] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [searchQ,     setSearchQ]     = useState("");
  const [filter,      setFilter]      = useState("All");
  const [sort,        setSort]        = useState("default");

  const [activeRest,  setActiveRest]  = useState(null);
  const [menuItems,   setMenuItems]   = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [reviews,     setReviews]     = useState([]);
  const [menuLoading, setMenuLoading] = useState(false);
  const [menuSearch,  setMenuSearch]  = useState("");
  const [activeTab,   setActiveTab]   = useState("menu");

  /* load restaurants */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(REST_API, { headers: authHeaders() });
        if (res.status === 401) { navigate("/customer/login"); return; }
        if (res.ok) {
          const all = await res.json();
          setRestaurants(Array.isArray(all) ? all.filter(r => r.isOpen === true) : []);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  /* open restaurant drawer */
  const openRestaurant = useCallback(async (rest) => {
    if (!rest.isOpen) return;
    setActiveRest(rest);
    setMenuSearch(""); setActiveTab("menu");
    setMenuLoading(true); setMenuItems([]); setCategories([]); setReviews([]);
    try {
      const [mRes, cRes, rRes] = await Promise.all([
        fetch(`${MENU_API}/restaurant/${rest.restaurantID}`, { headers: authHeaders() }),
        fetch(CATEGORY_API,                                   { headers: authHeaders() }),
        fetch(`${REVIEW_API}/restaurant/${rest.restaurantID}`, { headers: authHeaders() }),
      ]);
      if (mRes.ok) {
        const items = await mRes.json();
        setMenuItems(Array.isArray(items) ? items.filter(i => i.isAvailable === true) : []);
      }
      if (cRes.ok) setCategories(await cRes.json());
      if (rRes.ok) setReviews(await rRes.json());
    } catch (e) { console.error(e); }
    finally { setMenuLoading(false); }
  }, []);

  /* filtered restaurant list */
  const visibleRests = useMemo(() => {
    let list = [...restaurants];
    if (filter === "Top Rated") list = list.filter(r => (r.rating ?? 0) >= 4.5);
    if (searchQ.trim()) {
      const q = searchQ.toLowerCase();
      list = list.filter(r =>
        r.name?.toLowerCase().includes(q) || r.city?.toLowerCase().includes(q)
      );
    }
    if (sort === "rating") list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    if (sort === "name")   list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [restaurants, filter, searchQ, sort]);

  /* grouped menu */
  const groupedMenu = useMemo(() => {
    const items = !menuSearch.trim() ? menuItems
      : menuItems.filter(i =>
          i.menuItemName?.toLowerCase().includes(menuSearch.toLowerCase()) ||
          i.menuItemDescription?.toLowerCase().includes(menuSearch.toLowerCase())
        );
    const groups = {};
    items.forEach(item => {
      const cat =
        item.categoryName ||
        categories.find(c =>
          (c.categoryID ?? c.CategoryID) === (item.categoryID ?? item.CategoryID)
        )?.categoryName || "Menu";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    return groups;
  }, [menuItems, categories, menuSearch]);

  const handleAdd = item => addToCart({
    menuItemID:    item.menuItemID ?? item.menuItemId ?? item.id,
    menuItemName:  item.menuItemName,
    menuItemPrice: item.menuItemPrice,
    imageUrl:      item.imageUrl ?? item.menuItemImage,
    restaurantID:  activeRest?.restaurantID,
    restaurantName:activeRest?.name,
  });
  const handleRemove = item => removeFromCart(item.menuItemID ?? item.menuItemId ?? item.id);
  const getQty       = item => getCartItemQuantity(item.menuItemID ?? item.menuItemId ?? item.id);

  const cartQty   = cart.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cart.reduce((s, i) => s + i.menuItemPrice * i.quantity, 0);

  /* ── LOADING ── */
  if (loading) return (
    <div className="rp-page">
      <style>{CSS}</style>
      <div className="rp-splash">
        <div className="rp-ring" />
        <p>Finding restaurants near you…</p>
      </div>
    </div>
  );

  /* ── RENDER ── */
  return (
    <div className="rp-page">
      <style>{CSS}</style>

      {/* ══ HERO ══════════════════════════════════════════════ */}
      <div className="rp-hero">
        <div className="rp-hero-orb" style={{ width:500, height:500, top:-220, right:-80, background:"radial-gradient(circle,rgba(232,67,28,0.13) 0%,transparent 70%)" }} />
        <div className="rp-hero-orb" style={{ width:320, height:320, bottom:-140, left:40, background:"radial-gradient(circle,rgba(240,144,16,0.10) 0%,transparent 70%)" }} />

        <div className="rp-hero-label">🍽 Open Now</div>

        <h1>Discover <em style={{ fontStyle:"italic", background:"linear-gradient(135deg,#f09010,#ff6b35)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Great</em><br/>Restaurants Near You</h1>
        <p>Fresh food, fast delivery — browse every open restaurant and order in seconds.</p>

        <div className="rp-hero-search">
          <Search size={19} style={{ color:"#b07850", flexShrink:0 }} />
          <input
            placeholder="Search restaurant or city…"
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
          />
          {searchQ && (
            <button onClick={() => setSearchQ("")} style={{ background:"none", border:"none", cursor:"pointer", color:"#b07850", display:"flex", flexShrink:0 }}>
              <X size={15} />
            </button>
          )}
          <button className="rp-hero-search-btn">Find</button>
        </div>

        <div className="rp-hero-stats">
          {[["🏪", `${restaurants.length} open`], ["⚡", "25–40 min"], ["⭐", "Top rated"]].map(([icon, txt]) => (
            <div key={txt} className="rp-hero-stat">
              <span style={{ fontSize:15 }}>{icon}</span>
              <span>{txt}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ══ PROMO STRIP ════════════════════════════════════════ */}
      {/* <div className="rp-strip">
        {[["🔥 HOT DEALS","Up to 40% off today"], ["🚀 FREE DELIVERY","On orders above ₹299"], ["🌟 NEW SPOTS","Freshly onboarded this week"]].map(([t,d]) => (
          <div key={t} className="rp-strip-item">
            <strong>{t}</strong>
            <div className="rp-strip-div" />
            <span>{d}</span>
          </div>
        ))}
      </div> */}

      {/* ══ FILTER BAR ═════════════════════════════════════════ */}
      <div className="rp-filters">
        {[["All","All"], ["Top Rated","⭐ Top Rated"]].map(([val, lbl]) => (
          <button key={val} className={`rp-chip${filter === val ? " on" : ""}`} onClick={() => setFilter(val)}>
            {lbl}
          </button>
        ))}
        <select className="rp-sort" value={sort} onChange={e => setSort(e.target.value)}>
          <option value="default">Sort: Relevance</option>
          <option value="rating">Highest Rated</option>
          <option value="name">A – Z</option>
        </select>
        <span className="rp-count">
          <strong>{visibleRests.length}</strong> restaurants
        </span>
      </div>

      {/* ══ SECTION HEADING ════════════════════════════════════ */}
      <div className="rp-section">
        <p className="rp-section-eyebrow">🏪 Restaurants</p>
        <h2 className="rp-section-title">Open & Ready to Order</h2>
        <div className="rp-section-rule">
          <div /><div /><div />
        </div>
      </div>

      {/* ══ GRID ═══════════════════════════════════════════════ */}
      <div className="rp-grid">
        {visibleRests.length === 0 ? (
          <div className="rp-empty">
            <div className="rp-empty-icon"><UtensilsCrossed size={34} /></div>
            <h3>No open restaurants right now</h3>
            <p>Check back soon — restaurants open throughout the day.</p>
          </div>
        ) : visibleRests.map((r, idx) => (
          <div
            key={r.restaurantID}
            className="rp-card"
            style={{ animationDelay:`${Math.min(idx * 45, 450)}ms` }}
            onClick={() => openRestaurant(r)}
          >
            <div className="rp-card-img-wrap">
              <img
                className="rp-card-img"
                src={r.imageUrl || `https://source.unsplash.com/600x400/?restaurant,${encodeURIComponent(r.name)}`}
                alt={r.name} loading="lazy"
              />
              <div className="rp-card-img-overlay" />
              <div className="rp-card-open-badge">
                <div className="dot" /> Open
              </div>
              {r.rating != null && (
                <div className="rp-card-rating">
                  <Star size={11} fill="#f59e0b" style={{ color:"#f59e0b" }} />
                  {Number(r.rating).toFixed(1)}
                </div>
              )}
              <div className="rp-card-time">
                <Clock size={11} />
                25–35 min
              </div>
            </div>
            <div className="rp-card-body">
              <div className="rp-card-name">{r.name}</div>
              <div className="rp-card-meta">
                {r.city && <span><MapPin size={12} /> {r.city}</span>}
                <span><Flame size={12} style={{ color:"#e8431c" }} /> Accepting orders</span>
              </div>
              <div className="rp-card-tags">
                <span className="rp-card-tag">🔥 Popular</span>
                {r.city && <span className="rp-card-tag">{r.city}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ══ RESTAURANT MODAL ═══════════════════════════════════ */}
      {activeRest && (
        <div
          className="rp-modal-bg"
          onClick={e => { if (e.target.classList.contains("rp-modal-bg")) setActiveRest(null); }}
        >
          <div className="rp-sheet">

            {/* header image */}
            <div className="rp-sh-imgwrap">
              <img
                src={activeRest.imageUrl || `https://source.unsplash.com/1200x400/?restaurant,${encodeURIComponent(activeRest.name)}`}
                alt={activeRest.name}
              />
              <div className="rp-sh-overlay" />
              <div className="rp-sh-info">
                <div className="rp-sh-name">{activeRest.name}</div>
                <div className="rp-sh-pills">
                  {activeRest.rating != null && (
                    <div className="rp-sh-pill">
                      <Star size={12} fill="#fbbf24" style={{ color:"#fbbf24" }} />
                      {Number(activeRest.rating).toFixed(1)}
                    </div>
                  )}
                  {reviews.length > 0 && <div className="rp-sh-pill">💬 {reviews.length} reviews</div>}
                  {activeRest.city && <div className="rp-sh-pill"><MapPin size={12} /> {activeRest.city}</div>}
                  <div className="rp-sh-pill"><Clock size={12} /> 25–35 min</div>
                  <div className="rp-sh-pill open-pill">● Open Now</div>
                </div>
              </div>
              <button className="rp-sh-close" onClick={() => setActiveRest(null)}>
                <X size={17} />
              </button>
            </div>

            {/* tabs */}
            <div className="rp-tabs">
              {[["menu","Menu"], ["reviews",`Reviews (${reviews.length})`]].map(([tab, lbl]) => (
                <button key={tab} className={`rp-tab${activeTab === tab ? " on" : ""}`} onClick={() => setActiveTab(tab)}>
                  {lbl}
                </button>
              ))}
            </div>

            {/* body */}
            <div className="rp-sh-body">
              {activeTab === "menu" ? (
                <>
                  {/* sticky search */}
                  <div className="rp-sh-search-wrap">
                    <div className="rp-sh-search-inner">
                      <Search size={16} />
                      <input
                        className="rp-sh-search-inp"
                        placeholder="Search dishes…"
                        value={menuSearch}
                        onChange={e => setMenuSearch(e.target.value)}
                      />
                    </div>
                  </div>

                  {menuLoading ? (
                    <div style={{ display:"flex", flexDirection:"column", gap:14, paddingTop:8 }}>
                      {[1,2,3,4].map(i => (
                        <div key={i} style={{ display:"flex", gap:14, alignItems:"center" }}>
                          <div className="rp-shimmer" style={{ width:90, height:90, borderRadius:16, flexShrink:0 }} />
                          <div style={{ flex:1, display:"flex", flexDirection:"column", gap:8 }}>
                            <div className="rp-shimmer" style={{ height:16, width:"70%", borderRadius:8 }} />
                            <div className="rp-shimmer" style={{ height:12, width:"90%", borderRadius:8 }} />
                            <div className="rp-shimmer" style={{ height:12, width:"40%", borderRadius:8 }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : Object.keys(groupedMenu).length === 0 ? (
                    <div className="rp-empty" style={{ paddingTop:60 }}>
                      <div className="rp-empty-icon"><UtensilsCrossed size={32} /></div>
                      <h3>{menuSearch ? "Nothing matches your search" : "No items available"}</h3>
                      <p>{menuSearch ? "Try a different search term." : "This restaurant hasn't added any items yet."}</p>
                    </div>
                  ) : Object.entries(groupedMenu).map(([cat, items]) => (
                    <div key={cat}>
                      <div className="rp-cat-lbl">{cat}</div>
                      {items.map(item => {
                        const qty  = getQty(item);
                        const done = false;
                        return (
                          <div key={item.menuItemID ?? item.id} className="rp-mitem">
                            <img
                              className="rp-mitem-img"
                              src={item.imageUrl ?? item.menuItemImage ?? `https://source.unsplash.com/200x200/?food,${encodeURIComponent(item.menuItemName)}`}
                              alt={item.menuItemName} loading="lazy"
                            />
                            <div className="rp-mitem-info">
                              <div className="rp-mitem-name">{item.menuItemName}</div>
                              {item.menuItemDescription && (
                                <div className="rp-mitem-desc">{item.menuItemDescription}</div>
                              )}
                              <div className="rp-mitem-price">₹{item.menuItemPrice}</div>
                            </div>
                            <div className="rp-mitem-right">
                              {qty === 0 ? (
                                <button className="rp-add-btn" onClick={() => handleAdd(item)}>
                                  <Plus size={14} /> ADD
                                </button>
                              ) : (
                                <div className="rp-qty-wrap">
                                  <button className="rp-qty-btn" onClick={() => handleRemove(item)}>
                                    <Minus size={14} />
                                  </button>
                                  <span className="rp-qty-num">{qty}</span>
                                  <button className="rp-qty-btn" onClick={() => handleAdd(item)}>
                                    <Plus size={14} />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </>
              ) : (
                /* reviews tab */
                <div style={{ paddingTop:16 }}>
                  {reviews.length === 0 ? (
                    <div className="rp-empty" style={{ paddingTop:60 }}>
                      <div className="rp-empty-icon"><Star size={32} /></div>
                      <h3>No reviews yet</h3>
                      <p>Be the first to review this restaurant!</p>
                    </div>
                  ) : reviews.map(rev => (
                    <div key={rev.reviewID ?? rev.ReviewID} className="rp-review">
                      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:6 }}>
                        <div>
                          <div className="rp-review-name">{rev.userName ?? rev.UserName ?? "Anonymous"}</div>
                          <div style={{ display:"flex", gap:3, marginTop:4 }}>
                            {[1,2,3,4,5].map(s => (
                              <Star key={s} size={13} style={{
                                fill: s <= (rev.rating ?? rev.Rating ?? 0) ? "#f59e0b" : "transparent",
                                color: s <= (rev.rating ?? rev.Rating ?? 0) ? "#f59e0b" : "#e5e7eb",
                              }} />
                            ))}
                          </div>
                        </div>
                        <span className="rp-review-date">
                          {new Date(rev.createdAt ?? rev.CreatedAt).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}
                        </span>
                      </div>
                      {(rev.comment ?? rev.Comment) && (
                        <p className="rp-review-comment">{rev.comment ?? rev.Comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══ STICKY CART BAR ════════════════════════════════════ */}
      {cartQty > 0 && (
        <div className="rp-cart-bar">
          <div className="rp-cart-inner" onClick={() => navigate("/customer/cart")}>
            <div className="rp-cart-left">
              <div className="rp-cart-icon"><ShoppingCart size={18} /></div>
              <div>
                <div className="rp-cart-label-sm">{cartQty} item{cartQty > 1 ? "s" : ""} in cart</div>
                <div className="rp-cart-label-lg">View Cart</div>
              </div>
            </div>
            <div>
              <div className="rp-cart-price">₹{cartTotal.toFixed(0)}</div>
              <div className="rp-cart-fee">+ delivery fee</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { CustomerRestaurants };
export default CustomerRestaurants;