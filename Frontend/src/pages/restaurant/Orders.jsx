import { useEffect, useState } from "react";
import {
  ChevronDown, ChevronUp, RefreshCw,
  Truck, UserPlus, AlertCircle, X,
} from "lucide-react";
import axiosInstance from "../../api/axiosInstance";

/* ══════════════════════════════════════════════════════════
   STATUS CONFIG
══════════════════════════════════════════════════════════ */
const ORDER_STATUS = {
  Pending:        { label:"Pending",         color:"#f97316", bg:"#fff7ed", border:"#fed7aa" },
  Confirmed:      { label:"Confirmed",        color:"#8b5cf6", bg:"#f5f3ff", border:"#ddd6fe" },
  Preparing:      { label:"Preparing",        color:"#0ea5e9", bg:"#f0f9ff", border:"#bae6fd" },
  OutForDelivery: { label:"Out for Delivery", color:"#10b981", bg:"#f0fdf4", border:"#a7f3d0" },
  Completed:      { label:"Completed",        color:"#0d9488", bg:"#f0fdfa", border:"#99f6e4" },
  Delivered:      { label:"Delivered",        color:"#16a34a", bg:"#f0fdf4", border:"#86efac" },
  Cancelled:      { label:"Cancelled",        color:"#ef4444", bg:"#fef2f2", border:"#fecaca" },
};
const getSt = (s) =>
  ORDER_STATUS[s] ?? { label: s || "Unknown", color:"#64748b", bg:"#f8fafc", border:"#e2e8f0" };

/* ══════════════════════════════════════════════════════════
   FIELD NORMALISER — handles camelCase & PascalCase
══════════════════════════════════════════════════════════ */
const nrm = (o) => ({
  orderID:         o.orderID         ?? o.OrderID         ?? 0,
  orderStatus:     o.orderStatus     ?? o.OrderStatus     ?? "",
  totalAmount:     o.totalAmount     ?? o.TotalAmount      ?? 0,
  orderDate:       o.orderDate       ?? o.OrderDate        ?? o.createdAt ?? null,
  userName:        o.userName        ?? o.UserName         ?? "Guest",
  deliveryAddress: o.deliveryAddress ?? o.DeliveryAddress  ?? "",
  phone:           o.phone           ?? o.Phone            ?? "",
});

const parseDate = (d) => {
  if (!d) return new Date();
  const s = String(d);
  return new Date(s.endsWith("Z") || s.includes("+") ? s : s + "Z");
};

/* ══════════════════════════════════════════════════════════
   FLOW DESIGN
   ─────────────────────────────────────────────────────────
   Pending
     → [Confirm Order]  [Cancel]

   Confirmed
     → [Start Preparing] [Cancel]

   Preparing
     → [Assign & Dispatch] ← This button:
          1. Opens delivery person picker
          2. On select: POST /Delivery/assign
          3. Then PATCH /Order/status → OutForDelivery
       [Cancel]

   OutForDelivery
     → No more actions (delivery boy takes over)
     → Shows "Delivery assigned ✓" info

   Completed / Delivered / Cancelled
     → Locked
══════════════════════════════════════════════════════════ */

const LOCKED_MSG = {
  Completed: "Order completed — no further actions.",
  Delivered: "Order delivered successfully.",
  Cancelled: "Order cancelled — no further actions.",
};

