import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { useAuth } from "../../contexts/AuthContext";

const DeliveryProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const { user: authUser } = useAuth();

  const load = async (isRefresh = false) => {
    setError("");
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const userId =
        authUser?.id || parseInt(localStorage.getItem("userId") || "0");
      const response = await axiosInstance.get(`/User/${userId}`);
      setUser(response.data);
    } catch (e) {
      setError(
        e.response?.data?.message || e.message || "Failed to load profile"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const name =
    user?.userName ||
    authUser?.userName ||
    localStorage.getItem("deliveryUserName") ||
    "Delivery Partner";

  const email = user?.email || authUser?.email || "";
  const phone =
    user?.phone ||
    user?.phoneNumber ||
    user?.mobile ||
    user?.phoneNo ||
    authUser?.Phone ||
    authUser?.phoneNumber ||
    localStorage.getItem("deliveryUserPhone") ||
    "";
  const role = user?.role || "Delivery";

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-400 font-medium">Loading profile…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
            Profile
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Your delivery partner account details
          </p>
        </div>
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
        >
          <svg
            className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`}
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M13.5 8A5.5 5.5 0 1 1 8 2.5c1.8 0 3.4.87 4.4 2.2M13.5 2v3h-3" />
          </svg>
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm font-medium px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Hero card */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-semibold text-lg flex-shrink-0">
              {initials}
            </div>
            <div>
              <p className="text-xl font-semibold text-gray-900">{name}</p>
              <p className="text-sm text-gray-400 mt-0.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-600 inline-block" />
                {role} · Active
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-100 rounded-md">
            <svg
              className="w-3 h-3"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M13 4L6.5 11 3 7.5" />
            </svg>
            Verified access
          </div>
        </div>

        <div className="h-px bg-gray-100 my-5" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <InfoItem
            icon={
              <path d="M2 4h12v8H2zM2 4l6 5 6-5" />
            }
            label="Email"
            value={email || "—"}
          />
          <InfoItem
            icon={
              <path d="M5 1h6a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zm3 11h.01" />
            }
            label="Phone"
            value={
              phone ? (
                <a href={`tel:${phone}`} className="text-blue-500 hover:underline">
                  {phone}
                </a>
              ) : (
                "—"
              )
            }
          />
          <InfoItem
            icon={
              <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-5 6a5 5 0 0 1 10 0" />
            }
            label="Account role"
            value={role}
          />
          <InfoItem
            icon={
              <path d="M8 2a6 6 0 1 0 0 12A6 6 0 0 0 8 2zm0 3v3.5l2 2" />
            }
            label="Member since"
            value="Jan 2024"
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total deliveries", value: "1,284", sub: "All time" },
          { label: "This month", value: "87", sub: "March 2026" },
          { label: "Rating", value: "4.9", sub: "Out of 5.0" },
        ].map(({ label, value, sub }) => (
          <div key={label} className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-1">{label}</p>
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            <p className="text-xs text-gray-300 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Activity */}
      <div className="bg-white border border-gray-100 rounded-2xl px-6 py-5">
        <p className="text-sm font-medium text-gray-400 mb-4">Recent activity</p>
        <div className="divide-y divide-gray-50">
          {[
            { color: "bg-green-500", text: "Order #8823 delivered successfully", time: "2h ago" },
            { color: "bg-green-500", text: "Order #8819 delivered successfully", time: "5h ago" },
            { color: "bg-amber-400", text: "Order #8801 — delivery attempted", time: "Yesterday" },
            { color: "bg-blue-400", text: "Profile verified by admin", time: "Mar 10" },
          ].map(({ color, text, time }, i) => (
            <div key={i} className="flex items-center justify-between py-2.5">
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${color}`} />
                {text}
              </div>
              <span className="text-xs text-gray-300 ml-4 flex-shrink-0">{time}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

const InfoItem = ({ icon, label, value }) => (
  <div>
    <p className="text-xs font-medium uppercase tracking-wide text-gray-300 flex items-center gap-1.5 mb-1">
      <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        {icon}
      </svg>
      {label}
    </p>
    <p className="text-sm font-medium text-gray-900">{value}</p>
  </div>
);

export default DeliveryProfile;