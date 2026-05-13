import React, { useEffect, useState, useRef } from "react";
import {
  Store, Search, Trash2, CheckCircle, XCircle, MapPin,
  Star, AlertCircle, Users, Eye, RefreshCw, ChevronDown,
  X, BarChart2, MoreHorizontal, Check,
  Activity, Flame, Crown, Shield,
} from "lucide-react";
import axiosInstance from "../../api/axiosInstance";

const pct = (a, b) => (b === 0 ? 0 : Math.round((a / b) * 100));

const Counter = ({ value, duration = 1100 }) => {
  const [display, setDisplay] = useState(0);
  const target = parseInt(value) || 0;
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setDisplay(target); clearInterval(timer); }
      else setDisplay(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return <span>{display}</span>;
};

const StatCard = ({ icon: Icon, label, value, sub, accent, textAccent, delay }) => (
  <div className="rx-stat" style={{ "--accent": accent, "--text-accent": textAccent, animationDelay: delay }}>
    <div className="rx-stat-top">
      <div className="rx-stat-icon"><Icon size={17} /></div>
      <span className="rx-stat-sub">{sub}</span>
    </div>
    <div className="rx-stat-val"><Counter value={value} /></div>
    <div className="rx-stat-label">{label}</div>
    <div className="rx-stat-bar-track"><div className="rx-stat-bar-fill" /></div>
  </div>
);

const StatusBadge = ({ isOpen }) => (
  <span className={`rx-badge ${isOpen ? "rx-badge-open" : "rx-badge-closed"}`}>
    <span className="rx-badge-dot" />
    {isOpen ? "Open" : "Closed"}
  </span>
);

const RatingDisplay = ({ rating }) => {
  const val = rating || 0;
  const filled = Math.round(val);
  const color = val >= 4.5 ? "#d97706" : val >= 4 ? "#059669" : val >= 3 ? "#2563eb" : "#9ca3af";
  return (
    <div className="rx-rating">
      <div className="rx-stars">
        {[1,2,3,4,5].map(s => (
          <Star key={s} size={10} className={s <= filled ? "rx-star-on" : "rx-star-off"} />
        ))}
      </div>
      <div className="rx-rbar-track">
        <div className="rx-rbar-fill" style={{ width: `${(val/5)*100}%`, background: color }} />
      </div>
      <span className="rx-rbar-num" style={{ color }}>{val ? val.toFixed(1) : "New"}</span>
    </div>
  );
};

