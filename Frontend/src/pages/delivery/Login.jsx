import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bike, Mail, Lock, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const DeliveryLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated, hasRole } = useAuth();

  // Redirect if already logged in as delivery
  useEffect(() => {
    if (isAuthenticated() && hasRole("Delivery")) {
      navigate("/delivery/dashboard", { replace: true });
    }
  }, [navigate, isAuthenticated, hasRole]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      const result = await login(email, password);

      if (!result.success) {
        // Navigate to error page with status
        navigate("/error", { state: { status: result.status || 401 } });
        return;
      }

      // Check if user is a delivery partner
      if (result.role !== "Delivery") {
        throw new Error("This account is not a delivery partner account");
      }

      localStorage.setItem("deliveryOnline", "true");

      setSuccess(true);
      setLoading(false);

      setTimeout(() => {
        navigate("/delivery/dashboard", { replace: true });
      }, 800);
    } catch (err) {
      console.error("Delivery login error:", err);
      setError(err.message || "An error occurred during login. Please try again.");
      setSuccess(false);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-600 to-cyan-600 rounded-3xl shadow-xl mb-4">
            <Bike className="text-white" size={40} />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">
            Delivery Partner
          </h1>
          <p className="text-gray-600">Sign in to start delivering orders</p>
        </div>

        {success && (
          <div className="bg-green-100 text-green-700 p-4 rounded-xl mb-6 flex items-center gap-2">
            <CheckCircle size={18} />
            <span className="font-semibold">Login successful! Redirecting...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-xl mb-6 flex items-center gap-2">
            <AlertCircle size={18} />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="email"
                className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-indigo-600 focus:outline-none transition"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="password"
                className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-indigo-600 focus:outline-none transition"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 text-white py-4 rounded-xl font-black text-lg hover:from-indigo-700 hover:to-cyan-700 transition shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <span className="text-indigo-600 font-semibold cursor-pointer hover:underline">
              Contact Admin
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DeliveryLogin;


