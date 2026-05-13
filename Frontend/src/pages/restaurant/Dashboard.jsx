import { useEffect, useState } from "react";
import { 
  ShoppingBag, 
  DollarSign, 
  Clock, 
  XCircle, 
  CheckCircle,
  TrendingUp,
  Users,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Calendar,
  BarChart3,
  PieChart
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";

import axiosInstance from "../../api/axiosInstance";

const REST_API = "/Restaurant";
const ORDER_API = "/Order/restaurant";

const COLORS = ['#f97316', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];

const RestaurantDashboard = () => {
  const [restaurant, setRestaurant] = useState(null);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    todayOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    cancelledOrders: 0,
    completedOrders: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    weeklyRevenue: 0,
    monthlyRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const storedRestaurantId = localStorage.getItem("restaurantId");
    console.log("Dashboard mounted, restaurantID from localStorage:", storedRestaurantId);
    
    if (!storedRestaurantId) {
      console.log("No restaurantId found, redirecting to login");
      navigate("/restaurant/login", { replace: true });
      return;
    }
    
    loadDashboard();
  }, [navigate]);

  const loadDashboard = async () => {
    try {
      const restaurantID = localStorage.getItem("restaurantId");
      
      if (!restaurantID) {
        navigate("/restaurant/login", { replace: true });
        return;
      }
      
      // 1️⃣ Restaurant - use axiosInstance so Authorization header is attached
      const restRes = await axiosInstance.get(REST_API);
      const restaurants = restRes.data;

      if (!Array.isArray(restaurants)) {
        throw new Error("Invalid restaurant data");
      }

      const currentRestaurant = restaurants.find((r) =>
        r.restaurantID === Number(restaurantID) || r.restaurantID === parseInt(restaurantID)
      );

      if (!currentRestaurant) {
        console.error("Restaurant not found for ID:", restaurantID);
        navigate("/restaurant/login", { replace: true });
        return;
      }

      setRestaurant(currentRestaurant);

      // 2️⃣ Orders
      await loadOrders(currentRestaurant.restaurantID);
    } catch (err) {
      console.error("Dashboard error:", err);
      const isAuthError = err.response?.status === 401 || err.message?.toLowerCase().includes('401') || err.message === 'Failed to fetch';
      if (isAuthError) {
        // If unauthorized, redirect to login
        console.warn('Unauthorized - redirecting to login');
        navigate('/login', { replace: true });
        return;
      }
      alert("Error loading dashboard: " + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadOrders = async (id) => {
    try {
      const res = await axiosInstance.get(`${ORDER_API}/${id}`);
      const ordersData = res.data;

      if (!Array.isArray(ordersData)) {
        console.warn("Orders data is not an array:", ordersData);
        setOrders([]);
        setStats({
          todayOrders: 0,
          totalRevenue: 0,
          pendingOrders: 0,
          cancelledOrders: 0,
          completedOrders: 0,
          totalOrders: 0,
          averageOrderValue: 0,
          weeklyRevenue: 0,
          monthlyRevenue: 0,
        });
        return;
      }

      setOrders(ordersData);
      calculateStats(ordersData);
    } catch (error) {
      console.error("Error loading orders:", error);
      if (error.response?.status === 401) {
        navigate('/login', { replace: true });
        return;
      }
      setOrders([]);
      setStats({
        todayOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        cancelledOrders: 0,
        completedOrders: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        weeklyRevenue: 0,
        monthlyRevenue: 0,
      });
    }
  };

  const calculateStats = (ordersData) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);
    
    const thisMonth = new Date();
    thisMonth.setMonth(thisMonth.getMonth() - 1);

    const todayOrders = ordersData.filter((o) => {
      const orderDate = o.orderDate || o.createdAt;
      if (!orderDate) return false;
      const date = new Date(orderDate);
      date.setHours(0, 0, 0, 0);
      return date.getTime() === today.getTime();
    });

    const weeklyOrders = ordersData.filter((o) => {
      const orderDate = o.orderDate || o.createdAt;
      if (!orderDate) return false;
      return new Date(orderDate) >= thisWeek;
    });

    const monthlyOrders = ordersData.filter((o) => {
      const orderDate = o.orderDate || o.createdAt;
      if (!orderDate) return false;
      return new Date(orderDate) >= thisMonth;
    });

    const todayRevenue = todayOrders.reduce(
      (sum, o) => sum + (parseFloat(o.totalAmount) || 0),
      0
    );

    const weeklyRevenue = weeklyOrders.reduce(
      (sum, o) => sum + (parseFloat(o.totalAmount) || 0),
      0
    );

    const monthlyRevenue = monthlyOrders.reduce(
      (sum, o) => sum + (parseFloat(o.totalAmount) || 0),
      0
    );

    const totalRevenue = ordersData.reduce(
      (sum, o) => sum + (parseFloat(o.totalAmount) || 0),
      0
    );

    const completedOrders = ordersData.filter(
      (o) => o.orderStatus === "Completed"
    ).length;

    const averageOrderValue = ordersData.length > 0 
      ? totalRevenue / ordersData.length 
      : 0;

    setStats({
      todayOrders: todayOrders.length,
      totalRevenue: todayRevenue,
      pendingOrders: ordersData.filter((o) => o.orderStatus === "Pending").length,
      cancelledOrders: ordersData.filter((o) => o.orderStatus === "Cancelled").length,
      completedOrders,
      totalOrders: ordersData.length,
      averageOrderValue,
      weeklyRevenue,
      monthlyRevenue,
    });
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  // Prepare chart data
  const getDailyRevenueData = () => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const dayOrders = orders.filter((o) => {
        const orderDate = o.orderDate || o.createdAt;
        if (!orderDate) return false;
        const orderDateObj = new Date(orderDate);
        orderDateObj.setHours(0, 0, 0, 0);
        return orderDateObj.getTime() === date.getTime();
      });

      const revenue = dayOrders.reduce(
        (sum, o) => sum + (parseFloat(o.totalAmount) || 0),
        0
      );

      last7Days.push({
        name: date.toLocaleDateString('en-US', { weekday: 'short' }),
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: revenue,
        orders: dayOrders.length,
      });
    }
    return last7Days;
  };

  const getOrderStatusData = () => {
    const statusCounts = {
      Pending: 0,
      Confirmed: 0,
      Completed: 0,
      Cancelled: 0,
    };

    orders.forEach((order) => {
      const status = order.orderStatus || "Pending";
      if (statusCounts.hasOwnProperty(status)) {
        statusCounts[status]++;
      }
    });

    return Object.entries(statusCounts)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));
  };

  const getRecentOrders = () => {
    return orders
      .sort((a, b) => {
        const dateA = new Date(a.orderDate || a.createdAt || 0);
        const dateB = new Date(b.orderDate || b.createdAt || 0);
        return dateB - dateA;
      })
      .slice(0, 5);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 font-semibold text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const dailyData = getDailyRevenueData();
  const statusData = getOrderStatusData();
  const recentOrders = getRecentOrders();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-gray-900 mb-2">
            Welcome back, {restaurant?.name || restaurant?.restaurantName || "Restaurant"} 👋
          </h1>
          <div className="flex items-center gap-3 flex-wrap">
            {restaurant?.userName && (
              <div className="flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-xl">
                <Users size={18} className="text-orange-600" />
                <span className="font-bold text-orange-700">Owner: {restaurant.userName}</span>
              </div>
            )}
            <p className="text-gray-600 text-lg">
              Here's what's happening with your restaurant today
            </p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition disabled:opacity-50"
        >
          <RefreshCw size={20} className={refreshing ? "animate-spin" : ""} />
          <span className="font-semibold">Refresh</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Today's Revenue"
          value={`₹${stats.totalRevenue.toFixed(2)}`}
          icon={<DollarSign />}
          trend={stats.weeklyRevenue > 0 ? ((stats.totalRevenue / stats.weeklyRevenue) * 100).toFixed(1) : "0"}
          trendLabel="of weekly"
          color="from-green-500 to-emerald-600"
          bgColor="bg-green-50"
          iconColor="text-green-600"
        />
        <StatCard
          title="Today's Orders"
          value={stats.todayOrders}
          icon={<ShoppingBag />}
          trend={stats.totalOrders > 0 ? ((stats.todayOrders / stats.totalOrders) * 100).toFixed(1) : "0"}
          trendLabel="of total"
          color="from-blue-500 to-cyan-600"
          bgColor="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          title="Pending Orders"
          value={stats.pendingOrders}
          icon={<Clock />}
          trend={stats.totalOrders > 0 ? ((stats.pendingOrders / stats.totalOrders) * 100).toFixed(1) : "0"}
          trendLabel="of total"
          color="from-yellow-500 to-orange-600"
          bgColor="bg-yellow-50"
          iconColor="text-yellow-600"
        />
        <StatCard
          title="Completed Orders"
          value={stats.completedOrders}
          icon={<CheckCircle />}
          trend={stats.totalOrders > 0 ? ((stats.completedOrders / stats.totalOrders) * 100).toFixed(1) : "0"}
          trendLabel="of total"
          color="from-purple-500 to-pink-600"
          bgColor="bg-purple-50"
          iconColor="text-purple-600"
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp size={32} />
            <span className="text-indigo-200 text-sm font-semibold">Weekly Revenue</span>
          </div>
          <p className="text-3xl font-black mb-1">₹{stats.weeklyRevenue.toFixed(2)}</p>
          <p className="text-indigo-200 text-sm">Last 7 days</p>
        </div>
        <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <BarChart3 size={32} />
            <span className="text-rose-200 text-sm font-semibold">Monthly Revenue</span>
          </div>
          <p className="text-3xl font-black mb-1">₹{stats.monthlyRevenue.toFixed(2)}</p>
          <p className="text-rose-200 text-sm">Last 30 days</p>
        </div>
        <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <Package size={32} />
            <span className="text-teal-200 text-sm font-semibold">Avg Order Value</span>
          </div>
          <p className="text-3xl font-black mb-1">₹{stats.averageOrderValue.toFixed(2)}</p>
          <p className="text-teal-200 text-sm">Per order</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-black text-gray-900 mb-1">Revenue Trend</h3>
              <p className="text-gray-600 text-sm">Last 7 days performance</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-white" size={24} />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dailyData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#f97316" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Order Status Pie Chart */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-black text-gray-900 mb-1">Order Status</h3>
              <p className="text-gray-600 text-sm">Current distribution</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <PieChart className="text-white" size={24} />
            </div>
          </div>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              <p>No order data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Orders Chart */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-black text-gray-900 mb-1">Daily Orders</h3>
            <p className="text-gray-600 text-sm">Order count over last 7 days</p>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
            <BarChart3 className="text-white" size={24} />
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
            />
            <Bar dataKey="orders" fill="#10b981" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Orders & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-black text-gray-900 mb-1">Recent Orders</h3>
              <p className="text-gray-600 text-sm">Latest 5 orders</p>
            </div>
            <Link 
              to="/restaurant/orders"
              className="text-orange-600 hover:text-orange-700 font-semibold text-sm flex items-center gap-1"
            >
              View All
              <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="space-y-3">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div
                  key={order.orderID}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      order.orderStatus === "Completed" ? "bg-green-100" :
                      order.orderStatus === "Pending" ? "bg-yellow-100" :
                      order.orderStatus === "Cancelled" ? "bg-red-100" :
                      "bg-blue-100"
                    }`}>
                      <Package className={
                        order.orderStatus === "Completed" ? "text-green-600" :
                        order.orderStatus === "Pending" ? "text-yellow-600" :
                        order.orderStatus === "Cancelled" ? "text-red-600" :
                        "text-blue-600"
                      } size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Order #{order.orderID}</p>
                      <p className="text-sm text-gray-600">
                        {order.userName || "Guest"} • {new Date(order.orderDate || order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-gray-900">₹{parseFloat(order.totalAmount || 0).toFixed(2)}</p>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      order.orderStatus === "Completed" ? "bg-green-100 text-green-700" :
                      order.orderStatus === "Pending" ? "bg-yellow-100 text-yellow-700" :
                      order.orderStatus === "Cancelled" ? "bg-red-100 text-red-700" :
                      "bg-blue-100 text-blue-700"
                    }`}>
                      {order.orderStatus}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-400">
                <ShoppingBag size={48} className="mx-auto mb-3 opacity-50" />
                <p>No recent orders</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-xl p-6 text-white">
          <h3 className="text-xl font-black mb-6">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              to="/restaurant/orders"
              className="flex items-center gap-3 p-4 bg-white/20 backdrop-blur-lg rounded-xl hover:bg-white/30 transition"
            >
              <ShoppingBag size={20} />
              <span className="font-semibold">Manage Orders</span>
            </Link>
            <Link
              to="/restaurant/menu"
              className="flex items-center gap-3 p-4 bg-white/20 backdrop-blur-lg rounded-xl hover:bg-white/30 transition"
            >
              <Package size={20} />
              <span className="font-semibold">Menu Management</span>
            </Link>
            <div className="pt-4 border-t border-white/20">
              <div className="flex items-center gap-2 text-orange-100 text-sm mb-2">
                <Calendar size={16} />
                <span>Total Orders</span>
              </div>
              <p className="text-3xl font-black">{stats.totalOrders}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, trend, trendLabel, color, bgColor, iconColor }) => (
  <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
    <div className="flex items-center justify-between mb-4">
      <div className={`w-14 h-14 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center shadow-lg`}>
        <div className="text-white">{icon}</div>
      </div>
      <div className={`px-3 py-1 rounded-full ${bgColor} text-xs font-bold ${iconColor}`}>
        {trend}% {trendLabel}
      </div>
    </div>
    <p className="text-gray-600 text-sm font-semibold mb-1">{title}</p>
    <p className="text-3xl font-black text-gray-900">{value}</p>
  </div>
);

