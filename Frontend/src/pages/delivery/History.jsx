import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle, XCircle, Search, RefreshCw,
  ArrowRight, Package, User, Phone,
} from "lucide-react";
import { fetchDeliveries, getDeliveryUserId } from "./deliveryApi";

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

.dh-root{min-height:100vh;background:var(--bg);font-family:'Plus Jakarta Sans',sans-serif;color:var(--text);padding-bottom:60px}
.dh-body{padding:28px 40px;max-width:960px;margin:0 auto;display:flex;flex-direction:column;gap:20px}

/* Header */
.dh-top{display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:12px}
.dh-tag{font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--or);margin-bottom:4px}
.dh-title{font-size:26px;font-weight:800;color:var(--text);letter-spacing:-.4px}
.dh-sub{font-size:13px;font-weight:600;color:var(--text3);margin-top:3px}
.dh-ref{display:flex;align-items:center;gap:7px;padding:10px 18px;border-radius:12px;border:2px solid var(--or-border);background:var(--white);color:var(--text2);font-size:13px;font-weight:700;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;transition:all .15s}
.dh-ref:hover{border-color:var(--or);color:var(--or);background:var(--or-pale)}
.dh-spin{animation:spin .7s linear infinite}

/* Stats */
.dh-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
.dh-stat{background:var(--white);border:2px solid var(--or-border);border-radius:16px;padding:16px 18px;animation:fadeUp .35s both}
.dh-stat-label{font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--text3);margin-bottom:6px}
.dh-stat-val{font-size:26px;font-weight:800;color:var(--or);line-height:1}
.dh-stat-sub{font-size:11px;color:var(--text3);font-weight:600;margin-top:3px}

/* Toolbar */
.dh-toolbar{background:var(--white);border:2px solid var(--or-border);border-radius:18px;padding:16px 18px;display:flex;gap:12px;align-items:center;flex-wrap:wrap}
.dh-search{flex:1;min-width:180px;position:relative;display:flex;align-items:center}
.dh-search-icon{position:absolute;left:12px;width:16px;height:16px;color:var(--text3);pointer-events:none}
.dh-search input{width:100%;padding:10px 12px 10px 36px;border-radius:12px;border:2px solid var(--or-border);background:var(--bg);font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;font-weight:600;color:var(--text);outline:none;transition:border .15s}
.dh-search input:focus{border-color:var(--or)}
.dh-search input::placeholder{color:var(--text3)}
.dh-filters{display:flex;gap:6px}
.dh-ftab{padding:8px 14px;border-radius:10px;border:2px solid var(--or-border);background:var(--white);font-size:12px;font-weight:700;color:var(--text2);cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;transition:all .15s}
.dh-ftab:hover{border-color:var(--or);color:var(--or)}
.dh-ftab.active{background:var(--or);border-color:var(--or);color:#fff}

/* Month group */
.dh-month-label{font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--text3);margin-bottom:12px;padding-left:4px}
.dh-month-group{margin-bottom:28px}

/* Row */
.dh-row{display:flex;align-items:center;background:var(--white);border:2px solid var(--or-border);border-radius:18px;overflow:hidden;margin-bottom:10px;animation:fadeUp .38s both;transition:border-color .2s,transform .15s;text-decoration:none;color:inherit}
.dh-row:hover{border-color:var(--or-mid);transform:translateX(4px)}
.dh-accent{width:4px;flex-shrink:0;align-self:stretch}
.dh-icon-wrap{padding:0 16px}
.dh-icon{width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.dh-row-body{flex:1;padding:14px 8px 14px 0}
.dh-row-meta{display:flex;align-items:center;gap:8px;margin-bottom:4px;flex-wrap:wrap}
.dh-row-ids{font-size:11px;font-weight:700;color:var(--text3)}
.dh-badge{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:100px;font-size:11px;font-weight:700;border:1.5px solid}
.dh-badge-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0}
.dh-row-title{font-size:15px;font-weight:800;color:var(--text);margin-bottom:4px}
.dh-row-detail{display:flex;gap:14px;flex-wrap:wrap;font-size:12px;font-weight:600;color:var(--text3)}
.dh-row-detail span{display:flex;align-items:center;gap:4px}
.dh-row-right{padding:14px 16px;display:flex;flex-direction:column;align-items:flex-end;justify-content:center;gap:6px;flex-shrink:0}
.dh-amount{font-size:17px;font-weight:800;color:var(--text)}
.dh-time{font-size:11px;font-weight:600;color:var(--text3)}
.dh-arrow{width:28px;height:28px;border-radius:8px;background:var(--or-pale);border:1.5px solid var(--or-mid);display:flex;align-items:center;justify-content:center;color:var(--or)}

