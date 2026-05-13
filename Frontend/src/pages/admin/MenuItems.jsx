import React, { useEffect, useState, useRef } from "react";
import {
  Coffee, Search, Tag, MapPin, Trash2,
  CheckCircle, XCircle, AlertCircle, X,
  Check, RefreshCw, ChevronDown, Eye,
  UtensilsCrossed, MoreHorizontal, Filter,
  TrendingUp, BarChart2, Flame,
} from "lucide-react";
import axiosInstance from "../../api/axiosInstance";

/* ══════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════ */
const fmt = (n) => {
  if (n == null) return "—";
  return `₹${Number(n).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
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
    <div className={`mi-toast ${toast.type === "err" ? "mi-toast-err" : "mi-toast-ok"}`}>
      {toast.type === "err" ? <AlertCircle size={13} /> : <Check size={13} />}
      {toast.msg}
    </div>
  );
};

/* ── Stat card ────────────────────────────────────────── */
const StatCard = ({ label, value, icon: Icon, color, bg, border, sub, delay }) => (
  <div className="mi-stat" style={{ "--sc": color, "--sb": bg, "--sbd": border, animationDelay: delay }}>
    <div className="mi-stat-icon"><Icon size={17} /></div>
    <div>
      <div className="mi-stat-val"><Counter to={value} /></div>
      <div className="mi-stat-label">{label}</div>
      {sub && <div className="mi-stat-sub">{sub}</div>}
    </div>
  </div>
);

/* ── Delete modal ─────────────────────────────────────── */
const DeleteModal = ({ item, onConfirm, onClose, busy }) => (
  <div className="mi-overlay" onClick={onClose}>
    <div className="mi-modal" onClick={e => e.stopPropagation()}>
      <button className="mi-modal-x" onClick={onClose}><X size={14} /></button>
      <div className="mi-modal-icon"><Trash2 size={22} /></div>
      <h2 className="mi-modal-title">Delete Item?</h2>
      <p className="mi-modal-body">
        <strong>"{item?.menuItemName}"</strong> will be permanently removed from the platform and affects the restaurant's live menu.
      </p>
      <div className="mi-modal-btns">
        <button className="mi-mbtn-ghost" onClick={onClose} disabled={busy}>Cancel</button>
        <button className="mi-mbtn-danger" onClick={onConfirm} disabled={busy}>
          {busy ? <><span className="mi-spin" />Deleting…</> : <><Trash2 size={12} />Delete</>}
        </button>
      </div>
    </div>
  </div>
);

/* ── Detail Drawer ────────────────────────────────────── */
const DetailDrawer = ({ item, onClose, onToggle, onDelete }) => {
  if (!item) return null;
  return (
    <div className="mi-drawer-bg" onClick={onClose}>
      <div className="mi-drawer" onClick={e => e.stopPropagation()}>
        <button className="mi-drawer-x" onClick={onClose}><X size={15} /></button>

        {/* Hero image */}
        <div className="mi-drawer-hero">
          <img
            src={item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=400&fit=crop&q=80"}
            alt={item.menuItemName}
            onError={e => { e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=400&fit=crop&q=80"; }}
          />
          <div className="mi-drawer-shade" />
          <div className="mi-drawer-hero-info">
            <span className={`mi-drawer-avail ${item.isAvailable ? "mi-avail-open" : "mi-avail-closed"}`}>
              <span className="mi-avail-dot" />{item.isAvailable ? "Available" : "Unavailable"}
            </span>
            <h2 className="mi-drawer-title">{item.menuItemName}</h2>
            <div className="mi-drawer-price-hero">{fmt(item.menuItemPrice)}</div>
          </div>
        </div>

        <div className="mi-drawer-body">
          {/* Meta fields */}
          <div className="mi-drawer-fields">
            <div className="mi-dfield">
              <span className="mi-dfield-lbl"><Tag size={11} /> Category</span>
              <span className="mi-dfield-val">{item.categoryName || "—"}</span>
            </div>
            <div className="mi-dfield">
              <span className="mi-dfield-lbl"><MapPin size={11} /> Restaurant</span>
              <span className="mi-dfield-val">{item.restaurantName || "—"}</span>
            </div>
            <div className="mi-dfield">
              <span className="mi-dfield-lbl">💰 Price</span>
              <span className="mi-dfield-val mi-price-val">{fmt(item.menuItemPrice)}</span>
            </div>
            <div className="mi-dfield">
              <span className="mi-dfield-lbl"># Item ID</span>
              <span className="mi-dfield-val mi-mono">#{item.menuItemID}</span>
            </div>
          </div>

          {/* Description */}
          {item.description && (
            <div className="mi-drawer-desc">
              <span className="mi-drawer-desc-lbl">Description</span>
              <p>{item.description}</p>
            </div>
          )}

          {/* Actions */}
          <div className="mi-drawer-actions">
            <button
              className={`mi-daction ${item.isAvailable ? "mi-dact-disable" : "mi-dact-enable"}`}
              onClick={() => { onToggle(item.menuItemID, item.isAvailable); onClose(); }}
            >
              {item.isAvailable
                ? <><XCircle size={15} />Disable This Item</>
                : <><CheckCircle size={15} />Enable This Item</>
              }
            </button>
            <button className="mi-daction mi-dact-del" onClick={() => { onDelete(item); onClose(); }}>
              <Trash2 size={15} />Delete Item
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Menu Item Card ───────────────────────────────────── */
const MenuCard = ({ item, idx, onView, onToggle, onDelete }) => {
  const [hov, setHov] = useState(false);
  const [toggling, setToggling] = useState(false);

  const handleToggle = async (e) => {
    e.stopPropagation();
    setToggling(true);
    await onToggle(item.menuItemID, item.isAvailable);
    setToggling(false);
  };

  return (
    <div
      className={`mi-card ${hov ? "mi-card-hov" : ""}`}
      style={{ animationDelay: `${idx * 40}ms` }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {/* Image */}
      <div className="mi-card-img-wrap">
        <img
          src={item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop&q=80"}
          alt={item.menuItemName}
          className="mi-card-img"
          loading="lazy"
          onError={e => { e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop&q=80"; }}
        />
        <div className="mi-card-img-shade" />

        {/* Availability badge */}
        <span className={`mi-avail-badge ${item.isAvailable ? "mi-avail-open" : "mi-avail-closed"}`}>
          <span className="mi-avail-dot" />
          {item.isAvailable ? "Live" : "Off"}
        </span>

        {/* Price badge */}
        <div className="mi-price-badge">{fmt(item.menuItemPrice)}</div>

        {/* Hover overlay */}
        <div className={`mi-card-overlay ${hov ? "mi-card-overlay-on" : ""}`}>
          <button className="mi-ov-btn" onClick={() => onView(item)}>
            <Eye size={14} /> Details
          </button>
          <button
            className={`mi-ov-btn ${item.isAvailable ? "mi-ov-disable" : "mi-ov-enable"}`}
            onClick={handleToggle}
            disabled={toggling}
          >
            {item.isAvailable ? <><XCircle size={13} />Disable</> : <><CheckCircle size={13} />Enable</>}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="mi-card-body">
        <div className="mi-card-top">
          <span className="mi-cat-pill">
            <Tag size={9} />{item.categoryName || "—"}
          </span>
          <button className="mi-del-btn" onClick={() => onDelete(item)} title="Delete">
            <Trash2 size={13} />
          </button>
        </div>

        <h3 className="mi-card-name">{item.menuItemName}</h3>

        <div className="mi-card-restaurant">
          <MapPin size={11} />
          <span>{item.restaurantName || "—"}</span>
        </div>

        {/* Toggle row */}
        <div className="mi-card-footer">
          <button
            className={`mi-toggle-btn ${item.isAvailable ? "mi-toggle-off" : "mi-toggle-on"}`}
            onClick={handleToggle}
            disabled={toggling}
          >
            {toggling
              ? <span className="mi-spin mi-spin-sm" />
              : item.isAvailable ? <><XCircle size={12} />Disable</> : <><CheckCircle size={12} />Enable</>
            }
          </button>
          <button className="mi-view-btn" onClick={() => onView(item)}>
            <Eye size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   MAIN
══════════════════════════════════════════════════════════ */
export default function MenuItems() {
  const [items, setItems]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [refreshing, setRefreshing]   = useState(false);
  const [searchTerm, setSearchTerm]   = useState("");
  const [filterAvail, setFilterAvail] = useState("all");
  const [sortBy, setSortBy]           = useState("default");
  const [sortOpen, setSortOpen]       = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]       = useState(false);
  const [viewTarget, setViewTarget]   = useState(null);
  const [toast, setToast]             = useState(null);
  const sortRef = useRef(null);

  useEffect(() => {
    const h = (e) => { if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => { fetchItems(); }, []);

  const showToast = (msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3600);
  };

  const fetchItems = async () => {
    try {
      setLoading(true); setError("");
      const res = await axiosInstance.get("/MenuItem");
      setItems(res.data);
    } catch (err) {
      setError(err.response?.data || err.message || "Failed to load menu items");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchItems();
    setTimeout(() => setRefreshing(false), 700);
  };

  const toggleAvailability = async (id, cur) => {
    try {
      await axiosInstance.patch(`/MenuItem/${id}/availability?isAvailable=${!cur}`);
      setItems(p => p.map(i => i.menuItemID === id ? { ...i, isAvailable: !cur } : i));
      showToast(`Item ${!cur ? "enabled" : "disabled"} successfully.`);
    } catch (err) {
      showToast("Failed: " + (err.response?.data || err.message), "err");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await axiosInstance.delete(`/MenuItem/${deleteTarget.menuItemID}`);
      setItems(p => p.filter(i => i.menuItemID !== deleteTarget.menuItemID));
      showToast(`"${deleteTarget.menuItemName}" deleted.`);
    } catch (err) {
      showToast("Delete failed: " + (err.response?.data || err.message), "err");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  /* ── Stats ── */
  const total     = items.length;
  const available = items.filter(i => i.isAvailable).length;
  const unavail   = total - available;
  const avgPrice  = total ? (items.reduce((s, i) => s + (i.menuItemPrice || 0), 0) / total) : 0;

  /* ── Sort options ── */
  const SORT_OPTS = [
    { key: "default",    label: "Default Order"    },
    { key: "price-asc",  label: "Price: Low → High"},
    { key: "price-desc", label: "Price: High → Low"},
    { key: "name",       label: "Name A → Z"       },
  ];

  /* ── Filter + sort ── */
  const filtered = items
    .filter(i => {
      const q = searchTerm.toLowerCase();
      const mQ = !q
        || i.menuItemName?.toLowerCase().includes(q)
        || i.restaurantName?.toLowerCase().includes(q)
        || i.categoryName?.toLowerCase().includes(q);
      const mA = filterAvail === "all"
        || (filterAvail === "available" && i.isAvailable)
        || (filterAvail === "unavailable" && !i.isAvailable);
      return mQ && mA;
    })
    .sort((a, b) => {
      if (sortBy === "price-asc")  return (a.menuItemPrice||0) - (b.menuItemPrice||0);
      if (sortBy === "price-desc") return (b.menuItemPrice||0) - (a.menuItemPrice||0);
      if (sortBy === "name")       return (a.menuItemName||"").localeCompare(b.menuItemName||"");
      return 0;
    });

  return (
    <>
      <style>{CSS}</style>
      <Toast toast={toast} />

      {deleteTarget && (
        <DeleteModal
          item={deleteTarget}
          onConfirm={confirmDelete}
          onClose={() => setDeleteTarget(null)}
          busy={deleting}
        />
      )}
      {viewTarget && (
        <DetailDrawer
          item={viewTarget}
          onClose={() => setViewTarget(null)}
          onToggle={toggleAvailability}
          onDelete={i => { setViewTarget(null); setDeleteTarget(i); }}
        />
      )}

      <div className="mi-root">

        {/* ══ HERO ══ */}
        <header className="mi-hero">
          <div className="mi-hero-blobs">
            <div className="mi-blob mi-blob1" />
            <div className="mi-blob mi-blob2" />
            <div className="mi-blob mi-blob3" />
          </div>
          <div className="mi-hero-dots" />

          <div className="mi-hero-left">
            <div className="mi-hero-eyebrow">
              <UtensilsCrossed size={11} /> Admin Console · Menu Monitoring
            </div>
            <h1 className="mi-hero-title">
              Menu <em>Items</em>
            </h1>
            <p className="mi-hero-desc">
              Monitor <strong>{total}</strong> food items across all restaurant menus
            </p>
          </div>

          <div className="mi-hero-right">
            <div className="mi-hero-stat">
              <span className="mi-hero-stat-num"><Counter to={total} /></span>
              <span className="mi-hero-stat-lbl">Total</span>
            </div>
            <div className="mi-hero-stat mi-hero-stat-green">
              <span className="mi-hero-stat-num"><Counter to={available} /></span>
              <span className="mi-hero-stat-lbl">Live</span>
            </div>
            <div className="mi-hero-stat mi-hero-stat-red">
              <span className="mi-hero-stat-num"><Counter to={unavail} /></span>
              <span className="mi-hero-stat-lbl">Off</span>
            </div>
            <button className={`mi-refresh-btn ${refreshing ? "mi-spinning" : ""}`} onClick={handleRefresh}>
              <RefreshCw size={14} />
            </button>
          </div>
        </header>

        {/* ══ STATS ROW ══ */}
        <div className="mi-stats">
          <StatCard icon={Coffee}     label="Total Items"  value={total}     color="#0f766e" bg="#f0fdfa" border="#99f6e4" sub="All restaurants"     delay="0ms"   />
          <StatCard icon={CheckCircle}label="Available"    value={available} color="#15803d" bg="#f0fdf4" border="#bbf7d0" sub="Live on menus"        delay="60ms"  />
          <StatCard icon={XCircle}    label="Unavailable"  value={unavail}   color="#dc2626" bg="#fef2f2" border="#fecaca" sub="Hidden from orders"   delay="120ms" />
          <StatCard icon={Flame}      label="Avg Price (₹)"value={Math.round(avgPrice)} color="#d97706" bg="#fffbeb" border="#fde68a" sub="Across all items"  delay="180ms" />
        </div>

        {/* ══ TOOLBAR ══ */}
        <div className="mi-toolbar">
          {/* Search */}
          <div className="mi-search-wrap">
            <Search size={13} className="mi-search-ico" />
            <input
              className="mi-search"
              placeholder="Search items, restaurants, categories…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="mi-search-clr" onClick={() => setSearchTerm("")}>
                <X size={11} />
              </button>
            )}
          </div>

          {/* Availability filter */}
          <div className="mi-filter-tabs">
            {[
              { k: "all",         l: "All",       c: total     },
              { k: "available",   l: "Available", c: available },
              { k: "unavailable", l: "Off Menu",  c: unavail   },
            ].map(t => (
              <button
                key={t.k}
                className={`mi-ftab ${filterAvail === t.k ? "mi-ftab-on" : ""}`}
                onClick={() => setFilterAvail(t.k)}
              >
                {t.l}
                <span className={`mi-ftab-n ${filterAvail === t.k ? "mi-ftab-n-on" : ""}`}>{t.c}</span>
              </button>
            ))}
          </div>

          {/* Sort — z-index isolated */}
          <div className="mi-sort-wrap" ref={sortRef}>
            <button className={`mi-sort-btn ${sortOpen ? "mi-sort-open" : ""}`} onClick={() => setSortOpen(v => !v)}>
              <BarChart2 size={12} />
              <span>{SORT_OPTS.find(o => o.key === sortBy)?.label}</span>
              <ChevronDown size={11} className={`mi-chevron ${sortOpen ? "mi-chevron-up" : ""}`} />
            </button>
            {sortOpen && (
              <div className="mi-sort-menu">
                <p className="mi-sort-hdr">Sort By</p>
                {SORT_OPTS.map(o => (
                  <button
                    key={o.key}
                    className={`mi-sort-item ${sortBy === o.key ? "mi-sort-on" : ""}`}
                    onClick={() => { setSortBy(o.key); setSortOpen(false); }}
                  >
                    <span className="mi-sort-tick">{sortBy === o.key && <Check size={10} />}</span>
                    {o.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Count */}
          {!loading && (
            <span className="mi-result-count">
              <strong>{filtered.length}</strong> / {total}
            </span>
          )}
        </div>

        {/* ══ CONTENT ══ */}
        <div className="mi-content">
          {loading ? (
            <div className="mi-loading">
              <div className="mi-loader" />
              <p>Loading menu items…</p>
            </div>
          ) : error ? (
            <div className="mi-state mi-state-err">
              <AlertCircle size={36} />
              <h3>Failed to load</h3>
              <p>{error}</p>
              <button className="mi-state-btn" onClick={fetchItems}>Retry</button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="mi-state">
              <span className="mi-state-emoji">🍽</span>
              <h3>No items found</h3>
              <p>{searchTerm ? `Nothing matches "${searchTerm}"` : "Try a different filter."}</p>
              {searchTerm && <button className="mi-state-btn" onClick={() => setSearchTerm("")}>Clear Search</button>}
            </div>
          ) : (
            <>
              <div className="mi-grid-label">
                <span>Menu Items</span>
                <span className="mi-grid-count">{filtered.length}</span>
              </div>
              <div className="mi-grid">
                {filtered.map((item, i) => (
                  <MenuCard
                    key={item.menuItemID}
                    item={item}
                    idx={i}
                    onView={setViewTarget}
                    onToggle={toggleAvailability}
                    onDelete={setDeleteTarget}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!loading && filtered.length > 0 && (
          <div className="mi-footer">
            {filtered.length} item{filtered.length !== 1 ? "s" : ""} shown
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

.mi-root *,.mi-root *::before,.mi-root *::after{box-sizing:border-box;margin:0;padding:0}
.mi-root{
  --bg:#faf8f5;
  --surf:#ffffff;
  --surf2:#f5f2ed;
  --surf3:#ede9e2;
  --bdr:#e5e0d8;
  --bdr2:#d4cfc6;
  --ink:#1c1917;
  --ink2:#44403c;
  --ink3:#78716c;
  --ink4:#a8a29e;
  --teal:#0f766e;
  --teal-lt:#ccfbf1;
  --amber:#d97706;
  --green:#15803d;
  --green-lt:#f0fdf4;
  --rose:#dc2626;
  --rose-lt:#fef2f2;
  --indigo:#4f46e5;
  --sh:0 1px 3px rgba(28,25,23,.05),0 4px 14px rgba(28,25,23,.07);
  --sh-h:0 6px 22px rgba(28,25,23,.11),0 22px 52px rgba(28,25,23,.1);
  font-family:'Plus Jakarta Sans',system-ui,sans-serif;
  background:var(--bg);
  min-height:100vh;
  color:var(--ink);
}

/* KEYFRAMES */
@keyframes mi-in{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes mi-card-in{from{opacity:0;transform:translateY(22px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes mi-fade{from{opacity:0}to{opacity:1}}
@keyframes mi-spin{to{transform:rotate(360deg)}}
@keyframes mi-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.45;transform:scale(1.6)}}
@keyframes mi-toast{from{opacity:0;transform:translateX(-50%) translateY(14px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
@keyframes mi-modal{from{opacity:0;transform:scale(.92) translateY(18px)}to{opacity:1;transform:scale(1) translateY(0)}}
@keyframes mi-slide{from{opacity:0;transform:translateX(34px)}to{opacity:1;transform:translateX(0)}}
@keyframes mi-blob{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(18px,-12px) scale(1.06)}}
@keyframes mi-shimmer{from{background-position:200% 0}to{background-position:-200% 0}}

/* TOAST */
.mi-toast{
  position:fixed;bottom:22px;left:50%;transform:translateX(-50%);z-index:9999;
  display:flex;align-items:center;gap:8px;padding:10px 20px;background:#fff;
  border-radius:50px;font-size:12.5px;font-weight:700;
  box-shadow:0 6px 28px rgba(28,25,23,.14);white-space:nowrap;
  animation:mi-toast .28s cubic-bezier(.22,1,.36,1);
}
.mi-toast-ok{border:1.5px solid #a7f3d0;color:#065f46}
.mi-toast-err{border:1.5px solid #fca5a5;color:#991b1b}

/* ══ HERO ══ */
.mi-hero{
  position:relative;padding:46px 32px 40px;overflow:hidden;
  background:linear-gradient(135deg,#fdf8f0 0%,#f0fdf9 48%,#fafbff 100%);
  border-bottom:1.5px solid var(--bdr);
  display:flex;align-items:center;justify-content:space-between;gap:18px;flex-wrap:wrap;
}
.mi-hero-blobs{position:absolute;inset:0;pointer-events:none;overflow:hidden}
.mi-blob{position:absolute;border-radius:50%;filter:blur(72px);animation:mi-blob 16s ease-in-out infinite}
.mi-blob1{width:320px;height:320px;background:rgba(217,119,6,.07);top:-90px;left:-50px;animation-delay:0s}
.mi-blob2{width:250px;height:250px;background:rgba(15,118,110,.06);top:10px;right:70px;animation-delay:-5s}
.mi-blob3{width:180px;height:180px;background:rgba(21,128,61,.05);bottom:-40px;left:40%;animation-delay:-10s}
.mi-hero-dots{
  position:absolute;inset:0;pointer-events:none;
  background-image:radial-gradient(circle,rgba(28,25,23,.05) 1px,transparent 1px);
  background-size:20px 20px;
  mask-image:radial-gradient(ellipse at 68% 50%,black 0%,transparent 62%);
}
.mi-hero-left{position:relative;z-index:1}
.mi-hero-eyebrow{
  display:inline-flex;align-items:center;gap:6px;
  font-size:11px;font-weight:700;color:var(--ink3);letter-spacing:.08em;text-transform:uppercase;
  background:rgba(255,255,255,.8);border:1px solid var(--bdr);
  padding:4px 12px;border-radius:50px;margin-bottom:14px;
}
.mi-hero-title{
  font-family:'Fraunces',serif;font-size:clamp(36px,5vw,60px);
  font-weight:900;color:var(--ink);line-height:.92;letter-spacing:-.025em;margin-bottom:11px;
  animation:mi-in .55s cubic-bezier(.22,1,.36,1);
}
.mi-hero-title em{
  font-style:italic;font-weight:800;
  background:linear-gradient(135deg,var(--amber),var(--teal));
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
}
.mi-hero-desc{font-size:13.5px;color:var(--ink3);animation:mi-fade .7s .18s both}
.mi-hero-desc strong{color:var(--ink);font-weight:700}
.mi-hero-right{position:relative;z-index:1;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.mi-hero-stat{
  display:flex;flex-direction:column;align-items:center;
  background:rgba(255,255,255,.82);border:1.5px solid var(--bdr);border-radius:14px;
  padding:10px 18px;min-width:64px;backdrop-filter:blur(4px);
}
.mi-hero-stat-green{border-color:#a7f3d0;background:#f0fdf4}
.mi-hero-stat-red{border-color:#fca5a5;background:#fef2f2}
.mi-hero-stat-num{font-family:'Fraunces',serif;font-size:26px;font-weight:800;color:var(--ink);line-height:1;letter-spacing:-.03em}
.mi-hero-stat-lbl{font-size:10px;font-weight:700;color:var(--ink4);text-transform:uppercase;letter-spacing:.07em;margin-top:2px}
.mi-refresh-btn{
  width:38px;height:38px;border-radius:11px;border:1.5px solid var(--bdr2);
  background:#fff;color:var(--ink3);display:flex;align-items:center;justify-content:center;
  cursor:pointer;transition:all .18s;box-shadow:var(--sh);
}
.mi-refresh-btn:hover{border-color:var(--teal);color:var(--teal);background:#f0fdfa}
.mi-spinning svg{animation:mi-spin .7s linear infinite}

/* ══ STATS ══ */
.mi-stats{
  display:grid;grid-template-columns:repeat(auto-fill,minmax(185px,1fr));
  gap:14px;padding:22px 28px;border-bottom:1.5px solid var(--bdr);background:var(--bg);
}
.mi-stat{
  background:var(--surf);border:1.5px solid var(--sbd,var(--bdr));border-radius:16px;
  padding:17px 18px;display:flex;align-items:center;gap:13px;
  box-shadow:var(--sh);transition:all .22s;
  animation:mi-in .5s cubic-bezier(.22,1,.36,1) both;position:relative;overflow:hidden;
}
.mi-stat::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--sc);border-radius:16px 16px 0 0}
.mi-stat:hover{transform:translateY(-3px);box-shadow:var(--sh-h)}
.mi-stat-icon{width:40px;height:40px;border-radius:10px;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:var(--sb);color:var(--sc)}
.mi-stat-val{font-family:'Fraunces',serif;font-size:28px;font-weight:800;color:var(--ink);line-height:1;letter-spacing:-.03em}
.mi-stat-label{font-size:11.5px;font-weight:600;color:var(--ink3);margin-top:2px}
.mi-stat-sub{font-size:10.5px;color:var(--ink4);margin-top:2px}

/* ══ TOOLBAR ══ */
.mi-toolbar{
  display:flex;align-items:center;gap:10px;padding:14px 28px;
  background:var(--surf);border-bottom:1.5px solid var(--bdr);flex-wrap:wrap;
  position:sticky;top:0;z-index:500;
}
.mi-search-wrap{position:relative;flex:1;min-width:200px;max-width:340px}
.mi-search-ico{position:absolute;left:11px;top:50%;transform:translateY(-50%);color:var(--ink4);pointer-events:none}
.mi-search{
  width:100%;padding:9px 34px;background:var(--surf2);border:1.5px solid var(--bdr);
  border-radius:10px;font-family:inherit;font-size:13px;color:var(--ink);outline:none;transition:all .15s;
}
.mi-search::placeholder{color:var(--ink4)}
.mi-search:focus{border-color:var(--teal);background:#fff;box-shadow:0 0 0 3px rgba(15,118,110,.08)}
.mi-search-clr{position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--ink4);cursor:pointer;display:flex;align-items:center}

/* Filter tabs */
.mi-filter-tabs{display:flex;gap:3px;background:var(--surf2);border:1.5px solid var(--bdr);border-radius:10px;padding:3px}
.mi-ftab{
  padding:7px 13px;border-radius:7px;border:none;background:transparent;
  font-family:inherit;font-size:12px;font-weight:600;color:var(--ink3);
  cursor:pointer;transition:all .15s;white-space:nowrap;display:flex;align-items:center;gap:5px;
}
.mi-ftab:hover{color:var(--ink)}
.mi-ftab-on{background:#fff!important;color:var(--ink)!important;box-shadow:0 1px 4px rgba(28,25,23,.1)}
.mi-ftab-n{font-size:10px;font-weight:800;background:var(--surf3);color:var(--ink4);padding:1px 6px;border-radius:50px}
.mi-ftab-n-on{background:rgba(15,118,110,.12);color:var(--teal)}

/* Sort — isolated z-index */
.mi-sort-wrap{position:relative;z-index:9999;flex-shrink:0}
.mi-sort-btn{
  display:flex;align-items:center;gap:6px;padding:9px 14px;
  background:var(--surf2);border:1.5px solid var(--bdr);border-radius:10px;
  font-family:inherit;font-size:12.5px;font-weight:600;color:var(--ink2);
  cursor:pointer;white-space:nowrap;transition:all .15s;
}
.mi-sort-btn:hover,.mi-sort-open{border-color:var(--teal);color:var(--teal);background:#f0fdfa}
.mi-chevron{transition:transform .2s}
.mi-chevron-up{transform:rotate(180deg)}
.mi-sort-menu{
  position:absolute;top:calc(100% + 8px);right:0;
  background:#fff;border:1.5px solid var(--bdr);border-radius:14px;
  padding:6px;box-shadow:0 12px 40px rgba(28,25,23,.13);
  min-width:190px;animation:mi-in .18s cubic-bezier(.22,1,.36,1);
}
.mi-sort-hdr{font-size:10px;font-weight:700;color:var(--ink4);text-transform:uppercase;letter-spacing:.09em;padding:6px 10px 5px}
.mi-sort-item{
  width:100%;display:flex;align-items:center;gap:8px;padding:9px 10px;
  border:none;background:transparent;font-family:inherit;font-size:13px;font-weight:500;
  color:var(--ink2);cursor:pointer;border-radius:8px;transition:background .12s;text-align:left;
}
.mi-sort-item:hover{background:var(--surf2);color:var(--ink)}
.mi-sort-on{color:var(--teal)!important;font-weight:700}
.mi-sort-tick{width:18px;display:flex;align-items:center;justify-content:center;color:var(--teal)}
.mi-result-count{font-size:12px;color:var(--ink4);font-weight:500;white-space:nowrap;margin-left:auto}
.mi-result-count strong{color:var(--ink2);font-weight:700}

/* ══ CONTENT ══ */
.mi-content{padding:26px 28px 60px;background:var(--bg)}
.mi-grid-label{
  display:flex;align-items:center;gap:10px;margin-bottom:20px;
  font-size:11px;font-weight:700;color:var(--ink4);text-transform:uppercase;letter-spacing:.1em;
}
.mi-grid-count{
  width:22px;height:22px;border-radius:50%;background:var(--surf3);
  display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;color:var(--ink3);
}

/* ══ CARD GRID ══ */
.mi-grid{
  display:grid;
  grid-template-columns:repeat(auto-fill,minmax(256px,1fr));
  gap:18px;
  position:relative;z-index:0;
}

/* ══ MENU CARD ══ */
.mi-card{
  background:var(--surf);border:1.5px solid var(--bdr);border-radius:20px;
  overflow:visible;display:flex;flex-direction:column;
  box-shadow:var(--sh);
  transition:transform .28s cubic-bezier(.22,1,.36,1),box-shadow .28s,border-color .28s;
  animation:mi-card-in .5s cubic-bezier(.22,1,.36,1) both;
  animation-delay:calc(var(--i,0) * 42ms);
}
.mi-card-hov{transform:translateY(-6px);box-shadow:var(--sh-h);border-color:rgba(15,118,110,.3)}

/* Image */
.mi-card-img-wrap{
  position:relative;height:185px;overflow:hidden;
  border-radius:18px 18px 0 0;flex-shrink:0;
}
.mi-card-img{width:100%;height:100%;object-fit:cover;transition:transform .65s ease}
.mi-card-hov .mi-card-img{transform:scale(1.08)}
.mi-card-img-shade{
  position:absolute;inset:0;
  background:linear-gradient(to top,rgba(28,25,23,.72) 0%,rgba(28,25,23,.08) 50%,transparent 100%);
}

/* Availability badge */
.mi-avail-badge{
  position:absolute;top:11px;left:11px;
  display:inline-flex;align-items:center;gap:5px;
  padding:3px 9px;border-radius:50px;font-size:10px;font-weight:700;backdrop-filter:blur(10px);
}
.mi-avail-open{background:rgba(21,128,61,.16);border:1px solid rgba(21,128,61,.35);color:#d1fae5}
.mi-avail-closed{background:rgba(220,38,38,.14);border:1px solid rgba(220,38,38,.32);color:#fee2e2}
.mi-avail-dot{width:5px;height:5px;border-radius:50%;background:currentColor;flex-shrink:0}
.mi-avail-open .mi-avail-dot{animation:mi-pulse 2.2s ease infinite}

/* Price badge */
.mi-price-badge{
  position:absolute;bottom:11px;right:11px;
  font-family:'Fraunces',serif;font-size:16px;font-weight:800;
  color:#fff;text-shadow:0 1px 4px rgba(0,0,0,.4);
  background:rgba(15,118,110,.85);backdrop-filter:blur(8px);
  padding:4px 10px;border-radius:9px;border:1px solid rgba(255,255,255,.2);
}

/* Hover overlay */
.mi-card-overlay{
  position:absolute;inset:0;border-radius:18px 18px 0 0;
  background:rgba(15,118,110,.72);backdrop-filter:blur(4px);
  display:flex;align-items:center;justify-content:center;gap:10px;
  opacity:0;transition:opacity .22s;
}
.mi-card-overlay-on{opacity:1}
.mi-ov-btn{
  display:flex;align-items:center;gap:6px;padding:9px 16px;border-radius:10px;
  font-family:inherit;font-size:12.5px;font-weight:700;cursor:pointer;
  border:none;transition:all .15s;
}
.mi-ov-btn{background:rgba(255,255,255,.95);color:var(--teal)}
.mi-ov-btn:hover{background:#fff;transform:scale(1.04)}
.mi-ov-enable{background:rgba(209,250,229,.92);color:#065f46}
.mi-ov-disable{background:rgba(254,226,226,.92);color:#991b1b}

/* Card body */
.mi-card-body{padding:14px 16px 16px;flex:1;display:flex;flex-direction:column;gap:10px}
.mi-card-top{display:flex;align-items:center;justify-content:space-between}
.mi-cat-pill{
  display:inline-flex;align-items:center;gap:4px;
  padding:4px 9px;border-radius:6px;
  background:var(--surf2);border:1px solid var(--bdr);
  font-size:11px;font-weight:600;color:var(--ink3);
  max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
}
.mi-del-btn{
  width:28px;height:28px;border-radius:8px;border:1.5px solid var(--bdr);
  background:transparent;color:var(--ink4);display:flex;align-items:center;justify-content:center;
  cursor:pointer;transition:all .15s;
}
.mi-del-btn:hover{border-color:#fca5a5;color:var(--rose);background:var(--rose-lt)}

.mi-card-name{
  font-family:'Fraunces',serif;font-size:16px;font-weight:700;color:var(--ink);
  line-height:1.25;
}
.mi-card-hov .mi-card-name{color:var(--teal)}
.mi-card-restaurant{display:flex;align-items:center;gap:5px;font-size:12px;font-weight:500;color:var(--ink3)}

/* Footer */
.mi-card-footer{display:flex;align-items:center;gap:7px;margin-top:auto;padding-top:10px;border-top:1px solid var(--bdr)}
.mi-toggle-btn{
  flex:1;padding:8px;border-radius:9px;font-family:inherit;font-size:12px;font-weight:700;
  cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;
  transition:all .18s;border:1.5px solid transparent;
}
.mi-toggle-on{background:#f0fdf4;color:#065f46;border-color:#a7f3d0}
.mi-toggle-on:hover{background:#bbf7d0}
.mi-toggle-off{background:#fef2f2;color:#991b1b;border-color:#fecaca}
.mi-toggle-off:hover{background:#fca5a5}
.mi-toggle-btn:disabled{opacity:.55;cursor:not-allowed}
.mi-view-btn{
  width:34px;height:34px;border-radius:9px;border:1.5px solid var(--bdr);
  background:var(--surf);color:var(--ink3);display:flex;align-items:center;justify-content:center;
  cursor:pointer;flex-shrink:0;transition:all .15s;
}
.mi-view-btn:hover{border-color:var(--teal);color:var(--teal);background:#f0fdfa}

/* ══ LOADING / STATE ══ */
.mi-loading{
  padding:80px 20px;display:flex;flex-direction:column;align-items:center;gap:14px;
  color:var(--ink3);font-size:13.5px;font-weight:600;
}
.mi-loader{
  width:42px;height:42px;border-radius:50%;
  border:3px solid var(--surf3);border-top-color:var(--teal);
  animation:mi-spin .8s linear infinite;
}
.mi-state{
  padding:80px 20px;text-align:center;
  display:flex;flex-direction:column;align-items:center;gap:12px;color:var(--ink4);
}
.mi-state-emoji{font-size:52px;filter:grayscale(.3)}
.mi-state h3{font-family:'Fraunces',serif;font-size:20px;font-weight:700;color:var(--ink2)}
.mi-state p{font-size:13.5px;color:var(--ink3)}
.mi-state-err{color:var(--rose)}
.mi-state-err h3{color:#991b1b}
.mi-state-btn{
  margin-top:4px;padding:9px 22px;border-radius:10px;
  border:1.5px solid var(--bdr2);background:var(--surf);
  color:var(--ink2);font-family:inherit;font-size:12.5px;font-weight:700;
  cursor:pointer;transition:all .15s;box-shadow:var(--sh);
}
.mi-state-btn:hover{border-color:var(--teal);color:var(--teal);background:#f0fdfa}

/* ══ FOOTER ══ */
.mi-footer{
  padding:12px 28px;font-size:11.5px;color:var(--ink4);text-align:right;
  border-top:1px solid var(--bdr);background:var(--surf2);
}

/* ══ DETAIL DRAWER ══ */
.mi-drawer-bg{position:fixed;inset:0;z-index:800;background:rgba(28,25,23,.42);backdrop-filter:blur(7px);display:flex;justify-content:flex-end}
.mi-drawer{
  width:100%;max-width:450px;height:100%;background:#fff;
  box-shadow:-10px 0 52px rgba(28,25,23,.14);overflow-y:auto;
  animation:mi-slide .3s cubic-bezier(.22,1,.36,1);
  border-left:1.5px solid var(--bdr);display:flex;flex-direction:column;
}
.mi-drawer-x{position:absolute;top:14px;right:14px;width:32px;height:32px;border-radius:50%;border:1.5px solid rgba(255,255,255,.3);background:rgba(255,255,255,.2);backdrop-filter:blur(6px);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:10;transition:all .15s}
.mi-drawer-x:hover{background:rgba(255,255,255,.35);border-color:rgba(255,255,255,.5)}
.mi-drawer-hero{position:relative;height:240px;flex-shrink:0}
.mi-drawer-hero img{width:100%;height:100%;object-fit:cover}
.mi-drawer-shade{position:absolute;inset:0;background:linear-gradient(to top,rgba(28,25,23,.95) 0%,rgba(28,25,23,.3) 50%,transparent 100%)}
.mi-drawer-hero-info{position:absolute;bottom:20px;left:20px;right:20px}
.mi-drawer-title{font-family:'Fraunces',serif;font-size:26px;font-weight:800;color:#fff;line-height:1.1;margin:8px 0 6px}
.mi-drawer-price-hero{font-family:'Fraunces',serif;font-size:22px;font-weight:800;color:#fff;opacity:.9}
.mi-drawer-avail{
  display:inline-flex;align-items:center;gap:5px;padding:3px 10px;
  border-radius:50px;font-size:10px;font-weight:700;
}
.mi-drawer-body{padding:22px 22px 40px;flex:1;display:flex;flex-direction:column;gap:18px}
.mi-drawer-fields{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.mi-dfield{background:var(--surf2);border:1.5px solid var(--bdr);border-radius:12px;padding:12px}
.mi-dfield-lbl{display:flex;align-items:center;gap:5px;font-size:10px;font-weight:700;color:var(--ink4);text-transform:uppercase;letter-spacing:.07em;margin-bottom:5px}
.mi-dfield-val{font-size:14px;font-weight:600;color:var(--ink);word-break:break-word}
.mi-price-val{font-family:'Fraunces',serif;font-size:18px;font-weight:800;color:var(--teal)}
.mi-mono{font-family:monospace;font-size:13px}
.mi-drawer-desc{background:var(--surf2);border:1.5px solid var(--bdr);border-radius:12px;padding:14px}
.mi-drawer-desc-lbl{display:block;font-size:10px;font-weight:700;color:var(--ink4);text-transform:uppercase;letter-spacing:.07em;margin-bottom:7px}
.mi-drawer-desc p{font-size:13.5px;color:var(--ink3);line-height:1.65}
.mi-drawer-actions{display:flex;flex-direction:column;gap:8px;margin-top:auto}
.mi-daction{width:100%;padding:13px;border-radius:12px;font-family:inherit;font-size:13.5px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:all .18s;border:1.5px solid transparent}
.mi-dact-enable{background:#f0fdf4;color:#065f46;border-color:#a7f3d0}
.mi-dact-enable:hover{background:#bbf7d0}
.mi-dact-disable{background:#fef2f2;color:#991b1b;border-color:#fecaca}
.mi-dact-disable:hover{background:#fca5a5}
.mi-dact-del{background:var(--surf2);color:var(--ink3);border-color:var(--bdr2)}
.mi-dact-del:hover{color:var(--rose);border-color:#fca5a5;background:var(--rose-lt)}

/* ══ DELETE MODAL ══ */
.mi-overlay{position:fixed;inset:0;z-index:1000;background:rgba(28,25,23,.45);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:20px}
.mi-modal{background:#fff;border:1.5px solid var(--bdr);border-radius:22px;padding:30px 26px 24px;width:100%;max-width:410px;position:relative;box-shadow:0 22px 64px rgba(28,25,23,.18);animation:mi-modal .28s cubic-bezier(.22,1,.36,1)}
.mi-modal-x{position:absolute;top:13px;right:13px;width:27px;height:27px;border-radius:50%;border:1.5px solid var(--bdr);background:var(--surf2);color:var(--ink3);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .14s}
.mi-modal-x:hover{background:var(--rose-lt);color:var(--rose)}
.mi-modal-icon{width:56px;height:56px;border-radius:15px;background:var(--rose-lt);display:flex;align-items:center;justify-content:center;color:var(--rose);margin:0 auto 16px;box-shadow:0 4px 14px rgba(220,38,38,.14)}
.mi-modal-title{font-family:'Fraunces',serif;font-size:22px;font-weight:800;color:var(--ink);text-align:center;margin-bottom:9px}
.mi-modal-body{font-size:13.5px;color:var(--ink3);text-align:center;line-height:1.7;margin-bottom:22px}
.mi-modal-body strong{color:var(--ink)}
.mi-modal-btns{display:flex;gap:10px}
.mi-mbtn-ghost{flex:1;padding:11px;border-radius:11px;border:1.5px solid var(--bdr2);background:transparent;font-family:inherit;font-size:13px;font-weight:700;color:var(--ink2);cursor:pointer;transition:all .15s}
.mi-mbtn-ghost:hover{background:var(--surf2)}
.mi-mbtn-ghost:disabled{opacity:.4;cursor:not-allowed}
.mi-mbtn-danger{flex:1;padding:11px;border-radius:11px;border:none;background:linear-gradient(135deg,#ef4444,#dc2626);font-family:inherit;font-size:13px;font-weight:800;color:#fff;cursor:pointer;box-shadow:0 3px 14px rgba(220,38,38,.26);transition:all .18s;display:flex;align-items:center;justify-content:center;gap:6px}
.mi-mbtn-danger:hover{transform:translateY(-1px);box-shadow:0 5px 20px rgba(220,38,38,.34)}
.mi-mbtn-danger:disabled{opacity:.5;cursor:not-allowed;transform:none}
.mi-spin{width:12px;height:12px;border-radius:50%;border:2px solid rgba(28,25,23,.15);border-top-color:var(--ink2);animation:mi-spin .7s linear infinite;display:inline-block;flex-shrink:0}
.mi-spin-sm{width:10px;height:10px;border-color:rgba(255,255,255,.3);border-top-color:currentColor}

@media(max-width:640px){
  .mi-hero{padding:26px 16px 22px}
  .mi-stats{padding:14px 16px;grid-template-columns:1fr 1fr}
  .mi-toolbar{padding:12px 16px}
  .mi-content{padding:16px 14px 50px}
  .mi-grid{grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px}
  .mi-drawer{max-width:100%}
  .mi-modal-btns{flex-direction:column}
  .mi-drawer-fields{grid-template-columns:1fr}
}
`;