export default RestaurantDashboard;


// import { useState, useEffect, useRef } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import {
//   ShoppingBag, DollarSign, Clock, CheckCircle2,
//   TrendingUp, Users, Package, ArrowUpRight,
//   RefreshCw, Calendar, BarChart3, PieChart,
//   Store, ChevronRight, Utensils, LayoutGrid,
//   Wifi, WifiOff, Star, MapPin, LogOut,
//   ToggleLeft, ToggleRight, Bell, Settings,
//   AlertCircle, X, CheckCircle, Eye,
// } from "lucide-react";
// import {
//   AreaChart, Area, BarChart, Bar,
//   PieChart as RechartsPie, Pie, Cell,
//   XAxis, YAxis, CartesianGrid, Tooltip,
//   ResponsiveContainer,
// } from "recharts";
// import axiosInstance from "../../api/axiosInstance";
// import { useAuth } from "../../contexts/AuthContext";

// /* ─── Toast ─── */
// const useToast = () => {
//   const [toasts, setToasts] = useState([]);
//   const add = (msg, type = "success") => {
//     const id = Date.now();
//     setToasts(p => [...p, { id, msg, type }]);
//     setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
//   };
//   return { toasts, success: m => add(m, "success"), error: m => add(m, "error"), info: m => add(m, "info") };
// };

