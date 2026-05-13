
// import { useEffect, useState } from "react";
// import { CreditCard, Trash2, Pencil, X, DollarSign, Filter, TrendingUp } from "lucide-react";

// const API = "https://localhost:7217/api/Payment";

// const Payment = () => {
//   const [payments, setPayments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [modal, setModal] = useState(null);
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [form, setForm] = useState({
//     paymentID: null,
//     paymentStatus: "Pending",
//   });

//   const loadPayments = async () => {
//     setLoading(true);
//     setError("");
//     try {
//       const res = await fetch(API);
//       if (!res.ok) throw new Error("Failed to fetch payments");
//       const data = await res.json();
//       setPayments(data);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadPayments();
//   }, []);

//   const totalRevenue = payments.filter(p => p.paymentStatus === "Success").reduce((sum, p) => sum + (p.paidAmount || 0), 0);
//   const stats = {
//     Total: payments.length,
//     Pending: payments.filter((p) => p.paymentStatus === "Pending").length,
//     Success: payments.filter((p) => p.paymentStatus === "Success").length,
//     Revenue: `₹${totalRevenue.toFixed(2)}`,
//   };

//   const updateStatus = async () => {
//     try {
//       const res = await fetch(`${API}/${form.paymentID}/status?status=${form.paymentStatus}`, { method: "PATCH" });
//       if (!res.ok) throw new Error("Failed to update status");
//       setModal(null);
//       loadPayments();
//     } catch (err) {
//       alert(err.message);
//     }
//   };

//   const deletePayment = async () => {
//     try {
//       const res = await fetch(`${API}/${form.paymentID}`, { method: "DELETE" });
//       if (!res.ok) throw new Error("Failed to delete payment");
//       setModal(null);
//       loadPayments();
//     } catch (err) {
//       alert(err.message);
//     }
//   };

//   const filteredPayments = payments.filter((p) => {
//     if (statusFilter === "all") return true;
//     return p.paymentStatus === statusFilter;
//   });

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-100">
//       <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white">
//         <div className="max-w-7xl mx-auto px-8 py-12">
//           <div className="flex items-center gap-6">
//             <div className="w-20 h-20 bg-white/20 backdrop-blur-lg rounded-3xl flex items-center justify-center shadow-2xl">
//               <CreditCard className="text-white" size={36} />
//             </div>
//             <div>
//               <h1 className="text-5xl font-black tracking-tight mb-2">Payments Management</h1>
//               <p className="text-green-100 text-lg">Monitor all order payments and transactions</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-8 py-8">
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-6 -mt-12 mb-10">
//           {Object.entries(stats).map(([key, val], idx) => (
//             <div key={key} className="bg-white rounded-3xl shadow-2xl p-8 text-center transform hover:scale-105 transition-all">
//               <div className="flex items-center justify-center mb-2">
//                 {key === "Revenue" ? (
//                   <TrendingUp size={24} className="text-green-600 mr-2" />
//                 ) : null}
//                 <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide">{key}</p>
//               </div>
//               <h2 className="text-5xl font-black bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
//                 {val}
//               </h2>
//             </div>
//           ))}
//         </div>

//         <div className="bg-white rounded-3xl shadow-xl p-6 mb-8">
//           <div className="flex items-center gap-4">
//             <Filter size={20} className="text-gray-400" />
//             <span className="font-semibold text-gray-700">Filter by Status:</span>
//             <div className="flex gap-3 flex-wrap">
//               {[
//                 { key: "all", label: "All" },
//                 { key: "Pending", label: "Pending" },
//                 { key: "Success", label: "Success" },
//                 { key: "Failed", label: "Failed" },
//               ].map((filter) => (
//                 <button key={filter.key} onClick={() => setStatusFilter(filter.key)}
//                   className={`px-6 py-3 rounded-2xl font-semibold transition-all ${statusFilter === filter.key ? "bg-green-600 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
//                   {filter.label}
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>

//         {loading ? (
//           <div className="text-center py-20">
//             <div className="inline-block w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
//             <p className="text-gray-500 mt-4 text-lg">Loading payments...</p>
//           </div>
//         ) : error ? (
//           <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-8 text-center">
//             <p className="text-red-600 text-lg font-semibold">{error}</p>
//           </div>
//         ) : filteredPayments.length === 0 ? (
//           <div className="bg-gray-50 border-2 border-gray-200 rounded-3xl p-12 text-center">
//             <CreditCard size={64} className="mx-auto text-gray-300 mb-4" />
//             <p className="text-gray-500 text-xl">No payments found</p>
//           </div>
//         ) : (
//           <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
//             <table className="w-full">
//               <thead className="bg-gradient-to-r from-green-50 to-teal-50">
//                 <tr>
//                   <th className="px-6 py-4 text-left font-bold text-gray-700">Payment ID</th>
//                   <th className="px-6 py-4 text-left font-bold text-gray-700">Order ID</th>
//                   <th className="px-6 py-4 text-left font-bold text-gray-700">Mode</th>
//                   <th className="px-6 py-4 text-left font-bold text-gray-700">Amount</th>
//                   <th className="px-6 py-4 text-left font-bold text-gray-700">Status</th>
//                   <th className="px-6 py-4 text-right font-bold text-gray-700">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredPayments.map((p) => (
//                   <tr key={p.paymentID} className="border-t border-gray-100 hover:bg-green-50 transition-colors group">
//                     <td className="px-6 py-4 font-bold text-gray-900">#{p.paymentID}</td>
//                     <td className="px-6 py-4 text-gray-700">#{p.orderID}</td>
//                     <td className="px-6 py-4">
//                       <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-medium">
//                         {p.paymentMode}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4">
//                       <div className="flex items-center gap-1 font-bold text-green-700">
//                         <DollarSign size={16} />₹{p.paidAmount}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4">
//                       <span
//                         className={`px-4 py-2 rounded-full text-xs font-bold ${
//                           p.paymentStatus === "Success"
//                             ? "bg-green-100 text-green-800"
//                             : p.paymentStatus === "Pending"
//                             ? "bg-yellow-100 text-yellow-800"
//                             : "bg-red-100 text-red-800"
//                         }`}
//                       >
//                         {p.paymentStatus}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4">
//                       <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
//                         <button onClick={() => { setForm({ paymentID: p.paymentID, paymentStatus: p.paymentStatus }); setModal("status"); }}
//                           className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors">
//                           <Pencil size={16} />
//                         </button>
//                         <button onClick={() => { setForm({ paymentID: p.paymentID }); setModal("delete"); }}
//                           className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors">
//                           <Trash2 size={16} />
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

//       {modal && (
//         <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-50 p-4">
//           <div className="bg-white rounded-3xl p-8 w-full max-w-lg relative shadow-2xl">
//             <button className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors" onClick={() => setModal(null)}>
//               <X size={24} />
//             </button>
//             {modal === "delete" ? (
//               <>
//                 <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
//                   <Trash2 className="text-red-600" size={28} />
//                 </div>
//                 <h2 className="text-3xl font-bold mb-4 text-center">Delete Payment?</h2>
//                 <p className="text-gray-600 text-center mb-8">Are you sure you want to delete this payment record? This action cannot be undone.</p>
//                 <div className="flex gap-4">
//                   <button onClick={() => setModal(null)} className="flex-1 px-6 py-4 rounded-xl bg-gray-100 hover:bg-gray-200 font-semibold transition-all">Cancel</button>
//                   <button onClick={deletePayment} className="flex-1 px-6 py-4 rounded-xl bg-red-600 text-white hover:bg-red-700 font-semibold transition-all shadow-lg">Delete</button>
//                 </div>
//               </>
//             ) : (
//               <>
//                 <h2 className="text-3xl font-bold mb-8 text-gray-900">Update Payment Status</h2>
//                 <div className="flex flex-col gap-5">
//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Status</label>
//                     <select value={form.paymentStatus} onChange={(e) => setForm({ ...form, paymentStatus: e.target.value })}
//                       className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-lg">
//                       <option>Pending</option>
//                       <option>Success</option>
//                       <option>Failed</option>
//                     </select>
//                   </div>
//                   <button onClick={updateStatus}
//                     className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-8 py-4 rounded-xl hover:from-green-700 hover:to-teal-700 font-bold text-lg transition-all shadow-xl mt-4">
//                     Update Status
//                   </button>
//                 </div>
//               </>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Payment;

import { useEffect, useState } from "react";
import {
  CreditCard,
  DollarSign,
  Filter,
  TrendingUp,
  ArrowLeft,
  Store,
  User,
  Calendar,
} from "lucide-react";

const API = "https://localhost:7217/api/Payment";
const REST_API = "https://localhost:7217/api/Restaurant";

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  const loadData = async () => {
    try {
      const [paymentsRes, restaurantsRes] = await Promise.all([
        fetch(API),
        fetch(REST_API),
      ]);
      if (!paymentsRes.ok || !restaurantsRes.ok)
        throw new Error("Failed to fetch data");

      setPayments(await paymentsRes.json());
      setRestaurants(await restaurantsRes.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredPayments = payments.filter((p) => {
    const matchStatus =
      statusFilter === "all" || p.paymentStatus === statusFilter;
    const matchRestaurant =
      !selectedRestaurant ||
      p.order?.restaurantID === selectedRestaurant.restaurantID;
    return matchStatus && matchRestaurant;
  });

  const totalRevenue = filteredPayments
    .filter((p) => p.paymentStatus === "Success")
    .reduce((sum, p) => sum + (p.paidAmount || 0), 0);

  const stats = {
    Total: filteredPayments.length,
    Pending: filteredPayments.filter((p) => p.paymentStatus === "Pending")
      .length,
    Success: filteredPayments.filter((p) => p.paymentStatus === "Success")
      .length,
    Revenue: `₹${totalRevenue.toFixed(2)}`,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => (window.location.href = "/")}
            className="p-3 rounded-xl bg-white shadow hover:bg-gray-100"
          >
            <ArrowLeft />
          </button>

          <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center shadow">
            <CreditCard className="text-white" size={28} />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Payment Transactions
            </h1>
            <p className="text-gray-500">Monitor all order payments</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {Object.entries(stats).map(([key, val]) => (
          <div
            key={key}
            className="bg-white rounded-2xl shadow p-6 text-center"
          >
            <p className="text-gray-500 font-semibold">{key}</p>
            <h2 className="text-3xl font-bold text-gray-800">{val}</h2>
            <TrendingUp className="mx-auto mt-2 text-emerald-500" size={20} />
          </div>
        ))}
      </div>

      {/* Restaurant Filter */}
      <div className="bg-white rounded-2xl shadow p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Store className="text-emerald-600" />
          <h3 className="font-bold text-gray-800">Filter by Restaurant</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <button
            onClick={() => setSelectedRestaurant(null)}
            className={`p-3 rounded-xl border font-semibold ${
              !selectedRestaurant
                ? "bg-emerald-600 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            All
          </button>

          {restaurants.map((r) => (
            <button
              key={r.restaurantID}
              onClick={() => setSelectedRestaurant(r)}
              className={`rounded-xl overflow-hidden border hover:shadow transition ${
                selectedRestaurant?.restaurantID === r.restaurantID
                  ? "ring-2 ring-emerald-500"
                  : ""
              }`}
            >
              <img
                src={
                  r.imageUrl ||
                  `https://source.unsplash.com/400x300/?restaurant,food`
                }
                alt={r.name}
                className="h-24 w-full object-cover"
              />
              <p className="p-2 text-sm font-semibold text-gray-700 truncate">
                {r.name}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Status Filter */}
      <div className="bg-white rounded-2xl shadow p-6 mb-8 flex gap-4 flex-wrap items-center">
        <Filter className="text-emerald-600" />
        {["all", "Pending", "Success", "Failed"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-5 py-2 rounded-xl font-semibold ${
              statusFilter === s
                ? "bg-emerald-600 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Payments Grid */}
      {loading ? (
        <div className="text-center py-20 text-gray-500">
          Loading payments...
        </div>
      ) : error ? (
        <div className="text-center text-red-500 font-semibold">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPayments.map((p) => (
            <div
              key={p.paymentID}
              className="bg-white rounded-2xl shadow hover:shadow-lg transition overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-gray-800">
                      Payment #{p.paymentID}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Order #{p.orderID}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      p.paymentStatus === "Success"
                        ? "bg-green-100 text-green-700"
                        : p.paymentStatus === "Pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {p.paymentStatus}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  {p.order?.restaurant && (
                    <div className="flex items-center gap-2">
                      <Store size={14} /> {p.order.restaurant.name}
                    </div>
                  )}
                  {p.order?.user && (
                    <div className="flex items-center gap-2">
                      <User size={14} /> {p.order.user.userName}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    {p.order?.createdAt
                      ? new Date(p.order.createdAt).toLocaleDateString()
                      : "N/A"}
                  </div>
                </div>

                <div className="flex justify-between items-center border-t pt-4">
                  <span className="text-gray-500 font-medium">
                    {p.paymentMode}
                  </span>
                  <div className="text-xl font-bold text-gray-800 flex items-center gap-1">
                    <DollarSign size={18} className="text-emerald-600" />
                    ₹{p.paidAmount}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Payments;
