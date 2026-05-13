import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Package, MapPin, Store, User, Clock,
  RefreshCw, ArrowRight, CheckCircle,
  Truck, Phone, Navigation, AlertCircle, Bike,
} from "lucide-react";
import { fetchDeliveries, getDeliveryUserId, updateDeliveryStatus } from "./deliveryApi";

/* ══════════════════════════════════════════════════════════
   DELIVERY STATUS CONFIG
   Exact strings your DeliveryController uses / sets:
   "Assigned" → "PickedUp" → "OnTheWay" → "Delivered"
   (DeliveryController also sets order.OrderStatus = "Delivered"
    when delivery status = "Delivered")
══════════════════════════════════════════════════════════ */
const DELIVERY_STATUS = {
  Assigned:  { label:"Assigned",   color:"#f59e0b", bg:"#fffbeb", border:"#fde68a", dot:"#f59e0b" },
  PickedUp:  { label:"Picked Up",  color:"#6366f1", bg:"#eef2ff", border:"#c7d2fe", dot:"#6366f1" },
  OnTheWay:  { label:"On The Way", color:"#0ea5e9", bg:"#f0f9ff", border:"#bae6fd", dot:"#0ea5e9" },
  Delivered: { label:"Delivered",  color:"#10b981", bg:"#ecfdf5", border:"#a7f3d0", dot:"#10b981" },
  Cancelled: { label:"Cancelled",  color:"#ef4444", bg:"#fef2f2", border:"#fecaca", dot:"#ef4444" },
};
const getStatus = (s) =>
  DELIVERY_STATUS[s] || { label: s, color:"#6b7280", bg:"#f9fafb", border:"#e5e7eb", dot:"#6b7280" };

/* ══════════════════════════════════════════════════════════
   NEXT ACTIONS — delivery person advances their own status
   The final "Delivered" action also updates the Order status
   to "Delivered" on the backend (your UpdateDeliveryStatus does this)
══════════════════════════════════════════════════════════ */
const NEXT_ACTIONS = {
  Assigned: [{ label:"Mark Picked Up", value:"PickedUp",  cls:"action-pickup"  }],
  PickedUp: [{ label:"On The Way",     value:"OnTheWay",  cls:"action-onway"   }],
  OnTheWay: [{ label:"Mark Delivered", value:"Delivered", cls:"action-deliver" }],
  // Delivered and Cancelled are terminal — no next actions
};

/* ── Delivery progress tracker (3 steps) ── */
const TRACK = [
  { key:"Assigned",  icon:<Package size={14}/>,   label:"Picked Up"   },
  { key:"PickedUp",  icon:<Bike size={14}/>,       label:"On the Way"  },
  { key:"OnTheWay",  icon:<Truck size={14}/>,      label:"At Door"     },
  { key:"Delivered", icon:<CheckCircle size={14}/>,label:"Delivered"   },
];
const TRACK_ORDER = ["Assigned","PickedUp","OnTheWay","Delivered"];

