import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Store, MapPin, Star, AlertCircle, ChevronRight,
  LogOut, Search, Wifi, WifiOff, LayoutGrid, Plus,
  Trash2, X, Loader2, CheckCircle2, Pencil, Eye, EyeOff,
  MoreVertical, ToggleLeft, ToggleRight,
} from "lucide-react";
import axiosInstance from "../../api/axiosInstance";
import { useAuth } from "../../contexts/AuthContext";


const useToast = () => {
  const [toasts, setToasts] = useState([]);
  const add = (msg, type = "success") => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  };
  return { toasts, success: msg => add(msg, "success"), error: msg => add(msg, "error"), info: msg => add(msg, "info") };
};


const ToastContainer = ({ toasts }) => (
  <div style={{ position:"fixed", bottom:28, right:28, zIndex:9999, display:"flex", flexDirection:"column", gap:8 }}>
    {toasts.map(t => (
      <div key={t.id} className={`rs-toast rs-toast-${t.type}`}>
        {t.type === "success" && <CheckCircle2 size={15}/>}
        {t.type === "error"   && <AlertCircle  size={15}/>}
        {t.type === "info"    && <Eye          size={15}/>}
        <span>{t.msg}</span>
      </div>
    ))}
  </div>
);


const RestaurantModal = ({ mode, restaurant, onClose, onSaved }) => {
  const isEdit = mode === "edit";
  const [form, setForm] = useState({
    name:     restaurant?.name     ?? restaurant?.Name     ?? "",
    city:     restaurant?.city     ?? restaurant?.City     ?? "",
    address:  restaurant?.address  ?? restaurant?.Address  ?? "",
    imageUrl: restaurant?.imageUrl ?? "",
    isOpen:   restaurant?.isOpen   ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [done,   setDone]   = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    if (!form.name.trim()) { alert("Name is required"); return; }
    try {
      setSaving(true);
      if (isEdit) {
        const id = restaurant.restaurantID ?? restaurant.restaurantId ?? restaurant.id ?? restaurant.RestaurantID;
        await axiosInstance.put(`/Restaurant/${id}`, form);
      } else {
        await axiosInstance.post("/Restaurant", form);
      }
      setDone(true);
      setTimeout(() => { onClose(); onSaved(); }, 800);
    } catch (err) {
      alert(err?.response?.data || `Failed to ${isEdit ? "update" : "create"} restaurant`);
    } finally { setSaving(false); }
  };

  return (
    <div className="rs-overlay" onClick={onClose}>
      <div className="rs-dialog" onClick={e => e.stopPropagation()}>
        <button className="rs-dlg-close" onClick={onClose}><X size={17}/></button>
        <div className={`rs-dlg-icon ${isEdit ? "rs-dlg-icon-edit" : "rs-dlg-icon-add"}`}>
          {isEdit ? <Pencil size={22}/> : <Store size={22}/>}
        </div>
        <h2 className="rs-dlg-title">{isEdit ? "Edit Restaurant" : "Add Restaurant"}</h2>
        <p className="rs-dlg-sub">{isEdit ? "Update your restaurant details" : "Fill in the details to add a new venue"}</p>

        {done ? (
          <div className="rs-dlg-success">
            <CheckCircle2 size={42}/>
            <p>{isEdit ? "Restaurant updated!" : "Restaurant created!"}</p>
          </div>
        ) : (
          <>
            <div className="rs-field">
              <label className="rs-label">Restaurant Name <span style={{color:"#ef4444"}}>*</span></label>
              <input className="rs-input" placeholder="e.g. Spice Garden" value={form.name} onChange={set("name")}/>
            </div>
            <div className="rs-field-row">
              <div className="rs-field" style={{marginBottom:0}}>
                <label className="rs-label">City</label>
                <input className="rs-input" placeholder="Mumbai" value={form.city} onChange={set("city")}/>
              </div>
              <div className="rs-field" style={{marginBottom:0}}>
                <label className="rs-label">Status</label>
                <select className="rs-input rs-select" value={form.isOpen ? "open" : "closed"}
                  onChange={e => setForm(f => ({ ...f, isOpen: e.target.value === "open" }))}>
                  <option value="open">🟢 Open</option>
                  <option value="closed">🔴 Closed</option>
                </select>
              </div>
            </div>
            <div className="rs-field">
              <label className="rs-label">Address</label>
              <input className="rs-input" placeholder="123 MG Road, Andheri West" value={form.address} onChange={set("address")}/>
            </div>
            <div className="rs-field">
              <label className="rs-label">Image URL</label>
              <input className="rs-input" placeholder="https://example.com/image.jpg" value={form.imageUrl} onChange={set("imageUrl")}/>
            </div>
            {form.imageUrl && (
              <div style={{ marginBottom:14, borderRadius:10, overflow:"hidden", height:90, background:"#f3f4f6" }}>
                <img src={form.imageUrl} alt="preview" style={{ width:"100%", height:"100%", objectFit:"cover" }}
                  onError={e => { e.target.style.display="none"; }}/>
              </div>
            )}
            <div className="rs-dlg-actions">
              <button className="rs-btn-ghost" onClick={onClose} disabled={saving}>Cancel</button>
              <button className="rs-btn-primary" onClick={handleSave} disabled={saving}>
                {saving
                  ? <><Loader2 size={14} className="spin"/> {isEdit ? "Updating…" : "Creating…"}</>
                  : isEdit ? <><Pencil size={14}/> Update</> : <><Plus size={14}/> Create</>}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};


const DeleteModal = ({ restaurant, onConfirm, onCancel, deleting }) => {
  const name = restaurant?.name ?? restaurant?.Name ?? "this restaurant";
  return (
    <div className="rs-overlay" onClick={onCancel}>
      <div className="rs-dialog rs-dialog-sm" onClick={e => e.stopPropagation()}>
        <div className="rs-dlg-icon rs-dlg-icon-danger"><EyeOff size={22}/></div>
        <h2 className="rs-dlg-title">Deactivate Restaurant?</h2>
        <p className="rs-dlg-sub" style={{textAlign:"center",marginBottom:12}}>
          <strong>{name}</strong> will be hidden from customers immediately.
          All menu items will be marked unavailable.
        </p>
        <div className="rs-dlg-info-pill">
          <EyeOff size={12}/> Hidden from customer app instantly
        </div>
        <div className="rs-dlg-actions" style={{marginTop:18}}>
          <button className="rs-btn-ghost" onClick={onCancel} disabled={deleting}>Cancel</button>
          <button className="rs-btn-danger" onClick={onConfirm} disabled={deleting}>
            {deleting
              ? <><Loader2 size={14} className="spin"/> Deactivating…</>
              : <><EyeOff size={14}/> Deactivate</>}
          </button>
        </div>
      </div>
    </div>
  );
};


const CardMenu = ({ onEdit, onDelete, onToggleStatus, isOpen }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} style={{position:"relative"}}>
      <button
        className="rs-ctx-trigger"
        onClick={e => { e.stopPropagation(); setOpen(o => !o); }}
        title="More options"
      >
        <MoreVertical size={15}/>
      </button>
      {open && (
        <div className="rs-ctx-menu" onClick={e => e.stopPropagation()}>
          <button className="rs-ctx-item" onClick={() => { setOpen(false); onEdit(); }}>
            <Pencil size={13}/> Edit Details
          </button>
          <button className="rs-ctx-item" onClick={() => { setOpen(false); onToggleStatus(); }}>
            {isOpen
              ? <><ToggleLeft  size={13}/> Mark as Closed</>
              : <><ToggleRight size={13}/> Mark as Open</>}
          </button>
          <div className="rs-ctx-sep"/>
          <button className="rs-ctx-item rs-ctx-danger" onClick={() => { setOpen(false); onDelete(); }}>
            <EyeOff size={13}/> Deactivate
          </button>
        </div>
      )}
    </div>
  );
};


const RestaurantSelect = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [search,      setSearch]      = useState("");
  const [addModal,    setAddModal]    = useState(false);
  const [editTarget,  setEditTarget]  = useState(null);
  const [delTarget,   setDelTarget]   = useState(null);
  const [deleting,    setDeleting]    = useState(false);
  const [togglingId,  setTogglingId]  = useState(null);

  const navigate       = useNavigate();
  const { user, logout } = useAuth();
  const toast          = useToast();

  useEffect(() => {
    const uid = user?.id || localStorage.getItem("userId") || sessionStorage.getItem("tempUserId");
    if (!uid) { navigate("/login", { replace:true }); return; }
    fetchRestaurants();
    // eslint-disable-next-line
  }, [navigate, user]);

  const fetchRestaurants = async () => {
    try {
      setLoading(true); setError("");
      const res = await axiosInstance.get("/Restaurant");
      if (!Array.isArray(res.data)) throw new Error("Invalid data");
      setRestaurants(res.data);
      if (res.data.length === 0) setError("No restaurants found for your account.");
    } catch (err) {
      setError(err?.response?.data || err.message || "Failed to load restaurants.");
      setRestaurants([]);
    } finally { setLoading(false); }
  };

  const getId = r => r.restaurantID ?? r.restaurantId ?? r.id ?? r.RestaurantID;

  /* Navigate to dashboard */
  const handleSelect = r => {
    const id   = getId(r);
    const name = r.name ?? r.Name ?? "";
    if (!id) { alert("Restaurant has no id."); return; }
    localStorage.setItem("restaurantId",   String(id));
    localStorage.setItem("restaurantName", name);
    const uid = user?.id || localStorage.getItem("userId");
    if (uid) localStorage.setItem("userId", String(uid));
    setTimeout(() => navigate("/restaurant/dashboard", { replace:true, state:{ restaurantId:id } }), 50);
  };

  /* Toggle open/closed */
  const handleToggleStatus = async r => {
    const id   = getId(r);
    const next = !r.isOpen;
    setTogglingId(id);
    try {
      await axiosInstance.patch(`/Restaurant/${id}/status?isOpen=${next}`);
      setRestaurants(prev => prev.map(x => getId(x) === id ? { ...x, isOpen:next } : x));
      toast.success(`${r.name ?? r.Name} is now ${next ? "open 🟢" : "closed 🔴"}.`);
    } catch (err) {
      toast.error(err?.response?.data || "Failed to update status.");
    } finally { setTogglingId(null); }
  };

 
  const handleSoftDelete = async () => {
    if (!delTarget) return;
    const id   = getId(delTarget);
    const name = delTarget.name ?? delTarget.Name ?? "Restaurant";
    try {
      setDeleting(true);
      // Close first so customers can't see it even before DELETE completes
      try { await axiosInstance.patch(`/Restaurant/${id}/status?isOpen=false`); } catch (_) {}
      // Delete (backend will soft-delete menu items inside)
      await axiosInstance.delete(`/Restaurant/${id}`);
      // Instant local removal
      setRestaurants(prev => prev.filter(r => getId(r) !== id));
      toast.success(`"${name}" has been deactivated and hidden from customers.`);
    } catch (err) {
      toast.error(err?.response?.data || "Failed to deactivate restaurant.");
    } finally { setDeleting(false); setDelTarget(null); }
  };

  /* Logout */
  const handleLogout = () => {
    if (logout) logout(); else { localStorage.clear(); sessionStorage.clear(); }
    navigate("/login", { replace:true });
  };

  const filtered = restaurants.filter(r =>
    (r.name ?? r.Name ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (r.city ?? r.City ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const userName  = user?.name ?? user?.email?.split("@")[0] ?? "Owner";
  const openCount = restaurants.filter(r => r.isOpen).length;
  const topCount  = restaurants.filter(r => (r.rating ?? 0) >= 4).length;

  const COVERS = [
    "linear-gradient(135deg,#f97316,#ea580c)",
    "linear-gradient(135deg,#fb923c,#c2410c)",
    "linear-gradient(135deg,#f59e0b,#d97706)",
    "linear-gradient(135deg,#10b981,#059669)",
    "linear-gradient(135deg,#8b5cf6,#7c3aed)",
  ];

  /* ── Loading screen ── */
  if (loading) return (
    <>
      <style>{CSS}</style>
      <div className="rs-splash">
        <div className="rs-splash-inner">
          <div className="rs-splash-ring"/>
          <span className="rs-splash-emoji">🍽️</span>
        </div>
        <p className="rs-splash-label">Loading your venues…</p>
        <div className="rs-splash-track"><div className="rs-splash-bar"/></div>
      </div>
    </>
  );

  return (
    <>
      <style>{CSS}</style>
      <ToastContainer toasts={toast.toasts}/>

      {addModal && (
        <RestaurantModal mode="add" onClose={() => setAddModal(false)}
          onSaved={() => { fetchRestaurants(); toast.success("Restaurant added successfully!"); }}/>
      )}
      {editTarget && (
        <RestaurantModal mode="edit" restaurant={editTarget} onClose={() => setEditTarget(null)}
          onSaved={() => { fetchRestaurants(); toast.success("Restaurant updated!"); }}/>
      )}
      {delTarget && (
        <DeleteModal restaurant={delTarget} deleting={deleting}
          onConfirm={handleSoftDelete} onCancel={() => setDelTarget(null)}/>
      )}

      <div className="rs-root">

        {/* ═══ SIDEBAR ═══ */}
        <aside className="rs-sidebar">
          <div className="rs-brand">
            <div className="rs-brand-mark">🍴</div>
            <div>
              <span className="rs-brand-name">FoodPanel</span>
              <span className="rs-brand-tag">Restaurant Portal</span>
            </div>
          </div>

          <nav className="rs-nav">
            <p className="rs-nav-heading">NAVIGATION</p>
            <div className="rs-nav-item rs-nav-active">
              <span className="rs-nav-icon"><LayoutGrid size={16}/></span>
              <span>My Restaurants</span>
              <span className="rs-nav-badge">{restaurants.length}</span>
            </div>
          </nav>

          {/* Quick stat chips */}
          <div className="rs-sb-chips">
            <div className="rs-sb-chip">
              <span className="rs-sb-chip-val">{restaurants.length}</span>
              <span className="rs-sb-chip-lbl">Total</span>
            </div>
            <div className="rs-sb-sep"/>
            <div className="rs-sb-chip">
              <span className="rs-sb-chip-val rs-green">{openCount}</span>
              <span className="rs-sb-chip-lbl">Open</span>
            </div>
            <div className="rs-sb-sep"/>
            <div className="rs-sb-chip">
              <span className="rs-sb-chip-val rs-gold">{topCount}</span>
              <span className="rs-sb-chip-lbl">Top ★</span>
            </div>
          </div>

          <div className="rs-sb-foot">
            <div className="rs-sb-av">{userName.charAt(0).toUpperCase()}</div>
            <div className="rs-sb-user">
              <span className="rs-sb-uname">{userName}</span>
              <span className="rs-sb-role">Restaurant Owner</span>
            </div>
            <button className="rs-sb-logout" onClick={handleLogout} title="Logout">
              <LogOut size={15}/>
            </button>
          </div>
        </aside>

        {/* ═══ MAIN ═══ */}
        <main className="rs-main">

          {/* Topbar */}
          <div className="rs-topbar">
            <div>
              <h1 className="rs-page-title">My Restaurants</h1>
              <p className="rs-page-sub">{restaurants.length} venue{restaurants.length !== 1 ? "s" : ""} · {openCount} open now</p>
            </div>
            <div className="rs-topbar-right">
              <div className="rs-search-wrap">
                <Search size={15} className="rs-search-ico"/>
                <input
                  className="rs-search"
                  placeholder="Search name or city…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                {search && <button className="rs-search-x" onClick={() => setSearch("")}><X size={13}/></button>}
              </div>
              <button className="rs-add-btn" onClick={() => setAddModal(true)}>
                <Plus size={15}/> Add Restaurant
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="rs-error">
              <AlertCircle size={15}/> {String(error)}
            </div>
          )}

          {/* Results label */}
          {filtered.length > 0 && (
            <p className="rs-results">
              {search
                ? <><strong>{filtered.length}</strong> result{filtered.length !== 1 ? "s" : ""} for "<em>{search}</em>"</>
                : <><strong>{filtered.length}</strong> restaurant{filtered.length !== 1 ? "s" : ""}</>}
            </p>
          )}

          {/* Grid */}
          <div className="rs-grid">
            {filtered.map((r, idx) => {
              const id         = getId(r);
              const name       = r.name ?? r.Name ?? "Restaurant";
              const city       = r.city ?? r.City ?? "";
              const isToggling = togglingId === id;

              return (
                <article key={id} className="rs-card" style={{ animationDelay:`${idx * 48}ms` }}>

                  {/* Cover */}
                  <div className="rs-cover" onClick={() => handleSelect(r)}>
                    {r.imageUrl
                      ? <>
                          <img src={r.imageUrl} alt={name} className="rs-cover-img"/>
                          <div className="rs-cover-grad"/>
                        </>
                      : <div className="rs-cover-fb" style={{ background: COVERS[idx % COVERS.length] }}>
                          <Store size={40} style={{ color:"rgba(255,255,255,.35)" }}/>
                          <span className="rs-cover-letter">{name.charAt(0)}</span>
                        </div>
                    }

                    {/* Open/closed pill */}
                    <span className={`rs-pill ${r.isOpen ? "rs-pill-open" : "rs-pill-closed"}`}>
                      {isToggling
                        ? <Loader2 size={9} className="spin"/>
                        : r.isOpen ? <Wifi size={9}/> : <WifiOff size={9}/>}
                      {r.isOpen ? "Open" : "Closed"}
                    </span>

                    {/* Rating */}
                    {r.rating != null && (
                      <span className="rs-star-pill">
                        <Star size={10} fill="#f59e0b" color="#f59e0b"/>
                        {Number(r.rating).toFixed(1)}
                      </span>
                    )}
                  </div>

                  {/* Body */}
                  <div className="rs-body">
                    <div className="rs-body-top">
                      <div style={{ flex:1, minWidth:0 }}>
                        <h3 className="rs-name" onClick={() => handleSelect(r)}>{name}</h3>
                        {city && <p className="rs-city"><MapPin size={11}/> {city}</p>}
                      </div>
                      <CardMenu
                        isOpen={r.isOpen}
                        onEdit={()          => setEditTarget(r)}
                        onDelete={()        => setDelTarget(r)}
                        onToggleStatus={() => handleToggleStatus(r)}
                      />
                    </div>

                    {/* Action row */}
                    <div className="rs-actions">
                      <button className="rs-go-btn" onClick={() => handleSelect(r)}>
                        Dashboard <ChevronRight size={14}/>
                      </button>
                      <button className="rs-edit-btn" onClick={() => setEditTarget(r)} title="Edit">
                        <Pencil size={13}/>
                      </button>
                      <button className="rs-del-btn" onClick={() => setDelTarget(r)} title="Deactivate">
                        <EyeOff size={13}/>
                      </button>
                    </div>

                    {/* Toggle strip */}
                    <button
                      className={`rs-strip ${r.isOpen ? "rs-strip-open" : "rs-strip-closed"}`}
                      onClick={() => handleToggleStatus(r)}
                      disabled={isToggling}
                    >
                      {isToggling
                        ? <><Loader2 size={11} className="spin"/> Updating status…</>
                        : r.isOpen
                          ? <><ToggleRight size={13}/> Open for orders — tap to close</>
                          : <><ToggleLeft  size={13}/> Closed — tap to open</>}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Empty states */}
          {filtered.length === 0 && restaurants.length > 0 && (
            <div className="rs-empty">
              <div className="rs-empty-em">🔍</div>
              <p className="rs-empty-title">No results for "{search}"</p>
              <p className="rs-empty-sub">Try a different name or city</p>
              <button className="rs-btn-ghost" onClick={() => setSearch("")} style={{marginTop:12}}>Clear search</button>
            </div>
          )}
          {restaurants.length === 0 && !error && (
            <div className="rs-empty">
              <div className="rs-empty-em">🏪</div>
              <p className="rs-empty-title">No restaurants yet</p>
              <p className="rs-empty-sub">Add your first restaurant to get started</p>
              <button className="rs-add-btn" style={{margin:"16px auto 0", width:"auto"}} onClick={() => setAddModal(true)}>
                <Plus size={14}/> Add Restaurant
              </button>
            </div>
          )}

        </main>
      </div>
    </>
  );
};


const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

:root{
  --or:     #f97316;
  --or-d:   #ea580c;
  --or-dd:  #c2410c;
  --or-p:   #fff7ed;
  --or-s:   #fed7aa;
  --grn:    #22c55e;
  --red:    #ef4444;
  --ink:    #111827;
  --ink2:   #374151;
  --ink3:   #6b7280;
  --ink4:   #9ca3af;
  --bg:     #f9fafb;
  --surf:   #ffffff;
  --bdr:    #e5e7eb;
  --bdr2:   #f3f4f6;
  --sw:     252px;
  --r:      14px;
  --sh:     0 1px 3px rgba(0,0,0,.06),0 4px 14px rgba(0,0,0,.06);
  --sh-h:   0 8px 28px rgba(249,115,22,.15),0 2px 6px rgba(0,0,0,.05);
  font-family:'Outfit',sans-serif;
}

html,body{height:100%;background:var(--bg);color:var(--ink)}
.spin{animation:_spin .8s linear infinite}
@keyframes _spin{to{transform:rotate(360deg)}}

/* Splash */
.rs-splash{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;background:var(--bg)}
.rs-splash-inner{position:relative;width:68px;height:68px;display:flex;align-items:center;justify-content:center}
.rs-splash-ring{position:absolute;inset:0;border-radius:50%;border:3px solid var(--or-s);border-top-color:var(--or);animation:_spin .9s linear infinite}
.rs-splash-emoji{font-size:26px}
.rs-splash-label{font-size:13px;font-weight:600;color:var(--ink3)}
.rs-splash-track{width:160px;height:3px;background:var(--bdr);border-radius:3px;overflow:hidden}
.rs-splash-bar{height:100%;width:40%;background:var(--or);border-radius:3px;animation:_sweep 1.4s ease-in-out infinite}
@keyframes _sweep{0%{transform:translateX(-200%)}100%{transform:translateX(400%)}}

/* Toast */
.rs-toast{display:flex;align-items:center;gap:8px;padding:11px 16px;border-radius:11px;min-width:220px;font-size:13px;font-weight:600;box-shadow:0 8px 24px rgba(0,0,0,.11);animation:_sl .28s cubic-bezier(.22,1,.36,1);background:var(--surf)}
.rs-toast-success{border:1.5px solid #86efac;color:#166534}
.rs-toast-error  {border:1.5px solid #fca5a5;color:#991b1b}
.rs-toast-info   {border:1.5px solid #93c5fd;color:#1e40af}
@keyframes _sl{from{opacity:0;transform:translateX(20px)}}

/* Overlay & dialog */
.rs-overlay{position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,.42);backdrop-filter:blur(5px);display:flex;align-items:center;justify-content:center;animation:_fi .2s ease}
@keyframes _fi{from{opacity:0}}
.rs-dialog{background:var(--surf);border-radius:20px;padding:30px 26px 24px;width:450px;max-width:calc(100vw - 32px);box-shadow:0 24px 60px rgba(0,0,0,.15);position:relative;animation:_pi .24s cubic-bezier(.22,1,.36,1)}
.rs-dialog-sm{max-width:400px}
@keyframes _pi{from{opacity:0;transform:scale(.93)}}
.rs-dlg-close{position:absolute;top:13px;right:13px;width:28px;height:28px;border-radius:50%;border:none;background:var(--bdr2);color:var(--ink3);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .15s}
.rs-dlg-close:hover{background:var(--bdr)}
.rs-dlg-icon{width:50px;height:50px;border-radius:15px;margin:0 auto 14px;display:flex;align-items:center;justify-content:center}
.rs-dlg-icon-add   {background:#fff7ed;color:var(--or)}
.rs-dlg-icon-edit  {background:#eff6ff;color:#3b82f6}
.rs-dlg-icon-danger{background:#fef2f2;color:var(--red)}
.rs-dlg-title{font-size:19px;font-weight:800;color:var(--ink);text-align:center;margin-bottom:4px}
.rs-dlg-sub  {font-size:13px;color:var(--ink3);text-align:center;margin-bottom:18px;line-height:1.5}
.rs-dlg-info-pill{display:flex;align-items:center;justify-content:center;gap:6px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:8px 14px;font-size:12px;font-weight:600;color:#166534;margin:10px 0}
.rs-dlg-success{display:flex;flex-direction:column;align-items:center;gap:10px;padding:18px 0 4px;color:#16a34a;font-size:15px;font-weight:700}

.rs-field{margin-bottom:13px}
.rs-field-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:13px}
.rs-label{display:block;font-size:10px;font-weight:700;color:var(--ink3);letter-spacing:.07em;text-transform:uppercase;margin-bottom:5px}
.rs-input{width:100%;padding:10px 12px;border:1.5px solid var(--bdr);border-radius:10px;font-family:'Outfit',sans-serif;font-size:13px;font-weight:500;color:var(--ink);background:var(--bg);outline:none;transition:border-color .18s,box-shadow .18s}
.rs-input:focus{border-color:var(--or);box-shadow:0 0 0 3px rgba(249,115,22,.09)}
.rs-select{cursor:pointer}
.rs-dlg-actions{display:flex;gap:8px;justify-content:flex-end}

.rs-btn-ghost{padding:9px 16px;border-radius:9px;border:1.5px solid var(--bdr);background:transparent;font-family:'Outfit',sans-serif;font-size:13px;font-weight:700;color:var(--ink2);cursor:pointer;transition:all .14s}
.rs-btn-ghost:hover{background:var(--bdr2)}
.rs-btn-primary{display:flex;align-items:center;gap:6px;padding:9px 18px;border-radius:9px;border:none;background:linear-gradient(135deg,var(--or),var(--or-d));font-family:'Outfit',sans-serif;font-size:13px;font-weight:700;color:#fff;cursor:pointer;transition:all .18s;box-shadow:0 4px 12px rgba(249,115,22,.26)}
.rs-btn-primary:hover{background:linear-gradient(135deg,var(--or-d),var(--or-dd));transform:translateY(-1px)}
.rs-btn-primary:disabled{opacity:.65;cursor:not-allowed;transform:none}
.rs-btn-danger{display:flex;align-items:center;gap:6px;padding:9px 18px;border-radius:9px;border:none;background:var(--red);font-family:'Outfit',sans-serif;font-size:13px;font-weight:700;color:#fff;cursor:pointer;transition:all .18s;box-shadow:0 4px 12px rgba(239,68,68,.22)}
.rs-btn-danger:hover{background:#dc2626}
.rs-btn-danger:disabled{opacity:.65;cursor:not-allowed}

/* Context menu */
.rs-ctx-trigger{width:30px;height:30px;border-radius:8px;border:1.5px solid var(--bdr);background:var(--surf);color:var(--ink3);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s;flex-shrink:0}
.rs-ctx-trigger:hover{background:var(--bdr2);color:var(--ink)}
.rs-ctx-menu{position:absolute;top:calc(100% + 5px);right:0;z-index:300;background:var(--surf);border:1.5px solid var(--bdr);border-radius:12px;padding:5px;min-width:170px;box-shadow:0 8px 22px rgba(0,0,0,.11);animation:_fi .14s ease}
.rs-ctx-item{display:flex;align-items:center;gap:8px;width:100%;padding:8px 11px;border-radius:7px;border:none;background:transparent;font-family:'Outfit',sans-serif;font-size:12px;font-weight:600;color:var(--ink2);cursor:pointer;text-align:left;transition:background .1s}
.rs-ctx-item:hover{background:var(--bdr2)}
.rs-ctx-danger{color:var(--red)!important}
.rs-ctx-danger:hover{background:#fef2f2!important}
.rs-ctx-sep{height:1px;background:var(--bdr);margin:4px 0}

/* Layout */
.rs-root{display:flex;min-height:100vh}

/* Sidebar */
.rs-sidebar{width:var(--sw);position:fixed;top:0;left:0;height:100vh;background:var(--surf);border-right:1.5px solid var(--bdr);display:flex;flex-direction:column;z-index:50}
.rs-brand{display:flex;align-items:center;gap:11px;padding:22px 18px 16px;border-bottom:1.5px solid var(--bdr)}
.rs-brand-mark{width:38px;height:38px;border-radius:11px;flex-shrink:0;background:linear-gradient(135deg,var(--or),var(--or-d));display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 4px 10px rgba(249,115,22,.26)}
.rs-brand-name{display:block;font-size:16px;font-weight:800;color:var(--ink)}
.rs-brand-tag {display:block;font-size:9px;font-weight:600;color:var(--ink4);letter-spacing:.08em;text-transform:uppercase}
.rs-nav{flex:1;padding:14px 10px}
.rs-nav-heading{font-size:9px;font-weight:700;color:var(--ink4);letter-spacing:.12em;text-transform:uppercase;padding:0 8px 9px}
.rs-nav-item{display:flex;align-items:center;gap:9px;padding:10px 10px;border-radius:10px;font-size:13px;font-weight:600;color:var(--ink2);cursor:pointer}
.rs-nav-active{background:var(--or-p);color:var(--or-dd);border-left:3px solid var(--or)}
.rs-nav-icon{width:30px;height:30px;border-radius:8px;background:rgba(249,115,22,.1);color:var(--or);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.rs-nav-badge{margin-left:auto;background:var(--or);color:#fff;font-size:10px;font-weight:700;padding:1px 7px;border-radius:100px}

.rs-sb-chips{display:flex;align-items:center;justify-content:space-around;margin:0 10px 14px;padding:13px 14px;background:var(--bg);border-radius:11px;border:1.5px solid var(--bdr)}
.rs-sb-chip{text-align:center}
.rs-sb-chip-val{display:block;font-size:18px;font-weight:800;color:var(--ink)}
.rs-sb-chip-lbl{display:block;font-size:9px;font-weight:600;color:var(--ink4);margin-top:1px}
.rs-green{color:#16a34a!important}
.rs-gold {color:#d97706!important}
.rs-sb-sep{width:1px;height:28px;background:var(--bdr)}

.rs-sb-foot{display:flex;align-items:center;gap:9px;padding:13px 15px;border-top:1.5px solid var(--bdr)}
.rs-sb-av{width:34px;height:34px;border-radius:9px;flex-shrink:0;background:linear-gradient(135deg,var(--or),var(--or-d));color:#fff;font-size:14px;font-weight:800;display:flex;align-items:center;justify-content:center}
.rs-sb-user{display:flex;flex-direction:column;flex:1;min-width:0}
.rs-sb-uname{font-size:12px;font-weight:700;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rs-sb-role {font-size:10px;font-weight:500;color:var(--ink4)}
.rs-sb-logout{background:transparent;border:1.5px solid var(--bdr);border-radius:8px;padding:6px;cursor:pointer;color:var(--ink3);display:flex;align-items:center;transition:all .15s}
.rs-sb-logout:hover{background:#fef2f2;border-color:#fca5a5;color:var(--red)}

/* Main */
.rs-main{margin-left:var(--sw);flex:1;padding:30px 34px 60px;min-height:100vh}

/* Topbar */
.rs-topbar{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;flex-wrap:wrap;margin-bottom:24px}
.rs-page-title{font-size:24px;font-weight:800;color:var(--ink);letter-spacing:-.3px}
.rs-page-sub  {font-size:12px;color:var(--ink3);margin-top:3px;font-weight:500}
.rs-topbar-right{display:flex;align-items:center;gap:9px;flex-wrap:wrap}
.rs-search-wrap{position:relative;display:flex;align-items:center}
.rs-search-ico{position:absolute;left:12px;color:var(--ink4);pointer-events:none}
.rs-search{padding:9px 32px 9px 36px;border:1.5px solid var(--bdr);border-radius:10px;font-family:'Outfit',sans-serif;font-size:13px;font-weight:500;color:var(--ink);background:var(--surf);outline:none;min-width:210px;transition:border-color .18s,box-shadow .18s}
.rs-search:focus{border-color:var(--or);box-shadow:0 0 0 3px rgba(249,115,22,.07)}
.rs-search::placeholder{color:var(--ink4)}
.rs-search-x{position:absolute;right:9px;width:20px;height:20px;border-radius:50%;border:none;background:var(--bdr);color:var(--ink3);display:flex;align-items:center;justify-content:center;cursor:pointer}
.rs-add-btn{display:flex;align-items:center;gap:6px;padding:9px 16px;border-radius:10px;border:none;cursor:pointer;background:linear-gradient(135deg,var(--or),var(--or-d));font-family:'Outfit',sans-serif;font-size:13px;font-weight:700;color:#fff;box-shadow:0 4px 12px rgba(249,115,22,.24);transition:all .18s;white-space:nowrap}
.rs-add-btn:hover{background:linear-gradient(135deg,var(--or-d),var(--or-dd));transform:translateY(-1px);box-shadow:0 6px 18px rgba(249,115,22,.32)}

.rs-error{display:flex;align-items:center;gap:8px;background:#fef2f2;border:1.5px solid #fecaca;color:#dc2626;padding:11px 14px;border-radius:10px;font-size:13px;font-weight:600;margin-bottom:20px}
.rs-results{font-size:12px;color:var(--ink3);margin-bottom:16px;font-weight:500}
.rs-results strong{color:var(--ink);font-weight:700}

/* Grid */
.rs-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(282px,1fr));gap:18px}

/* Card */
.rs-card{background:var(--surf);border-radius:16px;border:1.5px solid var(--bdr);overflow:hidden;box-shadow:var(--sh);transition:all .24s cubic-bezier(.22,1,.36,1);animation:_ci .36s cubic-bezier(.22,1,.36,1) both}
.rs-card:hover{border-color:rgba(249,115,22,.3);box-shadow:var(--sh-h);transform:translateY(-3px)}
@keyframes _ci{from{opacity:0;transform:translateY(14px)}}

/* Cover */
.rs-cover{position:relative;height:180px;overflow:hidden;background:var(--bdr2);cursor:pointer}
.rs-cover-img{width:100%;height:100%;object-fit:cover;transition:transform .38s ease}
.rs-card:hover .rs-cover-img{transform:scale(1.04)}
.rs-cover-grad{position:absolute;inset:0;pointer-events:none;background:linear-gradient(to bottom,transparent 55%,rgba(0,0,0,.15))}
.rs-cover-fb{width:100%;height:100%;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:4px}
.rs-cover-letter{font-size:50px;font-weight:900;color:rgba(255,255,255,.22);line-height:1}

.rs-pill{position:absolute;top:10px;left:10px;display:inline-flex;align-items:center;gap:4px;font-size:9px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;padding:4px 9px;border-radius:6px;backdrop-filter:blur(8px)}
.rs-pill-open  {background:rgba(240,253,244,.92);color:#15803d;border:1px solid rgba(34,197,94,.28)}
.rs-pill-closed{background:rgba(248,250,252,.92);color:#64748b;border:1px solid rgba(148,163,184,.28)}
.rs-star-pill  {position:absolute;top:10px;right:10px;display:flex;align-items:center;gap:3px;background:rgba(255,253,235,.92);border:1.5px solid #fcd34d;border-radius:6px;padding:3px 8px;backdrop-filter:blur(8px);font-size:11px;font-weight:700;color:#92400e}

/* Body */
.rs-body{padding:13px 14px 0}
.rs-body-top{display:flex;align-items:flex-start;gap:8px;margin-bottom:11px}
.rs-name{font-size:15px;font-weight:700;color:var(--ink);margin-bottom:3px;cursor:pointer;transition:color .15s;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rs-name:hover{color:var(--or-d)}
.rs-city{display:flex;align-items:center;gap:4px;color:var(--ink3);font-size:11px;font-weight:500}

/* Actions */
.rs-actions{display:flex;gap:6px;margin-bottom:9px}
.rs-go-btn{flex:1;display:flex;align-items:center;justify-content:center;gap:4px;padding:8px 10px;border-radius:8px;border:none;background:linear-gradient(135deg,var(--or),var(--or-d));font-family:'Outfit',sans-serif;font-size:12px;font-weight:700;color:#fff;cursor:pointer;transition:all .16s;box-shadow:0 3px 9px rgba(249,115,22,.18)}
.rs-go-btn:hover{background:linear-gradient(135deg,var(--or-d),var(--or-dd))}
.rs-edit-btn{width:35px;height:35px;border-radius:8px;border:1.5px solid #dbeafe;background:#eff6ff;color:#3b82f6;cursor:pointer;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:all .16s}
.rs-edit-btn:hover{background:#3b82f6;color:#fff;border-color:#3b82f6}
.rs-del-btn{width:35px;height:35px;border-radius:8px;border:1.5px solid #fee2e2;background:#fef2f2;color:var(--red);cursor:pointer;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:all .16s}
.rs-del-btn:hover{background:var(--red);color:#fff;border-color:var(--red)}

/* Toggle strip */
.rs-strip{display:flex;align-items:center;justify-content:center;gap:6px;width:100%;padding:8px;border:none;cursor:pointer;font-family:'Outfit',sans-serif;font-size:11px;font-weight:600;transition:all .16s;border-top:1.5px solid var(--bdr)}
.rs-strip-open  {background:#f0fdf4;color:#15803d}
.rs-strip-open:hover{background:#dcfce7}
.rs-strip-closed{background:var(--bg);color:var(--ink3)}
.rs-strip-closed:hover{background:var(--bdr2)}
.rs-strip:disabled{opacity:.6;cursor:not-allowed}

/* Empty */
.rs-empty{text-align:center;padding:70px 20px}
.rs-empty-em   {font-size:52px;margin-bottom:12px}
.rs-empty-title{font-size:18px;font-weight:700;color:var(--ink);margin-bottom:5px}
.rs-empty-sub  {font-size:13px;color:var(--ink3)}

/* Responsive */
@media(max-width:820px){
  .rs-sidebar{display:none}
  .rs-main   {margin-left:0;padding:18px 14px 60px}
  .rs-topbar {flex-direction:column}
  .rs-topbar-right{width:100%}
  .rs-search,.rs-search-wrap{width:100%;min-width:unset}
  .rs-add-btn{width:100%;justify-content:center}
  .rs-grid   {grid-template-columns:1fr}
}
`;

export default RestaurantSelect;







// import { useEffect, useState } from "react";
// import {
//   Plus, Pencil, Trash2, Search, X, CheckCircle, AlertCircle,
//   UtensilsCrossed, IndianRupee, Tag, ToggleLeft, ToggleRight,
//   Filter, GridIcon, List, Sparkles, ChefHat, Clock,
//   TrendingUp, Package, Eye, EyeOff, Loader2, ImageOff,
// } from "lucide-react";
// import axiosInstance from "../../api/axiosInstance";

// const REST_API      = "/Restaurant";
// const MENU_API      = "/MenuItem";
// const CATEGORY_API  = "/Category";

// /* ─── tiny helpers ─── */
// const normalizeId = v => { const n = Number(v); return Number.isFinite(n) ? n : null; };
// const getMenuItemKey = it => it?.menuItemID ?? it?.menuItemId ?? it?.id ?? null;
// const getFoodImage = item => {
//   if (item?.menuItemImage && item.menuItemImage.trim()) return item.menuItemImage;
//   if (item?.imageUrl      && item.imageUrl.trim())      return item.imageUrl;
//   return `https://source.unsplash.com/800x600/?food,${encodeURIComponent(item?.menuItemName || "food")}`;
// };

// /* ─── category colour palette ─── */
// const CAT_COLORS = [
//   "#0d9488","#0891b2","#059669","#3b82f6","#8b5cf6","#ec4899","#f59e0b","#06b6d4",
// ];

// /* ══════════════════════════════════════════════
//    MODAL
// ══════════════════════════════════════════════ */
// const MenuModal = ({ mode, form, setForm, categories, onClose, onSubmit, saving }) => (
//   <div className="mn-overlay" onClick={onClose}>
//     <div className="mn-dialog" onClick={e => e.stopPropagation()}>

//       {/* header stripe */}
//       <div className="mn-dialog-header">
//         <div className="mn-dialog-header-icon">
//           {mode === "add" ? <Plus size={20}/> : <Pencil size={20}/>}
//         </div>
//         <div>
//           <h2 className="mn-dialog-title">{mode === "add" ? "Add Menu Item" : "Edit Menu Item"}</h2>
//           <p className="mn-dialog-sub">{mode === "add" ? "Create a new dish for your menu" : "Update item details"}</p>
//         </div>
//         <button className="mn-dialog-close" onClick={onClose}><X size={18}/></button>
//       </div>

//       <form onSubmit={onSubmit} className="mn-dialog-body">

//         {/* Image preview banner */}
//         {form.menuItemImage && (
//           <div className="mn-img-preview">
//             <img src={form.menuItemImage} alt="preview"
//               onError={e => e.target.style.display="none"}
//               style={{width:"100%",height:"100%",objectFit:"cover"}}/>
//             <div className="mn-img-preview-label">Image preview</div>
//           </div>
//         )}

//         <div className="mn-field-grid">
//           {/* Name */}
//           <div className="mn-field mn-field-full">
//             <label className="mn-label">Item Name <span className="mn-required">*</span></label>
//             <input className="mn-input" placeholder="e.g. Butter Chicken" required
//               value={form.menuItemName}
//               onChange={e => setForm(f => ({...f, menuItemName: e.target.value}))}/>
//           </div>

//           {/* Price */}
//           <div className="mn-field">
//             <label className="mn-label">Price (₹) <span className="mn-required">*</span></label>
//             <div className="mn-input-icon-wrap">
//               <IndianRupee size={14} className="mn-input-prefix-icon"/>
//               <input className="mn-input mn-input-prefixed" type="number" step="0.01" placeholder="299" required
//                 value={form.menuItemPrice}
//                 onChange={e => setForm(f => ({...f, menuItemPrice: e.target.value}))}/>
//             </div>
//           </div>

//           {/* Category */}
//           {categories.length > 0 && (
//             <div className="mn-field">
//               <label className="mn-label">Category</label>
//               <select className="mn-input mn-select"
//                 value={form.categoryID}
//                 onChange={e => setForm(f => ({...f, categoryID: e.target.value}))}>
//                 <option value="">Select category…</option>
//                 {categories.map(cat => (
//                   <option key={cat.categoryID} value={String(cat.categoryID)}>{cat.categoryName}</option>
//                 ))}
//               </select>
//             </div>
//           )}

//           {/* Description */}
//           <div className="mn-field mn-field-full">
//             <label className="mn-label">Description</label>
//             <textarea className="mn-input mn-textarea" rows={3} placeholder="Describe your dish…"
//               value={form.menuItemDescription}
//               onChange={e => setForm(f => ({...f, menuItemDescription: e.target.value}))}/>
//           </div>

//           {/* Image URL */}
//           <div className="mn-field mn-field-full">
//             <label className="mn-label">Image URL</label>
//             <input className="mn-input" placeholder="https://example.com/food.jpg"
//               value={form.menuItemImage}
//               onChange={e => setForm(f => ({...f, menuItemImage: e.target.value}))}/>
//             <p className="mn-hint">Leave empty to auto-generate a food image</p>
//           </div>

//           {/* Availability toggle */}
//           <div className="mn-field mn-field-full">
//             <div className="mn-avail-toggle" onClick={() => setForm(f => ({...f, isAvailable: !f.isAvailable}))}>
//               <div className={`mn-toggle-track ${form.isAvailable ? "mn-toggle-on" : ""}`}>
//                 <div className="mn-toggle-thumb"/>
//               </div>
//               <div>
//                 <span className="mn-toggle-label">{form.isAvailable ? "Available for orders" : "Currently unavailable"}</span>
//                 <span className="mn-toggle-sub">Customers {form.isAvailable ? "can" : "cannot"} order this item</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="mn-dialog-footer">
//           <button type="button" className="mn-btn-ghost" onClick={onClose} disabled={saving}>Cancel</button>
//           <button type="submit" className="mn-btn-primary" disabled={saving}>
//             {saving
//               ? <><Loader2 size={15} className="mn-spin"/> Saving…</>
//               : mode === "add" ? <><Plus size={15}/> Add Item</> : <><Pencil size={15}/> Save Changes</>}
//           </button>
//         </div>
//       </form>

//     </div>
//   </div>
// );

// /* ══════════════════════════════════════════════
//    MAIN COMPONENT
// ══════════════════════════════════════════════ */
// const RestaurantMenu = () => {
//   const [menuItems,          setMenuItems]          = useState([]);
//   const [categories,         setCategories]         = useState([]);
//   const [loading,            setLoading]            = useState(true);
//   const [searchTerm,         setSearchTerm]         = useState("");
//   const [filterCategory,     setFilterCategory]     = useState("All");
//   const [filterAvailability, setFilterAvailability] = useState("All");
//   const [modal,              setModal]              = useState(null); // null | "add" | "edit"
//   const [saving,             setSaving]             = useState(false);
//   const [togglingId,         setTogglingId]         = useState(null);
//   const [viewMode,           setViewMode]           = useState("grid"); // "grid" | "list"
//   const [mounted,            setMounted]            = useState(false);
//   const [restaurant,         setRestaurant]         = useState(null);

//   const [form, setForm] = useState({
//     menuItemID: null, menuItemName: "", menuItemPrice: "",
//     menuItemDescription: "", categoryID: "", isAvailable: true, menuItemImage: "",
//   });

//   const restaurantId = (() => {
//     const raw = localStorage.getItem("restaurantId");
//     return raw ? parseInt(raw, 10) : null;
//   })();

//   useEffect(() => {
//     if (restaurantId) loadData();
//     else setLoading(false);
//     setTimeout(() => setMounted(true), 80);
//     // eslint-disable-next-line
//   }, [restaurantId]);

//   /* ─── load data ─── */
//   const loadData = async () => {
//     try {
//       const restRes = await axiosInstance.get(REST_API);
//       const restaurants = Array.isArray(restRes?.data) ? restRes.data : [];
//       const current = restaurants.find(r => Number(r.restaurantID) === Number(restaurantId));
//       if (!current) { setLoading(false); return; }
//       setRestaurant(current);

//       let menuData = [];
//       const matchesRestaurant = mi => {
//         const candidates = [mi?.restaurantID, mi?.restaurantId, mi?.RestaurantID,
//           mi?.restaurant?.restaurantID, mi?.restaurant?.restaurantId];
//         if (candidates.some(c => c != null && normalizeId(c) === normalizeId(current.restaurantID))) return true;
//         const nameA = (mi?.restaurantName || mi?.restaurant?.name || "").toLowerCase().trim();
//         const nameB = (current?.name || "").toLowerCase().trim();
//         return nameA && nameB && (nameA === nameB || nameA.includes(nameB) || nameB.includes(nameA));
//       };

//       try {
//         const r1 = await axiosInstance.get(`${MENU_API}/restaurant/${current.restaurantID}?includeUnavailable=true`);
//         menuData = Array.isArray(r1?.data) ? r1.data : [];
//         if (!menuData.length) {
//           const r2 = await axiosInstance.get(`${MENU_API}/restaurant/${current.restaurantID}`);
//           menuData = Array.isArray(r2?.data) ? r2.data : [];
//         }
//       } catch {}

//       try {
//         const allR = await axiosInstance.get(MENU_API);
//         const allData = Array.isArray(allR?.data) ? allR.data : [];
//         const existingKeys = new Set(menuData.map(getMenuItemKey).filter(Boolean));
//         const missing = allData.filter(m => matchesRestaurant(m) && !existingKeys.has(getMenuItemKey(m)));
//         menuData = [...menuData, ...missing];
//         if (!menuData.length)
//           menuData = allData.filter(m => (m?.restaurantName||m?.restaurant?.name||"").toLowerCase() === (current?.name||"").toLowerCase());
//       } catch {}

//       const keyed = new Map();
//       menuData.forEach(mi => {
//         const k = getMenuItemKey(mi) ?? `${mi?.menuItemName||""}_${mi?.menuItemPrice??""}`;
//         if (!keyed.has(k)) keyed.set(k, mi);
//       });
//       setMenuItems(Array.from(keyed.values()).sort((a,b) =>
//         (a?.menuItemName||"").localeCompare(b?.menuItemName||"")));

//       try {
//         const catR = await axiosInstance.get(CATEGORY_API);
//         setCategories(Array.isArray(catR?.data) ? catR.data : []);
//       } catch { setCategories([]); }
//     } catch (e) { console.error(e); }
//     finally { setLoading(false); }
//   };

//   /* ─── open add modal ─── */
//   const handleAdd = () => {
//     setForm({ menuItemID:null, menuItemName:"", menuItemPrice:"",
//       menuItemDescription:"", categoryID: categories.length ? String(categories[0].categoryID) : "",
//       isAvailable:true, menuItemImage:"" });
//     setModal("add");
//   };

//   /* ─── open edit modal ─── */
//   const handleEdit = item => {
//     setForm({ menuItemID:item.menuItemID, menuItemName:item.menuItemName,
//       menuItemPrice:item.menuItemPrice, menuItemDescription:item.menuItemDescription||"",
//       categoryID: item.categoryID ? String(item.categoryID) : "",
//       isAvailable:item.isAvailable, menuItemImage:item.imageUrl||"" });
//     setModal("edit");
//   };

//   /* ─── submit ─── */
//   const handleSubmit = async e => {
//     e.preventDefault();
//     if (!restaurantId || !restaurant) { alert("Restaurant not found."); return; }
//     const price = parseFloat(form.menuItemPrice);
//     if (isNaN(price) || price <= 0) { alert("Enter a valid price."); return; }
//     if (categories.length && !form.categoryID) { alert("Please select a category."); return; }
//     try {
//       setSaving(true);
//       const payload = {
//         RestaurantID: restaurantId,
//         MenuItemName: form.menuItemName.trim(),
//         MenuItemPrice: price,
//         CategoryID: form.categoryID ? parseInt(form.categoryID,10) : null,
//         ImageUrl: form.menuItemImage?.trim() ||
//           `https://source.unsplash.com/800x600/?food,${encodeURIComponent(form.menuItemName)}`,
//       };
//       if (modal === "edit") await axiosInstance.put(`${MENU_API}/${form.menuItemID}`, payload);
//       else                  await axiosInstance.post(MENU_API, payload);
//       setModal(null);
//       await loadData();
//     } catch (err) {
//       alert("Failed: " + (err.response?.data?.message || err.message || "Unknown error"));
//     } finally { setSaving(false); }
//   };

//   /* ─── toggle availability ─── */
//   const handleToggle = async item => {
//     const newStatus = !item.isAvailable;
//     setTogglingId(item.menuItemID);
//     setMenuItems(prev => prev.map(i => i.menuItemID === item.menuItemID ? {...i, isAvailable:newStatus} : i));
//     try {
//       await axiosInstance.patch(`${MENU_API}/${item.menuItemID}/availability`, null, { params:{ isAvailable:newStatus } });
//     } catch (err) {
//       alert("Failed: " + (err.response?.data?.message || err.message));
//       setMenuItems(prev => prev.map(i => i.menuItemID === item.menuItemID ? {...i, isAvailable:item.isAvailable} : i));
//     } finally { setTogglingId(null); }
//   };

//   /* ─── delete ─── */
//   const handleDelete = async id => {
//     if (!window.confirm("Delete this menu item?")) return;
//     try { await axiosInstance.delete(`${MENU_API}/${id}`); await loadData(); }
//     catch { alert("Failed to delete item."); }
//   };

//   /* ─── filter ─── */
//   const filteredItems = menuItems.filter(item => {
//     const name = (item?.menuItemName||"").toLowerCase();
//     const desc = (item?.menuItemDescription||"").toLowerCase();
//     const matchSearch = name.includes(searchTerm.toLowerCase()) || desc.includes(searchTerm.toLowerCase());
//     const selCat = categories.find(c => String(c.categoryID) === String(filterCategory));
//     const matchCat = filterCategory === "All" ||
//       String(item?.categoryID) === String(filterCategory) ||
//       item?.categoryName === selCat?.categoryName;
//     const matchAvail = filterAvailability === "All" ||
//       (filterAvailability === "Available" && item?.isAvailable) ||
//       (filterAvailability === "Unavailable" && !item?.isAvailable);
//     return matchSearch && matchCat && matchAvail;
//   });

//   const availableCount   = menuItems.filter(i => i.isAvailable).length;
//   const unavailableCount = menuItems.filter(i => !i.isAvailable).length;
//   const rName = restaurant?.name || restaurant?.restaurantName || "Your Restaurant";

//   /* ─── loading screen ─── */
//   if (loading) return (
//     <>
//       <style>{CSS}</style>
//       <div className="mn-splash">
//         <div className="mn-splash-ring"/>
//         <ChefHat size={30} className="mn-splash-ico mn-spin-slow"/>
//         <p className="mn-splash-txt">Loading menu…</p>
//         <div className="mn-splash-bar-wrap"><div className="mn-splash-bar"/></div>
//       </div>
//     </>
//   );

//   return (
//     <>
//       <style>{CSS}</style>

//       {/* MODAL */}
//       {modal && (
//         <MenuModal mode={modal} form={form} setForm={setForm}
//           categories={categories} onClose={() => setModal(null)}
//           onSubmit={handleSubmit} saving={saving}/>
//       )}

//       <div className={`mn-root ${mounted ? "mn-mounted" : ""}`}>

//         {/* ── HERO HEADER ── */}
//         <div className="mn-hero">
//           <div className="mn-hero-bg"/>
//           <div className="mn-hero-content">
//             <div className="mn-hero-left">
//               <div className="mn-hero-eyebrow">
//                 <ChefHat size={13}/> Menu Management
//               </div>
//               <h1 className="mn-hero-title">{rName}</h1>
//               <p className="mn-hero-sub">
//                 Craft your menu · Set prices · Control availability
//               </p>
//             </div>
//             <button className="mn-hero-add-btn" onClick={handleAdd}>
//               <Plus size={18}/> Add New Item
//             </button>
//           </div>
//         </div>

//         <div className="mn-body">

//           {/* ── STAT STRIP ── */}
//           <div className="mn-stat-strip">
//             {[
//               { icon:<UtensilsCrossed size={22}/>, label:"Total Items",   val:menuItems.length,  accent:"#0d9488", bg:"#f0fdfa" },
//               { icon:<CheckCircle     size={22}/>, label:"Available",     val:availableCount,    accent:"#16a34a", bg:"#f0fdf4" },
//               { icon:<EyeOff          size={22}/>, label:"Unavailable",   val:unavailableCount,  accent:"#dc2626", bg:"#fef2f2" },
//               { icon:<Tag             size={22}/>, label:"Categories",    val:categories.length, accent:"#7c3aed", bg:"#f5f3ff" },
//             ].map((s,i) => (
//               <div key={i} className="mn-stat" style={{"--acc":s.accent, "--bg":s.bg, animationDelay:`${i*60}ms`}}>
//                 <div className="mn-stat-icon">{s.icon}</div>
//                 <div>
//                   <div className="mn-stat-val">{s.val}</div>
//                   <div className="mn-stat-lbl">{s.label}</div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* ── FILTER BAR ── */}
//           <div className="mn-filter-bar">
//             {/* Search */}
//             <div className="mn-search-wrap">
//               <Search size={15} className="mn-search-ico"/>
//               <input className="mn-search" placeholder="Search dishes…"
//                 value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/>
//               {searchTerm && <button className="mn-search-clear" onClick={() => setSearchTerm("")}><X size={12}/></button>}
//             </div>

//             {/* Category pills */}
//             <div className="mn-cat-pills">
//               <button className={`mn-cat-pill ${filterCategory==="All"?"mn-cat-pill-on":""}`}
//                 onClick={() => setFilterCategory("All")}>All</button>
//               {categories.map((cat,i) => (
//                 <button key={cat.categoryID}
//                   className={`mn-cat-pill ${filterCategory===String(cat.categoryID)?"mn-cat-pill-on":""}`}
//                   style={filterCategory===String(cat.categoryID) ? {"--pill-color":CAT_COLORS[i%CAT_COLORS.length]} : {}}
//                   onClick={() => setFilterCategory(String(cat.categoryID))}>
//                   {cat.categoryName}
//                 </button>
//               ))}
//             </div>

//             {/* Right controls */}
//             <div className="mn-filter-right">
//               <select className="mn-avail-select"
//                 value={filterAvailability} onChange={e => setFilterAvailability(e.target.value)}>
//                 <option value="All">All items</option>
//                 <option value="Available">Available</option>
//                 <option value="Unavailable">Unavailable</option>
//               </select>
//               <div className="mn-view-toggle">
//                 <button className={`mn-view-btn ${viewMode==="grid"?"mn-view-on":""}`} onClick={() => setViewMode("grid")} title="Grid view">
//                   <GridIcon size={14}/>
//                 </button>
//                 <button className={`mn-view-btn ${viewMode==="list"?"mn-view-on":""}`} onClick={() => setViewMode("list")} title="List view">
//                   <List size={14}/>
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* ── RESULTS INFO ── */}
//           {filteredItems.length > 0 && (
//             <div className="mn-results-info">
//               <span>{filteredItems.length} item{filteredItems.length!==1?"s":""}</span>
//               {(searchTerm || filterCategory!=="All" || filterAvailability!=="All") && (
//                 <button className="mn-clear-filters" onClick={() => {
//                   setSearchTerm(""); setFilterCategory("All"); setFilterAvailability("All");
//                 }}>Clear filters ×</button>
//               )}
//             </div>
//           )}

//           {/* ── EMPTY STATE ── */}
//           {filteredItems.length === 0 && (
//             <div className="mn-empty">
//               <div className="mn-empty-icon"><UtensilsCrossed size={44}/></div>
//               <p className="mn-empty-title">{menuItems.length === 0 ? "No menu items yet" : "No results found"}</p>
//               <p className="mn-empty-sub">
//                 {menuItems.length === 0
//                   ? "Start building your menu by adding your first dish"
//                   : "Try adjusting your search or filters"}
//               </p>
//               {menuItems.length === 0 && (
//                 <button className="mn-hero-add-btn" style={{marginTop:20}} onClick={handleAdd}>
//                   <Plus size={16}/> Add First Item
//                 </button>
//               )}
//             </div>
//           )}

//           {/* ── GRID VIEW ── */}
//           {filteredItems.length > 0 && viewMode === "grid" && (
//             <div className="mn-grid">
//               {filteredItems.map((item, idx) => {
//                 const catColor = CAT_COLORS[categories.findIndex(c => String(c.categoryID) === String(item.categoryID)) % CAT_COLORS.length] || "#0d9488";
//                 const isToggling = togglingId === item.menuItemID;
//                 return (
//                   <article key={item.menuItemID} className={`mn-card ${!item.isAvailable?"mn-card-unavail":""}`}
//                     style={{animationDelay:`${idx*40}ms`}}>

//                     {/* Image */}
//                     <div className="mn-card-img-wrap">
//                       <img src={getFoodImage(item)} alt={item.menuItemName}
//                         className="mn-card-img"
//                         onError={e => { e.target.style.display="none"; e.target.nextSibling.style.display="flex"; }}/>
//                       <div className="mn-card-img-fallback" style={{display:"none"}}>
//                         <ImageOff size={28}/>
//                       </div>
//                       {/* Price badge */}
//                       <div className="mn-price-badge">
//                         <IndianRupee size={11}/>
//                         <span>{Number(item.menuItemPrice).toFixed(0)}</span>
//                       </div>
//                       {/* Unavailable overlay */}
//                       {!item.isAvailable && (
//                         <div className="mn-unavail-overlay">
//                           <EyeOff size={20}/>
//                           <span>Unavailable</span>
//                         </div>
//                       )}
//                       {/* Availability dot */}
//                       <div className={`mn-avail-dot ${item.isAvailable?"mn-dot-on":"mn-dot-off"}`}/>
//                     </div>

//                     {/* Body */}
//                     <div className="mn-card-body">
//                       <div className="mn-card-top">
//                         <h3 className="mn-card-name">{item.menuItemName}</h3>
//                         {item.categoryName && (
//                           <span className="mn-card-cat" style={{"--cc":catColor}}>
//                             {item.categoryName}
//                           </span>
//                         )}
//                       </div>
//                       {item.menuItemDescription && (
//                         <p className="mn-card-desc">{item.menuItemDescription}</p>
//                       )}

//                       {/* Actions */}
//                       <div className="mn-card-actions">
//                         <button className={`mn-toggle-btn ${item.isAvailable?"mn-toggle-avail":"mn-toggle-unavail"}`}
//                           onClick={() => handleToggle(item)} disabled={isToggling}>
//                           {isToggling
//                             ? <Loader2 size={12} className="mn-spin"/>
//                             : item.isAvailable ? <ToggleRight size={13}/> : <ToggleLeft size={13}/>}
//                           {isToggling ? "Updating…" : item.isAvailable ? "Available" : "Unavailable"}
//                         </button>
//                         <button className="mn-icon-btn mn-edit-btn" onClick={() => handleEdit(item)} title="Edit">
//                           <Pencil size={13}/>
//                         </button>
//                         <button className="mn-icon-btn mn-del-btn" onClick={() => handleDelete(item.menuItemID)} title="Delete">
//                           <Trash2 size={13}/>
//                         </button>
//                       </div>
//                     </div>
//                   </article>
//                 );
//               })}
//             </div>
//           )}

//           {/* ── LIST VIEW ── */}
//           {filteredItems.length > 0 && viewMode === "list" && (
//             <div className="mn-list">
//               {filteredItems.map((item, idx) => {
//                 const catColor = CAT_COLORS[categories.findIndex(c => String(c.categoryID) === String(item.categoryID)) % CAT_COLORS.length] || "#0d9488";
//                 const isToggling = togglingId === item.menuItemID;
//                 return (
//                   <div key={item.menuItemID} className={`mn-list-row ${!item.isAvailable?"mn-list-unavail":""}`}
//                     style={{animationDelay:`${idx*30}ms`}}>
//                     <div className="mn-list-img-wrap">
//                       <img src={getFoodImage(item)} alt={item.menuItemName}
//                         className="mn-list-img"
//                         onError={e => { e.target.style.display="none"; }}/>
//                       {!item.isAvailable && <div className="mn-list-unavail-mark"><EyeOff size={12}/></div>}
//                     </div>
//                     <div className="mn-list-info">
//                       <div className="mn-list-name-row">
//                         <h3 className="mn-list-name">{item.menuItemName}</h3>
//                         {item.categoryName && (
//                           <span className="mn-card-cat" style={{"--cc":catColor}}>{item.categoryName}</span>
//                         )}
//                       </div>
//                       {item.menuItemDescription && (
//                         <p className="mn-list-desc">{item.menuItemDescription}</p>
//                       )}
//                     </div>
//                     <div className="mn-list-price">
//                       <IndianRupee size={13}/>
//                       {Number(item.menuItemPrice).toFixed(0)}
//                     </div>
//                     <div className="mn-list-actions">
//                       <button className={`mn-toggle-btn ${item.isAvailable?"mn-toggle-avail":"mn-toggle-unavail"}`}
//                         onClick={() => handleToggle(item)} disabled={isToggling} style={{minWidth:120}}>
//                         {isToggling ? <Loader2 size={12} className="mn-spin"/> : item.isAvailable ? <ToggleRight size={13}/> : <ToggleLeft size={13}/>}
//                         {isToggling ? "…" : item.isAvailable ? "Available" : "Unavailable"}
//                       </button>
//                       <button className="mn-icon-btn mn-edit-btn" onClick={() => handleEdit(item)}><Pencil size={13}/></button>
//                       <button className="mn-icon-btn mn-del-btn" onClick={() => handleDelete(item.menuItemID)}><Trash2 size={13}/></button>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           )}

//         </div>{/* end body */}
//       </div>
//     </>
//   );
// };

// /* ══════════════════════════════════════════════════════
//    CSS  —  Teal restaurant theme
//    Fonts: Plus Jakarta Sans (display) + DM Serif Display + DM Sans (body)
// ══════════════════════════════════════════════════════ */
// const CSS = `
// @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;600;700&display=swap');

// *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

// :root{
//   --teal:      #0d9488;
//   --teal-d:    #0f766e;
//   --teal-dd:   #115e59;
//   --teal-pale: #f0fdfa;
//   --teal-mid:  #ccfbf1;
//   --teal-soft: #99f6e4;
//   --text:      #134e4a;
//   --text2:     #3d7a72;
//   --text3:     #7fb8b2;
//   --text4:     #5ba8a4;
//   --border:    #d1f5ef;
//   --border2:   #e8faf7;
//   --bg:        #f0faf8;
//   --bg2:       #e6f7f4;
//   --white:     #ffffff;
//   --red:       #ef4444;
//   --grn:       #22c55e;
//   --sh:        0 2px 12px rgba(13,148,136,0.08), 0 1px 3px rgba(0,0,0,0.04);
//   --sh-md:     0 8px 32px rgba(13,148,136,0.18), 0 2px 8px rgba(0,0,0,0.06);
//   --sh-lg:     0 20px 60px rgba(13,148,136,0.16), 0 8px 20px rgba(0,0,0,0.06);
//   font-family: 'DM Sans', sans-serif;
// }

// .mn-spin      { animation: _spin  .8s linear   infinite; }
// .mn-spin-slow { animation: _spin 2.4s linear   infinite; }
// @keyframes _spin { to{transform:rotate(360deg)} }
// @keyframes _fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
// @keyframes _slideIn{ from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:translateY(0)} }

// /* ── SPLASH ── */
// .mn-splash{
//   min-height:100vh; display:flex; flex-direction:column;
//   align-items:center; justify-content:center; gap:16px;
//   background:var(--bg); position:relative; overflow:hidden;
// }
// .mn-splash::before{
//   content:''; position:absolute; width:500px; height:500px;
//   border-radius:50%; top:-150px; left:-100px;
//   background:radial-gradient(circle,var(--teal-soft),transparent);
//   opacity:.4; pointer-events:none;
// }
// .mn-splash-ring{
//   width:70px; height:70px; border-radius:50%;
//   border:3px solid var(--teal-mid); border-top-color:var(--teal);
//   animation:_spin .9s linear infinite; position:absolute;
// }
// .mn-splash-ico{ color:var(--teal); z-index:1; position:relative; }
// .mn-splash-txt{ font-size:15px; font-weight:700; color:var(--text2); font-family:'Plus Jakarta Sans',sans-serif; }
// .mn-splash-bar-wrap{ width:190px; height:4px; background:var(--teal-mid); border-radius:4px; overflow:hidden; }
// .mn-splash-bar{
//   height:100%; width:42%; border-radius:4px;
//   background:linear-gradient(90deg,var(--teal),var(--teal-d));
//   animation:_sweep 1.4s ease-in-out infinite;
// }
// @keyframes _sweep{ 0%{transform:translateX(-200%)} 100%{transform:translateX(400%)} }

// /* ── ROOT ── */
// .mn-root{ background:var(--bg); min-height:100vh; }
// .mn-root.mn-mounted .mn-hero,
// .mn-root.mn-mounted .mn-stat-strip,
// .mn-root.mn-mounted .mn-filter-bar{ animation:_slideIn .5s cubic-bezier(.22,1,.36,1) both; }

// /* ── HERO HEADER ── */
// .mn-hero{
//   position:relative; overflow:hidden;
//   background:linear-gradient(135deg, var(--teal-pale) 0%, var(--teal-mid) 60%, var(--teal-soft) 100%);
//   border-bottom:2px solid var(--teal-mid);
//   padding:36px 44px 32px;
// }
// .mn-hero-bg{
//   position:absolute; inset:0; pointer-events:none;
//   background:
//     radial-gradient(circle 280px at 90% 50%, rgba(13,148,136,.15), transparent),
//     radial-gradient(circle 180px at 10% 80%, rgba(153,246,228,.25), transparent);
// }
// .mn-hero::before,.mn-hero::after{
//   content:''; position:absolute; border-radius:50%;
//   background:rgba(13,148,136,0.08); pointer-events:none;
// }
// .mn-hero::before{ width:320px; height:320px; top:-120px; right:-60px; }
// .mn-hero::after { width:160px; height:160px; bottom:-60px; left:30%; }

// .mn-hero-content{
//   position:relative; z-index:1;
//   display:flex; align-items:center; justify-content:space-between; gap:20px; flex-wrap:wrap;
// }
// .mn-hero-eyebrow{
//   display:inline-flex; align-items:center; gap:6px;
//   font-size:11px; font-weight:800; color:var(--teal-dd);
//   letter-spacing:.09em; text-transform:uppercase;
//   background:rgba(255,255,255,0.70); border:1.5px solid rgba(13,148,136,.25);
//   padding:4px 12px; border-radius:100px; margin-bottom:10px;
//   font-family:'Plus Jakarta Sans',sans-serif; backdrop-filter:blur(6px);
// }
// .mn-hero-title{
//   font-family:'DM Serif Display',serif;
//   font-size:clamp(24px,3vw,36px); font-weight:400;
//   color:var(--text); letter-spacing:-.4px; line-height:1.1; margin-bottom:6px;
// }
// .mn-hero-sub{
//   font-size:13.5px; color:var(--text2); font-weight:600;
//   font-family:'DM Sans',sans-serif;
// }
// .mn-hero-add-btn{
//   display:inline-flex; align-items:center; gap:8px;
//   padding:13px 24px; border-radius:14px; border:none; cursor:pointer;
//   background:linear-gradient(135deg,var(--teal),var(--teal-d));
//   font-family:'Plus Jakarta Sans',sans-serif; font-size:14px; font-weight:700; color:#fff;
//   box-shadow:0 6px 20px rgba(13,148,136,0.35), inset 0 1px 0 rgba(255,255,255,.15);
//   transition:all .2s; white-space:nowrap;
// }
// .mn-hero-add-btn:hover{
//   transform:translateY(-2px);
//   box-shadow:0 10px 28px rgba(13,148,136,0.44);
// }

// /* ── BODY ── */
// .mn-body{ padding:28px 44px 60px; }

// /* ── STAT STRIP ── */
// .mn-stat-strip{
//   display:grid; grid-template-columns:repeat(4,1fr); gap:16px;
//   margin-bottom:26px;
// }
// .mn-stat{
//   display:flex; align-items:center; gap:14px;
//   background:var(--white); border:1.5px solid var(--border2);
//   border-radius:16px; padding:18px 20px;
//   box-shadow:var(--sh);
//   animation:_fadeUp .45s cubic-bezier(.22,1,.36,1) both;
//   transition:transform .2s, box-shadow .2s;
//   position:relative; overflow:hidden;
// }
// .mn-stat::before{
//   content:''; position:absolute; left:0; top:0; bottom:0;
//   width:4px; background:var(--acc); border-radius:0 4px 4px 0;
// }
// .mn-stat:hover{ transform:translateY(-3px); box-shadow:var(--sh-md); }
// .mn-stat-icon{
//   width:48px; height:48px; border-radius:13px; flex-shrink:0;
//   background:var(--bg); color:var(--acc);
//   display:flex; align-items:center; justify-content:center;
// }
// .mn-stat-val{ font-size:26px; font-weight:900; color:var(--text); font-family:'Plus Jakarta Sans',sans-serif; line-height:1; }
// .mn-stat-lbl{ font-size:12px; font-weight:700; color:var(--text3); margin-top:3px; }

// /* ── FILTER BAR ── */
// .mn-filter-bar{
//   background:var(--white); border:1.5px solid var(--border2);
//   border-radius:18px; padding:16px 20px;
//   box-shadow:var(--sh); margin-bottom:20px;
//   display:flex; align-items:center; gap:14px; flex-wrap:wrap;
// }
// .mn-search-wrap{
//   position:relative; display:flex; align-items:center;
//   flex-shrink:0;
// }
// .mn-search-ico{ position:absolute; left:13px; color:var(--text3); pointer-events:none; }
// .mn-search{
//   padding:10px 34px 10px 38px;
//   border:1.5px solid var(--border); border-radius:11px;
//   font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600;
//   color:var(--text); background:var(--bg2); outline:none;
//   min-width:200px; transition:all .18s;
// }
// .mn-search:focus{ border-color:var(--teal); box-shadow:0 0 0 3px rgba(13,148,136,.10); background:#fff; }
// .mn-search::placeholder{ color:var(--text3); }
// .mn-search-clear{
//   position:absolute; right:10px; width:20px; height:20px;
//   border-radius:50%; border:none; background:var(--teal-mid);
//   color:var(--teal-d); display:flex; align-items:center; justify-content:center;
//   cursor:pointer; transition:all .15s;
// }
// .mn-search-clear:hover{ background:var(--teal); color:#fff; }

// /* Category pills */
// .mn-cat-pills{ display:flex; flex-wrap:wrap; gap:7px; flex:1; }
// .mn-cat-pill{
//   padding:6px 14px; border-radius:100px; border:1.5px solid var(--border);
//   background:var(--bg2); font-family:'DM Sans',sans-serif;
//   font-size:12px; font-weight:700; color:var(--text2);
//   cursor:pointer; transition:all .18s; white-space:nowrap;
// }
// .mn-cat-pill:hover{ border-color:var(--teal-mid); background:var(--teal-pale); }
// .mn-cat-pill-on{
//   background:var(--pill-color,var(--teal)) !important;
//   border-color:var(--pill-color,var(--teal)) !important;
//   color:#fff !important;
//   box-shadow:0 3px 10px rgba(13,148,136,.28);
// }

// .mn-filter-right{ display:flex; align-items:center; gap:10px; margin-left:auto; }
// .mn-avail-select{
//   padding:9px 14px; border:1.5px solid var(--border); border-radius:11px;
//   font-family:'DM Sans',sans-serif; font-size:12px; font-weight:700; color:var(--text2);
//   background:var(--bg2); outline:none; cursor:pointer; transition:border-color .18s;
// }
// .mn-avail-select:focus{ border-color:var(--teal); }

// .mn-view-toggle{ display:flex; gap:2px; background:var(--bg2); border-radius:9px; padding:3px; border:1.5px solid var(--border); }
// .mn-view-btn{
//   width:30px; height:30px; border-radius:7px; border:none; background:transparent;
//   color:var(--text3); display:flex; align-items:center; justify-content:center;
//   cursor:pointer; transition:all .15s;
// }
// .mn-view-btn:hover{ background:var(--teal-pale); color:var(--teal); }
// .mn-view-on{ background:var(--white) !important; color:var(--teal-d) !important; box-shadow:0 1px 4px rgba(0,0,0,.1); }

// /* results info */
// .mn-results-info{
//   font-size:12px; font-weight:700; color:var(--text3);
//   margin-bottom:18px; display:flex; align-items:center; gap:12px;
// }
// .mn-clear-filters{
//   background:none; border:none; cursor:pointer; font-family:'DM Sans',sans-serif;
//   font-size:12px; font-weight:700; color:var(--teal-d); transition:opacity .15s;
// }
// .mn-clear-filters:hover{ opacity:.7; }

// /* ── GRID ── */
// .mn-grid{
//   display:grid;
//   grid-template-columns:repeat(auto-fill,minmax(250px,1fr));
//   gap:20px;
// }

// /* ── CARD ── */
// .mn-card{
//   background:var(--white); border-radius:20px;
//   border:1.5px solid var(--border2);
//   overflow:hidden; box-shadow:var(--sh);
//   transition:all .28s cubic-bezier(.22,1,.36,1);
//   animation:_fadeUp .42s cubic-bezier(.22,1,.36,1) both;
//   display:flex; flex-direction:column;
// }
// .mn-card:hover{
//   transform:translateY(-5px);
//   box-shadow:var(--sh-md);
//   border-color:var(--teal-soft);
// }
// .mn-card-unavail{ opacity:0.72; }

// .mn-card-img-wrap{
//   position:relative; height:180px; overflow:hidden; background:var(--bg2);
//   flex-shrink:0;
// }
// .mn-card-img{
//   width:100%; height:100%; object-fit:cover;
//   transition:transform .4s ease;
// }
// .mn-card:hover .mn-card-img{ transform:scale(1.06); }
// .mn-card-img-fallback{
//   width:100%; height:100%; display:none; align-items:center; justify-content:center;
//   color:var(--teal-soft); font-size:28px; background:var(--bg2);
// }
// .mn-price-badge{
//   position:absolute; top:10px; right:10px;
//   display:flex; align-items:center; gap:2px;
//   background:rgba(255,255,255,0.94); backdrop-filter:blur(8px);
//   border:1.5px solid var(--teal-mid);
//   border-radius:100px; padding:4px 10px;
//   font-size:13px; font-weight:900; color:var(--text);
//   font-family:'Plus Jakarta Sans',sans-serif;
//   box-shadow:0 2px 8px rgba(0,0,0,.1);
// }
// .mn-unavail-overlay{
//   position:absolute; inset:0;
//   background:rgba(19,78,74,.65);
//   display:flex; flex-direction:column; align-items:center; justify-content:center;
//   gap:6px; color:#fff; font-weight:700; font-size:13px;
//   font-family:'Plus Jakarta Sans',sans-serif;
// }
// .mn-avail-dot{
//   position:absolute; bottom:10px; left:10px;
//   width:10px; height:10px; border-radius:50%;
//   border:2px solid #fff; box-shadow:0 1px 4px rgba(0,0,0,.2);
// }
// .mn-dot-on { background:#22c55e; }
// .mn-dot-off{ background:#ef4444; }

// .mn-card-body{ padding:14px 16px 14px; display:flex; flex-direction:column; gap:8px; flex:1; }
// .mn-card-top{ display:flex; align-items:flex-start; justify-content:space-between; gap:8px; }
// .mn-card-name{
//   font-size:15px; font-weight:700; color:var(--text);
//   font-family:'Plus Jakarta Sans',sans-serif; line-height:1.2;
//   flex:1; min-width:0;
// }
// .mn-card-cat{
//   display:inline-block; padding:2px 9px; border-radius:100px;
//   font-size:10px; font-weight:800; letter-spacing:.04em;
//   background:color-mix(in srgb,var(--cc) 12%,white);
//   color:var(--cc);
//   border:1px solid color-mix(in srgb,var(--cc) 28%,transparent);
//   white-space:nowrap; flex-shrink:0;
//   font-family:'DM Sans',sans-serif;
// }
// .mn-card-desc{
//   font-size:12px; color:var(--text3); line-height:1.5;
//   display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;
// }
// .mn-card-actions{ display:flex; gap:6px; margin-top:auto; }

// /* ── LIST VIEW ── */
// .mn-list{ display:flex; flex-direction:column; gap:10px; }
// .mn-list-row{
//   background:var(--white); border:1.5px solid var(--border2);
//   border-radius:14px; padding:12px 16px;
//   display:flex; align-items:center; gap:14px;
//   box-shadow:var(--sh);
//   animation:_fadeUp .38s cubic-bezier(.22,1,.36,1) both;
//   transition:all .2s;
// }
// .mn-list-row:hover{ border-color:var(--teal-soft); box-shadow:var(--sh-md); transform:translateX(3px); }
// .mn-list-unavail{ opacity:.72; }
// .mn-list-img-wrap{
//   width:58px; height:58px; border-radius:12px; overflow:hidden;
//   flex-shrink:0; position:relative; background:var(--bg2);
// }
// .mn-list-img{ width:100%; height:100%; object-fit:cover; }
// .mn-list-unavail-mark{
//   position:absolute; inset:0; background:rgba(19,78,74,.55);
//   display:flex; align-items:center; justify-content:center; color:#fff;
// }
// .mn-list-info{ flex:1; min-width:0; }
// .mn-list-name-row{ display:flex; align-items:center; gap:8px; margin-bottom:3px; flex-wrap:wrap; }
// .mn-list-name{ font-size:14px; font-weight:800; color:var(--text); font-family:'Plus Jakarta Sans',sans-serif; }
// .mn-list-desc{ font-size:12px; color:var(--text3); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
// .mn-list-price{
//   display:flex; align-items:center; gap:2px;
//   font-size:16px; font-weight:900; color:var(--text);
//   font-family:'Plus Jakarta Sans',sans-serif; flex-shrink:0;
// }
// .mn-list-actions{ display:flex; align-items:center; gap:7px; flex-shrink:0; }

// /* ── SHARED ACTION BUTTONS ── */
// .mn-toggle-btn{
//   display:flex; align-items:center; gap:5px;
//   padding:7px 13px; border-radius:9px; border:none; cursor:pointer;
//   font-family:'DM Sans',sans-serif; font-size:11px; font-weight:700;
//   transition:all .18s; flex:1;
// }
// .mn-toggle-avail  { background:#f0fdf4; color:#15803d; }
// .mn-toggle-avail:hover{ background:#dcfce7; }
// .mn-toggle-unavail{ background:#fef2f2; color:#dc2626; }
// .mn-toggle-unavail:hover{ background:#fee2e2; }
// .mn-toggle-btn:disabled{ opacity:.6; cursor:not-allowed; }

// .mn-icon-btn{
//   width:34px; height:34px; border-radius:9px; border:none;
//   display:flex; align-items:center; justify-content:center;
//   cursor:pointer; flex-shrink:0; transition:all .16s;
// }
// .mn-edit-btn{ background:#eff6ff; color:#3b82f6; border:1.5px solid #dbeafe; }
// .mn-edit-btn:hover{ background:#3b82f6; color:#fff; border-color:#3b82f6; transform:scale(1.08); }
// .mn-del-btn { background:#fef2f2; color:#ef4444; border:1.5px solid #fee2e2; }
// .mn-del-btn:hover { background:#ef4444; color:#fff; border-color:#ef4444; transform:scale(1.08); }

// /* ── EMPTY ── */
// .mn-empty{
//   text-align:center; padding:80px 24px;
//   background:var(--white); border:1.5px solid var(--border2);
//   border-radius:20px; box-shadow:var(--sh);
// }
// .mn-empty-icon{
//   width:88px; height:88px; border-radius:50%; margin:0 auto 20px;
//   background:var(--teal-pale); color:var(--teal-soft);
//   display:flex; align-items:center; justify-content:center;
//   border:2px solid var(--teal-mid);
// }
// .mn-empty-title{ font-size:20px; font-weight:800; color:var(--text); margin-bottom:8px; font-family:'Plus Jakarta Sans',sans-serif; }
// .mn-empty-sub  { font-size:14px; color:var(--text3); }

// /* ── MODAL OVERLAY ── */
// .mn-overlay{
//   position:fixed; inset:0; z-index:1000;
//   background:rgba(7,52,48,.48); backdrop-filter:blur(7px);
//   display:flex; align-items:center; justify-content:center; padding:20px;
//   animation:_fi .2s ease;
// }
// @keyframes _fi{ from{opacity:0} }
// .mn-dialog{
//   background:var(--white); border-radius:24px;
//   width:100%; max-width:480px; max-height:92vh; overflow-y:auto;
//   box-shadow:var(--sh-lg); border:1.5px solid var(--border);
//   animation:_pi .24s cubic-bezier(.22,1,.36,1);
// }
// @keyframes _pi{ from{opacity:0;transform:scale(.93)} }

// .mn-dialog-header{
//   display:flex; align-items:center; gap:14px;
//   padding:22px 24px 18px;
//   border-bottom:1.5px solid var(--border2);
//   position:sticky; top:0; background:var(--white); z-index:10;
//   border-radius:24px 24px 0 0;
// }
// .mn-dialog-header-icon{
//   width:44px; height:44px; border-radius:13px; flex-shrink:0;
//   background:linear-gradient(135deg,var(--teal),var(--teal-d));
//   display:flex; align-items:center; justify-content:center; color:#fff;
//   box-shadow:0 4px 12px rgba(13,148,136,.3);
// }
// .mn-dialog-title{ font-size:18px; font-weight:800; color:var(--text); font-family:'Plus Jakarta Sans',sans-serif; }
// .mn-dialog-sub  { font-size:12px; color:var(--text3); margin-top:2px; }
// .mn-dialog-close{
//   margin-left:auto; width:32px; height:32px; border-radius:50%;
//   border:none; background:var(--bg2); color:var(--text3);
//   display:flex; align-items:center; justify-content:center;
//   cursor:pointer; transition:all .15s; flex-shrink:0;
// }
// .mn-dialog-close:hover{ background:var(--teal-mid); color:var(--teal-d); }

// .mn-dialog-body{ padding:20px 24px 24px; }

// /* Image preview */
// .mn-img-preview{
//   height:110px; border-radius:12px; overflow:hidden;
//   margin-bottom:16px; background:var(--bg2);
//   border:1.5px solid var(--border); position:relative;
// }
// .mn-img-preview-label{
//   position:absolute; bottom:6px; left:8px;
//   background:rgba(13,78,74,.7); color:#fff;
//   font-size:10px; font-weight:700; padding:2px 8px; border-radius:100px;
// }

// /* Form fields */
// .mn-field-grid{ display:grid; grid-template-columns:1fr 1fr; gap:14px; }
// .mn-field{ display:flex; flex-direction:column; gap:6px; }
// .mn-field-full{ grid-column:1/-1; }
// .mn-label{ font-size:11px; font-weight:800; color:var(--text3); letter-spacing:.06em; text-transform:uppercase; font-family:'DM Sans',sans-serif; }
// .mn-required{ color:#ef4444; }
// .mn-input{
//   padding:10px 13px; border:1.5px solid var(--border);
//   border-radius:10px; font-family:'DM Sans',sans-serif;
//   font-size:13px; font-weight:600; color:var(--text);
//   background:var(--teal-pale); outline:none; width:100%;
//   transition:border-color .18s,box-shadow .18s,background .18s;
// }
// .mn-input:focus{ border-color:var(--teal); background:#fff; box-shadow:0 0 0 3px rgba(13,148,136,.10); }
// .mn-input-icon-wrap{ position:relative; }
// .mn-input-prefix-icon{ position:absolute; left:12px; top:50%; transform:translateY(-50%); color:var(--text3); pointer-events:none; }
// .mn-input-prefixed{ padding-left:30px; }
// .mn-select{ cursor:pointer; }
// .mn-textarea{ resize:vertical; min-height:80px; }
// .mn-hint{ font-size:11px; color:var(--text4); margin-top:2px; }

// /* Availability toggle in modal */
// .mn-avail-toggle{
//   display:flex; align-items:center; gap:14px;
//   background:var(--bg2); border:1.5px solid var(--border);
//   border-radius:12px; padding:13px 16px; cursor:pointer;
//   transition:all .18s;
// }
// .mn-avail-toggle:hover{ border-color:var(--teal-mid); background:var(--teal-pale); }
// .mn-toggle-track{
//   width:44px; height:24px; border-radius:100px; flex-shrink:0;
//   background:#e2e8f0; position:relative; transition:background .2s;
// }
// .mn-toggle-on{ background:var(--teal) !important; }
// .mn-toggle-thumb{
//   position:absolute; top:3px; left:3px;
//   width:18px; height:18px; border-radius:50%;
//   background:#fff; transition:transform .2s;
//   box-shadow:0 1px 3px rgba(0,0,0,.2);
// }
// .mn-toggle-on .mn-toggle-thumb{ transform:translateX(20px); }
// .mn-toggle-label{ font-size:13px; font-weight:700; color:var(--text); display:block; }
// .mn-toggle-sub  { font-size:11px; color:var(--text3); margin-top:1px; }

// .mn-dialog-footer{
//   display:flex; gap:10px; justify-content:flex-end;
//   padding-top:18px; border-top:1.5px solid var(--border2); margin-top:18px;
// }
// .mn-btn-ghost{
//   padding:10px 20px; border-radius:10px; border:1.5px solid var(--border);
//   background:transparent; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:800;
//   color:var(--text2); cursor:pointer; transition:all .15s;
// }
// .mn-btn-ghost:hover{ background:var(--teal-pale); }
// .mn-btn-primary{
//   display:flex; align-items:center; gap:6px;
//   padding:10px 22px; border-radius:10px; border:none; cursor:pointer;
//   background:linear-gradient(135deg,var(--teal),var(--teal-d));
//   font-family:'DM Sans',sans-serif; font-size:13px; font-weight:800; color:#fff;
//   box-shadow:0 4px 14px rgba(13,148,136,.28);
//   transition:all .18s;
// }
// .mn-btn-primary:hover{ background:linear-gradient(135deg,var(--teal-d),var(--teal-dd)); transform:translateY(-1px); }
// .mn-btn-primary:disabled{ opacity:.6; cursor:not-allowed; transform:none; }

// /* ── RESPONSIVE ── */
// @media(max-width:900px){
//   .mn-hero{ padding:24px 20px 22px; }
//   .mn-body{ padding:20px 16px 50px; }
//   .mn-stat-strip{ grid-template-columns:repeat(2,1fr); }
//   .mn-grid{ grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); }
//   .mn-filter-bar{ flex-direction:column; align-items:stretch; }
//   .mn-search-wrap{ width:100%; }
//   .mn-search{ min-width:unset; width:100%; }
//   .mn-filter-right{ justify-content:space-between; }
//   .mn-hero-add-btn{ width:100%; justify-content:center; margin-top:4px; }
// }
// @media(max-width:560px){
//   .mn-stat-strip{ grid-template-columns:1fr 1fr; }
//   .mn-grid{ grid-template-columns:1fr; }
//   .mn-field-grid{ grid-template-columns:1fr; }
//   .mn-hero-title{ font-size:22px; }
// }
// `;

// export default RestaurantMenu;