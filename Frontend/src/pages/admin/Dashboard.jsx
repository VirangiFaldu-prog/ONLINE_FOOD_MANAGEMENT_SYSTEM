import React, { useEffect, useState, useRef } from "react";
import {
  Store, Users, Truck, ShoppingBag, Star,
  Layers, UtensilsCrossed, MessageSquare,
  TrendingUp, TrendingDown, RefreshCw,
  Activity, CheckCircle, XCircle, Clock,
  IndianRupee, Bike, Crown, Flame,
  MapPin, Navigation, Package,
  ArrowUpRight, ChevronRight, Sparkles,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import axiosInstance from "../../api/axiosInstance";

/* ══════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════ */
const fmtINR = (n) => {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000)     return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${(n || 0).toLocaleString("en-IN")}`;
};
const fmtNum = (n) => (n || 0).toLocaleString("en-IN");
const fmtDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};
const ROLE_MAP = { 1: "Admin", 2: "Customer", 3: "Restaurant", 4: "Delivery" };
const getRoleName = (r) => ROLE_MAP[r] ?? "Unknown";

/* ── Animated counter ──────────────────────────────────── */
const Counter = ({ to, prefix = "", suffix = "", duration = 1400, decimals = 0 }) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!to) return;
    let s = 0;
    const step = to / (duration / 16);
    const t = setInterval(() => {
      s += step;
      if (s >= to) { setVal(to); clearInterval(t); }
      else setVal(s);
    }, 16);
    return () => clearInterval(t);
  }, [to]);
  return <span>{prefix}{decimals > 0 ? val.toFixed(decimals) : Math.floor(val).toLocaleString("en-IN")}{suffix}</span>;
};

/* ── Custom Tooltip ────────────────────────────────────── */
const ChartTooltip = ({ active, payload, label, prefix = "₹" }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="db-tooltip">
      <p className="db-tooltip-label">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="db-tooltip-val" style={{ color: p.color }}>
          {prefix}{typeof p.value === "number" ? p.value.toLocaleString("en-IN") : p.value}
        </p>
      ))}
    </div>
  );
};

/* ── Stat Hero Card ────────────────────────────────────── */
const HeroStat = ({ label, value, icon: Icon, color, bg, border, sub, prefix = "", trend, delay, isLoading }) => (
  <div className="db-hero-stat" style={{ "--hc": color, "--hb": bg, "--hbd": border, animationDelay: delay }}>
    <div className="db-hero-stat-top">
      <div className="db-hero-stat-icon"><Icon size={18} /></div>
      {trend != null && (
        <span className={`db-trend ${trend >= 0 ? "db-trend-up" : "db-trend-dn"}`}>
          {trend >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    {isLoading
      ? <div className="db-skel-val" />
      : <div className="db-hero-stat-val">{prefix}<Counter to={value} /></div>
    }
    <div className="db-hero-stat-label">{label}</div>
    {sub && <div className="db-hero-stat-sub">{sub}</div>}
    <div className="db-hero-stat-bar" />
  </div>
);

/* ── Section Header ────────────────────────────────────── */
const SectionHdr = ({ title, sub, action }) => (
  <div className="db-sec-hdr">
    <div>
      <h2 className="db-sec-title">{title}</h2>
      {sub && <p className="db-sec-sub">{sub}</p>}
    </div>
    {action}
  </div>
);

/* ── Status pill ───────────────────────────────────────── */
const STATUS_COLORS = {
  Pending:        { color:"#ea580c", bg:"#fff7ed" },
  Confirmed:      { color:"#7c3aed", bg:"#f5f3ff" },
  Preparing:      { color:"#0891b2", bg:"#ecfeff" },
  OutForDelivery: { color:"#0d9488", bg:"#f0fdfa" },
  Completed:      { color:"#15803d", bg:"#f0fdf4" },
  Delivered:      { color:"#15803d", bg:"#f0fdf4" },
  Cancelled:      { color:"#dc2626", bg:"#fef2f2" },
};
const OrderPill = ({ status }) => {
  const cfg = STATUS_COLORS[status] ?? { color:"#78716c", bg:"#f5f5f4" };
  return (
    <span className="db-order-pill" style={{ background: cfg.bg, color: cfg.color }}>
      {status}
    </span>
  );
};

/* ══════════════════════════════════════════════════════════
   MAIN DASHBOARD
══════════════════════════════════════════════════════════ */
export default function Dashboard() {
  /* ── raw data ── */
  const [users,       setUsers]       = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [orders,      setOrders]      = useState([]);
  const [deliveries,  setDeliveries]  = useState([]);
  const [reviews,     setReviews]     = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [menuItems,   setMenuItems]   = useState([]);

  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchAll = async () => {
    try {
      const results = await Promise.allSettled([
        axiosInstance.get("/User"),
        axiosInstance.get("/Restaurant"),
        axiosInstance.get("/Order"),
        axiosInstance.get("/Delivery"),
        axiosInstance.get("/Review"),
        axiosInstance.get("/Category"),
        axiosInstance.get("/MenuItem"),
      ]);
      const [u, r, o, d, rv, c, mi] = results;
      if (u.status  === "fulfilled") setUsers(u.value.data  || []);
      if (r.status  === "fulfilled") setRestaurants(r.value.data || []);
      if (o.status  === "fulfilled") setOrders(o.value.data || []);
      if (d.status  === "fulfilled") setDeliveries(d.value.data || []);
      if (rv.status === "fulfilled") setReviews(rv.value.data || []);
      if (c.status  === "fulfilled") setCategories(c.value.data || []);
      if (mi.status === "fulfilled") setMenuItems(mi.value.data || []);
      setLastUpdated(new Date());
    } catch(e) {
      console.error("Dashboard fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAll();
    setTimeout(() => setRefreshing(false), 700);
  };

  /* ══ DERIVED STATS ══ */
  const customers   = users.filter(u => getRoleName(u.role) === "Customer").length;
  const delivery    = users.filter(u => getRoleName(u.role) === "Delivery").length;
  const totalRevenue = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
  const openRestaurants = restaurants.filter(r => r.isOpen).length;
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length)
    : 0;
  const availableItems = menuItems.filter(i => i.isAvailable).length;
  const activeDeliveries = deliveries.filter(d => ["Assigned","PickedUp","OnTheWay"].includes(d.deliveryStatus)).length;
  const pendingOrders = orders.filter(o => o.orderStatus === "Pending").length;
  const completedOrders = orders.filter(o => ["Completed","Delivered"].includes(o.orderStatus)).length;
  const cancelledOrders = orders.filter(o => o.orderStatus === "Cancelled").length;

  /* ── Order status distribution for pie chart ── */
  const orderStatusDist = [
    { name: "Completed",  value: completedOrders,  color: "#15803d" },
    { name: "Pending",    value: pendingOrders,     color: "#ea580c" },
    { name: "Cancelled",  value: cancelledOrders,   color: "#dc2626" },
    { name: "Active",     value: orders.filter(o => ["Confirmed","Preparing","OutForDelivery"].includes(o.orderStatus)).length, color: "#0891b2" },
  ].filter(d => d.value > 0);

  /* ── Revenue trend — group orders by date (last 7 days) ── */
  const revenueTrend = (() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString("en-IN", { weekday: "short" });
      const dateStr = d.toDateString();
      const dayRevenue = orders
        .filter(o => {
          const od = new Date(o.orderDate || o.createdAt || 0);
          return od.toDateString() === dateStr;
        })
        .reduce((s, o) => s + (o.totalAmount || 0), 0);
      days.push({ name: key, revenue: dayRevenue });
    }
    return days;
  })();

  /* ── Orders per day (same 7-day window) ── */
  const ordersPerDay = (() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString("en-IN", { weekday: "short" });
      const dateStr = d.toDateString();
      const count = orders.filter(o => {
        const od = new Date(o.orderDate || o.createdAt || 0);
        return od.toDateString() === dateStr;
      }).length;
      days.push({ name: key, orders: count });
    }
    return days;
  })();

  /* ── Top restaurants by order count ── */
  const topRestaurants = (() => {
    const map = {};
    orders.forEach(o => {
      const name = o.restaurantName || "Unknown";
      if (!map[name]) map[name] = { name, orders: 0, revenue: 0 };
      map[name].orders++;
      map[name].revenue += o.totalAmount || 0;
    });
    return Object.values(map).sort((a,b) => b.orders - a.orders).slice(0, 5);
  })();

  /* ── Recent orders (last 8) ── */
  const recentOrders = [...orders]
    .sort((a,b) => new Date(b.orderDate||0) - new Date(a.orderDate||0))
    .slice(0, 8);

  /* ── Delivery status dist ── */
  const deliveryDist = [
    { name: "Delivered",  value: deliveries.filter(d=>d.deliveryStatus==="Delivered").length,  color: "#15803d" },
    { name: "On the Way", value: deliveries.filter(d=>d.deliveryStatus==="OnTheWay").length,   color: "#0891b2" },
    { name: "Picked Up",  value: deliveries.filter(d=>d.deliveryStatus==="PickedUp").length,   color: "#d97706" },
    { name: "Assigned",   value: deliveries.filter(d=>d.deliveryStatus==="Assigned").length,   color: "#7c3aed" },
  ].filter(d => d.value > 0);

  /* ── Star distribution ── */
  const starDist = [5,4,3,2,1].map(s => ({
    name: `${s}★`,
    count: reviews.filter(r => r.rating === s).length,
    color: s >= 4 ? "#22c55e" : s === 3 ? "#f59e0b" : "#f43f5e",
  }));

  /* ── Time greeting ── */
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <>
      <style>{CSS}</style>

      <div className="db-root">

        {/* ══ HERO WELCOME ══ */}
        <div className="db-hero">
          <div className="db-hero-blobs">
            <div className="db-blob db-blob1" />
            <div className="db-blob db-blob2" />
            <div className="db-blob db-blob3" />
            <div className="db-blob db-blob4" />
          </div>
          <div className="db-hero-dots" />

          <div className="db-hero-content">
            <div className="db-hero-left">
              <div className="db-hero-eyebrow">
                <Sparkles size={11} />
                <span>Admin Dashboard</span>
                <span className="db-eyebrow-sep">·</span>
                <span className="db-last-update">
                  Updated {lastUpdated.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" })}
                </span>
              </div>
              <h1 className="db-hero-title">
                {greeting}, <em>Admin</em>
              </h1>
              <p className="db-hero-desc">
                Here's your complete platform overview — <strong>{fmtNum(orders.length)}</strong> orders · <strong>{fmtINR(totalRevenue)}</strong> revenue · <strong>{openRestaurants}</strong> restaurants live
              </p>
            </div>
            <div className="db-hero-actions">
              {activeDeliveries > 0 && (
                <div className="db-hero-live">
                  <span className="db-live-pulse" />
                  <Bike size={13} />
                  <span>{activeDeliveries} active deliveries</span>
                </div>
              )}
              <button className={`db-refresh ${refreshing ? "db-refreshing" : ""}`} onClick={handleRefresh}>
                <RefreshCw size={15} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* ══ HERO STAT CARDS ══ */}
        <div className="db-stats-grid">
          <HeroStat label="Total Revenue"       value={totalRevenue}         prefix="₹" icon={IndianRupee}   color="#0f766e" bg="#f0fdfa" border="#99f6e4" sub={`${fmtNum(orders.length)} orders`}      delay="0ms"   isLoading={loading} />
          <HeroStat label="Restaurants"         value={restaurants.length}              icon={Store}          color="#ea580c" bg="#fff7ed" border="#fed7aa" sub={`${openRestaurants} open now`}           delay="60ms"  isLoading={loading} />
          <HeroStat label="Customers"           value={customers}                       icon={Users}          color="#4f46e5" bg="#eef2ff" border="#c7d2fe" sub={`${delivery} delivery agents`}           delay="120ms" isLoading={loading} />
          <HeroStat label="Menu Items"          value={menuItems.length}                icon={UtensilsCrossed}color="#d97706" bg="#fffbeb" border="#fde68a" sub={`${availableItems} available`}            delay="180ms" isLoading={loading} />
          <HeroStat label="Avg Rating"          value={avgRating}                       icon={Star}           color="#ca8a04" bg="#fefce8" border="#fef08a" sub={`${reviews.length} reviews`}              delay="240ms" isLoading={loading} />
          <HeroStat label="Active Deliveries"   value={activeDeliveries}                icon={Navigation}     color="#0891b2" bg="#ecfeff" border="#a5f3fc" sub={`${deliveries.length} total`}             delay="300ms" isLoading={loading} />
          <HeroStat label="Categories"          value={categories.length}               icon={Layers}         color="#7c3aed" bg="#f5f3ff" border="#ddd6fe" sub="Food categories"                          delay="360ms" isLoading={loading} />
          <HeroStat label="Pending Orders"      value={pendingOrders}                   icon={Clock}          color="#dc2626" bg="#fef2f2" border="#fecaca" sub={`${completedOrders} completed`}           delay="420ms" isLoading={loading} />
        </div>

        {/* ══ CHARTS ROW 1 ══ */}
        <div className="db-charts-row">

          {/* Revenue Area Chart */}
          <div className="db-chart-card db-chart-wide">
            <SectionHdr
              title="Revenue Trend"
              sub="Last 7 days earnings"
              action={
                <div className="db-chart-badge db-badge-teal">
                  <TrendingUp size={11} /> Live Data
                </div>
              }
            />
            {loading ? (
              <div className="db-chart-skel" />
            ) : (
              <ResponsiveContainer width="100%" height={230}>
                <AreaChart data={revenueTrend} margin={{ top:10, right:10, left:0, bottom:0 }}>
                  <defs>
                    <linearGradient id="rev-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#0f766e" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#0f766e" stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0ece6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill:"#a8a29e", fontSize:11, fontFamily:"Plus Jakarta Sans" }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill:"#a8a29e", fontSize:11, fontFamily:"Plus Jakarta Sans" }} tickFormatter={v => `₹${v >= 1000 ? (v/1000).toFixed(0)+"K" : v}`} dx={-4} />
                  <Tooltip content={<ChartTooltip prefix="₹" />} />
                  <Area type="monotone" dataKey="revenue" stroke="#0f766e" strokeWidth={2.5} fillOpacity={1} fill="url(#rev-grad)" dot={{ fill:"#0f766e", strokeWidth:0, r:3 }} activeDot={{ r:5, fill:"#0f766e" }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Orders Bar Chart */}
          <div className="db-chart-card">
            <SectionHdr
              title="Daily Orders"
              sub="Last 7 days"
              action={
                <div className="db-chart-badge db-badge-blue">
                  <ShoppingBag size={11} /> Orders
                </div>
              }
            />
            {loading ? (
              <div className="db-chart-skel" />
            ) : (
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={ordersPerDay} margin={{ top:10, right:10, left:-20, bottom:0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0ece6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill:"#a8a29e", fontSize:11, fontFamily:"Plus Jakarta Sans" }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill:"#a8a29e", fontSize:11, fontFamily:"Plus Jakarta Sans" }} />
                  <Tooltip content={<ChartTooltip prefix="" />} />
                  <Bar dataKey="orders" fill="#4f46e5" radius={[5,5,0,0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

        </div>

        {/* ══ CHARTS ROW 2 ══ */}
        <div className="db-charts-row db-charts-row-3">

          {/* Order status pie */}
          <div className="db-chart-card">
            <SectionHdr title="Order Status" sub="All time distribution" />
            {loading || orderStatusDist.length === 0 ? (
              <div className="db-chart-skel" />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={orderStatusDist} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value" strokeWidth={0}>
                      {orderStatusDist.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                    <Tooltip content={<ChartTooltip prefix="" />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="db-pie-legend">
                  {orderStatusDist.map((d, i) => (
                    <div key={i} className="db-pie-item">
                      <span className="db-pie-dot" style={{ background: d.color }} />
                      <span className="db-pie-name">{d.name}</span>
                      <span className="db-pie-val">{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Delivery status pie */}
          <div className="db-chart-card">
            <SectionHdr title="Delivery Status" sub="Current breakdown" />
            {loading || deliveryDist.length === 0 ? (
              <div className="db-chart-skel" />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={deliveryDist} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value" strokeWidth={0}>
                      {deliveryDist.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                    <Tooltip content={<ChartTooltip prefix="" />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="db-pie-legend">
                  {deliveryDist.map((d, i) => (
                    <div key={i} className="db-pie-item">
                      <span className="db-pie-dot" style={{ background: d.color }} />
                      <span className="db-pie-name">{d.name}</span>
                      <span className="db-pie-val">{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Rating distribution bars */}
          <div className="db-chart-card">
            <SectionHdr title="Rating Distribution" sub={`${reviews.length} total reviews`} />
            {loading ? (
              <div className="db-chart-skel" />
            ) : (
              <div className="db-rating-dist">
                <div className="db-avg-hero">
                  <span className="db-avg-num">{avgRating.toFixed(1)}</span>
                  <div className="db-avg-stars">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} size={12} style={{ color: s <= Math.round(avgRating) ? "#f59e0b" : "#e5e0d8", fill: s <= Math.round(avgRating) ? "#f59e0b" : "#e5e0d8" }} />
                    ))}
                  </div>
                  <span className="db-avg-lbl">{reviews.length} reviews</span>
                </div>
                <div className="db-rstar-bars">
                  {starDist.map(d => (
                    <div key={d.name} className="db-rstar-row">
                      <span className="db-rstar-lbl">{d.name}</span>
                      <div className="db-rstar-track">
                        <div className="db-rstar-fill" style={{ width: reviews.length ? `${(d.count/reviews.length)*100}%` : "0%", background: d.color }} />
                      </div>
                      <span className="db-rstar-cnt">{d.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* ══ BOTTOM ROW ══ */}
        <div className="db-bottom-row">

          {/* Recent Orders */}
          <div className="db-table-card db-table-wide">
            <SectionHdr
              title="Recent Orders"
              sub="Latest platform activity"
              action={
                <div className="db-chart-badge db-badge-amber">
                  <Activity size={11} /> Live
                </div>
              }
            />
            {loading ? (
              <div className="db-table-skel">
                {[...Array(5)].map((_,i) => <div key={i} className="db-skel-row" style={{ animationDelay:`${i*80}ms` }} />)}
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="db-empty"><ShoppingBag size={32} /><p>No orders yet</p></div>
            ) : (
              <div className="db-table-scroll">
                <table className="db-table">
                  <thead>
                    <tr className="db-thead">
                      <th>Order</th>
                      <th>Restaurant</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((o, i) => (
                      <tr key={o.orderID || i} className="db-trow" style={{ animationDelay:`${i*35}ms` }}>
                        <td><span className="db-order-id">#{o.orderID}</span></td>
                        <td><span className="db-cell-primary">{o.restaurantName || "—"}</span></td>
                        <td><span className="db-cell-secondary">{o.userName || "—"}</span></td>
                        <td><span className="db-cell-amount">₹{fmtNum(o.totalAmount)}</span></td>
                        <td><OrderPill status={o.orderStatus} /></td>
                        <td><span className="db-cell-date">{fmtDate(o.orderDate)}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="db-right-col">

            {/* Top restaurants */}
            <div className="db-table-card">
              <SectionHdr title="Top Restaurants" sub="By order volume" action={<Crown size={16} style={{color:"#d97706"}}/>} />
              {loading ? (
                <div className="db-table-skel">{[...Array(4)].map((_,i) => <div key={i} className="db-skel-row"/>)}</div>
              ) : topRestaurants.length === 0 ? (
                <div className="db-empty"><Store size={28}/><p>No data</p></div>
              ) : (
                <div className="db-top-list">
                  {topRestaurants.map((r, i) => (
                    <div key={r.name} className="db-top-item" style={{ animationDelay:`${i*50}ms` }}>
                      <div className="db-top-rank" style={{ background: i === 0 ? "#fef3c7" : i === 1 ? "#f1f5f9" : "#f5f2ed", color: i === 0 ? "#d97706" : "#78716c" }}>
                        {i + 1}
                      </div>
                      <div className="db-top-info">
                        <p className="db-top-name">{r.name}</p>
                        <p className="db-top-sub">{r.orders} orders</p>
                      </div>
                      <span className="db-top-rev">{fmtINR(r.revenue)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick platform stats */}
            <div className="db-table-card">
              <SectionHdr title="Platform Health" sub="Current snapshot" />
              <div className="db-health-grid">
                {[
                  { label:"Open Restaurants", value: openRestaurants, total: restaurants.length, color:"#0f766e" },
                  { label:"Available Items",   value: availableItems, total: menuItems.length,   color:"#d97706" },
                  { label:"Completed Orders",  value: completedOrders, total: orders.length,     color:"#15803d" },
                  { label:"5-Star Reviews",    value: reviews.filter(r=>r.rating===5).length, total: reviews.length, color:"#ca8a04" },
                ].map(h => {
                  const pct = h.total > 0 ? Math.round((h.value / h.total) * 100) : 0;
                  return (
                    <div key={h.label} className="db-health-item">
                      <div className="db-health-top">
                        <span className="db-health-label">{h.label}</span>
                        <span className="db-health-val">{h.value}<span className="db-health-total">/{h.total}</span></span>
                      </div>
                      <div className="db-health-bar-track">
                        <div className="db-health-bar-fill" style={{ width:`${pct}%`, background: h.color }} />
                      </div>
                      <span className="db-health-pct">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════
   CSS
══════════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,700;0,800;0,900;1,700;1,800;1,900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

.db-root *,.db-root *::before,.db-root *::after{box-sizing:border-box;margin:0;padding:0}
.db-root{
  --bg:#faf8f5;--surf:#fff;--surf2:#f5f2ed;--surf3:#ede9e2;
  --bdr:#e5e0d8;--bdr2:#d4cfc6;
  --ink:#1c1917;--ink2:#44403c;--ink3:#78716c;--ink4:#a8a29e;
  --teal:#0f766e;--amber:#d97706;--indigo:#4f46e5;--rose:#dc2626;
  --sh:0 1px 3px rgba(28,25,23,.05),0 4px 14px rgba(28,25,23,.07);
  --sh-h:0 6px 22px rgba(28,25,23,.1),0 18px 44px rgba(28,25,23,.09);
  font-family:'Plus Jakarta Sans',system-ui,sans-serif;
  background:var(--bg);min-height:100vh;color:var(--ink);
}

/* KEYFRAMES */
@keyframes db-in{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes db-fade{from{opacity:0}to{opacity:1}}
@keyframes db-spin{to{transform:rotate(360deg)}}
@keyframes db-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(1.8)}}
@keyframes db-blob{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(20px,-15px) scale(1.08)}}
@keyframes db-shimmer{from{background-position:200% 0}to{background-position:-200% 0}}
@keyframes db-bar{from{width:0}}
@keyframes db-row-in{from{opacity:0;transform:translateX(-6px)}to{opacity:1;transform:translateX(0)}}

/* ══ HERO ══ */
.db-hero{
  position:relative;padding:44px 32px 40px;overflow:hidden;
  background:linear-gradient(135deg,#fdf8f0 0%,#f0fdf9 40%,#eff6ff 75%,#fdf8f0 100%);
  border-bottom:1.5px solid var(--bdr);
}
.db-hero-blobs{position:absolute;inset:0;pointer-events:none;overflow:hidden}
.db-blob{position:absolute;border-radius:50%;filter:blur(80px);animation:db-blob 18s ease-in-out infinite}
.db-blob1{width:380px;height:380px;background:rgba(15,118,110,.07);top:-100px;left:-60px;animation-delay:0s}
.db-blob2{width:280px;height:280px;background:rgba(217,119,6,.07);top:20px;right:100px;animation-delay:-5s}
.db-blob3{width:220px;height:220px;background:rgba(79,70,229,.05);bottom:-50px;left:40%;animation-delay:-9s}
.db-blob4{width:160px;height:160px;background:rgba(220,38,38,.04);top:30px;left:55%;animation-delay:-13s}
.db-hero-dots{
  position:absolute;inset:0;pointer-events:none;
  background-image:radial-gradient(circle,rgba(28,25,23,.04) 1px,transparent 1px);
  background-size:22px 22px;
  mask-image:radial-gradient(ellipse at 70% 50%,black 0%,transparent 65%);
}
.db-hero-content{position:relative;z-index:1;display:flex;align-items:center;justify-content:space-between;gap:18px;flex-wrap:wrap}
.db-hero-eyebrow{
  display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:700;
  color:var(--ink3);letter-spacing:.08em;text-transform:uppercase;
  background:rgba(255,255,255,.8);border:1px solid var(--bdr);
  padding:4px 12px;border-radius:50px;margin-bottom:14px;
}
.db-eyebrow-sep{color:var(--ink4)}
.db-last-update{color:var(--ink4);font-weight:500}
.db-hero-title{
  font-family:'Fraunces',serif;font-size:clamp(34px,4.5vw,58px);
  font-weight:900;color:var(--ink);line-height:.92;letter-spacing:-.025em;margin-bottom:11px;
  animation:db-in .55s cubic-bezier(.22,1,.36,1);
}
.db-hero-title em{
  font-style:italic;font-weight:900;
  background:linear-gradient(135deg,var(--teal) 0%,var(--amber) 50%,var(--indigo) 100%);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
}
.db-hero-desc{font-size:13.5px;color:var(--ink3);animation:db-fade .7s .18s both;line-height:1.6}
.db-hero-desc strong{color:var(--ink);font-weight:700}
.db-hero-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap;flex-shrink:0}
.db-hero-live{
  display:inline-flex;align-items:center;gap:7px;padding:8px 14px;
  background:#ecfeff;border:1.5px solid #a5f3fc;border-radius:50px;
  font-size:12px;font-weight:700;color:#0e7490;
}
.db-live-pulse{width:7px;height:7px;border-radius:50%;background:#0891b2;animation:db-pulse 2s ease infinite;flex-shrink:0}
.db-refresh{
  display:flex;align-items:center;gap:7px;padding:10px 20px;
  background:#fff;border:1.5px solid var(--bdr2);border-radius:12px;
  color:var(--ink2);font-family:inherit;font-size:13px;font-weight:700;
  cursor:pointer;transition:all .18s;box-shadow:var(--sh);
}
.db-refresh:hover{border-color:var(--teal);color:var(--teal);background:#f0fdfa}
.db-refreshing svg{animation:db-spin .7s linear infinite}

/* ══ STATS GRID (8 cards) ══ */
.db-stats-grid{
  display:grid;
  grid-template-columns:repeat(auto-fill,minmax(195px,1fr));
  gap:14px;padding:22px 28px;
  border-bottom:1.5px solid var(--bdr);
  background:var(--bg);
}
.db-hero-stat{
  background:var(--surf);border:1.5px solid var(--hbd,var(--bdr));
  border-radius:18px;padding:18px;overflow:hidden;position:relative;
  box-shadow:var(--sh);cursor:default;
  transition:transform .22s cubic-bezier(.22,1,.36,1),box-shadow .22s;
  animation:db-in .5s cubic-bezier(.22,1,.36,1) both;
}
.db-hero-stat::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--hc);border-radius:18px 18px 0 0}
.db-hero-stat:hover{transform:translateY(-4px);box-shadow:var(--sh-h)}
.db-hero-stat-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
.db-hero-stat-icon{
  width:40px;height:40px;border-radius:11px;display:flex;align-items:center;justify-content:center;
  background:var(--hb);color:var(--hc);flex-shrink:0;
}
.db-trend{display:inline-flex;align-items:center;gap:3px;font-size:10px;font-weight:700;padding:2px 7px;border-radius:50px}
.db-trend-up{background:#f0fdf4;color:#15803d}
.db-trend-dn{background:#fef2f2;color:#dc2626}
.db-hero-stat-val{
  font-family:'Fraunces',serif;font-size:28px;font-weight:800;
  color:var(--ink);line-height:1;letter-spacing:-.03em;margin-bottom:5px;
}
.db-hero-stat-label{font-size:12px;font-weight:600;color:var(--ink3)}
.db-hero-stat-sub{font-size:10.5px;color:var(--ink4);margin-top:3px}
.db-hero-stat-bar{
  position:absolute;bottom:0;left:0;right:0;height:3px;
  background:var(--hc);opacity:.12;border-radius:0 0 18px 18px;
}
.db-skel-val{height:28px;width:70%;border-radius:8px;background:linear-gradient(90deg,var(--surf2) 25%,var(--surf3) 50%,var(--surf2) 75%);background-size:200%;animation:db-shimmer 1.6s linear infinite;margin-bottom:5px}

/* ══ CHART LAYOUT ══ */
.db-charts-row{
  display:grid;grid-template-columns:2fr 1fr;gap:16px;
  padding:22px 28px 0;
}
.db-charts-row-3{grid-template-columns:1fr 1fr 1fr;padding-top:16px}
.db-chart-card{
  background:var(--surf);border:1.5px solid var(--bdr);border-radius:20px;
  padding:22px 22px 16px;box-shadow:var(--sh);
  animation:db-in .5s cubic-bezier(.22,1,.36,1) both;
}
.db-chart-wide{}
.db-chart-skel{
  height:230px;border-radius:12px;
  background:linear-gradient(90deg,var(--surf2) 25%,var(--surf3) 50%,var(--surf2) 75%);
  background-size:200%;animation:db-shimmer 1.6s linear infinite;
}

/* ── Section header ── */
.db-sec-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
.db-sec-title{font-family:'Fraunces',serif;font-size:16px;font-weight:800;color:var(--ink);line-height:1}
.db-sec-sub{font-size:11px;color:var(--ink4);margin-top:3px;font-weight:500}
.db-chart-badge{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:50px;font-size:10.5px;font-weight:700;border:1.5px solid}
.db-badge-teal{background:#f0fdfa;color:#0f766e;border-color:#99f6e4}
.db-badge-blue{background:#eff6ff;color:#2563eb;border-color:#bfdbfe}
.db-badge-amber{background:#fffbeb;color:#d97706;border-color:#fde68a}

/* ── Tooltip ── */
.db-tooltip{background:#fff;border:1.5px solid var(--bdr);border-radius:10px;padding:8px 12px;box-shadow:0 8px 24px rgba(28,25,23,.12);font-family:'Plus Jakarta Sans',sans-serif}
.db-tooltip-label{font-size:11px;font-weight:700;color:var(--ink3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px}
.db-tooltip-val{font-size:14px;font-weight:800;font-family:'Fraunces',serif}

/* ── Pie legend ── */
.db-pie-legend{display:flex;flex-direction:column;gap:6px;margin-top:12px}
.db-pie-item{display:flex;align-items:center;gap:7px;font-size:12px;color:var(--ink2);font-weight:500}
.db-pie-dot{width:9px;height:9px;border-radius:50%;flex-shrink:0}
.db-pie-name{flex:1}
.db-pie-val{font-weight:700;color:var(--ink)}

/* ── Rating distribution ── */
.db-rating-dist{display:flex;flex-direction:column;gap:12px}
.db-avg-hero{display:flex;align-items:center;gap:10px;padding:12px;background:var(--surf2);border:1.5px solid var(--bdr);border-radius:12px}
.db-avg-num{font-family:'Fraunces',serif;font-size:28px;font-weight:800;color:var(--amber);letter-spacing:-.03em}
.db-avg-stars{display:flex;gap:2px}
.db-avg-lbl{font-size:11px;color:var(--ink4);font-weight:500;margin-left:auto}
.db-rstar-bars{display:flex;flex-direction:column;gap:5px}
.db-rstar-row{display:flex;align-items:center;gap:7px}
.db-rstar-lbl{font-size:11px;font-weight:700;color:var(--ink3);min-width:26px}
.db-rstar-track{flex:1;height:7px;background:var(--surf3);border-radius:4px;overflow:hidden}
.db-rstar-fill{height:100%;border-radius:4px;transition:width .9s cubic-bezier(.22,1,.36,1);animation:db-bar .9s cubic-bezier(.22,1,.36,1)}
.db-rstar-cnt{font-size:11px;font-weight:700;color:var(--ink4);min-width:20px;text-align:right}

/* ══ BOTTOM ROW ══ */
.db-bottom-row{display:grid;grid-template-columns:2fr 1fr;gap:16px;padding:16px 28px 32px}
.db-table-card{background:var(--surf);border:1.5px solid var(--bdr);border-radius:20px;padding:22px;box-shadow:var(--sh);animation:db-in .5s cubic-bezier(.22,1,.36,1) both}
.db-table-wide{}
.db-right-col{display:flex;flex-direction:column;gap:16px}
.db-table-scroll{overflow-x:auto}
.db-table{width:100%;border-collapse:collapse;font-size:13px}
.db-thead tr{border-bottom:1.5px solid var(--bdr)}
.db-thead th{padding:9px 14px;font-size:10px;font-weight:800;color:var(--ink4);text-transform:uppercase;letter-spacing:.08em;text-align:left;white-space:nowrap;background:var(--surf2)}
.db-thead th:first-child{border-radius:8px 0 0 8px}
.db-thead th:last-child{border-radius:0 8px 8px 0}
.db-trow{border-bottom:1px solid var(--bdr);transition:background .14s;animation:db-row-in .4s cubic-bezier(.22,1,.36,1) both}
.db-trow:hover{background:#fafaf9}
.db-trow:last-child{border-bottom:none}
.db-trow td{padding:12px 14px;vertical-align:middle}
.db-order-id{font-family:monospace;font-size:12px;font-weight:700;color:var(--indigo);background:#eef2ff;padding:2px 7px;border-radius:5px}
.db-cell-primary{font-size:13px;font-weight:600;color:var(--ink)}
.db-cell-secondary{font-size:12.5px;color:var(--ink3)}
.db-cell-amount{font-family:'Fraunces',serif;font-size:14px;font-weight:800;color:var(--teal)}
.db-cell-date{font-size:11.5px;color:var(--ink4)}
.db-order-pill{font-size:10px;font-weight:700;padding:3px 9px;border-radius:50px;white-space:nowrap}

/* Table skeletons */
.db-table-skel{display:flex;flex-direction:column;gap:8px;padding:8px 0}
.db-skel-row{height:42px;border-radius:9px;background:linear-gradient(90deg,var(--surf2) 25%,var(--surf3) 50%,var(--surf2) 75%);background-size:200%;animation:db-shimmer 1.6s linear infinite}

/* Empty state */
.db-empty{padding:40px 20px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:8px;color:var(--ink4);font-size:13px}

/* Top restaurants */
.db-top-list{display:flex;flex-direction:column;gap:8px}
.db-top-item{display:flex;align-items:center;gap:11px;padding:9px 10px;border-radius:11px;transition:background .15s;animation:db-in .5s cubic-bezier(.22,1,.36,1) both}
.db-top-item:hover{background:var(--surf2)}
.db-top-rank{width:28px;height:28px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-family:'Fraunces',serif;font-size:14px;font-weight:800;flex-shrink:0}
.db-top-info{flex:1;min-width:0}
.db-top-name{font-size:13px;font-weight:700;color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.db-top-sub{font-size:11px;color:var(--ink4);margin-top:1px}
.db-top-rev{font-family:'Fraunces',serif;font-size:14px;font-weight:800;color:var(--teal);white-space:nowrap}

/* Platform health */
.db-health-grid{display:flex;flex-direction:column;gap:12px}
.db-health-item{display:flex;flex-direction:column;gap:5px}
.db-health-top{display:flex;align-items:center;justify-content:space-between}
.db-health-label{font-size:12px;font-weight:600;color:var(--ink3)}
.db-health-val{font-family:'Fraunces',serif;font-size:15px;font-weight:800;color:var(--ink)}
.db-health-total{font-size:11px;font-weight:500;color:var(--ink4);font-family:'Plus Jakarta Sans',sans-serif}
.db-health-bar-track{height:6px;background:var(--surf3);border-radius:4px;overflow:hidden}
.db-health-bar-fill{height:100%;border-radius:4px;transition:width .9s cubic-bezier(.22,1,.36,1);animation:db-bar .9s cubic-bezier(.22,1,.36,1)}
.db-health-pct{font-size:10.5px;font-weight:700;color:var(--ink4);text-align:right}

@media(max-width:1024px){
  .db-charts-row{grid-template-columns:1fr}
  .db-charts-row-3{grid-template-columns:1fr 1fr}
  .db-bottom-row{grid-template-columns:1fr}
  .db-right-col{display:grid;grid-template-columns:1fr 1fr;gap:16px}
}
@media(max-width:640px){
  .db-hero{padding:26px 16px 22px}
  .db-stats-grid{padding:14px 16px;grid-template-columns:1fr 1fr}
  .db-charts-row,.db-charts-row-3{padding:14px 16px 0;grid-template-columns:1fr}
  .db-bottom-row{padding:16px;grid-template-columns:1fr}
  .db-right-col{display:flex;flex-direction:column}
  .db-hero-title{font-size:36px}
}
`;