const DeliveryTracker = ({ status }) => {
  const curIdx = TRACK_ORDER.indexOf(status);
  if (curIdx < 0 || status === "Cancelled") return null;
  return (
    <div className="dt-wrap">
      {TRACK.map((step, i) => {
        const stepIdx = TRACK_ORDER.indexOf(step.key);
        const done    = stepIdx < curIdx;
        const active  = stepIdx === curIdx;
        const isLast  = i === TRACK.length - 1;
        return (
          <div key={step.key} className="dt-col">
            <div className="dt-node-row">
              {i > 0 && <div className={`dt-conn ${stepIdx <= curIdx ? "dt-conn-on" : ""}`}/>}
              <div className={`dt-node ${done ? "dt-done" : active ? "dt-active" : "dt-idle"}`}>
                {done ? <CheckCircle size={13}/> : step.icon}
                {active && <span className="dt-pulse"/>}
              </div>
              {!isLast && <div className={`dt-conn ${done ? "dt-conn-on" : ""}`}/>}
            </div>
            <span className={`dt-lbl ${done ? "dt-lbl-done" : active ? "dt-lbl-active" : ""}`}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   CSS
══════════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --or:#ea580c;--or2:#c2410c;--or-pale:#fff7ed;--or-mid:#fed7aa;
  --ink:#1c0a00;--ink2:#6b3f1e;--ink3:#a8703a;
  --bg:#fef9f5;--surf:#fff;--bdr:#fde8cc;--bdr2:#fef3e6;
  --sh:0 2px 14px rgba(234,88,12,.07);--sh-h:0 8px 28px rgba(234,88,12,.13);
  font-family:'Plus Jakarta Sans',sans-serif;
}
html,body{background:var(--bg);color:var(--ink);min-height:100vh}
@keyframes dd-in  {from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes dd-spin{to{transform:rotate(360deg)}}
@keyframes sweep  {0%{transform:translateX(-300%)}100%{transform:translateX(500%)}}
@keyframes ping   {0%{transform:scale(1);opacity:1}75%,100%{transform:scale(2.2);opacity:0}}
@keyframes pulse  {0%,100%{transform:scale(1);opacity:.8}50%{transform:scale(1.7);opacity:0}}

/* Splash */
.dd-splash{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;background:var(--bg)}
.dd-ring{width:58px;height:58px;border-radius:50%;border:4px solid var(--or-mid);border-top-color:var(--or);animation:dd-spin .9s linear infinite}
.dd-splash-txt{font-size:14px;font-weight:700;color:var(--ink2)}
.dd-prog{width:180px;height:4px;background:var(--or-mid);border-radius:4px;overflow:hidden}
.dd-prog-bar{height:100%;width:38%;background:var(--or);border-radius:4px;animation:sweep 1.3s ease-in-out infinite}

/* Header */
.dd-header{background:var(--surf);border-bottom:2px solid var(--or-mid);padding:18px 36px;display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;position:sticky;top:0;z-index:50;box-shadow:var(--sh)}
.dd-header-tag{font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--or)}
.dd-header-title{font-size:24px;font-weight:800;color:var(--ink);letter-spacing:-.3px;margin-top:2px}
.dd-header-right{display:flex;align-items:center;gap:10px}

.dd-live-badge{display:flex;align-items:center;gap:7px;padding:7px 14px;border-radius:100px;background:var(--or-pale);border:1.5px solid var(--or-mid)}
.dd-live-wrap{position:relative;width:10px;height:10px}
.dd-live-dot{width:10px;height:10px;border-radius:50%;background:#22c55e;display:block}
.dd-live-ping{position:absolute;inset:0;border-radius:50%;background:#22c55e;animation:ping 1.8s ease-out infinite}
.dd-live-txt{font-size:12px;font-weight:700;color:var(--or)}

.dd-refresh-btn{display:flex;align-items:center;gap:6px;padding:9px 16px;border-radius:11px;border:1.5px solid var(--bdr);background:var(--surf);color:var(--ink2);font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;transition:all .18s}
.dd-refresh-btn:hover{border-color:var(--or);color:var(--or);background:var(--or-pale)}
.dd-spin{animation:dd-spin .7s linear infinite}

/* Body */
.dd-body{padding:24px 36px;max-width:1100px;margin:0 auto;display:flex;flex-direction:column;gap:18px}

/* Stats */
.dd-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
.dd-stat{background:var(--surf);border-radius:14px;border:1.5px solid var(--bdr);padding:16px 18px;box-shadow:var(--sh);animation:dd-in .4s cubic-bezier(.22,1,.36,1) both;transition:transform .18s}
.dd-stat:hover{transform:translateY(-2px)}
.dd-stat-lbl{font-size:10px;font-weight:700;color:var(--ink3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:5px}
.dd-stat-val{font-size:26px;font-weight:800;color:var(--ink);line-height:1}

/* Error */
.dd-error{display:flex;align-items:center;gap:8px;padding:12px 16px;border-radius:12px;background:#fef2f2;border:1.5px solid #fecaca;font-size:13px;font-weight:600;color:#b91c1c}

/* Empty */
.dd-empty{text-align:center;padding:64px 24px;background:var(--surf);border-radius:18px;border:1.5px solid var(--bdr);box-shadow:var(--sh)}

/* Grid */
.dd-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(400px,1fr));gap:16px}

/* Card */
.dd-card{background:var(--surf);border-radius:18px;border:1.5px solid var(--bdr);overflow:hidden;box-shadow:var(--sh);animation:dd-in .4s cubic-bezier(.22,1,.36,1) both;transition:box-shadow .22s,border-color .22s}
.dd-card:hover{border-color:var(--or-mid);box-shadow:var(--sh-h)}
.dd-accent{height:4px}
.dd-card-body{padding:18px 20px}

/* Card top */
.dd-card-top{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:14px}
.dd-card-id-wrap{display:flex;align-items:center;gap:10px}
.dd-card-icon{width:42px;height:42px;border-radius:12px;background:linear-gradient(135deg,var(--or),#f97316);display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 4px 12px rgba(234,88,12,.28)}
.dd-card-id{font-size:17px;font-weight:800;color:var(--ink)}
.dd-card-order-id{font-size:11px;font-weight:600;color:var(--ink3);margin-top:2px}
.dd-pill{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:100px;font-size:11px;font-weight:700;border:1.5px solid;margin-top:5px}
.dd-view-btn{display:inline-flex;align-items:center;gap:5px;padding:8px 14px;border-radius:10px;background:var(--or-pale);border:1.5px solid var(--or-mid);color:var(--or);font-size:12px;font-weight:700;text-decoration:none;transition:all .15s;white-space:nowrap}
.dd-view-btn:hover{background:var(--or);color:#fff;border-color:var(--or)}

/* Divider */
.dd-div{height:1px;background:var(--bdr);margin:12px 0}

/* Info section */
.dd-info{display:flex;flex-direction:column;gap:9px;padding:12px 14px;border-radius:12px;background:var(--bg);border:1.5px solid var(--bdr);margin-bottom:14px}
.dd-info-row{display:flex;align-items:flex-start;gap:9px}
.dd-info-ico{width:30px;height:30px;border-radius:8px;background:var(--or-pale);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.dd-info-lbl{font-size:9px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--ink3);margin-bottom:1px}
.dd-info-val{font-size:13px;font-weight:700;color:var(--ink);word-break:break-word}
.dd-phone-val{font-size:15px;font-weight:800;color:var(--or);letter-spacing:.04em}
.dd-no-data{font-size:12px;font-weight:600;color:#9ca3af}

/* Action buttons */
.dd-actions{display:flex;gap:8px;flex-wrap:wrap}
.dd-btn{padding:10px 18px;border-radius:10px;font-size:13px;font-weight:800;cursor:pointer;border:none;transition:all .18s;font-family:inherit;display:inline-flex;align-items:center;gap:6px}
.dd-btn:disabled{opacity:.45;cursor:not-allowed;transform:none!important}
.action-pickup {background:#6366f1;color:#fff}
.action-pickup:hover:not(:disabled){background:#4f46e5;transform:translateY(-1px)}
.action-onway  {background:#0ea5e9;color:#fff}
.action-onway:hover:not(:disabled){background:#0284c7;transform:translateY(-1px)}
.action-deliver{background:#10b981;color:#fff}
.action-deliver:hover:not(:disabled){background:#059669;transform:translateY(-1px)}

/* Delivery tracker */
.dt-wrap{padding:11px 12px;background:var(--bg);border-radius:11px;border:1.5px solid var(--bdr);margin-bottom:12px;overflow-x:auto}
.dt-col{display:flex;flex-direction:column;align-items:center;gap:4px;flex:1;min-width:52px}
.dt-node-row{display:flex;align-items:center;width:100%}
.dt-conn{flex:1;height:2px;background:var(--bdr);transition:background .3s}
.dt-conn-on{background:linear-gradient(90deg,#22c55e,var(--or))}
.dt-node{position:relative;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .3s}
.dt-done  {background:#22c55e;color:#fff;box-shadow:0 2px 8px rgba(34,197,94,.3)}
.dt-active{background:var(--or);color:#fff;box-shadow:0 3px 10px rgba(234,88,12,.3)}
.dt-idle  {background:#fff;border:1.5px solid var(--bdr);color:var(--ink3)}
.dt-pulse {position:absolute;inset:-4px;border-radius:50%;border:2px solid var(--or);animation:pulse 1.6s ease infinite;opacity:.35}
.dt-lbl{font-size:9px;font-weight:600;color:var(--ink3);text-align:center;white-space:nowrap}
.dt-lbl-done  {color:#16a34a;font-weight:700}
.dt-lbl-active{color:var(--or);font-weight:800}

/* Delivered badge */
.dd-delivered-note{display:flex;align-items:center;gap:7px;padding:10px 13px;border-radius:10px;background:#ecfdf5;border:1.5px solid #a7f3d0;font-size:12px;font-weight:700;color:#065f46;margin-bottom:12px}

@media(max-width:860px){
  .dd-grid{grid-template-columns:1fr}
  .dd-body{padding:18px 14px}
  .dd-header{padding:14px 18px}
  .dd-stats{grid-template-columns:repeat(3,1fr)}
}
@media(max-width:480px){
  .dd-stats{grid-template-columns:1fr 1fr}
}
`;

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════ */
const DeliveryDeliveries = () => {
  const [deliveries,  setDeliveries]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [updatingId,  setUpdatingId]  = useState(null);
  const [refreshing,  setRefreshing]  = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const deliveryUserId = getDeliveryUserId();

  const load = async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    setError("");
    try {
      const data = await fetchDeliveries();
      setDeliveries(data);
      setLastUpdated(new Date());
    } catch (e) {
      setError(e.message || "Failed to load deliveries");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(() => load(true), 15000);
    return () => clearInterval(interval);
  }, []);

  /* Active deliveries for this user (not yet delivered/cancelled) */
  const myActive = useMemo(() =>
    deliveries
      .filter(d =>
        (d.deliveryUserID === deliveryUserId || d.deliveryUser?.userID === deliveryUserId) &&
        !["Delivered","Cancelled"].includes(d.deliveryStatus)
      )
      .sort((a, b) => (b.deliveryID || 0) - (a.deliveryID || 0)),
    [deliveries, deliveryUserId]
  );

  const allMine = useMemo(() =>
    deliveries.filter(d =>
      d.deliveryUserID === deliveryUserId || d.deliveryUser?.userID === deliveryUserId
    ),
    [deliveries, deliveryUserId]
  );

  const handleUpdate = async (deliveryId, newStatus) => {
    setUpdatingId(deliveryId);
    try {
      await updateDeliveryStatus(deliveryId, newStatus);
      await load(true);
    } catch (e) {
      alert(e.message || "Failed to update");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return (
    <>
      <style>{CSS}</style>
      <div className="dd-splash">
        <div className="dd-ring"/>
        <p className="dd-splash-txt">Loading deliveries…</p>
        <div className="dd-prog"><div className="dd-prog-bar"/></div>
      </div>
    </>
  );

  const stats = {
    Active:    myActive.length,
    Delivered: allMine.filter(d => d.deliveryStatus === "Delivered").length,
    Total:     allMine.length,
  };

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)" }}>
      <style>{CSS}</style>

      {/* Header */}
      <header className="dd-header">
        <div>
          <p className="dd-header-tag">Delivery Dashboard</p>
          <h1 className="dd-header-title">My Deliveries</h1>
        </div>
        <div className="dd-header-right">
          <div className="dd-live-badge">
            <div className="dd-live-wrap">
              <span className="dd-live-ping"/>
              <span className="dd-live-dot"/>
            </div>
            <span className="dd-live-txt">
              Live · {lastUpdated ? lastUpdated.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" }) : "–"}
            </span>
          </div>
          <button className="dd-refresh-btn" onClick={() => load(true)} disabled={refreshing}>
            <RefreshCw size={14} className={refreshing ? "dd-spin" : ""}/> Refresh
          </button>
        </div>
      </header>

      <div className="dd-body">

        {/* Stats */}
        <div className="dd-stats">
          {Object.entries(stats).map(([key, val], i) => (
            <div key={key} className="dd-stat" style={{
              animationDelay: `${i * 60}ms`,
              borderTopColor: val > 0 ? "var(--or)" : "var(--bdr)",
              borderTopWidth: val > 0 ? 3 : 1.5,
            }}>
              <p className="dd-stat-lbl">{key}</p>
              <p className="dd-stat-val" style={{ color: val > 0 ? "var(--or)" : "var(--ink3)" }}>{val}</p>
            </div>
          ))}
        </div>

        {/* Error */}
        {error && <div className="dd-error"><AlertCircle size={16} style={{ flexShrink:0 }}/> {error}</div>}

        {/* Empty */}
        {myActive.length === 0 ? (
          <div className="dd-empty">
            <div style={{ fontSize:48, marginBottom:12 }}>🛵</div>
            <p style={{ fontSize:18, fontWeight:800, color:"var(--ink)", marginBottom:6 }}>No active deliveries</p>
            <p style={{ fontSize:13, fontWeight:600, color:"var(--ink3)" }}>
              Assigned deliveries appear here. Auto-refreshing every 15s.
            </p>
          </div>
        ) : (
          <div className="dd-grid">
            {myActive.map((d, idx) => {
              const st      = getStatus(d.deliveryStatus);
              const actions = NEXT_ACTIONS[d.deliveryStatus] || [];
              const isBusy  = updatingId === d.deliveryID;

              const address = d.order?.deliveryAddress || d.deliveryAddress;
              const phone   = d.order?.phone || d.order?.contactPhone;
              const custName = d.order?.user?.userName || d.order?.userName;
              const restName = d.order?.restaurant?.name || d.order?.restaurantName;

              return (
                <div key={d.deliveryID} className="dd-card" style={{ animationDelay:`${idx * 50}ms` }}>
                  <div className="dd-accent" style={{ background: st.color }}/>

                  <div className="dd-card-body">

                    {/* Top row */}
                    <div className="dd-card-top">
                      <div className="dd-card-id-wrap">
                        <div className="dd-card-icon">
                          <Truck size={20} color="#fff"/>
                        </div>
                        <div>
                          <p className="dd-card-id">Delivery #{d.deliveryID}</p>
                          {d.order?.orderID && <p className="dd-card-order-id">Order #{d.order.orderID}</p>}
                          <span className="dd-pill" style={{ color:st.color, background:st.bg, borderColor:st.border }}>
                            <span style={{ width:6, height:6, borderRadius:"50%", background:st.dot, display:"inline-block" }}/>
                            {st.label}
                          </span>
                        </div>
                      </div>
                      <Link to={`/delivery/deliveries/${d.deliveryID}`} className="dd-view-btn">
                        Details <ArrowRight size={14}/>
                      </Link>
                    </div>

                    {/* Tracker */}
                    <DeliveryTracker status={d.deliveryStatus}/>

                    {/* Info */}
                    <div className="dd-info">
                      {restName && (
                        <div className="dd-info-row">
                          <div className="dd-info-ico"><Store size={14} style={{ color:"var(--or)" }}/></div>
                          <div><p className="dd-info-lbl">Pick up from</p><p className="dd-info-val">{restName}</p></div>
                        </div>
                      )}
                      {custName && (
                        <div className="dd-info-row">
                          <div className="dd-info-ico"><User size={14} style={{ color:"var(--or)" }}/></div>
                          <div><p className="dd-info-lbl">Deliver to</p><p className="dd-info-val">{custName}</p></div>
                        </div>
                      )}
                      <div className="dd-info-row">
                        <div className="dd-info-ico"><Phone size={14} style={{ color: phone ? "var(--or)" : "#d1d5db" }}/></div>
                        <div>
                          <p className="dd-info-lbl">Customer Phone</p>
                          {phone
                            ? <p className="dd-phone-val">{phone}</p>
                            : <p className="dd-no-data">Not provided</p>}
                        </div>
                      </div>
                      <div className="dd-info-row">
                        <div className="dd-info-ico"><MapPin size={14} style={{ color: address ? "var(--or)" : "#d1d5db" }}/></div>
                        <div>
                          <p className="dd-info-lbl">Delivery Address</p>
                          {address
                            ? <p className="dd-info-val">{address}</p>
                            : <p className="dd-no-data">No address provided</p>}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    {actions.length > 0 && (
                      <div className="dd-actions">
                        {actions.map(a => (
                          <button key={a.value}
                            className={`dd-btn ${a.cls}`}
                            disabled={isBusy}
                            onClick={() => handleUpdate(d.deliveryID, a.value)}>
                            {a.value === "PickedUp"  && <Package size={14}/>}
                            {a.value === "OnTheWay"  && <Navigation size={14}/>}
                            {a.value === "Delivered" && <CheckCircle size={14}/>}
                            {isBusy ? "Updating…" : a.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default DeliveryDeliveries;