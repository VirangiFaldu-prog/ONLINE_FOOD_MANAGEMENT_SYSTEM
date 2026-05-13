import { useEffect, useMemo, useState } from "react";
import { Wallet, RefreshCw, TrendingUp, DollarSign, CheckCircle } from "lucide-react";
import { fetchDeliveries, getDeliveryUserId } from "./deliveryApi";

const FEE_PER_DELIVERY = 25;

/* ─── CSS ─── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --or:#ea580c;--or-h:#c2410c;--or-pale:#fff7ed;--or-mid:#fed7aa;--or-border:#fde8cc;
  --bg:#fef9f5;--white:#fff;--text:#1c0a00;--text2:#6b3f1e;--text3:#a8703a;
}
@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes spin{to{transform:rotate(360deg)}}

.de-root{min-height:100vh;background:var(--bg);font-family:'Plus Jakarta Sans',sans-serif;color:var(--text);padding-bottom:60px}
.de-body{padding:28px 40px;max-width:900px;margin:0 auto;display:flex;flex-direction:column;gap:20px}

/* Header */
.de-top{display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:12px}
.de-tag{font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--or);margin-bottom:4px}
.de-title{font-size:26px;font-weight:800;color:var(--text);letter-spacing:-.4px}
.de-sub{font-size:13px;font-weight:600;color:var(--text3);margin-top:3px}
.de-ref{display:flex;align-items:center;gap:7px;padding:10px 18px;border-radius:12px;border:2px solid var(--or-border);background:var(--white);color:var(--text2);font-size:13px;font-weight:700;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;transition:all .15s}
.de-ref:hover{border-color:var(--or);color:var(--or);background:var(--or-pale)}
.de-spin{animation:spin .7s linear infinite}

/* Hero card */
.de-hero{background:var(--white);border:2px solid var(--or-border);border-radius:22px;padding:28px;animation:fadeUp .35s both;position:relative;overflow:hidden}
.de-hero-bg{position:absolute;top:-30px;right:-30px;width:180px;height:180px;border-radius:50%;background:var(--or-pale);opacity:.6;pointer-events:none}
.de-hero-bg2{position:absolute;bottom:-40px;right:60px;width:100px;height:100px;border-radius:50%;background:var(--or-mid);opacity:.25;pointer-events:none}
.de-hero-top{display:flex;align-items:center;gap:16px;margin-bottom:24px;position:relative}
.de-hero-icon{width:56px;height:56px;border-radius:18px;background:var(--or-pale);border:2px solid var(--or-border);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:var(--or)}
.de-hero-label{font-size:13px;font-weight:700;color:var(--text3);margin-bottom:4px}
.de-hero-amount{font-size:42px;font-weight:800;color:var(--text);letter-spacing:-1px;line-height:1}
.de-hero-sub{font-size:12px;font-weight:600;color:var(--text3);margin-top:5px;display:flex;align-items:center;gap:5px}
.de-hero-dot{width:6px;height:6px;border-radius:50%;background:#10b981;display:inline-block;flex-shrink:0}
.de-divider{height:1px;background:var(--or-border);margin-bottom:20px}
.de-hero-stats{display:grid;grid-template-columns:repeat(3,1fr)}
.de-hstat{padding:0 20px;border-right:1px solid var(--or-border)}
.de-hstat:first-child{padding-left:0}
.de-hstat:last-child{border-right:none}
.de-hstat-label{font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--text3);margin-bottom:6px}
.de-hstat-val{font-size:22px;font-weight:800;color:var(--or)}
.de-hstat-sub{font-size:11px;font-weight:600;color:var(--text3);margin-top:2px}

/* Weekly chart */
.de-chart{background:var(--white);border:2px solid var(--or-border);border-radius:22px;padding:22px 24px;animation:fadeUp .38s .06s both}
.de-chart-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px}
.de-chart-title{font-size:14px;font-weight:700;color:var(--text)}
.de-chart-legend{display:flex;align-items:center;gap:5px;font-size:11px;font-weight:700;color:var(--text3)}
.de-legend-dot{width:8px;height:8px;border-radius:2px;background:var(--or)}
.de-bars{display:flex;align-items:flex-end;gap:10px;height:100px}
.de-bar-wrap{flex:1;display:flex;flex-direction:column;align-items:center;gap:5px}
.de-bar{width:100%;border-radius:6px 6px 0 0;background:var(--or-pale);border:2px solid var(--or-border);min-height:4px;transition:all .3s}
.de-bar.today{background:var(--or);border-color:var(--or-h)}
.de-bar-val{font-size:10px;font-weight:700;color:var(--text3)}
.de-bar-day{font-size:10px;font-weight:700;color:var(--text3)}
.de-bar-day.today{color:var(--or);font-weight:800}

