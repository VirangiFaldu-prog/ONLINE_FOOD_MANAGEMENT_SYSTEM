import React, { useEffect, useState, useRef } from "react";
import {
  Star, Search, Trash2, Store, User,
  MessageSquare, AlertCircle, X, Check,
  RefreshCw, ChevronDown, ThumbsUp, ThumbsDown,
  TrendingUp, BarChart2, Quote, Calendar,
  Filter, Hash,
} from "lucide-react";
import axiosInstance from "../../api/axiosInstance";

/* ══════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════ */
const fmtDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
};

/* ── sentiment by rating ── */
const getSentiment = (rating) => {
  if (rating >= 5) return { label: "Excellent",  color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0", emoji: "🌟" };
  if (rating >= 4) return { label: "Good",        color: "#0891b2", bg: "#ecfeff", border: "#a5f3fc", emoji: "😊" };
  if (rating >= 3) return { label: "Average",     color: "#d97706", bg: "#fffbeb", border: "#fde68a", emoji: "😐" };
  if (rating >= 2) return { label: "Poor",        color: "#ea580c", bg: "#fff7ed", border: "#fed7aa", emoji: "😞" };
  return                  { label: "Terrible",    color: "#dc2626", bg: "#fef2f2", border: "#fecaca", emoji: "😠" };
};

/* ── generate consistent avatar colour ── */
const AVATAR_COLORS = [
  ["#dbeafe","#1d4ed8"], ["#fce7f3","#be185d"], ["#dcfce7","#15803d"],
  ["#fef3c7","#b45309"], ["#f3e8ff","#7e22ce"], ["#ccfbf1","#0f766e"],
  ["#fee2e2","#dc2626"], ["#e0f2fe","#0369a1"],
];
const getAvatarColor = (name) => {
  let hash = 0;
  for (let i = 0; i < (name||"").length; i++) hash = (hash * 31 + name.charCodeAt(i)) & 0xffff;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
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
    <div className={`rv-toast ${toast.type === "err" ? "rv-toast-err" : "rv-toast-ok"}`}>
      {toast.type === "err" ? <AlertCircle size={13}/> : <Check size={13}/>}
      {toast.msg}
    </div>
  );
};

/* ── Star row ─────────────────────────────────────────── */
const Stars = ({ rating, size = 14 }) => (
  <div className="rv-stars">
    {[1,2,3,4,5].map(s => (
      <Star
        key={s}
        size={size}
        className={s <= rating ? "rv-star-on" : "rv-star-off"}
      />
    ))}
  </div>
);

/* ── Rating Distribution Bar ──────────────────────────── */
const RatingBar = ({ star, count, total }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  const color = star >= 4 ? "#22c55e" : star === 3 ? "#f59e0b" : "#f43f5e";
  return (
    <div className="rv-rbar-row">
      <div className="rv-rbar-label">
        <span>{star}</span>
        <Star size={9} style={{ color: "#f59e0b", fill: "#f59e0b" }} />
      </div>
      <div className="rv-rbar-track">
        <div className="rv-rbar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="rv-rbar-pct">{count}</span>
    </div>
  );
};

/* ── Delete modal ─────────────────────────────────────── */
const DeleteModal = ({ review, onConfirm, onClose, busy }) => (
  <div className="rv-overlay" onClick={onClose}>
    <div className="rv-modal" onClick={e => e.stopPropagation()}>
      <button className="rv-modal-x" onClick={onClose}><X size={14}/></button>
      <div className="rv-modal-icon"><Trash2 size={22}/></div>
      <h2 className="rv-modal-title">Remove Review?</h2>
      <p className="rv-modal-body">
        This review by <strong>{review?.userName || "a customer"}</strong> will be permanently deleted and won't affect the restaurant's score calculation after removal.
      </p>
      <div className="rv-modal-btns">
        <button className="rv-mbtn-ghost" onClick={onClose} disabled={busy}>Keep it</button>
        <button className="rv-mbtn-danger" onClick={onConfirm} disabled={busy}>
          {busy ? <><span className="rv-spin"/>Deleting…</> : <><Trash2 size={12}/>Remove</>}
        </button>
      </div>
    </div>
  </div>
);

