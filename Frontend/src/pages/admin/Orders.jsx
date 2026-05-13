import { useEffect, useState, useRef } from "react";
import {
  Store, User, Calendar, ShoppingBag, ChevronDown, ChevronUp,
  Package, RefreshCw, Check, AlertCircle, IndianRupee,
  MapPin, Phone, Search, X, Clock, CheckCircle, XCircle,
  Bike, UtensilsCrossed, ChefHat, BadgeCheck, Star,
  Filter, Hash, ReceiptText, TrendingUp, Sparkles,
} from "lucide-react";
import axiosInstance from "../../api/axiosInstance";

/* ══════════════════════════════════════════════════════
   NORMALISE — handles both camelCase & PascalCase
══════════════════════════════════════════════════════ */
const n = (o) => ({
  orderID:         o.orderID         ?? o.OrderID         ?? 0,
  orderStatus:     o.orderStatus     ?? o.OrderStatus     ?? "",
  totalAmount:     o.totalAmount     ?? o.TotalAmount      ?? 0,
  orderDate:       o.orderDate       ?? o.OrderDate        ?? o.createdAt ?? o.CreatedAt ?? null,
  userName:        o.userName        ?? o.UserName         ?? "",
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
    image: mi.imageUrl ?? mi.ImageUrl ?? mi.menuItemImage ?? mi.MenuItemImage ?? "",
  };
};

/* ══ STATUS CONFIG ══════════════════════════════════ */
const STATUS_CFG = {
  Pending:        { label:"Pending",          color:"#ea580c", bg:"#fff7ed", border:"#fed7aa", step:0 },
  Confirmed:      { label:"Confirmed",        color:"#7c3aed", bg:"#f5f3ff", border:"#ddd6fe", step:1 },
  Preparing:      { label:"Preparing",        color:"#0891b2", bg:"#ecfeff", border:"#a5f3fc", step:2 },
  OutForDelivery: { label:"Out for Delivery", color:"#0d9488", bg:"#f0fdfa", border:"#99f6e4", step:3 },
  Completed:      { label:"Delivered",        color:"#15803d", bg:"#f0fdf4", border:"#bbf7d0", step:4 },
  Delivered:      { label:"Delivered",        color:"#15803d", bg:"#f0fdf4", border:"#bbf7d0", step:4 },
  Cancelled:      { label:"Cancelled",        color:"#dc2626", bg:"#fef2f2", border:"#fecaca", step:-1},
};
const getCfg = (s) => STATUS_CFG[s] ?? { label:s, color:"#78716c", bg:"#faf8f5", border:"#e5e0d8", step:0 };

const STEPS = [
  { step:0, Icon:Clock,           label:"Placed"    },
  { step:1, Icon:ChefHat,         label:"Confirmed" },
  { step:2, Icon:UtensilsCrossed, label:"Preparing" },
  { step:3, Icon:Bike,            label:"On Way"    },
  { step:4, Icon:BadgeCheck,      label:"Delivered" },
];

const fmtDate = (d) => {
  if (!d) return "—";
  const s = String(d);
  const dt = new Date(s.endsWith("Z") || s.includes("+") ? s : s + "Z");
  return dt.toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" });
};
const fmtTime = (d) => {
  if (!d) return "";
  const s = String(d);
  return new Date(s.endsWith("Z") || s.includes("+") ? s : s + "Z")
    .toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" });
};
const fmtINR = (v) => `₹${Number(v||0).toLocaleString("en-IN")}`;

/* ══ Animated Counter ═══════════════════════════════ */
const Counter = ({ to, duration = 900 }) => {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!to) return;
    let s = 0; const step = to / (duration / 16);
    const t = setInterval(() => { s += step; if (s >= to) { setV(to); clearInterval(t); } else setV(Math.floor(s)); }, 16);
    return () => clearInterval(t);
  }, [to]);
  return <span>{v.toLocaleString("en-IN")}</span>;
};

/* ══ Toast ══════════════════════════════════════════ */
const Toast = ({ toast }) => !toast ? null : (
  <div className={`ao-toast ${toast.type === "err" ? "ao-toast-err" : "ao-toast-ok"}`}>
    {toast.type === "err" ? <AlertCircle size={13}/> : <Check size={13}/>} {toast.msg}
  </div>
);

/* ══ Status Badge ════════════════════════════════════ */
const StatusBadge = ({ status }) => {
  const cfg = getCfg(status);
  return (
    <span className="ao-badge" style={{ background:cfg.bg, color:cfg.color, borderColor:cfg.border }}>
      {cfg.label}
    </span>
  );
};

