import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  BarChart3, Users, Store, UtensilsCrossed,
  Layers, Truck, MessageSquare,
  LogOut, Menu, X, Bell, Search,
  ChevronRight, Sparkles, Activity,
  ShoppingBag, Star, Zap,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

/* ── nav config ──────────────────────────────────────── */
const NAV = [
  {
    group: "Overview",
    items: [
      { icon: BarChart3,       label: "Dashboard",    path: "/admin",               end: true  },
    ],
  },
  {
    group: "Management",
    items: [
      { icon: Store,           label: "Restaurants",  path: "/admin/restaurants"               },
      { icon: Users,           label: "Users",        path: "/admin/users"                     },
      { icon: Layers,          label: "Categories",   path: "/admin/categories"                },
      { icon: UtensilsCrossed, label: "Menu Items",   path: "/admin/menu-items"                },
    ],
  },
  {
    group: "Operations",
    items: [
      { icon: Truck,           label: "Deliveries",   path: "/admin/deliveries"                },
      { icon: ShoppingBag,     label: "Orders",       path: "/admin/orders"                    },
      { icon: MessageSquare,   label: "Reviews",      path: "/admin/reviews"                   },
    ],
  },
];

/* ── page title map ──────────────────────────────────── */
const PAGE_TITLES = {
  "/admin":              { title: "Dashboard",    sub: "Platform overview & analytics"           },
  "/admin/restaurants":  { title: "Restaurants",  sub: "Manage partner restaurants"              },
  "/admin/users":        { title: "Users",        sub: "Manage platform users"                   },
  "/admin/categories":   { title: "Categories",   sub: "Manage food categories"                  },
  "/admin/menu-items":   { title: "Menu Items",   sub: "Monitor menu items across restaurants"   },
  "/admin/deliveries":   { title: "Deliveries",   sub: "Track deliveries in real time"           },
  "/admin/orders":       { title: "Orders",       sub: "View and manage all orders"              },
  "/admin/reviews":      { title: "Reviews",      sub: "Moderate customer feedback"              },
};

/* ── mock notifications ─────────────────────────────── */
const NOTIFS = [
  { id: 1, title: "New restaurant registered",  sub: "Spice Garden applied for approval", time: "2m ago",  unread: true,  icon: Store,        color: "#0f766e" },
  { id: 2, title: "Order #1043 cancelled",      sub: "Customer requested cancellation",   time: "18m ago", unread: true,  icon: ShoppingBag,  color: "#dc2626" },
  { id: 3, title: "New 5-star review",          sub: "Burger Barn received excellent review", time: "1h ago",  unread: true,  icon: Star,         color: "#d97706" },
  { id: 4, title: "Delivery completed",         sub: "Order #1040 delivered by Rahul",    time: "2h ago",  unread: false, icon: Truck,        color: "#15803d" },
  { id: 5, title: "Menu item disabled",         sub: "Dal Makhani marked unavailable",    time: "3h ago",  unread: false, icon: UtensilsCrossed, color: "#7c3aed" },
];