const RestaurantCard = ({ r, onToggle, onDelete, onView, idx, toggling }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const menuRef = useRef(null);
  useEffect(() => {
    const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const rating = r.rating || 0;
  const isElite = rating >= 4.5;
  const accentColor = rating >= 4.5 ? "#d97706" : rating >= 4 ? "#059669" : rating >= 3 ? "#2563eb" : "#94a3b8";
  const isToggling = toggling === r.restaurantID;
  return (
    <div
      className={`rx-card ${hovered ? "rx-card-hov" : ""}`}
      style={{ "--i": idx, "--accent": accentColor }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="rx-card-accent-line" />
      <div className="rx-card-img-wrap">
        <img src={r.imageUrl || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop&q=80"} alt={r.name} className="rx-card-img" loading="lazy" />
        <div className="rx-card-img-gradient" />
        <StatusBadge isOpen={r.isOpen} />
        {isElite && <div className="rx-card-elite"><Crown size={10} /> Elite</div>}
        <div className={`rx-card-overlay ${hovered ? "rx-card-overlay-show" : ""}`}>
          <button className="rx-ov-btn rx-ov-view" onClick={() => onView(r)}><Eye size={14} /> View</button>
          <button className={`rx-ov-btn ${r.isOpen ? "rx-ov-close" : "rx-ov-open"}`} onClick={() => onToggle(r.restaurantID, r.isOpen)} disabled={isToggling}>
            {isToggling ? <><span className="rx-spin-sm"/>Working…</> : r.isOpen ? <><XCircle size={14} /> Deactivate</> : <><CheckCircle size={14} /> Activate</>}
          </button>
        </div>
      </div>
      <div className="rx-card-body">
        <div className="rx-card-header">
          <span className="rx-card-num">#{String(idx + 1).padStart(2, "0")}</span>
          <div className="rx-card-menu-wrap" ref={menuRef}>
            <button className="rx-card-dots" onClick={() => setMenuOpen(v => !v)}><MoreHorizontal size={15} /></button>
            {menuOpen && (
              <div className="rx-dropdown">
                <button onClick={() => { onView(r); setMenuOpen(false); }}><Eye size={12} /> View Details</button>
                <button onClick={() => { onToggle(r.restaurantID, r.isOpen); setMenuOpen(false); }} disabled={isToggling}>
                  {r.isOpen ? <><XCircle size={12} /> Deactivate</> : <><CheckCircle size={12} /> Activate</>}
                </button>
                <div className="rx-drop-sep" />
                <button className="rx-drop-danger" onClick={() => { onDelete(r); setMenuOpen(false); }}><Trash2 size={12} /> Delete</button>
              </div>
            )}
          </div>
        </div>
        <h3 className="rx-card-name">{r.name}</h3>
        <div className="rx-card-meta">
          <span className="rx-meta-chip"><MapPin size={10} />{r.city || "—"}</span>
          <span className="rx-meta-chip"><Users size={10} />{r.userName || "—"}</span>
        </div>
        <RatingDisplay rating={r.rating} />
        <button className={`rx-toggle ${r.isOpen ? "rx-toggle-off" : "rx-toggle-on"}`} onClick={() => onToggle(r.restaurantID, r.isOpen)} disabled={isToggling}>
          {isToggling ? <><span className="rx-spin-sm"/>Working…</> : <><span className="rx-toggle-indicator" />{r.isOpen ? "Deactivate" : "Activate"}</>}
        </button>
      </div>
    </div>
  );
};

const ListRow = ({ r, onToggle, onDelete, onView, idx, toggling }) => {
  const rating = r.rating || 0;
  const accentColor = rating >= 4.5 ? "#d97706" : rating >= 4 ? "#059669" : rating >= 3 ? "#2563eb" : "#94a3b8";
  const isToggling = toggling === r.restaurantID;
  return (
    <div className="rx-row" style={{ "--i": idx, "--accent": accentColor }}>
      <div className="rx-row-stripe" />
      <div className="rx-row-img"><img src={r.imageUrl || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=120&h=120&fit=crop&q=80"} alt={r.name} /></div>
      <div className="rx-row-info">
        <div className="rx-row-name-wrap">
          <span className="rx-row-num">#{String(idx+1).padStart(2,"0")}</span>
          <h3 className="rx-row-name">{r.name}</h3>
          <StatusBadge isOpen={r.isOpen} />
          {(r.rating||0) >= 4.5 && <span className="rx-row-elite"><Crown size={9}/> Elite</span>}
        </div>
        <div className="rx-row-meta">
          <span><MapPin size={10}/>{r.city||"—"}</span>
          <span><Users size={10}/>{r.userName||"—"}</span>
          <span><Star size={10} style={{color:"#d97706",fill:"#d97706"}}/>{rating ? rating.toFixed(1) : "New"}</span>
        </div>
      </div>
      <div className="rx-row-rbar"><div className="rx-rbar-track"><div className="rx-rbar-fill" style={{width:`${(rating/5)*100}%`,background:accentColor}}/></div></div>
      <div className="rx-row-actions">
        <button className="rx-row-btn rx-row-view" onClick={() => onView(r)} title="View"><Eye size={13}/></button>
        <button className={`rx-row-btn ${r.isOpen ? "rx-row-close" : "rx-row-open"}`} onClick={() => onToggle(r.restaurantID, r.isOpen)} disabled={isToggling} title={r.isOpen ? "Deactivate" : "Activate"}>
          {isToggling ? <span className="rx-spin-sm"/> : r.isOpen ? <XCircle size={13}/> : <CheckCircle size={13}/>}
        </button>
        <button className="rx-row-btn rx-row-del" onClick={() => onDelete(r)} title="Delete"><Trash2 size={13}/></button>
      </div>
    </div>
  );
};

const DetailDrawer = ({ r, onClose, onToggle, onDelete, toggling }) => {
  if (!r) return null;
  const rating = r.rating || 0;
  const accentColor = rating >= 4.5 ? "#d97706" : rating >= 4 ? "#059669" : "#2563eb";
  const isToggling = toggling === r.restaurantID;
  return (
    <div className="rx-drawer-bg" onClick={onClose}>
      <div className="rx-drawer" onClick={e => e.stopPropagation()}>
        <button className="rx-drawer-x" onClick={onClose}><X size={15}/></button>
        <div className="rx-drawer-hero">
          <img src={r.imageUrl || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=300&fit=crop&q=80"} alt={r.name}/>
          <div className="rx-drawer-shade"/>
          <div className="rx-drawer-hero-info">
            <StatusBadge isOpen={r.isOpen}/>
            <h2 className="rx-drawer-title">{r.name}</h2>
            <p className="rx-drawer-city"><MapPin size={12}/>{r.city||"—"}</p>
          </div>
        </div>
        <div className="rx-drawer-body">
          <div className="rx-drawer-stats">
            <div className="rx-dstat">
              <span className="rx-dstat-val" style={{color: accentColor}}>{rating ? rating.toFixed(2) : "—"}</span>
              <span className="rx-dstat-lbl">Rating</span>
            </div>
            <div className="rx-dstat-div"/>
            <div className="rx-dstat">
              <span className="rx-dstat-val" style={{color: r.isOpen ? "#059669" : "#dc2626"}}>{r.isOpen ? "Active" : "Offline"}</span>
              <span className="rx-dstat-lbl">Status</span>
            </div>
            <div className="rx-dstat-div"/>
            <div className="rx-dstat">
              <span className="rx-dstat-val" style={{fontSize:"13px"}}>{r.userName||"—"}</span>
              <span className="rx-dstat-lbl">Owner</span>
            </div>
          </div>
          <div className="rx-drawer-rating-section">
            <div className="rx-drawer-rating-hdr">
              <span>Performance Score</span>
              <span style={{color: accentColor, fontWeight:700}}>{rating ? `${rating.toFixed(1)} / 5.0` : "No data"}</span>
            </div>
            <div className="rx-drawer-rbar-track">
              <div className="rx-drawer-rbar-fill" style={{width:`${(rating/5)*100}%`, background: `linear-gradient(90deg, ${accentColor}, ${accentColor}88)`}}/>
            </div>
            <div className="rx-drawer-tier">
              {rating >= 4.5 ? "🏆 Elite Tier" : rating >= 4 ? "✅ Top Performer" : rating >= 3 ? "📈 Average" : "⚠️ Needs Attention"}
            </div>
          </div>
          <div className="rx-drawer-actions">
            <button className={`rx-daction ${r.isOpen ? "rx-daction-deact" : "rx-daction-act"}`} onClick={() => onToggle(r.restaurantID, r.isOpen)} disabled={isToggling}>
              {isToggling ? <><span className="rx-spin-dot"/>Updating…</> : r.isOpen ? <><XCircle size={15}/>Deactivate Restaurant</> : <><CheckCircle size={15}/>Activate Restaurant</>}
            </button>
            <button className="rx-daction rx-daction-del" onClick={() => { onDelete(r); onClose(); }}><Trash2 size={15}/>Delete Restaurant</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DeleteModal = ({ name, onConfirm, onClose, busy }) => (
  <div className="rx-modal-bg" onClick={onClose}>
    <div className="rx-modal" onClick={e => e.stopPropagation()}>
      <button className="rx-modal-x" onClick={onClose}><X size={14}/></button>
      <div className="rx-modal-icon"><Trash2 size={22}/></div>
      <h2 className="rx-modal-title">Delete Restaurant?</h2>
      <p className="rx-modal-desc"><strong>"{name}"</strong> and all its menu data will be permanently removed. This cannot be undone.</p>
      <div className="rx-modal-actions">
        <button className="rx-modal-cancel" onClick={onClose} disabled={busy}>Keep it</button>
        <button className="rx-modal-confirm" onClick={onConfirm} disabled={busy}>
          {busy ? <><span className="rx-spin-dot"/>Deleting…</> : <><Trash2 size={13}/>Delete Forever</>}
        </button>
      </div>
    </div>
  </div>
);

const Skeleton = ({ i }) => (
  <div className="rx-skel" style={{ animationDelay: `${i * 60}ms` }}>
    <div className="rx-skel-img"/>
    <div className="rx-skel-body">
      <div className="rx-skel-line" style={{width:"55%"}}/>
      <div className="rx-skel-line" style={{width:"38%"}}/>
      <div className="rx-skel-line" style={{width:"70%"}}/>
      <div className="rx-skel-line" style={{width:"100%",height:"8px"}}/>
    </div>
  </div>
);

export default function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [refreshing, setRefreshing]   = useState(false);
  const [searchTerm, setSearchTerm]   = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy]           = useState("name");
  const [sortOpen, setSortOpen]       = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]       = useState(false);
  // KEY FIX: store ID not snapshot — drawer reads live data from restaurants array
  const [viewTargetId, setViewTargetId] = useState(null);
  const [toast, setToast]             = useState(null);
  const [viewMode, setViewMode]       = useState("grid");
  // KEY FIX: track which restaurant is currently being toggled to show spinner
  const [toggling, setToggling]       = useState(null);
  const sortRef = useRef(null);

  useEffect(() => {
    const h = (e) => { if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => { fetchRestaurants(); }, []);

  const showToast = (msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3600);
  };

  const fetchRestaurants = async () => {
    try {
      setLoading(true); setError("");
      const res = await axiosInstance.get("/Restaurant");
      setRestaurants(res.data);
    } catch (err) {
      setError(err.response?.data || err.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRestaurants();
    setTimeout(() => setRefreshing(false), 700);
  };

  // KEY FIX: optimistic update so drawer reflects the new state instantly;
  // toggling state prevents double-clicks and shows spinner on the button
  const toggleStatus = async (id, cur) => {
    if (toggling === id) return;
    setToggling(id);
    try {
      await axiosInstance.patch(`/Restaurant/${id}/status?isOpen=${!cur}`);
      setRestaurants(p => p.map(r => r.restaurantID === id ? { ...r, isOpen: !cur } : r));
      showToast(`Restaurant ${!cur ? "activated" : "deactivated"} successfully.`);
    } catch (err) {
      if (err.response?.status === 403) {
        showToast("Permission denied. You cannot change this restaurant's status.", "err");
      } else {
        const msg = err.response?.data;
        showToast("Failed: " + (typeof msg === "string" ? msg : err.message), "err");
      }
    } finally {
      setToggling(null);
    }
  };

  // KEY FIX: specific 403/404 error messages; closes drawer if deleted restaurant was open
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await axiosInstance.delete(`/Restaurant/${deleteTarget.restaurantID}`);
      setRestaurants(p => p.filter(r => r.restaurantID !== deleteTarget.restaurantID));
      if (viewTargetId === deleteTarget.restaurantID) setViewTargetId(null);
      showToast(`"${deleteTarget.name}" deleted.`);
    } catch (err) {
      if (err.response?.status === 403) {
        showToast("Permission denied. You cannot delete this restaurant.", "err");
      } else if (err.response?.status === 404) {
        setRestaurants(p => p.filter(r => r.restaurantID !== deleteTarget.restaurantID));
        showToast("Restaurant not found — may have already been deleted.", "err");
      } else {
        const msg = err.response?.data;
        showToast("Failed: " + (typeof msg === "string" ? msg : err.message), "err");
      }
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  // Derive live object from array so drawer always shows fresh isOpen state
  const viewTarget = viewTargetId
    ? restaurants.find(r => r.restaurantID === viewTargetId) ?? null
    : null;

  const total       = restaurants.length;
  const openCount   = restaurants.filter(r => r.isOpen).length;
  const closedCount = total - openCount;
  const topRated    = restaurants.filter(r => (r.rating||0) >= 4.5).length;

  const SORT_OPTIONS = [
    { key: "name",   label: "Name A → Z" },
    { key: "rating", label: "Top Rated First" },
    { key: "status", label: "Open First" },
  ];

  const filtered = restaurants
    .filter(r => {
      const q = searchTerm.toLowerCase();
      const mQ = !q || r.name?.toLowerCase().includes(q) || r.city?.toLowerCase().includes(q) || r.userName?.toLowerCase().includes(q);
      const mS = filterStatus === "all" || (filterStatus === "open" && r.isOpen) || (filterStatus === "closed" && !r.isOpen);
      return mQ && mS;
    })
    .sort((a, b) => {
      if (sortBy === "rating") return (b.rating||0) - (a.rating||0);
      if (sortBy === "status") return (b.isOpen?1:0) - (a.isOpen?1:0);
      return (a.name||"").localeCompare(b.name||"");
    });

  return (
    <>
      <style>{CSS}</style>

      {toast && (
        <div className={`rx-toast ${toast.type === "err" ? "rx-toast-err" : "rx-toast-ok"}`}>
          {toast.type === "err" ? <XCircle size={13}/> : <Check size={13}/>}
          {toast.msg}
        </div>
      )}

      {deleteTarget && (
        <DeleteModal name={deleteTarget.name} onConfirm={confirmDelete} onClose={() => setDeleteTarget(null)} busy={deleting}/>
      )}

      {/* viewTarget is live — always reflects latest isOpen from restaurants state */}
      {viewTarget && (
        <DetailDrawer
          r={viewTarget}
          onClose={() => setViewTargetId(null)}
          onToggle={toggleStatus}
          onDelete={r => { setViewTargetId(null); setDeleteTarget(r); }}
          toggling={toggling}
        />
      )}

      <div className="rx-root">
        <header className="rx-hero">
          <div className="rx-hero-blobs">
            <div className="rx-blob rx-blob1"/><div className="rx-blob rx-blob2"/><div className="rx-blob rx-blob3"/>
          </div>
          <div className="rx-hero-dots"/>
          <div className="rx-hero-left">
            <div className="rx-hero-eyebrow">
              <Activity size={11}/><span>Admin Console</span><span className="rx-hero-dot-sep">·</span><span>Restaurant Management</span>
            </div>
            <h1 className="rx-hero-title">Restaurant<span className="rx-hero-title-em"> Network</span></h1>
            <p className="rx-hero-sub">Oversee <strong>{total}</strong> partner restaurants across your platform</p>
          </div>
          <div className="rx-hero-right">
            <div className="rx-hero-pill rx-hero-pill-green"><span className="rx-live-dot"/>{openCount} Live</div>
            <div className="rx-hero-pill rx-hero-pill-amber"><Crown size={11}/>{topRated} Elite</div>
            <button className={`rx-sync-btn ${refreshing ? "rx-syncing" : ""}`} onClick={handleRefresh}>
              <RefreshCw size={14}/>Sync Data
            </button>
          </div>
        </header>

        <div className="rx-stats">
          <StatCard icon={Store}  label="Total Restaurants" value={total}       accent="#e0e7ff" textAccent="#4f46e5" sub={`${pct(openCount,total)}% active`} delay="0ms"/>
          <StatCard icon={Flame}  label="Currently Open"    value={openCount}   accent="#d1fae5" textAccent="#059669" sub="Serving orders now" delay="70ms"/>
          <StatCard icon={Shield} label="Offline"           value={closedCount} accent="#fee2e2" textAccent="#dc2626" sub="Temporarily closed" delay="140ms"/>
          <StatCard icon={Crown}  label="Elite (4.5★+)"     value={topRated}    accent="#fef3c7" textAccent="#d97706" sub="Top performers" delay="210ms"/>
        </div>

        <div className="rx-toolbar">
          <div className="rx-search-wrap">
            <Search size={14} className="rx-search-ico"/>
            <input className="rx-search" placeholder="Search name, city, owner…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/>
            {searchTerm && <button className="rx-search-clr" onClick={() => setSearchTerm("")}><X size={11}/></button>}
          </div>
          <div className="rx-filters">
            {[{k:"all",l:"All",c:total,color:""},{k:"open",l:"Open",c:openCount,color:"green"},{k:"closed",l:"Closed",c:closedCount,color:"red"}].map(t => (
              <button key={t.k} className={`rx-ftab rx-ftab-${t.color||"default"} ${filterStatus===t.k?"rx-ftab-on":""}`} onClick={() => setFilterStatus(t.k)}>
                {t.l}<span className="rx-ftab-badge">{t.c}</span>
              </button>
            ))}
          </div>
          <div className="rx-sort-wrap" ref={sortRef}>
            <button className={`rx-sort-btn ${sortOpen?"rx-sort-active":""}`} onClick={() => setSortOpen(v=>!v)}>
              <BarChart2 size={13}/><span>{SORT_OPTIONS.find(o=>o.key===sortBy)?.label}</span>
              <ChevronDown size={11} className={`rx-chevron ${sortOpen?"rx-chevron-up":""}`}/>
            </button>
            {sortOpen && (
              <div className="rx-sort-menu">
                <p className="rx-sort-hdr">Sort By</p>
                {SORT_OPTIONS.map(o => (
                  <button key={o.key} className={`rx-sort-item ${sortBy===o.key?"rx-sort-item-on":""}`} onClick={() => { setSortBy(o.key); setSortOpen(false); }}>
                    <span className="rx-sort-tick">{sortBy===o.key && <Check size={11}/>}</span>{o.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="rx-view-btns">
            <button className={`rx-vbtn ${viewMode==="grid"?"rx-vbtn-on":""}`} onClick={() => setViewMode("grid")} title="Grid">
              <span className="rx-grid-ico"><span/><span/><span/><span/></span>
            </button>
            <button className={`rx-vbtn ${viewMode==="list"?"rx-vbtn-on":""}`} onClick={() => setViewMode("list")} title="List">
              <span className="rx-list-ico"><span/><span/><span/></span>
            </button>
          </div>
          {!loading && <span className="rx-result-count"><strong>{filtered.length}</strong> of {total} shown</span>}
        </div>

        <div className="rx-content">
          {loading ? (
            <div className="rx-grid">{Array.from({length:8}).map((_,i) => <Skeleton key={i} i={i}/>)}</div>
          ) : error ? (
            <div className="rx-state rx-state-err"><AlertCircle size={36}/><h3>Something went wrong</h3><p>{error}</p><button className="rx-state-btn" onClick={fetchRestaurants}>Try Again</button></div>
          ) : filtered.length === 0 ? (
            <div className="rx-state"><Store size={44}/><h3>No Restaurants Found</h3><p>{searchTerm ? `No results for "${searchTerm}"` : "Adjust your filter."}</p>{searchTerm && <button className="rx-state-btn" onClick={() => setSearchTerm("")}>Clear Search</button>}</div>
          ) : viewMode === "grid" ? (
            <div className="rx-grid">
              {filtered.map((r, i) => (
                <RestaurantCard key={r.restaurantID} r={r} idx={i} toggling={toggling}
                  onToggle={toggleStatus} onDelete={r => setDeleteTarget(r)} onView={r => setViewTargetId(r.restaurantID)}/>
              ))}
            </div>
          ) : (
            <div className="rx-list">
              {filtered.map((r, i) => (
                <ListRow key={r.restaurantID} r={r} idx={i} toggling={toggling}
                  onToggle={toggleStatus} onDelete={r => setDeleteTarget(r)} onView={r => setViewTargetId(r.restaurantID)}/>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,600;0,700;0,800;0,900;1,700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
.rx-root *,.rx-root *::before,.rx-root *::after{box-sizing:border-box;margin:0;padding:0}
.rx-root{--bg:#faf8f5;--surf:#ffffff;--surf2:#f5f3ef;--surf3:#ede9e3;--bdr:#e8e2d9;--bdr2:#d5cfc5;--ink:#1c1917;--ink2:#44403c;--ink3:#78716c;--ink4:#a8a29e;--teal:#0f766e;--amber:#d97706;--amber-light:#fef3c7;--indigo:#4f46e5;--indigo-light:#e0e7ff;--rose:#dc2626;--rose-light:#fee2e2;--green:#059669;--green-light:#d1fae5;--sh:0 1px 3px rgba(28,25,23,.06),0 4px 16px rgba(28,25,23,.08);--sh-h:0 4px 12px rgba(28,25,23,.1),0 16px 40px rgba(28,25,23,.12);font-family:'Plus Jakarta Sans',system-ui,sans-serif;background:var(--bg);min-height:100vh;color:var(--ink)}
@keyframes rx-in{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes rx-fade{from{opacity:0}to{opacity:1}}
@keyframes rx-spin{to{transform:rotate(360deg)}}
@keyframes rx-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(1.5)}}
@keyframes rx-shimmer{from{background-position:200% 0}to{background-position:-200% 0}}
@keyframes rx-toast{from{opacity:0;transform:translateX(-50%) translateY(14px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
@keyframes rx-modal{from{opacity:0;transform:scale(.93) translateY(18px)}to{opacity:1;transform:scale(1) translateY(0)}}
@keyframes rx-slide{from{opacity:0;transform:translateX(36px)}to{opacity:1;transform:translateX(0)}}
@keyframes rx-blob{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(25px,-18px) scale(1.06)}66%{transform:translate(-15px,12px) scale(.96)}}
@keyframes rx-bar-in{from{width:0}}
.rx-toast{position:fixed;bottom:22px;left:50%;transform:translateX(-50%);z-index:9999;display:flex;align-items:center;gap:8px;padding:10px 20px;background:#fff;border-radius:50px;font-size:12.5px;font-weight:600;box-shadow:0 6px 28px rgba(28,25,23,.16);white-space:nowrap;animation:rx-toast .28s cubic-bezier(.22,1,.36,1)}
.rx-toast-ok{border:1.5px solid #a7f3d0;color:#065f46}
.rx-toast-err{border:1.5px solid #fca5a5;color:#991b1b}
.rx-hero{position:relative;padding:44px 32px 36px;overflow:hidden;background:linear-gradient(135deg,#fdf8f0 0%,#f0fdf4 50%,#eff6ff 100%);border-bottom:1px solid var(--bdr);display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap}
.rx-hero-blobs{position:absolute;inset:0;pointer-events:none;overflow:hidden}
.rx-blob{position:absolute;border-radius:50%;filter:blur(70px);animation:rx-blob 15s ease-in-out infinite}
.rx-blob1{width:320px;height:320px;background:rgba(217,119,6,.08);top:-100px;left:-60px}
.rx-blob2{width:260px;height:260px;background:rgba(5,150,105,.07);top:0;right:50px;animation-delay:-5s}
.rx-blob3{width:200px;height:200px;background:rgba(79,70,229,.06);bottom:-60px;left:35%;animation-delay:-9s}
.rx-hero-dots{position:absolute;inset:0;pointer-events:none;background-image:radial-gradient(circle,rgba(28,25,23,.06) 1px,transparent 1px);background-size:22px 22px;mask-image:radial-gradient(ellipse at 60% 50%,black 0%,transparent 70%)}
.rx-hero-left{position:relative;z-index:1}
.rx-hero-eyebrow{display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:700;color:var(--ink3);letter-spacing:.09em;text-transform:uppercase;background:rgba(255,255,255,.7);border:1px solid var(--bdr);padding:4px 12px;border-radius:50px;margin-bottom:14px;backdrop-filter:blur(4px)}
.rx-hero-dot-sep{color:var(--ink4)}
.rx-hero-title{font-family:'Fraunces',serif;font-size:clamp(38px,5vw,62px);font-weight:900;color:var(--ink);line-height:.95;letter-spacing:-.02em;margin-bottom:12px;animation:rx-in .5s cubic-bezier(.22,1,.36,1)}
.rx-hero-title-em{display:block;background:linear-gradient(135deg,var(--teal),var(--indigo));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-style:italic}
.rx-hero-sub{font-size:14px;color:var(--ink3);animation:rx-fade .7s .2s both}
.rx-hero-sub strong{color:var(--ink);font-weight:700}
.rx-hero-right{position:relative;z-index:1;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.rx-hero-pill{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border-radius:50px;font-size:12px;font-weight:700;border:1.5px solid}
.rx-hero-pill-green{background:#d1fae5;color:#065f46;border-color:#a7f3d0}
.rx-hero-pill-amber{background:#fef3c7;color:#92400e;border-color:#fcd34d}
.rx-live-dot{width:7px;height:7px;border-radius:50%;background:#059669;animation:rx-pulse 2s ease infinite}
.rx-sync-btn{display:flex;align-items:center;gap:7px;padding:9px 18px;background:#fff;border:1.5px solid var(--bdr2);border-radius:11px;color:var(--ink2);font-family:inherit;font-size:12.5px;font-weight:700;cursor:pointer;transition:all .18s;box-shadow:var(--sh)}
.rx-sync-btn:hover{border-color:var(--teal);color:var(--teal);background:#f0fdfa}
.rx-syncing svg{animation:rx-spin .7s linear infinite}
.rx-stats{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:14px;padding:22px 28px;background:var(--bg);border-bottom:1px solid var(--bdr)}
.rx-stat{background:var(--surf);border:1.5px solid var(--bdr);border-radius:16px;padding:18px 20px;transition:all .2s;animation:rx-in .5s cubic-bezier(.22,1,.36,1) both;box-shadow:var(--sh);overflow:hidden;position:relative}
.rx-stat::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--text-accent);border-radius:16px 16px 0 0;opacity:.7}
.rx-stat:hover{transform:translateY(-3px);box-shadow:var(--sh-h)}
.rx-stat-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
.rx-stat-icon{width:36px;height:36px;border-radius:9px;display:flex;align-items:center;justify-content:center;background:var(--accent);color:var(--text-accent)}
.rx-stat-sub{font-size:10px;font-weight:700;color:var(--ink4);background:var(--surf2);padding:2px 8px;border-radius:50px;border:1px solid var(--bdr)}
.rx-stat-val{font-family:'Fraunces',serif;font-size:32px;font-weight:800;color:var(--ink);line-height:1;letter-spacing:-.03em;margin-bottom:4px}
.rx-stat-label{font-size:11.5px;font-weight:600;color:var(--ink3);margin-bottom:10px}
.rx-stat-bar-track{height:3px;background:var(--surf3);border-radius:3px;overflow:hidden}
.rx-stat-bar-fill{height:100%;background:var(--text-accent);border-radius:3px;width:100%;animation:rx-bar-in .8s cubic-bezier(.22,1,.36,1)}
.rx-toolbar{display:flex;align-items:center;gap:10px;padding:14px 28px;background:var(--surf);border-bottom:1.5px solid var(--bdr);flex-wrap:wrap;position:relative;z-index:500}
.rx-search-wrap{position:relative;flex:1;min-width:200px;max-width:340px}
.rx-search-ico{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--ink4);pointer-events:none}
.rx-search{width:100%;padding:9px 36px;background:var(--surf2);border:1.5px solid var(--bdr);border-radius:10px;font-family:inherit;font-size:13px;color:var(--ink);outline:none;transition:all .15s}
.rx-search::placeholder{color:var(--ink4)}
.rx-search:focus{border-color:var(--teal);background:#fff;box-shadow:0 0 0 3px rgba(15,118,110,.08)}
.rx-search-clr{position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--ink4);cursor:pointer;display:flex;align-items:center}
.rx-filters{display:flex;gap:4px;background:var(--surf2);border:1.5px solid var(--bdr);border-radius:11px;padding:3px}
.rx-ftab{padding:7px 14px;border-radius:8px;border:none;background:transparent;font-family:inherit;font-size:12px;font-weight:600;color:var(--ink3);cursor:pointer;transition:all .15s;white-space:nowrap;display:flex;align-items:center;gap:6px}
.rx-ftab:hover{color:var(--ink)}
.rx-ftab-on{background:#fff!important;color:var(--ink)!important;box-shadow:0 1px 4px rgba(28,25,23,.12)}
.rx-ftab-badge{font-size:10px;font-weight:800;background:var(--surf3);color:var(--ink4);padding:1px 6px;border-radius:50px}
.rx-ftab-on .rx-ftab-badge{background:var(--indigo-light);color:var(--indigo)}
.rx-sort-wrap{position:relative;z-index:9999;flex-shrink:0}
.rx-sort-btn{display:flex;align-items:center;gap:6px;padding:9px 14px;background:var(--surf2);border:1.5px solid var(--bdr);border-radius:10px;font-family:inherit;font-size:12.5px;font-weight:600;color:var(--ink2);cursor:pointer;white-space:nowrap;transition:all .15s}
.rx-sort-btn:hover,.rx-sort-active{border-color:var(--teal);color:var(--teal);background:#f0fdfa}
.rx-chevron{transition:transform .2s}
.rx-chevron-up{transform:rotate(180deg)}
.rx-sort-menu{position:absolute;top:calc(100% + 8px);right:0;background:#fff;border:1.5px solid var(--bdr);border-radius:14px;padding:6px;box-shadow:0 12px 40px rgba(28,25,23,.14);min-width:190px;animation:rx-in .18s cubic-bezier(.22,1,.36,1)}
.rx-sort-hdr{font-size:10px;font-weight:700;color:var(--ink4);text-transform:uppercase;letter-spacing:.09em;padding:6px 10px 5px}
.rx-sort-item{width:100%;display:flex;align-items:center;gap:8px;padding:9px 10px;border:none;background:transparent;font-family:inherit;font-size:13px;font-weight:500;color:var(--ink2);cursor:pointer;border-radius:8px;transition:background .12s;text-align:left}
.rx-sort-item:hover{background:var(--surf2);color:var(--ink)}
.rx-sort-item-on{color:var(--teal)!important;font-weight:700}
.rx-sort-tick{width:18px;display:flex;align-items:center;justify-content:center;color:var(--teal)}
.rx-view-btns{display:flex;gap:3px;background:var(--surf2);border:1.5px solid var(--bdr);border-radius:10px;padding:3px}
.rx-vbtn{width:34px;height:34px;border-radius:7px;border:none;background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s}
.rx-vbtn:hover{background:var(--surf3)}
.rx-vbtn-on{background:#fff!important;box-shadow:0 1px 4px rgba(28,25,23,.1)}
.rx-grid-ico{display:grid;grid-template-columns:1fr 1fr;gap:2.5px}
.rx-grid-ico span{width:5px;height:5px;border-radius:1.5px;background:var(--ink4);display:block}
.rx-vbtn-on .rx-grid-ico span,.rx-vbtn-on .rx-list-ico span{background:var(--teal)}
.rx-list-ico{display:flex;flex-direction:column;gap:3px}
.rx-list-ico span{width:14px;height:2px;border-radius:2px;background:var(--ink4);display:block}
.rx-result-count{font-size:12px;color:var(--ink4);font-weight:500;white-space:nowrap;margin-left:auto}
.rx-result-count strong{color:var(--ink2);font-weight:700}
.rx-content{padding:24px 28px;background:var(--bg)}
.rx-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:18px;position:relative;z-index:0}
.rx-card{background:var(--surf);border:1.5px solid var(--bdr);border-radius:18px;overflow:visible;display:flex;flex-direction:column;box-shadow:var(--sh);transition:transform .26s cubic-bezier(.22,1,.36,1),box-shadow .26s,border-color .26s;animation:rx-in .5s cubic-bezier(.22,1,.36,1) both;animation-delay:calc(var(--i,0) * 50ms);position:relative}
.rx-card-hov{transform:translateY(-5px);box-shadow:var(--sh-h);border-color:var(--teal)}
.rx-card-accent-line{position:absolute;top:0;left:20px;right:20px;height:3px;background:var(--accent,var(--teal));border-radius:0 0 4px 4px;opacity:.7;z-index:2}
.rx-card-img-wrap{position:relative;height:172px;overflow:hidden;border-radius:16px 16px 0 0;flex-shrink:0}
.rx-card-img{width:100%;height:100%;object-fit:cover;transition:transform .6s ease}
.rx-card-hov .rx-card-img{transform:scale(1.07)}
.rx-card-img-gradient{position:absolute;inset:0;background:linear-gradient(to top,rgba(28,25,23,.55) 0%,transparent 55%)}
.rx-badge{position:absolute;top:10px;left:10px;display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:50px;font-size:10px;font-weight:700;backdrop-filter:blur(8px)}
.rx-badge-open{background:rgba(5,150,105,.18);border:1px solid rgba(5,150,105,.4);color:#ecfdf5}
.rx-badge-closed{background:rgba(220,38,38,.15);border:1px solid rgba(220,38,38,.35);color:#fff1f2}
.rx-badge-dot{width:5px;height:5px;border-radius:50%;background:currentColor;flex-shrink:0}
.rx-badge-open .rx-badge-dot{animation:rx-pulse 2.2s ease infinite}
.rx-card-elite{position:absolute;bottom:10px;left:10px;display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:50px;font-size:9px;font-weight:800;background:var(--amber);color:#fff}
.rx-card-overlay{position:absolute;inset:0;border-radius:16px 16px 0 0;background:rgba(15,118,110,.75);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;gap:10px;opacity:0;transition:opacity .22s}
.rx-card-overlay-show{opacity:1}
.rx-ov-btn{display:flex;align-items:center;gap:6px;padding:9px 16px;border-radius:9px;font-family:inherit;font-size:12.5px;font-weight:700;cursor:pointer;border:none;transition:all .15s}
.rx-ov-btn:disabled{opacity:.55;cursor:not-allowed}
.rx-ov-view{background:rgba(255,255,255,.95);color:var(--teal)}
.rx-ov-view:hover:not(:disabled){background:#fff;transform:scale(1.04)}
.rx-ov-open{background:rgba(209,250,229,.9);color:#065f46}
.rx-ov-close{background:rgba(254,226,226,.9);color:#991b1b}
.rx-card-body{padding:14px 16px 16px;flex:1;display:flex;flex-direction:column;gap:10px;position:relative;z-index:1}
.rx-card-header{display:flex;align-items:center;justify-content:space-between}
.rx-card-num{font-family:'Fraunces',serif;font-size:14px;font-weight:700;color:var(--ink4)}
.rx-card-menu-wrap{position:relative}
.rx-card-dots{width:28px;height:28px;border-radius:8px;border:1.5px solid var(--bdr);background:transparent;color:var(--ink3);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s}
.rx-card-dots:hover{background:var(--surf2);color:var(--ink)}
.rx-dropdown{position:absolute;top:calc(100% + 6px);right:0;background:#fff;border:1.5px solid var(--bdr);border-radius:13px;padding:5px;box-shadow:0 10px 36px rgba(28,25,23,.14);z-index:9999;min-width:172px;animation:rx-in .18s cubic-bezier(.22,1,.36,1)}
.rx-dropdown button{width:100%;display:flex;align-items:center;gap:8px;padding:8px 11px;border:none;background:transparent;font-family:inherit;font-size:12.5px;font-weight:500;color:var(--ink2);cursor:pointer;border-radius:8px;transition:background .12s;text-align:left}
.rx-dropdown button:hover{background:var(--surf2);color:var(--ink)}
.rx-dropdown button:disabled{opacity:.5;cursor:not-allowed}
.rx-drop-sep{height:1px;background:var(--bdr);margin:4px 8px}
.rx-drop-danger{color:var(--rose)!important}
.rx-drop-danger:hover{background:#fff1f2!important}
.rx-card-name{font-family:'Fraunces',serif;font-size:15.5px;font-weight:700;color:var(--ink);line-height:1.25}
.rx-card-meta{display:flex;gap:6px;flex-wrap:wrap}
.rx-meta-chip{display:inline-flex;align-items:center;gap:3px;font-size:11px;font-weight:500;color:var(--ink3);background:var(--surf2);padding:3px 8px;border-radius:5px;border:1px solid var(--bdr)}
.rx-rating{display:flex;align-items:center;gap:7px}
.rx-stars{display:flex;gap:2px}
.rx-star-on{color:#d97706;fill:#d97706}
.rx-star-off{color:#d5cfc5;fill:#d5cfc5}
.rx-rbar-track{flex:1;height:4px;background:var(--surf3);border-radius:4px;overflow:hidden}
.rx-rbar-fill{height:100%;border-radius:4px;transition:width .8s cubic-bezier(.22,1,.36,1)}
.rx-rbar-num{font-size:11px;font-weight:700;min-width:24px;text-align:right}
.rx-toggle{width:100%;padding:9px;border-radius:10px;font-family:inherit;font-size:12px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px;transition:all .18s;border:1.5px solid transparent;margin-top:auto}
.rx-toggle:disabled{opacity:.55;cursor:not-allowed}
.rx-toggle-indicator{width:7px;height:7px;border-radius:50%;flex-shrink:0}
.rx-toggle-on{background:var(--green-light);color:#065f46;border-color:#a7f3d0}
.rx-toggle-on .rx-toggle-indicator{background:var(--green)}
.rx-toggle-on:hover:not(:disabled){background:#a7f3d0}
.rx-toggle-off{background:var(--rose-light);color:#991b1b;border-color:#fca5a5}
.rx-toggle-off .rx-toggle-indicator{background:var(--rose)}
.rx-toggle-off:hover:not(:disabled){background:#fca5a5}
.rx-spin-sm{width:10px;height:10px;border-radius:50%;border:2px solid rgba(28,25,23,.15);border-top-color:currentColor;animation:rx-spin .7s linear infinite;display:inline-block;flex-shrink:0}
.rx-spin-dot{width:12px;height:12px;border-radius:50%;border:2px solid rgba(255,255,255,.4);border-top-color:#fff;animation:rx-spin .7s linear infinite;display:inline-block;flex-shrink:0}
.rx-skel{background:var(--surf);border:1.5px solid var(--bdr);border-radius:18px;overflow:hidden;animation:rx-in .4s cubic-bezier(.22,1,.36,1) both;box-shadow:var(--sh)}
.rx-skel-img{height:172px;background:linear-gradient(90deg,var(--surf2) 25%,var(--surf3) 50%,var(--surf2) 75%);background-size:200%;animation:rx-shimmer 1.7s linear infinite}
.rx-skel-body{padding:14px 16px 16px;display:flex;flex-direction:column;gap:10px}
.rx-skel-line{height:10px;border-radius:6px;background:linear-gradient(90deg,var(--surf2) 25%,var(--surf3) 50%,var(--surf2) 75%);background-size:200%;animation:rx-shimmer 1.7s linear infinite}
.rx-list{display:flex;flex-direction:column;gap:10px;position:relative;z-index:0}
.rx-row{background:var(--surf);border:1.5px solid var(--bdr);border-radius:14px;display:flex;align-items:center;gap:14px;overflow:hidden;box-shadow:var(--sh);transition:all .22s;animation:rx-in .4s cubic-bezier(.22,1,.36,1) both;animation-delay:calc(var(--i,0) * 40ms);position:relative;padding-left:4px}
.rx-row:hover{box-shadow:var(--sh-h);border-color:var(--teal);transform:translateX(3px)}
.rx-row-stripe{position:absolute;left:0;top:0;bottom:0;width:4px;background:var(--accent,var(--teal));border-radius:14px 0 0 14px}
.rx-row-img{width:70px;height:70px;flex-shrink:0;border-radius:10px;overflow:hidden;margin:8px 0 8px 8px}
.rx-row-img img{width:100%;height:100%;object-fit:cover}
.rx-row-info{flex:1;min-width:0}
.rx-row-name-wrap{display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin-bottom:5px}
.rx-row-num{font-family:'Fraunces',serif;font-size:12px;font-weight:700;color:var(--ink4)}
.rx-row-name{font-family:'Fraunces',serif;font-size:15px;font-weight:700;color:var(--ink)}
.rx-row-elite{display:inline-flex;align-items:center;gap:3px;font-size:9px;font-weight:800;background:var(--amber);color:#fff;padding:1px 7px;border-radius:50px}
.rx-row-meta{display:flex;gap:10px;flex-wrap:wrap}
.rx-row-meta span{display:inline-flex;align-items:center;gap:3px;font-size:11px;color:var(--ink3);font-weight:500}
.rx-row-rbar{min-width:90px}
.rx-row-actions{display:flex;gap:6px;padding-right:14px;flex-shrink:0}
.rx-row-btn{width:34px;height:34px;border-radius:9px;border:1.5px solid var(--bdr);background:var(--surf2);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s;color:var(--ink3)}
.rx-row-btn:hover:not(:disabled){background:var(--surf3)}
.rx-row-btn:disabled{opacity:.5;cursor:not-allowed}
.rx-row-view:hover{border-color:var(--teal);color:var(--teal);background:#f0fdfa}
.rx-row-open:hover:not(:disabled){border-color:var(--green);color:var(--green);background:var(--green-light)}
.rx-row-close:hover:not(:disabled){border-color:var(--rose);color:var(--rose);background:var(--rose-light)}
.rx-row-del:hover{border-color:var(--rose);color:var(--rose);background:var(--rose-light)}
.rx-state{background:var(--surf);border:1.5px dashed var(--bdr2);border-radius:20px;padding:72px 20px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:12px;color:var(--ink4);box-shadow:var(--sh)}
.rx-state h3{font-family:'Fraunces',serif;font-size:20px;font-weight:700;color:var(--ink2)}
.rx-state p{font-size:13.5px;color:var(--ink3)}
.rx-state-err{border-color:#fca5a5;color:var(--rose);background:#fff8f8}
.rx-state-err h3{color:#991b1b}
.rx-state-btn{margin-top:6px;padding:9px 24px;border-radius:10px;border:1.5px solid var(--bdr2);background:var(--surf);color:var(--ink2);font-family:inherit;font-size:12.5px;font-weight:700;cursor:pointer;transition:all .15s;box-shadow:var(--sh)}
.rx-state-btn:hover{border-color:var(--teal);color:var(--teal);background:#f0fdfa}
.rx-drawer-bg{position:fixed;inset:0;z-index:800;background:rgba(28,25,23,.45);backdrop-filter:blur(6px);display:flex;justify-content:flex-end}
.rx-drawer{width:100%;max-width:440px;height:100%;background:var(--surf);box-shadow:-12px 0 50px rgba(28,25,23,.15);overflow-y:auto;animation:rx-slide .3s cubic-bezier(.22,1,.36,1);border-left:1.5px solid var(--bdr);display:flex;flex-direction:column}
.rx-drawer-x{position:absolute;top:14px;right:14px;width:32px;height:32px;border-radius:50%;border:1.5px solid var(--bdr2);background:rgba(255,255,255,.9);backdrop-filter:blur(4px);color:var(--ink2);display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:10;transition:all .15s}
.rx-drawer-x:hover{background:#fff;color:var(--ink);border-color:var(--teal)}
.rx-drawer-hero{position:relative;height:220px;flex-shrink:0}
.rx-drawer-hero img{width:100%;height:100%;object-fit:cover}
.rx-drawer-shade{position:absolute;inset:0;background:linear-gradient(to top,rgba(255,255,255,.95) 0%,rgba(255,255,255,.2) 50%,transparent 100%)}
.rx-drawer-hero-info{position:absolute;bottom:18px;left:20px;right:20px}
.rx-drawer-title{font-family:'Fraunces',serif;font-size:28px;font-weight:800;color:var(--ink);line-height:1.1;margin-top:8px}
.rx-drawer-city{display:flex;align-items:center;gap:5px;font-size:12.5px;color:var(--ink3);margin-top:5px}
.rx-drawer-body{padding:22px 22px 40px;flex:1;display:flex;flex-direction:column;gap:18px}
.rx-drawer-stats{display:flex;background:var(--surf2);border:1.5px solid var(--bdr);border-radius:14px;padding:18px 14px}
.rx-dstat{flex:1;text-align:center}
.rx-dstat-val{display:block;font-family:'Fraunces',serif;font-size:20px;font-weight:800;color:var(--ink);letter-spacing:-.02em}
.rx-dstat-lbl{display:block;font-size:10px;font-weight:700;color:var(--ink4);text-transform:uppercase;letter-spacing:.07em;margin-top:2px}
.rx-dstat-div{width:1px;background:var(--bdr);height:36px;flex-shrink:0}
.rx-drawer-rating-section{background:var(--surf2);border:1.5px solid var(--bdr);border-radius:14px;padding:16px}
.rx-drawer-rating-hdr{display:flex;justify-content:space-between;align-items:center;font-size:12px;color:var(--ink3);font-weight:600;margin-bottom:10px}
.rx-drawer-rbar-track{height:8px;background:var(--bdr);border-radius:6px;overflow:hidden;margin-bottom:10px}
.rx-drawer-rbar-fill{height:100%;border-radius:6px;transition:width .9s cubic-bezier(.22,1,.36,1)}
.rx-drawer-tier{font-size:12px;font-weight:600;color:var(--ink2)}
.rx-drawer-actions{display:flex;flex-direction:column;gap:8px;margin-top:auto}
.rx-daction{width:100%;padding:13px;border-radius:12px;font-family:inherit;font-size:13.5px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:all .18s;border:1.5px solid transparent}
.rx-daction:disabled{opacity:.55;cursor:not-allowed}
.rx-daction-act{background:var(--green-light);color:#065f46;border-color:#a7f3d0}
.rx-daction-act:hover:not(:disabled){background:#a7f3d0}
.rx-daction-deact{background:var(--rose-light);color:#991b1b;border-color:#fca5a5}
.rx-daction-deact:hover:not(:disabled){background:#fca5a5}
.rx-daction-del{background:var(--surf2);color:var(--ink3);border-color:var(--bdr2)}
.rx-daction-del:hover{color:var(--rose);border-color:#fca5a5;background:var(--rose-light)}
.rx-modal-bg{position:fixed;inset:0;z-index:1000;background:rgba(28,25,23,.5);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:20px}
.rx-modal{background:#fff;border:1.5px solid var(--bdr);border-radius:22px;padding:32px 28px 26px;width:100%;max-width:420px;position:relative;box-shadow:0 24px 70px rgba(28,25,23,.2);animation:rx-modal .28s cubic-bezier(.22,1,.36,1)}
.rx-modal-x{position:absolute;top:14px;right:14px;width:28px;height:28px;border-radius:50%;border:1.5px solid var(--bdr);background:var(--surf2);color:var(--ink3);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s}
.rx-modal-x:hover{background:var(--surf3);color:var(--ink)}
.rx-modal-icon{width:58px;height:58px;border-radius:16px;background:var(--rose-light);display:flex;align-items:center;justify-content:center;color:var(--rose);margin:0 auto 18px;box-shadow:0 4px 16px rgba(220,38,38,.15)}
.rx-modal-title{font-family:'Fraunces',serif;font-size:24px;font-weight:800;color:var(--ink);text-align:center;margin-bottom:10px}
.rx-modal-desc{font-size:13.5px;color:var(--ink3);text-align:center;line-height:1.7;margin-bottom:24px}
.rx-modal-desc strong{color:var(--ink)}
.rx-modal-actions{display:flex;gap:10px}
.rx-modal-cancel{flex:1;padding:11px;border-radius:11px;border:1.5px solid var(--bdr2);background:transparent;font-family:inherit;font-size:13px;font-weight:700;color:var(--ink2);cursor:pointer;transition:all .15s}
.rx-modal-cancel:hover{background:var(--surf2);color:var(--ink)}
.rx-modal-cancel:disabled{opacity:.4;cursor:not-allowed}
.rx-modal-confirm{flex:1;padding:11px;border-radius:11px;border:none;background:linear-gradient(135deg,#ef4444,#dc2626);font-family:inherit;font-size:13px;font-weight:800;color:#fff;cursor:pointer;box-shadow:0 4px 16px rgba(220,38,38,.28);transition:all .18s;display:flex;align-items:center;justify-content:center;gap:6px}
.rx-modal-confirm:hover{transform:translateY(-1px);box-shadow:0 6px 22px rgba(220,38,38,.36)}
.rx-modal-confirm:disabled{opacity:.5;cursor:not-allowed;transform:none}
@media(max-width:640px){.rx-hero{padding:28px 18px 24px}.rx-content{padding:16px}.rx-stats{padding:16px}.rx-toolbar{padding:12px 16px}.rx-drawer{max-width:100%}.rx-modal-actions{flex-direction:column}.rx-hero-right{gap:7px}}
`;