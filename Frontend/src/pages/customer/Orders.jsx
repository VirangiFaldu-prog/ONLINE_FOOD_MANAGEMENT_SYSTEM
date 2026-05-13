// import { useEffect, useState, useRef } from "react";
// import { useNavigate, useSearchParams } from "react-router-dom";
// import {
//   ShoppingBag, Clock, CheckCircle, XCircle,
//   Star, ChevronDown, ChevronUp, RefreshCw,
//   Utensils, MapPin, ReceiptText, Bike,
//   ChefHat, BadgeCheck, Ban, X, AlertTriangle, Loader2,
// } from "lucide-react";
// import axiosInstance from "../../api/axiosInstance";

// /* ══════════════════════════════════════════════════════════
//    NORMALISE — handles both camelCase & PascalCase from API
// ══════════════════════════════════════════════════════════ */
// const n = (o) => ({
//   orderID:         o.orderID         ?? o.OrderID         ?? 0,
//   orderStatus:     o.orderStatus     ?? o.OrderStatus     ?? "",
//   totalAmount:     o.totalAmount     ?? o.TotalAmount      ?? 0,
//   orderDate:       o.orderDate       ?? o.OrderDate        ?? o.createdAt ?? o.CreatedAt ?? null,
//   restaurantName:  o.restaurantName  ?? o.RestaurantName   ?? "",
//   restaurantID:    o.restaurantID    ?? o.RestaurantID     ?? 0,
//   deliveryAddress: o.deliveryAddress ?? o.DeliveryAddress  ?? "",
//   phone:           o.phone           ?? o.Phone            ?? "",
// });

// const nItem = (i) => {
//   const mi = i.menuItem ?? i.MenuItem ?? {};
//   return {
//     orderItemID:    i.orderItemID    ?? i.OrderItemID    ?? 0,
//     quantity:       i.quantity       ?? i.Quantity       ?? 0,
//     orderItemPrice: i.orderItemPrice ?? i.OrderItemPrice ?? 0,
//     name:  mi.menuItemName ?? mi.MenuItemName ?? mi.name ?? mi.Name ?? "Item",
//     image: mi.imageUrl     ?? mi.ImageUrl     ?? mi.menuItemImage ?? mi.MenuItemImage ?? "",
//   };
// };

// /* ══════════════════════════════════════════════════════════
//    ORDER STATUS MAP
   
//    Both "Completed" (set by Restaurant) AND "Delivered"
//    (set by DeliveryController cascade) map to step 4 GREEN.
   
//    Customer should NEVER see gray for a delivered order.
// ══════════════════════════════════════════════════════════ */
// const ORDER_STATUS = {
//   //  key              label              color     bg        border    step   cancel
//   Pending:        ["Order Placed",   "#f97316","#fff7ed","#fed7aa",  0, true ],
//   Confirmed:      ["Confirmed",      "#8b5cf6","#f5f3ff","#ddd6fe",  1, true ],
//   Preparing:      ["Preparing",      "#0ea5e9","#f0f9ff","#bae6fd",  2, false],
//   OutForDelivery: ["Out for Delivery","#10b981","#f0fdf4","#a7f3d0", 3, false],
//   Completed:      ["Delivered",      "#16a34a","#f0fdf4","#86efac",  4, false],
//   Delivered:      ["Delivered",      "#16a34a","#f0fdf4","#86efac",  4, false], // delivery cascade
//   Cancelled:      ["Cancelled",      "#ef4444","#fef2f2","#fca5a5", -1, false],
// };

// const getSt = (raw) => {
//   if (!raw) return { label:"Unknown",color:"#64748b",bg:"#f8fafc",border:"#e2e8f0",step:0,cancel:false };
//   const s = raw.trim();
//   const found = ORDER_STATUS[s]
//     ?? ORDER_STATUS[s.charAt(0).toUpperCase()+s.slice(1)]
//     ?? ORDER_STATUS[s.toLowerCase()];
//   if (!found) return { label:s, color:"#64748b", bg:"#f8fafc", border:"#e2e8f0", step:0, cancel:false };
//   const [label,color,bg,border,step,cancel] = found;
//   return { label, color, bg, border, step, cancel };
// };

// /* ══════════════════════════════════════════════════════════
//    TRACKER — 5 steps, purely driven by ORDER STATUS
// ══════════════════════════════════════════════════════════ */
// const STEPS = [
//   { step:0, icon:<Clock size={13}/>,      label:"Placed"     },
//   { step:1, icon:<ChefHat size={13}/>,    label:"Confirmed"  },
//   { step:2, icon:<Utensils size={13}/>,   label:"Preparing"  },
//   { step:3, icon:<Bike size={13}/>,       label:"On the Way" },
//   { step:4, icon:<BadgeCheck size={13}/>, label:"Delivered"  },
// ];

// const Tracker = ({ orderStatus }) => {
//   const st = getSt(orderStatus);
//   if (st.step < 0) return null;          // cancelled → no tracker
//   const cur = st.step;

//   return (
//     <div className="tr-wrap">
//       {/* Step nodes with connector lines */}
//       <div className="tr-row">
//         {STEPS.map((s, i) => {
//           const done   = s.step < cur;
//           const active = s.step === cur;
//           const last   = i === STEPS.length - 1;
//           return (
//             <div key={s.step} className="tr-col">
//               {/* Left connector */}
//               {i > 0 && (
//                 <div className="tr-line" style={{ background: s.step <= cur ? "#22c55e" : "var(--bdr)" }}/>
//               )}
//               {/* Node */}
//               <div className={`tr-node ${done?"tr-done":active?"tr-active":"tr-idle"}`}>
//                 {done ? <CheckCircle size={12}/> : s.icon}
//                 {active && <span className="tr-pulse"/>}
//               </div>
//               {/* Right connector */}
//               {!last && (
//                 <div className="tr-line" style={{ background: done ? "var(--navy)" : "var(--bdr)" }}/>
//               )}
//             </div>
//           );
//         })}
//       </div>

//       {/* Labels */}
//       <div className="tr-labels">
//         {STEPS.map(s => (
//           <span key={s.step} className={
//             `tr-lbl ${s.step===cur?"tr-lbl-active":s.step<cur?"tr-lbl-done":""}`
//           }>{s.label}</span>
//         ))}
//       </div>

//       {/* Current step description */}
//       <p className="tr-desc" style={{ color: st.color }}>
//         {st.label}
//       </p>
//     </div>
//   );
// };

// /* ══════════════════════════════════════════════════════════
//    CANCEL MODAL
// ══════════════════════════════════════════════════════════ */
// const CancelModal = ({ order, onConfirm, onClose, busy }) => (
//   <div className="cm-overlay" onClick={onClose}>
//     <div className="cm-box" onClick={e => e.stopPropagation()}>
//       <button className="cm-close" onClick={onClose}><X size={14}/></button>
//       <div className="cm-ico"><AlertTriangle size={24}/></div>
//       <h2 className="cm-title">Cancel Order #{order.orderID}?</h2>
//       <p className="cm-sub">From <strong>{order.restaurantName}</strong>. Cannot be undone.</p>
//       <div className="cm-warn">
//         {["Food prep will stop","Refund per payment method","Cannot undo"].map(t => (
//           <div key={t} className="cm-warn-row"><span className="cm-dot"/>{t}</div>
//         ))}
//       </div>
//       <div className="cm-btns">
//         <button className="cm-keep" onClick={onClose} disabled={busy}>Keep</button>
//         <button className="cm-cancel-btn" onClick={onConfirm} disabled={busy}>
//           {busy ? <><Loader2 size={12} style={{animation:"sp .8s linear infinite"}}/> Cancelling…</> : <><Ban size={12}/> Yes, Cancel</>}
//         </button>
//       </div>
//     </div>
//   </div>
// );

// /* ══════════════════════════════════════════════════════════
//    ORDER CARD
// ══════════════════════════════════════════════════════════ */
// const OrderCard = ({ raw, idx, expanded, onExpand, onReview, onCancelClick }) => {
//   const order = n(raw);
//   const st    = getSt(order.orderStatus);

//   const parseDate = (d) => {
//     if (!d) return new Date();
//     const s = String(d);
//     return new Date(s.endsWith("Z") || s.includes("+") ? s : s + "Z");
//   };
//   const date = parseDate(order.orderDate);

//   const timeAgo = () => {
//     const sec = (Date.now() - date.getTime()) / 1000;
//     if (sec < 60)    return "Just now";
//     if (sec < 3600)  return `${Math.floor(sec/60)}m ago`;
//     if (sec < 86400) return `${Math.floor(sec/3600)}h ago`;
//     return date.toLocaleDateString("en-IN",{day:"numeric",month:"short"});
//   };

//   const isDelivered = ["Completed","Delivered"].includes(order.orderStatus);
//   const isCancelled = order.orderStatus === "Cancelled";

//   const DELIVERY = 25;
//   const itemsTotal = (raw.items || []).reduce(
//   (sum, i) => sum + (i.orderItemPrice * i.quantity),
//   0
// );

//   return (
//     <div className="oc-card" style={{ animationDelay:`${idx*50}ms` }}>
//       <div className="oc-strip" style={{ background:st.color }}/>
//       <div className="oc-inner">

//         {/* Header */}
//         <div className="oc-head">
//           <div className="oc-head-l">
//             <div className="oc-id-row">
//               <span className="oc-id">Order #{order.orderID}</span>
//               <span className="oc-pill" style={{background:st.bg,color:st.color,borderColor:st.border}}>
//                 {st.label}
//               </span>
//               {st.cancel && (
//                 <button className="oc-cancel-pill" onClick={()=>onCancelClick(order)}>
//                   <X size={9}/> Cancel
//                 </button>
//               )}
//             </div>
//             <div className="oc-chips">
//               {order.restaurantName && <span className="oc-chip"><Utensils size={10}/> {order.restaurantName}</span>}
//               <span className="oc-chip"><Clock size={10}/> {timeAgo()}</span>
//               <span className="oc-chip"><MapPin size={10}/> {date.toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</span>
//             </div>
//           </div>
//           <div className="oc-amt-col">
//             <span className="oc-amt">₹{order.totalAmount + DELIVERY}</span>
//             <span className="oc-amt-lbl">Total</span>
//           </div>
//         </div>

