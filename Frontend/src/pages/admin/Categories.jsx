import React, { useEffect, useState, useRef } from "react";
import {
  Layers, Search, Plus, Edit2, Trash2,
  AlertCircle, X, Check, RefreshCw,
  UtensilsCrossed, Tag, Hash, Sparkles,
} from "lucide-react";
import axiosInstance from "../../api/axiosInstance";

/* ══════════════════════════════════════════════════════════
   COLOUR PALETTE — 12 rotating accent colours for cards
══════════════════════════════════════════════════════════ */
const PALETTES = [
  { bg: "#fff7ed", border: "#fed7aa", icon: "#ea580c", text: "#9a3412", dot: "#f97316" },
  { bg: "#eff6ff", border: "#bfdbfe", icon: "#2563eb", text: "#1e40af", dot: "#3b82f6" },
  { bg: "#f0fdf4", border: "#bbf7d0", icon: "#16a34a", text: "#14532d", dot: "#22c55e" },
  { bg: "#fdf4ff", border: "#e9d5ff", icon: "#9333ea", text: "#581c87", dot: "#a855f7" },
  { bg: "#fff1f2", border: "#fecdd3", icon: "#e11d48", text: "#881337", dot: "#f43f5e" },
  { bg: "#ecfeff", border: "#a5f3fc", icon: "#0891b2", text: "#164e63", dot: "#06b6d4" },
  { bg: "#fefce8", border: "#fef08a", icon: "#ca8a04", text: "#713f12", dot: "#eab308" },
  { bg: "#f0fdfa", border: "#99f6e4", icon: "#0d9488", text: "#134e4a", dot: "#14b8a6" },
  { bg: "#fff7f0", border: "#ffd8b8", icon: "#d97706", text: "#92400e", dot: "#f59e0b" },
  { bg: "#f8f0ff", border: "#ddd6fe", icon: "#7c3aed", text: "#4c1d95", dot: "#8b5cf6" },
  { bg: "#f0fff4", border: "#c6f6d5", icon: "#059669", text: "#065f46", dot: "#10b981" },
  { bg: "#fffbeb", border: "#fde68a", icon: "#b45309", text: "#78350f", dot: "#f59e0b" },
];

const getPalette = (i) => PALETTES[i % PALETTES.length];

/* ── food emoji set for visual flair ─────────────────── */
const FOOD_EMOJIS = ["🍕","🍔","🌮","🍜","🍣","🥗","🍰","🥩","🍱","🥘","🍛","🫕","🥞","🌯","🍲","🥙","🫔","🧆","🥟","🍤"];
const getEmoji = (name, id) => {
  const key = (name || "").toLowerCase();
  if (key.includes("pizza"))    return "🍕";
  if (key.includes("burger"))   return "🍔";
  if (key.includes("taco") || key.includes("mexican")) return "🌮";
  if (key.includes("noodle") || key.includes("pasta")) return "🍜";
  if (key.includes("sushi") || key.includes("japanese")) return "🍣";
  if (key.includes("salad"))    return "🥗";
  if (key.includes("dessert") || key.includes("sweet") || key.includes("cake")) return "🍰";
  if (key.includes("steak") || key.includes("meat") || key.includes("grill")) return "🥩";
  if (key.includes("chinese") || key.includes("bento")) return "🍱";
  if (key.includes("curry") || key.includes("indian")) return "🍛";
  if (key.includes("soup") || key.includes("broth")) return "🍲";
  if (key.includes("wrap") || key.includes("roll")) return "🌯";
  if (key.includes("drink") || key.includes("beverage")) return "🥤";
  if (key.includes("breakfast")) return "🥞";
  if (key.includes("seafood") || key.includes("fish")) return "🦞";
  if (key.includes("veg") || key.includes("vegan")) return "🥦";
  if (key.includes("chicken") || key.includes("poultry")) return "🍗";
  if (key.includes("snack") || key.includes("finger")) return "🍿";
  return FOOD_EMOJIS[id % FOOD_EMOJIS.length];
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
    <div className={`ct-toast ${toast.type === "err" ? "ct-toast-err" : "ct-toast-ok"}`}>
      {toast.type === "err" ? <AlertCircle size={13} /> : <Check size={13} />}
      {toast.msg}
    </div>
  );
};

