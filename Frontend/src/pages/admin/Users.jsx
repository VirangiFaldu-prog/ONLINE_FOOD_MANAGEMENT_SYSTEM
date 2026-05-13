// import React, { useEffect, useState } from "react";
// import { 
//   Users, Search, Shield, Copy, Edit,
//   Trash2, Mail, Phone, MoreHorizontal,
//   CheckCircle, XCircle, AlertCircle
// } from "lucide-react";
// import axiosInstance from "../../api/axiosInstance";

// const ROLE_MAP = {
//   1: "Admin",
//   2: "Customer",
//   3: "Restaurant",
//   4: "Delivery",
// };

// export default function UsersAdmin() {
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
  
//   const [searchTerm, setSearchTerm] = useState("");
//   const [activeTab, setActiveTab] = useState("All");
  
//   const [showDeleteModal, setShowDeleteModal] = useState(null);

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   const fetchUsers = async () => {
//     try {
//       setLoading(true);
//       const res = await axiosInstance.get("/User");
//       setUsers(res.data);
//     } catch (err) {
//       setError(err.response?.data || err.message || "Failed to fetch users");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const deleteUser = async () => {
//     if (!showDeleteModal) return;
//     try {
//       await axiosInstance.delete(`/User/${showDeleteModal}`);
//       setUsers(users.filter(u => u.userID !== showDeleteModal));
//       setShowDeleteModal(null);
//     } catch (err) {
//       alert("Failed to delete user: " + (err.response?.data || err.message));
//     }
//   };

//   const filteredUsers = users.filter(u => {
//     const roleName = ROLE_MAP[u.role] || "Unknown";
    
//     // Search filter
//     const matchesSearch = 
//       u.userName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
//       u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       u.phone?.includes(searchTerm);
    
//     // Tab filter
//     const matchesTab = 
//       activeTab === "All" || 
//       (activeTab === "Customers" && roleName === "Customer") ||
//       (activeTab === "Delivery Boys" && roleName === "Delivery") ||
//       (activeTab === "Restaurant Owners" && roleName === "Restaurant");

//     return matchesSearch && matchesTab;
//   });

//   const getRoleBadge = (roleId) => {
//     const role = ROLE_MAP[roleId] || "Unknown";
//     switch(role) {
//       case 'Admin': return <span className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-md text-xs font-semibold border border-purple-200">Admin</span>;
//       case 'Customer': return <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-semibold border border-blue-200">Customer</span>;
//       case 'Restaurant': return <span className="px-2.5 py-1 bg-orange-100 text-orange-700 rounded-md text-xs font-semibold border border-orange-200">Restaurant</span>;
//       case 'Delivery': return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-md text-xs font-semibold border border-emerald-200">Delivery</span>;
//       default: return <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-semibold border border-gray-200">{role}</span>;
//     }
//   };

//   const stats = {
//     total: users.length,
//     customers: users.filter(u => ROLE_MAP[u.role] === "Customer").length,
//     delivery: users.filter(u => ROLE_MAP[u.role] === "Delivery").length,
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header section */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
//             <Users className="w-6 h-6 text-orange-500" />
//             Users Management
//           </h1>
//           <p className="text-sm text-gray-500 mt-1">Manage platform users, roles, and access controls.</p>
//         </div>
//         <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 p-1">
//           <div className="px-4 py-2 text-center border-r border-gray-100 last:border-0">
//             <p className="text-xs text-gray-500 font-medium uppercase">Total</p>
//             <p className="text-lg font-bold text-gray-900">{stats.total}</p>
//           </div>
//           <div className="px-4 py-2 text-center border-r border-gray-100 last:border-0">
//             <p className="text-xs text-gray-500 font-medium uppercase">Customers</p>
//             <p className="text-lg font-bold text-blue-600">{stats.customers}</p>
//           </div>
//           <div className="px-4 py-2 text-center">
//             <p className="text-xs text-gray-500 font-medium uppercase">Delivery</p>
//             <p className="text-lg font-bold text-emerald-600">{stats.delivery}</p>
//           </div>
//         </div>
//       </div>

//       {/* Filters and Tabs */}
//       <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
//         <div className="border-b border-gray-100">
//           <nav className="flex overflow-x-auto">
//             {['All', 'Customers', 'Delivery Boys', 'Restaurant Owners'].map((tab) => (
//               <button
//                 key={tab}
//                 onClick={() => setActiveTab(tab)}
//                 className={`flex-none px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
//                   activeTab === tab 
//                     ? 'border-orange-500 text-orange-600' 
//                     : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
//                 }`}
//               >
//                 {tab}
//               </button>
//             ))}
//           </nav>
//         </div>
        
//         <div className="p-4 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/50">
//           <div className="relative w-full md:w-96">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//             <input 
//               type="text" 
//               placeholder="Search users..." 
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-sm transition-all shadow-sm"
//             />
//           </div>
//         </div>
//       </div>

//       {/* Table Area */}
//       <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
//         {loading ? (
//           <div className="h-64 flex flex-col items-center justify-center space-y-4">
//             <div className="w-8 h-8 rounded-full border-4 border-orange-500 border-t-transparent animate-spin"></div>
//             <p className="text-gray-500 font-medium">Loading users...</p>
//           </div>
//         ) : error ? (
//           <div className="p-8 text-center text-rose-600">
//             <AlertCircle className="w-8 h-8 mx-auto mb-2" />
//             <p>{error}</p>
//           </div>
//         ) : filteredUsers.length === 0 ? (
//           <div className="p-12 text-center flex flex-col items-center justify-center">
//             <Users className="w-12 h-12 text-gray-300 mb-4" />
//             <h3 className="text-lg font-medium text-gray-900">No users found</h3>
//             <p className="text-gray-500 mt-1">Try adjusting your filters or search terms.</p>
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full text-left border-collapse">
//               <thead>
//                 <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
//                   <th className="px-6 py-4">User</th>
//                   <th className="px-6 py-4">Contact Info</th>
//                   <th className="px-6 py-4">Role</th>
//                   <th className="px-6 py-4">Status</th>
//                   <th className="px-6 py-4 text-right">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-100">
//                 {filteredUsers.map(u => (
//                   <tr key={u.userID} className="hover:bg-gray-50/50 transition-colors group">
//                     <td className="px-6 py-4">
//                       <div className="flex items-center gap-3">
//                         <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center text-orange-700 font-bold shrink-0">
//                           {u.userName?.charAt(0).toUpperCase() || "U"}
//                         </div>
//                         <div>
//                           <p className="font-semibold text-gray-900">{u.userName}</p>
//                           <p className="text-xs text-gray-500 font-mono">ID: #{u.userID}</p>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4">
//                       <div className="space-y-1">
//                         <div className="flex items-center gap-2 text-sm text-gray-600">
//                           <Mail className="w-3.5 h-3.5 text-gray-400" />
//                           {u.email}
//                         </div>
//                         {u.phone && (
//                           <div className="flex items-center gap-2 text-sm text-gray-600">
//                             <Phone className="w-3.5 h-3.5 text-gray-400" />
//                             {u.phone}
//                           </div>
//                         )}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4">
//                       {getRoleBadge(u.role)}
//                     </td>
//                     <td className="px-6 py-4">
//                       <div className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
//                         <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
//                         Active
//                       </div>
//                     </td>
//                     <td className="px-6 py-4">
//                       <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
//                         <button 
//                           onClick={() => alert("Block/Unblock feature requires backend support. Using delete for now is recommended.")}
//                           className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
//                           title="Block User"
//                         >
//                           <Shield className="w-4 h-4" />
//                         </button>
//                         <button 
//                           onClick={() => setShowDeleteModal(u.userID)}
//                           className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
//                           title="Delete User"
//                         >
//                           <Trash2 className="w-4 h-4" />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       {/* Delete Confirmation Modal */}
//       {showDeleteModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
//           <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
//             <div className="p-6 text-center">
//               <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <AlertCircle className="w-8 h-8 text-rose-600" />
//               </div>
//               <h3 className="text-xl font-bold text-gray-900 mb-2">Delete User</h3>
//               <p className="text-gray-500">
//                 Are you sure you want to permanently delete this user? This action cannot be undone.
//               </p>
//             </div>
//             <div className="p-4 bg-gray-50 flex gap-3">
//               <button 
//                 onClick={() => setShowDeleteModal(null)}
//                 className="flex-1 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
//               >
//                 Cancel
//               </button>
//               <button 
//                 onClick={deleteUser}
//                 className="flex-1 px-4 py-2.5 bg-rose-600 text-white rounded-xl font-medium hover:bg-rose-700 transition-colors shadow-sm"
//               >
//                 Delete permanently
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// /* 
// ============== OLD CODE BELOW ==============
// (Old code omitted for brevity but safely archived in Git)
// */

import React, { useEffect, useState, useRef } from "react";
import {
  Users, Search, Shield, Trash2, Mail, Phone,
  MoreHorizontal, AlertCircle, X, Check, RefreshCw,
  ChevronDown, UserCheck, Bike, UtensilsCrossed,
  Crown, Filter, XCircle, Eye,
} from "lucide-react";
import axiosInstance from "../../api/axiosInstance";

/* ─── Role config ───────────────────────────────────────── */
const ROLE_MAP = { 1: "Admin", 2: "Customer", 3: "Restaurant", 4: "Delivery" };

const ROLE_CFG = {
  Admin:      { color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe", icon: Crown,            label: "Admin"       },
  Customer:   { color: "#0369a1", bg: "#f0f9ff", border: "#bae6fd", icon: UserCheck,         label: "Customer"    },
  Restaurant: { color: "#c2410c", bg: "#fff7ed", border: "#fed7aa", icon: UtensilsCrossed,   label: "Restaurant"  },
  Delivery:   { color: "#065f46", bg: "#ecfdf5", border: "#a7f3d0", icon: Bike,              label: "Delivery"    },
  Unknown:    { color: "#64748b", bg: "#f8fafc", border: "#e2e8f0", icon: Users,             label: "Unknown"     },
};

const getRoleCfg  = (roleId) => ROLE_CFG[ROLE_MAP[roleId]] ?? ROLE_CFG.Unknown;
const getRoleName = (roleId) => ROLE_MAP[roleId] ?? "Unknown";

/* ─── Animated counter ──────────────────────────────────── */
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

/* ─── Avatar ────────────────────────────────────────────── */
const Avatar = ({ name, roleId, size = 44 }) => {
  const cfg = getRoleCfg(roleId);
  const initials = (name || "U").slice(0, 2).toUpperCase();
  return (
    <div
      className="ux-avatar"
      style={{
        width: size, height: size,
        background: cfg.bg,
        border: `2px solid ${cfg.border}`,
        color: cfg.color,
        fontSize: size * 0.34,
      }}
    >
      {initials}
    </div>
  );
};

/* ─── Role badge ────────────────────────────────────────── */
const RoleBadge = ({ roleId }) => {
  const cfg = getRoleCfg(roleId);
  const Icon = cfg.icon;
  return (
    <span className="ux-role-badge" style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}>
      <Icon size={10} />
      {cfg.label}
    </span>
  );
};

/* ─── Stat card ─────────────────────────────────────────── */
const StatCard = ({ label, value, icon: Icon, color, bg, border, sub, delay }) => (
  <div className="ux-stat" style={{ "--sc": color, "--sb": bg, "--sbd": border, animationDelay: delay }}>
    <div className="ux-stat-icon"><Icon size={18} /></div>
    <div className="ux-stat-body">
      <div className="ux-stat-val"><Counter to={value} /></div>
      <div className="ux-stat-label">{label}</div>
      {sub && <div className="ux-stat-sub">{sub}</div>}
    </div>
    <div className="ux-stat-shine" />
  </div>
);

/* ─── Delete modal ──────────────────────────────────────── */
const DeleteModal = ({ user, onConfirm, onClose, busy }) => (
  <div className="ux-overlay" onClick={onClose}>
    <div className="ux-modal" onClick={e => e.stopPropagation()}>
      <button className="ux-modal-x" onClick={onClose}><X size={14} /></button>
      <div className="ux-modal-ico"><Trash2 size={22} /></div>
      <h2 className="ux-modal-title">Delete User?</h2>
      <p className="ux-modal-body">
        <strong>{user?.userName}</strong>'s account and all associated data will be permanently removed.
      </p>
      <div className="ux-modal-row">
        <button className="ux-mbtn-ghost" onClick={onClose} disabled={busy}>Keep</button>
        <button className="ux-mbtn-danger" onClick={onConfirm} disabled={busy}>
          {busy ? <><span className="ux-spin" />Deleting…</> : <><Trash2 size={12} />Delete</>}
        </button>
      </div>
    </div>
  </div>
);

/* ─── User detail drawer ────────────────────────────────── */
const UserDrawer = ({ user, onClose, onDelete }) => {
  if (!user) return null;
  const cfg = getRoleCfg(user.role);
  const Icon = cfg.icon;
  return (
    <div className="ux-drawer-bg" onClick={onClose}>
      <div className="ux-drawer" onClick={e => e.stopPropagation()}>
        <button className="ux-drawer-x" onClick={onClose}><X size={15} /></button>

        {/* Hero band */}
        <div className="ux-drawer-hero" style={{ background: `linear-gradient(135deg, ${cfg.bg}, #fff)` }}>
          <div className="ux-drawer-dots" />
          <Avatar name={user.userName} roleId={user.role} size={72} />
          <div className="ux-drawer-hero-info">
            <h2 className="ux-drawer-name">{user.userName}</h2>
            <RoleBadge roleId={user.role} />
          </div>
        </div>

        <div className="ux-drawer-body">
          {/* Info fields */}
          <div className="ux-drawer-fields">
            <div className="ux-dfield">
              <span className="ux-dfield-lbl"><Mail size={12} /> Email</span>
              <span className="ux-dfield-val">{user.email || "—"}</span>
            </div>
            <div className="ux-dfield">
              <span className="ux-dfield-lbl"><Phone size={12} /> Phone</span>
              <span className="ux-dfield-val">{user.phone || "—"}</span>
            </div>
            <div className="ux-dfield">
              <span className="ux-dfield-lbl"><Icon size={12} /> Role</span>
              <span className="ux-dfield-val">{cfg.label}</span>
            </div>
            <div className="ux-dfield">
              <span className="ux-dfield-lbl"># ID</span>
              <span className="ux-dfield-val ux-mono">#{user.userID}</span>
            </div>
          </div>

          {/* Status pill */}
          <div className="ux-drawer-status">
            <span className="ux-status-live"><span className="ux-live-dot" />Active Account</span>
          </div>

          {/* Actions */}
          <div className="ux-drawer-actions">
            <button className="ux-daction ux-daction-del" onClick={() => { onDelete(user); onClose(); }}>
              <Trash2 size={15} /> Delete User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── User table row ────────────────────────────────────── */
const UserRow = ({ u, idx, onView, onDelete }) => {
  const cfg = getRoleCfg(u.role);
  return (
    <tr className="ux-row" style={{ animationDelay: `${idx * 35}ms` }}>
      {/* User */}
      <td className="ux-td ux-td-user">
        <div className="ux-user-cell">
          <Avatar name={u.userName} roleId={u.role} />
          <div>
            <p className="ux-user-name">{u.userName}</p>
            <p className="ux-user-id">#{u.userID}</p>
          </div>
        </div>
      </td>

      {/* Contact */}
      <td className="ux-td ux-td-contact">
        <div className="ux-contact">
          <span className="ux-contact-item"><Mail size={11} />{u.email || "—"}</span>
          {u.phone && <span className="ux-contact-item"><Phone size={11} />{u.phone}</span>}
        </div>
      </td>

      {/* Role */}
      <td className="ux-td">
        <RoleBadge roleId={u.role} />
      </td>

      {/* Status */}
      <td className="ux-td">
        <span className="ux-status-active"><span className="ux-live-dot" />Active</span>
      </td>

      {/* Actions */}
      <td className="ux-td ux-td-actions">
        <div className="ux-actions">
          <button className="ux-action-btn ux-action-view" onClick={() => onView(u)} title="View details">
            <Eye size={14} />
          </button>
          <button className="ux-action-btn ux-action-del" onClick={() => onDelete(u)} title="Delete user">
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
};

/* ══════════════════════════════════════════════════════════
   MAIN
══════════════════════════════════════════════════════════ */
export default function UsersAdmin() {
  const [users, setUsers]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [refreshing, setRefreshing]   = useState(false);
  const [searchTerm, setSearchTerm]   = useState("");
  const [activeTab, setActiveTab]     = useState("All");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]       = useState(false);
  const [viewTarget, setViewTarget]   = useState(null);
  const [toast, setToast]             = useState(null);

  useEffect(() => { fetchUsers(); }, []);

  const showToast = (msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3600);
  };

  const fetchUsers = async () => {
    try {
      setLoading(true); setError("");
      const res = await axiosInstance.get("/User");
      setUsers(res.data);
    } catch (err) {
      setError(err.response?.data || err.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    setTimeout(() => setRefreshing(false), 700);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await axiosInstance.delete(`/User/${deleteTarget.userID}`);
      setUsers(p => p.filter(u => u.userID !== deleteTarget.userID));
      showToast(`"${deleteTarget.userName}" deleted.`);
    } catch (err) {
      showToast("Delete failed: " + (err.response?.data || err.message), "err");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  /* ── Derived stats ── */
  const total      = users.length;
  const customers  = users.filter(u => getRoleName(u.role) === "Customer").length;
  const delivery   = users.filter(u => getRoleName(u.role) === "Delivery").length;
  const restaurant = users.filter(u => getRoleName(u.role) === "Restaurant").length;
  const admins     = users.filter(u => getRoleName(u.role) === "Admin").length;

  /* ── Tabs ── */
  const TABS = [
    { key: "All",               label: "All Users",         count: total      },
    { key: "Customer",          label: "Customers",         count: customers  },
    { key: "Delivery",          label: "Delivery",          count: delivery   },
    { key: "Restaurant",        label: "Restaurants",       count: restaurant },
    { key: "Admin",             label: "Admins",            count: admins     },
  ];

  /* ── Filter ── */
  const filtered = users.filter(u => {
    const q = searchTerm.toLowerCase();
    const mQ = !q
      || u.userName?.toLowerCase().includes(q)
      || u.email?.toLowerCase().includes(q)
      || u.phone?.includes(q);
    const mT = activeTab === "All" || getRoleName(u.role) === activeTab;
    return mQ && mT;
  });

  return (
    <>
      <style>{CSS}</style>

      {/* Toast */}
      {toast && (
        <div className={`ux-toast ${toast.type === "err" ? "ux-toast-err" : "ux-toast-ok"}`}>
          {toast.type === "err" ? <XCircle size={13} /> : <Check size={13} />}
          {toast.msg}
        </div>
      )}

      {deleteTarget && (
        <DeleteModal
          user={deleteTarget}
          onConfirm={confirmDelete}
          onClose={() => setDeleteTarget(null)}
          busy={deleting}
        />
      )}
      {viewTarget && (
        <UserDrawer
          user={viewTarget}
          onClose={() => setViewTarget(null)}
          onDelete={u => { setViewTarget(null); setDeleteTarget(u); }}
        />
      )}

      <div className="ux-root">

        {/* ══ HERO HEADER ══ */}
        <header className="ux-hero">
          <div className="ux-hero-mesh" />
          <div className="ux-hero-left">
            <div className="ux-hero-eyebrow">
              <Users size={11} /> Admin Console · User Management
            </div>
            <h1 className="ux-hero-title">
              Platform <em>Users</em>
            </h1>
            <p className="ux-hero-desc">
              Manage all <strong>{total}</strong> registered accounts, roles, and access
            </p>
          </div>
          <div className="ux-hero-right">
            <div className="ux-hero-badge ux-hbadge-blue">
              <UserCheck size={12} /> {customers} Customers
            </div>
            <div className="ux-hero-badge ux-hbadge-green">
              <Bike size={12} /> {delivery} Delivery
            </div>
            <div className="ux-hero-badge ux-hbadge-orange">
              <UtensilsCrossed size={12} /> {restaurant} Restaurants
            </div>
            <button
              className={`ux-sync-btn ${refreshing ? "ux-syncing" : ""}`}
              onClick={handleRefresh}
            >
              <RefreshCw size={14} /> Sync
            </button>
          </div>
        </header>

        {/* ══ STAT STRIP ══ */}
        <div className="ux-stats">
          <StatCard label="Total Users"    value={total}      icon={Users}          color="#4f46e5" bg="#eef2ff" border="#c7d2fe" sub="All roles"          delay="0ms"   />
          <StatCard label="Customers"      value={customers}  icon={UserCheck}      color="#0369a1" bg="#f0f9ff" border="#bae6fd" sub="Active shoppers"    delay="60ms"  />
          <StatCard label="Delivery"       value={delivery}   icon={Bike}           color="#065f46" bg="#ecfdf5" border="#a7f3d0" sub="On the road"        delay="120ms" />
          <StatCard label="Restaurants"    value={restaurant} icon={UtensilsCrossed}color="#c2410c" bg="#fff7ed" border="#fed7aa" sub="Food partners"      delay="180ms" />
          <StatCard label="Admins"         value={admins}     icon={Crown}          color="#7c3aed" bg="#f5f3ff" border="#ddd6fe" sub="Full access"        delay="240ms" />
        </div>

        {/* ══ TOOLBAR ══ */}
        <div className="ux-toolbar">
          {/* Tabs */}
          <div className="ux-tabs">
            {TABS.filter(t => t.count > 0 || t.key === "All").map(t => (
              <button
                key={t.key}
                className={`ux-tab ${activeTab === t.key ? "ux-tab-on" : ""}`}
                onClick={() => setActiveTab(t.key)}
              >
                {t.label}
                <span className={`ux-tab-pill ${activeTab === t.key ? "ux-tab-pill-on" : ""}`}>
                  {t.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="ux-search-wrap">
            <Search size={13} className="ux-search-ico" />
            <input
              className="ux-search"
              placeholder="Search name, email, phone…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="ux-search-clr" onClick={() => setSearchTerm("")}>
                <X size={11} />
              </button>
            )}
          </div>
        </div>

        {/* ── result count ── */}
        {!loading && !error && (
          <div className="ux-result-bar">
            <span>
              Showing <strong>{filtered.length}</strong> of <strong>{total}</strong> users
              {searchTerm && <> matching "<em>{searchTerm}</em>"</>}
            </span>
            {activeTab !== "All" && (
              <button className="ux-clear-tab" onClick={() => setActiveTab("All")}>
                <X size={10} /> Clear filter
              </button>
            )}
          </div>
        )}

        {/* ══ TABLE AREA ══ */}
        <div className="ux-table-wrap">
          {loading ? (
            <div className="ux-loading">
              <div className="ux-loader-ring" />
              <p>Loading users…</p>
            </div>
          ) : error ? (
            <div className="ux-state ux-state-err">
              <AlertCircle size={36} />
              <h3>Failed to load</h3>
              <p>{error}</p>
              <button className="ux-state-btn" onClick={fetchUsers}>Retry</button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="ux-state">
              <Users size={44} />
              <h3>No users found</h3>
              <p>{searchTerm ? `No results for "${searchTerm}"` : "Try a different tab."}</p>
              {searchTerm && (
                <button className="ux-state-btn" onClick={() => setSearchTerm("")}>Clear Search</button>
              )}
            </div>
          ) : (
            <div className="ux-table-scroll">
              <table className="ux-table">
                <thead>
                  <tr className="ux-thead-row">
                    <th className="ux-th">User</th>
                    <th className="ux-th">Contact</th>
                    <th className="ux-th">Role</th>
                    <th className="ux-th">Status</th>
                    <th className="ux-th ux-th-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u, i) => (
                    <UserRow
                      key={u.userID}
                      u={u}
                      idx={i}
                      onView={setViewTarget}
                      onDelete={setDeleteTarget}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer count */}
        {!loading && filtered.length > 0 && (
          <div className="ux-footer">
            <span>{filtered.length} record{filtered.length !== 1 ? "s" : ""}</span>
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

.ux-root *,.ux-root *::before,.ux-root *::after{box-sizing:border-box;margin:0;padding:0}
.ux-root{
  --bg:#f7f8fc;
  --surf:#ffffff;
  --surf2:#f1f3f9;
  --surf3:#e8ebf4;
  --bdr:#e2e6f0;
  --bdr2:#d0d5e8;
  --ink:#111827;
  --ink2:#374151;
  --ink3:#6b7280;
  --ink4:#9ca3af;
  --blue:#4f46e5;
  --blue-light:#eef2ff;
  --coral:#e8541a;
  --coral-light:#fff4f0;
  --green:#059669;
  --green-light:#ecfdf5;
  --rose:#dc2626;
  --rose-light:#fef2f2;
  --sh:0 1px 3px rgba(17,24,39,.06),0 4px 14px rgba(17,24,39,.07);
  --sh-h:0 4px 16px rgba(17,24,39,.1),0 16px 40px rgba(17,24,39,.1);
 font-family:'Plus Jakarta Sans',system-ui,sans-serif;
  background:var(--bg);
  min-height:100vh;
  color:var(--ink);
}

/* ── KEYFRAMES ── */
@keyframes ux-in{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes ux-row-in{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
@keyframes ux-fade{from{opacity:0}to{opacity:1}}
@keyframes ux-spin{to{transform:rotate(360deg)}}
@keyframes ux-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(1.6)}}
@keyframes ux-toast{from{opacity:0;transform:translateX(-50%) translateY(14px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
@keyframes ux-modal{from{opacity:0;transform:scale(.92) translateY(16px)}to{opacity:1;transform:scale(1) translateY(0)}}
@keyframes ux-slide{from{opacity:0;transform:translateX(32px)}to{opacity:1;transform:translateX(0)}}
@keyframes ux-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
@keyframes ux-shine{0%{left:-60%}100%{left:130%}}

/* ── TOAST ── */
.ux-toast{
  position:fixed;bottom:22px;left:50%;transform:translateX(-50%);z-index:9999;
  display:flex;align-items:center;gap:8px;padding:10px 20px;background:#fff;
  border-radius:50px;font-size:12.5px;font-weight:700;
  box-shadow:0 6px 28px rgba(17,24,39,.14);white-space:nowrap;
  animation:ux-toast .28s cubic-bezier(.22,1,.36,1);
}
.ux-toast-ok{border:1.5px solid #a7f3d0;color:#065f46}
.ux-toast-err{border:1.5px solid #fca5a5;color:#991b1b}

/* ── HERO ── */
.ux-hero{
  position:relative;padding:44px 32px 38px;overflow:hidden;
  background:linear-gradient(135deg,#fafbff 0%,#f0f4ff 50%,#fafffe 100%);
  border-bottom:1.5px solid var(--bdr);
  display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;
}
.ux-hero-mesh{
  position:absolute;inset:0;pointer-events:none;
  background-image:radial-gradient(circle,rgba(79,70,229,.055) 1px,transparent 1px);
  background-size:24px 24px;
  mask-image:radial-gradient(ellipse at 70% 50%,black 0%,transparent 65%);
}
.ux-hero-left{position:relative;z-index:1}
.ux-hero-eyebrow{
  display:inline-flex;align-items:center;gap:6px;
  font-size:11px;font-weight:700;color:var(--ink3);letter-spacing:.08em;text-transform:uppercase;
  background:rgba(255,255,255,.8);border:1px solid var(--bdr);
  padding:4px 12px;border-radius:50px;margin-bottom:14px;
}
.ux-hero-title{
  font-family:'Fraunces',serif;,sans-serif;font-size:clamp(34px,4.5vw,56px);
  font-weight:800;color:var(--ink);line-height:.95;letter-spacing:-.025em;margin-bottom:10px;
  animation:ux-in .5s cubic-bezier(.22,1,.36,1);
}
.ux-hero-title em {
  font-style: italic;
  font-weight: 800;  /* ← add this for extra punch */
  background: linear-gradient(135deg, var(--blue), #818cf8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.ux-hero-desc{font-size:14px;color:var(--ink3);animation:ux-fade .7s .2s both}
.ux-hero-desc strong{color:var(--ink);font-weight:700}
.ux-hero-right{
  position:relative;z-index:1;
  display:flex;align-items:center;gap:9px;flex-wrap:wrap;
}
.ux-hero-badge{
  display:inline-flex;align-items:center;gap:6px;padding:7px 14px;
  border-radius:50px;font-size:12px;font-weight:700;border:1.5px solid;
}
.ux-hbadge-blue{background:#eff6ff;color:#1d4ed8;border-color:#bfdbfe}
.ux-hbadge-green{background:#ecfdf5;color:#065f46;border-color:#a7f3d0}
.ux-hbadge-orange{background:#fff7ed;color:#9a3412;border-color:#fed7aa}
.ux-sync-btn{
  display:flex;align-items:center;gap:7px;padding:9px 18px;
  background:#fff;border:1.5px solid var(--bdr2);border-radius:11px;
  color:var(--ink2);font-family:inherit;font-size:12.5px;font-weight:700;
  cursor:pointer;transition:all .18s;box-shadow:var(--sh);
}
.ux-sync-btn:hover{border-color:var(--blue);color:var(--blue);background:var(--blue-light)}
.ux-syncing svg{animation:ux-spin .7s linear infinite}

/* ── STATS ── */
.ux-stats{
  display:grid;grid-template-columns:repeat(auto-fill,minmax(185px,1fr));
  gap:14px;padding:22px 28px;border-bottom:1.5px solid var(--bdr);background:var(--bg);
}
.ux-stat{
  background:var(--surf);border:1.5px solid var(--bdr);border-radius:16px;
  padding:18px;display:flex;align-items:center;gap:14px;
  box-shadow:var(--sh);cursor:default;transition:all .22s;
  animation:ux-in .5s cubic-bezier(.22,1,.36,1) both;overflow:hidden;position:relative;
}
.ux-stat::before{
  content:'';position:absolute;top:0;left:0;right:0;height:3px;
  background:var(--sc);border-radius:16px 16px 0 0;
}
.ux-stat:hover{transform:translateY(-3px);box-shadow:var(--sh-h)}
.ux-stat-icon{
  width:42px;height:42px;border-radius:11px;flex-shrink:0;
  display:flex;align-items:center;justify-content:center;
  background:var(--sb);color:var(--sc);
}
.ux-stat-val{
  font-family:'Fraunces',serif;,sans-serif;font-size:28px;font-weight:800;
  color:var(--ink);line-height:1;letter-spacing:-.03em;
}
.ux-stat-label{font-size:12px;font-weight:600;color:var(--ink3);margin-top:2px}
.ux-stat-sub{font-size:10.5px;color:var(--ink4);margin-top:2px}
.ux-stat-shine{
  position:absolute;top:0;bottom:0;width:50px;
  background:linear-gradient(90deg,transparent,rgba(255,255,255,.5),transparent);
  animation:ux-shine 3.5s ease infinite;pointer-events:none;
}

/* ── TOOLBAR ── */
.ux-toolbar{
  padding:16px 28px;background:var(--surf);border-bottom:1.5px solid var(--bdr);
  display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;
  position:sticky;top:0;z-index:100;
}
/* Tabs */
.ux-tabs{display:flex;gap:2px;overflow-x:auto;scrollbar-width:none}
.ux-tabs::-webkit-scrollbar{display:none}
.ux-tab{
  padding:8px 16px;border-radius:9px;border:none;background:transparent;
  font-family:inherit;font-size:12.5px;font-weight:600;color:var(--ink3);
  cursor:pointer;transition:all .15s;white-space:nowrap;display:flex;align-items:center;gap:6px;
}
.ux-tab:hover{background:var(--surf2);color:var(--ink)}
.ux-tab-on{background:var(--blue-light)!important;color:var(--blue)!important;font-weight:700}
.ux-tab-pill{
  font-size:10px;font-weight:800;padding:1px 7px;border-radius:50px;
  background:var(--surf3);color:var(--ink4);
}
.ux-tab-pill-on{background:rgba(79,70,229,.15);color:var(--blue)}
/* Search */
.ux-search-wrap{position:relative;min-width:220px;max-width:300px}
.ux-search-ico{position:absolute;left:11px;top:50%;transform:translateY(-50%);color:var(--ink4);pointer-events:none}
.ux-search{
  width:100%;padding:9px 34px;background:var(--surf2);border:1.5px solid var(--bdr);
  border-radius:10px;font-family:inherit;font-size:13px;color:var(--ink);outline:none;transition:all .15s;
}
.ux-search::placeholder{color:var(--ink4)}
.ux-search:focus{border-color:var(--blue);background:#fff;box-shadow:0 0 0 3px rgba(79,70,229,.08)}
.ux-search-clr{position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--ink4);cursor:pointer;display:flex;align-items:center}

/* Result bar */
.ux-result-bar{
  padding:10px 28px;display:flex;align-items:center;justify-content:space-between;
  font-size:12px;color:var(--ink3);border-bottom:1px solid var(--bdr);background:var(--bg);
}
.ux-result-bar strong{color:var(--ink2);font-weight:700}
.ux-result-bar em{color:var(--blue);font-style:normal}
.ux-clear-tab{
  display:flex;align-items:center;gap:4px;padding:4px 10px;border-radius:6px;
  border:1px solid var(--bdr2);background:transparent;font-family:inherit;font-size:11px;
  font-weight:600;color:var(--ink3);cursor:pointer;transition:all .14s;
}
.ux-clear-tab:hover{color:var(--rose);border-color:#fca5a5;background:var(--rose-light)}

/* ── TABLE ── */
.ux-table-wrap{background:var(--surf);border-bottom:1.5px solid var(--bdr)}
.ux-table-scroll{overflow-x:auto}
.ux-table{width:100%;border-collapse:collapse;font-size:13.5px}
.ux-thead-row{background:var(--surf2);border-bottom:1.5px solid var(--bdr)}
.ux-th{
  padding:13px 20px;font-size:10.5px;font-weight:800;
  color:var(--ink3);text-transform:uppercase;letter-spacing:.08em;
  white-space:nowrap;text-align:left;
}
.ux-th-right{text-align:right}

/* Table rows */
.ux-row{
  border-bottom:1px solid var(--bdr);transition:background .15s;
  animation:ux-row-in .4s cubic-bezier(.22,1,.36,1) both;
}
.ux-row:hover{background:#fafbff}
.ux-row:last-child{border-bottom:none}
.ux-td{padding:14px 20px;vertical-align:middle}

/* User cell */
.ux-td-user{min-width:190px}
.ux-user-cell{display:flex;align-items:center;gap:12px}
.ux-avatar{
  border-radius:12px;display:flex;align-items:center;justify-content:center;
  font-family:'Fraunces',serif;,sans-serif;font-weight:800;flex-shrink:0;letter-spacing:-.02em;
}
.ux-user-name{font-size:13.5px;font-weight:700;color:var(--ink)}
.ux-user-id{font-size:11px;color:var(--ink4);margin-top:1px;font-family:monospace}

/* Contact */
.ux-td-contact{min-width:220px}
.ux-contact{display:flex;flex-direction:column;gap:4px}
.ux-contact-item{display:inline-flex;align-items:center;gap:5px;font-size:12.5px;color:var(--ink3)}
.ux-mono{font-family:monospace;font-size:12px}

/* Role badge */
.ux-role-badge{
  display:inline-flex;align-items:center;gap:5px;padding:4px 10px;
  border-radius:6px;font-size:11px;font-weight:700;border:1.5px solid;
  white-space:nowrap;
}

/* Status */
.ux-status-active,.ux-status-live{
  display:inline-flex;align-items:center;gap:6px;
  font-size:12px;font-weight:700;color:#059669;
}
.ux-live-dot{
  width:7px;height:7px;border-radius:50%;background:#10b981;flex-shrink:0;
  animation:ux-pulse 2.2s ease infinite;
}

/* Actions */
.ux-td-actions{width:100px}
.ux-actions{display:flex;align-items:center;justify-content:flex-end;gap:6px;opacity:0;transition:opacity .18s}
.ux-row:hover .ux-actions{opacity:1}
.ux-action-btn{
  width:32px;height:32px;border-radius:8px;border:1.5px solid var(--bdr);
  background:var(--surf);display:flex;align-items:center;justify-content:center;
  cursor:pointer;color:var(--ink3);transition:all .15s;
}
.ux-action-view:hover{border-color:var(--blue);color:var(--blue);background:var(--blue-light)}
.ux-action-del:hover{border-color:#fca5a5;color:var(--rose);background:var(--rose-light)}

/* ── LOADING / STATE ── */
.ux-loading{
  padding:72px 20px;display:flex;flex-direction:column;align-items:center;gap:14px;
  color:var(--ink3);font-size:13.5px;font-weight:600;
}
.ux-loader-ring{
  width:42px;height:42px;border-radius:50%;
  border:3px solid var(--surf3);border-top-color:var(--blue);
  animation:ux-spin .8s linear infinite;
}
.ux-state{
  padding:72px 20px;text-align:center;display:flex;flex-direction:column;
  align-items:center;gap:12px;color:var(--ink4);
}
.ux-state h3{font-family:'Fraunces',serif;,sans-serif;font-size:19px;font-weight:700;color:var(--ink2)}
.ux-state p{font-size:13.5px;color:var(--ink3)}
.ux-state-err{color:var(--rose)}
.ux-state-err h3{color:#991b1b}
.ux-state-btn{
  margin-top:4px;padding:9px 22px;border-radius:10px;border:1.5px solid var(--bdr2);
  background:var(--surf);color:var(--ink2);font-family:inherit;font-size:12.5px;
  font-weight:700;cursor:pointer;transition:all .15s;box-shadow:var(--sh);
}
.ux-state-btn:hover{border-color:var(--blue);color:var(--blue);background:var(--blue-light)}

/* ── FOOTER ── */
.ux-footer{
  padding:12px 28px;text-align:right;font-size:11.5px;color:var(--ink4);
  border-top:1px solid var(--bdr);background:var(--surf2);
}

/* ── DRAWER ── */
.ux-drawer-bg{position:fixed;inset:0;z-index:800;background:rgba(17,24,39,.4);backdrop-filter:blur(6px);display:flex;justify-content:flex-end}
.ux-drawer{
  width:100%;max-width:420px;height:100%;background:#fff;
  box-shadow:-10px 0 48px rgba(17,24,39,.12);overflow-y:auto;
  animation:ux-slide .3s cubic-bezier(.22,1,.36,1);
  border-left:1.5px solid var(--bdr);display:flex;flex-direction:column;
}
.ux-drawer-x{position:absolute;top:14px;right:14px;width:30px;height:30px;border-radius:50%;border:1.5px solid var(--bdr);background:#fff;color:var(--ink3);display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:10;transition:all .15s}
.ux-drawer-x:hover{background:var(--rose-light);color:var(--rose);border-color:#fca5a5}
.ux-drawer-hero{
  padding:32px 24px 24px;position:relative;
  border-bottom:1.5px solid var(--bdr);
  display:flex;align-items:center;gap:16px;
}
.ux-drawer-dots{
  position:absolute;inset:0;pointer-events:none;
  background-image:radial-gradient(circle,rgba(17,24,39,.04) 1px,transparent 1px);
  background-size:18px 18px;
}
.ux-drawer-hero-info{position:relative;z-index:1}
.ux-drawer-name{font-family:'Fraunces',serif;,sans-serif;font-size:22px;font-weight:800;color:var(--ink);margin-bottom:7px;line-height:1.15}
.ux-drawer-body{padding:20px 22px 36px;flex:1;display:flex;flex-direction:column;gap:16px}
.ux-drawer-fields{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.ux-dfield{background:var(--surf2);border:1.5px solid var(--bdr);border-radius:11px;padding:12px}
.ux-dfield-lbl{display:flex;align-items:center;gap:5px;font-size:10px;font-weight:700;color:var(--ink4);text-transform:uppercase;letter-spacing:.07em;margin-bottom:5px}
.ux-dfield-val{font-size:14px;font-weight:600;color:var(--ink);word-break:break-all}
.ux-drawer-status{padding:12px 14px;background:var(--green-light);border:1.5px solid #a7f3d0;border-radius:11px}
.ux-drawer-actions{display:flex;flex-direction:column;gap:8px;margin-top:auto}
.ux-daction{width:100%;padding:12px;border-radius:11px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px;transition:all .18s;border:1.5px solid transparent}
.ux-daction-del{background:var(--rose-light);color:#991b1b;border-color:#fca5a5}
.ux-daction-del:hover{background:#fca5a5}

/* ── DELETE MODAL ── */
.ux-overlay{position:fixed;inset:0;z-index:1000;background:rgba(17,24,39,.45);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:20px}
.ux-modal{background:#fff;border:1.5px solid var(--bdr);border-radius:22px;padding:30px 26px 24px;width:100%;max-width:400px;position:relative;box-shadow:0 22px 64px rgba(17,24,39,.18);animation:ux-modal .28s cubic-bezier(.22,1,.36,1)}
.ux-modal-x{position:absolute;top:13px;right:13px;width:27px;height:27px;border-radius:50%;border:1.5px solid var(--bdr);background:var(--surf2);color:var(--ink3);display:flex;align-items:center;justify-content:center;cursor:pointer}
.ux-modal-ico{width:56px;height:56px;border-radius:15px;background:var(--rose-light);display:flex;align-items:center;justify-content:center;color:var(--rose);margin:0 auto 16px;box-shadow:0 4px 14px rgba(220,38,38,.14)}
.ux-modal-title{font-family:'Fraunces',serif;,sans-serif;font-size:22px;font-weight:800;color:var(--ink);text-align:center;margin-bottom:9px}
.ux-modal-body{font-size:13.5px;color:var(--ink3);text-align:center;line-height:1.7;margin-bottom:22px}
.ux-modal-body strong{color:var(--ink)}
.ux-modal-row{display:flex;gap:10px}
.ux-mbtn-ghost{flex:1;padding:11px;border-radius:11px;border:1.5px solid var(--bdr2);background:transparent;font-family:inherit;font-size:13px;font-weight:700;color:var(--ink2);cursor:pointer;transition:all .15s}
.ux-mbtn-ghost:hover{background:var(--surf2)}
.ux-mbtn-ghost:disabled{opacity:.4;cursor:not-allowed}
.ux-mbtn-danger{flex:1;padding:11px;border-radius:11px;border:none;background:linear-gradient(135deg,#ef4444,#dc2626);font-family:inherit;font-size:13px;font-weight:800;color:#fff;cursor:pointer;box-shadow:0 3px 14px rgba(220,38,38,.26);transition:all .18s;display:flex;align-items:center;justify-content:center;gap:6px}
.ux-mbtn-danger:hover{transform:translateY(-1px);box-shadow:0 5px 20px rgba(220,38,38,.34)}
.ux-mbtn-danger:disabled{opacity:.5;cursor:not-allowed;transform:none}
.ux-spin{width:12px;height:12px;border-radius:50%;border:2px solid rgba(255,255,255,.35);border-top-color:#fff;animation:ux-spin .7s linear infinite;display:inline-block}

@media(max-width:640px){
  .ux-hero{padding:26px 16px 22px}
  .ux-stats{padding:14px 16px;grid-template-columns:1fr 1fr}
  .ux-toolbar{padding:12px 16px;flex-direction:column;align-items:stretch}
  .ux-search-wrap{max-width:100%}
  .ux-result-bar{padding:8px 16px}
  .ux-table-wrap .ux-th,.ux-table-wrap .ux-td{padding:11px 14px}
  .ux-drawer{max-width:100%}
  .ux-modal-row{flex-direction:column}
  .ux-drawer-fields{grid-template-columns:1fr}
}
`;