//         {/* Status section */}
//         {isCancelled
//           ? <div className="oc-cancelled"><XCircle size={12}/> Order was cancelled</div>
//           : <Tracker orderStatus={order.orderStatus}/>
//         }

//         {/* Context hints */}
//         {st.cancel && (
//           <div className="oc-hint oc-hint-warn"><Clock size={10}/> You can still cancel this order</div>
//         )}
//         {!st.cancel && !isCancelled && !isDelivered && (
//           <div className="oc-hint oc-hint-mute"><Ban size={10}/> Cancellation no longer available</div>
//         )}

//         {/* Toggle items */}
//         <button className="oc-toggle" onClick={onExpand}>
//           <ReceiptText size={12}/>
//           {expanded ? "Hide items" : "View items"}
//           {expanded ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
//         </button>

//         {/* Items panel */}
//         {expanded && raw.items && (
//           <div className="oc-panel">
//             {raw.items.map(rawItem => {
//               const item = nItem(rawItem);
//               return (
//                 <div key={item.orderItemID} className="oc-item">
//                   <div className="oc-item-img">
//                     {item.image
//                       ? <img src={item.image} alt={item.name}/>
//                       : <span>🍽</span>}
//                   </div>
//                   <div className="oc-item-info">
//                     <p className="oc-item-name">{item.name}</p>
//                     <p className="oc-item-qty">Qty: {item.quantity}</p>
//                   </div>
//                   <span className="oc-item-price">
//   ₹{item.orderItemPrice * item.quantity}
// </span>
//                 </div>
//               );
//             })}
//             <div className="oc-bill">

//   <div className="oc-bill-row">
//     <span>Items Total</span>
//     <span>₹{itemsTotal}</span>
//   </div>

//   <div className="oc-bill-row">
//     <span>Delivery Fee</span>
//     <span>₹{DELIVERY}</span>
//   </div>

//   <div className="oc-bill-row">
//     <span>Grand Total</span>
//     <span>₹{order.totalAmount + DELIVERY}</span>
//   </div>

// </div>
//             {isDelivered && (
//               <button className="oc-review-btn" onClick={onReview}>
//                 <Star size={13} fill="currentColor"/> Rate & Review
//               </button>
//             )}
//             {st.cancel && (
//               <button className="oc-cancel-full" onClick={()=>onCancelClick(order)}>
//                 <Ban size={12}/> Cancel Order
//               </button>
//             )}
//           </div>
//         )}

//       </div>
//     </div>
//   );
// };

// /* ══════════════════════════════════════════════════════════
//    MAIN PAGE
// ══════════════════════════════════════════════════════════ */
// const Orders = () => {
//   const [rawOrders,    setRawOrders]    = useState([]);
//   const [expanded,     setExpanded]     = useState(null);
//   const [loading,      setLoading]      = useState(true);
//   const [filter,       setFilter]       = useState("All");
//   const [cancelTarget, setCancelTarget] = useState(null);
//   const [cancelling,   setCancelling]   = useState(false);
//   const [refreshing,   setRefreshing]   = useState(false);
//   const [toast,        setToast]        = useState(null);

//   const navigate       = useNavigate();
//   const [searchParams]  = useSearchParams();
//   const timerRef       = useRef(null);

//   useEffect(() => {
//     loadOrders();
//     if (searchParams.get("success") === "true") showToast("Order placed! 🎉","ok");
//     timerRef.current = setInterval(silentRefresh, 30000);
//     return () => clearInterval(timerRef.current);
//   }, []);

//   const showToast = (msg, type="ok") => {
//     setToast({msg, type});
//     setTimeout(() => setToast(null), 3800);
//   };

//   const sortRaw = (arr) =>
//     [...arr].sort((a,b) => {
//       const da = n(a).orderDate; const db = n(b).orderDate;
//       return new Date(db||0) - new Date(da||0);
//     });

//   const loadOrders = async () => {
//   try {
//     const uid = localStorage.getItem("customerId") || localStorage.getItem("userId");
//     if (!uid) { navigate("/customer/login"); return; }
 
//     const res = await axiosInstance.get("/Order/user");
 
//     // ── TEMPORARY DEBUG — remove after confirming ──
//     if (res.data?.length > 0) {
//       console.log("Order field names:", Object.keys(res.data[0]));
//       console.log("Sample order:", res.data[0]);
//       // You need to see: orderID (not id, not OrderID) for cancel to work
//     }
 
//     setRawOrders(sortRaw(res.data));
//   } catch(e) {
//     console.error("loadOrders error:", e);
//   } finally {
//     setLoading(false);
//   }
// };

//   const silentRefresh = async () => {
//     try {
//       const res = await axiosInstance.get("/Order/user");
//       setRawOrders(sortRaw(res.data));
//     } catch(_) {}
//   };

//   const handleRefresh = async () => {
//     setRefreshing(true);
//     await silentRefresh();
//     setTimeout(() => setRefreshing(false), 700);
//   };

//   const loadItems = async (orderId) => {
//     try {
//       const res = await axiosInstance.get(`/OrderItem/order/${orderId}`);
//       setRawOrders(prev => prev.map(o => n(o).orderID === orderId ? {...o, items: res.data} : o));
//     } catch(e) { console.error(e); }
//   };

//   const toggleExpand = (orderId) => {
//     if (expanded === orderId) { setExpanded(null); return; }
//     setExpanded(orderId);
//     const raw = rawOrders.find(o => n(o).orderID === orderId);
//     if (!raw?.items) loadItems(orderId);
//   };

// const handleCancel = async () => {
//   if (!cancelTarget) return;
 
//   // Safety check — log exactly what we're sending
//   const id = cancelTarget.orderID;
//   console.log("Cancelling order ID:", id, "| cancelTarget:", cancelTarget);
 
//   if (!id || id === 0) {
//     showToast("Could not identify order ID. Please refresh and try again.", "err");
//     setCancelTarget(null);
//     return;
//   }
 
//   try {
//     setCancelling(true);
 
//     // axiosInstance already has baseURL = "https://localhost:7217/api"
//     // so this becomes: PATCH https://localhost:7217/api/Order/53/cancel
//     const res = await axiosInstance.patch(`/Order/${id}/cancel`);
//     console.log("Cancel success:", res.data);
 
//     setRawOrders(prev => prev.map(o => {
//       const on = n(o);
//       if (on.orderID !== id) return o;
//       return { ...o, orderStatus: "Cancelled", OrderStatus: "Cancelled" };
//     }));
 
//     showToast(`Order #${id} cancelled.`, "ok");
 
//   } catch (err) {
//     console.error("Cancel error:", err);
//     console.error("Cancel error response:", err?.response);
//     console.error("Cancel request URL:", err?.config?.url);
//     console.error("Cancel request baseURL:", err?.config?.baseURL);
 
//     const data = err?.response?.data;
//     const msg  = typeof data === "string"
//       ? data
//       : data?.message ?? data?.title ?? "Failed to cancel order.";
 
//     showToast(msg, "err");
//   } finally {
//     setCancelling(false);
//     setCancelTarget(null);
//   }
// };

//   /* Build normalised orders for filter counting */
//   const orders = rawOrders.map(n);

//   /* Filter tabs — dynamically show only statuses present in data */
//   const presentStatuses = [...new Set(orders.map(o => o.orderStatus))];

//   // Merge Completed + Delivered into one "Delivered" tab
//   const FILTER_TABS = [
//     { key:"All",            label:"All",         count: orders.length },
//     { key:"Pending",        label:"Pending",      count: orders.filter(o=>o.orderStatus==="Pending").length },
//     { key:"Confirmed",      label:"Confirmed",    count: orders.filter(o=>o.orderStatus==="Confirmed").length },
//     { key:"Preparing",      label:"Preparing",    count: orders.filter(o=>o.orderStatus==="Preparing").length },
//     { key:"OutForDelivery", label:"On the Way",   count: orders.filter(o=>o.orderStatus==="OutForDelivery").length },
//     { key:"Delivered",      label:"Delivered",    count: orders.filter(o=>["Completed","Delivered"].includes(o.orderStatus)).length },
//     { key:"Cancelled",      label:"Cancelled",    count: orders.filter(o=>o.orderStatus==="Cancelled").length },
//   ].filter(t => t.key === "All" || t.count > 0);

//   const visibleRaw = filter === "All"
//     ? rawOrders
//     : filter === "Delivered"
//       ? rawOrders.filter(o => ["Completed","Delivered"].includes(n(o).orderStatus))
//       : rawOrders.filter(o => n(o).orderStatus === filter);

//   const activeCount = orders.filter(o => !["Completed","Delivered","Cancelled"].includes(o.orderStatus)).length;
//   const cancelCount = orders.filter(o => getSt(o.orderStatus).cancel).length;

//   if (loading) return (
//     <>
//       <style>{CSS}</style>
//       <div className="pg-splash"><div className="pg-ring"/><p className="pg-splash-txt">Loading orders…</p></div>
//     </>
//   );

//   return (
//     <>
//       <style>{CSS}</style>

//       {toast && (
//         <div className={`pg-toast ${toast.type==="err"?"pg-toast-err":"pg-toast-ok"}`}>
//           {toast.type==="err" ? <XCircle size={13}/> : <CheckCircle size={13}/>} {toast.msg}
//         </div>
//       )}

