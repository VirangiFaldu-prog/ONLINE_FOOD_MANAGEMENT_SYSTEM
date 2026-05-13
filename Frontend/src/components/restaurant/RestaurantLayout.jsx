// import { useState, useEffect } from "react";
// import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
// import {
//   LayoutDashboard,
//   UtensilsCrossed,
//   ShoppingBag,
//   LogOut,
//   Menu as MenuIcon,
//   X,
//   ChefHat,
//   ArrowLeft,
//   Store,
// } from "lucide-react";
// import { useAuth } from "../../contexts/AuthContext";
// import axiosInstance from "../../api/axiosInstance";

// const RestaurantLayout = ({ children }) => {
//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const [ownerName, setOwnerName] = useState("");
//   const location = useLocation();
//   const navigate = useNavigate();
//   const restaurantName = localStorage.getItem("restaurantName") || "Restaurant";

//   const loadOwnerName = async () => {
//     try {
//       const restaurantId = localStorage.getItem("restaurantId");
//       if (!restaurantId) return;

//       const response = await axiosInstance.get("/Restaurant");
//       const restaurants = response.data;
//       if (Array.isArray(restaurants)) {
//         const restaurant = restaurants.find(
//           (r) => r.restaurantID === parseInt(restaurantId)
//         );
//         if (restaurant && (restaurant.userName || restaurant.UserName)) {
//           const owner = restaurant.userName || restaurant.UserName;
//           setOwnerName(owner);
//           localStorage.setItem("restaurantOwnerName", owner);
//         }
//       }
//     } catch (error) {
//       console.error("Error loading owner name:", error);
//     }
//   };

//   // Load owner name from localStorage or fetch from API
//   useEffect(() => {
//     const storedOwnerName = localStorage.getItem("restaurantOwnerName");
//     if (storedOwnerName) {
//       setOwnerName(storedOwnerName);
//     } else {
//       // Fetch owner name from API if not stored
//       loadOwnerName();
//     }
//   }, []);

//   const handleSwitchRestaurant = () => {
//     // Get userId from localStorage (stored during restaurant selection)
//     const userId = localStorage.getItem("userId");
    
//     // Clear current restaurant selection but keep user session
//     localStorage.removeItem("restaurantId");
//     localStorage.removeItem("restaurantName");
//     localStorage.removeItem("restaurantRestaurantID");
//     localStorage.removeItem("restaurantOwnerName"); // Clear owner name
    
//     // Restore tempUserId in sessionStorage for restaurant selection
//     if (userId) {
//       sessionStorage.setItem("tempUserId", userId);
//     }
    
//     // Navigate to restaurant selection
//     navigate("/restaurant/select", { replace: true });
//   };

//   const { logout } = useAuth();

//   const handleLogout = () => {
//     logout();
//     navigate("/restaurant/login");
//   };

//   const menuItems = [
//     {
//       name: "Dashboard",
//       icon: LayoutDashboard,
//       path: "/restaurant/dashboard",
//     },
//     {
//       name: "Menu Management",
//       icon: UtensilsCrossed,
//       path: "/restaurant/menu",
//     },
//     {
//       name: "Orders",
//       icon: ShoppingBag,
//       path: "/restaurant/orders",
//     },
//   ];

//   return (
//     <div className="min-h-screen bg-gray-50 flex">
//       {/* Sidebar */}
//       <aside
//         className={`${
//           sidebarOpen ? "w-64" : "w-20"
//         } bg-gradient-to-b from-gray-600 to-red-600 text-white transition-all duration-300 fixed h-screen z-30`}
//       >
//         <div className="p-6">
//           {/* Logo */}
//           <div className="flex items-center gap-3 mb-8">
//             <div className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center">
//               <ChefHat size={24} />
//             </div>
//             {sidebarOpen && (
//               <div>
//                 <h2 className="font-black text-xl">{restaurantName}</h2>
//                 <p className="text-orange-100 text-xs">Restaurant Portal</p>
//               </div>
//             )}
//           </div>

//           {/* Menu Items */}
//           <nav className="space-y-2">
//             {menuItems.map((item) => {
//               const Icon = item.icon;
//               const isActive = location.pathname === item.path;
//               return (
//                 <Link
//                   key={item.path}
//                   to={item.path}
//                   className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
//                     isActive
//                       ? "bg-white/20 backdrop-blur-lg shadow-lg"
//                       : "hover:bg-white/10"
//                   }`}
//                 >
//                   <Icon size={22} />
//                   {sidebarOpen && (
//                     <span className="font-semibold">{item.name}</span>
//                   )}
//                 </Link>
//               );
//             })}
//           </nav>

//           {/* Switch Restaurant Button */}
//           <button
//             onClick={handleSwitchRestaurant}
//             className="mt-8 w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/10 transition-all"
//           >
//             <Store size={22} />
//             {sidebarOpen && <span className="font-semibold">Switch Restaurant</span>}
//           </button>

//           {/* Logout Button */}
//           <button
//             onClick={handleLogout}
//             className="mt-2 w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/10 transition-all"
//           >
//             <LogOut size={22} />
//             {sidebarOpen && <span className="font-semibold">Logout</span>}
//           </button>
//         </div>
//       </aside>

//       {/* Main Content */}
//       <div className={`flex-1 ${sidebarOpen ? "ml-64" : "ml-20"} transition-all duration-300`}>
//         {/* Top Bar */}
//         <header className="bg-white shadow-sm sticky top-0 z-20">
//           <div className="px-6 py-4 flex items-center justify-between">
//             <button
//               onClick={() => setSidebarOpen(!sidebarOpen)}
//               className="p-2 rounded-lg hover:bg-gray-100 transition"
//             >
//               {sidebarOpen ? <X size={24} /> : <MenuIcon size={24} />}
//             </button>

//             <div className="flex items-center gap-4">
//               <div className="text-right">
//                 <p className="font-bold text-gray-900">{restaurantName}</p>
//                 <p className="text-sm text-gray-500">
//                   {ownerName ? `Owner: ${ownerName}` : "Restaurant Owner"}
//                 </p>
//               </div>
//               <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
//                 <ChefHat className="text-white" size={24} />
//               </div>
//             </div>
//           </div>
//         </header>

//         {/* Page Content */}
//         <main className="p-6">
//           <Outlet />
//         </main>
//       </div>
//     </div>
//   );
// };

// export default RestaurantLayout;













// import { useState, useEffect } from "react";
// import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
// import {
//   LayoutDashboard,
//   UtensilsCrossed,
//   ShoppingBag,
//   LogOut,
//   Menu as MenuIcon,
//   X,
//   ChefHat,
//   Store,
//   ChevronRight,
//   Bell,
//   Settings,
// } from "lucide-react";
// import { useAuth } from "../../contexts/AuthContext";
// import axiosInstance from "../../api/axiosInstance";

// const RestaurantLayout = () => {
//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const [ownerName, setOwnerName]     = useState("");
//   const location  = useLocation();
//   const navigate  = useNavigate();
//   const { logout } = useAuth();
//   const restaurantName = localStorage.getItem("restaurantName") || "Restaurant";

