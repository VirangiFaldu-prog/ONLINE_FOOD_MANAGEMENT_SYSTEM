import React, { useEffect, useState, useRef } from "react";
import {
  Truck, Store, User, Search, Clock,
  AlertCircle, Package, X, Check, RefreshCw,
  ChevronDown, MapPin, Phone, Hash, Eye,
  CheckCircle, XCircle, Bike, MoreHorizontal,
  Navigation, Timer, IndianRupee, Calendar,
} from "lucide-react";
import axiosInstance from "../../api/axiosInstance";

/* ══════════════════════════════════════════════════════════
   STATUS CONFIG — maps API status → display config
══════════════════════════════════════════════════════════ */
const STATUS_CFG = {
  Assigned:    { label: "Assigned",     color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe", step: 0, icon: Package   },
  PickedUp:    { label: "Picked Up",    color: "#d97706", bg: "#fffbeb", border: "#fde68a", step: 1, icon: Bike       },
  OnTheWay:    { label: "On the Way",   color: "#0891b2", bg: "#ecfeff", border: "#a5f3fc", step: 2, icon: Navigation },
  Delivered:   { label: "Delivered",    color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0", step: 3, icon: CheckCircle},
  Cancelled:   { label: "Cancelled",    color: "#dc2626", bg: "#fef2f2", border: "#fecaca", step: -1, icon: XCircle  },
};

const STATUSES = ["Assigned", "PickedUp", "OnTheWay", "Delivered"];
const ALL_STATUSES = [...STATUSES, "Cancelled"];

const getCfg = (s) => STATUS_CFG[s] ?? { label: s, color: "#78716c", bg: "#faf8f5", border: "#e5e0d8", step: 0, icon: Package };

/* ── Helpers ──────────────────────────────────────────── */
const fmtCurrency = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const fmtDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};
const fmtTime = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
};

/* ── Animated counter ─────────────────────────────────── */
const Counter = ({ to, duration = 900 }) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!to) return;
    let s = 0;
    const step = to / (duration / 16);
    const t = setInterval(() => {
      s += step;
      if (s >= to) { setVal(to); clearInterval(t); }
      else setVal(Math.floor(s));
    }, 16);
    return () => clearInterval(t);
  }, [to]);
  return <span>{val}</span>;
};

/* ── Toast ────────────────────────────────────────────── */
const Toast = ({ toast }) => {
  if (!toast) return null;
  return (
    <div className={`dv-toast ${toast.type === "err" ? "dv-toast-err" : "dv-toast-ok"}`}>
      {toast.type === "err" ? <AlertCircle size={13} /> : <Check size={13} />}
      {toast.msg}
    </div>
  );
};

/* ── Status Badge ─────────────────────────────────────── */
const StatusBadge = ({ status }) => {
  const cfg = getCfg(status);
  const Icon = cfg.icon;
  return (
    <span className="dv-status-badge" style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}>
      <Icon size={10} />
      {cfg.label}
    </span>
  );
};