//       {cancelTarget && (
//         <CancelModal order={cancelTarget} onConfirm={handleCancel}
//           onClose={() => setCancelTarget(null)} busy={cancelling}/>
//       )}

//       <div className="pg-root">
//         {/* Hero */}
//         <div className="pg-hero">
//           <div className="pg-hero-glow"/>
//           <div className="pg-hero-inner">
//             <div>
//               <p className="pg-eyebrow">My Account</p>
//               <h1 className="pg-title">My Orders</h1>
//               <div className="pg-badges">
//                 <span className="pg-badge-plain">{orders.length} order{orders.length!==1?"s":""}</span>
//                 {activeCount > 0 && <span className="pg-badge-live"><span className="pg-live-dot"/> {activeCount} active</span>}
//                 {cancelCount > 0 && <span className="pg-badge-cancel"><X size={9}/> {cancelCount} cancellable</span>}
//               </div>
//             </div>
//             <button className={`pg-refresh-btn ${refreshing?"pg-refreshing":""}`} onClick={handleRefresh}>
//               <RefreshCw size={14}/>
//             </button>
//           </div>
//         </div>

//         <div className="pg-body">
//           {/* Filter tabs */}
//           <div className="pg-tabs-scroll">
//             <div className="pg-tabs">
//               {FILTER_TABS.map(t => (
//                 <button key={t.key}
//                   className={`pg-tab ${filter===t.key?"pg-tab-on":""}`}
//                   onClick={() => setFilter(t.key)}>
//                   {t.label}
//                   <span className={`pg-tab-n ${filter===t.key?"pg-tab-n-on":""}`}>{t.count}</span>
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* Orders */}
//           {visibleRaw.length === 0 ? (
//             <div className="pg-empty">
//               <p className="pg-empty-em">🥡</p>
//               <h3 className="pg-empty-title">{filter==="All"?"No orders yet":"No matching orders"}</h3>
//               <p className="pg-empty-sub">{filter==="All"?"Place your first order.":"Switch filter."}</p>
//               {filter === "All" && (
//                 <button className="pg-browse" onClick={() => navigate("/customer/restaurants")}>
//                   <ShoppingBag size={13}/> Browse Restaurants
//                 </button>
//               )}
//             </div>
//           ) : (
//             <div className="pg-list">
//               {visibleRaw.map((raw, idx) => {
//                 const on = n(raw);
//                 return (
//                   <OrderCard key={on.orderID} raw={raw} idx={idx}
//                     expanded={expanded === on.orderID}
//                     onExpand={() => toggleExpand(on.orderID)}
//                     onReview={() => navigate(`/customer/profile?review=${on.orderID}&restaurant=${on.restaurantID}`)}
//                     onCancelClick={setCancelTarget}
//                   />
//                 );
//               })}
//             </div>
//           )}
//         </div>
//       </div>
//     </>
//   );
// };

// const CSS = `
// @import url('https://fonts.googleapis.com/css2?family=Satoshi:wght@400;500;600;700;800;900&display=swap');
// @import url('https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600,700,800,900&display=swap');
// *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
// :root{
//   --navy:#0f2d5e;--navy2:#1a3f7a;--sky:#38bdf8;--sky3:#bae6fd;
//   --ink:#0f1f3d;--ink2:#2d3f60;--ink3:#5a6f94;--ink4:#96a7c4;
//   --bg:#f0f5fc;--surf:#fff;--bdr:#d6e4f7;--bdr2:#e8f1fb;
//   --sh:0 2px 8px rgba(15,45,94,.06),0 8px 24px rgba(15,45,94,.09);
//   --sh-h:0 8px 32px rgba(15,45,94,.16);
//   font-family:'Satoshi',system-ui,sans-serif;
// }
// html,body{background:var(--bg);color:var(--ink);min-height:100vh}
// @keyframes pg-in  {from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
// @keyframes pg-spin{to{transform:rotate(360deg)}}
// @keyframes pg-pulse{0%,100%{transform:scale(1);opacity:.8}50%{transform:scale(1.7);opacity:0}}
// @keyframes pg-toast{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
// @keyframes items-in{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:translateY(0)}}
// @keyframes cm-pop{from{opacity:0;transform:scale(.93)}to{opacity:1;transform:scale(1)}}
// @keyframes sp{to{transform:rotate(360deg)}}

// .pg-splash{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;background:var(--bg)}
// .pg-ring{width:48px;height:48px;border-radius:50%;border:3px solid var(--sky3);border-top-color:var(--navy);animation:pg-spin .85s linear infinite}
// .pg-splash-txt{font-size:13px;font-weight:700;color:var(--ink3)}

// .pg-toast{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:9999;display:flex;align-items:center;gap:7px;padding:10px 18px;background:#fff;border-radius:11px;font-size:12px;font-weight:700;box-shadow:0 6px 20px rgba(15,45,94,.12);white-space:nowrap;animation:pg-toast .25s cubic-bezier(.22,1,.36,1)}
// .pg-toast-ok{border:1.5px solid #86efac;color:#15803d}
// .pg-toast-err{border:1.5px solid #fca5a5;color:#dc2626}

// .cm-overlay{position:fixed;inset:0;z-index:2000;background:rgba(10,25,55,.5);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:16px}
// .cm-box{background:#fff;border-radius:18px;padding:24px 20px 20px;width:100%;max-width:380px;position:relative;box-shadow:0 18px 50px rgba(15,45,94,.2);animation:cm-pop .22s cubic-bezier(.22,1,.36,1)}
// .cm-close{position:absolute;top:11px;right:11px;width:24px;height:24px;border-radius:50%;border:none;background:var(--bdr2);color:var(--ink3);display:flex;align-items:center;justify-content:center;cursor:pointer}
// .cm-ico{width:44px;height:44px;border-radius:13px;background:#fff7ed;display:flex;align-items:center;justify-content:center;color:#f97316;margin:0 auto 11px}
// .cm-title{font-size:16px;font-weight:900;color:var(--ink);text-align:center;margin-bottom:5px}
// .cm-sub{font-size:12px;color:var(--ink3);text-align:center;margin-bottom:12px}
// .cm-warn{background:#fff7ed;border:1.5px solid #fed7aa;border-radius:9px;padding:10px 12px;display:flex;flex-direction:column;gap:6px;margin-bottom:16px}
// .cm-warn-row{display:flex;align-items:center;gap:6px;font-size:11px;font-weight:600;color:#92400e}
// .cm-dot{width:5px;height:5px;border-radius:50%;background:#ef4444;flex-shrink:0}
// .cm-btns{display:flex;gap:7px}
// .cm-keep{flex:1;padding:10px;border-radius:9px;border:1.5px solid var(--bdr);background:transparent;font-family:inherit;font-size:12px;font-weight:700;color:var(--ink2);cursor:pointer}
// .cm-keep:disabled{opacity:.5}
// .cm-cancel-btn{flex:1;padding:10px;border-radius:9px;border:none;background:linear-gradient(135deg,#ef4444,#dc2626);font-family:inherit;font-size:12px;font-weight:800;color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:5px}
// .cm-cancel-btn:disabled{opacity:.6;cursor:not-allowed}

// .pg-root{min-height:100vh}
// .pg-hero{position:relative;padding:34px 16px 50px;overflow:hidden;background:var(--navy)}
// .pg-hero-glow{position:absolute;inset:0;background:radial-gradient(ellipse at 15% 55%,rgba(56,189,248,.2) 0%,transparent 55%),radial-gradient(ellipse at 85% 15%,rgba(26,63,122,.6) 0%,transparent 45%);pointer-events:none}
// .pg-hero-inner{max-width:820px;margin:0 auto;display:flex;align-items:flex-end;justify-content:space-between;gap:12px;position:relative}
// .pg-eyebrow{font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.4);margin-bottom:4px}
// .pg-title{font-size:clamp(22px,5vw,36px);font-weight:900;color:#fff;letter-spacing:-.03em;line-height:1;margin-bottom:8px}
// .pg-badges{display:flex;align-items:center;gap:7px;flex-wrap:wrap}
// .pg-badge-plain{font-size:11px;color:rgba(255,255,255,.5);font-weight:500}
// .pg-badge-live{display:inline-flex;align-items:center;gap:5px;background:rgba(56,189,248,.14);border:1px solid rgba(56,189,248,.3);color:var(--sky);padding:2px 8px;border-radius:100px;font-size:10px;font-weight:700}
// .pg-live-dot{width:5px;height:5px;border-radius:50%;background:var(--sky);animation:pg-pulse 1.8s ease infinite}
// .pg-badge-cancel{display:inline-flex;align-items:center;gap:3px;background:rgba(249,115,22,.13);border:1px solid rgba(249,115,22,.28);color:#fdba74;padding:2px 8px;border-radius:100px;font-size:10px;font-weight:700}
// .pg-refresh-btn{width:34px;height:34px;border-radius:9px;border:1.5px solid rgba(255,255,255,.14);background:rgba(255,255,255,.07);color:rgba(255,255,255,.6);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:all .18s}
// .pg-refresh-btn:hover{border-color:rgba(255,255,255,.3);color:#fff}
// .pg-refreshing svg{animation:pg-spin .6s linear infinite}

