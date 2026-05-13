import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Store, User, MapPin, Phone,
  Clock, Package, ExternalLink, CheckCircle,
  RefreshCw, Navigation, Truck, AlertCircle,
} from "lucide-react";
import { fetchDeliveries, getDeliveryUserId, updateDeliveryStatus } from "./deliveryApi";

const STATUS_CONFIG = {
  Assigned:  { color:"#f59e0b", bg:"#fffbeb", border:"#fde68a", label:"Assigned"   },
  PickedUp:  { color:"#6366f1", bg:"#eef2ff", border:"#c7d2fe", label:"Picked Up"  },
  OnTheWay:  { color:"#0ea5e9", bg:"#f0f9ff", border:"#bae6fd", label:"On The Way" },
  Delivered: { color:"#10b981", bg:"#ecfdf5", border:"#a7f3d0", label:"Delivered"  },
  Cancelled: { color:"#ef4444", bg:"#fef2f2", border:"#fecaca", label:"Cancelled"  },
};
const getStatus = (s) => STATUS_CONFIG[s] || { color:"#6b7280", bg:"#f9fafb", border:"#e5e7eb", label:s };

/* Status step progress */
const STEPS = ["Assigned","PickedUp","OnTheWay","Delivered"];
const STEP_LABELS = { Assigned:"Assigned", PickedUp:"Picked Up", OnTheWay:"On The Way", Delivered:"Delivered" };

const css = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

:root{
  --orange:#ea580c;--orange-h:#c2410c;--orange-pale:#fff7ed;--orange-mid:#fed7aa;
  --text:#1c0a00;--text2:#6b3f1e;--text3:#a8703a;
  --border:#fde8cc;--bg:#fef9f5;--white:#ffffff;
  --sh:0 2px 16px rgba(234,88,12,0.08);--sh-md:0 8px 32px rgba(234,88,12,0.15);
}

@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes sweep{0%{transform:translateX(-300%)}100%{transform:translateX(500%)}}
@keyframes ping{0%{transform:scale(1);opacity:1}75%,100%{transform:scale(2.2);opacity:0}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}

/* Splash */
.dd-splash{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;background:var(--bg);font-family:'Plus Jakarta Sans',sans-serif}
.dd-splash-ring{width:64px;height:64px;border-radius:50%;border:4px solid var(--orange-mid);border-top-color:var(--orange);animation:spin .9s linear infinite}
.dd-splash-txt{font-size:16px;font-weight:700;color:var(--text2)}
.dd-prog{width:200px;height:4px;background:var(--orange-mid);border-radius:4px;overflow:hidden}
.dd-prog-fill{height:100%;width:38%;background:var(--orange);border-radius:4px;animation:sweep 1.3s ease-in-out infinite}

/* Root */
.dd-root{min-height:100vh;background:var(--bg);font-family:'Plus Jakarta Sans',sans-serif;color:var(--text);padding-bottom:60px}

/* Header */
.dd-header{background:var(--white);border-bottom:2px solid var(--orange-mid);padding:18px 40px;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;position:sticky;top:0;z-index:50;box-shadow:0 2px 16px rgba(234,88,12,0.08)}
.dd-header-left{display:flex;align-items:center;gap:14px}
.dd-back-btn{width:42px;height:42px;border-radius:12px;border:2px solid var(--border);background:var(--white);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s;flex-shrink:0}
.dd-back-btn:hover{border-color:var(--orange);background:var(--orange-pale);color:var(--orange)}
.dd-header-tag{font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--orange)}
.dd-header-title{font-size:22px;font-weight:800;color:var(--text);letter-spacing:-.3px}
.dd-header-right{display:flex;align-items:center;gap:10px}