//   useEffect(() => {
//     const stored = localStorage.getItem("restaurantOwnerName");
//     if (stored) { setOwnerName(stored); }
//     else { loadOwnerName(); }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const loadOwnerName = async () => {
//     try {
//       const restaurantId = localStorage.getItem("restaurantId");
//       if (!restaurantId) return;
//       const res = await axiosInstance.get("/Restaurant");
//       if (Array.isArray(res.data)) {
//         const r = res.data.find(r => r.restaurantID === parseInt(restaurantId));
//         if (r) {
//           const owner = r.userName || r.UserName || "";
//           setOwnerName(owner);
//           localStorage.setItem("restaurantOwnerName", owner);
//         }
//       }
//     } catch (e) { console.error(e); }
//   };

//   const handleSwitchRestaurant = () => {
//     const userId = localStorage.getItem("userId");
//     localStorage.removeItem("restaurantId");
//     localStorage.removeItem("restaurantName");
//     localStorage.removeItem("restaurantRestaurantID");
//     localStorage.removeItem("restaurantOwnerName");
//     if (userId) sessionStorage.setItem("tempUserId", userId);
//     navigate("/restaurant/select", { replace: true });
//   };

//   const handleLogout = () => {
//     logout();
//     navigate("/restaurant/login");
//   };

//   const menuItems = [
//     { name: "Dashboard",       icon: LayoutDashboard, path: "/restaurant/dashboard" },
//     { name: "Menu Management", icon: UtensilsCrossed, path: "/restaurant/menu"      },
//     { name: "Orders",          icon: ShoppingBag,     path: "/restaurant/orders"    },
//   ];

//   const initials = restaurantName.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase();

//   /* active page label */
//   const activePage = menuItems.find(m => m.path === location.pathname)?.name || "Dashboard";

//   return (
//     <>
//       <style>{css}</style>
//       <div className="rl-root">

//         {/* ══════════ SIDEBAR ══════════ */}
//         <aside className={`rl-sidebar ${sidebarOpen ? "rl-open" : "rl-collapsed"}`}>

//           {/* Brand */}
//           <div className="rl-brand">
//             <div className="rl-brand-logo">
//               <ChefHat size={sidebarOpen ? 26 : 22} />
//             </div>
//             {sidebarOpen && (
//               <div className="rl-brand-text">
//                 <span className="rl-brand-name">{restaurantName}</span>
//                 <span className="rl-brand-tag">Restaurant Portal</span>
//               </div>
//             )}
//           </div>

//           {/* Toggle btn */}
//           <button className="rl-toggle" onClick={() => setSidebarOpen(o => !o)}>
//             {sidebarOpen ? <X size={18}/> : <MenuIcon size={18}/>}
//           </button>

//           {/* Nav */}
//           <nav className="rl-nav">
//             {sidebarOpen && <p className="rl-nav-label">MAIN MENU</p>}
//             {menuItems.map(item => {
//               const Icon     = item.icon;
//               const isActive = location.pathname === item.path;
//               return (
//                 <Link
//                   key={item.path}
//                   to={item.path}
//                   className={`rl-nav-item ${isActive ? "rl-nav-active" : ""}`}
//                   title={!sidebarOpen ? item.name : ""}
//                 >
//                   <span className={`rl-nav-icon ${isActive ? "rl-nav-icon-active" : ""}`}>
//                     <Icon size={21}/>
//                   </span>
//                   {sidebarOpen && <span className="rl-nav-text">{item.name}</span>}
//                   {sidebarOpen && isActive && <ChevronRight size={16} className="rl-nav-arrow"/>}
//                 </Link>
//               );
//             })}
//           </nav>

//           {/* Divider */}
//           <div className="rl-divider"/>

//           {/* Switch restaurant */}
//           {sidebarOpen && <p className="rl-nav-label">SETTINGS</p>}
//           <button
//             className="rl-nav-item rl-btn-item"
//             onClick={handleSwitchRestaurant}
//             title={!sidebarOpen ? "Switch Restaurant" : ""}
//           >
//             <span className="rl-nav-icon"><Store size={21}/></span>
//             {sidebarOpen && <span className="rl-nav-text">Switch Restaurant</span>}
//           </button>

//           {/* Logout */}
//           <button
//             className="rl-nav-item rl-btn-item rl-logout-item"
//             onClick={handleLogout}
//             title={!sidebarOpen ? "Logout" : ""}
//           >
//             <span className="rl-nav-icon rl-logout-icon"><LogOut size={21}/></span>
//             {sidebarOpen && <span className="rl-nav-text rl-logout-text">Logout</span>}
//           </button>

//           {/* Owner card */}
//           {sidebarOpen && (
//             <div className="rl-owner-card">
//               <div className="rl-owner-avatar">{initials}</div>
//               <div className="rl-owner-info">
//                 <span className="rl-owner-name">{ownerName || "Owner"}</span>
//                 <span className="rl-owner-role">Restaurant Owner</span>
//               </div>
//             </div>
//           )}
//           {!sidebarOpen && (
//             <div className="rl-owner-mini">
//               <div className="rl-owner-avatar rl-owner-avatar-sm">{initials}</div>
//             </div>
//           )}
//         </aside>

//         {/* ══════════ MAIN ══════════ */}
//         <div className={`rl-main ${sidebarOpen ? "rl-main-open" : "rl-main-collapsed"}`}>

//           {/* Top bar */}
//           <header className="rl-topbar">
//             <div className="rl-topbar-left">
//               {/* Breadcrumb */}
//               <div className="rl-breadcrumb">
//                 <span className="rl-breadcrumb-root">🍀 FoodPanel</span>
//                 <ChevronRight size={15} className="rl-breadcrumb-sep"/>
//                 <span className="rl-breadcrumb-page">{activePage}</span>
//               </div>
//             </div>

//             <div className="rl-topbar-right">
//               <button className="rl-topbar-icon-btn" title="Notifications">
//                 <Bell size={20}/>
//                 <span className="rl-notif-dot"/>
//               </button>
//               <button className="rl-topbar-icon-btn" title="Settings">
//                 <Settings size={20}/>
//               </button>
//               <div className="rl-topbar-profile">
//                 <div className="rl-topbar-info">
//                   <span className="rl-topbar-rname">{restaurantName}</span>
//                   <span className="rl-topbar-owner">{ownerName ? `Owner: ${ownerName}` : "Restaurant Owner"}</span>
//                 </div>
//                 <div className="rl-topbar-avatar">{initials}</div>
//               </div>
//             </div>
//           </header>

//           {/* Page content */}
//           <main className="rl-content">
//             <Outlet />
//           </main>
//         </div>
//       </div>
//     </>
//   );
// };

// /* ═══════════════════════════════ CSS ═══════════════════════════════ */
// const css = `
// @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
// *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

// :root {
//   --teal:        #0d9488;
//   --teal-h:      #0f766e;
//   --teal-deep:   #134e4a;
//   --teal-mid:    #0f7a6e;
//   --teal-pale:   #f0fdfa;
//   --teal-border: #99f6e4;
//   --text-w:      #f0fdfa;
//   --text-w2:     #99f6e4;
//   --text-w3:     #5eead4;
//   --border:      #d1f5ef;
//   --bg:          #f2faf8;
//   --white:       #fff;
//   --sidebar-w:   272px;
//   --sidebar-c:   72px;
//   --topbar-h:    70px;
// }

// html,body { height:100%; font-family:'Nunito',sans-serif; }

// /* ── Root layout ── */
// .rl-root { display:flex; min-height:100vh; background:var(--bg); font-family:'Nunito',sans-serif; }

// /* ══════════ SIDEBAR ══════════ */
// .rl-sidebar {
//   position:fixed; top:0; left:0; height:100vh; z-index:100;
//   background: linear-gradient(180deg, #0d4f4a 0%, #0d9488 45%, #0891b2 100%);
//   display:flex; flex-direction:column;
//   transition:width .3s cubic-bezier(.22,1,.36,1);
//   overflow:hidden;
//   box-shadow: 4px 0 32px rgba(13,148,136,0.25);
// }
// .rl-open      { width:var(--sidebar-w); }
// .rl-collapsed { width:var(--sidebar-c); }

// /* Subtle pattern overlay */
// .rl-sidebar::before {
//   content:'';
//   position:absolute; inset:0; pointer-events:none;
//   background-image: radial-gradient(circle at 80% 20%, rgba(255,255,255,0.06) 0%, transparent 50%),
//                     radial-gradient(circle at 20% 80%, rgba(255,255,255,0.04) 0%, transparent 50%);
// }

// /* Brand */
// .rl-brand {
//   display:flex; align-items:center; gap:14px;
//   padding:26px 18px 22px;
//   border-bottom:1px solid rgba(255,255,255,0.12);
//   min-height:82px;
//   position:relative; z-index:1;
// }
// .rl-brand-logo {
//   width:46px; height:46px; flex-shrink:0; border-radius:14px;
//   background:rgba(255,255,255,0.18); backdrop-filter:blur(8px);
//   border:1.5px solid rgba(255,255,255,0.25);
//   display:flex; align-items:center; justify-content:center;
//   color:#fff; transition:all .3s;
// }
// .rl-brand-text { min-width:0; overflow:hidden; }
// .rl-brand-name { display:block; font-size:17px; font-weight:900; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; letter-spacing:-0.3px; }
// .rl-brand-tag  { display:block; font-size:11px; font-weight:700; color:var(--text-w3); letter-spacing:.08em; text-transform:uppercase; margin-top:1px; }

// /* Toggle button */
// .rl-toggle {
//   position:absolute; top:26px; right:14px;
//   width:30px; height:30px; border-radius:9px;
//   background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.2);
//   color:#fff; display:flex; align-items:center; justify-content:center;
//   cursor:pointer; transition:background .2s; z-index:2; flex-shrink:0;
// }
// .rl-toggle:hover { background:rgba(255,255,255,0.22); }

// /* Nav label */
// .rl-nav-label {
//   font-size:10px; font-weight:800; color:rgba(255,255,255,0.4);
//   letter-spacing:.12em; padding:14px 22px 6px;
//   white-space:nowrap; overflow:hidden;
// }

// /* Nav */
// .rl-nav { display:flex; flex-direction:column; gap:3px; padding:10px 10px 0; position:relative; z-index:1; }

// .rl-nav-item {
//   display:flex; align-items:center; gap:14px;
//   padding:13px 12px; border-radius:14px;
//   text-decoration:none; cursor:pointer; border:none; background:none; width:100%;
//   font-family:'Nunito',sans-serif; color:rgba(255,255,255,0.75);
//   transition:all .22s; position:relative; white-space:nowrap;
// }
// .rl-nav-item:hover { background:rgba(255,255,255,0.12); color:#fff; }

// .rl-nav-active {
//   background:rgba(255,255,255,0.18) !important;
//   color:#fff !important;
//   box-shadow:0 4px 16px rgba(0,0,0,0.15);
// }
// .rl-nav-active::before {
//   content:''; position:absolute; left:-10px; top:50%; transform:translateY(-50%);
//   width:4px; height:60%; border-radius:0 4px 4px 0;
//   background:#fff;
// }

// .rl-nav-icon {
//   width:40px; height:40px; flex-shrink:0; border-radius:11px;
//   display:flex; align-items:center; justify-content:center;
//   background:rgba(255,255,255,0.08); transition:background .2s;
// }
// .rl-nav-icon-active { background:rgba(255,255,255,0.22); }
// .rl-nav-text  { font-size:15px; font-weight:700; flex:1; }
// .rl-nav-arrow { opacity:.6; flex-shrink:0; }

// /* Btn-style nav items */
// .rl-btn-item { margin:0 10px; width:calc(100% - 20px); }

// /* Logout styling */
// .rl-logout-item:hover { background:rgba(248,113,113,0.18) !important; }
// .rl-logout-icon { color:#fca5a5 !important; }
// .rl-logout-text { color:#fca5a5 !important; }

// /* Divider */
// .rl-divider {
//   height:1px; background:rgba(255,255,255,0.1);
//   margin:14px 10px 10px; position:relative; z-index:1;
// }

// /* Owner card */
// .rl-owner-card {
//   margin:auto 10px 16px;
//   background:rgba(255,255,255,0.1); backdrop-filter:blur(8px);
//   border:1px solid rgba(255,255,255,0.18); border-radius:16px;
//   padding:14px 16px; display:flex; align-items:center; gap:12px;
//   position:relative; z-index:1;
// }
// .rl-owner-avatar {
//   width:40px; height:40px; border-radius:12px; flex-shrink:0;
//   background:rgba(255,255,255,0.25); border:1.5px solid rgba(255,255,255,0.35);
//   color:#fff; font-size:14px; font-weight:900;
//   display:flex; align-items:center; justify-content:center;
// }
// .rl-owner-avatar-sm { width:36px; height:36px; border-radius:10px; font-size:12px; }
// .rl-owner-info { min-width:0; }
// .rl-owner-name { display:block; font-size:14px; font-weight:800; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
// .rl-owner-role { display:block; font-size:11px; font-weight:600; color:var(--text-w3); margin-top:1px; }
// .rl-owner-mini { padding:8px 10px 16px; display:flex; justify-content:center; position:relative; z-index:1; }

// /* ══════════ MAIN ══════════ */
// .rl-main {
//   flex:1; min-height:100vh; display:flex; flex-direction:column;
//   transition:margin-left .3s cubic-bezier(.22,1,.36,1);
// }
// .rl-main-open      { margin-left:var(--sidebar-w); }
// .rl-main-collapsed { margin-left:var(--sidebar-c); }

// /* ── Top bar ── */
// .rl-topbar {
//   height:var(--topbar-h); background:var(--white);
//   border-bottom:2px solid var(--border);
//   padding:0 36px;
//   display:flex; align-items:center; justify-content:space-between; gap:16px;
//   position:sticky; top:0; z-index:50;
//   box-shadow:0 2px 16px rgba(13,148,136,0.07);
// }
// .rl-topbar-left  { display:flex; align-items:center; gap:16px; }
// .rl-topbar-right { display:flex; align-items:center; gap:12px; }

// /* Breadcrumb */
// .rl-breadcrumb { display:flex; align-items:center; gap:6px; }
// .rl-breadcrumb-root { font-size:15px; font-weight:700; color:#7fb8b2; }
// .rl-breadcrumb-sep  { color:#b2ddd8; }
// .rl-breadcrumb-page { font-size:16px; font-weight:900; color:#134e4a; }

// /* Icon buttons */
// .rl-topbar-icon-btn {
//   width:42px; height:42px; border-radius:12px;
//   background:#f2faf8; border:2px solid var(--border);
//   color:#3d7a72; display:flex; align-items:center; justify-content:center;
//   cursor:pointer; transition:all .2s; position:relative;
// }
// .rl-topbar-icon-btn:hover { background:var(--teal-pale); border-color:var(--teal); color:var(--teal); }
// .rl-notif-dot {
//   position:absolute; top:8px; right:8px; width:8px; height:8px;
//   background:#ef4444; border-radius:50%; border:2px solid #fff;
// }

// /* Profile chip */
// .rl-topbar-profile {
//   display:flex; align-items:center; gap:12px;
//   padding:8px 14px 8px 10px;
//   background:#f2faf8; border:2px solid var(--border); border-radius:16px;
//   cursor:default; transition:border-color .2s;
// }
// .rl-topbar-profile:hover { border-color:var(--teal); }
// .rl-topbar-info { text-align:right; }
// .rl-topbar-rname { display:block; font-size:15px; font-weight:900; color:#134e4a; }
// .rl-topbar-owner { display:block; font-size:12px; font-weight:600; color:#7fb8b2; }
// .rl-topbar-avatar {
//   width:42px; height:42px; border-radius:12px; flex-shrink:0;
//   background:linear-gradient(135deg,#0d9488,#059669);
//   color:#fff; font-size:15px; font-weight:900;
//   display:flex; align-items:center; justify-content:center;
//   box-shadow:0 4px 12px rgba(13,148,136,0.3);
// }

// /* ── Page content ── */
// .rl-content { flex:1; padding:36px 36px; background:var(--bg); }

// /* ── Responsive ── */
// @media(max-width:768px){
//   .rl-sidebar { width:var(--sidebar-c) !important; }
//   .rl-main { margin-left:var(--sidebar-c) !important; }
//   .rl-brand-text,.rl-nav-text,.rl-nav-arrow,.rl-nav-label,
//   .rl-owner-card,.rl-brand-name,.rl-brand-tag { display:none !important; }
//   .rl-owner-mini { display:flex !important; }
//   .rl-topbar { padding:0 18px; }
//   .rl-content { padding:20px 16px; }
//   .rl-topbar-info { display:none; }
// }
// `;

// export default RestaurantLayout;


import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingBag,
  LogOut,
  Menu as MenuIcon,
  X,
  ChefHat,
  Store,
  ChevronRight,
  Bell,
  Settings,
  Flame,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import axiosInstance from "../../api/axiosInstance";

const RestaurantLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [ownerName, setOwnerName] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const restaurantName = localStorage.getItem("restaurantName") || "Restaurant";

  useEffect(() => {
    const stored = localStorage.getItem("restaurantOwnerName");
    if (stored) { setOwnerName(stored); }
    else { loadOwnerName(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadOwnerName = async () => {
    try {
      const restaurantId = localStorage.getItem("restaurantId");
      if (!restaurantId) return;
      const res = await axiosInstance.get("/Restaurant");
      if (Array.isArray(res.data)) {
        const r = res.data.find(r => r.restaurantID === parseInt(restaurantId));
        if (r) {
          const owner = r.userName || r.UserName || "";
          setOwnerName(owner);
          localStorage.setItem("restaurantOwnerName", owner);
        }
      }
    } catch (e) { console.error(e); }
  };

  const handleSwitchRestaurant = () => {
    const userId = localStorage.getItem("userId");
    localStorage.removeItem("restaurantId");
    localStorage.removeItem("restaurantName");
    localStorage.removeItem("restaurantRestaurantID");
    localStorage.removeItem("restaurantOwnerName");
    if (userId) sessionStorage.setItem("tempUserId", userId);
    navigate("/restaurant/select", { replace: true });
  };

  const handleLogout = () => {
    logout();
    navigate("/restaurant/login");
  };

  const menuItems = [
    { name: "Dashboard",       icon: LayoutDashboard, path: "/restaurant/dashboard" },
    { name: "Menu Management", icon: UtensilsCrossed, path: "/restaurant/menu"      },
    { name: "Orders",          icon: ShoppingBag,     path: "/restaurant/orders"    },
  ];

  const initials = restaurantName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const activePage = menuItems.find(m => m.path === location.pathname)?.name || "Dashboard";

  return (
    <>
      <style>{css}</style>
      <div className="rl-root">

        {/* ══════════ SIDEBAR ══════════ */}
        <aside className={`rl-sidebar ${sidebarOpen ? "rl-open" : "rl-collapsed"}`}>

          {/* Decorative orbs */}
          <div className="rl-orb rl-orb1" />
          <div className="rl-orb rl-orb2" />

          {/* Brand */}
          <div className="rl-brand">
            <div className="rl-brand-logo">
              <Flame size={sidebarOpen ? 24 : 20} />
            </div>
            {sidebarOpen && (
              <div className="rl-brand-text">
                <span className="rl-brand-name">{restaurantName}</span>
                <span className="rl-brand-tag">Restaurant Portal</span>
              </div>
            )}
          </div>

          {/* Toggle btn */}
          <button className="rl-toggle" onClick={() => setSidebarOpen(o => !o)}>
            {sidebarOpen ? <X size={16} /> : <MenuIcon size={16} />}
          </button>

          {/* Nav */}
          <nav className="rl-nav">
            {sidebarOpen && <p className="rl-nav-label">MAIN MENU</p>}
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`rl-nav-item ${isActive ? "rl-nav-active" : ""}`}
                  title={!sidebarOpen ? item.name : ""}
                >
                  <span className={`rl-nav-icon ${isActive ? "rl-nav-icon-active" : ""}`}>
                    <Icon size={19} />
                  </span>
                  {sidebarOpen && <span className="rl-nav-text">{item.name}</span>}
                  {sidebarOpen && isActive && <ChevronRight size={15} className="rl-nav-arrow" />}
                </Link>
              );
            })}
          </nav>

          {/* Divider */}
          <div className="rl-divider" />

          {/* Switch restaurant */}
          {sidebarOpen && <p className="rl-nav-label">SETTINGS</p>}
          <div className="rl-nav-extra">
            <button
              className="rl-nav-item rl-btn-item"
              onClick={handleSwitchRestaurant}
              title={!sidebarOpen ? "Switch Restaurant" : ""}
            >
              <span className="rl-nav-icon"><Store size={19} /></span>
              {sidebarOpen && <span className="rl-nav-text">Switch Restaurant</span>}
            </button>

            {/* Logout */}
            <button
              className="rl-nav-item rl-btn-item rl-logout-item"
              onClick={handleLogout}
              title={!sidebarOpen ? "Logout" : ""}
            >
              <span className="rl-nav-icon rl-logout-icon"><LogOut size={19} /></span>
              {sidebarOpen && <span className="rl-nav-text rl-logout-text">Logout</span>}
            </button>
          </div>

          {/* Owner card */}
          {sidebarOpen && (
            <div className="rl-owner-card">
              <div className="rl-owner-avatar">{initials}</div>
              <div className="rl-owner-info">
                <span className="rl-owner-name">{ownerName || "Owner"}</span>
                <span className="rl-owner-role">Restaurant Owner</span>
              </div>
              <div className="rl-owner-status" />
            </div>
          )}
          {!sidebarOpen && (
            <div className="rl-owner-mini">
              <div className="rl-owner-avatar rl-owner-avatar-sm">{initials}</div>
            </div>
          )}
        </aside>

        {/* ══════════ MAIN ══════════ */}
        <div className={`rl-main ${sidebarOpen ? "rl-main-open" : "rl-main-collapsed"}`}>

          {/* Top bar */}
          <header className="rl-topbar">
            <div className="rl-topbar-left">
              <div className="rl-breadcrumb">
                <span className="rl-breadcrumb-root">
                  <Flame size={16} style={{ display: "inline", verticalAlign: "middle", marginRight: 5 }} />
                  FoodPanel
                </span>
                <ChevronRight size={14} className="rl-breadcrumb-sep" />
                <span className="rl-breadcrumb-page">{activePage}</span>
              </div>
            </div>

            <div className="rl-topbar-right">
              <button className="rl-topbar-icon-btn" title="Notifications">
                <Bell size={19} />
                <span className="rl-notif-dot" />
              </button>
              <button className="rl-topbar-icon-btn" title="Settings">
                <Settings size={19} />
              </button>
              <div className="rl-topbar-profile">
                <div className="rl-topbar-info">
                  <span className="rl-topbar-rname">{restaurantName}</span>
                  <span className="rl-topbar-owner">{ownerName ? `Owner: ${ownerName}` : "Restaurant Owner"}</span>
                </div>
                <div className="rl-topbar-avatar">{initials}</div>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="rl-content">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
};

/* ═══════════════════════════════ CSS ═══════════════════════════════ */
// const css = `
// @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');

// *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

// :root {
//   /* Orange palette */
//   --brand:         #f97316;
//   --brand-h:       #ea6c0a;
//   --brand-deep:    #7c2d00;
//   --brand-dark:    #431407;
//   --brand-mid:     #c2440c;
//   --brand-amber:   #fbbf24;
//   --brand-gold:    #fcd34d;
//   --brand-pale:    #fff7ed;
//   --brand-border:  #fed7aa;

//   /* Text on dark */
//   --text-w:        #fff7ed;
//   --text-w2:       #fdba74;
//   --text-w3:       #fb923c;

//   /* Layout */
//   --sidebar-w:     270px;
//   --sidebar-c:     72px;
//   --topbar-h:      68px;

//   /* Light bg */
//   --bg:            #fdf8f4;
//   --white:         #ffffff;
//   --border:        #ffe0c4;
//   --text-dark:     #431407;
//   --text-mid:      #7c3b1a;
//   --text-muted:    #b87040;
// }

// html, body { height: 100%; font-family: 'DM Sans', sans-serif; }

// /* ── Root ── */
// .rl-root {
//   display: flex;
//   min-height: 100vh;
//   background: var(--bg);
// }

// /* ══════════════════════════════════
//    SIDEBAR
// ══════════════════════════════════ */
// .rl-sidebar {
//   position: fixed; top: 0; left: 0; height: 100vh; z-index: 100;
//   background: linear-gradient(160deg, #1c0a00 0%, #7c2d12 40%, #c2440c 75%, #f97316 100%);
//   display: flex; flex-direction: column;
//   transition: width .32s cubic-bezier(.22,1,.36,1);
//   overflow: hidden;
//   box-shadow: 6px 0 40px rgba(249,115,22,0.22);
// }
// .rl-open      { width: var(--sidebar-w); }
// .rl-collapsed { width: var(--sidebar-c); }

// /* Decorative orbs */
// .rl-orb {
//   position: absolute; border-radius: 50%; pointer-events: none;
//   filter: blur(40px); opacity: 0.25;
// }
// .rl-orb1 {
//   width: 180px; height: 180px;
//   background: radial-gradient(circle, #fbbf24, #f97316);
//   top: -50px; right: -60px;
// }
// .rl-orb2 {
//   width: 140px; height: 140px;
//   background: radial-gradient(circle, #fb923c, #9a3412);
//   bottom: 80px; left: -40px;
// }

// /* ── Brand ── */
// .rl-brand {
//   display: flex; align-items: center; gap: 13px;
//   padding: 24px 18px 20px;
//   border-bottom: 1px solid rgba(255,255,255,0.1);
//   min-height: 80px;
//   position: relative; z-index: 1;
// }
// .rl-brand-logo {
//   width: 44px; height: 44px; flex-shrink: 0; border-radius: 13px;
//   background: linear-gradient(135deg, #fbbf24, #f97316);
//   box-shadow: 0 4px 16px rgba(251,191,36,0.45);
//   display: flex; align-items: center; justify-content: center;
//   color: #431407; transition: all .3s;
// }
// .rl-brand-text { min-width: 0; overflow: hidden; }
// .rl-brand-name {
//   display: block; font-family: 'Sora', sans-serif;
//   font-size: 16px; font-weight: 800; color: #fff;
//   white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
//   letter-spacing: -0.4px;
// }
// .rl-brand-tag {
//   display: block; font-size: 10.5px; font-weight: 600;
//   color: var(--text-w2); letter-spacing: .1em; text-transform: uppercase; margin-top: 2px;
// }

// /* ── Toggle button ── */
// .rl-toggle {
//   position: absolute; top: 24px; right: 12px;
//   width: 28px; height: 28px; border-radius: 8px;
//   background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.18);
//   color: #fff; display: flex; align-items: center; justify-content: center;
//   cursor: pointer; transition: background .2s; z-index: 2;
// }
// .rl-toggle:hover { background: rgba(255,255,255,0.22); }

// /* ── Nav labels ── */
// .rl-nav-label {
//   font-size: 9.5px; font-weight: 700; color: rgba(255,255,255,0.38);
//   letter-spacing: .15em; padding: 14px 20px 5px;
//   white-space: nowrap; overflow: hidden; position: relative; z-index: 1;
// }