/* ══════════════════════════════════════════════════════════
   CSS
══════════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --teal:#0d9488;--teal2:#0f766e;--teal-p:#f0fdfa;--teal-m:#ccfbf1;
  --ink:#0f2926;--ink2:#1e5c57;--ink3:#5a9490;--ink4:#9ecac7;
  --bg:#f2faf9;--surf:#fff;--bdr:#c8ede9;--bdr2:#e0f5f3;
  --sh:0 2px 14px rgba(13,148,136,.07);--sh-h:0 8px 28px rgba(13,148,136,.13);
  font-family:'Outfit',sans-serif;
}
html,body{background:var(--bg);color:var(--ink);min-height:100vh}
@keyframes ro-in {from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes ro-sp {to{transform:rotate(360deg)}}
@keyframes sweep {0%{transform:translateX(-300%)}100%{transform:translateX(500%)}}
@keyframes cm-pop{from{opacity:0;transform:scale(.93)}to{opacity:1;transform:scale(1)}}

/* Splash */
.ro-splash{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;background:var(--bg)}
.ro-ring{width:56px;height:56px;border-radius:50%;border:4px solid var(--teal-m);border-top-color:var(--teal);animation:ro-sp .9s linear infinite}
.ro-splash-txt{font-size:14px;font-weight:700;color:var(--ink2)}
.ro-prog{width:170px;height:4px;background:var(--teal-m);border-radius:4px;overflow:hidden}
.ro-prog-bar{height:100%;width:38%;background:var(--teal);animation:sweep 1.3s ease-in-out infinite}