/* Live badge */
.dd-live{display:flex;align-items:center;gap:7px;padding:7px 14px;border-radius:100px;background:var(--orange-pale);border:2px solid var(--orange-mid)}
.dd-live-dot-wrap{position:relative;width:10px;height:10px;flex-shrink:0}
.dd-live-dot{width:10px;height:10px;border-radius:50%;background:#22c55e;display:block}
.dd-live-ping{position:absolute;inset:0;border-radius:50%;background:#22c55e;animation:ping 1.8s ease-out infinite}
.dd-live-txt{font-size:12px;font-weight:700;color:var(--orange)}

.dd-refresh-btn{display:flex;align-items:center;gap:7px;padding:9px 18px;border-radius:12px;border:2px solid var(--border);background:var(--white);color:var(--text2);font-size:13px;font-weight:700;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;transition:all .2s}
.dd-refresh-btn:hover{border-color:var(--orange);color:var(--orange);background:var(--orange-pale)}
.dd-spin{animation:spin .7s linear infinite}

/* Body */
.dd-body{padding:28px 40px;display:flex;flex-direction:column;gap:20px}

/* Status badge */
.dd-badge{display:inline-flex;align-items:center;gap:5px;padding:6px 14px;border-radius:100px;font-size:13px;font-weight:700;border:2px solid}

/* Progress stepper */
.dd-stepper{background:var(--white);border-radius:20px;border:2px solid var(--border);padding:24px 28px;box-shadow:var(--sh);animation:fadeUp .4s cubic-bezier(.22,1,.36,1) both}
.dd-stepper-title{font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--text3);margin-bottom:20px}
.dd-steps{display:flex;align-items:center;gap:0}
.dd-step{display:flex;flex-direction:column;align-items:center;flex:1;position:relative}
.dd-step-circle{width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;border:3px solid;transition:all .3s;position:relative;z-index:1}
.dd-step-label{font-size:11px;font-weight:700;margin-top:8px;text-align:center;color:var(--text3)}
.dd-step-label.active{color:var(--orange);font-weight:800}
.dd-step-label.done{color:#10b981;font-weight:700}
.dd-step-line{flex:1;height:3px;margin-top:-19px;transition:background .3s}

/* Info cards grid */
.dd-cards-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.dd-info-card{background:var(--white);border-radius:18px;border:2px solid var(--border);padding:20px 22px;box-shadow:var(--sh);animation:fadeUp .4s cubic-bezier(.22,1,.36,1) both;transition:border-color .2s}
.dd-info-card:hover{border-color:var(--orange-mid)}
.dd-info-card-head{display:flex;align-items:center;gap:12px;margin-bottom:14px}
.dd-info-icon{width:42px;height:42px;border-radius:12px;background:var(--orange-pale);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.dd-info-type{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--text3)}
.dd-info-name{font-size:17px;font-weight:800;color:var(--text);margin-top:2px}
.dd-info-row{display:flex;align-items:flex-start;gap:8px;margin-top:8px}
.dd-info-row-val{font-size:14px;font-weight:600;color:var(--text2)}

/* Phone highlight */
.dd-phone{font-size:17px;font-weight:800;color:var(--orange);letter-spacing:.04em}

/* Address card */
.dd-address-card{background:var(--white);border-radius:18px;border:2px solid var(--border);padding:22px 24px;box-shadow:var(--sh);animation:fadeUp .45s cubic-bezier(.22,1,.36,1) both;display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap}
.dd-address-left{display:flex;align-items:flex-start;gap:14px;flex:1;min-width:0}
.dd-address-icon{width:46px;height:46px;border-radius:14px;background:linear-gradient(135deg,var(--orange),#f97316);display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 4px 14px rgba(234,88,12,0.3)}
.dd-address-label{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--text3);margin-bottom:4px}
.dd-address-val{font-size:16px;font-weight:800;color:var(--text)}
.dd-maps-btn{display:inline-flex;align-items:center;gap:7px;padding:10px 20px;border-radius:12px;background:var(--orange);color:#fff;font-size:13px;font-weight:800;text-decoration:none;transition:all .2s;white-space:nowrap;box-shadow:0 4px 14px rgba(234,88,12,0.3)}
.dd-maps-btn:hover{background:var(--orange-h);transform:translateY(-2px)}

/* Actions card */
.dd-actions-card{background:var(--white);border-radius:18px;border:2px solid var(--border);padding:22px 24px;box-shadow:var(--sh);animation:fadeUp .5s cubic-bezier(.22,1,.36,1) both}
.dd-actions-title{font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--text3);margin-bottom:14px}
.dd-actions-row{display:flex;gap:12px;flex-wrap:wrap}
.dd-act-btn{padding:12px 24px;border-radius:12px;font-size:14px;font-weight:800;cursor:pointer;border:none;transition:all .18s;font-family:'Plus Jakarta Sans',sans-serif;display:inline-flex;align-items:center;gap:8px}
.dd-act-btn:disabled{opacity:.38;cursor:not-allowed;transform:none!important}
.btn-pickup  {background:#6366f1;color:#fff}
.btn-pickup:hover:not(:disabled) {background:#4f46e5;transform:translateY(-2px);box-shadow:0 6px 18px rgba(99,102,241,0.35)}
.btn-onway   {background:#0ea5e9;color:#fff}
.btn-onway:hover:not(:disabled)  {background:#0284c7;transform:translateY(-2px);box-shadow:0 6px 18px rgba(14,165,233,0.35)}
.btn-deliver {background:#10b981;color:#fff}
.btn-deliver:hover:not(:disabled){background:#059669;transform:translateY(-2px);box-shadow:0 6px 18px rgba(16,185,129,0.35)}

/* Error / not found */
.dd-notice{background:var(--white);border-radius:18px;border:2px solid var(--border);padding:48px 32px;text-align:center;box-shadow:var(--sh)}

@media(max-width:900px){
  .dd-cards-grid{grid-template-columns:1fr}
  .dd-body{padding:20px 18px}
  .dd-header{padding:14px 18px}
}
`;

const DeliveryDetail = () => {
  const { deliveryId } = useParams();
  const navigate = useNavigate();

  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [updating, setUpdating]     = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const myUserId = getDeliveryUserId();

  const load = async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    setError("");
    try {
      const data = await fetchDeliveries();
      setDeliveries(data);
      setLastUpdated(new Date());
    } catch (e) {
      setError(e.message || "Failed to load delivery");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(() => load(true), 15000);
    return () => clearInterval(interval);
  }, [deliveryId]);

  const delivery = useMemo(() => {
    const idNum = parseInt(deliveryId, 10);
    return deliveries.find(d => d.deliveryID === idNum);
  }, [deliveries, deliveryId]);

  const isMine = useMemo(() => {
    if (!delivery) return false;
    return delivery.deliveryUser?.userID === myUserId || delivery.deliveryUserID === myUserId;
  }, [delivery, myUserId]);

  const address        = delivery?.order?.deliveryAddress || delivery?.deliveryAddress || "";
  const restaurantName = delivery?.order?.restaurant?.name || delivery?.order?.restaurantName || "Restaurant";
  const restaurantAddr = delivery?.order?.restaurant?.address || delivery?.order?.restaurantAddress || "";
  const customerName   = delivery?.order?.user?.userName || delivery?.order?.userName || "Customer";
  const customerPhone  = delivery?.order?.user?.phone || delivery?.order?.user?.phoneNumber || delivery?.order?.userPhone || delivery?.order?.phone || "";
  const orderAmount    = delivery?.order?.totalAmount ?? 0;
  const orderDate      = delivery?.deliveryTime || delivery?.order?.orderDate || null;
  const mapsUrl        = address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}` : null;

  const update = async (status) => {
    if (!delivery?.deliveryID) return;
    setUpdating(true);
    try {
      await updateDeliveryStatus(delivery.deliveryID, status);
      await load(true);
    } catch (e) {
      alert(e.message || "Failed to update delivery");
    } finally {
      setUpdating(false);
    }
  };

  /* Current step index */
  const currentStepIdx = STEPS.indexOf(delivery?.deliveryStatus);

  /* ── Splash ── */
  if (loading) return (
    <div className="dd-splash">
      <style>{css}</style>
      <div className="dd-splash-ring"/>
      <p className="dd-splash-txt">Loading delivery…</p>
      <div className="dd-prog"><div className="dd-prog-fill"/></div>
    </div>
  );

  /* ── Error ── */
  if (error) return (
    <div className="dd-root">
      <style>{css}</style>
      <div className="dd-body">
        <div className="dd-notice">
          <AlertCircle size={48} style={{color:"#ef4444", margin:"0 auto 16px"}}/>
          <p style={{fontSize:20, fontWeight:800, color:"var(--text)", marginBottom:8}}>Something went wrong</p>
          <p style={{fontSize:14, fontWeight:600, color:"var(--text3)", marginBottom:24}}>{error}</p>
          <button onClick={() => navigate("/delivery/deliveries")}
            style={{padding:"12px 28px", borderRadius:12, background:"var(--orange)", color:"#fff", border:"none", fontSize:14, fontWeight:800, cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
            Back to deliveries
          </button>
        </div>
      </div>
    </div>
  );

  if (!delivery) return (
    <div className="dd-root">
      <style>{css}</style>
      <div className="dd-body">
        <div className="dd-notice">
          <div style={{fontSize:48, marginBottom:16}}>📦</div>
          <p style={{fontSize:20, fontWeight:800, color:"var(--text)", marginBottom:8}}>Delivery not found</p>
          <Link to="/delivery/deliveries"
            style={{display:"inline-flex", alignItems:"center", gap:7, padding:"12px 24px", borderRadius:12, background:"var(--orange)", color:"#fff", textDecoration:"none", fontSize:14, fontWeight:800, marginTop:8}}>
            <ArrowLeft size={16}/> Back
          </Link>
        </div>
      </div>
    </div>
  );

  if (!isMine) return (
    <div className="dd-root">
      <style>{css}</style>
      <div className="dd-body">
        <div className="dd-notice">
          <div style={{fontSize:48, marginBottom:16}}>🔒</div>
          <p style={{fontSize:20, fontWeight:800, color:"var(--text)", marginBottom:8}}>Not assigned to you</p>
          <p style={{fontSize:14, fontWeight:600, color:"var(--text3)", marginBottom:24}}>This delivery isn't assigned to your account.</p>
          <Link to="/delivery/deliveries"
            style={{display:"inline-flex", alignItems:"center", gap:7, padding:"12px 24px", borderRadius:12, background:"var(--orange)", color:"#fff", textDecoration:"none", fontSize:14, fontWeight:800}}>
            <ArrowLeft size={16}/> Back to deliveries
          </Link>
        </div>
      </div>
    </div>
  );

  const st = getStatus(delivery.deliveryStatus);

  return (
    <div className="dd-root">
      <style>{css}</style>

      {/* ── HEADER ── */}
      <header className="dd-header">
        <div className="dd-header-left">
          <button className="dd-back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={18}/>
          </button>
          <div>
            <p className="dd-header-tag">Delivery Dashboard</p>
            <h1 className="dd-header-title">Delivery #{delivery.deliveryID}</h1>
          </div>
          <span className="dd-badge" style={{color:st.color, background:st.bg, borderColor:st.border}}>
            <span style={{width:7,height:7,borderRadius:"50%",background:st.color,display:"inline-block"}}/>
            {st.label}
          </span>
          {delivery.order?.orderID && (
            <span style={{fontSize:12, fontWeight:600, color:"var(--text3)"}}>· Order #{delivery.order.orderID}</span>
          )}
        </div>
        <div className="dd-header-right">
          <div className="dd-live">
            <div className="dd-live-dot-wrap">
              <span className="dd-live-ping"/>
              <span className="dd-live-dot"/>
            </div>
            <span className="dd-live-txt">
              {lastUpdated ? lastUpdated.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"}) : "Live"}
            </span>
          </div>
          <button className="dd-refresh-btn" onClick={() => load(true)} disabled={refreshing}>
            <RefreshCw size={15} className={refreshing ? "dd-spin" : ""}/>
            Refresh
          </button>
        </div>
      </header>

      <div className="dd-body">

        {/* ── PROGRESS STEPPER ── */}
        <div className="dd-stepper">
          <p className="dd-stepper-title">Delivery Progress</p>
          <div className="dd-steps">
            {STEPS.map((step, i) => {
              const isDone    = currentStepIdx > i;
              const isCurrent = currentStepIdx === i;
              const isLast    = i === STEPS.length - 1;
              return (
                <div key={step} className="dd-step" style={{flexDirection:"row", alignItems:"center", flex: isLast ? "0 0 auto" : 1}}>
                  <div style={{display:"flex", flexDirection:"column", alignItems:"center"}}>
                    <div className="dd-step-circle" style={{
                      background: isDone ? "#10b981" : isCurrent ? st.color : "var(--bg)",
                      borderColor: isDone ? "#10b981" : isCurrent ? st.color : "var(--border)",
                      color: isDone || isCurrent ? "#fff" : "var(--text3)",
                      boxShadow: isCurrent ? `0 0 0 4px ${st.color}22` : "none",
                    }}>
                      {isDone ? <CheckCircle size={16}/> : i + 1}
                    </div>
                    <span className={`dd-step-label ${isDone?"done":isCurrent?"active":""}`}>
                      {STEP_LABELS[step]}
                    </span>
                  </div>
                  {!isLast && (
                    <div className="dd-step-line" style={{
                      background: isDone ? "#10b981" : "var(--border)",
                      marginBottom: 20,
                    }}/>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── INFO CARDS ── */}
        <div className="dd-cards-grid">

          {/* Restaurant */}
          <div className="dd-info-card" style={{animationDelay:"0ms"}}>
            <div className="dd-info-card-head">
              <div className="dd-info-icon"><Store size={18} style={{color:"var(--orange)"}}/></div>
              <div>
                <p className="dd-info-type">Pick up from</p>
                <p className="dd-info-name">{restaurantName}</p>
              </div>
            </div>
            {restaurantAddr && (
              <div className="dd-info-row">
                <MapPin size={15} style={{color:"var(--orange)", flexShrink:0, marginTop:2}}/>
                <span className="dd-info-row-val">{restaurantAddr}</span>
              </div>
            )}
          </div>

          {/* Customer */}
          <div className="dd-info-card" style={{animationDelay:"60ms"}}>
            <div className="dd-info-card-head">
              <div className="dd-info-icon"><User size={18} style={{color:"var(--orange)"}}/></div>
              <div>
                <p className="dd-info-type">Deliver to</p>
                <p className="dd-info-name">{customerName}</p>
              </div>
            </div>
            {customerPhone ? (
              <div className="dd-info-row">
                <Phone size={15} style={{color:"var(--orange)", flexShrink:0, marginTop:2}}/>
                <span className="dd-phone">{customerPhone}</span>
              </div>
            ) : (
              <div className="dd-info-row">
                <Phone size={15} style={{color:"#d1d5db", flexShrink:0, marginTop:2}}/>
                <span style={{fontSize:13, fontWeight:600, color:"#9ca3af"}}>Phone not provided</span>
              </div>
            )}
          </div>

          {/* Order info */}
          <div className="dd-info-card" style={{animationDelay:"120ms"}}>
            <div className="dd-info-card-head">
              <div className="dd-info-icon"><Package size={18} style={{color:"var(--orange)"}}/></div>
              <div>
                <p className="dd-info-type">Order Amount</p>
                <p className="dd-info-name">₹{orderAmount}</p>
              </div>
            </div>
            {orderDate && (
              <div className="dd-info-row">
                <Clock size={15} style={{color:"var(--orange)", flexShrink:0, marginTop:2}}/>
                <span className="dd-info-row-val">
                  {new Date(orderDate.endsWith?.("Z") ? orderDate : orderDate + "Z")
                    .toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}
                  {" · "}
                  {new Date(orderDate.endsWith?.("Z") ? orderDate : orderDate + "Z")
                    .toLocaleDateString("en-IN",{day:"numeric",month:"short"})}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── DROP ADDRESS ── */}
        <div className="dd-address-card">
          <div className="dd-address-left">
            <div className="dd-address-icon">
              <Navigation size={22} color="#fff"/>
            </div>
            <div>
              <p className="dd-address-label">Drop Address</p>
              <p className="dd-address-val">{address || "No address provided"}</p>
            </div>
          </div>
          {mapsUrl && (
            <a href={mapsUrl} target="_blank" rel="noreferrer" className="dd-maps-btn">
              <MapPin size={16}/> Open in Maps <ExternalLink size={14}/>
            </a>
          )}
        </div>

        {/* ── ACTIONS ── */}
        <div className="dd-actions-card">
          <p className="dd-actions-title">Update Delivery Status</p>
          <div className="dd-actions-row">
            <button className="dd-act-btn btn-pickup"
              disabled={delivery.deliveryStatus !== "Assigned" || updating}
              onClick={() => update("PickedUp")}>
              <Package size={16}/>
              {updating ? "Updating…" : "Picked Up"}
            </button>
            <button className="dd-act-btn btn-onway"
              disabled={delivery.deliveryStatus !== "PickedUp" || updating}
              onClick={() => update("OnTheWay")}>
              <Navigation size={16}/>
              On The Way
            </button>
            <button className="dd-act-btn btn-deliver"
              disabled={delivery.deliveryStatus !== "OnTheWay" || updating}
              onClick={() => update("Delivered")}>
              <CheckCircle size={16}/>
              Delivered
            </button>
          </div>
          <p style={{fontSize:12, fontWeight:600, color:"var(--text3)", marginTop:12}}>
            Only the next step is enabled — Assigned → Picked Up → On The Way → Delivered
          </p>
        </div>

      </div>
    </div>
  );
};

export default DeliveryDetail;