// .pg-body{max-width:820px;margin:-22px auto 0;padding:0 12px 60px;position:relative}
// .pg-tabs-scroll{background:#fff;border-radius:12px;padding:4px;margin-bottom:14px;box-shadow:var(--sh);overflow-x:auto;-webkit-overflow-scrolling:touch}
// .pg-tabs{display:flex;gap:3px;min-width:max-content}
// .pg-tab{padding:7px 12px;border-radius:8px;border:none;background:transparent;font-family:inherit;font-size:11px;font-weight:600;color:var(--ink3);cursor:pointer;transition:all .14s;display:flex;align-items:center;gap:4px;white-space:nowrap}
// .pg-tab:hover{background:var(--bdr2);color:var(--ink)}
// .pg-tab-on{background:var(--navy)!important;color:#fff!important;font-weight:700}
// .pg-tab-n{font-size:9px;font-weight:800;padding:1px 5px;border-radius:100px;background:var(--bdr);color:var(--ink3)}
// .pg-tab-n-on{background:rgba(255,255,255,.2);color:#fff}

// .pg-empty{text-align:center;padding:56px 20px;background:#fff;border-radius:16px;box-shadow:var(--sh)}
// .pg-empty-em{font-size:44px;margin-bottom:10px}
// .pg-empty-title{font-size:16px;font-weight:800;color:var(--ink);margin-bottom:4px}
// .pg-empty-sub{font-size:12px;color:var(--ink3);margin-bottom:14px}
// .pg-browse{display:inline-flex;align-items:center;gap:5px;padding:8px 16px;border-radius:9px;border:none;background:var(--navy);color:#fff;font-family:inherit;font-size:12px;font-weight:700;cursor:pointer}

// .pg-list{display:flex;flex-direction:column;gap:11px}

// .oc-card{display:flex;background:#fff;border-radius:15px;overflow:hidden;box-shadow:var(--sh);border:1px solid var(--bdr);transition:all .2s cubic-bezier(.22,1,.36,1);animation:pg-in .35s cubic-bezier(.22,1,.36,1) both}
// .oc-card:hover{box-shadow:var(--sh-h);transform:translateY(-2px)}
// .oc-strip{width:4px;flex-shrink:0}
// .oc-inner{flex:1;padding:13px 14px 0;min-width:0}
// .oc-head{display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:10px}
// .oc-head-l{flex:1;min-width:0}
// .oc-id-row{display:flex;align-items:center;gap:5px;margin-bottom:5px;flex-wrap:wrap}
// .oc-id{font-size:13px;font-weight:900;color:var(--ink)}
// .oc-pill{display:inline-flex;align-items:center;gap:3px;padding:2px 8px;border-radius:50px;font-size:10px;font-weight:700;border:1px solid}
// .oc-cancel-pill{display:inline-flex;align-items:center;gap:2px;padding:2px 7px;border-radius:50px;border:1.5px solid #fca5a5;background:#fef2f2;color:#dc2626;font-family:inherit;font-size:10px;font-weight:700;cursor:pointer;transition:all .14s}
// .oc-cancel-pill:hover{background:#ef4444;color:#fff;border-color:#ef4444}
// .oc-chips{display:flex;gap:4px;flex-wrap:wrap}
// .oc-chip{display:inline-flex;align-items:center;gap:3px;padding:3px 7px;border-radius:5px;background:var(--bdr2);border:1px solid var(--bdr);font-size:10px;font-weight:600;color:var(--ink3)}
// .oc-amt-col{text-align:right;flex-shrink:0}
// .oc-amt{display:block;font-size:17px;font-weight:900;color:var(--navy);letter-spacing:-.02em;line-height:1}
// .oc-amt-lbl{font-size:9px;font-weight:600;color:var(--ink4);text-transform:uppercase;letter-spacing:.06em;margin-top:1px;display:block}
// .oc-cancelled{display:flex;align-items:center;gap:5px;padding:7px 10px;background:#fef2f2;border:1px solid #fecaca;border-radius:7px;font-size:11px;font-weight:700;color:#dc2626;margin-bottom:8px}
// .oc-hint{display:flex;align-items:center;gap:4px;padding:5px 9px;border-radius:6px;font-size:10px;font-weight:600;margin-bottom:7px}
// .oc-hint-warn{background:#fff7ed;border:1px solid #fed7aa;color:#c2410c}
// .oc-hint-mute{background:var(--bdr2);border:1px solid var(--bdr);color:var(--ink4)}
// .oc-toggle{width:100%;padding:10px 0;border:none;background:transparent;font-family:inherit;font-size:11px;font-weight:700;color:var(--ink3);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:4px;border-top:1.5px solid var(--bdr2);margin-top:2px;transition:color .13s}
// .oc-toggle:hover{color:var(--navy)}
// .oc-panel{padding-bottom:12px;animation:items-in .2s ease}
// .oc-item{display:flex;align-items:center;gap:9px;padding:8px 10px;background:var(--bdr2);border-radius:9px;border:1px solid var(--bdr);margin-bottom:6px}
// .oc-item-img{width:38px;height:38px;border-radius:7px;overflow:hidden;background:#dbeafe;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:15px}
// .oc-item-img img{width:100%;height:100%;object-fit:cover}
// .oc-item-info{flex:1;min-width:0}
// .oc-item-name{font-size:12px;font-weight:700;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:1px}
// .oc-item-qty{font-size:10px;color:var(--ink4);font-weight:600}
// .oc-item-price{font-size:12px;font-weight:800;color:var(--navy);flex-shrink:0}
// .oc-bill{padding:9px 11px;background:var(--bdr2);border-radius:8px;margin-bottom:9px}
// .oc-bill-row{display:flex;justify-content:space-between;font-size:13px;font-weight:800;color:var(--navy)}
// .oc-review-btn{width:100%;padding:10px;border-radius:9px;border:none;background:linear-gradient(135deg,#f97316,#ea580c);font-family:inherit;font-size:12px;font-weight:800;color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:5px;box-shadow:0 3px 10px rgba(249,115,22,.24);margin-bottom:7px;transition:all .16s}
// .oc-review-btn:hover{transform:translateY(-1px)}
// .oc-cancel-full{width:100%;padding:9px;border-radius:9px;border:1.5px solid #fecaca;background:#fef2f2;font-family:inherit;font-size:11px;font-weight:700;color:#dc2626;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:4px;transition:all .14s}
// .oc-cancel-full:hover{background:#ef4444;color:#fff;border-color:#ef4444}

// /* ── TRACKER ── */
// .tr-wrap{margin-bottom:9px}
// .tr-row{display:flex;align-items:center;padding:10px 8px 4px}
// .tr-col{display:flex;flex:1;align-items:center}
// .tr-col:first-child{flex:0 0 auto}
// .tr-col:last-child{flex:0 0 auto}
// .tr-line{flex:1;height:2px;min-width:6px;transition:background .3s}
// .tr-node{position:relative;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .3s;z-index:1}
// .tr-done  {background:#22c55e;color:#fff;box-shadow:0 2px 7px rgba(34,197,94,.3)}
// .tr-active{background:var(--navy);color:#fff;box-shadow:0 3px 9px rgba(15,45,94,.3)}
// .tr-idle  {background:#fff;border:1.5px solid var(--bdr);color:var(--ink4)}
// .tr-pulse {position:absolute;inset:-4px;border-radius:50%;border:2px solid var(--navy);animation:pg-pulse 1.6s ease infinite;opacity:.35}
// .tr-labels{display:flex;padding:0 4px;margin-bottom:4px}
// .tr-lbl{flex:1;font-size:9px;font-weight:600;color:var(--ink4);text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding:0 2px}
// .tr-lbl-done  {color:#16a34a;font-weight:700}
// .tr-lbl-active{color:var(--navy);font-weight:800}
// .tr-desc{font-size:10px;font-weight:700;text-align:center;padding:0 4px 8px}

// @media(max-width:480px){
//   .pg-hero{padding:22px 12px 42px}
//   .pg-body{padding:0 8px 50px}
//   .oc-inner{padding:11px 11px 0}
//   .cm-btns{flex-direction:column}
// }
// `;

// export default Orders;


import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ShoppingBag, Clock, CheckCircle, XCircle,
  Star, ChevronDown, ChevronUp, RefreshCw,
  Utensils, MapPin, ReceiptText, Bike,
  ChefHat, BadgeCheck, Ban, X, AlertTriangle, Loader2,
} from "lucide-react";
import axiosInstance from "../../api/axiosInstance";

/* ─── normalise camelCase / PascalCase ───────────────────── */
const n = (o) => ({
  orderID:         o.orderID         ?? o.OrderID         ?? 0,
  orderStatus:     o.orderStatus     ?? o.OrderStatus     ?? "",
  totalAmount:     o.totalAmount     ?? o.TotalAmount      ?? 0,
  orderDate:       o.orderDate       ?? o.OrderDate        ?? o.createdAt ?? o.CreatedAt ?? null,
  restaurantName:  o.restaurantName  ?? o.RestaurantName   ?? "",
  restaurantID:    o.restaurantID    ?? o.RestaurantID     ?? 0,
  deliveryAddress: o.deliveryAddress ?? o.DeliveryAddress  ?? "",
  phone:           o.phone           ?? o.Phone            ?? "",
});

const nItem = (i) => {
  const mi = i.menuItem ?? i.MenuItem ?? {};
  return {
    orderItemID:    i.orderItemID    ?? i.OrderItemID    ?? 0,
    quantity:       i.quantity       ?? i.Quantity       ?? 0,
    orderItemPrice: i.orderItemPrice ?? i.OrderItemPrice ?? 0,
    name:  mi.menuItemName ?? mi.MenuItemName ?? mi.name ?? mi.Name ?? "Item",
    image: mi.imageUrl     ?? mi.ImageUrl     ?? mi.menuItemImage ?? mi.MenuItemImage ?? "",
  };
};