/* Empty */
.dh-empty{text-align:center;padding:64px 24px;background:var(--white);border:2px solid var(--or-border);border-radius:22px}
.dh-empty-icon{width:52px;height:52px;border-radius:16px;background:var(--or-pale);border:2px solid var(--or-border);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;color:var(--or)}

/* Loading */
.dh-splash{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;background:var(--bg);font-family:'Plus Jakarta Sans',sans-serif}
.dh-ring{width:56px;height:56px;border-radius:50%;border:4px solid var(--or-mid);border-top-color:var(--or);animation:spin .9s linear infinite}
.dh-ring-txt{font-size:15px;font-weight:700;color:var(--text2)}

@media(max-width:760px){
  .dh-body{padding:20px 16px}
  .dh-stats{grid-template-columns:repeat(2,1fr)}
}
@media(max-width:480px){
  .dh-stats{grid-template-columns:1fr 1fr}
  .dh-filters{flex-wrap:wrap}
}
`;

/* ─── Helpers ─── */

// Picks the best available date field from a delivery object
const getDeliveryDate = (d) => {
  return d.order?.orderDate || null;
};

// Safely parses any date string — handles ISO with/without Z, and plain date strings
const parseDate = (dateStr) => {
  if (!dateStr) return null;
  // Already has timezone info
  if (dateStr.includes("Z") || dateStr.includes("+") || dateStr.includes("-", 10)) {
    const d = new Date(dateStr);
    return isNaN(d) ? null : d;
  }
  // No timezone — treat as UTC to avoid locale shifts
  const d = new Date(dateStr + "Z");
  return isNaN(d) ? null : d;
};

const fmtTime = (dateStr) => {
  const d = parseDate(dateStr);
  if (!d) return "—";
  return d.toLocaleString("en-IN", {
    day: "2-digit", month: "short",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
};

const groupByMonth = (items) => {
  const groups = {};
  items.forEach((d) => {
    const dt = parseDate(getDeliveryDate(d));
    const key = dt ? dt.toLocaleString("en-IN", { month: "long", year: "numeric" }) : "Unknown";
    if (!groups[key]) groups[key] = [];
    groups[key].push(d);
  });
  return groups;
};

/* ─── Component ─── */
const DeliveryHistory = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");

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

  const myHistory = useMemo(() => {
    return deliveries
      .filter((d) => d.deliveryUser?.userID === deliveryUserId || d.deliveryUserID === deliveryUserId)
      .filter((d) => ["Delivered", "Cancelled"].includes(d.deliveryStatus))
      .sort((a, b) => (b.deliveryID || 0) - (a.deliveryID || 0));
  }, [deliveries, deliveryUserId]);

  const filtered = useMemo(() => {
    return myHistory.filter((d) => {
      if (filter !== "All" && d.deliveryStatus !== filter) return false;
      const q = query.trim().toLowerCase();
      if (!q) return true;
      const hay = `${d.deliveryID} ${d.order?.orderID || ""} ${d.order?.restaurantName || ""} ${d.order?.userName || ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [myHistory, query, filter]);

  const stats = useMemo(() => ({
    total: myHistory.length,
    delivered: myHistory.filter((d) => d.deliveryStatus === "Delivered").length,
    cancelled: myHistory.filter((d) => d.deliveryStatus === "Cancelled").length,
    earnings: myHistory.filter((d) => d.deliveryStatus === "Delivered").reduce((s, d) => s + (d.order?.totalAmount || 0), 0),
  }), [myHistory]);

  if (loading) return (
    <div className="dh-splash">
      <style>{css}</style>
      <div className="dh-ring" />
      <p className="dh-ring-txt">Loading history…</p>
    </div>
  );

  const grouped = groupByMonth(filtered);

  return (
    <div className="dh-root">
      <style>{css}</style>
      <div className="dh-body">

        {/* Header */}
        <div className="dh-top">
          <div>
            <p className="dh-tag">Delivery Dashboard</p>
            <h1 className="dh-title">Delivery History</h1>
            <p className="dh-sub">Your completed and cancelled deliveries</p>
          </div>
          <button className="dh-ref" onClick={() => load(true)} disabled={refreshing}>
            <RefreshCw size={15} className={refreshing ? "dh-spin" : ""} />
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        {/* Stats */}
        <div className="dh-stats">
          {[
            { label: "Total", value: stats.total, sub: "all deliveries" },
            { label: "Delivered", value: stats.delivered, sub: "completed" },
            { label: "Cancelled", value: stats.cancelled, sub: "not completed" },
            { label: "Earnings", value: `₹${stats.earnings}`, sub: "from delivered" },
          ].map(({ label, value, sub }, i) => (
            <div key={label} className="dh-stat" style={{ animationDelay: `${i * 60}ms` }}>
              <p className="dh-stat-label">{label}</p>
              <p className="dh-stat-val">{value}</p>
              <p className="dh-stat-sub">{sub}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="dh-toolbar">
          <div className="dh-search">
            <Search className="dh-search-icon" size={16} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search order, restaurant, customer…"
            />
          </div>
          <div className="dh-filters">
            {["All", "Delivered", "Cancelled"].map((f) => (
              <button
                key={f}
                className={`dh-ftab ${filter === f ? "active" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="dh-empty">
            <div className="dh-empty-icon"><Package size={24} /></div>
            <p style={{ fontSize: 17, fontWeight: 800, color: "var(--text)", marginBottom: 6 }}>No deliveries found</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text3)" }}>Try adjusting your search or filter.</p>
          </div>
        ) : (
          Object.entries(grouped).map(([month, items]) => (
            <div key={month} className="dh-month-group">
              <p className="dh-month-label">{month}</p>
              {items.map((d, idx) => {
                const isDel = d.deliveryStatus === "Delivered";
                const restaurant = d.order?.restaurantName || "Restaurant";
                const customer = d.order?.userName || "—";
                const phone = d.order?.phone || d.order?.contactPhone || "";
                const amount = d.order?.totalAmount ?? 0;

                return (
                  <Link
                    key={d.deliveryID}
                    to={`/delivery/deliveries/${d.deliveryID}`}
                    className="dh-row"
                    style={{ animationDelay: `${idx * 40}ms` }}
                  >
                    <div className="dh-accent" style={{ background: isDel ? "#10b981" : "#ef4444" }} />

                    <div className="dh-icon-wrap">
                      <div
                        className="dh-icon"
                        style={{
                          background: isDel ? "#ecfdf5" : "#fef2f2",
                          color: isDel ? "#059669" : "#dc2626",
                        }}
                      >
                        {isDel ? <CheckCircle size={20} /> : <XCircle size={20} />}
                      </div>
                    </div>

                    <div className="dh-row-body">
                      <div className="dh-row-meta">
                        <span className="dh-row-ids">
                          Delivery #{d.deliveryID} · Order #{d.order?.orderID || "—"}
                        </span>
                        <span
                          className="dh-badge"
                          style={{
                            background: isDel ? "#ecfdf5" : "#fef2f2",
                            borderColor: isDel ? "#a7f3d0" : "#fecaca",
                            color: isDel ? "#065f46" : "#991b1b",
                          }}
                        >
                          <span className="dh-badge-dot" style={{ background: isDel ? "#10b981" : "#ef4444" }} />
                          {d.deliveryStatus}
                        </span>
                      </div>
                      <p className="dh-row-title">{restaurant}</p>
                      <div className="dh-row-detail">
                        <span><User size={12} />{customer}</span>
                        {phone && <span><Phone size={12} />{phone}</span>}
                      </div>
                    </div>

                    <div className="dh-row-right">
                      <span className="dh-amount">₹{amount}</span>
                      <span className="dh-time">{fmtTime(getDeliveryDate(d))}</span>
                      <div className="dh-arrow"><ArrowRight size={13} /></div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DeliveryHistory;