/* Header */
.ro-header{background:var(--surf);border-bottom:2px solid var(--teal-m);padding:18px 32px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;position:sticky;top:0;z-index:50;box-shadow:var(--sh)}
.ro-header-tag{font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--teal)}
.ro-header-title{font-size:22px;font-weight:900;color:var(--ink);margin-top:2px}
.ro-refresh{display:flex;align-items:center;gap:6px;padding:9px 16px;border-radius:11px;border:none;cursor:pointer;background:var(--teal);color:#fff;font-size:12px;font-weight:800;font-family:'Outfit',sans-serif;box-shadow:0 4px 12px rgba(13,148,136,.25);transition:all .18s}
.ro-refresh:hover:not(:disabled){background:var(--teal2);transform:translateY(-1px)}
.ro-refresh:disabled{opacity:.6;cursor:not-allowed}
.ro-spin{animation:ro-sp .7s linear infinite}

/* Body */
.ro-body{padding:22px 32px;max-width:1100px;margin:0 auto;display:flex;flex-direction:column;gap:18px}

/* Stats */
.ro-stats{display:grid;grid-template-columns:repeat(7,1fr);gap:10px}
.ro-stat{background:var(--surf);border-radius:13px;border:1.5px solid var(--bdr);padding:14px 12px;text-align:center;box-shadow:var(--sh);animation:ro-in .4s cubic-bezier(.22,1,.36,1) both;transition:transform .18s}
.ro-stat:hover{transform:translateY(-2px)}
.ro-stat-lbl{font-size:9px;font-weight:700;color:var(--ink3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:5px}
.ro-stat-val{font-size:22px;font-weight:900;color:var(--ink);line-height:1}

/* Filters */
.ro-filters{background:var(--surf);border-radius:12px;padding:4px;box-shadow:var(--sh);overflow-x:auto}
.ro-filter-track{display:flex;gap:3px;min-width:max-content}
.ro-filter-btn{padding:7px 13px;border-radius:8px;font-size:11px;font-weight:600;border:none;background:transparent;color:var(--ink3);cursor:pointer;font-family:'Outfit',sans-serif;white-space:nowrap;display:flex;align-items:center;gap:4px;transition:all .14s}
.ro-filter-btn:hover{background:var(--bdr2);color:var(--ink)}
.ro-filter-active{background:var(--teal)!important;color:#fff!important;font-weight:700}
.ro-filter-n{font-size:9px;font-weight:800;padding:1px 5px;border-radius:100px}
.ro-filter-n-on{background:rgba(255,255,255,.22);color:#fff}
.ro-filter-n-off{background:var(--bdr);color:var(--ink3)}

/* Card */
.ro-card{background:var(--surf);border-radius:15px;border:1.5px solid var(--bdr);overflow:hidden;box-shadow:var(--sh);animation:ro-in .38s cubic-bezier(.22,1,.36,1) both;transition:box-shadow .2s,border-color .2s}
.ro-card:hover{border-color:var(--teal-m);box-shadow:var(--sh-h)}
.ro-card-accent{height:4px}
.ro-card-body{padding:16px 18px}

.ro-card-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px;flex-wrap:wrap}
.ro-order-id{font-size:16px;font-weight:900;color:var(--ink)}
.ro-pill{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:100px;font-size:11px;font-weight:700;border:1.5px solid}
.ro-amount{font-size:18px;font-weight:900;color:var(--teal)}

.ro-meta{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:12px}
.ro-chip{display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:7px;background:var(--teal-p);border:1.5px solid var(--teal-m);font-size:11px;font-weight:600;color:var(--ink2);max-width:230px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}

/* Action zone */
.ro-actions{padding:12px 13px;border-radius:11px;background:var(--bg);border:1.5px solid var(--bdr);margin-bottom:11px}
.ro-actions-lbl{font-size:9px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:var(--ink3);margin-bottom:8px}
.ro-actions-btns{display:flex;gap:7px;flex-wrap:wrap}

/* Buttons */
.ro-btn{padding:9px 16px;border-radius:9px;border:none;font-family:'Outfit',sans-serif;font-size:12px;font-weight:800;cursor:pointer;transition:all .16s;display:inline-flex;align-items:center;gap:5px}
.ro-btn:disabled{opacity:.38!important;cursor:not-allowed!important;transform:none!important}
.ro-btn-confirm {background:#8b5cf6;color:#fff}
.ro-btn-confirm:hover:not(:disabled){background:#7c3aed;transform:translateY(-1px)}
.ro-btn-prepare {background:#0ea5e9;color:#fff}
.ro-btn-prepare:hover:not(:disabled){background:#0284c7;transform:translateY(-1px)}
.ro-btn-dispatch{background:#10b981;color:#fff}
.ro-btn-dispatch:hover:not(:disabled){background:#059669;transform:translateY(-1px);box-shadow:0 4px 14px rgba(16,185,129,.3)}
.ro-btn-cancel  {background:#fff;color:#ef4444;border:1.5px solid #fecaca!important}
.ro-btn-cancel:hover:not(:disabled){background:#fef2f2}

/* Info notice */
.ro-notice{display:flex;align-items:center;gap:7px;padding:10px 13px;border-radius:10px;margin-bottom:11px;font-size:11px;font-weight:600}
.ro-notice-green{background:#f0fdf4;border:1.5px solid #86efac;color:#15803d}
.ro-notice-mute {background:var(--bg);border:1.5px solid var(--bdr);color:var(--ink3)}

/* Toggle */
.ro-toggle{width:100%;padding:11px;background:var(--bg);border:none;border-top:1.5px solid var(--bdr);color:var(--ink3);font-size:11px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:5px;font-family:'Outfit',sans-serif;transition:all .14s}
.ro-toggle:hover{color:var(--teal);background:var(--teal-p)}

/* Items panel */
.ro-items-panel{padding:14px 18px;background:var(--bg);border-top:1.5px solid var(--bdr)}
.ro-items-lbl{font-size:9px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:var(--ink3);margin-bottom:9px}
.ro-item{display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--surf);border-radius:11px;border:1.5px solid var(--bdr);margin-bottom:7px;transition:border-color .14s}
.ro-item:hover{border-color:var(--teal-m)}
.ro-item-img{width:42px;height:42px;border-radius:9px;overflow:hidden;background:var(--teal-p);flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:18px}
.ro-item-img img{width:100%;height:100%;object-fit:cover}
.ro-item-name{font-size:13px;font-weight:800;color:var(--ink)}
.ro-item-qty{font-size:11px;font-weight:600;color:var(--ink3);margin-top:2px}
.ro-item-price{font-size:14px;font-weight:900;color:var(--teal);flex-shrink:0}
.ro-total{display:flex;justify-content:space-between;padding:11px 13px;border-radius:10px;background:var(--surf);border:1.5px solid var(--teal-m);margin-top:10px}
.ro-total-lbl{font-size:12px;font-weight:700;color:var(--ink2)}
.ro-total-val{font-size:17px;font-weight:900;color:var(--teal)}

.ro-empty{text-align:center;padding:64px 24px;background:var(--surf);border-radius:16px;border:1.5px solid var(--bdr);box-shadow:var(--sh)}

/* ── DISPATCH MODAL (assign delivery + set OutForDelivery atomically) ── */
.dm-overlay{position:fixed;inset:0;z-index:9999;background:rgba(2,44,34,.45);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:16px}
.dm-box{background:var(--surf);border-radius:20px;border:1.5px solid var(--teal-m);padding:26px 22px;width:100%;max-width:420px;box-shadow:0 20px 60px rgba(13,148,136,.2);animation:cm-pop .22s cubic-bezier(.22,1,.36,1);position:relative}
.dm-close{position:absolute;top:12px;right:12px;width:26px;height:26px;border-radius:50%;border:none;background:var(--bdr2);color:var(--ink3);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .14s}
.dm-close:hover{background:var(--bdr)}
.dm-head{display:flex;align-items:center;gap:11px;margin-bottom:6px}
.dm-ico{width:42px;height:42px;border-radius:13px;background:var(--teal-p);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.dm-title{font-size:18px;font-weight:900;color:var(--ink)}
.dm-sub{font-size:12px;font-weight:600;color:var(--ink3);margin-top:2px}

/* Flow steps in modal */
.dm-steps{display:flex;align-items:center;gap:0;margin:16px 0 18px;padding:12px 14px;background:var(--bg);border-radius:11px;border:1.5px solid var(--bdr)}
.dm-step{display:flex;flex-direction:column;align-items:center;gap:4px;flex:1;text-align:center}
.dm-step-node{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;background:var(--teal);color:#fff}
.dm-step-lbl{font-size:9px;font-weight:700;color:var(--ink3);white-space:nowrap}
.dm-step-line{flex:1;height:2px;background:var(--teal-m);margin:0 4px;margin-bottom:14px}

.dm-sec{font-size:9px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--ink3);margin-bottom:8px}
.dm-du-list{display:flex;flex-direction:column;gap:7px;margin-bottom:16px;max-height:240px;overflow-y:auto}
.dm-du-btn{display:flex;align-items:center;gap:11px;padding:11px 13px;border-radius:12px;border:1.5px solid var(--bdr);background:var(--bg);cursor:pointer;font-family:'Outfit',sans-serif;width:100%;transition:all .14s}
.dm-du-btn:hover:not(:disabled){border-color:var(--teal);background:var(--teal-p)}
.dm-du-btn:disabled{opacity:.5;cursor:not-allowed}
.dm-du-ico{width:36px;height:36px;border-radius:9px;background:var(--teal-p);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.dm-du-name{font-size:13px;font-weight:800;color:var(--ink);text-align:left}
.dm-du-role{font-size:10px;font-weight:600;color:var(--ink3);margin-top:1px}
.dm-cancel-btn{width:100%;padding:11px;border-radius:11px;border:1.5px solid var(--bdr);background:var(--bg);color:var(--ink2);font-size:13px;font-weight:800;cursor:pointer;font-family:'Outfit',sans-serif;transition:all .14s}
.dm-cancel-btn:hover{border-color:var(--teal);color:var(--teal)}

@media(max-width:1100px){.ro-stats{grid-template-columns:repeat(4,1fr)}}
@media(max-width:760px){.ro-body{padding:16px 12px}.ro-header{padding:13px 16px}.ro-stats{grid-template-columns:repeat(2,1fr)}}
`;

/* ══════════════════════════════════════════════════════════
   DISPATCH MODAL
   Single action: pick delivery person → assign → set OutForDelivery
══════════════════════════════════════════════════════════ */
const DispatchModal = ({ order, deliveryUsers, onDispatch, onClose, dispatching }) => {
  const o = nrm(order);
  return (
    <div className="dm-overlay" onClick={e => { if(e.target===e.currentTarget) onClose(); }}>
      <div className="dm-box">
        <button className="dm-close" onClick={onClose}><X size={14}/></button>

        <div className="dm-head">
          <div className="dm-ico"><Truck size={18} style={{color:"var(--teal)"}}/></div>
          <div>
            <p className="dm-title">Assign & Dispatch</p>
            <p className="dm-sub">Order #{o.orderID} · ₹{o.totalAmount}</p>
          </div>
        </div>

        {/* What will happen */}
        <div className="dm-steps">
          <div className="dm-step">
            <div className="dm-step-node">1</div>
            <span className="dm-step-lbl">Select delivery person</span>
          </div>
          <div className="dm-step-line"/>
          <div className="dm-step">
            <div className="dm-step-node">2</div>
            <span className="dm-step-lbl">Assign to order</span>
          </div>
          <div className="dm-step-line"/>
          <div className="dm-step">
            <div className="dm-step-node">3</div>
            <span className="dm-step-lbl">Status → Out for Delivery</span>
          </div>
        </div>

        <p className="dm-sec">Select delivery person</p>
        <div className="dm-du-list">
          {deliveryUsers.length === 0
            ? <div style={{textAlign:"center",padding:"22px",color:"var(--ink3)",fontSize:13,fontWeight:700}}>No delivery staff available</div>
            : deliveryUsers.map(user => {
                const uid = user.userID ?? user.UserID;
                const uname = user.userName ?? user.UserName ?? "Staff";
                return (
                  <button key={uid} className="dm-du-btn" disabled={dispatching}
                    onClick={() => onDispatch(o.orderID, uid)}>
                    <div className="dm-du-ico"><UserPlus size={15} style={{color:"var(--teal)"}}/></div>
                    <div>
                      <p className="dm-du-name">{uname}</p>
                      <p className="dm-du-role">Delivery Staff</p>
                    </div>
                    {dispatching && (
                      <div style={{marginLeft:"auto",width:13,height:13,borderRadius:"50%",border:"2px solid var(--teal-m)",borderTopColor:"var(--teal)",animation:"ro-sp .7s linear infinite"}}/>
                    )}
                  </button>
                );
              })
          }
        </div>
        <button className="dm-cancel-btn" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════ */
const RestaurantOrders = () => {
  const [orders,        setOrders]        = useState([]);
  const [expanded,      setExpanded]      = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [filter,        setFilter]        = useState("All");
  const [deliveryUsers, setDeliveryUsers] = useState([]);
  const [dispatchOrder, setDispatchOrder] = useState(null); // order being dispatched
  const [dispatching,   setDispatching]   = useState(false);
  const [refreshing,    setRefreshing]    = useState(false);
  const [updatingId,    setUpdatingId]    = useState(null);

  const restaurantId = localStorage.getItem("restaurantId");

  useEffect(() => { if (restaurantId) loadData(); }, [restaurantId]);

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    try {
      const res = await axiosInstance.get(`/Order/restaurant/${restaurantId}`);
      setOrders(res.data.sort((a,b) => new Date(nrm(b).orderDate||0) - new Date(nrm(a).orderDate||0)));
    } catch(e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  const loadDeliveryUsers = async () => {
    try {
      const res = await axiosInstance.get("/User/role/Delivery");
      setDeliveryUsers(res.data || []);
    } catch { setDeliveryUsers([]); }
  };

  /* Simple status update (Confirm, Start Preparing, Cancel) */
  const updateStatus = async (orderId, newStatus) => {
    if (newStatus === "Cancelled" && !window.confirm("Cancel this order?")) return;
    setUpdatingId(orderId);
    try {
      await axiosInstance.patch(`/Order/${orderId}/status?status=${encodeURIComponent(newStatus)}`);
      setOrders(prev => prev.map(o =>
        nrm(o).orderID === orderId
          ? {...o, orderStatus: newStatus, OrderStatus: newStatus}
          : o
      ));
    } catch(e) {
      alert("Failed: " + (e?.response?.data?.message || e?.response?.data || e.message));
      loadData(true);
    } finally { setUpdatingId(null); }
  };

  /* ══════════════════════════════════════════════════════
     DISPATCH = Assign delivery person + set OutForDelivery
     Both happen together so customer only sees OutForDelivery
     AFTER a delivery person is actually assigned.
  ══════════════════════════════════════════════════════ */
  const handleDispatch = async (orderId, deliveryUserId) => {
    setDispatching(true);
    try {
      // Step 1: Assign delivery person
      try {
        await axiosInstance.post(`/Delivery/${orderId}/assign/${deliveryUserId}`);
      } catch(e) {
        const msg = e?.response?.data || e.message;
        // "already assigned" is ok — continue to step 2
        if (typeof msg !== "string" || !msg.toLowerCase().includes("already")) {
          alert("Failed to assign delivery: " + msg);
          setDispatching(false);
          return;
        }
      }

      // Step 2: Set order status to OutForDelivery
      await axiosInstance.patch(`/Order/${orderId}/status?status=OutForDelivery`);

      // Step 3: Update local state
      setOrders(prev => prev.map(o =>
        nrm(o).orderID === orderId
          ? {...o, orderStatus:"OutForDelivery", OrderStatus:"OutForDelivery", deliveryAssigned: true}
          : o
      ));

      setDispatchOrder(null);
    } catch(e) {
      alert("Failed to dispatch: " + (e?.response?.data?.message || e?.response?.data || e.message));
    } finally { setDispatching(false); }
  };

  const openDispatchModal = (order) => {
    setDispatchOrder(order);
    loadDeliveryUsers();
  };

  const toggleItems = async (orderId) => {
    if (expanded === orderId) { setExpanded(null); return; }
    const raw = orders.find(o => nrm(o).orderID === orderId);
    if (!raw?.items) {
      try {
        const res = await axiosInstance.get(`/OrderItem/order/${orderId}`);
        setOrders(prev => prev.map(o => nrm(o).orderID === orderId ? {...o, items: res.data} : o));
      } catch(e) { alert("Could not load items: " + e.message); return; }
    }
    setExpanded(orderId);
  };

  /* Stats */
  const allStatuses = ["Pending","Confirmed","Preparing","OutForDelivery","Completed","Delivered","Cancelled"];
  const stats = { Total: orders.length };
  allStatuses.forEach(s => { stats[s] = orders.filter(o => nrm(o).orderStatus === s).length; });

  const FILTER_TABS = [
    { key:"All",            label:"All",             count: orders.length },
    { key:"Pending",        label:"Pending",          count: stats.Pending },
    { key:"Confirmed",      label:"Confirmed",        count: stats.Confirmed },
    { key:"Preparing",      label:"Preparing",        count: stats.Preparing },
    { key:"OutForDelivery", label:"Out for Delivery", count: stats.OutForDelivery },
    { key:"Completed",      label:"Completed",        count: stats.Completed + stats.Delivered },
    { key:"Cancelled",      label:"Cancelled",        count: stats.Cancelled },
  ].filter(t => t.key === "All" || t.count > 0);

  const filtered = filter === "All" ? orders
    : filter === "Completed" ? orders.filter(o => ["Completed","Delivered"].includes(nrm(o).orderStatus))
    : orders.filter(o => nrm(o).orderStatus === filter);

  if (loading) return (
    <div className="ro-splash">
      <style>{CSS}</style>
      <div className="ro-ring"/>
      <p className="ro-splash-txt">Loading orders…</p>
      <div className="ro-prog"><div className="ro-prog-bar"/></div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh", background:"var(--bg)"}}>
      <style>{CSS}</style>

      {/* Dispatch modal */}
      {dispatchOrder && (
        <DispatchModal
          order={dispatchOrder}
          deliveryUsers={deliveryUsers}
          onDispatch={handleDispatch}
          onClose={() => setDispatchOrder(null)}
          dispatching={dispatching}
        />
      )}

      <header className="ro-header">
        <div>
          <p className="ro-header-tag">Restaurant Dashboard</p>
          <h1 className="ro-header-title">Order Management</h1>
        </div>
        <button className="ro-refresh" onClick={() => loadData(true)} disabled={refreshing}>
          <RefreshCw size={13} className={refreshing ? "ro-spin" : ""}/>
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      </header>

      <div className="ro-body">

        {/* Stats */}
        <div className="ro-stats">
          {[
            ["Total",        orders.length],
            ["Pending",      stats.Pending],
            ["Confirmed",    stats.Confirmed],
            ["Preparing",    stats.Preparing],
            ["On Way",       stats.OutForDelivery],
            ["Completed",    stats.Completed + stats.Delivered],
            ["Cancelled",    stats.Cancelled],
          ].map(([key, val], i) => {
            const colorMap = { Total:"var(--teal)", Pending:"#f97316", Confirmed:"#8b5cf6",
              Preparing:"#0ea5e9", "On Way":"#10b981", Completed:"#0d9488", Cancelled:"#ef4444" };
            return (
              <div key={key} className="ro-stat" style={{
                animationDelay:`${i*35}ms`,
                borderTopColor: val > 0 ? colorMap[key] : "var(--bdr)",
                borderTopWidth: val > 0 ? 3 : 1.5,
              }}>
                <p className="ro-stat-lbl">{key}</p>
                <p className="ro-stat-val" style={{color: val>0 ? colorMap[key] : "var(--ink3)"}}>{val}</p>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="ro-filters">
          <div className="ro-filter-track">
            {FILTER_TABS.map(t => (
              <button key={t.key}
                className={`ro-filter-btn ${filter===t.key?"ro-filter-active":""}`}
                onClick={() => setFilter(t.key)}>
                {t.label}
                {t.count > 0 && (
                  <span className={`ro-filter-n ${filter===t.key?"ro-filter-n-on":"ro-filter-n-off"}`}>
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Orders */}
        {filtered.length === 0 ? (
          <div className="ro-empty">
            <div style={{fontSize:44,marginBottom:12}}>📭</div>
            <p style={{fontSize:18,fontWeight:900,color:"var(--ink)",marginBottom:5}}>No orders</p>
            <p style={{fontSize:12,fontWeight:600,color:"var(--ink3)"}}>
              {filter==="All" ? "No orders yet." : `No ${filter.toLowerCase()} orders.`}
            </p>
          </div>
        ) : (
          <div style={{display:"flex",flexDirection:"column",gap:11}}>
            {filtered.map((raw, idx) => {
              const order   = nrm(raw);
              const st      = getSt(order.orderStatus);
              const isLocked = ["Completed","Delivered","Cancelled"].includes(order.orderStatus);
              const isOpen   = expanded === order.orderID;
              const isBusy   = updatingId === order.orderID;
              const date     = parseDate(order.orderDate);

              return (
                <div key={order.orderID} className="ro-card" style={{animationDelay:`${idx*35}ms`}}>
                  <div className="ro-card-accent" style={{background: st.color}}/>
                  <div className="ro-card-body">

                    {/* Header */}
                    <div className="ro-card-head">
                      <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                        <span className="ro-order-id">Order #{order.orderID}</span>
                        <span className="ro-pill" style={{color:st.color,background:st.bg,borderColor:st.border}}>
                          <span style={{width:6,height:6,borderRadius:"50%",background:st.color,display:"inline-block"}}/>
                          {st.label}
                        </span>
                      </div>
                      <span className="ro-amount">₹{order.totalAmount}</span>
                    </div>

                    {/* Meta */}
                    <div className="ro-meta">
                      <span className="ro-chip">👤 {order.userName}</span>
                      <span className="ro-chip">
                        📅 {date.toLocaleDateString("en-IN",{day:"numeric",month:"short"})} · {date.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}
                      </span>
                      {order.deliveryAddress && <span className="ro-chip">📍 {order.deliveryAddress}</span>}
                      {order.phone && <span className="ro-chip">📞 {order.phone}</span>}
                    </div>

                    {/* ── ACTIONS PER STATUS ── */}

                    {/* Pending → Confirm or Cancel */}
                    {order.orderStatus === "Pending" && (
                      <div className="ro-actions">
                        <p className="ro-actions-lbl">Update Order</p>
                        <div className="ro-actions-btns">
                          <button className="ro-btn ro-btn-confirm" disabled={isBusy}
                            onClick={() => updateStatus(order.orderID, "Confirmed")}>
                            {isBusy && <RefreshCw size={11} className="ro-spin"/>} ✓ Confirm Order
                          </button>
                          <button className="ro-btn ro-btn-cancel" disabled={isBusy}
                            onClick={() => updateStatus(order.orderID, "Cancelled")}>
                            ✕ Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Confirmed → Start Preparing or Cancel */}
                    {order.orderStatus === "Confirmed" && (
                      <div className="ro-actions">
                        <p className="ro-actions-lbl">Update Order</p>
                        <div className="ro-actions-btns">
                          <button className="ro-btn ro-btn-prepare" disabled={isBusy}
                            onClick={() => updateStatus(order.orderID, "Preparing")}>
                            {isBusy && <RefreshCw size={11} className="ro-spin"/>} 🍳 Start Preparing
                          </button>
                          <button className="ro-btn ro-btn-cancel" disabled={isBusy}
                            onClick={() => updateStatus(order.orderID, "Cancelled")}>
                            ✕ Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Preparing → Assign & Dispatch (single button, atomic action) or Cancel */}
                    {order.orderStatus === "Preparing" && (
                      <div className="ro-actions">
                        <p className="ro-actions-lbl">Update Order</p>
                        <div className="ro-actions-btns">
                          <button className="ro-btn ro-btn-dispatch" disabled={isBusy}
                            onClick={() => openDispatchModal(raw)}>
                            <Truck size={13}/> Assign & Dispatch
                          </button>
                          <button className="ro-btn ro-btn-cancel" disabled={isBusy}
                            onClick={() => updateStatus(order.orderID, "Cancelled")}>
                            ✕ Cancel
                          </button>
                        </div>
                        <p style={{fontSize:10,color:"var(--ink3)",fontWeight:500,marginTop:7}}>
                          ℹ️ This will assign a delivery person and mark the order as "Out for Delivery" at the same time.
                        </p>
                      </div>
                    )}

                    {/* OutForDelivery → delivery boy handles it now */}
                    {order.orderStatus === "OutForDelivery" && (
                      <div className="ro-notice ro-notice-green">
                        <Truck size={13}/>
                        Delivery assigned — waiting for delivery confirmation.
                      </div>
                    )}

                    {/* Locked */}
                    {isLocked && (
                      <div className="ro-notice ro-notice-mute">
                        <AlertCircle size={13} style={{flexShrink:0}}/>
                        {LOCKED_MSG[order.orderStatus] || "Order is complete."}
                      </div>
                    )}

                  </div>

                  {/* Toggle items */}
                  <button className="ro-toggle" onClick={() => toggleItems(order.orderID)}>
                    {isOpen ? <ChevronUp size={13}/> : <ChevronDown size={13}/>}
                    {isOpen ? "Hide items" : "View order items"}
                  </button>

                  {/* Items panel */}
                  {isOpen && raw.items && (
                    <div className="ro-items-panel">
                      <p className="ro-items-lbl">{raw.items.length} item{raw.items.length !== 1 ? "s" : ""}</p>
                      {raw.items.map(item => {
                        const mi  = item.menuItem ?? item.MenuItem ?? {};
                        const img = mi.imageUrl ?? mi.ImageUrl ?? mi.menuItemImage ?? "";
                        const nm  = mi.menuItemName ?? mi.MenuItemName ?? "Item";
                        const qty = item.quantity ?? item.Quantity ?? 0;
                        const prc = item.orderItemPrice ?? item.OrderItemPrice ?? 0;
                        return (
                          <div key={item.orderItemID ?? item.OrderItemID} className="ro-item">
                            <div className="ro-item-img">
                              {img ? <img src={img} alt={nm}/> : "🍽️"}
                            </div>
                            <div style={{flex:1,minWidth:0}}>
                              <p className="ro-item-name">{nm}</p>
                              <p className="ro-item-qty">Qty: {qty}</p>
                            </div>
                            <span className="ro-item-price">₹{prc}</span>
                          </div>
                        );
                      })}
                      <div className="ro-total">
                        <span className="ro-total-lbl">Order Total</span>
                        <span className="ro-total-val">₹{order.totalAmount}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantOrders;