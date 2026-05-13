// import { useState } from "react";
// import { Link, useLocation, useNavigate } from "react-router-dom";
// import {
//   Home,
//   ShoppingCart,
//   User,
//   LogOut,
//   Menu as MenuIcon,
//   X,
//   Search,
//   UtensilsCrossed,
//   Package,
// } from "lucide-react";
// import { useAuth } from "../../contexts/AuthContext";

// const CustomerLayout = ({ children }) => {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [searchOpen, setSearchOpen] = useState(false);
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { logout, user } = useAuth();
//   const customerName = user?.userName || 
//                       localStorage.getItem("customerName") || 
//                       localStorage.getItem("userName") || 
//                       "Customer";

//   const handleLogout = () => {
//     logout();
//     localStorage.removeItem("cart"); // Clear cart on logout
//     navigate("/customer/login");
//   };

//   const cartItemCount = JSON.parse(localStorage.getItem("cart") || "[]").length;

// const menuItems = [
//   {
//     name: "All Items",
//     icon: UtensilsCrossed,
//     path: "/customer/all-items",
//   },
//   {
//     name: "Restaurants",
//     icon: Home,
//     path: "/customer/restaurants", // changed
//   },
//   {
//     name: "My Orders",
//     icon: Package,
//     path: "/customer/orders",
//   },
//   {
//     name: "Profile",
//     icon: User,
//     path: "/customer/profile",
//   },
// ];

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Top Navigation Bar */}
//       <header className="bg-white shadow-md sticky top-0 z-50">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex items-center justify-between h-16">
//             {/* Logo */}
//             <Link to="/customer/all-items" className="flex items-center gap-2">
//               <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
//                 <UtensilsCrossed className="text-white" size={24} />
//               </div>
//               <span className="text-2xl font-black text-gray-900">FoodHub</span>
//             </Link>

            

//             {/* Search Bar - Desktop */}
//             <div className="hidden md:flex flex-1 max-w-2xl mx-8">
//               <div className="relative w-full">
//                 <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//                 <input
//                   type="text"
//                   placeholder="Search for restaurants, food..."
//                   className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-full focus:border-orange-500 focus:outline-none transition"
//                   onClick={() => navigate("/customer/all-items?search=true")}
//                 />
//               </div>
//             </div>

//             {/* Right Side Actions */}
//             <div className="flex items-center gap-4">
//               {/* Cart Icon
//               <Link
//                 to="/customer/cart"
//                 className="relative p-2 rounded-full hover:bg-gray-100 transition"
//               >
//                 <ShoppingCart size={24} className="text-gray-700" />
//                 {cartItemCount > 0 && (
//                   <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
//                     {cartItemCount}
//                   </span>
//                 )}
//               </Link> */}

//               {/* Logout Button - Desktop */}
//               <button
//                 onClick={handleLogout}
//                 className="hidden sm:flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition shadow-md"
//               >
//                 <LogOut size={18} />
//                 Logout
//               </button>

//               {/* Profile Menu */}
//               <div className="flex items-center gap-3">
//                 <div className="hidden sm:block text-right">
//                   <p className="text-sm font-semibold text-gray-900">{customerName}</p>
//                   <p className="text-xs text-gray-500">Customer</p>
//                 </div>
//                 <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
//                   <User className="text-white" size={20} />
//                 </div>
//               </div>

//               {/* Mobile Menu Button */}
//               <button
//                 onClick={() => setSidebarOpen(!sidebarOpen)}
//                 className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
//               >
//                 {sidebarOpen ? <X size={24} /> : <MenuIcon size={24} />}
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Mobile Search Bar */}
//         <div className="md:hidden px-4 pb-4">
//           <div className="relative">
//             <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//             <input
//               type="text"
//               placeholder="Search for restaurants, food..."
//               className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-full focus:border-orange-500 focus:outline-none transition"
//               onClick={() => navigate("/customer/all-items?search=true")}
//             />
//           </div>
//         </div>
//       </header>

