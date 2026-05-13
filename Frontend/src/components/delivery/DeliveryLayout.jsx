import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Bike,
  LayoutDashboard,
  Package,
  History,
  Wallet,
  User,
  LogOut,
  Menu as MenuIcon,
  X,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const DeliveryLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isOnline, setIsOnline] = useState(
    localStorage.getItem("deliveryOnline") === "true"
  );

  const location = useLocation();
  const navigate = useNavigate();

  const { logout, user } = useAuth();
  
  const deliveryName = useMemo(
    () => user?.userName || localStorage.getItem("deliveryUserName") || "Delivery Partner",
    [user]
  );

  useEffect(() => {
    localStorage.setItem("deliveryOnline", String(isOnline));
  }, [isOnline]);

  const handleLogout = () => {
    logout();
    localStorage.removeItem("deliveryOnline");
    navigate("/delivery/login");
  };

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/delivery/dashboard" },
    { name: "Active Deliveries", icon: Package, path: "/delivery/deliveries" },
    { name: "History", icon: History, path: "/delivery/history" },
    { name: "Earnings", icon: Wallet, path: "/delivery/earnings" },
    { name: "Profile", icon: User, path: "/delivery/profile" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-gradient-to-b from-indigo-600 via-blue-600 to-cyan-600 text-white transition-all duration-300 fixed h-screen z-30`}
      >
        <div className="p-6">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center shadow-lg">
              <Bike size={24} />
            </div>
            {sidebarOpen && (
              <div>
                <h2 className="font-black text-xl leading-tight">Delivery</h2>
                <p className="text-white/80 text-xs">Partner Portal</p>
              </div>
            )}
          </div>

          {/* Menu */}
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${
                    isActive
                      ? "bg-white/20 backdrop-blur-lg shadow-lg"
                      : "hover:bg-white/10"
                  }`}
                >
                  <Icon size={22} />
                  {sidebarOpen && (
                    <span className="font-semibold">{item.name}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Online toggle */}
          <button
            onClick={() => setIsOnline((v) => !v)}
            className="mt-8 w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-white/10 transition-all"
            title="Availability"
          >
            {isOnline ? <Wifi size={22} /> : <WifiOff size={22} />}
            {sidebarOpen && (
              <span className="font-semibold">
                {isOnline ? "Online" : "Offline"}
              </span>
            )}
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="mt-2 w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-white/10 transition-all"
          >
            <LogOut size={22} />
            {sidebarOpen && <span className="font-semibold">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={`flex-1 ${
          sidebarOpen ? "ml-64" : "ml-20"
        } transition-all duration-300`}
      >
        {/* Top Bar */}
        <header className="bg-white shadow-sm sticky top-0 z-20">
          <div className="px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-xl hover:bg-gray-100 transition"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <X size={24} /> : <MenuIcon size={24} />}
            </button>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-bold text-gray-900">{deliveryName}</p>
                <p className="text-sm text-gray-500">
                  Status:{" "}
                  <span
                    className={`font-semibold ${
                      isOnline ? "text-emerald-600" : "text-gray-500"
                    }`}
                  >
                    {isOnline ? "Online" : "Offline"}
                  </span>
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-cyan-600 rounded-full flex items-center justify-center shadow">
                <Bike className="text-white" size={24} />
              </div>
            </div>
          </div>
        </header>

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default DeliveryLayout;