// /* ── Nav container ── */
// .rl-nav {
//   display: flex; flex-direction: column; gap: 2px;
//   padding: 8px 10px 0;
//   position: relative; z-index: 1;
// }

// /* ── Nav item ── */
// .rl-nav-item {
//   display: flex; align-items: center; gap: 12px;
//   padding: 11px 10px; border-radius: 13px;
//   text-decoration: none; cursor: pointer; border: none; background: none; width: 100%;
//   font-family: 'DM Sans', sans-serif; color: rgba(255,255,255,0.68);
//   transition: all .22s; position: relative; white-space: nowrap; overflow: hidden;
// }
// .rl-nav-item:hover {
//   background: rgba(255,255,255,0.1);
//   color: #fff;
// }

// /* Active state */
// .rl-nav-active {
//   background: rgba(251,191,36,0.18) !important;
//   color: #fcd34d !important;
//   box-shadow: 0 2px 16px rgba(251,191,36,0.12), inset 0 0 0 1px rgba(251,191,36,0.2);
// }
// .rl-nav-active::before {
//   content: '';
//   position: absolute; left: 0; top: 50%; transform: translateY(-50%);
//   width: 3px; height: 55%; border-radius: 0 3px 3px 0;
//   background: linear-gradient(180deg, #fcd34d, #f97316);
// }

// /* Nav icon */
// .rl-nav-icon {
//   width: 38px; height: 38px; flex-shrink: 0; border-radius: 10px;
//   display: flex; align-items: center; justify-content: center;
//   background: rgba(255,255,255,0.07);
//   transition: background .2s, color .2s;
// }
// .rl-nav-icon-active {
//   background: rgba(251,191,36,0.22);
//   color: #fcd34d;
// }
// .rl-nav-text  { font-size: 14.5px; font-weight: 600; flex: 1; }
// .rl-nav-arrow { opacity: .55; flex-shrink: 0; color: #fbbf24; }

// /* Extra nav section (settings/logout) */
// .rl-nav-extra {
//   display: flex; flex-direction: column; gap: 2px;
//   padding: 0 10px;
//   position: relative; z-index: 1;
// }
// .rl-btn-item { width: 100%; }

// /* Logout */
// .rl-logout-item:hover { background: rgba(239,68,68,0.15) !important; }
// .rl-logout-icon { color: #fca5a5 !important; }
// .rl-logout-text { color: #fca5a5 !important; }

// /* Divider */
// .rl-divider {
//   height: 1px;
//   background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
//   margin: 12px 10px 10px;
//   position: relative; z-index: 1;
// }

// /* ── Owner card ── */
// .rl-owner-card {
//   margin: auto 10px 16px;
//   background: rgba(255,255,255,0.08);
//   border: 1px solid rgba(251,191,36,0.2);
//   border-radius: 15px;
//   padding: 13px 14px;
//   display: flex; align-items: center; gap: 11px;
//   position: relative; z-index: 1;
//   backdrop-filter: blur(6px);
// }
// .rl-owner-avatar {
//   width: 38px; height: 38px; border-radius: 10px; flex-shrink: 0;
//   background: linear-gradient(135deg, #fbbf24, #f97316);
//   box-shadow: 0 3px 10px rgba(249,115,22,0.4);
//   color: #431407; font-size: 13px; font-weight: 800; font-family: 'Sora', sans-serif;
//   display: flex; align-items: center; justify-content: center;
// }
// .rl-owner-avatar-sm { width: 34px; height: 34px; border-radius: 9px; font-size: 11px; }
// .rl-owner-info { min-width: 0; flex: 1; }
// .rl-owner-name {
//   display: block; font-size: 13.5px; font-weight: 700; color: #fff;
//   white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
// }
// .rl-owner-role { display: block; font-size: 11px; font-weight: 500; color: var(--text-w2); margin-top: 1px; }
// .rl-owner-status {
//   width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
//   background: #4ade80;
//   box-shadow: 0 0 0 2px rgba(74,222,128,0.3);
//   animation: pulse-green 2s ease-in-out infinite;
// }
// @keyframes pulse-green {
//   0%, 100% { box-shadow: 0 0 0 2px rgba(74,222,128,0.3); }
//   50%       { box-shadow: 0 0 0 5px rgba(74,222,128,0.1); }
// }

// .rl-owner-mini { padding: 6px 10px 16px; display: flex; justify-content: center; position: relative; z-index: 1; }

// /* ══════════════════════════════════
//    MAIN
// ══════════════════════════════════ */
// .rl-main {
//   flex: 1; min-height: 100vh; display: flex; flex-direction: column;
//   transition: margin-left .32s cubic-bezier(.22,1,.36,1);
// }
// .rl-main-open      { margin-left: var(--sidebar-w); }
// .rl-main-collapsed { margin-left: var(--sidebar-c); }

// /* ── Top bar ── */
// .rl-topbar {
//   height: var(--topbar-h);
//   background: var(--white);
//   border-bottom: 2px solid var(--border);
//   padding: 0 32px;
//   display: flex; align-items: center; justify-content: space-between; gap: 16px;
//   position: sticky; top: 0; z-index: 50;
//   box-shadow: 0 2px 20px rgba(249,115,22,0.07);
// }
// .rl-topbar-left  { display: flex; align-items: center; gap: 16px; }
// .rl-topbar-right { display: flex; align-items: center; gap: 10px; }

// /* Breadcrumb */
// .rl-breadcrumb { display: flex; align-items: center; gap: 7px; }
// .rl-breadcrumb-root {
//   font-size: 14px; font-weight: 700; color: var(--text-muted);
//   display: flex; align-items: center; gap: 4px;
// }
// .rl-breadcrumb-sep  { color: var(--brand-border); }
// .rl-breadcrumb-page {
//   font-family: 'Sora', sans-serif;
//   font-size: 15.5px; font-weight: 800; color: var(--text-dark);
// }

// /* Icon buttons */
// .rl-topbar-icon-btn {
//   width: 40px; height: 40px; border-radius: 11px;
//   background: var(--brand-pale); border: 1.5px solid var(--brand-border);
//   color: var(--text-mid); display: flex; align-items: center; justify-content: center;
//   cursor: pointer; transition: all .2s; position: relative;
// }
// .rl-topbar-icon-btn:hover {
//   background: #ffedd5; border-color: var(--brand);
//   color: var(--brand);
//   transform: translateY(-1px);
//   box-shadow: 0 4px 12px rgba(249,115,22,0.15);
// }
// .rl-notif-dot {
//   position: absolute; top: 7px; right: 7px;
//   width: 8px; height: 8px;
//   background: #ef4444; border-radius: 50%; border: 2px solid #fff;
// }

