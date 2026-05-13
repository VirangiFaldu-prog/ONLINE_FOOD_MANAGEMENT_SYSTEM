import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bike, Package, CheckCircle, TrendingUp, Clock,
  ArrowRight, RefreshCw, DollarSign, User,
  History, Wallet, AlertCircle,
} from "lucide-react";
import { fetchDeliveries, getDeliveryUserId } from "./deliveryApi";

const FEE = 25;
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/* ─── CSS ─── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --or:#ea580c;--or-h:#c2410c;--or-pale:#fff7ed;--or-mid:#fed7aa;--or-border:#fde8cc;
  --bg:#fef9f5;--white:#fff;--text:#1c0a00;--text2:#6b3f1e;--text3:#a8703a;
}
@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes ping{0%{transform:scale(1);opacity:1}75%,100%{transform:scale(2.2);opacity:0}}
@keyframes slideIn{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}}

.dd-root{min-height:100vh;background:var(--bg);font-family:'Plus Jakarta Sans',sans-serif;color:var(--text);padding-bottom:60px}
.dd-body{padding:28px 40px;max-width:960px;margin:0 auto;display:flex;flex-direction:column;gap:18px}

/* Header */
.dd-top{display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:12px}
.dd-tag{font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--or);margin-bottom:4px}
.dd-title{font-size:26px;font-weight:800;color:var(--text);letter-spacing:-.5px}
.dd-sub{font-size:13px;color:var(--text3);font-weight:600;margin-top:3px}
.dd-top-right{display:flex;align-items:center;gap:10px}
.dd-live{display:flex;align-items:center;gap:7px;padding:8px 14px;border-radius:100px;background:var(--white);border:2px solid var(--or-border);font-size:12px;font-weight:700;color:var(--text2)}
.dd-live-wrap{position:relative;width:9px;height:9px}
.dd-live-dot{width:9px;height:9px;border-radius:50%;background:#22c55e;display:block}
.dd-live-ping{position:absolute;inset:0;border-radius:50%;background:#22c55e;animation:ping 1.8s ease-out infinite}
.dd-ref{display:flex;align-items:center;gap:6px;padding:9px 16px;border-radius:11px;border:2px solid var(--or-border);background:var(--white);color:var(--text2);font-size:13px;font-weight:700;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;transition:all .15s}
.dd-ref:hover{border-color:var(--or);color:var(--or);background:var(--or-pale)}
.dd-spin{animation:spin .7s linear infinite}

/* Error */
.dd-error{display:flex;align-items:center;gap:10px;padding:14px 18px;border-radius:14px;background:#fef2f2;border:2px solid #fecaca;font-size:14px;font-weight:600;color:#b91c1c}

/* Hero */
.dd-hero{background:var(--white);border:2px solid var(--or-border);border-radius:22px;padding:26px 28px;animation:fadeUp .35s both;position:relative;overflow:hidden;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:20px}
.dd-hero-orb1{position:absolute;top:-40px;right:-40px;width:200px;height:200px;border-radius:50%;background:var(--or-pale);opacity:.7;pointer-events:none}
.dd-hero-orb2{position:absolute;bottom:-50px;right:120px;width:120px;height:120px;border-radius:50%;background:var(--or-mid);opacity:.2;pointer-events:none}
.dd-hero-left{display:flex;align-items:center;gap:16px;position:relative;z-index:1}
.dd-hero-avatar{width:58px;height:58px;border-radius:18px;background:var(--or-pale);border:2px solid var(--or-mid);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:var(--or)}
.dd-hero-greeting{font-size:12px;font-weight:700;color:var(--text3);margin-bottom:4px}
.dd-hero-name{font-size:22px;font-weight:800;color:var(--text);letter-spacing:-.4px}
.dd-hero-status{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:700;color:#065f46;margin-top:5px}
.dd-hero-sdot{width:6px;height:6px;border-radius:50%;background:#22c55e;flex-shrink:0}
.dd-hero-cta{position:relative;z-index:1;display:inline-flex;align-items:center;gap:8px;padding:12px 22px;border-radius:14px;background:var(--or);color:#fff;font-size:14px;font-weight:800;text-decoration:none;transition:all .15s}
.dd-hero-cta:hover{background:var(--or-h);transform:translateY(-2px)}

/* Stats */
.dd-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
.dd-stat{background:var(--white);border:2px solid var(--or-border);border-radius:18px;padding:18px 20px;animation:fadeUp .38s both;transition:transform .2s,border-color .2s}
.dd-stat:hover{transform:translateY(-3px);border-color:var(--or-mid)}
.dd-stat-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
.dd-stat-icon{width:36px;height:36px;border-radius:10px;background:var(--or-pale);display:flex;align-items:center;justify-content:center;color:var(--or)}
.dd-stat-pill{font-size:10px;font-weight:700;padding:3px 7px;border-radius:100px;background:#ecfdf5;color:#065f46;border:1px solid #a7f3d0}
.dd-stat-val{font-size:30px;font-weight:800;color:var(--text);line-height:1;margin-bottom:4px}
.dd-stat-label{font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.06em}

/* Two col */
.dd-two{display:grid;grid-template-columns:1fr 1fr;gap:14px}

/* Cards */
.dd-card{background:var(--white);border:2px solid var(--or-border);border-radius:22px;padding:20px 22px;animation:fadeUp .4s both}
.dd-card-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
.dd-card-title{font-size:15px;font-weight:800;color:var(--text)}
.dd-view-all{font-size:12px;font-weight:700;color:var(--or);text-decoration:none;display:flex;align-items:center;gap:3px}

/* Delivery rows */
.dd-drow{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:14px;border:1.5px solid var(--or-border);margin-bottom:8px;text-decoration:none;color:inherit;transition:all .15s;animation:slideIn .3s both}
.dd-drow:last-child{margin-bottom:0}
.dd-drow:hover{border-color:var(--or-mid);background:var(--or-pale)}
.dd-drow-accent{width:3px;height:36px;border-radius:4px;flex-shrink:0}
.dd-drow-icon{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.dd-drow-body{flex:1}
.dd-drow-id{font-size:13px;font-weight:800;color:var(--text)}
.dd-drow-meta{font-size:11px;font-weight:600;color:var(--text3);margin-top:1px}
.dd-drow-badge{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:100px;font-size:10px;font-weight:700;border:1.5px solid;white-space:nowrap}
.dd-drow-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0}
.dd-drow-arrow{width:24px;height:24px;border-radius:7px;background:var(--or-pale);border:1.5px solid var(--or-border);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:var(--or)}
.dd-empty{text-align:center;padding:28px 16px}
.dd-empty p{font-size:13px;font-weight:600;color:var(--text3)}

/* Quick actions */
.dd-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.dd-action{display:flex;align-items:center;gap:10px;padding:14px;border-radius:14px;border:1.5px solid var(--or-border);background:var(--white);text-decoration:none;color:inherit;transition:all .15s}
.dd-action:hover{border-color:var(--or-mid);background:var(--or-pale);transform:translateX(3px)}
.dd-action-icon{width:34px;height:34px;border-radius:10px;background:var(--or-pale);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:var(--or)}
.dd-action-label{font-size:12px;font-weight:800;color:var(--text)}
.dd-action-sub{font-size:10px;font-weight:600;color:var(--text3);margin-top:1px}

/* Performance chart */
.dd-perf{background:var(--white);border:2px solid var(--or-border);border-radius:22px;padding:20px 24px;animation:fadeUp .42s both}
.dd-perf-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
.dd-perf-title{font-size:15px;font-weight:800;color:var(--text)}
.dd-perf-period{font-size:11px;font-weight:700;color:var(--text3);background:var(--or-pale);border:1px solid var(--or-border);padding:3px 10px;border-radius:100px}
.dd-perf-bars{display:flex;align-items:flex-end;gap:8px;height:80px}
.dd-pb-wrap{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px}
.dd-pb{width:100%;border-radius:5px 5px 0 0;background:var(--or-pale);border:1.5px solid var(--or-border);min-height:4px}
.dd-pb.today{background:var(--or);border-color:var(--or-h)}
.dd-pb-val{font-size:9px;font-weight:700;color:var(--text3)}
.dd-pb-day{font-size:9px;font-weight:700;color:var(--text3)}
.dd-pb-day.today{color:var(--or);font-weight:800}

/* Splash */
.dd-splash{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;background:var(--bg);font-family:'Plus Jakarta Sans',sans-serif}
.dd-ring{width:56px;height:56px;border-radius:50%;border:4px solid var(--or-mid);border-top-color:var(--or);animation:spin .9s linear infinite}
.dd-ring-txt{font-size:15px;font-weight:700;color:var(--text2)}

@media(max-width:820px){
  .dd-body{padding:20px 16px}
  .dd-stats{grid-template-columns:repeat(2,1fr)}
  .dd-two{grid-template-columns:1fr}
}
@media(max-width:480px){
  .dd-stats{grid-template-columns:1fr 1fr}
  .dd-actions{grid-template-columns:1fr 1fr}
}
`;

/* ─── Status config ─── */
const STATUS = {
  Assigned: { color: "#f59e0b", bg: "#fffbeb", border: "#fde68a", text: "#92400e" },
  PickedUp: { color: "#6366f1", bg: "#eef2ff", border: "#c7d2fe", text: "#3730a3" },
  OnTheWay: { color: "#0ea5e9", bg: "#f0f9ff", border: "#bae6fd", text: "#075985" },
  Delivered: { color: "#10b981", bg: "#ecfdf5", border: "#a7f3d0", text: "#065f46" },
  Cancelled: { color: "#ef4444", bg: "#fef2f2", border: "#fecaca", text: "#991b1b" },
};
const getStatus = (s) => STATUS[s] || { color: "#6b7280", bg: "#f9fafb", border: "#e5e7eb", text: "#374151" };

/* ─── Component ─── */
const DeliveryDashboard = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const deliveryUserId = getDeliveryUserId();

  const load = async (silent = false) => {
    setError("");
    if (silent) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await fetchDeliveries();
      setDeliveries(data);
    } catch (e) {
      setError(e.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(() => load(true), 20000);
    return () => clearInterval(interval);
  }, []);

  const my = useMemo(() =>
    deliveries.filter((d) => d.deliveryUser?.userID === deliveryUserId || d.deliveryUserID === deliveryUserId),
    [deliveries, deliveryUserId]
  );

  const active = useMemo(() =>
    my.filter((d) => !["Delivered", "Cancelled"].includes(d.deliveryStatus))
      .sort((a, b) => (b.deliveryID || 0) - (a.deliveryID || 0)),
    [my]
  );

  const delivered = useMemo(() =>
    my.filter((d) => d.deliveryStatus === "Delivered"),
    [my]
  );

  const todaysDelivered = useMemo(() => {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    return delivered.filter((d) => {
      const ts = d.order?.orderDate;
      if (!ts) return false;
      return new Date(ts) >= start;
    }).length;
  }, [delivered]);

  // Weekly bar chart from real data
  const weekData = useMemo(() => {
    const now = new Date();
    const todayIdx = now.getDay();
    const counts = Array(7).fill(0);
    delivered.forEach((d) => {
      const ts = d.order?.orderDate;
      if (!ts) return;
      const dt = new Date(ts.includes("Z") ? ts : ts + "Z");
      const diff = Math.floor((now - dt) / 86400000);
      if (diff < 7) counts[((todayIdx - diff) + 7) % 7]++;
    });
    return Array.from({ length: 7 }, (_, i) => {
      const offset = 6 - i;
      const idx = ((now.getDay() - offset) + 7) % 7;
      return { day: DAYS[idx], count: counts[idx], isToday: offset === 0 };
    });
  }, [delivered]);

  const maxBar = Math.max(...weekData.map((w) => w.count), 1);

  // Get partner name from first delivery
  const partnerName = my[0]?.deliveryUserName || "Partner";

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  if (loading) return (
    <div className="dd-splash">
      <style>{css}</style>
      <div className="dd-ring" />
      <p className="dd-ring-txt">Loading dashboard…</p>
    </div>
  );

  return (
    <div className="dd-root">
      <style>{css}</style>
      <div className="dd-body">

        {/* Header */}
        <div className="dd-top">
          <div>
            <p className="dd-tag">Delivery Dashboard</p>
            <h1 className="dd-title">{greeting()}, {partnerName.split(" ")[0]} 👋</h1>
            <p className="dd-sub">Here's what's happening with your deliveries today</p>
          </div>
          <div className="dd-top-right">
            <div className="dd-live">
              <div className="dd-live-wrap">
                <span className="dd-live-ping" />
                <span className="dd-live-dot" />
              </div>
              Online
            </div>
            <button className="dd-ref" onClick={() => load(true)} disabled={refreshing}>
              <RefreshCw size={13} className={refreshing ? "dd-spin" : ""} />
              {refreshing ? "Refreshing…" : "Refresh"}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="dd-error">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            {error}
          </div>
        )}

        {/* Hero */}
        <div className="dd-hero">
          <div className="dd-hero-orb1" />
          <div className="dd-hero-orb2" />
          <div className="dd-hero-left">
            <div className="dd-hero-avatar"><User size={28} /></div>
            <div>
              <div className="dd-hero-greeting">Delivery Partner</div>
              <div className="dd-hero-name">{partnerName}</div>
              <div className="dd-hero-status">
                <span className="dd-hero-sdot" />
                Active · Ready to receive orders
              </div>
            </div>
          </div>
          <Link to="/delivery/deliveries" className="dd-hero-cta">
            View Active Deliveries <ArrowRight size={16} />
          </Link>
        </div>

        {/* Stats */}
        <div className="dd-stats">
          {[
            { icon: <Package size={16} />, val: active.length, label: "Active now", pill: "Live" },
            { icon: <CheckCircle size={16} />, val: delivered.length, label: "Total delivered", pill: "+all time" },
            { icon: <Clock size={16} />, val: todaysDelivered, label: "Delivered today", pill: "Today" },
            { icon: <Wallet size={16} />, val: `₹${delivered.length * FEE}`, label: "Earnings est.", pill: "Est." },
          ].map(({ icon, val, label, pill }, i) => (
            <div key={label} className="dd-stat" style={{ animationDelay: `${i * 55}ms` }}>
              <div className="dd-stat-top">
                <div className="dd-stat-icon">{icon}</div>
                <span className="dd-stat-pill">{pill}</span>
              </div>
              <div className="dd-stat-val">{val}</div>
              <div className="dd-stat-label">{label}</div>
            </div>
          ))}
        </div>

        {/* Two column */}
        <div className="dd-two">

          {/* Active deliveries */}
          <div className="dd-card" style={{ animationDelay: "80ms" }}>
            <div className="dd-card-header">
              <div className="dd-card-title">Active deliveries</div>
              <Link to="/delivery/deliveries" className="dd-view-all">
                View all <ArrowRight size={12} />
              </Link>
            </div>
            {active.length === 0 ? (
              <div className="dd-empty"><p>No active deliveries right now.</p></div>
            ) : (
              active.slice(0, 3).map((d, idx) => {
                const st = getStatus(d.deliveryStatus);
                const restaurant = d.order?.restaurantName || "Restaurant";
                const customer = d.order?.userName || "";
                return (
                  <Link
                    key={d.deliveryID}
                    to={`/delivery/deliveries/${d.deliveryID}`}
                    className="dd-drow"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div className="dd-drow-accent" style={{ background: st.color }} />
                    <div className="dd-drow-icon" style={{ background: st.bg, color: st.text }}>
                      <Bike size={16} />
                    </div>
                    <div className="dd-drow-body">
                      <div className="dd-drow-id">Delivery #{d.deliveryID}</div>
                      <div className="dd-drow-meta">{restaurant}{customer ? ` · ${customer}` : ""}</div>
                    </div>
                    <span className="dd-drow-badge" style={{ background: st.bg, borderColor: st.border, color: st.text }}>
                      <span className="dd-drow-dot" style={{ background: st.color }} />
                      {d.deliveryStatus}
                    </span>
                    <div className="dd-drow-arrow"><ArrowRight size={11} /></div>
                  </Link>
                );
              })
            )}
          </div>

          {/* Quick actions */}
          <div className="dd-card" style={{ animationDelay: "120ms" }}>
            <div className="dd-card-header">
              <div className="dd-card-title">Quick actions</div>
            </div>
            <div className="dd-actions">
              {[
                { to: "/delivery/deliveries", icon: <Package size={15} />, label: "Deliveries", sub: "View active" },
                { to: "/delivery/history", icon: <History size={15} />, label: "History", sub: "Past deliveries" },
                { to: "/delivery/earnings", icon: <Wallet size={15} />, label: "Earnings", sub: "See estimates" },
                { to: "/delivery/profile", icon: <User size={15} />, label: "Profile", sub: "Your account" },
              ].map(({ to, icon, label, sub }) => (
                <Link key={label} to={to} className="dd-action">
                  <div className="dd-action-icon">{icon}</div>
                  <div>
                    <div className="dd-action-label">{label}</div>
                    <div className="dd-action-sub">{sub}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Weekly performance */}
        <div className="dd-perf" style={{ animationDelay: "160ms" }}>
          <div className="dd-perf-header">
            <div className="dd-perf-title">Weekly performance</div>
            <div className="dd-perf-period">This week</div>
          </div>
          <div className="dd-perf-bars">
            {weekData.map(({ day, count, isToday }) => {
              const h = Math.round((count / maxBar) * 72) + 4;
              return (
                <div key={day} className="dd-pb-wrap">
                  <span className="dd-pb-val">{count > 0 ? count : ""}</span>
                  <div className={`dd-pb ${isToday ? "today" : ""}`} style={{ height: h }} />
                  <span className={`dd-pb-day ${isToday ? "today" : ""}`}>{day}</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default DeliveryDashboard;