// const ToastContainer = ({ toasts }) => (
//   <div style={{ position: "fixed", bottom: 28, right: 28, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8 }}>
//     {toasts.map(t => (
//       <div key={t.id} className={`rd-toast rd-toast-${t.type}`}>
//         {t.type === "success" && <CheckCircle size={15} />}
//         {t.type === "error" && <AlertCircle size={15} />}
//         {t.type === "info" && <Eye size={15} />}
//         <span>{t.msg}</span>
//       </div>
//     ))}
//   </div>
// );

// /* ─── Constants ─── */
// const REST_API  = "/Restaurant";
// const ORDER_API = "/Order/restaurant";

// const STATUS_META = {
//   Completed: { color: "#22c55e", bg: "#f0fdf4", border: "#bbf7d0" },
//   Pending:   { color: "#f59e0b", bg: "#fffbeb", border: "#fde68a" },
//   Cancelled: { color: "#ef4444", bg: "#fef2f2", border: "#fecaca" },
//   Confirmed: { color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe" },
// };
// const PIE_COLORS = ["#22c55e", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6"];

// const COVERS = [
//   "linear-gradient(135deg,#f97316,#ea580c)",
//   "linear-gradient(135deg,#fb923c,#c2410c)",
//   "linear-gradient(135deg,#f59e0b,#d97706)",
//   "linear-gradient(135deg,#10b981,#059669)",
//   "linear-gradient(135deg,#8b5cf6,#7c3aed)",
// ];

// /* ─── Custom Tooltip ─── */
// const CustomTip = ({ active, payload, label, prefix = "" }) => {
//   if (!active || !payload?.length) return null;
//   return (
//     <div style={{ background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "9px 13px", fontSize: 12, fontWeight: 700, fontFamily: "Outfit, sans-serif", boxShadow: "0 4px 16px rgba(0,0,0,.08)" }}>
//       <p style={{ color: "#6b7280", marginBottom: 4 }}>{label}</p>
//       {payload.map((p, i) => (
//         <p key={i} style={{ color: p.color || "#f97316" }}>
//           {p.name}: {prefix}{typeof p.value === "number" ? p.value.toFixed(p.name === "orders" ? 0 : 2) : p.value}
//         </p>
//       ))}
//     </div>
//   );
// };

// /* ─── Main Component ─── */
// const RestaurantDashboard = () => {
//   const [restaurant, setRestaurant] = useState(null);
//   const [orders,     setOrders]     = useState([]);
//   const [stats,      setStats]      = useState({
//     todayOrders: 0, totalRevenue: 0, pendingOrders: 0,
//     cancelledOrders: 0, completedOrders: 0, totalOrders: 0,
//     averageOrderValue: 0, weeklyRevenue: 0, monthlyRevenue: 0,
//   });
//   const [loading,    setLoading]    = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [activeNav,  setActiveNav]  = useState("dashboard");

//   const navigate       = useNavigate();
//   const { user, logout } = useAuth();
//   const toast          = useToast();

//   const userName = user?.name ?? user?.email?.split("@")[0] ?? "Owner";