/* ─── status map ─────────────────────────────────────────── */
const STATUS = {
  Pending:        { label:"Order Placed",    color:"#f97316", bg:"#fff7ed", border:"rgba(249,115,22,0.25)", step:0,  cancel:true  },
  Confirmed:      { label:"Confirmed",       color:"#8b5cf6", bg:"#f5f3ff", border:"rgba(139,92,246,0.25)", step:1,  cancel:true  },
  Preparing:      { label:"Preparing",       color:"#0ea5e9", bg:"#f0f9ff", border:"rgba(14,165,233,0.25)", step:2,  cancel:false },
  OutForDelivery: { label:"Out for Delivery",color:"#10b981", bg:"#f0fdf4", border:"rgba(16,185,129,0.25)", step:3,  cancel:false },
  Completed:      { label:"Delivered",       color:"#16a34a", bg:"#f0fdf4", border:"rgba(22,163,74,0.25)",  step:4,  cancel:false },
  Delivered:      { label:"Delivered",       color:"#16a34a", bg:"#f0fdf4", border:"rgba(22,163,74,0.25)",  step:4,  cancel:false },
  Cancelled:      { label:"Cancelled",       color:"#ef4444", bg:"#fef2f2", border:"rgba(239,68,68,0.25)",  step:-1, cancel:false },
};
const getSt = (raw) => {
  if (!raw) return { label:"Unknown", color:"#b07850", bg:"#fff4eb", border:"rgba(232,67,28,0.1)", step:0, cancel:false };
  const s = raw.trim();
  return STATUS[s] ?? STATUS[s.charAt(0).toUpperCase()+s.slice(1)] ?? { label:s, color:"#b07850", bg:"#fff4eb", border:"rgba(232,67,28,0.1)", step:0, cancel:false };
};

/* ─── tracker steps ──────────────────────────────────────── */
const STEPS = [
  { step:0, icon:<Clock size={14}/>,      label:"Placed"     },
  { step:1, icon:<ChefHat size={14}/>,    label:"Confirmed"  },
  { step:2, icon:<Utensils size={14}/>,   label:"Preparing"  },
  { step:3, icon:<Bike size={14}/>,       label:"On the Way" },
  { step:4, icon:<BadgeCheck size={14}/>, label:"Delivered"  },
];

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

@keyframes spin      { to { transform:rotate(360deg); } }
@keyframes fadeUp    { from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);} }
@keyframes slideUp   { from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);} }
@keyframes fadeIn    { from{opacity:0;}to{opacity:1;} }
@keyframes popIn     { from{opacity:0;transform:scale(0.94);}to{opacity:1;transform:scale(1);} }
@keyframes pulse-dot { 0%,100%{transform:scale(1);opacity:.9}50%{transform:scale(1.8);opacity:0} }
@keyframes toast-in  { from{opacity:0;transform:translateX(-50%) translateY(10px);}to{opacity:1;transform:translateX(-50%) translateY(0);} }
@keyframes tracker-fill { from{width:0}to{width:100%} }

/* ── SPLASH ── */
.op-splash {
  min-height: 70vh; display:flex; flex-direction:column;
  align-items:center; justify-content:center; gap:18px;
}
.op-ring {
  width:52px; height:52px; border-radius:50%;
  border:3px solid rgba(232,67,28,0.14);
  border-top-color:var(--red);
  animation:spin 0.82s linear infinite;
}
.op-splash p {
  font-family:var(--font-b); font-size:11px; font-weight:600;
  color:var(--ink-mt); letter-spacing:0.2em; text-transform:uppercase;
}