/* ══ Order Tracker ══════════════════════════════════ */
const Tracker = ({ orderStatus }) => {
  const cfg = getCfg(orderStatus);
  if (cfg.step < 0) return (
    <div className="ao-tracker-cancelled">
      <XCircle size={12}/> Order was cancelled
    </div>
  );
  const cur = cfg.step;
  return (
    <div className="ao-tracker">
      <div className="ao-tracker-row">
        {STEPS.map((s, i) => {
          const done   = s.step < cur;
          const active = s.step === cur;
          const Icon   = s.Icon;
          return (
            <div key={s.step} className="ao-tr-col">
              {i > 0 && <div className="ao-tr-line" style={{ background: s.step <= cur ? "#22c55e" : "var(--ao-bdr)" }}/>}
              <div className={`ao-tr-node ${done?"ao-tr-done":active?"ao-tr-active":"ao-tr-idle"}`}>
                {done ? <Check size={10}/> : <Icon size={10}/>}
                {active && <span className="ao-tr-pulse"/>}
              </div>
              {i < STEPS.length - 1 && <div className="ao-tr-line" style={{ background: done ? "#22c55e" : "var(--ao-bdr)" }}/>}
            </div>
          );
        })}
      </div>
      <div className="ao-tracker-labels">
        {STEPS.map(s => (
          <span key={s.step} className={`ao-tr-lbl ${s.step===cur?"ao-tr-lbl-active":s.step<cur?"ao-tr-lbl-done":""}`}>
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
};

/* ══ Order Card ═════════════════════════════════════ */
const OrderCard = ({ raw, idx, expanded, onToggle }) => {
  const order = n(raw);
  const cfg   = getCfg(order.orderStatus);

  return (
    <div
      className="ao-card"
      style={{ "--ac": cfg.color, "--ab": cfg.bg, "--abd": cfg.border, "--i": idx }}
    >
      <div className="ao-card-top-stripe"/>

      {/* Header */}
      <div className="ao-card-header">
        <div className="ao-card-id-group">
          <span className="ao-card-id"><Hash size={11}/>#{order.orderID}</span>
          {order.restaurantName && (
            <span className="ao-card-rest">{order.restaurantName}</span>
          )}
        </div>
        <StatusBadge status={order.orderStatus}/>
      </div>

      {/* Tracker */}
      <div className="ao-card-tracker-wrap">
        <Tracker orderStatus={order.orderStatus}/>
      </div>

      {/* Info rows */}
      <div className="ao-card-info">
        {order.userName && (
          <div className="ao-card-row">
            <User size={12}/>
            <span className="ao-card-row-val">{order.userName}</span>
            <span className="ao-customer-tag">Customer</span>
          </div>
        )}
        {order.deliveryAddress && (
          <div className="ao-card-row ao-card-row-addr">
            <MapPin size={12}/>
            <span className="ao-card-row-addr-val">{order.deliveryAddress}</span>
          </div>
        )}
        {order.phone && (
          <div className="ao-card-row">
            <Phone size={12}/>
            <span className="ao-card-row-val">{order.phone}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="ao-card-footer">
        <div className="ao-card-amount">
          <span className="ao-amount-num">{fmtINR(order.totalAmount)}</span>
          <span className="ao-amount-date">
            {fmtDate(order.orderDate)}{fmtTime(order.orderDate) && ` · ${fmtTime(order.orderDate)}`}
          </span>
        </div>
        <button className="ao-toggle-btn" onClick={() => onToggle(order.orderID)}>
          <ReceiptText size={12}/>
          {expanded ? "Hide" : "Items"}
          {expanded ? <ChevronUp size={11}/> : <ChevronDown size={11}/>}
        </button>
      </div>

      {/* Items panel */}
      {expanded && raw.items && (
        <div className="ao-items-panel">
          {raw.items.length === 0 ? (
            <p className="ao-items-empty">No items found</p>
          ) : (
            raw.items.map(rawItem => {
              const item = nItem(rawItem);
              return (
                <div key={item.orderItemID} className="ao-item-row">
                  <div className="ao-item-img">
                    {item.image
                      ? <img src={item.image} alt={item.name} onError={e=>{e.target.style.display="none"}}/>
                      : <UtensilsCrossed size={14}/>
                    }
                  </div>
                  <div className="ao-item-info">
                    <p className="ao-item-name">{item.name}</p>
                    <p className="ao-item-qty">Qty: {item.quantity}</p>
                  </div>
                  <span className="ao-item-price">{fmtINR(item.orderItemPrice)}</span>
                </div>
              );
            })
          )}
          <div className="ao-items-total">
            <span>Grand Total</span>
            <span className="ao-items-total-amt">{fmtINR(order.totalAmount)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

/* ══ Stat Card ══════════════════════════════════════ */
const StatCard = ({ label, value, icon: Icon, color, bg, border, sub, delay, prefix="" }) => (
  <div className="ao-stat" style={{ "--sc":color,"--sb":bg,"--sbd":border, animationDelay:delay }}>
    <div className="ao-stat-icon"><Icon size={17}/></div>
    <div>
      <div className="ao-stat-val">{prefix}<Counter to={value}/></div>
      <div className="ao-stat-label">{label}</div>
      {sub && <div className="ao-stat-sub">{sub}</div>}
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════
   MAIN
══════════════════════════════════════════════════════ */
export default function Orders() {
  const [restaurants,   setRestaurants]   = useState([]);
  const [orders,        setOrders]        = useState([]);
  const [expanded,      setExpanded]      = useState(null);
  const [activeRest,    setActiveRest]    = useState(null);
  const [loadingRest,   setLoadingRest]   = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [refreshing,    setRefreshing]    = useState(false);
  const [error,         setError]         = useState("");
  const [search,        setSearch]        = useState("");
  const [statusFilter,  setStatusFilter]  = useState("All");
  const [filterOpen,    setFilterOpen]    = useState(false);
  const [toast,         setToast]         = useState(null);
  const filterRef = useRef(null);

  const showToast = (msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3600);
  };

  useEffect(() => {
    const h = (e) => { if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  /* ── Load restaurants ── */
  useEffect(() => {
    (async () => {
      try {
        setLoadingRest(true);
        const res = await axiosInstance.get("/Restaurant");
        setRestaurants(res.data || []);
      } catch {
        showToast("Failed to load restaurants", "err");
      } finally {
        setLoadingRest(false);
      }
    })();
  }, []);

  /* ── Load orders for a restaurant ── */
  const loadOrders = async (r) => {
    setActiveRest(r);
    setLoadingOrders(true);
    setExpanded(null);
    setOrders([]);
    setSearch("");
    setStatusFilter("All");
    setError("");
    try {
      const res = await axiosInstance.get(`/Order/restaurant/${r.restaurantID}`);
      setOrders(res.data || []);
    } catch (e) {
      setError(e.response?.data || e.message || "Failed to load orders");
      showToast("Failed to load orders", "err");
    } finally {
      setLoadingOrders(false);
    }
  };

  /* ── Toggle order items ── */
  const toggleItems = async (orderId) => {
    if (expanded === orderId) { setExpanded(null); return; }
    const existing = orders.find(o => n(o).orderID === orderId);
    if (!existing?.items) {
      setOrders(p => p.map(o => n(o).orderID === orderId ? { ...o, items: null } : o));
      setExpanded(orderId);
      try {
        const res = await axiosInstance.get(`/OrderItem/order/${orderId}`);
        setOrders(p => p.map(o => n(o).orderID === orderId ? { ...o, items: res.data } : o));
      } catch {
        showToast("Failed to load items", "err");
        setOrders(p => p.map(o => n(o).orderID === orderId ? { ...o, items: [] } : o));
      }
    } else {
      setExpanded(orderId);
    }
  };

  const handleRefresh = async () => {
    if (!activeRest) return;
    setRefreshing(true);
    await loadOrders(activeRest);
    setTimeout(() => setRefreshing(false), 700);
  };

  /* ── Derived stats ── */
  const revenue   = orders.reduce((s, o) => s + (n(o).totalAmount || 0), 0);
  const completed = orders.filter(o => ["Completed","Delivered"].includes(n(o).orderStatus)).length;
  const pending   = orders.filter(o => n(o).orderStatus === "Pending").length;
  const cancelled = orders.filter(o => n(o).orderStatus === "Cancelled").length;
  const active    = orders.filter(o => ["Confirmed","Preparing","OutForDelivery"].includes(n(o).orderStatus)).length;

  /* ── All statuses in this restaurant's orders ── */
  const allStatuses = ["All", ...new Set(orders.map(o => n(o).orderStatus))];

  /* ── Filtered orders ── */
  const filtered = orders
    .map(raw => ({ raw, norm: n(raw) }))
    .filter(({ norm }) => {
      const q = search.toLowerCase();
      const mQ = !q
        || String(norm.orderID).includes(q)
        || norm.userName.toLowerCase().includes(q)
        || norm.deliveryAddress.toLowerCase().includes(q)
        || norm.phone.includes(q);
      const mS = statusFilter === "All" || norm.orderStatus === statusFilter;
      return mQ && mS;
    });

  return (
    <>
      <style>{CSS}</style>
      <Toast toast={toast}/>

      <div className="ao-root">

        {/* ══ HERO ══ */}
        <header className="ao-hero">
          <div className="ao-hero-blobs">
            <div className="ao-blob ao-blob1"/>
            <div className="ao-blob ao-blob2"/>
            <div className="ao-blob ao-blob3"/>
          </div>
          <div className="ao-hero-dots"/>

          <div className="ao-hero-left">
            <div className="ao-hero-eyebrow">
              <ShoppingBag size={11}/> Admin Console · Order Management
            </div>
            <h1 className="ao-hero-title">
              Order <em>Hub</em>
            </h1>
            <p className="ao-hero-desc">
              {activeRest
                ? <>Viewing orders for <strong>{activeRest.name}</strong></>
                : <>Select a restaurant below to view its orders</>
              }
            </p>
          </div>

          <div className="ao-hero-right">
            <div className="ao-live-badge">
              <span className="ao-live-dot"/>
              {active} Active
            </div>
            <div className="ao-hero-stat">
              <span className="ao-hero-stat-num"><Counter to={orders.length}/></span>
              <span className="ao-hero-stat-lbl">Total</span>
            </div>
            <div className="ao-hero-stat ao-hero-stat-green">
              <span className="ao-hero-stat-num"><Counter to={completed}/></span>
              <span className="ao-hero-stat-lbl">Done</span>
            </div>
            {activeRest && (
              <button className={`ao-refresh-btn ${refreshing?"ao-refreshing":""}`} onClick={handleRefresh}>
                <RefreshCw size={14}/>
              </button>
            )}
          </div>
        </header>

        {/* ══ STATS ══ */}
        {activeRest && !loadingOrders && (
          <div className="ao-stats">
            <StatCard label="Total"     value={orders.length}        icon={ShoppingBag}  color="#4f46e5" bg="#eef2ff" border="#c7d2fe" sub="All orders"       delay="0ms"   />
            <StatCard label="Revenue"   value={Math.round(revenue)}  icon={IndianRupee}  color="#0f766e" bg="#f0fdfa" border="#99f6e4" sub="Total collected"  delay="60ms"  prefix="₹"/>
            <StatCard label="Active"    value={active}               icon={TrendingUp}   color="#0891b2" bg="#ecfeff" border="#a5f3fc" sub="In progress"      delay="120ms" />
            <StatCard label="Completed" value={completed}            icon={CheckCircle}  color="#15803d" bg="#f0fdf4" border="#bbf7d0" sub="Delivered"        delay="180ms" />
            <StatCard label="Pending"   value={pending}              icon={Clock}        color="#ea580c" bg="#fff7ed" border="#fed7aa" sub="Awaiting confirm" delay="240ms" />
            {cancelled > 0 && (
              <StatCard label="Cancelled" value={cancelled}          icon={XCircle}      color="#dc2626" bg="#fef2f2" border="#fecaca" sub="Cancelled"        delay="300ms" />
            )}
          </div>
        )}

        {/* ══ RESTAURANT FILTER STRIP ══ */}
        <div className="ao-rest-strip-wrap">
          <div className="ao-rest-strip">
            <p className="ao-rest-strip-lbl"><Store size={11}/> Select Restaurant</p>
            {loadingRest ? (
              <div className="ao-rest-btns">
                {[...Array(4)].map((_,i) => <div key={i} className="ao-rest-skel" style={{animationDelay:`${i*60}ms`}}/>)}
              </div>
            ) : (
              <div className="ao-rest-btns">
                {restaurants.map(r => {
                  const isActive = activeRest?.restaurantID === r.restaurantID;
                  const rCount = isActive ? orders.length : null;
                  return (
                    <button
                      key={r.restaurantID}
                      className={`ao-rest-btn ${isActive ? "ao-rest-btn-on" : ""}`}
                      onClick={() => loadOrders(r)}
                    >
                      {r.imageUrl && (
                        <img
                          src={r.imageUrl}
                          alt={r.name}
                          className="ao-rest-img"
                          onError={e => { e.target.style.display = "none"; }}
                        />
                      )}
                      <span>{r.name}</span>
                      {r.city && <span className="ao-rest-city">{r.city}</span>}
                      <span className={`ao-rest-dot-ind ${r.isOpen?"ao-dot-open":"ao-dot-closed"}`}/>
                      {isActive && rCount !== null && (
                        <span className="ao-rest-count">{rCount}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ══ TOOLBAR ══ */}
        {activeRest && !loadingOrders && !error && (
          <div className="ao-toolbar">
            <div className="ao-srch-wrap">
              <Search size={13} className="ao-srch-ico"/>
              <input
                className="ao-srch"
                placeholder="Search by order ID, customer, address…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && <button className="ao-srch-clr" onClick={() => setSearch("")}><X size={11}/></button>}
            </div>

            {/* Status filter dropdown */}
            <div className="ao-filter-wrap" ref={filterRef}>
              <button
                className={`ao-filter-btn ${filterOpen ? "ao-filter-open" : ""}`}
                onClick={() => setFilterOpen(v => !v)}
              >
                {statusFilter === "All"
                  ? <><Package size={12}/><span>All Statuses</span></>
                  : <>
                      <span className="ao-filter-dot" style={{ background: getCfg(statusFilter).color }}/>
                      <span>{getCfg(statusFilter).label}</span>
                    </>
                }
                <ChevronDown size={11} className={`ao-chevron ${filterOpen ? "ao-chevron-up" : ""}`}/>
              </button>
              {filterOpen && (
                <div className="ao-filter-menu">
                  <p className="ao-filter-hdr">Filter by Status</p>
                  <button
                    className={`ao-filter-item ${statusFilter === "All" ? "ao-filter-item-on" : ""}`}
                    onClick={() => { setStatusFilter("All"); setFilterOpen(false); }}
                  >
                    <span className="ao-filter-ico" style={{ background:"#f5f2ed", color:"#78716c" }}>
                      <Package size={11}/>
                    </span>
                    All Statuses
                    <span className="ao-filter-cnt">{orders.length}</span>
                    {statusFilter === "All" && <Check size={10} className="ao-dd-tick"/>}
                  </button>
                  {allStatuses.filter(s => s !== "All").map(s => {
                    const cfg = getCfg(s);
                    const cnt = orders.filter(o => n(o).orderStatus === s).length;
                    return (
                      <button
                        key={s}
                        className={`ao-filter-item ${statusFilter === s ? "ao-filter-item-on" : ""}`}
                        onClick={() => { setStatusFilter(s); setFilterOpen(false); }}
                      >
                        <span className="ao-filter-ico" style={{ background:cfg.bg, color:cfg.color }}>
                          <span style={{width:8,height:8,borderRadius:"50%",background:cfg.color,display:"inline-block"}}/>
                        </span>
                        {cfg.label}
                        <span className="ao-filter-cnt">{cnt}</span>
                        {statusFilter === s && <Check size={10} className="ao-dd-tick"/>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <span className="ao-result-count">
              <strong>{filtered.length}</strong> / {orders.length}
            </span>
          </div>
        )}

        {/* ══ CONTENT ══ */}
        <div className="ao-content">
          {!activeRest ? (
            /* Welcome state */
            <div className="ao-welcome">
              <div className="ao-welcome-visual">
                <div className="ao-welcome-rings">
                  <div className="ao-ring ao-ring1"/>
                  <div className="ao-ring ao-ring2"/>
                  <div className="ao-ring ao-ring3"/>
                </div>
                <div className="ao-welcome-icon"><ShoppingBag size={32}/></div>
              </div>
              <h2 className="ao-welcome-title">Select a Restaurant</h2>
              <p className="ao-welcome-sub">Choose a restaurant from the strip above to view all its orders with full details</p>
            </div>
          ) : loadingOrders ? (
            <div className="ao-loading">
              <div className="ao-loader"/>
              <p>Loading orders for <strong>{activeRest.name}</strong>…</p>
            </div>
          ) : error ? (
            <div className="ao-state ao-state-err">
              <AlertCircle size={36}/>
              <h3>Failed to load</h3>
              <p>{error}</p>
              <button className="ao-state-btn" onClick={handleRefresh}>Retry</button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="ao-state">
              <span className="ao-state-emoji">📦</span>
              <h3>No orders found</h3>
              <p>{search ? `Nothing matches "${search}"` : "No orders match this filter."}</p>
              {(search || statusFilter !== "All") && (
                <button className="ao-state-btn" onClick={() => { setSearch(""); setStatusFilter("All"); }}>
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="ao-grid-label">
                <span>Orders</span>
                <span className="ao-grid-count">{filtered.length}</span>
                {activeRest && (
                  <span className="ao-active-rest-pill">
                    <Store size={10}/> {activeRest.name}
                    <button onClick={() => { setActiveRest(null); setOrders([]); }}><X size={9}/></button>
                  </span>
                )}
                {statusFilter !== "All" && (
                  <span className="ao-active-status-pill" style={{ background:getCfg(statusFilter).bg, color:getCfg(statusFilter).color, borderColor:getCfg(statusFilter).border }}>
                    {getCfg(statusFilter).label}
                    <button onClick={() => setStatusFilter("All")}><X size={9}/></button>
                  </span>
                )}
              </div>
              <div className="ao-grid">
                {filtered.map(({ raw, norm }, i) => (
                  <OrderCard
                    key={norm.orderID}
                    raw={raw}
                    idx={i}
                    expanded={expanded === norm.orderID}
                    onToggle={toggleItems}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {!loadingOrders && filtered.length > 0 && (
          <div className="ao-footer">
            {filtered.length} order record{filtered.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════
   CSS
══════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,700;0,800;0,900;1,700;1,800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

.ao-root *,.ao-root *::before,.ao-root *::after{box-sizing:border-box;margin:0;padding:0}
.ao-root{
  --ao-bg:#faf8f5;--ao-surf:#fff;--ao-surf2:#f5f2ed;--ao-surf3:#ede9e2;
  --ao-bdr:#e5e0d8;--ao-bdr2:#d4cfc6;
  --ao-ink:#1c1917;--ao-ink2:#44403c;--ao-ink3:#78716c;--ao-ink4:#a8a29e;
  --ao-teal:#0f766e;--ao-teal-lt:#f0fdfa;
  --ao-amber:#d97706;--ao-rose:#dc2626;--ao-rose-lt:#fef2f2;--ao-indigo:#4f46e5;
  --ao-navy:#0f2d5e;--ao-cyan:#0891b2;
  --ao-sh:0 1px 3px rgba(28,25,23,.05),0 4px 14px rgba(28,25,23,.07);
  --ao-sh-h:0 6px 22px rgba(28,25,23,.11),0 22px 52px rgba(28,25,23,.1);
  font-family:'Plus Jakarta Sans',system-ui,sans-serif;
  background:var(--ao-bg);min-height:100vh;color:var(--ao-ink);
}

@keyframes ao-in{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes ao-card-in{from{opacity:0;transform:translateY(20px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes ao-fade{from{opacity:0}to{opacity:1}}
@keyframes ao-spin{to{transform:rotate(360deg)}}
@keyframes ao-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(1.7)}}
@keyframes ao-toast{from{opacity:0;transform:translateX(-50%) translateY(14px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
@keyframes ao-blob{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(18px,-12px) scale(1.06)}}
@keyframes ao-dd{from{opacity:0;transform:translateY(-6px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes ao-shimmer{from{background-position:200% 0}to{background-position:-200% 0}}
@keyframes ao-ring{0%,100%{transform:scale(1);opacity:.4}50%{transform:scale(1.08);opacity:.25}}

/* TOAST */
.ao-toast{position:fixed;bottom:22px;left:50%;transform:translateX(-50%);z-index:9999;display:flex;align-items:center;gap:8px;padding:10px 20px;background:#fff;border-radius:50px;font-size:12.5px;font-weight:700;box-shadow:0 6px 28px rgba(28,25,23,.14);white-space:nowrap;animation:ao-toast .28s cubic-bezier(.22,1,.36,1)}
.ao-toast-ok{border:1.5px solid #a7f3d0;color:#065f46}
.ao-toast-err{border:1.5px solid #fca5a5;color:#991b1b}

/* ══ HERO ══ */
.ao-hero{
  position:relative;padding:46px 32px 40px;overflow:hidden;
  background:linear-gradient(135deg,#fdf8f0 0%,#f0fbff 48%,#fafbff 100%);
  border-bottom:1.5px solid var(--ao-bdr);
  display:flex;align-items:center;justify-content:space-between;gap:18px;flex-wrap:wrap;
}
.ao-hero-blobs{position:absolute;inset:0;pointer-events:none;overflow:hidden}
.ao-blob{position:absolute;border-radius:50%;filter:blur(72px);animation:ao-blob 16s ease-in-out infinite}
.ao-blob1{width:320px;height:320px;background:rgba(15,118,110,.07);top:-90px;left:-50px;animation-delay:0s}
.ao-blob2{width:250px;height:250px;background:rgba(217,119,6,.06);top:10px;right:70px;animation-delay:-5s}
.ao-blob3{width:180px;height:180px;background:rgba(79,70,229,.05);bottom:-40px;left:40%;animation-delay:-10s}
.ao-hero-dots{position:absolute;inset:0;pointer-events:none;background-image:radial-gradient(circle,rgba(28,25,23,.05) 1px,transparent 1px);background-size:20px 20px;mask-image:radial-gradient(ellipse at 68% 50%,black 0%,transparent 62%)}
.ao-hero-left{position:relative;z-index:1}
.ao-hero-eyebrow{display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:700;color:var(--ao-ink3);letter-spacing:.08em;text-transform:uppercase;background:rgba(255,255,255,.8);border:1px solid var(--ao-bdr);padding:4px 12px;border-radius:50px;margin-bottom:14px}
.ao-hero-title{font-family:'Fraunces',serif;font-size:clamp(36px,5vw,60px);font-weight:900;color:var(--ao-ink);line-height:.92;letter-spacing:-.025em;margin-bottom:11px;animation:ao-in .55s cubic-bezier(.22,1,.36,1)}
.ao-hero-title em{font-style:italic;font-weight:800;background:linear-gradient(135deg,var(--ao-teal),#0d9488);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.ao-hero-desc{font-size:13.5px;color:var(--ao-ink3);animation:ao-fade .7s .18s both}
.ao-hero-desc strong{color:var(--ao-ink);font-weight:700}
.ao-hero-right{position:relative;z-index:1;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.ao-live-badge{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;background:#f0fdfa;border:1.5px solid #99f6e4;border-radius:50px;font-size:12px;font-weight:700;color:#0f766e}
.ao-live-dot{width:7px;height:7px;border-radius:50%;background:#0f766e;animation:ao-pulse 2s ease infinite}
.ao-hero-stat{display:flex;flex-direction:column;align-items:center;background:rgba(255,255,255,.82);border:1.5px solid var(--ao-bdr);border-radius:14px;padding:10px 18px;min-width:62px;backdrop-filter:blur(4px)}
.ao-hero-stat-green{border-color:#bbf7d0;background:#f0fdf4}
.ao-hero-stat-num{font-family:'Fraunces',serif;font-size:26px;font-weight:800;color:var(--ao-ink);line-height:1;letter-spacing:-.03em}
.ao-hero-stat-lbl{font-size:10px;font-weight:700;color:var(--ao-ink4);text-transform:uppercase;letter-spacing:.07em;margin-top:2px}
.ao-refresh-btn{width:38px;height:38px;border-radius:11px;border:1.5px solid var(--ao-bdr2);background:#fff;color:var(--ao-ink3);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .18s;box-shadow:var(--ao-sh)}
.ao-refresh-btn:hover{border-color:var(--ao-teal);color:var(--ao-teal);background:var(--ao-teal-lt)}
.ao-refreshing svg{animation:ao-spin .7s linear infinite}

/* ══ STATS ══ */
.ao-stats{display:grid;grid-template-columns:repeat(auto-fill,minmax(175px,1fr));gap:14px;padding:20px 28px;border-bottom:1.5px solid var(--ao-bdr);background:var(--ao-bg)}
.ao-stat{background:var(--ao-surf);border:1.5px solid var(--sbd,var(--ao-bdr));border-radius:16px;padding:16px 18px;display:flex;align-items:center;gap:12px;box-shadow:var(--ao-sh);transition:all .22s;animation:ao-in .5s cubic-bezier(.22,1,.36,1) both;position:relative;overflow:hidden}
.ao-stat::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--sc);border-radius:16px 16px 0 0}
.ao-stat:hover{transform:translateY(-3px);box-shadow:var(--ao-sh-h)}
.ao-stat-icon{width:38px;height:38px;border-radius:10px;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:var(--sb);color:var(--sc)}
.ao-stat-val{font-family:'Fraunces',serif;font-size:26px;font-weight:800;color:var(--ao-ink);line-height:1;letter-spacing:-.03em}
.ao-stat-label{font-size:11px;font-weight:600;color:var(--ao-ink3);margin-top:2px}
.ao-stat-sub{font-size:10px;color:var(--ao-ink4);margin-top:2px}

/* ══ RESTAURANT STRIP ══ */
.ao-rest-strip-wrap{background:var(--ao-surf);border-bottom:1.5px solid var(--ao-bdr);padding:14px 28px}
.ao-rest-strip-lbl{display:flex;align-items:center;gap:5px;font-size:10.5px;font-weight:700;color:var(--ao-ink4);text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px}
.ao-rest-btns{display:flex;gap:7px;overflow-x:auto;scrollbar-width:none;flex-wrap:wrap}
.ao-rest-btns::-webkit-scrollbar{display:none}
.ao-rest-btn{display:inline-flex;align-items:center;gap:6px;padding:7px 13px;background:var(--ao-surf2);border:1.5px solid var(--ao-bdr);border-radius:10px;font-family:inherit;font-size:12px;font-weight:600;color:var(--ao-ink3);cursor:pointer;transition:all .16s;white-space:nowrap;flex-shrink:0}
.ao-rest-btn:hover{border-color:var(--ao-teal);color:var(--ao-teal);background:var(--ao-teal-lt)}
.ao-rest-btn-on{background:var(--ao-teal-lt)!important;border-color:#99f6e4!important;color:var(--ao-teal)!important;font-weight:700}
.ao-rest-img{width:20px;height:20px;border-radius:5px;object-fit:cover;flex-shrink:0}
.ao-rest-city{font-size:10px;font-weight:500;color:var(--ao-ink4);font-style:italic}
.ao-rest-dot-ind{width:7px;height:7px;border-radius:50%;flex-shrink:0}
.ao-dot-open{background:#22c55e;animation:ao-pulse 2.2s ease infinite}
.ao-dot-closed{background:#f43f5e}
.ao-rest-count{font-size:10px;font-weight:800;background:rgba(15,118,110,.12);color:var(--ao-teal);padding:1px 6px;border-radius:50px}
.ao-rest-skel{height:36px;width:120px;border-radius:10px;background:linear-gradient(90deg,var(--ao-surf2) 25%,var(--ao-surf3) 50%,var(--ao-surf2) 75%);background-size:200%;animation:ao-shimmer 1.6s linear infinite;flex-shrink:0}

/* ══ TOOLBAR ══ */
.ao-toolbar{display:flex;align-items:center;gap:10px;padding:14px 28px;background:var(--ao-surf);border-bottom:1.5px solid var(--ao-bdr);flex-wrap:wrap;position:sticky;top:0;z-index:500}
.ao-srch-wrap{position:relative;flex:1;min-width:200px;max-width:380px}
.ao-srch-ico{position:absolute;left:11px;top:50%;transform:translateY(-50%);color:var(--ao-ink4);pointer-events:none}
.ao-srch{width:100%;padding:9px 34px;background:var(--ao-surf2);border:1.5px solid var(--ao-bdr);border-radius:10px;font-family:inherit;font-size:13px;color:var(--ao-ink);outline:none;transition:all .15s}
.ao-srch::placeholder{color:var(--ao-ink4)}
.ao-srch:focus{border-color:var(--ao-teal);background:#fff;box-shadow:0 0 0 3px rgba(15,118,110,.08)}
.ao-srch-clr{position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--ao-ink4);cursor:pointer;display:flex;align-items:center}

/* Filter dropdown */
.ao-filter-wrap{position:relative;z-index:9999;flex-shrink:0}
.ao-filter-btn{display:flex;align-items:center;gap:6px;padding:9px 14px;background:var(--ao-surf2);border:1.5px solid var(--ao-bdr);border-radius:10px;font-family:inherit;font-size:12.5px;font-weight:600;color:var(--ao-ink2);cursor:pointer;white-space:nowrap;transition:all .15s}
.ao-filter-btn:hover,.ao-filter-open{border-color:var(--ao-teal);color:var(--ao-teal);background:var(--ao-teal-lt)}
.ao-filter-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.ao-chevron{transition:transform .2s}
.ao-chevron-up{transform:rotate(180deg)}
.ao-filter-menu{position:absolute;top:calc(100% + 8px);right:0;background:#fff;border:1.5px solid var(--ao-bdr);border-radius:14px;padding:6px;box-shadow:0 12px 40px rgba(28,25,23,.13);min-width:210px;animation:ao-dd .18s cubic-bezier(.22,1,.36,1)}
.ao-filter-hdr{font-size:10px;font-weight:700;color:var(--ao-ink4);text-transform:uppercase;letter-spacing:.09em;padding:6px 10px 5px}
.ao-filter-item{width:100%;display:flex;align-items:center;gap:8px;padding:9px 10px;border:none;background:transparent;font-family:inherit;font-size:13px;font-weight:500;color:var(--ao-ink2);cursor:pointer;border-radius:8px;transition:background .12s;text-align:left}
.ao-filter-item:hover{background:var(--ao-surf2);color:var(--ao-ink)}
.ao-filter-item-on{font-weight:700}
.ao-filter-ico{width:24px;height:24px;border-radius:7px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.ao-filter-cnt{margin-left:auto;font-size:10px;font-weight:800;background:var(--ao-surf3);color:var(--ao-ink4);padding:1px 6px;border-radius:50px}
.ao-dd-tick{margin-left:auto;color:var(--ao-teal)}
.ao-result-count{font-size:12px;color:var(--ao-ink4);font-weight:500;white-space:nowrap;margin-left:auto}
.ao-result-count strong{color:var(--ao-ink2);font-weight:700}

/* ══ CONTENT ══ */
.ao-content{padding:24px 28px 60px;background:var(--ao-bg)}
.ao-grid-label{display:flex;align-items:center;gap:8px;margin-bottom:18px;font-size:11px;font-weight:700;color:var(--ao-ink4);text-transform:uppercase;letter-spacing:.1em;flex-wrap:wrap}
.ao-grid-count{width:22px;height:22px;border-radius:50%;background:var(--ao-surf3);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;color:var(--ao-ink3)}
.ao-active-rest-pill{display:inline-flex;align-items:center;gap:5px;padding:3px 8px 3px 9px;background:var(--ao-teal-lt);border:1px solid #99f6e4;border-radius:50px;color:var(--ao-teal);font-size:10px;font-weight:700}
.ao-active-rest-pill button{display:flex;align-items:center;background:none;border:none;cursor:pointer;color:inherit;padding:0;margin-left:1px}
.ao-active-status-pill{display:inline-flex;align-items:center;gap:5px;padding:3px 8px 3px 9px;border:1px solid;border-radius:50px;font-size:10px;font-weight:700}
.ao-active-status-pill button{display:flex;align-items:center;background:none;border:none;cursor:pointer;color:inherit;padding:0;margin-left:1px}

/* ══ GRID ══ */
.ao-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:16px;position:relative;z-index:0}

/* ══ ORDER CARD ══ */
.ao-card{
  background:var(--ao-surf);border:1.5px solid var(--ao-bdr);border-radius:18px;
  display:flex;flex-direction:column;overflow:hidden;
  box-shadow:var(--ao-sh);
  transition:transform .28s cubic-bezier(.22,1,.36,1),box-shadow .28s,border-color .28s;
  animation:ao-card-in .5s cubic-bezier(.22,1,.36,1) both;
  animation-delay:calc(var(--i,0) * 42ms);
  position:relative;
}
.ao-card:hover{transform:translateY(-5px);box-shadow:var(--ao-sh-h);border-color:rgba(15,118,110,.28)}
.ao-card-top-stripe{position:absolute;top:0;left:18px;right:18px;height:3px;background:var(--ac,var(--ao-teal));border-radius:0 0 4px 4px;opacity:.75;z-index:2}

/* Card header */
.ao-card-header{display:flex;align-items:center;justify-content:space-between;padding:16px 16px 10px}
.ao-card-id-group{display:flex;flex-direction:column;gap:3px}
.ao-card-id{display:inline-flex;align-items:center;gap:4px;font-family:'Fraunces',serif;font-size:15px;font-weight:800;color:var(--ao-ink)}
.ao-card-rest{font-size:10.5px;color:var(--ao-teal);font-weight:600;background:var(--ao-teal-lt);border:1px solid #99f6e4;padding:2px 7px;border-radius:5px;display:inline-block}
.ao-badge{display:inline-flex;align-items:center;padding:3px 9px;border-radius:50px;font-size:10px;font-weight:700;border:1.5px solid;white-space:nowrap}

/* Tracker inside card */
.ao-card-tracker-wrap{padding:0 16px 8px}
.ao-tracker{margin-bottom:0}
.ao-tracker-cancelled{display:flex;align-items:center;gap:6px;padding:7px 10px;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;font-size:11px;font-weight:700;color:#dc2626;margin-bottom:6px}
.ao-tracker-row{display:flex;align-items:center;padding:6px 4px 2px}
.ao-tr-col{display:flex;flex:1;align-items:center}
.ao-tr-col:first-child,.ao-tr-col:last-child{flex:0 0 auto}
.ao-tr-line{flex:1;height:2px;min-width:4px;transition:background .3s}
.ao-tr-node{position:relative;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .3s;z-index:1}
.ao-tr-done{background:#22c55e;color:#fff;box-shadow:0 2px 6px rgba(34,197,94,.3)}
.ao-tr-active{background:var(--ao-navy);color:#fff;box-shadow:0 2px 8px rgba(15,45,94,.3)}
.ao-tr-idle{background:#fff;border:1.5px solid var(--ao-bdr);color:var(--ao-ink4)}
.ao-tr-pulse{position:absolute;inset:-4px;border-radius:50%;border:2px solid var(--ao-navy);animation:ao-pulse 1.6s ease infinite;opacity:.3}
.ao-tracker-labels{display:flex;padding:2px 3px 4px;gap:0}
.ao-tr-lbl{flex:1;font-size:9px;font-weight:600;color:var(--ao-ink4);text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding:0 2px}
.ao-tr-lbl-done{color:#15803d;font-weight:700}
.ao-tr-lbl-active{color:var(--ao-navy);font-weight:800}

/* Card info */
.ao-card-info{padding:6px 16px;display:flex;flex-direction:column;gap:7px}
.ao-card-row{display:flex;align-items:center;gap:7px;font-size:12.5px;color:var(--ao-ink2);font-weight:500}
.ao-card-row-val{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ao-card-row-addr{align-items:flex-start}
.ao-card-row-addr-val{font-size:11.5px;color:var(--ao-ink3);line-height:1.4;flex:1}
.ao-customer-tag{font-size:9.5px;font-weight:700;background:#fdf4ff;color:#7e22ce;border:1px solid #e9d5ff;padding:1px 6px;border-radius:4px;flex-shrink:0}

/* Card footer */
.ao-card-footer{display:flex;align-items:center;justify-content:space-between;padding:10px 16px 14px;margin-top:auto;border-top:1px solid var(--ao-bdr)}
.ao-card-amount{display:flex;flex-direction:column;gap:2px}
.ao-amount-num{font-family:'Fraunces',serif;font-size:17px;font-weight:800;color:var(--ao-navy);letter-spacing:-.02em}
.ao-amount-date{font-size:10px;color:var(--ao-ink4);font-weight:500}
.ao-toggle-btn{display:flex;align-items:center;gap:5px;padding:7px 12px;border:1.5px solid var(--ao-bdr);border-radius:9px;background:var(--ao-surf2);font-family:inherit;font-size:11.5px;font-weight:700;color:var(--ao-ink3);cursor:pointer;transition:all .15s;flex-shrink:0}
.ao-toggle-btn:hover{border-color:var(--ao-teal);color:var(--ao-teal);background:var(--ao-teal-lt)}

/* Items panel */
.ao-items-panel{padding:12px 14px 14px;border-top:1.5px solid var(--ao-surf2)}
.ao-items-empty{font-size:12px;color:var(--ao-ink4);text-align:center;padding:10px}
.ao-item-row{display:flex;align-items:center;gap:10px;padding:9px 10px;background:var(--ao-surf2);border:1px solid var(--ao-bdr);border-radius:10px;margin-bottom:7px}
.ao-item-img{width:40px;height:40px;border-radius:8px;overflow:hidden;background:var(--ao-surf3);flex-shrink:0;display:flex;align-items:center;justify-content:center;color:var(--ao-ink4)}
.ao-item-img img{width:100%;height:100%;object-fit:cover}
.ao-item-info{flex:1;min-width:0}
.ao-item-name{font-size:12.5px;font-weight:700;color:var(--ao-ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-bottom:2px}
.ao-item-qty{font-size:10.5px;color:var(--ao-ink4);font-weight:500}
.ao-item-price{font-family:'Fraunces',serif;font-size:13px;font-weight:800;color:var(--ao-teal);flex-shrink:0}
.ao-items-total{display:flex;justify-content:space-between;align-items:center;padding:9px 11px;background:var(--ao-teal-lt);border:1.5px solid #a7f3d0;border-radius:9px;font-size:13px;font-weight:700;color:var(--ao-ink2)}
.ao-items-total-amt{font-family:'Fraunces',serif;font-size:16px;font-weight:800;color:var(--ao-teal)}

/* ══ WELCOME ══ */
.ao-welcome{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:380px;gap:14px;text-align:center}
.ao-welcome-visual{position:relative;width:110px;height:110px;display:flex;align-items:center;justify-content:center;margin-bottom:8px}
.ao-welcome-rings{position:absolute;inset:0}
.ao-ring{position:absolute;border-radius:50%;border:1.5px solid}
.ao-ring1{inset:0;border-color:var(--ao-teal);animation:ao-ring 3s ease-in-out infinite}
.ao-ring2{inset:15px;border-color:var(--ao-amber);animation:ao-ring 3s ease-in-out infinite;animation-delay:-.5s}
.ao-ring3{inset:30px;border-color:var(--ao-indigo);animation:ao-ring 3s ease-in-out infinite;animation-delay:-1s}
.ao-welcome-icon{width:50px;height:50px;border-radius:14px;background:linear-gradient(135deg,var(--ao-teal),#0d9488);display:flex;align-items:center;justify-content:center;color:#fff;box-shadow:0 6px 20px rgba(15,118,110,.3);position:relative;z-index:1}
.ao-welcome-title{font-family:'Fraunces',serif;font-size:22px;font-weight:800;color:var(--ao-ink)}
.ao-welcome-sub{font-size:13px;color:var(--ao-ink3);max-width:340px;line-height:1.6}

/* ══ LOADING / STATE ══ */
.ao-loading{padding:80px 20px;display:flex;flex-direction:column;align-items:center;gap:14px;color:var(--ao-ink3);font-size:13.5px;font-weight:600}
.ao-loader{width:42px;height:42px;border-radius:50%;border:3px solid var(--ao-surf3);border-top-color:var(--ao-teal);animation:ao-spin .8s linear infinite}
.ao-state{padding:80px 20px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:12px;color:var(--ao-ink4)}
.ao-state-emoji{font-size:52px;filter:grayscale(.3)}
.ao-state h3{font-family:'Fraunces',serif;font-size:20px;font-weight:700;color:var(--ao-ink2)}
.ao-state p{font-size:13.5px;color:var(--ao-ink3)}
.ao-state-err{color:var(--ao-rose)}
.ao-state-err h3{color:#991b1b}
.ao-state-btn{margin-top:4px;padding:9px 22px;border-radius:10px;border:1.5px solid var(--ao-bdr2);background:var(--ao-surf);color:var(--ao-ink2);font-family:inherit;font-size:12.5px;font-weight:700;cursor:pointer;transition:all .15s;box-shadow:var(--ao-sh)}
.ao-state-btn:hover{border-color:var(--ao-teal);color:var(--ao-teal);background:var(--ao-teal-lt)}

/* ══ FOOTER ══ */
.ao-footer{padding:12px 28px;font-size:11.5px;color:var(--ao-ink4);text-align:right;border-top:1px solid var(--ao-bdr);background:var(--ao-surf2)}

@media(max-width:640px){
  .ao-hero{padding:26px 16px 22px}
  .ao-stats{padding:14px 16px;grid-template-columns:1fr 1fr}
  .ao-rest-strip-wrap{padding:12px 16px}
  .ao-toolbar{padding:12px 16px}
  .ao-content{padding:16px 14px 50px}
  .ao-grid{grid-template-columns:1fr;gap:12px}
}
`;