/* ── Delete modal ─────────────────────────────────────── */
const DeleteModal = ({ category, onConfirm, onClose, busy }) => (
  <div className="ct-overlay" onClick={onClose}>
    <div className="ct-modal" onClick={e => e.stopPropagation()}>
      <button className="ct-modal-x" onClick={onClose}><X size={14} /></button>
      <div className="ct-modal-icon"><Trash2 size={22} /></div>
      <h2 className="ct-modal-title">Delete Category?</h2>
      <p className="ct-modal-body">
        <strong>"{category?.categoryName}"</strong> will be permanently removed.
        Menu items linked to this category may be affected.
      </p>
      <div className="ct-modal-btns">
        <button className="ct-mbtn-ghost" onClick={onClose} disabled={busy}>Cancel</button>
        <button className="ct-mbtn-danger" onClick={onConfirm} disabled={busy}>
          {busy ? <><span className="ct-spin" />Deleting…</> : <><Trash2 size={12} />Delete</>}
        </button>
      </div>
    </div>
  </div>
);

/* ── Add / Edit modal ─────────────────────────────────── */
const FormModal = ({ editing, initialName, onSave, onClose }) => {
  const [name, setName] = useState(initialName || "");
  const [err, setErr]   = useState("");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 60); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setErr("Category name is required."); return; }
    setSaving(true); setErr("");
    const ok = await onSave(name.trim());
    if (!ok) { setErr("Failed to save. Please try again."); setSaving(false); }
  };

  return (
    <div className="ct-overlay" onClick={onClose}>
      <div className="ct-form-modal" onClick={e => e.stopPropagation()}>
        <div className="ct-form-header">
          <div className="ct-form-header-icon">
            {editing ? <Edit2 size={18} /> : <Plus size={18} />}
          </div>
          <div>
            <h2 className="ct-form-title">{editing ? "Edit Category" : "New Category"}</h2>
            <p className="ct-form-sub">{editing ? `Updating: ${editing.categoryName}` : "Add a food category to the platform"}</p>
          </div>
          <button className="ct-form-x" onClick={onClose}><X size={15} /></button>
        </div>

        <form onSubmit={submit} className="ct-form-body">
          {err && (
            <div className="ct-form-err">
              <AlertCircle size={13} /> {err}
            </div>
          )}

          <div className="ct-field">
            <label className="ct-label">Category Name</label>
            <input
              ref={inputRef}
              className="ct-input"
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setErr(""); }}
              placeholder="e.g. Italian, Desserts, Street Food…"
            />
            <span className="ct-input-hint">This name is shown to customers on the ordering app</span>
          </div>

          {/* Preview card */}
          {name.trim() && (
            <div className="ct-preview">
              <span className="ct-preview-label">Preview</span>
              <div className="ct-preview-card">
                <span className="ct-preview-emoji">{getEmoji(name, 0)}</span>
                <span className="ct-preview-name">{name}</span>
              </div>
            </div>
          )}

          <div className="ct-form-btns">
            <button type="button" className="ct-fbtn-ghost" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="ct-fbtn-primary" disabled={saving}>
              {saving
                ? <><span className="ct-spin ct-spin-white" />Saving…</>
                : editing
                  ? <><Check size={14} />Save Changes</>
                  : <><Plus size={14} />Create Category</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ── Category card ────────────────────────────────────── */
const CategoryCard = ({ cat, idx, onEdit, onDelete }) => {
  const [hov, setHov] = useState(false);
  const pal = getPalette(idx);
  const emoji = getEmoji(cat.categoryName, cat.categoryID);

  return (
    <div
      className={`ct-card ${hov ? "ct-card-hov" : ""}`}
      style={{ "--cb": pal.bg, "--cbdr": pal.border, "--ci": pal.icon, "--ct": pal.text, "--cd": pal.dot, animationDelay: `${idx * 45}ms` }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {/* Top accent */}
      <div className="ct-card-top-line" />

      {/* Emoji zone */}
      <div className="ct-card-emoji-wrap">
        <div className="ct-card-emoji-bg" />
        <span className="ct-card-emoji">{emoji}</span>
        <div className={`ct-card-actions ${hov ? "ct-card-actions-show" : ""}`}>
          <button className="ct-cab ct-cab-edit" onClick={() => onEdit(cat)} title="Edit">
            <Edit2 size={13} />
          </button>
          <button className="ct-cab ct-cab-del" onClick={() => onDelete(cat)} title="Delete">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="ct-card-info">
        <h3 className="ct-card-name">{cat.categoryName}</h3>
        <div className="ct-card-footer">
          <span className="ct-card-id"><Hash size={9} />{cat.categoryID}</span>
          <span className="ct-card-dot" />
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   MAIN
══════════════════════════════════════════════════════════ */
export default function Categories() {
  const [categories, setCategories]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [refreshing, setRefreshing]   = useState(false);
  const [searchTerm, setSearchTerm]   = useState("");
  const [toast, setToast]             = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]       = useState(false);
  const [formState, setFormState]     = useState(null); // null | { editing: cat|null }

  useEffect(() => { fetchCategories(); }, []);

  const showToast = (msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3600);
  };

  const fetchCategories = async () => {
    try {
      setLoading(true); setError("");
      const res = await axiosInstance.get("/Category");
      setCategories(res.data);
    } catch (err) {
      setError(err.response?.data || err.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCategories();
    setTimeout(() => setRefreshing(false), 700);
  };

  /* Save (add or edit) */
  const handleSave = async (name) => {
    try {
      const editing = formState?.editing;
      if (editing) {
        await axiosInstance.put(`/Category/${editing.categoryID}`, { categoryName: name });
        setCategories(p => p.map(c => c.categoryID === editing.categoryID ? { ...c, categoryName: name } : c));
        showToast(`"${name}" updated.`);
      } else {
        const res = await axiosInstance.post("/Category", { categoryName: name });
        await fetchCategories();
        showToast(`"${name}" created!`);
      }
      setFormState(null);
      return true;
    } catch {
      return false;
    }
  };

  /* Delete */
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await axiosInstance.delete(`/Category/${deleteTarget.categoryID}`);
      setCategories(p => p.filter(c => c.categoryID !== deleteTarget.categoryID));
      showToast(`"${deleteTarget.categoryName}" deleted.`);
    } catch (err) {
      showToast("Delete failed: " + (err.response?.data?.message || err.message), "err");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const filtered = categories.filter(c =>
    c.categoryName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const total = categories.length;

  return (
    <>
      <style>{CSS}</style>
      <Toast toast={toast} />

      {deleteTarget && (
        <DeleteModal
          category={deleteTarget}
          onConfirm={confirmDelete}
          onClose={() => setDeleteTarget(null)}
          busy={deleting}
        />
      )}
      {formState !== null && (
        <FormModal
          editing={formState.editing}
          initialName={formState.editing?.categoryName || ""}
          onSave={handleSave}
          onClose={() => setFormState(null)}
        />
      )}

      <div className="ct-root">

        {/* ══ HERO ══ */}
        <header className="ct-hero">
          <div className="ct-hero-blobs">
            <div className="ct-blob ct-blob1" />
            <div className="ct-blob ct-blob2" />
            <div className="ct-blob ct-blob3" />
          </div>
          <div className="ct-hero-pattern" />

          <div className="ct-hero-left">
            <div className="ct-hero-eyebrow">
              <Layers size={11} /> Admin Console · Food Categories
            </div>
            <h1 className="ct-hero-title">
              Food <em>Categories</em>
            </h1>
            <p className="ct-hero-desc">
              <strong>{total}</strong> global categories used across all restaurant menus
            </p>
          </div>

          <div className="ct-hero-right">
            <div className="ct-hero-stat">
              <span className="ct-hero-stat-num"><Counter to={total} /></span>
              <span className="ct-hero-stat-lbl">Total</span>
            </div>
            <div className="ct-hero-stat">
              <span className="ct-hero-stat-num"><Counter to={filtered.length} /></span>
              <span className="ct-hero-stat-lbl">Shown</span>
            </div>
            <button className={`ct-refresh-btn ${refreshing ? "ct-spinning" : ""}`} onClick={handleRefresh}>
              <RefreshCw size={14} />
            </button>
            <button className="ct-add-btn" onClick={() => setFormState({ editing: null })}>
              <Plus size={16} />
              Add Category
            </button>
          </div>
        </header>

        {/* ══ TOOLBAR ══ */}
        <div className="ct-toolbar">
          <div className="ct-toolbar-left">
            <div className="ct-search-wrap">
              <Search size={13} className="ct-search-ico" />
              <input
                className="ct-search"
                placeholder="Search categories…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="ct-search-clr" onClick={() => setSearchTerm("")}>
                  <X size={11} />
                </button>
              )}
            </div>
            {searchTerm && (
              <span className="ct-search-result">
                <strong>{filtered.length}</strong> of {total} match
              </span>
            )}
          </div>

          <div className="ct-toolbar-right">
            <div className="ct-count-badge">
              <Tag size={11} />
              {total} categor{total !== 1 ? "ies" : "y"}
            </div>
          </div>
        </div>

        {/* ══ CONTENT ══ */}
        <div className="ct-content">
          {loading ? (
            <div className="ct-loading">
              <div className="ct-loader" />
              <p>Loading categories…</p>
            </div>
          ) : error ? (
            <div className="ct-state ct-state-err">
              <AlertCircle size={36} />
              <h3>Failed to load</h3>
              <p>{error}</p>
              <button className="ct-state-btn" onClick={fetchCategories}>Retry</button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="ct-state">
              <span className="ct-state-emoji">🍽</span>
              <h3>{searchTerm ? "No categories found" : "No categories yet"}</h3>
              <p>{searchTerm ? `Nothing matches "${searchTerm}"` : "Create your first food category to get started."}</p>
              {searchTerm
                ? <button className="ct-state-btn" onClick={() => setSearchTerm("")}>Clear Search</button>
                : <button className="ct-state-btn ct-state-btn-primary" onClick={() => setFormState({ editing: null })}>
                    <Plus size={14} /> Add First Category
                  </button>
              }
            </div>
          ) : (
            <>
              {/* ── Category count label ── */}
              <div className="ct-grid-label">
                <span>All Categories</span>
                <span className="ct-grid-label-count">{filtered.length}</span>
              </div>

              {/* ── Cards grid ── */}
              <div className="ct-grid">
                {filtered.map((cat, i) => (
                  <CategoryCard
                    key={cat.categoryID}
                    cat={cat}
                    idx={i}
                    onEdit={cat => setFormState({ editing: cat })}
                    onDelete={cat => setDeleteTarget(cat)}
                  />
                ))}

                {/* ── Add new card ── */}
                <button className="ct-add-card" onClick={() => setFormState({ editing: null })}>
                  <div className="ct-add-card-icon"><Plus size={22} /></div>
                  <span>Add Category</span>
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════
   CSS
══════════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,700;0,800;0,900;1,700;1,800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

.ct-root *,.ct-root *::before,.ct-root *::after{box-sizing:border-box;margin:0;padding:0}
.ct-root{
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
  --indigo:#4f46e5;
  --rose:#dc2626;
  --rose-lt:#fef2f2;
  --sh:0 1px 3px rgba(28,25,23,.05),0 4px 14px rgba(28,25,23,.07);
  --sh-h:0 6px 20px rgba(28,25,23,.11),0 20px 48px rgba(28,25,23,.1);
  font-family:'Plus Jakarta Sans',system-ui,sans-serif;
  background:var(--bg);
  min-height:100vh;
  color:var(--ink);
}

/* KEYFRAMES */
@keyframes ct-in{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes ct-card-in{from{opacity:0;transform:translateY(20px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes ct-fade{from{opacity:0}to{opacity:1}}
@keyframes ct-spin{to{transform:rotate(360deg)}}
@keyframes ct-toast{from{opacity:0;transform:translateX(-50%) translateY(14px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
@keyframes ct-modal{from{opacity:0;transform:scale(.92) translateY(18px)}to{opacity:1;transform:scale(1) translateY(0)}}
@keyframes ct-blob{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(18px,-14px) scale(1.06)}}
@keyframes ct-shimmer{from{background-position:200% 0}to{background-position:-200% 0}}
@keyframes ct-emoji-in{from{transform:scale(0) rotate(-20deg)}to{transform:scale(1) rotate(0deg)}}
@keyframes ct-bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}

/* TOAST */
.ct-toast{
  position:fixed;bottom:22px;left:50%;transform:translateX(-50%);z-index:9999;
  display:flex;align-items:center;gap:8px;padding:10px 20px;background:#fff;
  border-radius:50px;font-size:12.5px;font-weight:700;
  box-shadow:0 6px 28px rgba(28,25,23,.15);white-space:nowrap;
  animation:ct-toast .28s cubic-bezier(.22,1,.36,1);
}
.ct-toast-ok{border:1.5px solid #a7f3d0;color:#065f46}
.ct-toast-err{border:1.5px solid #fca5a5;color:#991b1b}

/* ══ HERO ══ */
.ct-hero{
  position:relative;padding:46px 32px 40px;overflow:hidden;
  background:linear-gradient(135deg,#fdf8f0 0%,#f0fdf9 45%,#fafbff 100%);
  border-bottom:1.5px solid var(--bdr);
  display:flex;align-items:center;justify-content:space-between;gap:18px;flex-wrap:wrap;
}
.ct-hero-blobs{position:absolute;inset:0;pointer-events:none;overflow:hidden}
.ct-blob{position:absolute;border-radius:50%;filter:blur(72px);animation:ct-blob 16s ease-in-out infinite}
.ct-blob1{width:300px;height:300px;background:rgba(217,119,6,.07);top:-80px;left:-40px;animation-delay:0s}
.ct-blob2{width:240px;height:240px;background:rgba(15,118,110,.06);top:10px;right:60px;animation-delay:-5s}
.ct-blob3{width:180px;height:180px;background:rgba(79,70,229,.05);bottom:-40px;left:38%;animation-delay:-10s}
.ct-hero-pattern{
  position:absolute;inset:0;pointer-events:none;
  background-image:radial-gradient(circle,rgba(28,25,23,.05) 1px,transparent 1px);
  background-size:20px 20px;
  mask-image:radial-gradient(ellipse at 65% 50%,black 0%,transparent 62%);
}
.ct-hero-left{position:relative;z-index:1}
.ct-hero-eyebrow{
  display:inline-flex;align-items:center;gap:6px;
  font-size:11px;font-weight:700;color:var(--ink3);letter-spacing:.08em;text-transform:uppercase;
  background:rgba(255,255,255,.8);border:1px solid var(--bdr);
  padding:4px 12px;border-radius:50px;margin-bottom:14px;
}
.ct-hero-title{
  font-family:'Fraunces',serif;font-size:clamp(36px,5vw,60px);
  font-weight:900;color:var(--ink);line-height:.92;letter-spacing:-.025em;margin-bottom:11px;
  animation:ct-in .55s cubic-bezier(.22,1,.36,1);
}
.ct-hero-title em{
  font-style:italic;font-weight:800;
  background:linear-gradient(135deg,var(--teal),var(--indigo));
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
}
.ct-hero-desc{font-size:13.5px;color:var(--ink3);animation:ct-fade .7s .18s both}
.ct-hero-desc strong{color:var(--ink);font-weight:700}
.ct-hero-right{
  position:relative;z-index:1;display:flex;align-items:center;gap:12px;flex-wrap:wrap;
}
.ct-hero-stat{
  display:flex;flex-direction:column;align-items:center;
  background:rgba(255,255,255,.8);border:1.5px solid var(--bdr);border-radius:14px;
  padding:10px 20px;min-width:68px;backdrop-filter:blur(4px);
}
.ct-hero-stat-num{
  font-family:'Fraunces',serif;font-size:26px;font-weight:800;color:var(--ink);line-height:1;letter-spacing:-.03em;
}
.ct-hero-stat-lbl{font-size:10px;font-weight:700;color:var(--ink4);text-transform:uppercase;letter-spacing:.07em;margin-top:2px}
.ct-refresh-btn{
  width:38px;height:38px;border-radius:11px;border:1.5px solid var(--bdr2);
  background:#fff;color:var(--ink3);display:flex;align-items:center;justify-content:center;
  cursor:pointer;transition:all .18s;box-shadow:var(--sh);
}
.ct-refresh-btn:hover{border-color:var(--teal);color:var(--teal);background:#f0fdfa}
.ct-spinning svg{animation:ct-spin .7s linear infinite}
.ct-add-btn{
  display:flex;align-items:center;gap:8px;padding:11px 22px;
  background:linear-gradient(135deg,var(--teal),#0d9488);
  border:none;border-radius:13px;color:#fff;
  font-family:inherit;font-size:13.5px;font-weight:800;cursor:pointer;
  box-shadow:0 4px 16px rgba(15,118,110,.3);transition:all .2s;
}
.ct-add-btn:hover{transform:translateY(-2px);box-shadow:0 6px 22px rgba(15,118,110,.38)}
.ct-add-btn:active{transform:translateY(0)}

/* ══ TOOLBAR ══ */
.ct-toolbar{
  display:flex;align-items:center;justify-content:space-between;gap:14px;
  padding:14px 28px;background:var(--surf);border-bottom:1.5px solid var(--bdr);
  flex-wrap:wrap;
}
.ct-toolbar-left{display:flex;align-items:center;gap:12px}
.ct-search-wrap{position:relative;min-width:220px;max-width:320px}
.ct-search-ico{position:absolute;left:11px;top:50%;transform:translateY(-50%);color:var(--ink4);pointer-events:none}
.ct-search{
  width:100%;padding:9px 34px;background:var(--surf2);border:1.5px solid var(--bdr);
  border-radius:10px;font-family:inherit;font-size:13px;color:var(--ink);outline:none;transition:all .15s;
}
.ct-search::placeholder{color:var(--ink4)}
.ct-search:focus{border-color:var(--teal);background:#fff;box-shadow:0 0 0 3px rgba(15,118,110,.08)}
.ct-search-clr{position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--ink4);cursor:pointer;display:flex;align-items:center}
.ct-search-result{font-size:12px;color:var(--ink3)}
.ct-search-result strong{color:var(--teal);font-weight:700}
.ct-toolbar-right{display:flex;align-items:center;gap:8px}
.ct-count-badge{
  display:inline-flex;align-items:center;gap:6px;padding:7px 13px;
  background:var(--surf2);border:1.5px solid var(--bdr);border-radius:9px;
  font-size:12px;font-weight:700;color:var(--ink3);
}

/* ══ CONTENT ══ */
.ct-content{padding:28px 28px 60px}
.ct-grid-label{
  display:flex;align-items:center;gap:10px;margin-bottom:20px;
  font-size:11px;font-weight:700;color:var(--ink4);text-transform:uppercase;letter-spacing:.1em;
}
.ct-grid-label-count{
  display:inline-flex;align-items:center;justify-content:center;
  width:22px;height:22px;border-radius:50%;background:var(--surf3);
  font-size:10px;font-weight:800;color:var(--ink3);
}

/* ══ CARD GRID ══ */
.ct-grid{
  display:grid;
  grid-template-columns:repeat(auto-fill,minmax(200px,1fr));
  gap:16px;
}

/* ══ CATEGORY CARD ══ */
.ct-card{
  background:var(--surf);border:1.5px solid var(--cbdr,var(--bdr));
  border-radius:18px;overflow:hidden;cursor:default;
  box-shadow:var(--sh);
  transition:transform .28s cubic-bezier(.22,1,.36,1),box-shadow .28s,border-color .28s;
  animation:ct-card-in .5s cubic-bezier(.22,1,.36,1) both;
  animation-delay:calc(var(--i,0) * 48ms);
  position:relative;
}
.ct-card-hov{transform:translateY(-6px);box-shadow:var(--sh-h)}
.ct-card-top-line{
  position:absolute;top:0;left:16px;right:16px;height:3px;
  background:var(--cd,var(--teal));border-radius:0 0 4px 4px;opacity:.75;z-index:2;
}

/* Emoji zone */
.ct-card-emoji-wrap{
  position:relative;
  height:110px;
  background:var(--cb,#f5f2ed);
  display:flex;align-items:center;justify-content:center;
  overflow:hidden;
}
.ct-card-emoji-bg{
  position:absolute;inset:0;
  background:radial-gradient(circle at 60% 40%,rgba(255,255,255,.6) 0%,transparent 70%);
}
.ct-card-emoji{
  font-size:44px;line-height:1;position:relative;z-index:1;
  transition:transform .35s cubic-bezier(.22,1,.36,1);
  animation:ct-emoji-in .45s cubic-bezier(.22,1,.36,1) both;
  filter:drop-shadow(0 4px 10px rgba(0,0,0,.12));
}
.ct-card-hov .ct-card-emoji{transform:scale(1.15) translateY(-3px)}

/* Action buttons */
.ct-card-actions{
  position:absolute;top:8px;right:8px;
  display:flex;gap:5px;
  opacity:0;transform:translateY(-4px);
  transition:opacity .2s,transform .22s;
}
.ct-card-actions-show{opacity:1;transform:translateY(0)}
.ct-cab{
  width:30px;height:30px;border-radius:8px;border:none;cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  transition:all .15s;backdrop-filter:blur(8px);
}
.ct-cab-edit{background:rgba(255,255,255,.92);color:var(--teal)}
.ct-cab-edit:hover{background:#fff;transform:scale(1.08)}
.ct-cab-del{background:rgba(255,255,255,.92);color:var(--rose)}
.ct-cab-del:hover{background:#fff;transform:scale(1.08)}

/* Card info */
.ct-card-info{padding:14px 16px 16px;text-align:center}
.ct-card-name{
  font-family:'Fraunces',serif;font-size:16px;font-weight:700;color:var(--ink);
  line-height:1.2;margin-bottom:8px;
}
.ct-card-hov .ct-card-name{color:var(--ci,var(--teal))}
.ct-card-footer{display:flex;align-items:center;justify-content:center;gap:6px}
.ct-card-id{
  display:inline-flex;align-items:center;gap:2px;
  font-size:10px;font-weight:600;color:var(--ink4);font-family:monospace;
}
.ct-card-dot{width:5px;height:5px;border-radius:50%;background:var(--cd,var(--teal));opacity:.7}

/* ── Add card button ── */
.ct-add-card{
  background:transparent;border:2px dashed var(--bdr2);border-radius:18px;
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;
  min-height:172px;cursor:pointer;transition:all .22s;color:var(--ink4);
  font-family:inherit;font-size:13px;font-weight:600;
}
.ct-add-card:hover{
  border-color:var(--teal);color:var(--teal);
  background:rgba(15,118,110,.03);transform:translateY(-3px);
}
.ct-add-card-icon{
  width:44px;height:44px;border-radius:12px;background:var(--surf2);
  display:flex;align-items:center;justify-content:center;transition:all .22s;
}
.ct-add-card:hover .ct-add-card-icon{background:rgba(15,118,110,.1)}

/* ══ STATE BOXES ══ */
.ct-loading{
  padding:80px 20px;display:flex;flex-direction:column;align-items:center;gap:14px;
  color:var(--ink3);font-size:13.5px;font-weight:600;
}
.ct-loader{
  width:42px;height:42px;border-radius:50%;
  border:3px solid var(--surf3);border-top-color:var(--teal);
  animation:ct-spin .8s linear infinite;
}
.ct-state{
  padding:80px 20px;text-align:center;display:flex;flex-direction:column;
  align-items:center;gap:12px;color:var(--ink4);
}
.ct-state-emoji{font-size:52px;filter:grayscale(.3)}
.ct-state h3{font-family:'Fraunces',serif;font-size:20px;font-weight:700;color:var(--ink2)}
.ct-state p{font-size:13.5px;color:var(--ink3)}
.ct-state-err{color:var(--rose)}
.ct-state-err h3{color:#991b1b}
.ct-state-btn{
  margin-top:4px;padding:9px 22px;border-radius:10px;
  border:1.5px solid var(--bdr2);background:var(--surf);
  color:var(--ink2);font-family:inherit;font-size:12.5px;font-weight:700;
  cursor:pointer;transition:all .15s;box-shadow:var(--sh);
  display:inline-flex;align-items:center;gap:6px;
}
.ct-state-btn:hover{border-color:var(--teal);color:var(--teal);background:#f0fdfa}
.ct-state-btn-primary{
  background:linear-gradient(135deg,var(--teal),#0d9488)!important;
  color:#fff!important;border:none!important;
  box-shadow:0 4px 14px rgba(15,118,110,.28)!important;
}
.ct-state-btn-primary:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(15,118,110,.36)!important}

/* ══ DELETE MODAL ══ */
.ct-overlay{position:fixed;inset:0;z-index:1000;background:rgba(28,25,23,.45);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:20px}
.ct-modal{background:#fff;border:1.5px solid var(--bdr);border-radius:22px;padding:30px 26px 24px;width:100%;max-width:400px;position:relative;box-shadow:0 22px 64px rgba(28,25,23,.18);animation:ct-modal .28s cubic-bezier(.22,1,.36,1)}
.ct-modal-x{position:absolute;top:13px;right:13px;width:27px;height:27px;border-radius:50%;border:1.5px solid var(--bdr);background:var(--surf2);color:var(--ink3);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .14s}
.ct-modal-x:hover{background:var(--rose-lt);color:var(--rose)}
.ct-modal-icon{width:56px;height:56px;border-radius:15px;background:var(--rose-lt);display:flex;align-items:center;justify-content:center;color:var(--rose);margin:0 auto 16px;box-shadow:0 4px 14px rgba(220,38,38,.14)}
.ct-modal-title{font-family:'Fraunces',serif;font-size:22px;font-weight:800;color:var(--ink);text-align:center;margin-bottom:9px}
.ct-modal-body{font-size:13.5px;color:var(--ink3);text-align:center;line-height:1.7;margin-bottom:22px}
.ct-modal-body strong{color:var(--ink)}
.ct-modal-btns{display:flex;gap:10px}
.ct-mbtn-ghost{flex:1;padding:11px;border-radius:11px;border:1.5px solid var(--bdr2);background:transparent;font-family:inherit;font-size:13px;font-weight:700;color:var(--ink2);cursor:pointer;transition:all .15s}
.ct-mbtn-ghost:hover{background:var(--surf2)}
.ct-mbtn-ghost:disabled{opacity:.4;cursor:not-allowed}
.ct-mbtn-danger{flex:1;padding:11px;border-radius:11px;border:none;background:linear-gradient(135deg,#ef4444,#dc2626);font-family:inherit;font-size:13px;font-weight:800;color:#fff;cursor:pointer;box-shadow:0 3px 14px rgba(220,38,38,.26);transition:all .18s;display:flex;align-items:center;justify-content:center;gap:6px}
.ct-mbtn-danger:hover{transform:translateY(-1px);box-shadow:0 5px 20px rgba(220,38,38,.34)}
.ct-mbtn-danger:disabled{opacity:.5;cursor:not-allowed;transform:none}

/* ══ FORM MODAL ══ */
.ct-form-modal{background:#fff;border:1.5px solid var(--bdr);border-radius:22px;width:100%;max-width:460px;position:relative;box-shadow:0 24px 70px rgba(28,25,23,.17);animation:ct-modal .28s cubic-bezier(.22,1,.36,1);overflow:hidden}
.ct-form-header{display:flex;align-items:center;gap:14px;padding:22px 24px;border-bottom:1.5px solid var(--bdr);background:var(--surf2)}
.ct-form-header-icon{width:40px;height:40px;border-radius:11px;background:linear-gradient(135deg,var(--teal),#0d9488);display:flex;align-items:center;justify-content:center;color:#fff;flex-shrink:0;box-shadow:0 3px 10px rgba(15,118,110,.28)}
.ct-form-title{font-family:'Fraunces',serif;font-size:18px;font-weight:800;color:var(--ink);line-height:1}
.ct-form-sub{font-size:11.5px;color:var(--ink3);margin-top:2px}
.ct-form-x{margin-left:auto;width:28px;height:28px;border-radius:50%;border:1.5px solid var(--bdr2);background:#fff;color:var(--ink3);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:all .14s}
.ct-form-x:hover{background:var(--rose-lt);color:var(--rose)}
.ct-form-body{padding:22px 24px 24px;display:flex;flex-direction:column;gap:18px}
.ct-form-err{display:flex;align-items:center;gap:7px;padding:10px 14px;background:#fff2f2;border:1.5px solid #fca5a5;border-radius:9px;font-size:12.5px;color:#991b1b;font-weight:600}
.ct-field{display:flex;flex-direction:column;gap:6px}
.ct-label{font-size:12.5px;font-weight:700;color:var(--ink2)}
.ct-input{
  padding:11px 14px;background:var(--surf2);border:1.5px solid var(--bdr);
  border-radius:11px;font-family:inherit;font-size:14px;color:var(--ink);
  outline:none;transition:all .15s;
}
.ct-input::placeholder{color:var(--ink4)}
.ct-input:focus{border-color:var(--teal);background:#fff;box-shadow:0 0 0 3px rgba(15,118,110,.09)}
.ct-input-hint{font-size:11px;color:var(--ink4)}

/* Preview */
.ct-preview{display:flex;flex-direction:column;gap:8px}
.ct-preview-label{font-size:10.5px;font-weight:700;color:var(--ink4);text-transform:uppercase;letter-spacing:.08em}
.ct-preview-card{
  display:inline-flex;align-items:center;gap:10px;
  padding:10px 16px;background:var(--surf2);border:1.5px solid var(--bdr);
  border-radius:12px;animation:ct-in .25s cubic-bezier(.22,1,.36,1);
}
.ct-preview-emoji{font-size:24px;line-height:1}
.ct-preview-name{font-family:'Fraunces',serif;font-size:16px;font-weight:700;color:var(--ink)}

.ct-form-btns{display:flex;gap:10px}
.ct-fbtn-ghost{flex:1;padding:11px;border-radius:11px;border:1.5px solid var(--bdr2);background:transparent;font-family:inherit;font-size:13px;font-weight:700;color:var(--ink2);cursor:pointer;transition:all .15s}
.ct-fbtn-ghost:hover{background:var(--surf2)}
.ct-fbtn-ghost:disabled{opacity:.4;cursor:not-allowed}
.ct-fbtn-primary{flex:1;padding:11px;border-radius:11px;border:none;background:linear-gradient(135deg,var(--teal),#0d9488);font-family:inherit;font-size:13px;font-weight:800;color:#fff;cursor:pointer;box-shadow:0 3px 14px rgba(15,118,110,.28);transition:all .18s;display:flex;align-items:center;justify-content:center;gap:6px}
.ct-fbtn-primary:hover{transform:translateY(-1px);box-shadow:0 5px 20px rgba(15,118,110,.36)}
.ct-fbtn-primary:disabled{opacity:.55;cursor:not-allowed;transform:none}

/* Spinners */
.ct-spin{width:12px;height:12px;border-radius:50%;border:2px solid rgba(28,25,23,.15);border-top-color:var(--ink2);animation:ct-spin .7s linear infinite;display:inline-block;flex-shrink:0}
.ct-spin-white{border-color:rgba(255,255,255,.3);border-top-color:#fff}

@media(max-width:640px){
  .ct-hero{padding:26px 16px 22px}
  .ct-content{padding:18px 16px 50px}
  .ct-toolbar{padding:12px 16px}
  .ct-grid{grid-template-columns:repeat(auto-fill,minmax(155px,1fr));gap:12px}
  .ct-form-modal{border-radius:18px}
  .ct-modal-btns,.ct-form-btns{flex-direction:column}
  .ct-hero-right{gap:8px}
}
`;