// /* Profile chip */
// .rl-topbar-profile {
//   display: flex; align-items: center; gap: 11px;
//   padding: 7px 13px 7px 9px;
//   background: var(--brand-pale); border: 1.5px solid var(--brand-border);
//   border-radius: 14px; cursor: default; transition: all .2s;
// }
// .rl-topbar-profile:hover {
//   border-color: var(--brand);
//   box-shadow: 0 4px 14px rgba(249,115,22,0.1);
// }
// .rl-topbar-info { text-align: right; }
// .rl-topbar-rname {
//   display: block; font-family: 'Sora', sans-serif;
//   font-size: 14px; font-weight: 800; color: var(--text-dark);
// }
// .rl-topbar-owner { display: block; font-size: 11.5px; font-weight: 500; color: var(--text-muted); }
// .rl-topbar-avatar {
//   width: 40px; height: 40px; border-radius: 11px; flex-shrink: 0;
//   background: linear-gradient(135deg, #fbbf24 0%, #d28955 50%, #ca835c 100%);
//   color: #431407; font-family: 'Sora', sans-serif; font-size: 14px; font-weight: 800;
//   display: flex; align-items: center; justify-content: center;
//   box-shadow: 0 4px 12px rgba(249,115,22,0.35);
// }

// /* ── Page content ── */
// .rl-content {
//   flex: 1;
//   padding: 32px 36px;
//   background: var(--bg);
//   /* Subtle warm dot grid */
//   background-image: radial-gradient(circle, rgba(249,115,22,0.06) 1px, transparent 1px);
//   background-size: 28px 28px;
// }

// /* ══════════════════════════════════
//    RESPONSIVE
// ══════════════════════════════════ */
// @media (max-width: 768px) {
//   .rl-sidebar      { width: var(--sidebar-c) !important; }
//   .rl-main         { margin-left: var(--sidebar-c) !important; }
//   .rl-brand-text, .rl-nav-text, .rl-nav-arrow, .rl-nav-label,
//   .rl-owner-card, .rl-brand-name, .rl-brand-tag, .rl-nav-extra .rl-nav-text,
//   .rl-toggle       { display: none !important; }
//   .rl-owner-mini   { display: flex !important; }
//   .rl-topbar       { padding: 0 16px; }
//   .rl-content      { padding: 18px 14px; background-size: 20px 20px; }
//   .rl-topbar-info  { display: none; }
//   .rl-topbar-profile { padding: 6px; }
// }

// @media (max-width: 480px) {
//   .rl-topbar-icon-btn { width: 36px; height: 36px; border-radius: 9px; }
//   .rl-topbar-avatar   { width: 36px; height: 36px; border-radius: 9px; font-size: 12px; }
//   .rl-breadcrumb-page { font-size: 14px; }
// }
// `;



const css = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --brand:         #f97316;
  --brand-h:       #ea6c0a;
  --brand-deep:    #7c2d00;
  --brand-dark:    #431407;
  --brand-mid:     #c2440c;
  --brand-amber:   #fbbf24;
  --brand-gold:    #fcd34d;
  --brand-pale:    #fff7ed;
  --brand-border:  #ffe0c4;

  --text-w:        #fff7ed;
  --text-w2:       #ffd4a8;
  --text-w3:       #ffba80;

  --sidebar-w:     270px;
  --sidebar-c:     72px;
  --topbar-h:      68px;

  --bg:            #fafafa;
  --white:         #ffffff;
  --border:        #f0e8e0;
  --text-dark:     #1a1a1a;
  --text-mid:      #4a3728;
  --text-muted:    #9a7860;
}

html, body { height: 100%; font-family: 'DM Sans', sans-serif; }

.rl-root {
  display: flex;
  min-height: 100vh;
  background: var(--bg);
}