//   useEffect(() => {
//     if (!localStorage.getItem("restaurantId")) {
//       navigate("/restaurant/login", { replace: true }); return;
//     }
//     loadDashboard();
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const loadDashboard = async () => {
//     try {
//       const restaurantID = localStorage.getItem("restaurantId");
//       if (!restaurantID) { navigate("/restaurant/login", { replace: true }); return; }
//       const restRes = await axiosInstance.get(REST_API);
//       const restaurants = restRes.data;
//       if (!Array.isArray(restaurants)) throw new Error("Invalid restaurant data");
//       const current = restaurants.find(r =>
//         r.restaurantID === Number(restaurantID) || r.restaurantID === parseInt(restaurantID)
//       );
//       if (!current) { navigate("/restaurant/login", { replace: true }); return; }
//       setRestaurant(current);
//       await loadOrders(current.restaurantID);
//     } catch (err) {
//       if (err.response?.status === 401) { navigate("/login", { replace: true }); return; }
//       toast.error("Error loading dashboard: " + (err.message || "Unknown error"));
//     } finally { setLoading(false); setRefreshing(false); }
//   };

//   const loadOrders = async (id) => {
//     try {
//       const res  = await axiosInstance.get(`${ORDER_API}/${id}`);
//       const data = res.data;
//       if (!Array.isArray(data)) { setOrders([]); return; }
//       setOrders(data);
//       calculateStats(data);
//     } catch (err) {
//       if (err.response?.status === 401) navigate("/login", { replace: true });
//       setOrders([]);
//     }
//   };

//   const calculateStats = (data) => {
//     const now   = new Date(); now.setHours(0, 0, 0, 0);
//     const week  = new Date(); week.setDate(week.getDate() - 7);
//     const month = new Date(); month.setMonth(month.getMonth() - 1);
//     const inDay   = o => { const dt = o.orderDate || o.createdAt; if (!dt) return false; const c = new Date(dt); c.setHours(0,0,0,0); return c.getTime() === now.getTime(); };
//     const inRange = (o, from) => { const dt = o.orderDate || o.createdAt; if (!dt) return false; return new Date(dt) >= from; };
//     const sum = arr => arr.reduce((s, o) => s + (parseFloat(o.totalAmount) || 0), 0);
//     const todayList = data.filter(inDay);
//     const weekList  = data.filter(o => inRange(o, week));
//     const monthList = data.filter(o => inRange(o, month));
//     setStats({
//       todayOrders:      todayList.length,
//       totalRevenue:     sum(todayList),
//       weeklyRevenue:    sum(weekList),
//       monthlyRevenue:   sum(monthList),
//       pendingOrders:    data.filter(o => o.orderStatus === "Pending").length,
//       cancelledOrders:  data.filter(o => o.orderStatus === "Cancelled").length,
//       completedOrders:  data.filter(o => o.orderStatus === "Completed").length,
//       totalOrders:      data.length,
//       averageOrderValue: data.length > 0 ? sum(data) / data.length : 0,
//     });
//   };

//   const getDailyData = () => Array.from({ length: 7 }, (_, i) => {
//     const d = new Date(); d.setDate(d.getDate() - (6 - i)); d.setHours(0, 0, 0, 0);
//     const dayOrders = orders.filter(o => {
//       const dt = o.orderDate || o.createdAt; if (!dt) return false;
//       const c = new Date(dt); c.setHours(0, 0, 0, 0);
//       return c.getTime() === d.getTime();
//     });
//     return {
//       name:    d.toLocaleDateString("en-US", { weekday: "short" }),
//       revenue: dayOrders.reduce((s, o) => s + (parseFloat(o.totalAmount) || 0), 0),
//       orders:  dayOrders.length,
//     };
//   });

//   const getStatusData = () => {
//     const counts = { Pending: 0, Confirmed: 0, Completed: 0, Cancelled: 0 };
//     orders.forEach(o => { if (counts[o.orderStatus] !== undefined) counts[o.orderStatus]++; });
//     return Object.entries(counts).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));
//   };

//   const recentOrders = [...orders]
//     .sort((a, b) => new Date(b.orderDate || b.createdAt || 0) - new Date(a.orderDate || a.createdAt || 0))
//     .slice(0, 5);

//   const handleLogout = () => {
//     if (logout) logout(); else { localStorage.clear(); sessionStorage.clear(); }
//     navigate("/login", { replace: true });
//   };

//   /* ── Loading ── */
//   if (loading) return (
//     <>
//       <style>{CSS}</style>
//       <div className="rd-splash">
//         <div className="rd-splash-inner">
//           <div className="rd-splash-ring" />
//           <span className="rd-splash-emoji">🍽️</span>
//         </div>
//         <p className="rd-splash-label">Loading your dashboard…</p>
//         <div className="rd-splash-track"><div className="rd-splash-bar" /></div>
//       </div>
//     </>
//   );

//   const rName      = restaurant?.name || restaurant?.restaurantName || "Restaurant";
//   const dailyData  = getDailyData();
//   const statusData = getStatusData();
//   const openCount  = stats.totalOrders;

//   /* ── NAV ITEMS ── */
//   const navItems = [
//     { key: "dashboard", icon: <LayoutGrid size={16} />, label: "Dashboard",        to: "/restaurant/dashboard" },
//     { key: "orders",    icon: <ShoppingBag size={16} />, label: "Orders",          to: "/restaurant/orders",   badge: stats.pendingOrders || null },
//     { key: "menu",      icon: <Utensils size={16} />,   label: "Menu Management",  to: "/restaurant/menu" },
//     { key: "profile",   icon: <Store size={16} />,      label: "Restaurant Profile", to: "/restaurant/profile" },
//   ];

//   return (
//     <>
//       <style>{CSS}</style>
//       <ToastContainer toasts={toast.toasts} />

//       <div className="rd-root">

//         {/* ═══ MAIN ═══ */}
//         <main className="rd-main">

//           {/* ── Topbar ── */}
//           <div className="rd-topbar">
//             <div> 
//               <h1 className="rd-page-title">Dashboard</h1>
//               <p className="rd-page-sub">
//                 {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
//               </p>
//             </div>
//             <div className="rd-topbar-right">
//               <div className="rd-date-chip">
//                 <Calendar size={13} />
//                 Today: <strong>{stats.todayOrders}</strong> orders
//               </div>
//               <button
//                 className="rd-refresh-btn"
//                 onClick={() => { setRefreshing(true); loadDashboard(); }}
//                 disabled={refreshing}
//               >
//                 <RefreshCw size={14} className={refreshing ? "rd-spin" : ""} />
//                 {refreshing ? "Refreshing…" : "Refresh"}
//               </button>
//             </div>
//           </div>

//           {/* ── KPI STAT CARDS ── */}
//           <div className="rd-stat-grid">
//             {[
//               {
//                 label: "Today's Revenue", value: `₹${stats.totalRevenue.toFixed(2)}`,
//                 sub: `${stats.todayOrders} orders placed today`,
//                 icon: <DollarSign size={22} />, accent: "#f97316", bg: "#fff7ed", ibg: "#fff7ed",
//               },
//               {
//                 label: "Pending Orders", value: stats.pendingOrders,
//                 sub: `${stats.totalOrders > 0 ? ((stats.pendingOrders / stats.totalOrders) * 100).toFixed(0) : 0}% of all orders`,
//                 icon: <Clock size={22} />, accent: "#f59e0b", bg: "#fffbeb", ibg: "#fffbeb",
//               },
//               {
//                 label: "Completed", value: stats.completedOrders,
//                 sub: `${stats.totalOrders > 0 ? ((stats.completedOrders / stats.totalOrders) * 100).toFixed(0) : 0}% success rate`,
//                 icon: <CheckCircle2 size={22} />, accent: "#22c55e", bg: "#f0fdf4", ibg: "#f0fdf4",
//               },
//               {
//                 label: "Avg Order Value", value: `₹${stats.averageOrderValue.toFixed(0)}`,
//                 sub: "Per order — all time",
//                 icon: <TrendingUp size={22} />, accent: "#8b5cf6", bg: "#f5f3ff", ibg: "#f5f3ff",
//               },
//             ].map((c, i) => (
//               <div key={i} className="rd-stat-card" style={{ animationDelay: `${i * 60}ms` }}>
//                 <div className="rd-stat-icon" style={{ background: c.ibg, color: c.accent }}>{c.icon}</div>
//                 <p className="rd-stat-label">{c.label}</p>
//                 <p className="rd-stat-value" style={{ color: c.accent }}>{c.value}</p>
//                 <p className="rd-stat-sub">{c.sub}</p>
//                 <div className="rd-stat-bar" style={{ background: c.accent }} />
//               </div>
//             ))}
//           </div>

//           {/* ── REVENUE STRIP ── */}
//           <div className="rd-rev-strip">
//             {[
//               { label: "Weekly Revenue",  val: `₹${stats.weeklyRevenue.toFixed(2)}`,  sub: "Last 7 days",  color: "#f97316" },
//               { label: "Monthly Revenue", val: `₹${stats.monthlyRevenue.toFixed(2)}`, sub: "Last 30 days", color: "#ea580c" },
//               { label: "Total Orders",    val: stats.totalOrders,                      sub: "All time",     color: "#8b5cf6" },
//               { label: "Cancelled",       val: stats.cancelledOrders,                  sub: "All time",     color: "#ef4444" },
//             ].map((b, i) => (
//               <div key={i} className="rd-rev-item" style={{ borderTopColor: b.color }}>
//                 <p className="rd-rev-label">{b.label}</p>
//                 <p className="rd-rev-val" style={{ color: b.color }}>{b.val}</p>
//                 <p className="rd-rev-sub">{b.sub}</p>
//               </div>
//             ))}
//           </div>

//           {/* ── CHARTS ROW ── */}
//           <div className="rd-charts-row">

//             {/* Area chart */}
//             <div className="rd-chart-card rd-chart-wide">
//               <div className="rd-chart-head">
//                 <div>
//                   <h3 className="rd-chart-title">Revenue Trend</h3>
//                   <p className="rd-chart-sub">Last 7 days · ₹</p>
//                 </div>
//                 <div className="rd-chart-badge" style={{ background: "#fff7ed", color: "#f97316" }}>
//                   <TrendingUp size={18} />
//                 </div>
//               </div>
//               <ResponsiveContainer width="100%" height={230}>
//                 <AreaChart data={dailyData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
//                   <defs>
//                     <linearGradient id="rdRevGrad" x1="0" y1="0" x2="0" y2="1">
//                       <stop offset="5%"  stopColor="#f97316" stopOpacity={0.22} />
//                       <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
//                     </linearGradient>
//                   </defs>
//                   <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
//                   <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9ca3af", fontFamily: "Outfit", fontWeight: 600 }} axisLine={false} tickLine={false} />
//                   <YAxis tick={{ fontSize: 11, fill: "#9ca3af", fontFamily: "Outfit" }} axisLine={false} tickLine={false} />
//                   <Tooltip content={<CustomTip prefix="₹" />} />
//                   <Area type="monotone" dataKey="revenue" name="revenue" stroke="#f97316" strokeWidth={2.5} fill="url(#rdRevGrad)" dot={{ fill: "#f97316", r: 3, strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 5, fill: "#f97316" }} />
//                 </AreaChart>
//               </ResponsiveContainer>
//             </div>

//             {/* Bar chart */}
//             <div className="rd-chart-card">
//               <div className="rd-chart-head">
//                 <div>
//                   <h3 className="rd-chart-title">Daily Orders</h3>
//                   <p className="rd-chart-sub">This week</p>
//                 </div>
//                 <div className="rd-chart-badge" style={{ background: "#f0fdf4", color: "#22c55e" }}>
//                   <BarChart3 size={18} />
//                 </div>
//               </div>
//               <ResponsiveContainer width="100%" height={230}>
//                 <BarChart data={dailyData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
//                   <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
//                   <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9ca3af", fontFamily: "Outfit", fontWeight: 600 }} axisLine={false} tickLine={false} />
//                   <YAxis tick={{ fontSize: 11, fill: "#9ca3af", fontFamily: "Outfit" }} axisLine={false} tickLine={false} />
//                   <Tooltip content={<CustomTip />} />
//                   <Bar dataKey="orders" name="orders" fill="#f97316" radius={[7, 7, 0, 0]} />
//                 </BarChart>
//               </ResponsiveContainer>
//             </div>

//             {/* Pie */}
//             <div className="rd-chart-card rd-chart-narrow">
//               <div className="rd-chart-head">
//                 <div>
//                   <h3 className="rd-chart-title">Order Status</h3>
//                   <p className="rd-chart-sub">Breakdown</p>
//                 </div>
//                 <div className="rd-chart-badge" style={{ background: "#eff6ff", color: "#3b82f6" }}>
//                   <PieChart size={18} />
//                 </div>
//               </div>
//               {statusData.length > 0 ? (
//                 <>
//                   <ResponsiveContainer width="100%" height={160}>
//                     <RechartsPie>
//                       <Pie data={statusData} cx="50%" cy="50%" innerRadius={44} outerRadius={70} dataKey="value" paddingAngle={3}>
//                         {statusData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
//                       </Pie>
//                       <Tooltip content={<CustomTip />} />
//                     </RechartsPie>
//                   </ResponsiveContainer>
//                   <div className="rd-pie-legend">
//                     {statusData.map((s, i) => (
//                       <div key={i} className="rd-pie-row">
//                         <span className="rd-pie-dot" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
//                         <span className="rd-pie-name">{s.name}</span>
//                         <span className="rd-pie-val">{s.value}</span>
//                       </div>
//                     ))}
//                   </div>
//                 </>
//               ) : (
//                 <div className="rd-chart-empty"><Package size={32} /><p>No orders yet</p></div>
//               )}
//             </div>
//           </div>

//           {/* ── BOTTOM ROW ── */}
//           <div className="rd-bottom-row">

//             {/* Recent Orders */}
//             <div className="rd-section-card rd-orders-card">
//               <div className="rd-section-head">
//                 <div>
//                   <h3 className="rd-section-title">Recent Orders</h3>
//                   <p className="rd-section-sub">Latest 5 transactions</p>
//                 </div>
//                 <Link to="/restaurant/orders" className="rd-view-all">
//                   View All <ArrowUpRight size={14} />
//                 </Link>
//               </div>
//               <div className="rd-orders-list">
//                 {recentOrders.length > 0 ? recentOrders.map((order, idx) => {
//                   const meta = STATUS_META[order.orderStatus] || STATUS_META.Confirmed;
//                   return (
//                     <div key={order.orderID} className="rd-order-row" style={{ animationDelay: `${idx * 50}ms` }}>
//                       <div className="rd-order-icon" style={{ background: meta.bg, color: meta.color }}>
//                         <Package size={18} />
//                       </div>
//                       <div className="rd-order-info">
//                         <p className="rd-order-id">Order #{order.orderID}</p>
//                         <p className="rd-order-meta">
//                           {order.userName || "Guest"} · {new Date(order.orderDate || order.createdAt).toLocaleDateString("en-IN")}
//                         </p>
//                       </div>
//                       <div className="rd-order-right">
//                         <p className="rd-order-amt">₹{parseFloat(order.totalAmount || 0).toFixed(2)}</p>
//                         <span
//                           className="rd-order-badge"
//                           style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}
//                         >
//                           {order.orderStatus}
//                         </span>
//                       </div>
//                     </div>
//                   );
//                 }) : (
//                   <div className="rd-empty-orders">
//                     <ShoppingBag size={38} />
//                     <p>No orders yet</p>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Quick Actions */}
//             <div className="rd-section-card rd-quick-card">
//               <h3 className="rd-section-title" style={{ marginBottom: 4 }}>Quick Actions</h3>
//               <p className="rd-section-sub" style={{ marginBottom: 18 }}>Jump to what you need</p>
//               <div className="rd-quick-list">
//                 {[
//                   { to: "/restaurant/orders",  label: "Manage Orders",      sub: "View & update orders",  icon: <ShoppingBag size={20} />, color: "#f97316", bg: "#fff7ed" },
//                   { to: "/restaurant/menu",    label: "Menu Management",    sub: "Edit your food items",  icon: <Utensils size={20} />,    color: "#22c55e", bg: "#f0fdf4" },
//                   { to: "/restaurant/profile", label: "Restaurant Profile", sub: "Update your info",      icon: <Store size={20} />,       color: "#3b82f6", bg: "#eff6ff" },
//                   { to: "/restaurant/select",  label: "Switch Restaurant",  sub: "Go to another venue",   icon: <LayoutGrid size={20} />,  color: "#8b5cf6", bg: "#f5f3ff" },
//                 ].map((item, i) => (
//                   <Link key={i} to={item.to} className="rd-quick-item">
//                     <div className="rd-quick-icon" style={{ background: item.bg, color: item.color }}>{item.icon}</div>
//                     <div className="rd-quick-text">
//                       <span className="rd-quick-label">{item.label}</span>
//                       <span className="rd-quick-sub">{item.sub}</span>
//                     </div>
//                     <ChevronRight size={16} className="rd-quick-arrow" />
//                   </Link>
//                 ))}
//               </div>

//               {/* Mini summary */}
//               <div className="rd-mini-summary">
//                 <div className="rd-mini-item">
//                   <span className="rd-mini-val" style={{ color: "#f97316" }}>{stats.totalOrders}</span>
//                   <span className="rd-mini-lbl">Total</span>
//                 </div>
//                 <div className="rd-mini-sep" />
//                 <div className="rd-mini-item">
//                   <span className="rd-mini-val" style={{ color: "#22c55e" }}>{stats.completedOrders}</span>
//                   <span className="rd-mini-lbl">Done</span>
//                 </div>
//                 <div className="rd-mini-sep" />
//                 <div className="rd-mini-item">
//                   <span className="rd-mini-val" style={{ color: "#ef4444" }}>{stats.cancelledOrders}</span>
//                   <span className="rd-mini-lbl">Cancelled</span>
//                 </div>
//               </div>
//             </div>

//           </div>
//         </main>
//       </div>
//     </>
//   );
// };

// /* ════════════════════════════════════════════
//    CSS  — matches RestaurantSelect orange theme
// ═════════════════════════════════════════════ */
// const CSS = `
// @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

// *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

// :root{
//   --or:     #f97316;
//   --or-d:   #ea580c;
//   --or-dd:  #c2410c;
//   --or-p:   #fff7ed;
//   --or-s:   #fed7aa;
//   --ink:    #111827;
//   --ink2:   #374151;
//   --ink3:   #6b7280;
//   --ink4:   #9ca3af;
//   --bg:     #f9fafb;
//   --surf:   #ffffff;
//   --bdr:    #e5e7eb;
//   --bdr2:   #f3f4f6;
//   --sw:     252px;
//   --sh:     0 1px 3px rgba(0,0,0,.06),0 4px 14px rgba(0,0,0,.06);
//   --sh-h:   0 8px 28px rgba(249,115,22,.13),0 2px 8px rgba(0,0,0,.06);
//   font-family:'Outfit',sans-serif;
// }

// html,body{height:100%;background:var(--bg);color:var(--ink)}

// /* Spin */
// .rd-spin{animation:_sp .8s linear infinite}
// @keyframes _sp{to{transform:rotate(360deg)}}

// /* Toast */
// .rd-toast{display:flex;align-items:center;gap:8px;padding:10px 15px;border-radius:11px;min-width:210px;font-size:13px;font-weight:600;box-shadow:0 6px 22px rgba(0,0,0,.10);animation:_tsl .28s cubic-bezier(.22,1,.36,1);background:var(--surf)}
// .rd-toast-success{border:1.5px solid #bbf7d0;color:#166534}
// .rd-toast-error  {border:1.5px solid #fca5a5;color:#991b1b}
// .rd-toast-info   {border:1.5px solid #93c5fd;color:#1e40af}
// @keyframes _tsl{from{opacity:0;transform:translateX(18px)}}

// /* Splash */
// .rd-splash{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;background:var(--bg)}
// .rd-splash-inner{position:relative;width:68px;height:68px;display:flex;align-items:center;justify-content:center}
// .rd-splash-ring{position:absolute;inset:0;border-radius:50%;border:3px solid var(--or-s);border-top-color:var(--or);animation:_sp .9s linear infinite}
// .rd-splash-emoji{font-size:26px}
// .rd-splash-label{font-size:13px;font-weight:600;color:var(--ink3)}
// .rd-splash-track{width:160px;height:3px;background:var(--bdr);border-radius:3px;overflow:hidden}
// .rd-splash-bar{height:100%;width:40%;background:var(--or);border-radius:3px;animation:_sw 1.4s ease-in-out infinite}
// @keyframes _sw{0%{transform:translateX(-200%)}100%{transform:translateX(400%)}}

// /* ── Root ── */
// .rd-root{display:flex;min-height:100vh}

// /* ── Sidebar ── */
// .rd-sidebar{
//   width:var(--sw);position:fixed;top:0;left:0;height:100vh;
//   background:var(--surf);border-right:1.5px solid var(--bdr);
//   display:flex;flex-direction:column;z-index:50;overflow-y:auto;
// }

// /* Brand */
// .rd-brand{display:flex;align-items:center;gap:11px;padding:20px 16px 14px;border-bottom:1.5px solid var(--bdr)}
// .rd-brand-mark{width:38px;height:38px;border-radius:11px;flex-shrink:0;background:linear-gradient(135deg,var(--or),var(--or-d));display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 4px 10px rgba(249,115,22,.24)}
// .rd-brand-name{display:block;font-size:16px;font-weight:800;color:var(--ink)}
// .rd-brand-tag {display:block;font-size:9px;font-weight:600;color:var(--ink4);letter-spacing:.08em;text-transform:uppercase}

// /* Restaurant card */
// .rd-rest-card{margin:12px 12px 4px;padding:12px;background:var(--or-p);border:1.5px solid var(--or-s);border-radius:14px}
// .rd-rest-avatar{width:100%;height:70px;border-radius:10px;overflow:hidden;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,var(--or),var(--or-d));margin-bottom:10px}
// .rd-rest-avatar img{width:100%;height:100%;object-fit:cover}
// .rd-rest-info{}
// .rd-rest-name{font-size:13px;font-weight:800;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:3px}
// .rd-rest-city{display:flex;align-items:center;gap:3px;font-size:10px;color:var(--ink3);margin-bottom:6px}
// .rd-rest-pill{display:inline-flex;align-items:center;gap:4px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;padding:3px 8px;border-radius:6px}
// .rd-rest-open  {background:#f0fdf4;color:#15803d;border:1px solid #bbf7d0}
// .rd-rest-closed{background:var(--bdr2);color:var(--ink3);border:1px solid var(--bdr)}

// /* Nav */
// .rd-nav{flex:1;padding:12px 10px 4px}
// .rd-nav-heading{font-size:9px;font-weight:700;color:var(--ink4);letter-spacing:.12em;text-transform:uppercase;padding:0 8px 8px}
// .rd-nav-item{display:flex;align-items:center;gap:9px;padding:9px 10px;border-radius:10px;font-size:13px;font-weight:600;color:var(--ink2);cursor:pointer;text-decoration:none;transition:all .15s;margin-bottom:2px}
// .rd-nav-item:hover{background:var(--bdr2);color:var(--ink)}
// .rd-nav-active{background:var(--or-p);color:var(--or-dd);border-left:3px solid var(--or)}
// .rd-nav-icon{width:28px;height:28px;border-radius:8px;background:rgba(249,115,22,.1);color:var(--or);display:flex;align-items:center;justify-content:center;flex-shrink:0}
// .rd-nav-label{flex:1}
// .rd-nav-badge{background:var(--or);color:#fff;font-size:10px;font-weight:700;padding:1px 7px;border-radius:100px}

// /* Chips */
// .rd-sb-chips{display:flex;align-items:center;justify-content:space-around;margin:8px 12px 10px;padding:11px 10px;background:var(--bg);border:1.5px solid var(--bdr);border-radius:11px}
// .rd-sb-chip{text-align:center}
// .rd-chip-val{display:block;font-size:16px;font-weight:800;color:var(--ink)}
// .rd-chip-lbl{display:block;font-size:9px;font-weight:600;color:var(--ink4);margin-top:1px}
// .rd-green{color:#16a34a!important}
// .rd-amber{color:#d97706!important}
// .rd-sb-sep{width:1px;height:26px;background:var(--bdr)}

// /* Footer */
// .rd-sb-foot{display:flex;align-items:center;gap:9px;padding:12px 14px;border-top:1.5px solid var(--bdr)}
// .rd-sb-av{width:32px;height:32px;border-radius:9px;flex-shrink:0;background:linear-gradient(135deg,var(--or),var(--or-d));color:#fff;font-size:13px;font-weight:800;display:flex;align-items:center;justify-content:center}
// .rd-sb-user{flex:1;min-width:0}
// .rd-sb-uname{display:block;font-size:12px;font-weight:700;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
// .rd-sb-role {display:block;font-size:10px;font-weight:500;color:var(--ink4)}
// .rd-sb-logout{background:transparent;border:1.5px solid var(--bdr);border-radius:8px;padding:6px;cursor:pointer;color:var(--ink3);display:flex;align-items:center;transition:all .15s;flex-shrink:0}
// .rd-sb-logout:hover{background:#fef2f2;border-color:#fca5a5;color:#ef4444}

// /* ── Main ── */
// .rd-main{margin-left:var(--sw);flex:1;padding:28px 30px 60px;min-height:100vh}

// /* Topbar */
// .rd-topbar{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:24px}
// .rd-page-title{font-size:24px;font-weight:800;color:var(--ink);letter-spacing:-.4px}
// .rd-page-sub  {font-size:12px;color:var(--ink3);margin-top:3px;font-weight:500}
// .rd-topbar-right{display:flex;align-items:center;gap:9px;flex-wrap:wrap}
// .rd-date-chip{display:flex;align-items:center;gap:6px;padding:8px 14px;border-radius:10px;background:var(--surf);border:1.5px solid var(--bdr);font-size:12px;font-weight:500;color:var(--ink3)}
// .rd-date-chip strong{color:var(--ink);font-weight:800}
// .rd-refresh-btn{display:flex;align-items:center;gap:6px;padding:8px 15px;border-radius:10px;border:none;cursor:pointer;background:linear-gradient(135deg,var(--or),var(--or-d));font-family:'Outfit',sans-serif;font-size:12px;font-weight:700;color:#fff;box-shadow:0 3px 10px rgba(249,115,22,.22);transition:all .18s}
// .rd-refresh-btn:hover:not(:disabled){background:linear-gradient(135deg,var(--or-d),var(--or-dd));transform:translateY(-1px)}
// .rd-refresh-btn:disabled{opacity:.65;cursor:not-allowed;transform:none}

// /* ── KPI Stat Grid ── */
// .rd-stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:18px}
// .rd-stat-card{
//   background:var(--surf);border-radius:16px;border:1.5px solid var(--bdr);
//   padding:20px 18px 16px;position:relative;overflow:hidden;
//   box-shadow:var(--sh);
//   animation:_ci .4s cubic-bezier(.22,1,.36,1) both;
//   transition:transform .22s,box-shadow .22s;
// }
// .rd-stat-card:hover{transform:translateY(-4px);box-shadow:var(--sh-h)}
// @keyframes _ci{from{opacity:0;transform:translateY(16px)}}
// .rd-stat-icon{width:46px;height:46px;border-radius:13px;display:flex;align-items:center;justify-content:center;margin-bottom:14px}
// .rd-stat-label{font-size:11px;font-weight:700;color:var(--ink3);letter-spacing:.04em;text-transform:uppercase;margin-bottom:5px}
// .rd-stat-value{font-size:26px;font-weight:900;letter-spacing:-.5px;line-height:1.1;margin-bottom:5px}
// .rd-stat-sub  {font-size:11px;font-weight:600;color:var(--ink4)}
// .rd-stat-bar  {position:absolute;bottom:0;left:0;right:0;height:4px;opacity:.7;border-radius:0 0 16px 16px}

// /* ── Revenue Strip ── */
// .rd-rev-strip{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:22px}
// .rd-rev-item{
//   background:var(--surf);border-radius:14px;border:1.5px solid var(--bdr);
//   border-top-width:4px;padding:16px 18px;
//   box-shadow:var(--sh);
//   animation:_ci .42s cubic-bezier(.22,1,.36,1) both;
//   transition:transform .2s;
// }
// .rd-rev-item:hover{transform:translateY(-3px)}
// .rd-rev-label{font-size:11px;font-weight:700;color:var(--ink3);margin-bottom:5px;text-transform:uppercase;letter-spacing:.04em}
// .rd-rev-val  {font-size:22px;font-weight:900;letter-spacing:-.4px;line-height:1.1;margin-bottom:3px}
// .rd-rev-sub  {font-size:11px;font-weight:500;color:var(--ink4)}

// /* ── Charts ── */
// .rd-charts-row{display:grid;grid-template-columns:1fr 1fr 0.6fr;gap:16px;margin-bottom:22px}
// .rd-chart-card{background:var(--surf);border-radius:16px;border:1.5px solid var(--bdr);padding:20px 18px;box-shadow:var(--sh);animation:_ci .46s cubic-bezier(.22,1,.36,1) both}
// .rd-chart-head{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:16px}
// .rd-chart-title{font-size:16px;font-weight:800;color:var(--ink)}
// .rd-chart-sub  {font-size:11px;font-weight:600;color:var(--ink4);margin-top:2px}
// .rd-chart-badge{width:38px;height:38px;border-radius:11px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
// .rd-chart-empty{height:160px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;color:var(--ink4);font-size:13px;font-weight:600}

// /* Pie legend */
// .rd-pie-legend{display:flex;flex-direction:column;gap:7px;margin-top:12px}
// .rd-pie-row{display:flex;align-items:center;gap:8px}
// .rd-pie-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0}
// .rd-pie-name{font-size:12px;font-weight:600;color:var(--ink2);flex:1}
// .rd-pie-val {font-size:13px;font-weight:800;color:var(--ink)}

// /* ── Bottom Row ── */
// .rd-bottom-row{display:grid;grid-template-columns:1fr 0.5fr;gap:16px}
// .rd-section-card{background:var(--surf);border-radius:16px;border:1.5px solid var(--bdr);padding:22px 20px;box-shadow:var(--sh);animation:_ci .48s cubic-bezier(.22,1,.36,1) both}
// .rd-section-head{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:18px}
// .rd-section-title{font-size:16px;font-weight:800;color:var(--ink)}
// .rd-section-sub  {font-size:11px;font-weight:600;color:var(--ink4);margin-top:2px}
// .rd-view-all{display:flex;align-items:center;gap:4px;font-size:12px;font-weight:700;color:var(--or);text-decoration:none;transition:gap .15s}
// .rd-view-all:hover{gap:7px;color:var(--or-d)}

// /* Orders */
// .rd-orders-list{display:flex;flex-direction:column;gap:10px}
// .rd-order-row{
//   display:flex;align-items:center;gap:12px;
//   padding:12px 14px;border-radius:12px;
//   background:var(--bg);border:1.5px solid var(--bdr);
//   animation:_ci .36s cubic-bezier(.22,1,.36,1) both;
//   transition:background .15s;
// }
// .rd-order-row:hover{background:var(--or-p)}
// .rd-order-icon{width:40px;height:40px;border-radius:11px;flex-shrink:0;display:flex;align-items:center;justify-content:center}
// .rd-order-info{flex:1;min-width:0}
// .rd-order-id  {font-size:13px;font-weight:700;color:var(--ink)}
// .rd-order-meta{font-size:11px;font-weight:500;color:var(--ink3);margin-top:2px}
// .rd-order-right{text-align:right;flex-shrink:0}
// .rd-order-amt {font-size:14px;font-weight:800;color:var(--ink)}
// .rd-order-badge{display:inline-block;font-size:10px;font-weight:700;letter-spacing:.04em;padding:3px 8px;border-radius:6px;margin-top:3px;text-transform:uppercase}
// .rd-empty-orders{display:flex;flex-direction:column;align-items:center;gap:10px;padding:40px 0;color:var(--ink4);font-size:13px;font-weight:600}

// /* Quick actions */
// .rd-quick-list{display:flex;flex-direction:column;gap:8px;margin-bottom:16px}
// .rd-quick-item{display:flex;align-items:center;gap:12px;padding:12px 13px;border-radius:12px;border:1.5px solid var(--bdr);text-decoration:none;background:var(--bg);transition:all .18s}
// .rd-quick-item:hover{background:var(--or-p);border-color:var(--or-s);transform:translateX(3px)}
// .rd-quick-icon{width:40px;height:40px;border-radius:11px;flex-shrink:0;display:flex;align-items:center;justify-content:center}
// .rd-quick-text{flex:1;min-width:0}
// .rd-quick-label{display:block;font-size:13px;font-weight:700;color:var(--ink)}
// .rd-quick-sub  {display:block;font-size:11px;font-weight:500;color:var(--ink3);margin-top:1px}
// .rd-quick-arrow{color:var(--ink4);flex-shrink:0;transition:transform .18s}
// .rd-quick-item:hover .rd-quick-arrow{transform:translateX(3px);color:var(--or)}

// /* Mini summary */
// .rd-mini-summary{display:flex;align-items:center;justify-content:space-around;padding:14px;background:var(--bg);border-radius:12px;border:1.5px solid var(--bdr)}
// .rd-mini-item{text-align:center}
// .rd-mini-val {display:block;font-size:22px;font-weight:900}
// .rd-mini-lbl {display:block;font-size:10px;font-weight:600;color:var(--ink4);margin-top:1px}
// .rd-mini-sep {width:1px;height:28px;background:var(--bdr)}

// /* ── Responsive ── */
// // @media(max-width:1300px){
// //   .rd-stat-grid  {grid-template-columns:repeat(2,1fr)}
// //   .rd-rev-strip  {grid-template-columns:repeat(2,1fr)}
// //   .rd-charts-row {grid-template-columns:1fr 1fr}
// //   .rd-charts-row .rd-chart-card:last-child{grid-column:1/-1}
// //   .rd-bottom-row {grid-template-columns:1fr}
// // }
// // @media(max-width:900px){
// //   .rd-sidebar{display:none}
// //   .rd-main   {margin-left:0;padding:18px 14px 60px}
// //   .rd-stat-grid  {grid-template-columns:repeat(2,1fr)}
// //   .rd-charts-row {grid-template-columns:1fr}
// // }
// // @media(max-width:540px){
// //   .rd-stat-grid {grid-template-columns:1fr}
// //   .rd-rev-strip {grid-template-columns:1fr 1fr}
// //   .rd-topbar{flex-direction:column}
// // }


// /* =========================================================
//    RESPONSIVE DESIGN
// ========================================================= */

// /* ---------- Large Laptop ---------- */
// @media (max-width: 1400px) {

//   .rd-main{
//     padding:24px 22px 50px;
//   }

//   .rd-stat-grid{
//     grid-template-columns:repeat(2,1fr);
//   }

//   .rd-rev-strip{
//     grid-template-columns:repeat(2,1fr);
//   }

//   .rd-charts-row{
//     grid-template-columns:1fr 1fr;
//   }

//   .rd-charts-row .rd-chart-card:last-child{
//     grid-column:1 / -1;
//   }

//   .rd-bottom-row{
//     grid-template-columns:1fr;
//   }
// }


// /* ---------- Tablet ---------- */
// @media (max-width: 992px) {

//   :root{
//     --sw:220px;
//   }

//   .rd-sidebar{
//     width:220px;
//   }

//   .rd-main{
//     margin-left:220px;
//     padding:20px 18px 50px;
//   }

//   .rd-page-title{
//     font-size:22px;
//   }

//   .rd-stat-value{
//     font-size:24px;
//   }

//   .rd-rev-val{
//     font-size:20px;
//   }

//   .rd-charts-row{
//     grid-template-columns:1fr;
//   }

//   .rd-chart-card{
//     width:100%;
//     overflow:hidden;
//   }

//   .rd-stat-grid{
//     grid-template-columns:repeat(2,1fr);
//   }

//   .rd-rev-strip{
//     grid-template-columns:repeat(2,1fr);
//   }

//   .rd-bottom-row{
//     grid-template-columns:1fr;
//   }

//   .rd-topbar{
//     gap:14px;
//   }
// }


// /* ---------- Mobile Landscape ---------- */
// @media (max-width: 768px) {

//   .rd-sidebar{
//     display:none;
//   }

//   .rd-main{
//     margin-left:0;
//     width:100%;
//     padding:18px 14px 40px;
//   }

//   .rd-topbar{
//     flex-direction:column;
//     align-items:flex-start;
//   }

//   .rd-topbar-right{
//     width:100%;
//     justify-content:space-between;
//   }

//   .rd-page-title{
//     font-size:20px;
//   }

//   .rd-page-sub{
//     font-size:11px;
//   }

//   .rd-stat-grid{
//     grid-template-columns:1fr 1fr;
//     gap:12px;
//   }

//   .rd-rev-strip{
//     grid-template-columns:1fr 1fr;
//     gap:12px;
//   }

//   .rd-stat-card,
//   .rd-chart-card,
//   .rd-section-card{
//     padding:16px;
//     border-radius:14px;
//   }

//   .rd-stat-value{
//     font-size:22px;
//   }

//   .rd-rev-val{
//     font-size:19px;
//   }

//   .rd-chart-head,
//   .rd-section-head{
//     flex-direction:column;
//     gap:10px;
//   }

//   .rd-order-row{
//     flex-wrap:wrap;
//   }

//   .rd-order-right{
//     width:100%;
//     text-align:left;
//     margin-top:6px;
//   }

//   .rd-mini-summary{
//     flex-wrap:wrap;
//     gap:14px;
//   }

//   .rd-mini-sep{
//     display:none;
//   }
// }


// /* ---------- Small Mobile ---------- */
// @media (max-width: 540px) {

//   .rd-main{
//     padding:14px 10px 30px;
//   }

//   .rd-page-title{
//     font-size:18px;
//   }

//   .rd-topbar-right{
//     flex-direction:column;
//     align-items:stretch;
//     width:100%;
//   }

//   .rd-date-chip,
//   .rd-refresh-btn{
//     width:100%;
//     justify-content:center;
//   }

//   .rd-stat-grid{
//     grid-template-columns:1fr;
//   }

//   .rd-rev-strip{
//     grid-template-columns:1fr;
//   }

//   .rd-stat-card{
//     padding:15px;
//   }

//   .rd-stat-icon{
//     width:42px;
//     height:42px;
//   }

//   .rd-stat-value{
//     font-size:20px;
//   }

//   .rd-stat-label{
//     font-size:10px;
//   }

//   .rd-rev-item{
//     padding:14px;
//   }

//   .rd-rev-val{
//     font-size:18px;
//   }

//   .rd-chart-card{
//     padding:14px;
//   }

//   .rd-chart-title,
//   .rd-section-title{
//     font-size:15px;
//   }

//   .rd-order-row{
//     padding:10px;
//   }

//   .rd-order-icon{
//     width:36px;
//     height:36px;
//   }

//   .rd-quick-item{
//     padding:10px;
//   }

//   .rd-quick-icon{
//     width:36px;
//     height:36px;
//   }

//   .rd-mini-val{
//     font-size:18px;
//   }
// }


// /* ---------- Extra Small Devices ---------- */
// @media (max-width: 380px) {

//   .rd-main{
//     padding:12px 8px 24px;
//   }

//   .rd-page-title{
//     font-size:17px;
//   }

//   .rd-stat-value{
//     font-size:18px;
//   }

//   .rd-rev-val{
//     font-size:17px;
//   }

//   .rd-chart-card,
//   .rd-section-card,
//   .rd-stat-card{
//     padding:12px;
//   }

//   .rd-order-id{
//     font-size:12px;
//   }

//   .rd-order-meta{
//     font-size:10px;
//   }

//   .rd-quick-label{
//     font-size:12px;
//   }

//   .rd-quick-sub{
//     font-size:10px;
//   }
// }
// `;

// export default RestaurantDashboard;