/* ── Progress Pipeline ────────────────────────────────── */
const Pipeline = ({ status }) => {
  const cfg = getCfg(status);
  if (cfg.step < 0) return (
    <div className="dv-pipeline-cancelled">
      <XCircle size={12} /> Order Cancelled
    </div>
  );
  return (
    <div className="dv-pipeline">
      {STATUSES.map((s, i) => {
        const sCfg = getCfg(s);
        const done   = i < cfg.step;
        const active = i === cfg.step;
        const Icon   = sCfg.icon;
        return (
          <React.Fragment key={s}>
            <div className={`dv-pip-step ${done ? "dv-pip-done" : active ? "dv-pip-active" : "dv-pip-idle"}`}>
              {done ? <Check size={9} /> : <Icon size={9} />}
              {active && <span className="dv-pip-pulse" />}
            </div>
            {i < STATUSES.length - 1 && (
              <div className={`dv-pip-line ${done || active ? "dv-pip-line-done" : ""}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

/* ── Status Update Dropdown ───────────────────────────── */
const StatusDropdown = ({ deliveryId, current, onUpdate }) => {
  const [open, setOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleUpdate = async (newStatus) => {
    setUpdating(true);
    setOpen(false);
    await onUpdate(deliveryId, newStatus);
    setUpdating(false);
  };

  return (
    <div className="dv-status-dd" ref={ref}>
      <button
        className={`dv-status-dd-btn ${open ? "dv-status-dd-open" : ""}`}
        onClick={() => setOpen(v => !v)}
        disabled={updating}
      >
        {updating
          ? <span className="dv-spin" />
          : <><MoreHorizontal size={13} /><span>Update</span><ChevronDown size={10} className={`dv-chevron ${open ? "dv-chevron-up" : ""}`} /></>
        }
      </button>
      {open && (
        <div className="dv-dd-menu">
          <p className="dv-dd-hdr">Set Status</p>
          {ALL_STATUSES.map(s => {
            const cfg = getCfg(s);
            const Icon = cfg.icon;
            return (
              <button
                key={s}
                className={`dv-dd-item ${current === s ? "dv-dd-item-on" : ""}`}
                onClick={() => handleUpdate(s)}
              >
                <span className="dv-dd-ico" style={{ background: cfg.bg, color: cfg.color }}>
                  <Icon size={11} />
                </span>
                {cfg.label}
                {current === s && <Check size={10} className="dv-dd-tick" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ── Detail Drawer ────────────────────────────────────── */
const DetailDrawer = ({ delivery, onClose, onUpdateStatus }) => {
  if (!delivery) return null;
  const cfg = getCfg(delivery.deliveryStatus);
  const order = delivery.order ?? {};

  return (
    <div className="dv-drawer-bg" onClick={onClose}>
      <div className="dv-drawer" onClick={e => e.stopPropagation()}>
        <button className="dv-drawer-x" onClick={onClose}><X size={15} /></button>

        {/* Hero */}
        <div className="dv-drawer-hero" style={{ background: `linear-gradient(135deg, ${cfg.bg}, #faf8f5)` }}>
          <div className="dv-drawer-hero-dots" />
          <div className="dv-drawer-hero-icon" style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}>
            <Truck size={28} />
          </div>
          <div className="dv-drawer-hero-info">
            <h2 className="dv-drawer-title">Delivery #{delivery.deliveryID}</h2>
            <StatusBadge status={delivery.deliveryStatus} />
          </div>
          <div className="dv-drawer-hero-amount">{fmtCurrency(order.totalAmount)}</div>
        </div>

        {/* Pipeline */}
        <div className="dv-drawer-pipeline-wrap">
          <p className="dv-drawer-section-lbl">Delivery Progress</p>
          <Pipeline status={delivery.deliveryStatus} />
          <div className="dv-drawer-pipeline-labels">
            {STATUSES.map(s => <span key={s}>{getCfg(s).label}</span>)}
          </div>
        </div>

        <div className="dv-drawer-body">
          {/* Order info */}
          <div className="dv-drawer-section">
            <p className="dv-drawer-section-lbl">Order Details</p>
            <div className="dv-drawer-fields">
              <div className="dv-dfield">
                <span className="dv-dfield-lbl"><Hash size={10} /> Order ID</span>
                <span className="dv-dfield-val dv-mono">#{order.orderID || "—"}</span>
              </div>
              <div className="dv-dfield">
                <span className="dv-dfield-lbl"><IndianRupee size={10} /> Amount</span>
                <span className="dv-dfield-val dv-price">{fmtCurrency(order.totalAmount)}</span>
              </div>
              <div className="dv-dfield">
                <span className="dv-dfield-lbl"><Store size={10} /> Restaurant</span>
                <span className="dv-dfield-val">{order.restaurantName || "—"}</span>
              </div>
              <div className="dv-dfield">
                <span className="dv-dfield-lbl"><User size={10} /> Customer</span>
                <span className="dv-dfield-val">{order.userName || "—"}</span>
              </div>
              {order.deliveryAddress && (
                <div className="dv-dfield dv-dfield-full">
                  <span className="dv-dfield-lbl"><MapPin size={10} /> Address</span>
                  <span className="dv-dfield-val">{order.deliveryAddress}</span>
                </div>
              )}
              {order.phone && (
                <div className="dv-dfield">
                  <span className="dv-dfield-lbl"><Phone size={10} /> Phone</span>
                  <span className="dv-dfield-val dv-mono">{order.phone}</span>
                </div>
              )}
              {order.orderDate && (
                <div className="dv-dfield">
                  <span className="dv-dfield-lbl"><Calendar size={10} /> Date</span>
                  <span className="dv-dfield-val">{fmtDate(order.orderDate)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Driver info */}
          <div className="dv-drawer-section">
            <p className="dv-drawer-section-lbl">Driver</p>
            {delivery.deliveryUserName ? (
              <div className="dv-drawer-driver">
                <div className="dv-driver-avatar">{delivery.deliveryUserName.charAt(0).toUpperCase()}</div>
                <div>
                  <p className="dv-driver-name">{delivery.deliveryUserName}</p>
                  <p className="dv-driver-id">ID #{delivery.deliveryUserID}</p>
                </div>
              </div>
            ) : (
              <div className="dv-unassigned"><User size={14} /> Unassigned</div>
            )}
          </div>

          {/* Update status */}
          <div className="dv-drawer-section">
            <p className="dv-drawer-section-lbl">Update Status</p>
            <div className="dv-drawer-status-btns">
              {ALL_STATUSES.map(s => {
                const scfg = getCfg(s);
                const Icon = scfg.icon;
                const active = delivery.deliveryStatus === s;
                return (
                  <button
                    key={s}
                    className={`dv-status-pill-btn ${active ? "dv-status-pill-active" : ""}`}
                    style={active ? { background: scfg.bg, color: scfg.color, borderColor: scfg.border } : {}}
                    onClick={() => { onUpdateStatus(delivery.deliveryID, s); onClose(); }}
                    disabled={active}
                  >
                    <Icon size={12} />
                    {scfg.label}
                    {active && <Check size={10} />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Delivery Card ────────────────────────────────────── */
const DeliveryCard = ({ d, idx, onView, onUpdateStatus }) => {
  const [hov, setHov] = useState(false);
  const cfg = getCfg(d.deliveryStatus);
  const order = d.order ?? {};

  return (
    <div
      className={`dv-card ${hov ? "dv-card-hov" : ""}`}
      style={{ "--i": idx, "--accent": cfg.color, "--accent-bg": cfg.bg, "--accent-bdr": cfg.border }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <div className="dv-card-top-stripe" />

      {/* Header */}
      <div className="dv-card-header">
        <div className="dv-card-id-group">
          <span className="dv-card-del-id">
            <Truck size={11} /> #{d.deliveryID}
          </span>
          <span className="dv-card-ord-id">Order #{order.orderID || "—"}</span>
        </div>
        <StatusBadge status={d.deliveryStatus} />
      </div>

      {/* Pipeline */}
      <Pipeline status={d.deliveryStatus} />

      {/* Info rows */}
      <div className="dv-card-info">
        {order.restaurantName && (
          <div className="dv-card-row">
            <Store size={12} />
            <span className="dv-card-row-val">{order.restaurantName}</span>
          </div>
        )}
        {d.deliveryUserName ? (
          <div className="dv-card-row">
            <div className="dv-mini-avatar">{d.deliveryUserName.charAt(0).toUpperCase()}</div>
            <span className="dv-card-row-val">{d.deliveryUserName}</span>
            <span className="dv-driver-tag">Driver</span>
          </div>
        ) : (
          <div className="dv-card-row dv-card-row-muted">
            <User size={12} />
            <span className="dv-card-row-val">Unassigned</span>
          </div>
        )}
        {order.userName && (
          <div className="dv-card-row">
            <User size={12} />
            <span className="dv-card-row-val">{order.userName}</span>
            <span className="dv-customer-tag">Customer</span>
          </div>
        )}
        {order.deliveryAddress && (
          <div className="dv-card-row dv-card-row-addr">
            <MapPin size={12} />
            <span className="dv-card-row-addr-val">{order.deliveryAddress}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="dv-card-footer">
        <div className="dv-card-amount">
          <span className="dv-amount-num">{fmtCurrency(order.totalAmount)}</span>
          {order.orderDate && (
            <span className="dv-amount-date">{fmtDate(order.orderDate)}</span>
          )}
        </div>
        <div className="dv-card-footer-btns">
          <button className="dv-view-btn" onClick={() => onView(d)} title="View details">
            <Eye size={13} />
          </button>
          <StatusDropdown
            deliveryId={d.deliveryID}
            current={d.deliveryStatus}
            onUpdate={onUpdateStatus}
          />
        </div>
      </div>
    </div>
  );
};

/* ── Stat Card ────────────────────────────────────────── */
const StatCard = ({ label, value, icon: Icon, color, bg, border, sub, delay }) => (
  <div className="dv-stat" style={{ "--sc": color, "--sb": bg, "--sbd": border, animationDelay: delay }}>
    <div className="dv-stat-icon"><Icon size={17} /></div>
    <div>
      <div className="dv-stat-val"><Counter to={value} /></div>
      <div className="dv-stat-label">{label}</div>
      {sub && <div className="dv-stat-sub">{sub}</div>}
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════ */
export default function Deliveries() {
  const [restaurants, setRestaurants]     = useState([]);
  const [deliveries, setDeliveries]       = useState([]);
  const [activeRestaurant, setActiveRestaurant] = useState(null);
  const [search, setSearch]               = useState("");
  const [statusFilter, setStatusFilter]   = useState("All");
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState("");
  const [refreshing, setRefreshing]       = useState(false);
  const [viewTarget, setViewTarget]       = useState(null);
  const [toast, setToast]                 = useState(null);
  const [filterOpen, setFilterOpen]       = useState(false);
  const filterRef                         = useRef(null);

  useEffect(() => {
    const h = (e) => { if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => { fetchData(); }, []);

  const showToast = (msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3600);
  };

  const fetchData = async () => {
    try {
      setLoading(true); setError("");
      const [restRes, delRes] = await Promise.all([
        axiosInstance.get("/Restaurant"),
        axiosInstance.get("/Delivery"),
      ]);
      setRestaurants(restRes.data);
      setDeliveries(delRes.data);
    } catch (err) {
      setError(err.response?.data || err.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setTimeout(() => setRefreshing(false), 700);
  };

  /* ── Update delivery status — PATCH /Delivery/{id}/status?status=X ── */
  const updateStatus = async (deliveryId, newStatus) => {
    try {
      await axiosInstance.patch(`/Delivery/${deliveryId}/status?status=${newStatus}`);
      setDeliveries(prev => prev.map(d =>
        d.deliveryID === deliveryId ? { ...d, deliveryStatus: newStatus } : d
      ));
      // Also update viewTarget if it's the same delivery
      setViewTarget(prev =>
        prev?.deliveryID === deliveryId ? { ...prev, deliveryStatus: newStatus } : prev
      );
      showToast(`Delivery #${deliveryId} → ${getCfg(newStatus).label}`);
    } catch (err) {
      showToast("Update failed: " + (err.response?.data || err.message), "err");
    }
  };

  /* ── Derived stats ── */
  const allDeliveries = deliveries;
  const total      = allDeliveries.length;
  const delivered  = allDeliveries.filter(d => d.deliveryStatus === "Delivered").length;
  const onTheWay   = allDeliveries.filter(d => d.deliveryStatus === "OnTheWay").length;
  const assigned   = allDeliveries.filter(d => d.deliveryStatus === "Assigned").length;
  const pickedUp   = allDeliveries.filter(d => d.deliveryStatus === "PickedUp").length;
  const cancelled  = allDeliveries.filter(d => d.deliveryStatus === "Cancelled").length;

  /* ── Filter ── */
  const restaurantFiltered = activeRestaurant
    ? deliveries.filter(d =>
        d.order?.restaurantID === activeRestaurant.restaurantID ||
        d.order?.restaurantName === activeRestaurant.name
      )
    : deliveries;

  const filtered = restaurantFiltered.filter(d => {
    const q = search.toLowerCase();
    const mQ = !q
      || d.deliveryID?.toString().includes(q)
      || d.order?.orderID?.toString().includes(q)
      || d.deliveryUserName?.toLowerCase().includes(q)
      || d.order?.userName?.toLowerCase().includes(q)
      || d.order?.restaurantName?.toLowerCase().includes(q);
    const mS = statusFilter === "All" || d.deliveryStatus === statusFilter;
    return mQ && mS;
  });

  return (
    <>
      <style>{CSS}</style>
      <Toast toast={toast} />

      {viewTarget && (
        <DetailDrawer
          delivery={viewTarget}
          onClose={() => setViewTarget(null)}
          onUpdateStatus={updateStatus}
        />
      )}

      <div className="dv-root">

        {/* ══ HERO ══ */}
        <header className="dv-hero">
          <div className="dv-hero-blobs">
            <div className="dv-blob dv-blob1" />
            <div className="dv-blob dv-blob2" />
            <div className="dv-blob dv-blob3" />
          </div>
          <div className="dv-hero-dots" />

          <div className="dv-hero-left">
            <div className="dv-hero-eyebrow">
              <Truck size={11} /> Admin Console · Delivery Tracking
            </div>
            <h1 className="dv-hero-title">
              Delivery <em>Network</em>
            </h1>
            <p className="dv-hero-desc">
              Track <strong>{total}</strong> deliveries in real time across all restaurants
            </p>
          </div>

          <div className="dv-hero-right">
            {/* Live indicator */}
            <div className="dv-live-badge">
              <span className="dv-live-dot" />
              {onTheWay + pickedUp} Active
            </div>
            <div className="dv-hero-stat">
              <span className="dv-hero-stat-num"><Counter to={total} /></span>
              <span className="dv-hero-stat-lbl">Total</span>
            </div>
            <div className="dv-hero-stat dv-hero-stat-green">
              <span className="dv-hero-stat-num"><Counter to={delivered} /></span>
              <span className="dv-hero-stat-lbl">Done</span>
            </div>
            <button className={`dv-refresh-btn ${refreshing ? "dv-spinning" : ""}`} onClick={handleRefresh}>
              <RefreshCw size={14} />
            </button>
          </div>
        </header>

        {/* ══ STATS ══ */}
        <div className="dv-stats">
          <StatCard icon={Package}    label="Total"       value={total}     color="#4f46e5" bg="#eef2ff" border="#c7d2fe" sub="All deliveries"    delay="0ms"   />
          <StatCard icon={Bike}       label="Picked Up"   value={pickedUp}  color="#d97706" bg="#fffbeb" border="#fde68a" sub="En route to drop"  delay="60ms"  />
          <StatCard icon={Navigation} label="On the Way"  value={onTheWay}  color="#0891b2" bg="#ecfeff" border="#a5f3fc" sub="In transit now"    delay="120ms" />
          <StatCard icon={CheckCircle}label="Delivered"   value={delivered} color="#15803d" bg="#f0fdf4" border="#bbf7d0" sub="Completed"         delay="180ms" />
          <StatCard icon={XCircle}    label="Cancelled"   value={cancelled} color="#dc2626" bg="#fef2f2" border="#fecaca" sub="Cancelled orders"  delay="240ms" />
        </div>

        {/* ══ RESTAURANT FILTER STRIP ══ */}
        <div className="dv-rest-strip-wrap">
          <div className="dv-rest-strip">
            <p className="dv-rest-strip-lbl"><Store size={11} /> Filter by Restaurant</p>
            <div className="dv-rest-btns">
              <button
                className={`dv-rest-btn ${!activeRestaurant ? "dv-rest-btn-on" : ""}`}
                onClick={() => setActiveRestaurant(null)}
              >
                All
                <span className="dv-rest-count">{total}</span>
              </button>
              {restaurants.map(r => {
                const rCount = deliveries.filter(d =>
                  d.order?.restaurantID === r.restaurantID || d.order?.restaurantName === r.name
                ).length;
                const active = activeRestaurant?.restaurantID === r.restaurantID;
                return (
                  <button
                    key={r.restaurantID}
                    className={`dv-rest-btn ${active ? "dv-rest-btn-on" : ""}`}
                    onClick={() => setActiveRestaurant(active ? null : r)}
                  >
                    {r.imageUrl && (
                      <img
                        src={r.imageUrl}
                        alt={r.name}
                        className="dv-rest-img"
                        onError={e => { e.target.style.display = "none"; }}
                      />
                    )}
                    <span>{r.name}</span>
                    <span className="dv-rest-count">{rCount}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ══ TOOLBAR ══ */}
        <div className="dv-toolbar">
          {/* Search */}
          <div className="dv-search-wrap">
            <Search size={13} className="dv-search-ico" />
            <input
              className="dv-search"
              placeholder="Search by delivery ID, order, driver, customer…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && <button className="dv-search-clr" onClick={() => setSearch("")}><X size={11} /></button>}
          </div>

          {/* Status filter — z-index isolated */}
          <div className="dv-filter-wrap" ref={filterRef}>
            <button
              className={`dv-filter-btn ${filterOpen ? "dv-filter-open" : ""}`}
              onClick={() => setFilterOpen(v => !v)}
            >
              {statusFilter === "All"
                ? <><Package size={12} /><span>All Statuses</span></>
                : <>
                    <span className="dv-filter-dot" style={{ background: getCfg(statusFilter).color }} />
                    <span>{getCfg(statusFilter).label}</span>
                  </>
              }
              <ChevronDown size={11} className={`dv-chevron ${filterOpen ? "dv-chevron-up" : ""}`} />
            </button>
            {filterOpen && (
              <div className="dv-filter-menu">
                <p className="dv-filter-hdr">Filter by Status</p>
                <button
                  className={`dv-filter-item ${statusFilter === "All" ? "dv-filter-item-on" : ""}`}
                  onClick={() => { setStatusFilter("All"); setFilterOpen(false); }}
                >
                  <span className="dv-filter-ico" style={{ background: "#f5f2ed", color: "#78716c" }}>
                    <Package size={11} />
                  </span>
                  All Statuses
                  {statusFilter === "All" && <Check size={10} className="dv-dd-tick" />}
                </button>
                {ALL_STATUSES.map(s => {
                  const cfg = getCfg(s);
                  const Icon = cfg.icon;
                  const cnt = deliveries.filter(d => d.deliveryStatus === s).length;
                  return (
                    <button
                      key={s}
                      className={`dv-filter-item ${statusFilter === s ? "dv-filter-item-on" : ""}`}
                      onClick={() => { setStatusFilter(s); setFilterOpen(false); }}
                    >
                      <span className="dv-filter-ico" style={{ background: cfg.bg, color: cfg.color }}>
                        <Icon size={11} />
                      </span>
                      {cfg.label}
                      <span className="dv-filter-cnt">{cnt}</span>
                      {statusFilter === s && <Check size={10} className="dv-dd-tick" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Count */}
          {!loading && (
            <span className="dv-result-count">
              <strong>{filtered.length}</strong> / {total}
            </span>
          )}
        </div>

        {/* ══ CONTENT ══ */}
        <div className="dv-content">
          {loading ? (
            <div className="dv-loading">
              <div className="dv-loader" />
              <p>Fetching live deliveries…</p>
            </div>
          ) : error ? (
            <div className="dv-state dv-state-err">
              <AlertCircle size={36} />
              <h3>Failed to load</h3>
              <p>{error}</p>
              <button className="dv-state-btn" onClick={fetchData}>Retry</button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="dv-state">
              <span className="dv-state-emoji">🚴</span>
              <h3>No deliveries found</h3>
              <p>{search ? `Nothing matches "${search}"` : "Try a different filter."}</p>
              {(search || statusFilter !== "All") && (
                <button className="dv-state-btn" onClick={() => { setSearch(""); setStatusFilter("All"); }}>
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="dv-grid-label">
                <span>Deliveries</span>
                <span className="dv-grid-count">{filtered.length}</span>
                {activeRestaurant && (
                  <span className="dv-active-rest-pill">
                    <Store size={10} /> {activeRestaurant.name}
                    <button onClick={() => setActiveRestaurant(null)}><X size={9} /></button>
                  </span>
                )}
                {statusFilter !== "All" && (
                  <span className="dv-active-status-pill" style={{ background: getCfg(statusFilter).bg, color: getCfg(statusFilter).color, borderColor: getCfg(statusFilter).border }}>
                    {getCfg(statusFilter).label}
                    <button onClick={() => setStatusFilter("All")}><X size={9} /></button>
                  </span>
                )}
              </div>
              <div className="dv-grid">
                {filtered.map((d, i) => (
                  <DeliveryCard
                    key={d.deliveryID}
                    d={d}
                    idx={i}
                    onView={setViewTarget}
                    onUpdateStatus={updateStatus}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {!loading && filtered.length > 0 && (
          <div className="dv-footer">
            {filtered.length} delivery record{filtered.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════
   CSS
══════════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,700;0,800;0,900;1,700;1,800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

.dv-root *,.dv-root *::before,.dv-root *::after{box-sizing:border-box;margin:0;padding:0}
.dv-root{
  --bg:#faf8f5;--surf:#fff;--surf2:#f5f2ed;--surf3:#ede9e2;
  --bdr:#e5e0d8;--bdr2:#d4cfc6;
  --ink:#1c1917;--ink2:#44403c;--ink3:#78716c;--ink4:#a8a29e;
  --teal:#0f766e;--amber:#d97706;--blue:#2563eb;--cyan:#0891b2;
  --green:#15803d;--rose:#dc2626;--rose-lt:#fef2f2;--indigo:#4f46e5;
  --sh:0 1px 3px rgba(28,25,23,.05),0 4px 14px rgba(28,25,23,.07);
  --sh-h:0 6px 22px rgba(28,25,23,.11),0 22px 52px rgba(28,25,23,.1);
  font-family:'Plus Jakarta Sans',system-ui,sans-serif;
  background:var(--bg);min-height:100vh;color:var(--ink);
}

@keyframes dv-in{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes dv-card-in{from{opacity:0;transform:translateY(20px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes dv-fade{from{opacity:0}to{opacity:1}}
@keyframes dv-spin{to{transform:rotate(360deg)}}
@keyframes dv-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(1.7)}}
@keyframes dv-toast{from{opacity:0;transform:translateX(-50%) translateY(14px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
@keyframes dv-modal{from{opacity:0;transform:scale(.92) translateY(18px)}to{opacity:1;transform:scale(1) translateY(0)}}
@keyframes dv-slide{from{opacity:0;transform:translateX(34px)}to{opacity:1;transform:translateX(0)}}
@keyframes dv-blob{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(18px,-12px) scale(1.06)}}
@keyframes dv-dd{from{opacity:0;transform:translateY(-6px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}

/* TOAST */
.dv-toast{
  position:fixed;bottom:22px;left:50%;transform:translateX(-50%);z-index:9999;
  display:flex;align-items:center;gap:8px;padding:10px 20px;background:#fff;
  border-radius:50px;font-size:12.5px;font-weight:700;
  box-shadow:0 6px 28px rgba(28,25,23,.14);white-space:nowrap;
  animation:dv-toast .28s cubic-bezier(.22,1,.36,1);
}
.dv-toast-ok{border:1.5px solid #a7f3d0;color:#065f46}
.dv-toast-err{border:1.5px solid #fca5a5;color:#991b1b}

/* ══ HERO ══ */
.dv-hero{
  position:relative;padding:46px 32px 40px;overflow:hidden;
  background:linear-gradient(135deg,#fdf8f0 0%,#f0fbff 48%,#fafbff 100%);
  border-bottom:1.5px solid var(--bdr);
  display:flex;align-items:center;justify-content:space-between;gap:18px;flex-wrap:wrap;
}
.dv-hero-blobs{position:absolute;inset:0;pointer-events:none;overflow:hidden}
.dv-blob{position:absolute;border-radius:50%;filter:blur(72px);animation:dv-blob 16s ease-in-out infinite}
.dv-blob1{width:320px;height:320px;background:rgba(8,145,178,.07);top:-90px;left:-50px;animation-delay:0s}
.dv-blob2{width:250px;height:250px;background:rgba(217,119,6,.06);top:10px;right:70px;animation-delay:-5s}
.dv-blob3{width:180px;height:180px;background:rgba(21,128,61,.05);bottom:-40px;left:40%;animation-delay:-10s}
.dv-hero-dots{
  position:absolute;inset:0;pointer-events:none;
  background-image:radial-gradient(circle,rgba(28,25,23,.05) 1px,transparent 1px);
  background-size:20px 20px;
  mask-image:radial-gradient(ellipse at 68% 50%,black 0%,transparent 62%);
}
.dv-hero-left{position:relative;z-index:1}
.dv-hero-eyebrow{
  display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:700;
  color:var(--ink3);letter-spacing:.08em;text-transform:uppercase;
  background:rgba(255,255,255,.8);border:1px solid var(--bdr);
  padding:4px 12px;border-radius:50px;margin-bottom:14px;
}
.dv-hero-title{
  font-family:'Fraunces',serif;font-size:clamp(36px,5vw,60px);
  font-weight:900;color:var(--ink);line-height:.92;letter-spacing:-.025em;margin-bottom:11px;
  animation:dv-in .55s cubic-bezier(.22,1,.36,1);
}
.dv-hero-title em{
  font-style:italic;font-weight:800;
  background:linear-gradient(135deg,var(--cyan),var(--teal));
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
}
.dv-hero-desc{font-size:13.5px;color:var(--ink3);animation:dv-fade .7s .18s both}
.dv-hero-desc strong{color:var(--ink);font-weight:700}
.dv-hero-right{position:relative;z-index:1;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.dv-live-badge{
  display:inline-flex;align-items:center;gap:6px;padding:7px 14px;
  background:#ecfeff;border:1.5px solid #a5f3fc;border-radius:50px;
  font-size:12px;font-weight:700;color:#0e7490;
}
.dv-live-dot{width:7px;height:7px;border-radius:50%;background:#0891b2;animation:dv-pulse 2s ease infinite}
.dv-hero-stat{
  display:flex;flex-direction:column;align-items:center;
  background:rgba(255,255,255,.82);border:1.5px solid var(--bdr);border-radius:14px;
  padding:10px 18px;min-width:62px;backdrop-filter:blur(4px);
}
.dv-hero-stat-green{border-color:#bbf7d0;background:#f0fdf4}
.dv-hero-stat-num{font-family:'Fraunces',serif;font-size:26px;font-weight:800;color:var(--ink);line-height:1;letter-spacing:-.03em}
.dv-hero-stat-lbl{font-size:10px;font-weight:700;color:var(--ink4);text-transform:uppercase;letter-spacing:.07em;margin-top:2px}
.dv-refresh-btn{
  width:38px;height:38px;border-radius:11px;border:1.5px solid var(--bdr2);
  background:#fff;color:var(--ink3);display:flex;align-items:center;justify-content:center;
  cursor:pointer;transition:all .18s;box-shadow:var(--sh);
}
.dv-refresh-btn:hover{border-color:var(--cyan);color:var(--cyan);background:#ecfeff}
.dv-spinning svg{animation:dv-spin .7s linear infinite}

/* ══ STATS ══ */
.dv-stats{
  display:grid;grid-template-columns:repeat(auto-fill,minmax(175px,1fr));
  gap:14px;padding:20px 28px;border-bottom:1.5px solid var(--bdr);background:var(--bg);
}
.dv-stat{
  background:var(--surf);border:1.5px solid var(--sbd,var(--bdr));border-radius:16px;
  padding:16px 18px;display:flex;align-items:center;gap:12px;
  box-shadow:var(--sh);transition:all .22s;
  animation:dv-in .5s cubic-bezier(.22,1,.36,1) both;position:relative;overflow:hidden;
}
.dv-stat::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--sc);border-radius:16px 16px 0 0}
.dv-stat:hover{transform:translateY(-3px);box-shadow:var(--sh-h)}
.dv-stat-icon{width:38px;height:38px;border-radius:10px;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:var(--sb);color:var(--sc)}
.dv-stat-val{font-family:'Fraunces',serif;font-size:26px;font-weight:800;color:var(--ink);line-height:1;letter-spacing:-.03em}
.dv-stat-label{font-size:11px;font-weight:600;color:var(--ink3);margin-top:2px}
.dv-stat-sub{font-size:10px;color:var(--ink4);margin-top:2px}

/* ══ RESTAURANT STRIP ══ */
.dv-rest-strip-wrap{background:var(--surf);border-bottom:1.5px solid var(--bdr);padding:14px 28px}
.dv-rest-strip-lbl{display:flex;align-items:center;gap:5px;font-size:10.5px;font-weight:700;color:var(--ink4);text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px}
.dv-rest-btns{display:flex;gap:7px;overflow-x:auto;scrollbar-width:none;flex-wrap:wrap}
.dv-rest-btns::-webkit-scrollbar{display:none}
.dv-rest-btn{
  display:inline-flex;align-items:center;gap:6px;padding:7px 13px;
  background:var(--surf2);border:1.5px solid var(--bdr);border-radius:10px;
  font-family:inherit;font-size:12px;font-weight:600;color:var(--ink3);
  cursor:pointer;transition:all .16s;white-space:nowrap;flex-shrink:0;
}
.dv-rest-btn:hover{border-color:var(--cyan);color:var(--cyan);background:#ecfeff}
.dv-rest-btn-on{background:#ecfeff!important;border-color:#a5f3fc!important;color:#0e7490!important;font-weight:700}
.dv-rest-img{width:20px;height:20px;border-radius:5px;object-fit:cover;flex-shrink:0}
.dv-rest-count{font-size:10px;font-weight:800;background:rgba(28,25,23,.07);color:var(--ink4);padding:1px 6px;border-radius:50px}
.dv-rest-btn-on .dv-rest-count{background:rgba(8,145,178,.12);color:#0e7490}

/* ══ TOOLBAR ══ */
.dv-toolbar{
  display:flex;align-items:center;gap:10px;padding:14px 28px;
  background:var(--surf);border-bottom:1.5px solid var(--bdr);flex-wrap:wrap;
  position:sticky;top:0;z-index:500;
}
.dv-search-wrap{position:relative;flex:1;min-width:200px;max-width:380px}
.dv-search-ico{position:absolute;left:11px;top:50%;transform:translateY(-50%);color:var(--ink4);pointer-events:none}
.dv-search{
  width:100%;padding:9px 34px;background:var(--surf2);border:1.5px solid var(--bdr);
  border-radius:10px;font-family:inherit;font-size:13px;color:var(--ink);outline:none;transition:all .15s;
}
.dv-search::placeholder{color:var(--ink4)}
.dv-search:focus{border-color:var(--cyan);background:#fff;box-shadow:0 0 0 3px rgba(8,145,178,.08)}
.dv-search-clr{position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--ink4);cursor:pointer;display:flex;align-items:center}

/* Filter dropdown */
.dv-filter-wrap{position:relative;z-index:9999;flex-shrink:0}
.dv-filter-btn{
  display:flex;align-items:center;gap:6px;padding:9px 14px;
  background:var(--surf2);border:1.5px solid var(--bdr);border-radius:10px;
  font-family:inherit;font-size:12.5px;font-weight:600;color:var(--ink2);
  cursor:pointer;white-space:nowrap;transition:all .15s;
}
.dv-filter-btn:hover,.dv-filter-open{border-color:var(--cyan);color:var(--cyan);background:#ecfeff}
.dv-filter-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.dv-chevron{transition:transform .2s}
.dv-chevron-up{transform:rotate(180deg)}
.dv-filter-menu{
  position:absolute;top:calc(100% + 8px);right:0;
  background:#fff;border:1.5px solid var(--bdr);border-radius:14px;
  padding:6px;box-shadow:0 12px 40px rgba(28,25,23,.13);
  min-width:210px;animation:dv-dd .18s cubic-bezier(.22,1,.36,1);
}
.dv-filter-hdr{font-size:10px;font-weight:700;color:var(--ink4);text-transform:uppercase;letter-spacing:.09em;padding:6px 10px 5px}
.dv-filter-item{
  width:100%;display:flex;align-items:center;gap:8px;padding:9px 10px;
  border:none;background:transparent;font-family:inherit;font-size:13px;font-weight:500;
  color:var(--ink2);cursor:pointer;border-radius:8px;transition:background .12s;text-align:left;
}
.dv-filter-item:hover{background:var(--surf2);color:var(--ink)}
.dv-filter-item-on{font-weight:700}
.dv-filter-ico{width:24px;height:24px;border-radius:7px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.dv-filter-cnt{margin-left:auto;font-size:10px;font-weight:800;background:var(--surf3);color:var(--ink4);padding:1px 6px;border-radius:50px}
.dv-dd-tick{margin-left:auto;color:var(--cyan)}
.dv-result-count{font-size:12px;color:var(--ink4);font-weight:500;white-space:nowrap;margin-left:auto}
.dv-result-count strong{color:var(--ink2);font-weight:700}

/* ══ CONTENT ══ */
.dv-content{padding:24px 28px 60px;background:var(--bg)}
.dv-grid-label{
  display:flex;align-items:center;gap:8px;margin-bottom:18px;
  font-size:11px;font-weight:700;color:var(--ink4);text-transform:uppercase;letter-spacing:.1em;flex-wrap:wrap;
}
.dv-grid-count{width:22px;height:22px;border-radius:50%;background:var(--surf3);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;color:var(--ink3)}
.dv-active-rest-pill{
  display:inline-flex;align-items:center;gap:5px;padding:3px 8px 3px 9px;
  background:#ecfeff;border:1px solid #a5f3fc;border-radius:50px;color:#0e7490;font-size:10px;font-weight:700;
}
.dv-active-rest-pill button{display:flex;align-items:center;background:none;border:none;cursor:pointer;color:inherit;padding:0;margin-left:1px}
.dv-active-status-pill{
  display:inline-flex;align-items:center;gap:5px;padding:3px 8px 3px 9px;
  border:1px solid;border-radius:50px;font-size:10px;font-weight:700;
}
.dv-active-status-pill button{display:flex;align-items:center;background:none;border:none;cursor:pointer;color:inherit;padding:0;margin-left:1px}

/* ══ GRID ══ */
.dv-grid{
  display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));
  gap:16px;position:relative;z-index:0;
}

/* ══ DELIVERY CARD ══ */
.dv-card{
  background:var(--surf);border:1.5px solid var(--bdr);border-radius:18px;
  display:flex;flex-direction:column;overflow:visible;
  box-shadow:var(--sh);
  transition:transform .28s cubic-bezier(.22,1,.36,1),box-shadow .28s,border-color .28s;
  animation:dv-card-in .5s cubic-bezier(.22,1,.36,1) both;
  animation-delay:calc(var(--i,0) * 42ms);
  position:relative;
}
.dv-card-hov{transform:translateY(-5px);box-shadow:var(--sh-h);border-color:rgba(8,145,178,.28)}
.dv-card-top-stripe{
  position:absolute;top:0;left:18px;right:18px;height:3px;
  background:var(--accent,var(--cyan));border-radius:0 0 4px 4px;opacity:.7;z-index:2;
}

/* Card header */
.dv-card-header{
  display:flex;align-items:center;justify-content:space-between;
  padding:16px 16px 10px;
}
.dv-card-id-group{display:flex;flex-direction:column;gap:3px}
.dv-card-del-id{
  display:inline-flex;align-items:center;gap:4px;
  font-family:'Fraunces',serif;font-size:15px;font-weight:800;color:var(--ink);
}
.dv-card-ord-id{font-size:10.5px;color:var(--ink4);font-family:monospace}

/* Status badge */
.dv-status-badge{
  display:inline-flex;align-items:center;gap:5px;padding:4px 10px;
  border-radius:50px;font-size:10px;font-weight:700;border:1.5px solid;
  white-space:nowrap;
}

/* Pipeline */
.dv-pipeline{display:flex;align-items:center;padding:0 16px 10px;gap:0}
.dv-pip-step{
  width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;
  flex-shrink:0;position:relative;transition:all .3s;z-index:1;
}
.dv-pip-done{background:#22c55e;color:#fff;box-shadow:0 2px 7px rgba(34,197,94,.3)}
.dv-pip-active{background:var(--cyan);color:#fff;box-shadow:0 2px 9px rgba(8,145,178,.35)}
.dv-pip-idle{background:#fff;border:1.5px solid var(--bdr);color:var(--ink4)}
.dv-pip-pulse{position:absolute;inset:-4px;border-radius:50%;border:2px solid var(--cyan);animation:dv-pulse 1.8s ease infinite;opacity:.35}
.dv-pip-line{flex:1;height:2px;background:var(--bdr);transition:background .3s;min-width:6px}
.dv-pip-line-done{background:#22c55e}
.dv-pipeline-cancelled{
  margin:0 16px 10px;display:flex;align-items:center;gap:6px;
  padding:7px 11px;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;
  font-size:11px;font-weight:700;color:#991b1b;
}

/* Card info */
.dv-card-info{padding:8px 16px;display:flex;flex-direction:column;gap:7px}
.dv-card-row{display:flex;align-items:center;gap:7px;font-size:12.5px;color:var(--ink2);font-weight:500}
.dv-card-row-muted{color:var(--ink4);font-style:italic}
.dv-card-row-val{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dv-card-row-addr{align-items:flex-start}
.dv-card-row-addr-val{font-size:11.5px;color:var(--ink3);line-height:1.4;flex:1}
.dv-mini-avatar{
  width:22px;height:22px;border-radius:7px;flex-shrink:0;
  background:#e0f2fe;color:#0369a1;display:flex;align-items:center;justify-content:center;
  font-size:10px;font-weight:800;font-family:'Fraunces',serif;
}
.dv-driver-tag{font-size:9.5px;font-weight:700;background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;padding:1px 6px;border-radius:4px}
.dv-customer-tag{font-size:9.5px;font-weight:700;background:#fdf4ff;color:#7e22ce;border:1px solid #e9d5ff;padding:1px 6px;border-radius:4px}

/* Card footer */
.dv-card-footer{
  display:flex;align-items:center;justify-content:space-between;
  padding:10px 16px 14px;margin-top:auto;
  border-top:1px solid var(--bdr);
}
.dv-card-amount{display:flex;flex-direction:column;gap:2px}
.dv-amount-num{font-family:'Fraunces',serif;font-size:17px;font-weight:800;color:var(--ink);letter-spacing:-.02em}
.dv-amount-date{font-size:10px;color:var(--ink4);font-weight:500}
.dv-card-footer-btns{display:flex;align-items:center;gap:6px}
.dv-view-btn{
  width:32px;height:32px;border-radius:9px;border:1.5px solid var(--bdr);
  background:var(--surf);color:var(--ink3);display:flex;align-items:center;justify-content:center;
  cursor:pointer;transition:all .15s;flex-shrink:0;
}
.dv-view-btn:hover{border-color:var(--cyan);color:var(--cyan);background:#ecfeff}

/* Status update dropdown on card */
.dv-status-dd{position:relative;z-index:200}
.dv-status-dd-btn{
  display:flex;align-items:center;gap:5px;padding:7px 11px;
  background:var(--surf2);border:1.5px solid var(--bdr);border-radius:9px;
  font-family:inherit;font-size:11.5px;font-weight:700;color:var(--ink2);
  cursor:pointer;white-space:nowrap;transition:all .15s;
}
.dv-status-dd-btn:hover,.dv-status-dd-open{border-color:var(--cyan);color:var(--cyan);background:#ecfeff}
.dv-status-dd-btn:disabled{opacity:.55;cursor:not-allowed}
.dv-dd-menu{
  position:absolute;bottom:calc(100% + 8px);right:0;
  background:#fff;border:1.5px solid var(--bdr);border-radius:14px;
  padding:6px;box-shadow:0 12px 40px rgba(28,25,23,.15);
  min-width:195px;animation:dv-dd .18s cubic-bezier(.22,1,.36,1);z-index:9999;
}
.dv-dd-hdr{font-size:10px;font-weight:700;color:var(--ink4);text-transform:uppercase;letter-spacing:.09em;padding:6px 10px 5px}
.dv-dd-item{
  width:100%;display:flex;align-items:center;gap:8px;padding:8px 10px;
  border:none;background:transparent;font-family:inherit;font-size:12.5px;font-weight:500;
  color:var(--ink2);cursor:pointer;border-radius:8px;transition:background .12s;text-align:left;
}
.dv-dd-item:hover{background:var(--surf2);color:var(--ink)}
.dv-dd-item-on{font-weight:700;background:var(--surf2)}
.dv-dd-ico{width:24px;height:24px;border-radius:7px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.dv-dd-tick{margin-left:auto;color:var(--cyan)}

/* ══ LOADING / STATE ══ */
.dv-loading{padding:80px 20px;display:flex;flex-direction:column;align-items:center;gap:14px;color:var(--ink3);font-size:13.5px;font-weight:600}
.dv-loader{width:42px;height:42px;border-radius:50%;border:3px solid var(--surf3);border-top-color:var(--cyan);animation:dv-spin .8s linear infinite}
.dv-state{padding:80px 20px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:12px;color:var(--ink4)}
.dv-state-emoji{font-size:52px;filter:grayscale(.3)}
.dv-state h3{font-family:'Fraunces',serif;font-size:20px;font-weight:700;color:var(--ink2)}
.dv-state p{font-size:13.5px;color:var(--ink3)}
.dv-state-err{color:var(--rose)}
.dv-state-err h3{color:#991b1b}
.dv-state-btn{margin-top:4px;padding:9px 22px;border-radius:10px;border:1.5px solid var(--bdr2);background:var(--surf);color:var(--ink2);font-family:inherit;font-size:12.5px;font-weight:700;cursor:pointer;transition:all .15s;box-shadow:var(--sh)}
.dv-state-btn:hover{border-color:var(--cyan);color:var(--cyan);background:#ecfeff}

/* ══ FOOTER ══ */
.dv-footer{padding:12px 28px;font-size:11.5px;color:var(--ink4);text-align:right;border-top:1px solid var(--bdr);background:var(--surf2)}

/* ══ DETAIL DRAWER ══ */
.dv-drawer-bg{position:fixed;inset:0;z-index:800;background:rgba(28,25,23,.42);backdrop-filter:blur(7px);display:flex;justify-content:flex-end}
.dv-drawer{
  width:100%;max-width:480px;height:100%;background:#fff;
  box-shadow:-10px 0 52px rgba(28,25,23,.14);overflow-y:auto;
  animation:dv-slide .3s cubic-bezier(.22,1,.36,1);
  border-left:1.5px solid var(--bdr);display:flex;flex-direction:column;
}
.dv-drawer-x{position:absolute;top:14px;right:14px;width:32px;height:32px;border-radius:50%;border:1.5px solid var(--bdr2);background:#fff;color:var(--ink3);display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:10;transition:all .15s}
.dv-drawer-x:hover{background:var(--rose-lt);color:var(--rose);border-color:#fca5a5}
.dv-drawer-hero{
  position:relative;padding:28px 22px 22px;border-bottom:1.5px solid var(--bdr);
  display:flex;flex-direction:column;align-items:flex-start;gap:14px;
}
.dv-drawer-hero-dots{
  position:absolute;inset:0;pointer-events:none;
  background-image:radial-gradient(circle,rgba(28,25,23,.04) 1px,transparent 1px);
  background-size:16px 16px;
}
.dv-drawer-hero-icon{
  width:56px;height:56px;border-radius:16px;border:1.5px solid;
  display:flex;align-items:center;justify-content:center;
  position:relative;z-index:1;box-shadow:0 4px 12px rgba(28,25,23,.08);
}
.dv-drawer-hero-info{position:relative;z-index:1;display:flex;flex-direction:column;gap:8px}
.dv-drawer-title{font-family:'Fraunces',serif;font-size:24px;font-weight:800;color:var(--ink);line-height:1.1}
.dv-drawer-hero-amount{
  font-family:'Fraunces',serif;font-size:22px;font-weight:800;color:var(--teal);
  position:absolute;top:28px;right:54px;z-index:1;
}
.dv-drawer-pipeline-wrap{padding:18px 22px;border-bottom:1.5px solid var(--bdr);background:var(--surf2)}
.dv-drawer-section-lbl{font-size:10px;font-weight:700;color:var(--ink4);text-transform:uppercase;letter-spacing:.09em;margin-bottom:10px;display:block}
.dv-drawer-pipeline-labels{display:flex;padding:4px 3px 0;gap:0}
.dv-drawer-pipeline-labels span{flex:1;font-size:9px;font-weight:600;color:var(--ink4);text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dv-drawer-body{padding:20px 22px 40px;flex:1;display:flex;flex-direction:column;gap:18px}
.dv-drawer-section{display:flex;flex-direction:column;gap:0}
.dv-drawer-fields{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:0}
.dv-dfield{background:var(--surf2);border:1.5px solid var(--bdr);border-radius:11px;padding:11px}
.dv-dfield-full{grid-column:1/-1}
.dv-dfield-lbl{display:flex;align-items:center;gap:5px;font-size:10px;font-weight:700;color:var(--ink4);text-transform:uppercase;letter-spacing:.07em;margin-bottom:4px}
.dv-dfield-val{font-size:13.5px;font-weight:600;color:var(--ink);word-break:break-word;line-height:1.4}
.dv-price{font-family:'Fraunces',serif;font-size:18px;font-weight:800;color:var(--teal)}
.dv-mono{font-family:monospace;font-size:13px}
.dv-drawer-driver{display:flex;align-items:center;gap:12px;background:var(--surf2);border:1.5px solid var(--bdr);border-radius:12px;padding:13px;margin-top:0}
.dv-driver-avatar{width:40px;height:40px;border-radius:12px;background:#e0f2fe;color:#0369a1;display:flex;align-items:center;justify-content:center;font-family:'Fraunces',serif;font-size:17px;font-weight:800;flex-shrink:0}
.dv-driver-name{font-size:14px;font-weight:700;color:var(--ink)}
.dv-driver-id{font-size:11px;color:var(--ink4);font-family:monospace;margin-top:2px}
.dv-unassigned{display:flex;align-items:center;gap:8px;padding:12px;background:var(--surf2);border:1.5px dashed var(--bdr2);border-radius:11px;font-size:13px;color:var(--ink4);font-style:italic}
.dv-drawer-status-btns{display:flex;flex-direction:column;gap:7px;margin-top:0}
.dv-status-pill-btn{
  width:100%;padding:11px 14px;border-radius:11px;font-family:inherit;font-size:13px;font-weight:700;
  cursor:pointer;display:flex;align-items:center;gap:8px;
  transition:all .18s;border:1.5px solid var(--bdr2);background:var(--surf2);color:var(--ink2);
}
.dv-status-pill-btn:hover{background:var(--surf3);color:var(--ink)}
.dv-status-pill-btn:disabled{opacity:.55;cursor:default}
.dv-status-pill-active{font-weight:800!important}
.dv-status-pill-active::after{content:'✓';margin-left:auto;font-size:12px}

/* Spinners */
.dv-spin{width:12px;height:12px;border-radius:50%;border:2px solid rgba(28,25,23,.15);border-top-color:var(--ink2);animation:dv-spin .7s linear infinite;display:inline-block;flex-shrink:0}

@media(max-width:640px){
  .dv-hero{padding:26px 16px 22px}
  .dv-stats{padding:14px 16px;grid-template-columns:1fr 1fr}
  .dv-rest-strip-wrap{padding:12px 16px}
  .dv-toolbar{padding:12px 16px}
  .dv-content{padding:16px 14px 50px}
  .dv-grid{grid-template-columns:1fr;gap:12px}
  .dv-drawer{max-width:100%}
  .dv-drawer-fields{grid-template-columns:1fr}
  .dv-drawer-hero-amount{position:static;margin-top:4px}
}
`;