/* Rate card */
.de-rate{background:var(--white);border:2px solid var(--or-border);border-radius:22px;padding:20px 24px;animation:fadeUp .38s .12s both}
.de-rate-inner{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px}
.de-rate-left{display:flex;align-items:center;gap:14px}
.de-rate-icon{width:44px;height:44px;border-radius:14px;background:var(--or-pale);border:2px solid var(--or-border);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:var(--or)}
.de-rate-title{font-size:14px;font-weight:800;color:var(--text);margin-bottom:2px}
.de-rate-desc{font-size:12px;font-weight:600;color:var(--text3)}
.de-rate-badge{padding:8px 18px;border-radius:12px;background:var(--or);color:#fff;font-size:16px;font-weight:800;letter-spacing:-.3px;white-space:nowrap}

/* Recent list */
.de-recent{background:var(--white);border:2px solid var(--or-border);border-radius:22px;padding:20px 24px;animation:fadeUp .38s .18s both}
.de-recent-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
.de-recent-title{font-size:14px;font-weight:700;color:var(--text)}
.de-recent-count{font-size:12px;font-weight:700;color:var(--text3)}
.de-rrow{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--or-border)}
.de-rrow:last-child{border-bottom:none}
.de-rrow-num{width:28px;height:28px;border-radius:8px;background:var(--or-pale);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:var(--or);flex-shrink:0}
.de-rrow-body{flex:1}
.de-rrow-name{font-size:13px;font-weight:700;color:var(--text)}
.de-rrow-meta{font-size:11px;font-weight:600;color:var(--text3);margin-top:1px}
.de-rrow-right{display:flex;flex-direction:column;align-items:flex-end;gap:3px;flex-shrink:0}
.de-rrow-amount{font-size:14px;font-weight:800;color:var(--or)}
.de-rrow-date{font-size:10px;font-weight:600;color:var(--text3)}
.de-earn-badge{display:inline-flex;align-items:center;gap:3px;padding:2px 8px;border-radius:100px;font-size:10px;font-weight:700;background:#ecfdf5;border:1px solid #a7f3d0;color:#065f46}

/* Splash */
.de-splash{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;background:var(--bg);font-family:'Plus Jakarta Sans',sans-serif}
.de-ring{width:56px;height:56px;border-radius:50%;border:4px solid var(--or-mid);border-top-color:var(--or);animation:spin .9s linear infinite}
.de-ring-txt{font-size:15px;font-weight:700;color:var(--text2)}

@media(max-width:760px){.de-body{padding:20px 16px}}
@media(max-width:480px){.de-hero-stats{grid-template-columns:1fr 1fr}.de-hstat:nth-child(2){border-right:none}.de-hstat:last-child{grid-column:1/-1;padding-left:0;border-top:1px solid var(--or-border);padding-top:14px;margin-top:4px}}
`;

/* ─── Helpers ─── */
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const fmtDate = (str) => {
  if (!str) return "—";
  const d = new Date(str.includes("Z") ? str : str + "Z");
  if (isNaN(d)) return "—";
  return d.toLocaleString("en-IN", {
    day: "2-digit", month: "short",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
};

/* ─── Component ─── */
const DeliveryEarnings = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const deliveryUserId = getDeliveryUserId();

  const load = async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await fetchDeliveries();
      setDeliveries(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const delivered = useMemo(() =>
    deliveries
      .filter((d) => d.deliveryUser?.userID === deliveryUserId || d.deliveryUserID === deliveryUserId)
      .filter((d) => d.deliveryStatus === "Delivered")
      .sort((a, b) => new Date(b.order?.orderDate || 0) - new Date(a.order?.orderDate || 0)),
    [deliveries, deliveryUserId]
  );

  const stats = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonth = delivered.filter((d) => {
      const ts = d.order?.orderDate;
      if (!ts) return false;
      return new Date(ts) >= monthStart;
    });
    return {
      total: delivered.length,
      totalEarnings: delivered.length * FEE_PER_DELIVERY,
      thisMonth: thisMonth.length,
      thisMonthEarnings: thisMonth.length * FEE_PER_DELIVERY,
    };
  }, [delivered]);

  // Weekly bar chart data
  const weekData = useMemo(() => {
    const now = new Date();
    const todayIdx = now.getDay();
    const counts = Array(7).fill(0);
    delivered.forEach((d) => {
      const ts = d.order?.orderDate;
      if (!ts) return;
      const dt = new Date(ts.includes("Z") ? ts : ts + "Z");
      const diffDays = Math.floor((now - dt) / 86400000);
      if (diffDays < 7) {
        const idx = ((todayIdx - diffDays) + 7) % 7;
        counts[idx]++;
      }
    });
    return Array.from({ length: 7 }, (_, i) => {
      const offset = 6 - i;
      const dayIdx = ((todayIdx - offset) + 7) % 7;
      return { day: DAYS[dayIdx], count: counts[dayIdx], isToday: offset === 0 };
    });
  }, [delivered]);

  const maxBar = Math.max(...weekData.map((w) => w.count), 1);

  if (loading) return (
    <div className="de-splash">
      <style>{css}</style>
      <div className="de-ring" />
      <p className="de-ring-txt">Loading earnings…</p>
    </div>
  );

  return (
    <div className="de-root">
      <style>{css}</style>
      <div className="de-body">

        {/* Header */}
        <div className="de-top">
          <div>
            <p className="de-tag">Delivery Dashboard</p>
            <h1 className="de-title">Earnings</h1>
            <p className="de-sub">Your delivery earnings summary</p>
          </div>
          <button className="de-ref" onClick={() => load(true)} disabled={refreshing}>
            <RefreshCw size={15} className={refreshing ? "de-spin" : ""} />
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        {/* Hero */}
        <div className="de-hero">
          <div className="de-hero-bg" />
          <div className="de-hero-bg2" />
          <div className="de-hero-top">
            <div className="de-hero-icon"><Wallet size={26} /></div>
            <div>
              <div className="de-hero-label">Total earnings (estimated)</div>
              <div className="de-hero-amount">₹{stats.totalEarnings}</div>
              <div className="de-hero-sub">
                <span className="de-hero-dot" />
                Based on ₹{FEE_PER_DELIVERY} per delivered order
              </div>
            </div>
          </div>
          <div className="de-divider" />
          <div className="de-hero-stats">
            <div className="de-hstat">
              <div className="de-hstat-label">Total delivered</div>
              <div className="de-hstat-val">{stats.total}</div>
              <div className="de-hstat-sub">all time</div>
            </div>
            <div className="de-hstat">
              <div className="de-hstat-label">This month</div>
              <div className="de-hstat-val">{stats.thisMonth}</div>
              <div className="de-hstat-sub">deliveries</div>
            </div>
            <div className="de-hstat">
              <div className="de-hstat-label">Month earnings</div>
              <div className="de-hstat-val">₹{stats.thisMonthEarnings}</div>
              <div className="de-hstat-sub">estimated</div>
            </div>
          </div>
        </div>

        {/* Weekly chart */}
        <div className="de-chart">
          <div className="de-chart-header">
            <div className="de-chart-title">Deliveries this week</div>
            <div className="de-chart-legend">
              <span className="de-legend-dot" /> per day
            </div>
          </div>
          <div className="de-bars">
            {weekData.map(({ day, count, isToday }) => {
              const h = Math.round((count / maxBar) * 88) + 4;
              return (
                <div key={day} className="de-bar-wrap">
                  <span className="de-bar-val">{count > 0 ? count : ""}</span>
                  <div
                    className={`de-bar ${isToday ? "today" : ""}`}
                    style={{ height: h }}
                  />
                  <span className={`de-bar-day ${isToday ? "today" : ""}`}>{day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rate card */}
        <div className="de-rate">
          <div className="de-rate-inner">
            <div className="de-rate-left">
              <div className="de-rate-icon"><DollarSign size={20} /></div>
              <div>
                <div className="de-rate-title">Earnings per delivery</div>
                <div className="de-rate-desc">Client-side estimate · update when backend provides actual fee</div>
              </div>
            </div>
            <div className="de-rate-badge">₹{FEE_PER_DELIVERY} / delivery</div>
          </div>
        </div>

        {/* Recent list */}
        <div className="de-recent">
          <div className="de-recent-header">
            <div className="de-recent-title">Recent deliveries</div>
            <div className="de-recent-count">{stats.total} completed</div>
          </div>
          {delivered.length === 0 ? (
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text3)", textAlign: "center", padding: "24px 0" }}>
              No delivered orders yet.
            </p>
          ) : (
            delivered.slice(0, 8).map((d, i) => (
              <div key={d.deliveryID} className="de-rrow">
                <div className="de-rrow-num">#{i + 1}</div>
                <div className="de-rrow-body">
                  <div className="de-rrow-name">{d.order?.restaurantName || "Restaurant"}</div>
                  <div className="de-rrow-meta">
                    Delivery #{d.deliveryID} · {d.order?.userName || "Customer"}
                  </div>
                </div>
                <div className="de-rrow-right">
                  <span className="de-rrow-amount">+₹{FEE_PER_DELIVERY}</span>
                  <span className="de-rrow-date">{fmtDate(d.order?.orderDate)}</span>
                  <span className="de-earn-badge">
                    <CheckCircle size={9} /> Delivered
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default DeliveryEarnings;