/* ══════════════════════════════════
   SIDEBAR  — dark slate with warm tint
══════════════════════════════════ */
.rl-sidebar {
  position: fixed; top: 0; left: 0; height: 100vh; z-index: 100;
  background: linear-gradient(175deg, #1e1b18 0%, #28211c 50%, #2e2118 100%);
  display: flex; flex-direction: column;
  transition: width .32s cubic-bezier(.22,1,.36,1);
  overflow: hidden;
  box-shadow: 4px 0 32px rgba(0,0,0,0.18);
  border-right: 1px solid rgba(249,115,22,0.08);
}
.rl-open      { width: var(--sidebar-w); }
.rl-collapsed { width: var(--sidebar-c); }

/* Very subtle warm glow — not orange blobs */
.rl-orb {
  position: absolute; border-radius: 50%; pointer-events: none;
  filter: blur(60px); opacity: 0.10;
}
.rl-orb1 {
  width: 200px; height: 200px;
  background: #f97316;
  top: -60px; right: -80px;
}
.rl-orb2 {
  width: 160px; height: 160px;
  background: #fbbf24;
  bottom: 60px; left: -60px;
}

/* ── Brand ── */
.rl-brand {
  display: flex; align-items: center; gap: 13px;
  padding: 24px 18px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  min-height: 80px;
  position: relative; z-index: 1;
}
.rl-brand-logo {
  width: 44px; height: 44px; flex-shrink: 0; border-radius: 13px;
  background: rgba(249,115,22,0.15);
  border: 1.5px solid rgba(249,115,22,0.3);
  display: flex; align-items: center; justify-content: center;
  color: #f97316; transition: all .3s;
}
.rl-brand-text { min-width: 0; overflow: hidden; }
.rl-brand-name {
  display: block; font-family: 'Sora', sans-serif;
  font-size: 16px; font-weight: 800; color: #f5f0eb;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  letter-spacing: -0.4px;
}
.rl-brand-tag {
  display: block; font-size: 10.5px; font-weight: 600;
  color: rgba(255,255,255,0.35); letter-spacing: .1em; text-transform: uppercase; margin-top: 2px;
}

/* ── Toggle ── */
.rl-toggle {
  position: absolute; top: 24px; right: 12px;
  width: 28px; height: 28px; border-radius: 8px;
  background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.6); display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: background .2s; z-index: 2;
}
.rl-toggle:hover { background: rgba(255,255,255,0.12); color: #fff; }

/* ── Nav label ── */
.rl-nav-label {
  font-size: 9.5px; font-weight: 700; color: rgba(255,255,255,0.25);
  letter-spacing: .15em; padding: 14px 20px 5px;
  white-space: nowrap; overflow: hidden; position: relative; z-index: 1;
}

/* ── Nav ── */
.rl-nav {
  display: flex; flex-direction: column; gap: 2px;
  padding: 8px 10px 0;
  position: relative; z-index: 1;
}
.rl-nav-item {
  display: flex; align-items: center; gap: 12px;
  padding: 11px 10px; border-radius: 12px;
  text-decoration: none; cursor: pointer; border: none; background: none; width: 100%;
  font-family: 'DM Sans', sans-serif; color: rgba(255,255,255,0.5);
  transition: all .2s; position: relative; white-space: nowrap; overflow: hidden;
}
.rl-nav-item:hover {
  background: rgba(255,255,255,0.06);
  color: rgba(255,255,255,0.85);
}

/* Active — orange accent, not flood */
.rl-nav-active {
  background: rgba(249,115,22,0.12) !important;
  color: #fdba74 !important;
}
.rl-nav-active::before {
  content: '';
  position: absolute; left: 0; top: 50%; transform: translateY(-50%);
  width: 3px; height: 55%; border-radius: 0 3px 3px 0;
  background: #f97316;
}

.rl-nav-icon {
  width: 36px; height: 36px; flex-shrink: 0; border-radius: 9px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.05);
  transition: background .2s, color .2s;
}
.rl-nav-icon-active {
  background: rgba(249,115,22,0.15);
  color: #fb923c;
}
.rl-nav-text  { font-size: 14px; font-weight: 600; flex: 1; }
.rl-nav-arrow { opacity: .4; flex-shrink: 0; color: #f97316; }

.rl-nav-extra {
  display: flex; flex-direction: column; gap: 2px;
  padding: 0 10px;
  position: relative; z-index: 1;
}
.rl-btn-item { width: 100%; }

.rl-logout-item:hover { background: rgba(239,68,68,0.1) !important; }
.rl-logout-icon { color: rgba(252,165,165,0.8) !important; }
.rl-logout-text { color: rgba(252,165,165,0.8) !important; }

.rl-divider {
  height: 1px;
  background: rgba(255,255,255,0.07);
  margin: 12px 10px 10px;
  position: relative; z-index: 1;
}

/* ── Owner card ── */
.rl-owner-card {
  margin: auto 10px 16px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(249,115,22,0.15);
  border-radius: 14px;
  padding: 13px 14px;
  display: flex; align-items: center; gap: 11px;
  position: relative; z-index: 1;
}
.rl-owner-avatar {
  width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
  background: rgba(249,115,22,0.2);
  border: 1.5px solid rgba(249,115,22,0.3);
  color: #fdba74; font-size: 12px; font-weight: 800; font-family: 'Sora', sans-serif;
  display: flex; align-items: center; justify-content: center;
}
.rl-owner-avatar-sm { width: 34px; height: 34px; border-radius: 9px; font-size: 11px; }
.rl-owner-info { min-width: 0; flex: 1; }
.rl-owner-name {
  display: block; font-size: 13px; font-weight: 700; color: #f0ebe5;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.rl-owner-role { display: block; font-size: 11px; font-weight: 500; color: rgba(255,255,255,0.3); margin-top: 1px; }
.rl-owner-status {
  width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0;
  background: #4ade80;
  box-shadow: 0 0 0 2px rgba(74,222,128,0.25);
  animation: pulse-green 2.5s ease-in-out infinite;
}
@keyframes pulse-green {
  0%, 100% { box-shadow: 0 0 0 2px rgba(74,222,128,0.25); }
  50%       { box-shadow: 0 0 0 5px rgba(74,222,128,0.08); }
}

.rl-owner-mini { padding: 6px 10px 16px; display: flex; justify-content: center; position: relative; z-index: 1; }

/* ══════════════════════════════════
   MAIN
══════════════════════════════════ */
.rl-main {
  flex: 1; min-height: 100vh; display: flex; flex-direction: column;
  transition: margin-left .32s cubic-bezier(.22,1,.36,1);
}
.rl-main-open      { margin-left: var(--sidebar-w); }
.rl-main-collapsed { margin-left: var(--sidebar-c); }

/* ── Topbar ── */
.rl-topbar {
  height: var(--topbar-h);
  background: #ffffff;
  border-bottom: 1px solid #f0ebe4;
  padding: 0 32px;
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  position: sticky; top: 0; z-index: 50;
  box-shadow: 0 1px 12px rgba(0,0,0,0.04);
}
.rl-topbar-left  { display: flex; align-items: center; gap: 16px; }
.rl-topbar-right { display: flex; align-items: center; gap: 10px; }

.rl-breadcrumb { display: flex; align-items: center; gap: 7px; }
.rl-breadcrumb-root {
  font-size: 13.5px; font-weight: 600; color: #b0a090;
  display: flex; align-items: center; gap: 4px;
}
.rl-breadcrumb-sep  { color: #ddd5cc; }
.rl-breadcrumb-page {
  font-family: 'Sora', sans-serif;
  font-size: 15px; font-weight: 800; color: var(--text-dark);
}

/* Icon buttons — minimal, no color flood */
.rl-topbar-icon-btn {
  width: 38px; height: 38px; border-radius: 10px;
  background: #fafafa; border: 1px solid #ede8e2;
  color: #7a6a5a; display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all .18s; position: relative;
}
.rl-topbar-icon-btn:hover {
  background: #fff7f0;
  border-color: #f0c8a8;
  color: #c06020;
  transform: translateY(-1px);
  box-shadow: 0 3px 10px rgba(0,0,0,0.07);
}
.rl-notif-dot {
  position: absolute; top: 7px; right: 7px;
  width: 7px; height: 7px;
  background: #ef4444; border-radius: 50%; border: 2px solid #fff;
}

/* Profile chip */
.rl-topbar-profile {
  display: flex; align-items: center; gap: 10px;
  padding: 6px 12px 6px 8px;
  background: #fafafa; border: 1px solid #ede8e2;
  border-radius: 12px; cursor: default; transition: all .18s;
}
.rl-topbar-profile:hover {
  border-color: #f0c8a8;
  box-shadow: 0 3px 12px rgba(0,0,0,0.06);
}
.rl-topbar-info { text-align: right; }
.rl-topbar-rname {
  display: block; font-family: 'Sora', sans-serif;
  font-size: 13.5px; font-weight: 800; color: var(--text-dark);
}
.rl-topbar-owner { display: block; font-size: 11px; font-weight: 500; color: #a09080; }
.rl-topbar-avatar {
  width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
  background: linear-gradient(135deg, #fde8d0, #f9c090);
  color: #7c3010; font-family: 'Sora', sans-serif; font-size: 13px; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
  border: 1.5px solid #f0c8a0;
}

/* ── Page content ── */
.rl-content {
  flex: 1;
  padding: 32px 36px;
  background: #f8f5f2;
}

/* ══════════════════════════════════
   RESPONSIVE
══════════════════════════════════ */
@media (max-width: 768px) {
  .rl-sidebar      { width: var(--sidebar-c) !important; }
  .rl-main         { margin-left: var(--sidebar-c) !important; }
  .rl-brand-text, .rl-nav-text, .rl-nav-arrow, .rl-nav-label,
  .rl-owner-card, .rl-brand-name, .rl-brand-tag, .rl-nav-extra .rl-nav-text,
  .rl-toggle       { display: none !important; }
  .rl-owner-mini   { display: flex !important; }
  .rl-topbar       { padding: 0 16px; }
  .rl-content      { padding: 18px 14px; }
  .rl-topbar-info  { display: none; }
  .rl-topbar-profile { padding: 6px; }
}

@media (max-width: 480px) {
  .rl-topbar-icon-btn { width: 34px; height: 34px; border-radius: 8px; }
  .rl-topbar-avatar   { width: 34px; height: 34px; border-radius: 8px; font-size: 11px; }
  .rl-breadcrumb-page { font-size: 14px; }
}
`;

export default RestaurantLayout;