/* ── Review Card ──────────────────────────────────────── */
const ReviewCard = ({ r, idx, onDelete }) => {
  const [hov, setHov] = useState(false);
  const sent = getSentiment(r.rating);
  const [bg, fg] = getAvatarColor(r.userName);
  const initials = (r.userName || "U").slice(0, 2).toUpperCase();

  return (
    <div
      className={`rv-card ${hov ? "rv-card-hov" : ""}`}
      style={{ "--i": idx, animationDelay: `${idx * 45}ms` }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {/* sentiment stripe */}
      <div className="rv-card-stripe" style={{ background: sent.color }} />

      {/* Header */}
      <div className="rv-card-head">
        <div className="rv-card-user">
          <div className="rv-avatar" style={{ background: bg, color: fg }}>{initials}</div>
          <div>
            <p className="rv-user-name">{r.userName || "Customer"}</p>
            <div className="rv-rest-chip">
              <Store size={9}/>{r.restaurantName || "—"}
            </div>
          </div>
        </div>
        <div className="rv-card-top-right">
          <span className="rv-sentiment-badge" style={{ background: sent.bg, color: sent.color, borderColor: sent.border }}>
            {sent.emoji} {sent.label}
          </span>
          <button
            className={`rv-del-btn ${hov ? "rv-del-btn-show" : ""}`}
            onClick={() => onDelete(r)}
            title="Delete review"
          >
            <Trash2 size={13}/>
          </button>
        </div>
      </div>

      {/* Stars */}
      <div className="rv-card-stars">
        <Stars rating={r.rating} size={15}/>
        <span className="rv-rating-num">{r.rating}.0</span>
      </div>

      {/* Comment */}
      <div className="rv-card-comment">
        <Quote size={16} className="rv-quote-icon"/>
        <p className="rv-comment-text">{r.comment || "No comment provided."}</p>
      </div>

      {/* Footer */}
      <div className="rv-card-footer">
        <span className="rv-footer-id"><Hash size={9}/>{r.reviewID}</span>
        <span className="rv-footer-date"><Calendar size={9}/>{fmtDate(r.createdAt)}</span>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   MAIN
══════════════════════════════════════════════════════════ */
export default function Reviews() {
  const [reviews, setReviews]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [refreshing, setRefreshing]   = useState(false);
  const [searchTerm, setSearchTerm]   = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [sortBy, setSortBy]           = useState("newest");
  const [sortOpen, setSortOpen]       = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]       = useState(false);
  const [toast, setToast]             = useState(null);
  const sortRef                       = useRef(null);

  useEffect(() => {
    const h = (e) => { if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => { fetchReviews(); }, []);

  const showToast = (msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3600);
  };

  const fetchReviews = async () => {
    try {
      setLoading(true); setError("");
      const res = await axiosInstance.get("/Review");
      setReviews(res.data);
    } catch (err) {
      setError(err.response?.data || err.message || "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchReviews();
    setTimeout(() => setRefreshing(false), 700);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await axiosInstance.delete(`/Review/${deleteTarget.reviewID}`);
      setReviews(p => p.filter(r => r.reviewID !== deleteTarget.reviewID));
      showToast("Review removed successfully.");
    } catch (err) {
      showToast("Delete failed: " + (err.response?.data || err.message), "err");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  /* ── Derived stats ── */
  const total    = reviews.length;
  const avgRating = total > 0
    ? (reviews.reduce((a, r) => a + r.rating, 0) / total)
    : 0;
  const fiveStars = reviews.filter(r => r.rating === 5).length;
  const lowRating = reviews.filter(r => r.rating <= 2).length;
  const dist = [5,4,3,2,1].map(s => ({ star: s, count: reviews.filter(r => r.rating === s).length }));

  /* ── Sort options ── */
  const SORT_OPTS = [
    { key: "newest",     label: "Newest First"      },
    { key: "oldest",     label: "Oldest First"       },
    { key: "highest",    label: "Highest Rating"     },
    { key: "lowest",     label: "Lowest Rating"      },
  ];

  /* ── Filter + sort ── */
  const filtered = reviews
    .filter(r => {
      const q = searchTerm.toLowerCase();
      const mQ = !q
        || r.userName?.toLowerCase().includes(q)
        || r.restaurantName?.toLowerCase().includes(q)
        || r.comment?.toLowerCase().includes(q);
      const mR = ratingFilter === "all"
        || (ratingFilter === "5"   && r.rating === 5)
        || (ratingFilter === "4"   && r.rating === 4)
        || (ratingFilter === "3"   && r.rating === 3)
        || (ratingFilter === "low" && r.rating <= 2);
      return mQ && mR;
    })
    .sort((a, b) => {
      if (sortBy === "oldest")  return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "highest") return b.rating - a.rating;
      if (sortBy === "lowest")  return a.rating - b.rating;
      return new Date(b.createdAt) - new Date(a.createdAt); // newest
    });

  /* ── Rating filter tabs ── */
  const RATING_TABS = [
    { key: "all", label: "All",          count: total                                  },
    { key: "5",   label: "5 ★",          count: reviews.filter(r=>r.rating===5).length },
    { key: "4",   label: "4 ★",          count: reviews.filter(r=>r.rating===4).length },
    { key: "3",   label: "3 ★",          count: reviews.filter(r=>r.rating===3).length },
    { key: "low", label: "Issues (≤2)",  count: reviews.filter(r=>r.rating<=2).length  },
  ].filter(t => t.key === "all" || t.count > 0);

  return (
    <>
      <style>{CSS}</style>
      <Toast toast={toast}/>

      {deleteTarget && (
        <DeleteModal
          review={deleteTarget}
          onConfirm={confirmDelete}
          onClose={() => setDeleteTarget(null)}
          busy={deleting}
        />
      )}

      <div className="rv-root">

        {/* ══ HERO ══ */}
        <header className="rv-hero">
          <div className="rv-hero-blobs">
            <div className="rv-blob rv-blob1"/>
            <div className="rv-blob rv-blob2"/>
            <div className="rv-blob rv-blob3"/>
          </div>
          <div className="rv-hero-dots"/>

          <div className="rv-hero-left">
            <div className="rv-hero-eyebrow">
              <MessageSquare size={11}/> Admin Console · Reviews & Ratings
            </div>
            <h1 className="rv-hero-title">
              Customer <em>Reviews</em>
            </h1>
            <p className="rv-hero-desc">
              Monitor and moderate <strong>{total}</strong> reviews across all restaurants
            </p>
          </div>

          <div className="rv-hero-right">
            {/* Avg rating big display */}
            <div className="rv-hero-rating-box">
              <div className="rv-hero-rating-num">{avgRating.toFixed(1)}</div>
              <Stars rating={Math.round(avgRating)} size={14}/>
              <span className="rv-hero-rating-lbl">Avg Rating</span>
            </div>
            <div className="rv-hero-stat">
              <span className="rv-hero-stat-num">{fiveStars}</span>
              <span className="rv-hero-stat-lbl">5-Star</span>
            </div>
            {lowRating > 0 && (
              <div className="rv-hero-stat rv-hero-stat-red">
                <span className="rv-hero-stat-num">{lowRating}</span>
                <span className="rv-hero-stat-lbl">Issues</span>
              </div>
            )}
            <button className={`rv-refresh-btn ${refreshing ? "rv-spinning" : ""}`} onClick={handleRefresh}>
              <RefreshCw size={14}/>
            </button>
          </div>
        </header>

        {/* ══ STATS + DISTRIBUTION ══ */}
        {!loading && total > 0 && (
          <div className="rv-insight-row">
            {/* Stat chips */}
            <div className="rv-chips">
              <div className="rv-chip rv-chip-amber">
                <Star size={13} style={{fill:"#f59e0b",color:"#f59e0b"}}/>
                <span><strong>{avgRating.toFixed(1)}</strong> avg</span>
              </div>
              <div className="rv-chip rv-chip-green">
                <ThumbsUp size={13}/>
                <span><strong>{fiveStars}</strong> excellent</span>
              </div>
              {lowRating > 0 && (
                <div className="rv-chip rv-chip-red">
                  <ThumbsDown size={13}/>
                  <span><strong>{lowRating}</strong> need attention</span>
                </div>
              )}
              <div className="rv-chip">
                <MessageSquare size={13}/>
                <span><strong>{total}</strong> total reviews</span>
              </div>
            </div>

            {/* Rating distribution */}
            <div className="rv-dist">
              <p className="rv-dist-title">Rating Distribution</p>
              <div className="rv-dist-bars">
                {dist.map(d => (
                  <RatingBar key={d.star} star={d.star} count={d.count} total={total}/>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ TOOLBAR ══ */}
        <div className="rv-toolbar">
          {/* Search */}
          <div className="rv-search-wrap">
            <Search size={13} className="rv-search-ico"/>
            <input
              className="rv-search"
              placeholder="Search by user, restaurant, or keyword…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="rv-search-clr" onClick={() => setSearchTerm("")}><X size={11}/></button>
            )}
          </div>

          {/* Rating filter tabs */}
          <div className="rv-rating-tabs">
            {RATING_TABS.map(t => (
              <button
                key={t.key}
                className={`rv-rtab ${ratingFilter === t.key ? "rv-rtab-on" : ""} ${t.key === "low" && ratingFilter === t.key ? "rv-rtab-red" : ""}`}
                onClick={() => setRatingFilter(t.key)}
              >
                {t.label}
                <span className={`rv-rtab-n ${ratingFilter === t.key ? "rv-rtab-n-on" : ""}`}>{t.count}</span>
              </button>
            ))}
          </div>

          {/* Sort — z-index isolated */}
          <div className="rv-sort-wrap" ref={sortRef}>
            <button className={`rv-sort-btn ${sortOpen ? "rv-sort-open" : ""}`} onClick={() => setSortOpen(v => !v)}>
              <BarChart2 size={12}/>
              <span>{SORT_OPTS.find(o => o.key === sortBy)?.label}</span>
              <ChevronDown size={11} className={`rv-chevron ${sortOpen ? "rv-chevron-up" : ""}`}/>
            </button>
            {sortOpen && (
              <div className="rv-sort-menu">
                <p className="rv-sort-hdr">Sort By</p>
                {SORT_OPTS.map(o => (
                  <button
                    key={o.key}
                    className={`rv-sort-item ${sortBy === o.key ? "rv-sort-on" : ""}`}
                    onClick={() => { setSortBy(o.key); setSortOpen(false); }}
                  >
                    <span className="rv-sort-tick">{sortBy === o.key && <Check size={10}/>}</span>
                    {o.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {!loading && (
            <span className="rv-result-count">
              <strong>{filtered.length}</strong> / {total}
            </span>
          )}
        </div>

        {/* ══ CONTENT ══ */}
        <div className="rv-content">
          {loading ? (
            <div className="rv-loading">
              <div className="rv-loader"/>
              <p>Loading reviews…</p>
            </div>
          ) : error ? (
            <div className="rv-state rv-state-err">
              <AlertCircle size={36}/>
              <h3>Failed to load</h3>
              <p>{error}</p>
              <button className="rv-state-btn" onClick={fetchReviews}>Retry</button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="rv-state">
              <span className="rv-state-emoji">💬</span>
              <h3>No reviews found</h3>
              <p>{searchTerm ? `No results for "${searchTerm}"` : "Try a different filter."}</p>
              {(searchTerm || ratingFilter !== "all") && (
                <button className="rv-state-btn" onClick={() => { setSearchTerm(""); setRatingFilter("all"); }}>
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="rv-grid-label">
                <span>Reviews</span>
                <span className="rv-grid-count">{filtered.length}</span>
              </div>
              <div className="rv-grid">
                {filtered.map((r, i) => (
                  <ReviewCard
                    key={r.reviewID}
                    r={r}
                    idx={i}
                    onDelete={setDeleteTarget}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {!loading && filtered.length > 0 && (
          <div className="rv-footer">
            {filtered.length} review{filtered.length !== 1 ? "s" : ""} shown
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

.rv-root *,.rv-root *::before,.rv-root *::after{box-sizing:border-box;margin:0;padding:0}
.rv-root{
  --bg:#faf8f5;--surf:#fff;--surf2:#f5f2ed;--surf3:#ede9e2;
  --bdr:#e5e0d8;--bdr2:#d4cfc6;
  --ink:#1c1917;--ink2:#44403c;--ink3:#78716c;--ink4:#a8a29e;
  --amber:#d97706;--green:#15803d;--rose:#dc2626;--rose-lt:#fef2f2;
  --blue:#2563eb;--teal:#0f766e;--indigo:#4f46e5;
  --sh:0 1px 3px rgba(28,25,23,.05),0 4px 14px rgba(28,25,23,.07);
  --sh-h:0 6px 22px rgba(28,25,23,.11),0 22px 52px rgba(28,25,23,.1);
  font-family:'Plus Jakarta Sans',system-ui,sans-serif;
  background:var(--bg);min-height:100vh;color:var(--ink);
}

@keyframes rv-in{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes rv-card-in{from{opacity:0;transform:translateY(20px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes rv-fade{from{opacity:0}to{opacity:1}}
@keyframes rv-spin{to{transform:rotate(360deg)}}
@keyframes rv-pulse{0%,100%{opacity:1}50%{opacity:.4}}
@keyframes rv-toast{from{opacity:0;transform:translateX(-50%) translateY(14px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
@keyframes rv-modal{from{opacity:0;transform:scale(.92) translateY(18px)}to{opacity:1;transform:scale(1) translateY(0)}}
@keyframes rv-blob{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(18px,-12px) scale(1.06)}}
@keyframes rv-bar{from{width:0}}

/* TOAST */
.rv-toast{
  position:fixed;bottom:22px;left:50%;transform:translateX(-50%);z-index:9999;
  display:flex;align-items:center;gap:8px;padding:10px 20px;background:#fff;
  border-radius:50px;font-size:12.5px;font-weight:700;
  box-shadow:0 6px 28px rgba(28,25,23,.14);white-space:nowrap;
  animation:rv-toast .28s cubic-bezier(.22,1,.36,1);
}
.rv-toast-ok{border:1.5px solid #a7f3d0;color:#065f46}
.rv-toast-err{border:1.5px solid #fca5a5;color:#991b1b}

/* ══ HERO ══ */
.rv-hero{
  position:relative;padding:46px 32px 40px;overflow:hidden;
  background:linear-gradient(135deg,#fdf8f0 0%,#fffbf0 45%,#faf8ff 100%);
  border-bottom:1.5px solid var(--bdr);
  display:flex;align-items:center;justify-content:space-between;gap:18px;flex-wrap:wrap;
}
.rv-hero-blobs{position:absolute;inset:0;pointer-events:none;overflow:hidden}
.rv-blob{position:absolute;border-radius:50%;filter:blur(72px);animation:rv-blob 16s ease-in-out infinite}
.rv-blob1{width:300px;height:300px;background:rgba(245,158,11,.09);top:-80px;left:-40px;animation-delay:0s}
.rv-blob2{width:240px;height:240px;background:rgba(168,85,247,.06);top:10px;right:70px;animation-delay:-5s}
.rv-blob3{width:180px;height:180px;background:rgba(220,38,38,.05);bottom:-40px;left:40%;animation-delay:-10s}
.rv-hero-dots{
  position:absolute;inset:0;pointer-events:none;
  background-image:radial-gradient(circle,rgba(28,25,23,.05) 1px,transparent 1px);
  background-size:20px 20px;
  mask-image:radial-gradient(ellipse at 68% 50%,black 0%,transparent 62%);
}
.rv-hero-left{position:relative;z-index:1}
.rv-hero-eyebrow{
  display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:700;
  color:var(--ink3);letter-spacing:.08em;text-transform:uppercase;
  background:rgba(255,255,255,.8);border:1px solid var(--bdr);
  padding:4px 12px;border-radius:50px;margin-bottom:14px;
}
.rv-hero-title{
  font-family:'Fraunces',serif;font-size:clamp(36px,5vw,60px);
  font-weight:900;color:var(--ink);line-height:.92;letter-spacing:-.025em;margin-bottom:11px;
  animation:rv-in .55s cubic-bezier(.22,1,.36,1);
}
.rv-hero-title em{
  font-style:italic;font-weight:800;
  background:linear-gradient(135deg,var(--amber),#f59e0b,#a855f7);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
}
.rv-hero-desc{font-size:13.5px;color:var(--ink3);animation:rv-fade .7s .18s both}
.rv-hero-desc strong{color:var(--ink);font-weight:700}
.rv-hero-right{position:relative;z-index:1;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.rv-hero-rating-box{
  display:flex;flex-direction:column;align-items:center;gap:6px;
  background:rgba(255,255,255,.85);border:1.5px solid #fde68a;border-radius:16px;
  padding:14px 18px;backdrop-filter:blur(4px);
  box-shadow:0 4px 14px rgba(245,158,11,.12);
}
.rv-hero-rating-num{
  font-family:'Fraunces',serif;font-size:34px;font-weight:800;
  color:var(--amber);line-height:1;letter-spacing:-.04em;
}
.rv-hero-rating-lbl{font-size:10px;font-weight:700;color:var(--ink4);text-transform:uppercase;letter-spacing:.07em;margin-top:2px}
.rv-hero-stat{
  display:flex;flex-direction:column;align-items:center;
  background:rgba(255,255,255,.82);border:1.5px solid var(--bdr);border-radius:14px;
  padding:10px 16px;min-width:60px;backdrop-filter:blur(4px);
}
.rv-hero-stat-red{border-color:#fca5a5;background:#fef2f2}
.rv-hero-stat-num{font-family:'Fraunces',serif;font-size:24px;font-weight:800;color:var(--ink);line-height:1;letter-spacing:-.03em}
.rv-hero-stat-lbl{font-size:10px;font-weight:700;color:var(--ink4);text-transform:uppercase;letter-spacing:.07em;margin-top:2px}
.rv-refresh-btn{
  width:38px;height:38px;border-radius:11px;border:1.5px solid var(--bdr2);
  background:#fff;color:var(--ink3);display:flex;align-items:center;justify-content:center;
  cursor:pointer;transition:all .18s;box-shadow:var(--sh);
}
.rv-refresh-btn:hover{border-color:var(--amber);color:var(--amber);background:#fffbeb}
.rv-spinning svg{animation:rv-spin .7s linear infinite}

/* ══ INSIGHT ROW ══ */
.rv-insight-row{
  display:flex;align-items:flex-start;gap:0;
  background:var(--surf);border-bottom:1.5px solid var(--bdr);flex-wrap:wrap;
}
/* Chips strip */
.rv-chips{
  display:flex;align-items:center;gap:8px;padding:16px 28px;
  border-right:1.5px solid var(--bdr);flex-wrap:wrap;flex:1;
}
.rv-chip{
  display:inline-flex;align-items:center;gap:5px;padding:6px 12px;
  border-radius:50px;font-size:12px;font-weight:600;
  background:var(--surf2);border:1.5px solid var(--bdr);color:var(--ink3);
}
.rv-chip-amber{background:#fffbeb;border-color:#fde68a;color:#b45309}
.rv-chip-green{background:#f0fdf4;border-color:#bbf7d0;color:#15803d}
.rv-chip-red{background:#fef2f2;border-color:#fecaca;color:#dc2626}

/* Distribution */
.rv-dist{padding:16px 28px;min-width:280px}
.rv-dist-title{font-size:10.5px;font-weight:700;color:var(--ink4);text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px}
.rv-dist-bars{display:flex;flex-direction:column;gap:5px}
.rv-rbar-row{display:flex;align-items:center;gap:8px}
.rv-rbar-label{display:flex;align-items:center;gap:3px;font-size:10.5px;font-weight:700;color:var(--ink3);min-width:22px}
.rv-rbar-track{flex:1;height:6px;background:var(--surf3);border-radius:4px;overflow:hidden}
.rv-rbar-fill{height:100%;border-radius:4px;transition:width .8s cubic-bezier(.22,1,.36,1);animation:rv-bar .8s cubic-bezier(.22,1,.36,1)}
.rv-rbar-pct{font-size:10px;font-weight:700;color:var(--ink4);min-width:22px;text-align:right}

/* ══ TOOLBAR ══ */
.rv-toolbar{
  display:flex;align-items:center;gap:10px;padding:14px 28px;
  background:var(--surf);border-bottom:1.5px solid var(--bdr);flex-wrap:wrap;
  position:sticky;top:0;z-index:500;
}
.rv-search-wrap{position:relative;flex:1;min-width:200px;max-width:320px}
.rv-search-ico{position:absolute;left:11px;top:50%;transform:translateY(-50%);color:var(--ink4);pointer-events:none}
.rv-search{
  width:100%;padding:9px 34px;background:var(--surf2);border:1.5px solid var(--bdr);
  border-radius:10px;font-family:inherit;font-size:13px;color:var(--ink);outline:none;transition:all .15s;
}
.rv-search::placeholder{color:var(--ink4)}
.rv-search:focus{border-color:var(--amber);background:#fff;box-shadow:0 0 0 3px rgba(217,119,6,.08)}
.rv-search-clr{position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--ink4);cursor:pointer;display:flex;align-items:center}

/* Rating tabs */
.rv-rating-tabs{display:flex;gap:3px;background:var(--surf2);border:1.5px solid var(--bdr);border-radius:10px;padding:3px;overflow-x:auto;scrollbar-width:none}
.rv-rating-tabs::-webkit-scrollbar{display:none}
.rv-rtab{
  padding:7px 12px;border-radius:7px;border:none;background:transparent;
  font-family:inherit;font-size:12px;font-weight:600;color:var(--ink3);
  cursor:pointer;transition:all .15s;white-space:nowrap;display:flex;align-items:center;gap:5px;
}
.rv-rtab:hover{color:var(--ink)}
.rv-rtab-on{background:#fff!important;color:var(--ink)!important;box-shadow:0 1px 4px rgba(28,25,23,.1)}
.rv-rtab-red.rv-rtab-on{background:#fef2f2!important;color:#dc2626!important}
.rv-rtab-n{font-size:10px;font-weight:800;background:var(--surf3);color:var(--ink4);padding:1px 6px;border-radius:50px}
.rv-rtab-n-on{background:rgba(217,119,6,.12);color:var(--amber)}
.rv-rtab-red.rv-rtab-on .rv-rtab-n{background:rgba(220,38,38,.1);color:var(--rose)}

/* Sort */
.rv-sort-wrap{position:relative;z-index:9999;flex-shrink:0}
.rv-sort-btn{
  display:flex;align-items:center;gap:6px;padding:9px 14px;
  background:var(--surf2);border:1.5px solid var(--bdr);border-radius:10px;
  font-family:inherit;font-size:12.5px;font-weight:600;color:var(--ink2);
  cursor:pointer;white-space:nowrap;transition:all .15s;
}
.rv-sort-btn:hover,.rv-sort-open{border-color:var(--amber);color:var(--amber);background:#fffbeb}
.rv-chevron{transition:transform .2s}
.rv-chevron-up{transform:rotate(180deg)}
.rv-sort-menu{
  position:absolute;top:calc(100% + 8px);right:0;
  background:#fff;border:1.5px solid var(--bdr);border-radius:14px;
  padding:6px;box-shadow:0 12px 40px rgba(28,25,23,.13);
  min-width:185px;animation:rv-in .18s cubic-bezier(.22,1,.36,1);
}
.rv-sort-hdr{font-size:10px;font-weight:700;color:var(--ink4);text-transform:uppercase;letter-spacing:.09em;padding:6px 10px 5px}
.rv-sort-item{
  width:100%;display:flex;align-items:center;gap:8px;padding:9px 10px;
  border:none;background:transparent;font-family:inherit;font-size:13px;font-weight:500;
  color:var(--ink2);cursor:pointer;border-radius:8px;transition:background .12s;text-align:left;
}
.rv-sort-item:hover{background:var(--surf2);color:var(--ink)}
.rv-sort-on{color:var(--amber)!important;font-weight:700}
.rv-sort-tick{width:18px;display:flex;align-items:center;justify-content:center;color:var(--amber)}
.rv-result-count{font-size:12px;color:var(--ink4);font-weight:500;white-space:nowrap;margin-left:auto}
.rv-result-count strong{color:var(--ink2);font-weight:700}

/* ══ CONTENT ══ */
.rv-content{padding:24px 28px 60px;background:var(--bg)}
.rv-grid-label{
  display:flex;align-items:center;gap:8px;margin-bottom:18px;
  font-size:11px;font-weight:700;color:var(--ink4);text-transform:uppercase;letter-spacing:.1em;
}
.rv-grid-count{width:22px;height:22px;border-radius:50%;background:var(--surf3);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;color:var(--ink3)}

/* ══ CARD GRID ══ */
.rv-grid{
  display:grid;
  grid-template-columns:repeat(auto-fill,minmax(290px,1fr));
  gap:16px;
  position:relative;z-index:0;
}

/* ══ REVIEW CARD ══ */
.rv-card{
  background:var(--surf);border:1.5px solid var(--bdr);border-radius:18px;
  display:flex;flex-direction:column;overflow:hidden;
  box-shadow:var(--sh);
  transition:transform .28s cubic-bezier(.22,1,.36,1),box-shadow .28s,border-color .28s;
  animation:rv-card-in .5s cubic-bezier(.22,1,.36,1) both;
  animation-delay:calc(var(--i,0) * 42ms);
  position:relative;
}
.rv-card-hov{transform:translateY(-5px);box-shadow:var(--sh-h)}
.rv-card-stripe{
  position:absolute;top:0;left:0;right:0;height:3px;opacity:.7;
}

/* Header */
.rv-card-head{
  display:flex;align-items:flex-start;justify-content:space-between;gap:10px;
  padding:18px 16px 12px;
}
.rv-card-user{display:flex;align-items:flex-start;gap:11px;flex:1;min-width:0}
.rv-avatar{
  width:42px;height:42px;border-radius:12px;flex-shrink:0;
  display:flex;align-items:center;justify-content:center;
  font-family:'Fraunces',serif;font-size:16px;font-weight:800;letter-spacing:-.01em;
}
.rv-user-name{font-size:14px;font-weight:700;color:var(--ink);margin-bottom:4px}
.rv-rest-chip{
  display:inline-flex;align-items:center;gap:3px;
  font-size:10.5px;font-weight:600;color:var(--ink3);
  background:var(--surf2);border:1px solid var(--bdr);
  padding:2px 7px;border-radius:5px;
  max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
}
.rv-card-top-right{display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex-shrink:0}
.rv-sentiment-badge{
  display:inline-flex;align-items:center;gap:4px;padding:3px 9px;
  border-radius:50px;font-size:10px;font-weight:700;border:1.5px solid;white-space:nowrap;
}
.rv-del-btn{
  width:28px;height:28px;border-radius:8px;border:1.5px solid var(--bdr);
  background:transparent;color:var(--ink4);display:flex;align-items:center;justify-content:center;
  cursor:pointer;transition:all .15s;opacity:0;
}
.rv-del-btn-show{opacity:1}
.rv-del-btn:hover{border-color:#fca5a5;color:var(--rose);background:var(--rose-lt)}

/* Stars */
.rv-card-stars{display:flex;align-items:center;gap:8px;padding:0 16px 10px}
.rv-stars{display:flex;gap:2px}
.rv-star-on{color:#f59e0b;fill:#f59e0b}
.rv-star-off{color:#e5e0d8;fill:#e5e0d8}
.rv-rating-num{font-family:'Fraunces',serif;font-size:15px;font-weight:800;color:var(--ink);letter-spacing:-.02em}

/* Comment */
.rv-card-comment{
  margin:0 16px;padding:14px;
  background:var(--surf2);border:1.5px solid var(--bdr);border-radius:12px;
  position:relative;flex:1;
}
.rv-quote-icon{position:absolute;top:-8px;left:12px;color:var(--amber);background:var(--surf);padding:1px 3px;border-radius:4px}
.rv-comment-text{
  font-size:13px;color:var(--ink2);line-height:1.65;font-style:italic;
  display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden;
}

/* Footer */
.rv-card-footer{
  display:flex;align-items:center;justify-content:space-between;
  padding:10px 16px 14px;margin-top:10px;
  border-top:1px solid var(--bdr);
}
.rv-footer-id,.rv-footer-date{
  display:inline-flex;align-items:center;gap:3px;
  font-size:10.5px;color:var(--ink4);font-weight:500;
}
.rv-footer-id{font-family:monospace}

/* ══ LOADING / STATE ══ */
.rv-loading{padding:80px 20px;display:flex;flex-direction:column;align-items:center;gap:14px;color:var(--ink3);font-size:13.5px;font-weight:600}
.rv-loader{width:42px;height:42px;border-radius:50%;border:3px solid var(--surf3);border-top-color:var(--amber);animation:rv-spin .8s linear infinite}
.rv-state{padding:80px 20px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:12px;color:var(--ink4)}
.rv-state-emoji{font-size:52px;filter:grayscale(.3)}
.rv-state h3{font-family:'Fraunces',serif;font-size:20px;font-weight:700;color:var(--ink2)}
.rv-state p{font-size:13.5px;color:var(--ink3)}
.rv-state-err{color:var(--rose)}
.rv-state-err h3{color:#991b1b}
.rv-state-btn{margin-top:4px;padding:9px 22px;border-radius:10px;border:1.5px solid var(--bdr2);background:var(--surf);color:var(--ink2);font-family:inherit;font-size:12.5px;font-weight:700;cursor:pointer;transition:all .15s;box-shadow:var(--sh)}
.rv-state-btn:hover{border-color:var(--amber);color:var(--amber);background:#fffbeb}
.rv-footer{padding:12px 28px;font-size:11.5px;color:var(--ink4);text-align:right;border-top:1px solid var(--bdr);background:var(--surf2)}

/* ══ DELETE MODAL ══ */
.rv-overlay{position:fixed;inset:0;z-index:1000;background:rgba(28,25,23,.45);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:20px}
.rv-modal{background:#fff;border:1.5px solid var(--bdr);border-radius:22px;padding:30px 26px 24px;width:100%;max-width:410px;position:relative;box-shadow:0 22px 64px rgba(28,25,23,.18);animation:rv-modal .28s cubic-bezier(.22,1,.36,1)}
.rv-modal-x{position:absolute;top:13px;right:13px;width:27px;height:27px;border-radius:50%;border:1.5px solid var(--bdr);background:var(--surf2);color:var(--ink3);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .14s}
.rv-modal-x:hover{background:var(--rose-lt);color:var(--rose)}
.rv-modal-icon{width:56px;height:56px;border-radius:15px;background:var(--rose-lt);display:flex;align-items:center;justify-content:center;color:var(--rose);margin:0 auto 16px;box-shadow:0 4px 14px rgba(220,38,38,.14)}
.rv-modal-title{font-family:'Fraunces',serif;font-size:22px;font-weight:800;color:var(--ink);text-align:center;margin-bottom:9px}
.rv-modal-body{font-size:13.5px;color:var(--ink3);text-align:center;line-height:1.7;margin-bottom:22px}
.rv-modal-body strong{color:var(--ink)}
.rv-modal-btns{display:flex;gap:10px}
.rv-mbtn-ghost{flex:1;padding:11px;border-radius:11px;border:1.5px solid var(--bdr2);background:transparent;font-family:inherit;font-size:13px;font-weight:700;color:var(--ink2);cursor:pointer;transition:all .15s}
.rv-mbtn-ghost:hover{background:var(--surf2)}
.rv-mbtn-ghost:disabled{opacity:.4;cursor:not-allowed}
.rv-mbtn-danger{flex:1;padding:11px;border-radius:11px;border:none;background:linear-gradient(135deg,#ef4444,#dc2626);font-family:inherit;font-size:13px;font-weight:800;color:#fff;cursor:pointer;box-shadow:0 3px 14px rgba(220,38,38,.26);transition:all .18s;display:flex;align-items:center;justify-content:center;gap:6px}
.rv-mbtn-danger:hover{transform:translateY(-1px);box-shadow:0 5px 20px rgba(220,38,38,.34)}
.rv-mbtn-danger:disabled{opacity:.5;cursor:not-allowed;transform:none}
.rv-spin{width:12px;height:12px;border-radius:50%;border:2px solid rgba(28,25,23,.15);border-top-color:var(--ink2);animation:rv-spin .7s linear infinite;display:inline-block;flex-shrink:0}

@media(max-width:640px){
  .rv-hero{padding:26px 16px 22px}
  .rv-insight-row{flex-direction:column}
  .rv-chips{border-right:none;border-bottom:1.5px solid var(--bdr)}
  .rv-dist{padding:14px 16px}
  .rv-toolbar{padding:12px 16px}
  .rv-content{padding:16px 14px 50px}
  .rv-grid{grid-template-columns:1fr;gap:12px}
  .rv-modal-btns{flex-direction:column}
}
`;