/* ── TOAST ── */
.op-toast {
  position:fixed; bottom:24px; left:50%; transform:translateX(-50%);
  z-index:9999; display:flex; align-items:center; gap:8px;
  padding:11px 20px; border-radius:13px;
  font-family:var(--font-b); font-size:13px; font-weight:700;
  white-space:nowrap; box-shadow:0 8px 28px rgba(26,12,0,0.14);
  animation:toast-in 0.25s cubic-bezier(0.22,1,0.36,1);
  backdrop-filter:blur(12px);
}
.op-toast-ok  { background:#fff; border:1.5px solid rgba(22,163,74,0.35); color:#15803d; }
.op-toast-err { background:#fff; border:1.5px solid rgba(239,68,68,0.35); color:#dc2626; }

/* ── CANCEL MODAL ── */
.op-cm-overlay {
  position:fixed; inset:0; z-index:2000;
  background:rgba(26,12,0,0.52); backdrop-filter:blur(7px);
  display:flex; align-items:center; justify-content:center; padding:20px;
  animation:fadeIn 0.2s ease;
}
.op-cm-box {
  background:#fff; border-radius:24px;
  padding:28px 24px 24px; width:100%; max-width:400px;
  position:relative;
  box-shadow:0 24px 60px rgba(26,12,0,0.22);
  animation:popIn 0.24s cubic-bezier(0.22,1,0.36,1);
  border:1px solid var(--border);
}
.op-cm-close {
  position:absolute; top:14px; right:14px;
  width:28px; height:28px; border-radius:50%;
  border:1.5px solid var(--border); background:var(--pill);
  color:var(--ink-mt); display:flex; align-items:center; justify-content:center;
  cursor:pointer; transition:all 0.15s;
}
.op-cm-close:hover { background:var(--red); color:#fff; border-color:var(--red); }
.op-cm-icon {
  width:52px; height:52px; border-radius:17px;
  background:var(--pill); border:1.5px solid var(--border);
  display:flex; align-items:center; justify-content:center;
  color:var(--red); margin:0 auto 16px;
}
.op-cm-title {
  font-family:var(--font-d); font-style:italic;
  font-size:20px; font-weight:900; color:var(--ink);
  text-align:center; margin-bottom:6px;
}
.op-cm-sub {
  font-family:var(--font-b); font-size:13px; color:var(--ink-mt);
  text-align:center; margin-bottom:18px; line-height:1.6;
}
.op-cm-warn {
  background:var(--pill); border:1.5px solid var(--border);
  border-radius:13px; padding:13px 16px;
  display:flex; flex-direction:column; gap:8px; margin-bottom:20px;
}
.op-cm-warn-row {
  display:flex; align-items:center; gap:9px;
  font-family:var(--font-b); font-size:12px; font-weight:700; color:var(--ink-md);
}
.op-cm-dot { width:6px; height:6px; border-radius:50%; background:var(--red); flex-shrink:0; }
.op-cm-btns { display:flex; gap:10px; }
.op-cm-keep {
  flex:1; padding:12px; border-radius:13px;
  border:1.5px solid var(--border); background:transparent;
  font-family:var(--font-b); font-size:14px; font-weight:700;
  color:var(--ink-md); cursor:pointer; transition:all 0.15s;
}
.op-cm-keep:hover { background:var(--pill); }
.op-cm-keep:disabled { opacity:0.5; }
.op-cm-cancel {
  flex:1; padding:12px; border-radius:13px; border:none;
  background:linear-gradient(135deg,#ef4444,#dc2626);
  font-family:var(--font-b); font-size:14px; font-weight:800;
  color:#fff; cursor:pointer;
  display:flex; align-items:center; justify-content:center; gap:6px;
  box-shadow:0 4px 16px rgba(239,68,68,0.3);
  transition:filter 0.15s;
}
.op-cm-cancel:hover { filter:brightness(1.1); }
.op-cm-cancel:disabled { opacity:0.6; cursor:not-allowed; }

/* ── PAGE ROOT ── */
.op-root {
  max-width:860px; margin:0 auto; padding:0 20px 100px;
}

/* ── HERO ── */
.op-hero {
  position:relative; overflow:hidden;
  background:linear-gradient(140deg,#1a0800 0%,#2e1004 55%,#1a0800 100%);
  padding:48px 48px 56px; margin-bottom:0;
}
.op-hero-orb {
  position:absolute; border-radius:50%; pointer-events:none;
}
.op-hero-label {
  display:inline-flex; align-items:center; gap:8px;
  background:rgba(240,144,16,0.18);
  border:1px solid rgba(240,144,16,0.32);
  border-radius:100px; padding:6px 20px; margin-bottom:20px;
  font-family:var(--font-b); font-size:11px; font-weight:800;
  color:#ffe0a0; letter-spacing:0.14em; text-transform:uppercase;
}
.op-hero h1 {
  font-family:var(--font-d); font-style:italic;
  font-size:clamp(2.4rem,5vw,4rem); font-weight:900;
  color:#fff; line-height:1.05; margin-bottom:16px;
  letter-spacing:-0.02em; text-shadow:0 4px 40px rgba(0,0,0,0.5);
}
.op-hero-meta {
  display:flex; align-items:center; gap:16px; flex-wrap:wrap;
}
.op-hero-stat {
  display:flex; align-items:center; gap:8px;
  background:rgba(255,255,255,0.09); backdrop-filter:blur(10px);
  border:1px solid rgba(255,255,255,0.14);
  border-radius:100px; padding:7px 18px;
  font-family:var(--font-b); font-size:13px; font-weight:600;
  color:rgba(255,255,255,0.82);
}
.op-live-dot {
  width:7px; height:7px; border-radius:50%;
  background:#4ade80; flex-shrink:0;
  animation:pulse-dot 1.8s ease infinite;
}
.op-hero-refresh {
  width:38px; height:38px; border-radius:12px;
  border:1.5px solid rgba(255,255,255,0.15);
  background:rgba(255,255,255,0.08);
  color:rgba(255,255,255,0.6);
  display:flex; align-items:center; justify-content:center;
  cursor:pointer; transition:all 0.18s; margin-left:auto;
}
.op-hero-refresh:hover { border-color:rgba(255,255,255,0.3); color:#fff; background:rgba(255,255,255,0.12); }
.op-hero-refresh.spin svg { animation:spin 0.6s linear infinite; }

/* ── PROMO STRIP ── */
.op-strip {
  background:var(--grad); padding:10px 48px;
  display:flex; align-items:center; gap:36px; overflow-x:auto;
  scrollbar-width:none;
}
.op-strip::-webkit-scrollbar { display:none; }
.op-strip-item { display:flex; align-items:center; gap:10px; flex-shrink:0; }
.op-strip-item strong { font-family:var(--font-b); font-size:12px; font-weight:800; color:#fff; letter-spacing:0.08em; }
.op-strip-div  { width:1px; height:14px; background:rgba(255,255,255,0.28); }
.op-strip-item span  { font-family:var(--font-b); font-size:12px; color:rgba(255,255,255,0.78); }

/* ── FILTER TABS ── */
.op-tabs-wrap {
  background:rgba(253,247,240,0.96); backdrop-filter:blur(18px);
  position:sticky; top:71px; z-index:98;
  border-bottom:1px solid var(--border);
  padding:14px 0; overflow-x:auto; scrollbar-width:none;
}
.op-tabs-wrap::-webkit-scrollbar { display:none; }
.op-tabs {
  display:flex; gap:8px; padding:0 20px; min-width:max-content;
}
.op-tab {
  display:flex; align-items:center; gap:7px;
  padding:9px 20px; border-radius:100px;
  border:1.5px solid var(--border); background:var(--pill);
  font-family:var(--font-b); font-size:13px; font-weight:600;
  color:var(--ink-md); cursor:pointer; transition:all 0.18s;
  white-space:nowrap;
}
.op-tab:hover { border-color:var(--saffron); color:var(--red); }
.op-tab.on {
  background:var(--grad); border-color:var(--red);
  color:#fff; font-weight:800;
  box-shadow:0 4px 16px var(--glow);
}
.op-tab-count {
  font-size:11px; font-weight:800; padding:2px 8px;
  border-radius:100px; background:rgba(0,0,0,0.12);
}
.op-tab.on .op-tab-count { background:rgba(255,255,255,0.22); }

/* ── SECTION HEADING ── */
.op-section {
  padding:44px 0 0;
}
.op-section-eyebrow {
  font-family:var(--font-b); font-size:11px; font-weight:800;
  color:var(--red); letter-spacing:0.20em; text-transform:uppercase; margin-bottom:7px;
}
.op-section-title {
  font-family:var(--font-d); font-style:italic;
  font-size:clamp(1.8rem,3.5vw,2.8rem); font-weight:900;
  color:var(--ink); letter-spacing:-0.015em; line-height:1.05; margin-bottom:10px;
}
.op-section-rule {
  display:flex; gap:4px; align-items:center; margin-bottom:24px;
}
.op-section-rule div:nth-child(1) { height:3px; width:52px; border-radius:100px; background:var(--grad); }
.op-section-rule div:nth-child(2) { height:3px; width:18px; border-radius:100px; background:rgba(232,67,28,0.2); }
.op-section-rule div:nth-child(3) { height:3px; width:8px;  border-radius:100px; background:rgba(232,67,28,0.1); }

/* ── EMPTY STATE ── */
.op-empty {
  text-align:center; padding:72px 20px;
  background:var(--card); border-radius:24px;
  border:1px solid var(--border);
  box-shadow:0 4px 24px rgba(232,67,28,0.06);
}
.op-empty-emoji { font-size:52px; margin-bottom:18px; }
.op-empty-title {
  font-family:var(--font-d); font-style:italic;
  font-size:24px; font-weight:900; color:var(--ink); margin-bottom:8px;
}
.op-empty-sub {
  font-family:var(--font-b); font-size:14px; font-weight:400;
  color:var(--ink-mt); margin-bottom:22px;
}
.op-browse-btn {
  display:inline-flex; align-items:center; gap:8px;
  padding:13px 26px; border-radius:13px; border:none;
  background:var(--grad); color:#fff;
  font-family:var(--font-b); font-size:14px; font-weight:800;
  cursor:pointer; letter-spacing:0.03em;
  box-shadow:0 6px 22px var(--glow);
  transition:filter 0.15s;
}
.op-browse-btn:hover { filter:brightness(1.1); }

/* ── ORDER LIST ── */
.op-list { display:flex; flex-direction:column; gap:16px; }

/* ── ORDER CARD ── */
.op-card {
  background:var(--card); border-radius:22px; overflow:hidden;
  border:1px solid var(--border);
  box-shadow:0 2px 16px rgba(232,67,28,0.06);
  animation:fadeUp 0.42s ease both;
  transition:transform 0.3s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s;
}
.op-card:hover {
  transform:translateY(-4px);
  box-shadow:0 16px 48px rgba(232,67,28,0.11), 0 0 0 1.5px rgba(232,67,28,0.14);
}
/* accent top bar */
.op-card-accent { height:4px; background:var(--grad); width:100%; }

.op-card-inner { padding:20px 22px 0; }

/* ── CARD HEADER ── */
.op-card-head {
  display:flex; align-items:flex-start;
  justify-content:space-between; gap:12px; margin-bottom:14px;
}
.op-card-head-l { flex:1; min-width:0; }
.op-card-id-row {
  display:flex; align-items:center; gap:8px;
  flex-wrap:wrap; margin-bottom:8px;
}
.op-card-id {
  font-family:var(--font-d); font-size:17px; font-weight:700;
  color:var(--ink); letter-spacing:-0.01em;
}
.op-status-pill {
  display:inline-flex; align-items:center; gap:5px;
  padding:4px 12px; border-radius:100px;
  font-family:var(--font-b); font-size:11px; font-weight:800;
  border:1.5px solid;
}
.op-cancel-pill {
  display:inline-flex; align-items:center; gap:4px;
  padding:3px 10px; border-radius:100px;
  border:1.5px solid rgba(239,68,68,0.3);
  background:rgba(239,68,68,0.06);
  color:#dc2626;
  font-family:var(--font-b); font-size:10px; font-weight:800;
  cursor:pointer; transition:all 0.15s;
}
.op-cancel-pill:hover { background:#ef4444; color:#fff; border-color:#ef4444; }

.op-card-chips {
  display:flex; align-items:center; gap:7px; flex-wrap:wrap;
}
.op-card-chip {
  display:inline-flex; align-items:center; gap:4px;
  padding:4px 10px; border-radius:8px;
  background:var(--pill); border:1px solid var(--border);
  font-family:var(--font-b); font-size:11px; font-weight:600;
  color:var(--ink-md);
}
.op-card-amt-col { text-align:right; flex-shrink:0; }
.op-card-amt {
  font-family:var(--font-d); font-weight:900;
  font-size:22px; color:var(--ink); letter-spacing:-0.02em; display:block;
}
.op-card-amt-lbl {
  font-family:var(--font-b); font-size:10px; font-weight:700;
  color:var(--ink-mt); text-transform:uppercase; letter-spacing:0.08em;
}

/* ── CANCELLED BANNER ── */
.op-cancelled-row {
  display:flex; align-items:center; gap:8px;
  padding:10px 14px; border-radius:12px;
  background:rgba(239,68,68,0.06);
  border:1.5px solid rgba(239,68,68,0.20);
  font-family:var(--font-b); font-size:12px; font-weight:700;
  color:#dc2626; margin-bottom:12px;
}

/* ── TRACKER ── */
.op-tracker { margin-bottom:12px; padding:4px 0; }
.op-tracker-nodes {
  display:flex; align-items:center; padding:8px 0 0;
}
.op-tr-col { display:flex; flex:1; align-items:center; }
.op-tr-col:first-child,
.op-tr-col:last-child { flex:0 0 auto; }
.op-tr-line {
  flex:1; height:2.5px; min-width:8px;
  border-radius:2px; transition:background 0.4s;
}
.op-tr-node {
  position:relative; width:32px; height:32px; border-radius:50%;
  display:flex; align-items:center; justify-content:center;
  flex-shrink:0; transition:all 0.3s; z-index:1;
}
.op-tr-done   { background:var(--green); color:#fff; box-shadow:0 3px 10px rgba(22,163,74,0.3); }
.op-tr-active { background:var(--grad);  color:#fff; box-shadow:0 4px 14px var(--glow); }
.op-tr-idle   { background:#fff; border:2px solid var(--border); color:var(--ink-mt); }
.op-tr-pulse  {
  position:absolute; inset:-5px; border-radius:50%;
  border:2px solid var(--red); opacity:0.4;
  animation:pulse-dot 1.6s ease infinite;
}
.op-tracker-labels {
  display:flex; padding:6px 0 2px;
}
.op-tr-lbl {
  flex:1; font-family:var(--font-b); font-size:10px; font-weight:600;
  color:var(--ink-mt); text-align:center;
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis; padding:0 2px;
}
.op-tr-lbl.done   { color:var(--green); font-weight:700; }
.op-tr-lbl.active { color:var(--red);   font-weight:800; }
.op-tracker-status {
  font-family:var(--font-b); font-size:12px; font-weight:800;
  text-align:center; padding:2px 0 10px;
}

/* ── HINTS ── */
.op-hint {
  display:flex; align-items:center; gap:6px;
  padding:7px 12px; border-radius:10px;
  font-family:var(--font-b); font-size:11px; font-weight:700;
  margin-bottom:8px;
}
.op-hint-warn { background:var(--pill); border:1px solid var(--border); color:var(--ink-md); }
.op-hint-mute { background:rgba(0,0,0,0.03); border:1px solid rgba(0,0,0,0.06); color:var(--ink-mt); }

/* ── TOGGLE BTN ── */
.op-toggle {
  width:100%; padding:12px 0;
  border:none; background:transparent;
  border-top:1.5px solid var(--border);
  font-family:var(--font-b); font-size:12px; font-weight:700;
  color:var(--ink-mt); cursor:pointer;
  display:flex; align-items:center; justify-content:center; gap:6px;
  transition:color 0.15s; margin-top:4px;
}
.op-toggle:hover { color:var(--red); }

/* ── ITEMS PANEL ── */
.op-panel { padding:4px 0 16px; animation:slideUp 0.22s ease; }
.op-item {
  display:flex; align-items:center; gap:12px;
  padding:10px 14px; border-radius:14px;
  background:var(--pill); border:1px solid var(--border);
  margin-bottom:8px;
}
.op-item-img {
  width:44px; height:44px; border-radius:11px;
  overflow:hidden; flex-shrink:0; background:#ffe8d4;
  display:flex; align-items:center; justify-content:center;
  font-size:18px; border:1px solid var(--border);
}
.op-item-img img { width:100%; height:100%; object-fit:cover; }
.op-item-info { flex:1; min-width:0; }
.op-item-name {
  font-family:var(--font-d); font-size:14px; font-weight:700;
  color:var(--ink); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
  margin-bottom:2px;
}
.op-item-qty {
  font-family:var(--font-b); font-size:11px; font-weight:600; color:var(--ink-mt);
}
.op-item-price {
  font-family:var(--font-d); font-weight:900; font-size:15px; color:var(--red);
  flex-shrink:0;
}

/* bill summary */
.op-bill {
  background:var(--card); border:1.5px solid var(--border);
  border-radius:16px; padding:14px 18px; margin-bottom:12px;
}
.op-bill-row {
  display:flex; justify-content:space-between; align-items:center;
  padding:5px 0;
}
.op-bill-row:last-child {
  border-top:1.5px dashed var(--border); margin-top:6px; padding-top:10px;
}
.op-bill-lbl {
  font-family:var(--font-b); font-size:13px; font-weight:600; color:var(--ink-md);
}
.op-bill-val {
  font-family:var(--font-b); font-size:13px; font-weight:700; color:var(--ink);
}
.op-bill-row:last-child .op-bill-lbl {
  font-family:var(--font-d); font-size:15px; font-weight:700; color:var(--ink);
}
.op-bill-row:last-child .op-bill-val {
  font-family:var(--font-d); font-size:17px; font-weight:900; color:var(--red);
}

/* action buttons in panel */
.op-review-btn {
  width:100%; padding:13px; border-radius:14px; border:none;
  background:var(--grad); color:#fff;
  font-family:var(--font-b); font-size:14px; font-weight:800;
  cursor:pointer; display:flex; align-items:center;
  justify-content:center; gap:8px; letter-spacing:0.03em;
  box-shadow:0 6px 22px var(--glow);
  margin-bottom:9px; transition:filter 0.15s, transform 0.15s;
}
.op-review-btn:hover { filter:brightness(1.1); transform:translateY(-2px); }

.op-cancel-full {
  width:100%; padding:12px; border-radius:14px;
  border:1.5px solid rgba(239,68,68,0.25);
  background:rgba(239,68,68,0.05); color:#dc2626;
  font-family:var(--font-b); font-size:13px; font-weight:800;
  cursor:pointer; display:flex; align-items:center;
  justify-content:center; gap:7px;
  transition:all 0.15s;
}
.op-cancel-full:hover { background:#ef4444; color:#fff; border-color:#ef4444; }

/* scrollbar */
::-webkit-scrollbar { width:4px; }
::-webkit-scrollbar-track { background:var(--bg); }
::-webkit-scrollbar-thumb { background:var(--saffron); border-radius:4px; }

/* responsive */
@media(max-width:640px) {
  .op-hero   { padding:36px 20px 44px; }
  .op-strip  { padding:10px 20px; }
  .op-root   { padding:0 12px 80px; }
  .op-card-inner { padding:16px 16px 0; }
}
`;

/* ─── Tracker Component ──────────────────────────────────── */
const Tracker = ({ orderStatus }) => {
  const st = getSt(orderStatus);
  if (st.step < 0) return null;
  const cur = st.step;
  return (
    <div className="op-tracker">
      <div className="op-tracker-nodes">
        {STEPS.map((s, i) => {
          const done   = s.step < cur;
          const active = s.step === cur;
          const last   = i === STEPS.length - 1;
          return (
            <div key={s.step} className="op-tr-col">
              {i > 0 && (
                <div className="op-tr-line"
                  style={{ background: s.step <= cur
                    ? (done ? "#16a34a" : "var(--grad)")
                    : "var(--border)" }} />
              )}
              <div className={`op-tr-node ${done ? "op-tr-done" : active ? "op-tr-active" : "op-tr-idle"}`}>
                {done ? <CheckCircle size={14}/> : s.icon}
                {active && <span className="op-tr-pulse"/>}
              </div>
              {!last && (
                <div className="op-tr-line"
                  style={{ background: done ? "#16a34a" : "var(--border)" }} />
              )}
            </div>
          );
        })}
      </div>
      <div className="op-tracker-labels">
        {STEPS.map(s => (
          <span key={s.step} className={`op-tr-lbl ${s.step < cur ? "done" : s.step === cur ? "active" : ""}`}>
            {s.label}
          </span>
        ))}
      </div>
      <p className="op-tracker-status" style={{ color: st.color }}>{st.label}</p>
    </div>
  );
};

/* ─── Cancel Modal ───────────────────────────────────────── */
const CancelModal = ({ order, onConfirm, onClose, busy }) => (
  <div className="op-cm-overlay" onClick={onClose}>
    <div className="op-cm-box" onClick={e => e.stopPropagation()}>
      <button className="op-cm-close" onClick={onClose}><X size={14}/></button>
      <div className="op-cm-icon"><AlertTriangle size={26}/></div>
      <h2 className="op-cm-title">Cancel Order #{order.orderID}?</h2>
      <p className="op-cm-sub">From <strong>{order.restaurantName}</strong>. This cannot be undone.</p>
      <div className="op-cm-warn">
        {["Food prep will stop immediately","Refund depends on payment method","This action cannot be reversed"].map(t => (
          <div key={t} className="op-cm-warn-row">
            <div className="op-cm-dot"/>
            {t}
          </div>
        ))}
      </div>
      <div className="op-cm-btns">
        <button className="op-cm-keep" onClick={onClose} disabled={busy}>Keep Order</button>
        <button className="op-cm-cancel" onClick={onConfirm} disabled={busy}>
          {busy
            ? <><Loader2 size={13} style={{ animation:"spin .8s linear infinite"}}/> Cancelling…</>
            : <><Ban size={13}/> Yes, Cancel</>}
        </button>
      </div>
    </div>
  </div>
);

/* ─── Order Card ─────────────────────────────────────────── */
const OrderCard = ({ raw, idx, expanded, onExpand, onReview, onCancelClick }) => {
  const order = n(raw);
  const st    = getSt(order.orderStatus);
  const DELIVERY = 25;

  const parseDate = d => {
    if (!d) return new Date();
    const s = String(d);
    return new Date(s.endsWith("Z") || s.includes("+") ? s : s + "Z");
  };
  const date = parseDate(order.orderDate);

  const timeAgo = () => {
    const sec = (Date.now() - date.getTime()) / 1000;
    if (sec < 60)    return "Just now";
    if (sec < 3600)  return `${Math.floor(sec/60)}m ago`;
    if (sec < 86400) return `${Math.floor(sec/3600)}h ago`;
    return date.toLocaleDateString("en-IN", { day:"numeric", month:"short" });
  };

  const isDelivered = ["Completed","Delivered"].includes(order.orderStatus);
  const isCancelled = order.orderStatus === "Cancelled";
  const itemsTotal  = (raw.items || []).reduce((s, i) => s + i.orderItemPrice * i.quantity, 0);

  return (
    <div className="op-card" style={{ animationDelay:`${idx * 50}ms` }}>
      <div className="op-card-accent"/>
      <div className="op-card-inner">

        {/* header */}
        <div className="op-card-head">
          <div className="op-card-head-l">
            <div className="op-card-id-row">
              <span className="op-card-id">Order #{order.orderID}</span>
              <span className="op-status-pill"
                style={{ background:st.bg, color:st.color, borderColor:st.border }}>
                {st.label}
              </span>
              {st.cancel && (
                <button className="op-cancel-pill" onClick={() => onCancelClick(order)}>
                  <X size={9}/> Cancel
                </button>
              )}
            </div>
            <div className="op-card-chips">
              {order.restaurantName && (
                <span className="op-card-chip"><Utensils size={10}/>{order.restaurantName}</span>
              )}
              <span className="op-card-chip"><Clock size={10}/>{timeAgo()}</span>
              <span className="op-card-chip">
                <MapPin size={10}/>
                {date.toLocaleDateString("en-IN",{ day:"numeric", month:"short", year:"numeric" })}
              </span>
            </div>
          </div>
          <div className="op-card-amt-col">
            <span className="op-card-amt">₹{order.totalAmount + DELIVERY}</span>
            <span className="op-card-amt-lbl">Total</span>
          </div>
        </div>

        {/* status section */}
        {isCancelled
          ? <div className="op-cancelled-row"><XCircle size={14}/> This order was cancelled</div>
          : <Tracker orderStatus={order.orderStatus}/>}

        {/* hints */}
        {st.cancel && (
          <div className="op-hint op-hint-warn"><Clock size={10}/> You can still cancel this order</div>
        )}
        {!st.cancel && !isCancelled && !isDelivered && (
          <div className="op-hint op-hint-mute"><Ban size={10}/> Cancellation no longer available</div>
        )}

        {/* toggle */}
        <button className="op-toggle" onClick={onExpand}>
          <ReceiptText size={13}/>
          {expanded ? "Hide Items" : "View Items"}
          {expanded ? <ChevronUp size={13}/> : <ChevronDown size={13}/>}
        </button>

        {/* expanded panel */}
        {expanded && raw.items && (
          <div className="op-panel">
            {raw.items.map(rawItem => {
              const item = nItem(rawItem);
              return (
                <div key={item.orderItemID} className="op-item">
                  <div className="op-item-img">
                    {item.image ? <img src={item.image} alt={item.name}/> : <span>🍽</span>}
                  </div>
                  <div className="op-item-info">
                    <p className="op-item-name">{item.name}</p>
                    <p className="op-item-qty">Qty: {item.quantity}</p>
                  </div>
                  <span className="op-item-price">₹{item.orderItemPrice * item.quantity}</span>
                </div>
              );
            })}

            {/* bill */}
            <div className="op-bill">
              <div className="op-bill-row">
                <span className="op-bill-lbl">Items Total</span>
                <span className="op-bill-val">₹{itemsTotal}</span>
              </div>
              <div className="op-bill-row">
                <span className="op-bill-lbl">Delivery Fee</span>
                <span className="op-bill-val">₹{DELIVERY}</span>
              </div>
              <div className="op-bill-row">
                <span className="op-bill-lbl">Grand Total</span>
                <span className="op-bill-val">₹{order.totalAmount + DELIVERY}</span>
              </div>
            </div>

            {isDelivered && (
              <button className="op-review-btn" onClick={onReview}>
                <Star size={14} fill="currentColor"/> Rate & Review
              </button>
            )}
            {st.cancel && (
              <button className="op-cancel-full" onClick={() => onCancelClick(order)}>
                <Ban size={13}/> Cancel Order
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Main Page ──────────────────────────────────────────── */
const Orders = () => {
  const [rawOrders,    setRawOrders]    = useState([]);
  const [expanded,     setExpanded]     = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [filter,       setFilter]       = useState("All");
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling,   setCancelling]   = useState(false);
  const [refreshing,   setRefreshing]   = useState(false);
  const [toast,        setToast]        = useState(null);

  const navigate      = useNavigate();
  const [searchParams] = useSearchParams();
  const timerRef      = useRef(null);

  useEffect(() => {
    loadOrders();
    if (searchParams.get("success") === "true") showToast("Order placed! 🎉", "ok");
    timerRef.current = setInterval(silentRefresh, 30000);
    return () => clearInterval(timerRef.current);
  }, []);

  const showToast = (msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3800);
  };

  const sortRaw = arr =>
    [...arr].sort((a, b) => new Date(n(b).orderDate || 0) - new Date(n(a).orderDate || 0));

  const loadOrders = async () => {
    try {
      const uid = localStorage.getItem("customerId") || localStorage.getItem("userId");
      if (!uid) { navigate("/customer/login"); return; }
      const res = await axiosInstance.get("/Order/user");
      setRawOrders(sortRaw(res.data));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const silentRefresh = async () => {
    try {
      const res = await axiosInstance.get("/Order/user");
      setRawOrders(sortRaw(res.data));
    } catch (_) {}
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await silentRefresh();
    setTimeout(() => setRefreshing(false), 700);
  };

  const loadItems = async orderId => {
    try {
      const res = await axiosInstance.get(`/OrderItem/order/${orderId}`);
      setRawOrders(prev => prev.map(o => n(o).orderID === orderId ? { ...o, items: res.data } : o));
    } catch (e) { console.error(e); }
  };

  const toggleExpand = orderId => {
    if (expanded === orderId) { setExpanded(null); return; }
    setExpanded(orderId);
    const raw = rawOrders.find(o => n(o).orderID === orderId);
    if (!raw?.items) loadItems(orderId);
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    const id = cancelTarget.orderID;
    if (!id || id === 0) { showToast("Could not identify order. Refresh and try again.", "err"); setCancelTarget(null); return; }
    try {
      setCancelling(true);
      await axiosInstance.patch(`/Order/${id}/cancel`);
      setRawOrders(prev => prev.map(o => {
        const on = n(o);
        if (on.orderID !== id) return o;
        return { ...o, orderStatus:"Cancelled", OrderStatus:"Cancelled" };
      }));
      showToast(`Order #${id} cancelled.`, "ok");
    } catch (err) {
      const data = err?.response?.data;
      const msg  = typeof data === "string" ? data : data?.message ?? data?.title ?? "Failed to cancel.";
      showToast(msg, "err");
    } finally {
      setCancelling(false);
      setCancelTarget(null);
    }
  };

  const orders = rawOrders.map(n);

  const FILTER_TABS = [
    { key:"All",            label:"All",          count: orders.length },
    { key:"Pending",        label:"Pending",       count: orders.filter(o=>o.orderStatus==="Pending").length },
    { key:"Confirmed",      label:"Confirmed",     count: orders.filter(o=>o.orderStatus==="Confirmed").length },
    { key:"Preparing",      label:"Preparing",     count: orders.filter(o=>o.orderStatus==="Preparing").length },
    { key:"OutForDelivery", label:"On the Way",    count: orders.filter(o=>o.orderStatus==="OutForDelivery").length },
    { key:"Delivered",      label:"Delivered",     count: orders.filter(o=>["Completed","Delivered"].includes(o.orderStatus)).length },
    { key:"Cancelled",      label:"Cancelled",     count: orders.filter(o=>o.orderStatus==="Cancelled").length },
  ].filter(t => t.key === "All" || t.count > 0);

  const visibleRaw = filter === "All" ? rawOrders
    : filter === "Delivered"
      ? rawOrders.filter(o => ["Completed","Delivered"].includes(n(o).orderStatus))
      : rawOrders.filter(o => n(o).orderStatus === filter);

  const activeCount = orders.filter(o => !["Completed","Delivered","Cancelled"].includes(o.orderStatus)).length;

  if (loading) return (
    <>
      <style>{CSS}</style>
      <div className="op-splash">
        <div className="op-ring"/>
        <p>Loading your orders…</p>
      </div>
    </>
  );

  return (
    <>
      <style>{CSS}</style>

      {/* toast */}
      {toast && (
        <div className={`op-toast ${toast.type === "err" ? "op-toast-err" : "op-toast-ok"}`}>
          {toast.type === "err" ? <XCircle size={14}/> : <CheckCircle size={14}/>}
          {toast.msg}
        </div>
      )}

      {/* cancel modal */}
      {cancelTarget && (
        <CancelModal order={cancelTarget} onConfirm={handleCancel}
          onClose={() => setCancelTarget(null)} busy={cancelling}/>
      )}

      {/* ══ HERO ══════════════════════════════════════════ */}
      <div className="op-hero">
        <div className="op-hero-orb" style={{ width:480, height:480, top:-220, right:-80, background:"radial-gradient(circle,rgba(232,67,28,0.12) 0%,transparent 70%)" }}/>
        <div className="op-hero-orb" style={{ width:300, height:300, bottom:-140, left:60, background:"radial-gradient(circle,rgba(240,144,16,0.09) 0%,transparent 70%)" }}/>

        <div className="op-hero-label">📦 My Account</div>

        <h1>My Orders</h1>

        <div className="op-hero-meta">
          <div className="op-hero-stat">
            <span>{orders.length} order{orders.length !== 1 ? "s" : ""}</span>
          </div>
          {activeCount > 0 && (
            <div className="op-hero-stat">
              <div className="op-live-dot"/>
              <span>{activeCount} active</span>
            </div>
          )}
          <button
            className={`op-hero-refresh${refreshing ? " spin" : ""}`}
            onClick={handleRefresh}
            title="Refresh orders"
          >
            <RefreshCw size={16}/>
          </button>
        </div>
      </div>

      {/* ══ PROMO STRIP ═══════════════════════════════════ */}
      {/* <div className="op-strip">
        {[["📦 TRACK IN REAL TIME","Live order updates every 30s"],["⭐ RATE YOUR MEAL","Leave a review after delivery"],["🔁 REORDER ANYTIME","Browse your favourite restaurants"]].map(([t,d]) => (
          <div key={t} className="op-strip-item">
            <strong>{t}</strong>
            <div className="op-strip-div"/>
            <span>{d}</span>
          </div>
        ))}
      </div> */}

      {/* ══ FILTER TABS ═══════════════════════════════════ */}
      <div className="op-tabs-wrap">
        <div className="op-tabs">
          {FILTER_TABS.map(t => (
            <button key={t.key} className={`op-tab${filter === t.key ? " on" : ""}`} onClick={() => setFilter(t.key)}>
              {t.label}
              <span className="op-tab-count">{t.count}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="op-root">

        {/* ══ SECTION HEADING ════════════════════════════ */}
        <div className="op-section">
          <p className="op-section-eyebrow">📋 Orders</p>
          <h2 className="op-section-title">
            {filter === "All" ? "All Orders" : `${FILTER_TABS.find(t=>t.key===filter)?.label ?? filter} Orders`}
          </h2>
          <div className="op-section-rule"><div/><div/><div/></div>
        </div>

        {/* ══ EMPTY STATE ════════════════════════════════ */}
        {visibleRaw.length === 0 ? (
          <div className="op-empty">
            <div className="op-empty-emoji">🥡</div>
            <h3 className="op-empty-title">
              {filter === "All" ? "No orders yet" : "No matching orders"}
            </h3>
            <p className="op-empty-sub">
              {filter === "All" ? "Place your first order and it will appear here." : "Try a different filter."}
            </p>
            {filter === "All" && (
              <button className="op-browse-btn" onClick={() => navigate("/customer/restaurants")}>
                <ShoppingBag size={15}/> Browse Restaurants
              </button>
            )}
          </div>
        ) : (
          <div className="op-list">
            {visibleRaw.map((raw, idx) => {
              const on = n(raw);
              return (
                <OrderCard
                  key={on.orderID} raw={raw} idx={idx}
                  expanded={expanded === on.orderID}
                  onExpand={() => toggleExpand(on.orderID)}
                  onReview={() => navigate(`/customer/profile?review=${on.orderID}&restaurant=${on.restaurantID}`)}
                  onCancelClick={setCancelTarget}
                />
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default Orders;