export default function AdminLayout() {
  const [sidebarOpen,      setSidebarOpen]      = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notifOpen,        setNotifOpen]        = useState(false);
  const [searchOpen,       setSearchOpen]       = useState(false);
  const [notifs,           setNotifs]           = useState(NOTIFS);
  const notifRef  = useRef(null);
  const searchRef = useRef(null);

  const { logout } = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();

  const unreadCount = notifs.filter(n => n.unread).length;
  const pageInfo = PAGE_TITLES[location.pathname] ?? { title: "Admin", sub: "Platform management" };

  /* close dropdowns on outside click */
  useEffect(() => {
    const h = (e) => {
      if (notifRef.current  && !notifRef.current.contains(e.target))  setNotifOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleLogout = () => { logout(); navigate("/login"); };

  const markAllRead = () => setNotifs(p => p.map(n => ({ ...n, unread: false })));

  return (
    <>
      <style>{CSS}</style>

      <div className="al-root">

        {/* ── MOBILE OVERLAY ── */}
        {sidebarOpen && (
          <div className="al-mob-overlay" onClick={() => setSidebarOpen(false)} />
        )}

        {/* ══════════════════════════════════════════════
            SIDEBAR
        ══════════════════════════════════════════════ */}
        <aside className={`al-sidebar ${sidebarOpen ? "al-sidebar-open" : ""} ${sidebarCollapsed ? "al-sidebar-collapsed" : ""}`}>

          {/* Logo */}
          <div className="al-logo-area">
            <div className="al-logo-icon">
              <Zap size={18} />
            </div>
            {!sidebarCollapsed && (
              <div className="al-logo-text">
                <span className="al-logo-brand">YumAdmin</span>
                <span className="al-logo-tag">Platform Console</span>
              </div>
            )}
            {/* Collapse toggle — desktop only */}
            <button
              className="al-collapse-btn"
              onClick={() => setSidebarCollapsed(v => !v)}
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <ChevronRight size={13} className={`al-collapse-icon ${sidebarCollapsed ? "" : "al-collapse-icon-open"}`} />
            </button>
            {/* Close on mobile */}
            <button className="al-mob-close" onClick={() => setSidebarOpen(false)}>
              <X size={16} />
            </button>
          </div>

          {/* Admin profile pill */}
          {!sidebarCollapsed && (
            <div className="al-profile-pill">
              <div className="al-profile-avatar">A</div>
              <div className="al-profile-info">
                <p className="al-profile-name">Platform Admin</p>
                <p className="al-profile-role"><span className="al-role-dot" />Super Admin</p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="al-nav">
            {NAV.map(group => (
              <div key={group.group} className="al-nav-group">
                {!sidebarCollapsed && (
                  <p className="al-nav-group-label">{group.group}</p>
                )}
                {group.items.map(item => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.end}
                      className={({ isActive }) =>
                        `al-nav-item ${isActive ? "al-nav-item-active" : ""} ${sidebarCollapsed ? "al-nav-item-collapsed" : ""}`
                      }
                      onClick={() => setSidebarOpen(false)}
                      title={sidebarCollapsed ? item.label : undefined}
                    >
                      {({ isActive }) => (
                        <>
                          <span className={`al-nav-icon ${isActive ? "al-nav-icon-active" : ""}`}>
                            <Icon size={17} />
                          </span>
                          {!sidebarCollapsed && (
                            <span className="al-nav-label">{item.label}</span>
                          )}
                          {!sidebarCollapsed && isActive && (
                            <span className="al-nav-active-dot" />
                          )}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Logout */}
          <div className="al-sidebar-footer">
            <button className={`al-logout-btn ${sidebarCollapsed ? "al-logout-collapsed" : ""}`} onClick={handleLogout} title="Logout">
              <LogOut size={16} />
              {!sidebarCollapsed && <span>Logout</span>}
            </button>
          </div>
        </aside>

        {/* ══════════════════════════════════════════════
            MAIN CONTENT
        ══════════════════════════════════════════════ */}
        <div className="al-main">

          {/* ── TOP BAR ── */}
          <header className="al-topbar">

            {/* Left — hamburger + breadcrumb */}
            <div className="al-topbar-left">
              <button className="al-hamburger" onClick={() => setSidebarOpen(true)}>
                <Menu size={20} />
              </button>
              <div className="al-breadcrumb">
                <Sparkles size={12} className="al-bread-spark" />
                <span className="al-bread-root">Admin</span>
                <ChevronRight size={12} className="al-bread-sep" />
                <span className="al-bread-current">{pageInfo.title}</span>
              </div>
            </div>

            {/* Right — search, bell, profile */}
            <div className="al-topbar-right">

              {/* Search */}
              <div className="al-search-wrap" ref={searchRef}>
                <button
                  className={`al-search-trigger ${searchOpen ? "al-search-trigger-open" : ""}`}
                  onClick={() => setSearchOpen(v => !v)}
                >
                  <Search size={15} />
                  {!searchOpen && <span className="al-search-placeholder">Search…</span>}
                </button>
                {searchOpen && (
                  <div className="al-search-dropdown">
                    <div className="al-search-input-wrap">
                      <Search size={14} />
                      <input className="al-search-input" placeholder="Search restaurants, users, orders…" autoFocus />
                    </div>
                    <div className="al-search-hint">Press Enter to search across all sections</div>
                  </div>
                )}
              </div>

              {/* Notifications */}
              <div className="al-notif-wrap" ref={notifRef}>
                <button
                  className={`al-notif-btn ${notifOpen ? "al-notif-btn-open" : ""}`}
                  onClick={() => setNotifOpen(v => !v)}
                >
                  <Bell size={17} />
                  {unreadCount > 0 && (
                    <span className="al-notif-badge">{unreadCount}</span>
                  )}
                </button>

                {notifOpen && (
                  <div className="al-notif-panel">
                    <div className="al-notif-header">
                      <div>
                        <h3 className="al-notif-title">Notifications</h3>
                        {unreadCount > 0 && (
                          <p className="al-notif-unread-count">{unreadCount} unread</p>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button className="al-notif-mark-read" onClick={markAllRead}>
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="al-notif-list">
                      {notifs.map(n => {
                        const Icon = n.icon;
                        return (
                          <div key={n.id} className={`al-notif-item ${n.unread ? "al-notif-item-unread" : ""}`}>
                            <div className="al-notif-item-icon" style={{ background: n.color + "18", color: n.color }}>
                              <Icon size={13} />
                            </div>
                            <div className="al-notif-item-body">
                              <p className="al-notif-item-title">{n.title}</p>
                              <p className="al-notif-item-sub">{n.sub}</p>
                              <p className="al-notif-item-time">{n.time}</p>
                            </div>
                            {n.unread && <span className="al-notif-item-dot" />}
                          </div>
                        );
                      })}
                    </div>

                    <div className="al-notif-footer">
                      View all notifications
                    </div>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="al-topbar-divider" />

              {/* Admin profile */}
              <div className="al-admin-profile">
                <div className="al-admin-info">
                  <p className="al-admin-name">Platform Admin</p>
                  <p className="al-admin-status"><span className="al-status-dot" />Online</p>
                </div>
                <div className="al-admin-avatar">A</div>
              </div>

            </div>
          </header>

          {/* ── PAGE TITLE BAR ── */}
          <div className="al-page-titlebar">
            <div>
              <h1 className="al-page-title">{pageInfo.title}</h1>
              <p className="al-page-sub">{pageInfo.sub}</p>
            </div>
            <div className="al-page-live">
              <Activity size={11} />
              <span>Live</span>
            </div>
          </div>

          {/* ── CONTENT ── */}
          <div className="al-content">
            <Outlet />
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
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,700;0,800;1,700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

.al-root *,.al-root *::before,.al-root *::after{box-sizing:border-box;margin:0;padding:0}
.al-root{
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
  --teal-lt:#f0fdfa;
  --amber:#d97706;
  --rose:#dc2626;
  --indigo:#4f46e5;
  --sidebar-w:252px;
  --sidebar-w-collapsed:68px;
  --topbar-h:60px;
  --sh:0 1px 3px rgba(28,25,23,.05),0 4px 14px rgba(28,25,23,.07);
  --sh-h:0 6px 22px rgba(28,25,23,.11),0 18px 44px rgba(28,25,23,.09);
  font-family:'Plus Jakarta Sans',system-ui,sans-serif;
  display:flex;min-height:100vh;background:var(--bg);color:var(--ink);
}

@keyframes al-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes al-dd{from{opacity:0;transform:translateY(-8px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes al-spin{to{transform:rotate(360deg)}}
@keyframes al-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(1.6)}}
@keyframes al-slide-in{from{transform:translateX(-100%)}to{transform:translateX(0)}}

/* ══ SIDEBAR ══ */
.al-sidebar{
  width:var(--sidebar-w);flex-shrink:0;height:100vh;
  background:var(--surf);border-right:1.5px solid var(--bdr);
  display:flex;flex-direction:column;
  position:sticky;top:0;
  transition:width .25s cubic-bezier(.22,1,.36,1);
  overflow:hidden;z-index:50;
}
.al-sidebar-collapsed{width:var(--sidebar-w-collapsed)}

/* Mobile sidebar */
@media(max-width:1023px){
  .al-sidebar{
    position:fixed;left:0;top:0;height:100%;
    transform:translateX(-100%);transition:transform .28s cubic-bezier(.22,1,.36,1);
    box-shadow:8px 0 40px rgba(28,25,23,.12);
    width:var(--sidebar-w)!important;
  }
  .al-sidebar-open{transform:translateX(0)!important}
  .al-collapse-btn{display:none!important}
}
.al-mob-overlay{position:fixed;inset:0;background:rgba(28,25,23,.45);backdrop-filter:blur(4px);z-index:49}
.al-mob-close{display:none!important}
@media(max-width:1023px){
  .al-mob-close{display:flex!important;align-items:center;justify-content:center;width:28px;height:28px;border-radius:8px;border:1.5px solid var(--bdr);background:var(--surf2);color:var(--ink3);cursor:pointer;margin-left:auto;flex-shrink:0}
}

/* ── Logo ── */
.al-logo-area{
  height:var(--topbar-h);display:flex;align-items:center;gap:11px;
  padding:0 16px;border-bottom:1.5px solid var(--bdr);flex-shrink:0;
  background:linear-gradient(135deg,#fdf8f0 0%,#f0fdfa 100%);
}
.al-logo-icon{
  width:34px;height:34px;border-radius:10px;flex-shrink:0;
  background:linear-gradient(135deg,var(--teal),#0d9488);
  display:flex;align-items:center;justify-content:center;color:#fff;
  box-shadow:0 3px 10px rgba(15,118,110,.32);
}
.al-logo-text{display:flex;flex-direction:column;min-width:0;flex:1}
.al-logo-brand{
  font-family:'Fraunces',serif;font-size:17px;font-weight:800;
  color:var(--ink);letter-spacing:-.02em;line-height:1;
  background:linear-gradient(135deg,var(--teal),var(--amber));
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
}
.al-logo-tag{font-size:9.5px;font-weight:600;color:var(--ink4);text-transform:uppercase;letter-spacing:.07em;margin-top:1px}
.al-collapse-btn{
  width:22px;height:22px;border-radius:6px;border:1.5px solid var(--bdr);
  background:var(--surf2);color:var(--ink4);display:flex;align-items:center;justify-content:center;
  cursor:pointer;flex-shrink:0;margin-left:auto;transition:all .15s;
}
.al-collapse-btn:hover{border-color:var(--teal);color:var(--teal);background:var(--teal-lt)}
.al-collapse-icon{transition:transform .25s}
.al-collapse-icon-open{transform:rotate(180deg)}

/* ── Profile pill ── */
.al-profile-pill{
  margin:14px 12px 10px;padding:11px 13px;
  background:linear-gradient(135deg,#f0fdfa,#fffbeb);
  border:1.5px solid #d1fae5;border-radius:13px;
  display:flex;align-items:center;gap:10px;
  flex-shrink:0;
}
.al-profile-avatar{
  width:34px;height:34px;border-radius:10px;flex-shrink:0;
  background:linear-gradient(135deg,var(--teal),#0d9488);
  display:flex;align-items:center;justify-content:center;
  font-family:'Fraunces',serif;font-size:16px;font-weight:800;color:#fff;
}
.al-profile-name{font-size:12.5px;font-weight:700;color:var(--ink);line-height:1}
.al-profile-role{display:flex;align-items:center;gap:5px;font-size:10.5px;color:var(--teal);font-weight:600;margin-top:2px}
.al-role-dot{width:6px;height:6px;border-radius:50%;background:var(--teal);animation:al-pulse 2.5s ease infinite}

/* ── Nav ── */
.al-nav{flex:1;overflow-y:auto;padding:8px 10px;scrollbar-width:none;display:flex;flex-direction:column;gap:0}
.al-nav::-webkit-scrollbar{display:none}
.al-nav-group{margin-bottom:8px}
.al-nav-group-label{
  font-size:9.5px;font-weight:800;color:var(--ink4);
  text-transform:uppercase;letter-spacing:.1em;
  padding:8px 10px 6px;
}
.al-nav-item{
  display:flex;align-items:center;gap:10px;padding:10px 10px;
  border-radius:11px;text-decoration:none;color:var(--ink3);
  transition:all .15s;position:relative;font-size:13.5px;font-weight:600;
  margin-bottom:2px;
}
.al-nav-item:hover{background:var(--surf2);color:var(--ink)}
.al-nav-item-active{background:var(--teal-lt)!important;color:var(--teal)!important;font-weight:700}
.al-nav-item-collapsed{padding:10px;justify-content:center}
.al-nav-icon{
  width:32px;height:32px;border-radius:9px;flex-shrink:0;
  display:flex;align-items:center;justify-content:center;
  background:transparent;color:inherit;transition:all .15s;
}
.al-nav-icon-active{background:rgba(15,118,110,.12)!important;color:var(--teal)!important}
.al-nav-item:hover .al-nav-icon{background:var(--surf3)}
.al-nav-label{flex:1;white-space:nowrap}
.al-nav-active-dot{
  width:6px;height:6px;border-radius:50%;background:var(--teal);flex-shrink:0;
  box-shadow:0 0 6px rgba(15,118,110,.5);
}

/* ── Sidebar footer ── */
.al-sidebar-footer{padding:12px 10px;border-top:1.5px solid var(--bdr);flex-shrink:0}
.al-logout-btn{
  width:100%;display:flex;align-items:center;gap:10px;padding:10px 10px;
  border:none;background:transparent;border-radius:11px;cursor:pointer;
  font-family:inherit;font-size:13.5px;font-weight:600;color:var(--ink3);
  transition:all .15s;
}
.al-logout-btn:hover{background:#fff1f2;color:var(--rose)}
.al-logout-collapsed{justify-content:center}

/* ══ MAIN ══ */
.al-main{
  flex:1;min-width:0;display:flex;flex-direction:column;
  background:var(--bg);
}

/* ── Topbar ── */
.al-topbar{
  height:var(--topbar-h);background:var(--surf);border-bottom:1.5px solid var(--bdr);
  display:flex;align-items:center;justify-content:space-between;
  padding:0 24px;position:sticky;top:0;z-index:40;
  gap:16px;flex-shrink:0;
}
.al-topbar-left{display:flex;align-items:center;gap:14px;min-width:0}
.al-hamburger{
  display:none;width:36px;height:36px;border-radius:10px;border:1.5px solid var(--bdr);
  background:var(--surf2);color:var(--ink2);align-items:center;justify-content:center;
  cursor:pointer;flex-shrink:0;transition:all .15s;
}
.al-hamburger:hover{border-color:var(--teal);color:var(--teal);background:var(--teal-lt)}
@media(max-width:1023px){.al-hamburger{display:flex}}

.al-breadcrumb{display:flex;align-items:center;gap:6px;font-size:12.5px;font-weight:600;color:var(--ink3);flex-wrap:nowrap;overflow:hidden}
.al-bread-spark{color:var(--amber);flex-shrink:0}
.al-bread-root{color:var(--ink3);white-space:nowrap}
.al-bread-sep{color:var(--ink4);flex-shrink:0}
.al-bread-current{color:var(--ink);font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

.al-topbar-right{display:flex;align-items:center;gap:10px;flex-shrink:0}
.al-topbar-divider{width:1px;height:28px;background:var(--bdr);flex-shrink:0}

/* ── Search ── */
.al-search-wrap{position:relative}
.al-search-trigger{
  display:flex;align-items:center;gap:8px;padding:8px 14px;
  background:var(--surf2);border:1.5px solid var(--bdr);border-radius:10px;
  font-family:inherit;font-size:12.5px;font-weight:500;color:var(--ink4);
  cursor:pointer;transition:all .15s;white-space:nowrap;
}
.al-search-trigger:hover,.al-search-trigger-open{border-color:var(--teal);background:#fff;color:var(--ink)}
.al-search-placeholder{font-size:12px;color:var(--ink4)}
@media(max-width:640px){.al-search-placeholder{display:none}}
.al-search-dropdown{
  position:absolute;top:calc(100% + 8px);right:0;min-width:340px;
  background:#fff;border:1.5px solid var(--bdr);border-radius:16px;
  box-shadow:0 12px 40px rgba(28,25,23,.13);
  animation:al-dd .2s cubic-bezier(.22,1,.36,1);z-index:200;overflow:hidden;
}
.al-search-input-wrap{display:flex;align-items:center;gap:9px;padding:14px 16px;border-bottom:1.5px solid var(--bdr);color:var(--ink4)}
.al-search-input{flex:1;border:none;background:transparent;font-family:inherit;font-size:14px;color:var(--ink);outline:none}
.al-search-input::placeholder{color:var(--ink4)}
.al-search-hint{padding:10px 16px;font-size:11px;color:var(--ink4);font-weight:500}

/* ── Notifications ── */
.al-notif-wrap{position:relative}
.al-notif-btn{
  position:relative;width:38px;height:38px;border-radius:11px;
  border:1.5px solid var(--bdr);background:var(--surf2);color:var(--ink3);
  display:flex;align-items:center;justify-content:center;
  cursor:pointer;transition:all .15s;
}
.al-notif-btn:hover,.al-notif-btn-open{border-color:var(--amber);color:var(--amber);background:#fffbeb}
.al-notif-badge{
  position:absolute;top:-4px;right:-4px;
  min-width:17px;height:17px;border-radius:50%;
  background:var(--rose);color:#fff;font-size:9.5px;font-weight:800;
  display:flex;align-items:center;justify-content:center;
  border:2px solid var(--surf);
}
.al-notif-panel{
  position:absolute;top:calc(100% + 10px);right:0;width:360px;
  background:#fff;border:1.5px solid var(--bdr);border-radius:18px;
  box-shadow:0 14px 48px rgba(28,25,23,.14);
  animation:al-dd .22s cubic-bezier(.22,1,.36,1);z-index:200;overflow:hidden;
}
.al-notif-header{
  display:flex;align-items:flex-start;justify-content:space-between;
  padding:16px 18px 12px;border-bottom:1.5px solid var(--bdr);
}
.al-notif-title{font-family:'Fraunces',serif;font-size:16px;font-weight:800;color:var(--ink);line-height:1}
.al-notif-unread-count{font-size:11px;color:var(--amber);font-weight:700;margin-top:2px}
.al-notif-mark-read{font-size:11.5px;font-weight:700;color:var(--teal);background:none;border:none;cursor:pointer;padding:4px 8px;border-radius:6px;transition:background .14s;font-family:inherit}
.al-notif-mark-read:hover{background:var(--teal-lt)}
.al-notif-list{max-height:340px;overflow-y:auto;scrollbar-width:thin}
.al-notif-item{
  display:flex;align-items:flex-start;gap:11px;padding:13px 18px;
  border-bottom:1px solid var(--bdr);transition:background .14s;cursor:pointer;position:relative;
}
.al-notif-item:hover{background:var(--surf2)}
.al-notif-item:last-child{border-bottom:none}
.al-notif-item-unread{background:#fffbf5}
.al-notif-item-icon{
  width:32px;height:32px;border-radius:9px;flex-shrink:0;
  display:flex;align-items:center;justify-content:center;
}
.al-notif-item-body{flex:1;min-width:0}
.al-notif-item-title{font-size:12.5px;font-weight:700;color:var(--ink);line-height:1.3;margin-bottom:2px}
.al-notif-item-sub{font-size:11.5px;color:var(--ink3);line-height:1.4;margin-bottom:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.al-notif-item-time{font-size:10.5px;color:var(--ink4);font-weight:500}
.al-notif-item-dot{width:7px;height:7px;border-radius:50%;background:var(--amber);flex-shrink:0;margin-top:4px}
.al-notif-footer{
  padding:12px 18px;text-align:center;
  font-size:12.5px;font-weight:700;color:var(--teal);cursor:pointer;
  background:var(--surf2);border-top:1px solid var(--bdr);transition:background .14s;
}
.al-notif-footer:hover{background:#f0fdfa}

/* ── Admin profile ── */
.al-admin-profile{display:flex;align-items:center;gap:10px;cursor:pointer;padding:4px 6px;border-radius:11px;transition:background .15s}
.al-admin-profile:hover{background:var(--surf2)}
.al-admin-info{text-align:right}
.al-admin-name{font-size:12.5px;font-weight:700;color:var(--ink);line-height:1}
.al-admin-status{display:flex;align-items:center;justify-content:flex-end;gap:4px;font-size:10.5px;color:var(--teal);font-weight:600;margin-top:2px}
.al-status-dot{width:6px;height:6px;border-radius:50%;background:var(--teal);animation:al-pulse 2.5s ease infinite}
.al-admin-avatar{
  width:36px;height:36px;border-radius:11px;flex-shrink:0;
  background:linear-gradient(135deg,var(--teal),#0d9488);
  display:flex;align-items:center;justify-content:center;
  font-family:'Fraunces',serif;font-size:16px;font-weight:800;color:#fff;
  box-shadow:0 2px 8px rgba(15,118,110,.28);
}
@media(max-width:640px){.al-admin-info{display:none}}

/* ── Page title bar ── */
.al-page-titlebar{
  display:flex;align-items:center;justify-content:space-between;
  padding:18px 28px 14px;border-bottom:1.5px solid var(--bdr);
  background:var(--surf);flex-shrink:0;
}
.al-page-title{
  font-family:'Fraunces',serif;font-size:22px;font-weight:800;
  color:var(--ink);line-height:1;letter-spacing:-.02em;
}
.al-page-sub{font-size:12px;color:var(--ink4);margin-top:3px;font-weight:500}
.al-page-live{
  display:inline-flex;align-items:center;gap:6px;padding:5px 12px;
  background:#ecfeff;border:1.5px solid #a5f3fc;border-radius:50px;
  font-size:11px;font-weight:700;color:#0e7490;flex-shrink:0;
}
.al-page-live svg{animation:al-pulse 2s ease infinite}

/* ── Content ── */
.al-content{flex:1;overflow-y:auto;padding:24px 28px;background:var(--bg)}
@media(max-width:640px){
  .al-topbar{padding:0 14px}
  .al-page-titlebar{padding:14px 16px 12px}
  .al-content{padding:16px}
}
`;