//       {/* Mobile Sidebar */}
//       {sidebarOpen && (
//         <div className="fixed inset-0 z-50 md:hidden">
//           <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
//           <div className="absolute right-0 top-0 h-full w-64 bg-white shadow-xl">
//             <div className="p-6">
//               <div className="flex items-center justify-between mb-8">
//                 <div className="flex items-center gap-2">
//                   <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
//                     <User className="text-white" size={20} />
//                   </div>
//                   <div>
//                     <p className="font-bold text-gray-900">{customerName}</p>
//                     <p className="text-xs text-gray-500">Customer</p>
//                   </div>
//                 </div>
//                 <button onClick={() => setSidebarOpen(false)}>
//                   <X size={24} />
//                 </button>
//               </div>

//               <nav className="space-y-2">
//                 {menuItems.map((item) => {
//                   const Icon = item.icon;
//                   const isActive = location.pathname === item.path;
//                   return (
//                     <Link
//                       key={item.path}
//                       to={item.path}
//                       onClick={() => setSidebarOpen(false)}
//                       className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
//                         isActive
//                           ? "bg-orange-100 text-orange-700 font-semibold"
//                           : "text-gray-700 hover:bg-gray-100"
//                       }`}
//                     >
//                       <Icon size={22} />
//                       <span>{item.name}</span>
//                     </Link>
//                   );
//                 })}
//               </nav>

//               {/* Logout Button - Mobile */}
//               <button
//                 onClick={() => {
//                   setSidebarOpen(false);
//                   handleLogout();
//                 }}
//                 className="mt-8 w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition font-semibold border-2 border-red-200"
//               >
//                 <LogOut size={22} />
//                 <span>Logout</span>
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Main Content */}
//       <main>{children}</main>
//     </div>
//   );
// };

// export default CustomerLayout;


import { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home, ShoppingCart, User, LogOut, Menu as MenuIcon,
  X, Search, UtensilsCrossed, Package, ChevronRight, Flame,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

/* ─────────────────────────────────────────────────────────────
   HELPER — read cart count from localStorage
───────────────────────────────────────────────────────────── */
const getCartCount = () =>
  JSON.parse(localStorage.getItem("cart") || "[]")
    .reduce((s, i) => s + (i.quantity || 1), 0);

const CustomerLayout = ({ children }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled,   setScrolled]   = useState(false);

  /* ── FIX: cartCount lives in state so it re-renders ── */
  const [cartCount, setCartCount] = useState(getCartCount);

  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const customerName =
    user?.userName ||
    localStorage.getItem("customerName") ||
    localStorage.getItem("userName") ||
    "Customer";

  const initials = customerName
    .split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const refreshCart = useCallback(() => setCartCount(getCartCount()), []);

  /* Poll every 500ms — works without any custom events in add-to-cart */
  useEffect(() => {
    refreshCart(); // immediate read on mount
    const interval = setInterval(refreshCart, 500);
    return () => clearInterval(interval);
  }, [refreshCart]);

  /* Also refresh on route change */
  useEffect(() => { refreshCart(); }, [location.pathname, refreshCart]);

  /* Also listen for manual dispatch and cross-tab storage events */
  useEffect(() => {
    window.addEventListener("cart-updated", refreshCart);
    window.addEventListener("storage",      refreshCart);
    return () => {
      window.removeEventListener("cart-updated", refreshCart);
      window.removeEventListener("storage",      refreshCart);
    };
  }, [refreshCart]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const handleLogout = () => {
    logout();
    localStorage.removeItem("cart");
    setCartCount(0);
    navigate("/customer/login");
  };

  const NAV = [
    { label: "Explore",     icon: UtensilsCrossed, path: "/customer/all-items"   },
    { label: "Restaurants", icon: Home,            path: "/customer/restaurants" },
    { label: "My Orders",   icon: Package,         path: "/customer/orders"      },
    { label: "Profile",     icon: User,            path: "/customer/profile"     },
  ];

  const active = p => location.pathname === p;

  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Syne:wght@700;800&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --red:       #e8431c;
      --red-dk:    #c23516;
      --saffron:   #f09010;
      --grad:      linear-gradient(135deg, #e8431c 0%, #f09010 100%);
      --grad-r:    linear-gradient(135deg, #f09010 0%, #e8431c 100%);
      --glow:      rgba(232,67,28,0.22);
      --bg:        #fdf7f0;
      --surface:   #ffffff;
      --pill:      #fff4eb;
      --border:    rgba(232,67,28,0.10);
      --border-md: rgba(232,67,28,0.20);
      --ink:       #1a0c00;
      --ink-md:    #5a2e10;
      --ink-mt:    #b07850;
      --nav-h:     68px;
      --font-body: 'Plus Jakarta Sans', sans-serif;
      --font-disp: 'Syne', sans-serif;
    }

    html, body {
      background: var(--bg);
      font-family: var(--font-body);
      color: var(--ink);
    }

    .cl-accent {
      height: 3px;
      background: var(--grad);
      position: sticky; top: 0; z-index: 300;
    }

    .cl-header {
      position: sticky; top: 3px; z-index: 299;
      height: var(--nav-h);
      background: rgba(253,247,240,0.94);
      backdrop-filter: blur(22px);
      -webkit-backdrop-filter: blur(22px);
      border-bottom: 1px solid transparent;
      transition: border-color .25s, box-shadow .25s;
    }
    .cl-header.up {
      border-color: var(--border);
      box-shadow: 0 4px 28px rgba(0,0,0,.06);
    }

    .cl-inner {
      max-width: 1380px; margin: 0 auto;
      height: 100%; display: flex; align-items: center;
      gap: 20px; padding: 0 40px;
    }

    .cl-logo {
      display: flex; align-items: center; gap: 10px;
      text-decoration: none; flex-shrink: 0;
    }
    .cl-logo-icon {
      width: 40px; height: 40px; border-radius: 13px;
      background: var(--grad);
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 14px var(--glow);
      transition: transform .22s cubic-bezier(.22,1,.36,1);
    }
    .cl-logo:hover .cl-logo-icon { transform: rotate(-8deg) scale(1.08); }
    .cl-logo-text {
      font-family: var(--font-disp); font-size: 23px; font-weight: 800;
      background: var(--grad);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      letter-spacing: -.5px;
    }

    .cl-desknav { display: flex; align-items: center; gap: 2px; margin-left: 6px; }
    @media(max-width:960px){ .cl-desknav { display: none; } }

    .cl-dlink {
      display: flex; align-items: center; gap: 7px;
      padding: 8px 15px; border-radius: 11px;
      font-size: 14px; font-weight: 500; color: var(--ink-md);
      text-decoration: none; transition: background .15s, color .15s; white-space: nowrap;
    }
    .cl-dlink:hover { background: var(--pill); color: var(--red); }
    .cl-dlink.on { background: var(--pill); color: var(--red); font-weight: 700; }

    .cl-srch { flex: 1; max-width: 400px; margin-left: auto; position: relative; }
    @media(max-width:680px){ .cl-srch { display: none; } }
    .cl-srch svg {
      position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
      color: var(--ink-mt); pointer-events: none; transition: color .2s;
    }
    .cl-srch:focus-within svg { color: var(--red); }
    .cl-srch input {
      width: 100%; padding: 10px 16px 10px 42px;
      border: 1.5px solid var(--border); border-radius: 12px;
      font-family: var(--font-body); font-size: 14px;
      background: rgba(255,255,255,0.7); color: var(--ink);
      outline: none; transition: border-color .2s, box-shadow .2s, background .2s; cursor: pointer;
    }
    .cl-srch input::placeholder { color: var(--ink-mt); }
    .cl-srch input:focus {
      border-color: var(--red); background: #fff;
      box-shadow: 0 0 0 4px rgba(232,67,28,.08);
    }

    .cl-actions { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }

    .cl-icon-btn {
      width: 40px; height: 40px; border-radius: 12px;
      border: 1.5px solid var(--border);
      background: rgba(255,255,255,0.7);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; color: var(--ink-md); text-decoration: none;
      transition: border-color .15s, background .15s, color .15s; position: relative;
    }
    .cl-icon-btn:hover { border-color: var(--red); background: var(--pill); color: var(--red); }

    /* ── BADGE: animate in when count changes ── */
    .cl-badge {
      position: absolute; top: -6px; right: -6px;
      min-width: 18px; height: 18px;
      background: var(--grad); color: #fff;
      font-size: 10px; font-weight: 800;
      border-radius: 20px; padding: 0 4px;
      display: flex; align-items: center; justify-content: center;
      border: 2px solid var(--bg);
      animation: badge-pop .28s cubic-bezier(.22,1,.36,1);
    }
    @keyframes badge-pop {
      0%   { transform: scale(0); opacity: 0; }
      70%  { transform: scale(1.3); }
      100% { transform: scale(1); opacity: 1; }
    }

    .cl-chip {
      display: flex; align-items: center; gap: 9px;
      padding: 5px 14px 5px 5px; border-radius: 100px;
      border: 1.5px solid var(--border); background: rgba(255,255,255,0.7); cursor: default;
    }
    .cl-avatar {
      width: 32px; height: 32px; border-radius: 50%;
      background: var(--grad); color: #fff;
      font-family: var(--font-disp); font-weight: 800; font-size: 12px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; box-shadow: 0 2px 8px var(--glow);
    }
    .cl-uname {
      font-size: 13px; font-weight: 700; color: var(--ink);
      max-width: 90px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    @media(max-width:680px){ .cl-chip .cl-uname { display: none; } }

    .cl-logout {
      display: flex; align-items: center; gap: 7px;
      padding: 9px 18px; border-radius: 12px;
      background: var(--ink); color: #fff;
      font-size: 13px; font-weight: 700; border: none; cursor: pointer;
      font-family: var(--font-body); transition: background .15s, transform .1s;
    }
    .cl-logout:hover { background: #2c1a0a; transform: translateY(-1px); }
    @media(max-width:680px){ .cl-logout { display: none; } }

    .cl-ham {
      width: 40px; height: 40px; border-radius: 12px;
      border: 1.5px solid var(--border); background: rgba(255,255,255,0.7);
      display: none; align-items: center; justify-content: center;
      cursor: pointer; color: var(--ink-md); transition: border-color .15s, background .15s;
    }
    @media(max-width:960px){ .cl-ham { display: flex; } }
    .cl-ham:hover { border-color: var(--red); background: var(--pill); }

    .cl-mob-srch { display: none; padding: 0 20px 14px; }
    @media(max-width:680px){ .cl-mob-srch { display: block; } }
    .cl-mob-srch .ms-wrap { position: relative; }
    .cl-mob-srch .ms-wrap svg { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--ink-mt); pointer-events: none; }
    .cl-mob-srch input {
      width: 100%; padding: 11px 16px 11px 44px;
      border: 1.5px solid var(--border); border-radius: 13px;
      font-family: var(--font-body); font-size: 14px;
      background: rgba(255,255,255,0.8); color: var(--ink); outline: none;
    }
    .cl-mob-srch input::placeholder { color: var(--ink-mt); }

    .cl-ov {
      position: fixed; inset: 0; z-index: 500;
      background: rgba(26,12,0,.45); backdrop-filter: blur(5px);
      animation: ov-in .22s ease;
    }
    @keyframes ov-in { from { opacity:0 } to { opacity:1 } }

    .cl-drawer {
      position: fixed; top: 0; right: 0; bottom: 0; width: 295px;
      background: #fff; z-index: 501;
      display: flex; flex-direction: column; overflow: hidden;
      animation: dr-in .28s cubic-bezier(.16,1,.3,1);
      box-shadow: -12px 0 60px rgba(0,0,0,.18);
    }
    @keyframes dr-in { from { transform: translateX(100%) } to { transform: translateX(0) } }

    .cl-dr-head {
      padding: 24px 20px 20px;
      background: linear-gradient(135deg, #1a0c00 0%, #3a1a08 100%);
      position: relative; overflow: hidden;
    }
    .cl-dr-head::before {
      content: ''; position: absolute; inset: 0;
      background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='rgba(255,255,255,0.04)' stroke-width='1'%3E%3Ccircle cx='30' cy='30' r='20'/%3E%3Ccircle cx='30' cy='30' r='10'/%3E%3C/g%3E%3C/svg%3E") repeat;
      pointer-events: none;
    }
    .cl-dr-av {
      width: 58px; height: 58px; border-radius: 18px;
      background: var(--grad); color: #fff;
      font-family: var(--font-disp); font-weight: 800; font-size: 20px;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 6px 20px rgba(232,67,28,.4); margin-bottom: 14px; position: relative; z-index: 1;
    }
    .cl-dr-name { font-family: var(--font-disp); font-weight: 800; font-size: 18px; color: #fff; position: relative; z-index: 1; }
    .cl-dr-role { font-size: 12px; color: rgba(255,255,255,0.5); margin-top: 3px; position: relative; z-index: 1; }
    .cl-dr-close {
      position: absolute; top: 18px; right: 16px; z-index: 2;
      width: 32px; height: 32px; border-radius: 9px;
      border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.08);
      color: rgba(255,255,255,0.7); cursor: pointer;
      display: flex; align-items: center; justify-content: center; transition: background .15s;
    }
    .cl-dr-close:hover { background: rgba(255,255,255,0.15); color: #fff; }

    .cl-dr-nav { flex: 1; padding: 14px 10px; overflow-y: auto; }
    .cl-dr-link {
      display: flex; align-items: center; gap: 13px;
      padding: 13px 16px; border-radius: 14px;
      color: var(--ink); text-decoration: none;
      font-weight: 500; font-size: 15px; transition: background .15s; margin-bottom: 3px;
    }
    .cl-dr-link:hover { background: var(--pill); color: var(--red); }
    .cl-dr-link.on { background: var(--pill); color: var(--red); font-weight: 700; }
    .cl-dr-link .icon-wrap {
      width: 38px; height: 38px; border-radius: 11px; background: #f5f0ea;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: background .15s;
    }
    .cl-dr-link.on .icon-wrap { background: rgba(232,67,28,0.12); }
    .cl-dr-link .chev { margin-left: auto; opacity: .3; }
    .cl-dr-link.on .chev { opacity: .8; }

    .cl-dr-foot { padding: 14px 10px 30px; border-top: 1px solid var(--border); }
    .cl-dr-logout {
      width: 100%; display: flex; align-items: center; gap: 12px;
      padding: 13px 16px; border-radius: 14px;
      border: 1.5px solid rgba(232,67,28,0.2); background: #fff9f5;
      color: var(--red-dk); font-size: 15px; font-weight: 700;
      cursor: pointer; font-family: var(--font-body); transition: background .15s, border-color .15s;
    }
    .cl-dr-logout:hover { background: var(--pill); border-color: var(--red); }

    .cl-bnav {
      display: none;
      position: fixed; bottom: 0; left: 0; right: 0; z-index: 200;
      background: rgba(253,247,240,0.96); backdrop-filter: blur(20px);
      border-top: 1px solid var(--border);
      padding: 8px 0 max(env(safe-area-inset-bottom, 0px), 8px);
    }
    @media(max-width:680px){ .cl-bnav { display: flex; justify-content: space-around; } }

    .cl-blink {
      flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px;
      text-decoration: none; color: var(--ink-mt); font-size: 10px; font-weight: 600;
      padding: 3px 0; transition: color .15s; position: relative;
    }
    .cl-blink.on { color: var(--red); }
    .cl-blink .bwrap {
      width: 38px; height: 38px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center; transition: background .15s;
    }
    .cl-blink.on .bwrap { background: var(--pill); }

    /* cart badge on bottom nav too */
    .cl-blink .b-badge {
      position: absolute; top: 0; right: calc(50% - 24px);
      min-width: 16px; height: 16px;
      background: var(--grad); color: #fff;
      font-size: 9px; font-weight: 800;
      border-radius: 20px; padding: 0 3px;
      display: flex; align-items: center; justify-content: center;
      border: 2px solid var(--bg);
      animation: badge-pop .28s cubic-bezier(.22,1,.36,1);
    }

    .cl-main { min-height: calc(100vh - var(--nav-h) - 3px); }
    @media(max-width:680px){ .cl-main { padding-bottom: 72px; } }

    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: var(--bg); }
    ::-webkit-scrollbar-thumb { background: #f09010; border-radius: 4px; }
  `;

  return (
    <>
      <style>{CSS}</style>
      <div className="cl-accent" />

      <header className={`cl-header${scrolled ? " up" : ""}`}>
        <div className="cl-inner">

          <Link to="/customer/all-items" className="cl-logo">
            <div className="cl-logo-icon"><Flame size={20} color="#fff" /></div>
            <span className="cl-logo-text">FoodHub</span>
          </Link>

          <nav className="cl-desknav">
            {NAV.map(n => (
              <Link key={n.path} to={n.path} className={`cl-dlink${active(n.path) ? " on" : ""}`}>
                <n.icon size={15} />{n.label}
              </Link>
            ))}
          </nav>

          <div className="cl-srch">
            <Search size={15} />
            <input type="text" placeholder="Search food, restaurants…"
              onClick={() => navigate("/customer/all-items")} readOnly />
          </div>

          <div className="cl-actions">

            <Link to="/customer/cart" className="cl-icon-btn">
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                /* key={cartCount} forces React to re-mount the badge
                   so the pop animation replays every time the count changes */
                <span key={cartCount} className="cl-badge">{cartCount}</span>
              )}
            </Link>

            <div className="cl-chip">
              <div className="cl-avatar">{initials}</div>
              <span className="cl-uname">{customerName}</span>
            </div>

            <button className="cl-logout" onClick={handleLogout}>
              <LogOut size={14} />Logout
            </button>

            <button className="cl-ham" onClick={() => setDrawerOpen(true)}>
              <MenuIcon size={20} />
            </button>
          </div>
        </div>

        <div className="cl-mob-srch">
          <div className="ms-wrap">
            <Search size={15} />
            <input type="text" placeholder="Search food, restaurants…"
              onClick={() => navigate("/customer/all-items")} readOnly />
          </div>
        </div>
      </header>

      {drawerOpen && (
        <>
          <div className="cl-ov" onClick={() => setDrawerOpen(false)} />
          <aside className="cl-drawer">
            <div className="cl-dr-head">
              <div className="cl-dr-av">{initials}</div>
              <div className="cl-dr-name">{customerName}</div>
              <div className="cl-dr-role">Customer Account</div>
              <button className="cl-dr-close" onClick={() => setDrawerOpen(false)}><X size={15} /></button>
            </div>
            <nav className="cl-dr-nav">
              {NAV.map(n => (
                <Link key={n.path} to={n.path}
                  onClick={() => setDrawerOpen(false)}
                  className={`cl-dr-link${active(n.path) ? " on" : ""}`}>
                  <div className="icon-wrap"><n.icon size={18} /></div>
                  {n.label}
                  <ChevronRight size={14} className="chev" />
                </Link>
              ))}
            </nav>
            <div className="cl-dr-foot">
              <button className="cl-dr-logout" onClick={() => { setDrawerOpen(false); handleLogout(); }}>
                <LogOut size={18} />Sign Out
              </button>
            </div>
          </aside>
        </>
      )}

      <main className="cl-main">{children}</main>

      <nav className="cl-bnav">
        {NAV.map(n => (
          <Link key={n.path} to={n.path} className={`cl-blink${active(n.path) ? " on" : ""}`}>
            <div className="bwrap">
              <n.icon size={20} />
              {/* show badge on the cart nav item in bottom bar too */}
              {n.path === "/customer/cart" && cartCount > 0 && (
                <span key={cartCount} className="b-badge">{cartCount}</span>
              )}
            </div>
            {n.label}
          </Link>
        ))}
      </nav>
    </>
  );
};

export default CustomerLayout;