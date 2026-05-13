import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://localhost:7217/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Request: attach JWT ──────────────────────────────────────────────────────
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response: handle auth errors only, pass everything else through ──────────
axiosInstance.interceptors.response.use(
  (response) => response,

  (error) => {
    const status = error.response?.status;
    const url    = error.config?.url ?? "";
    const method = (error.config?.method ?? "").toUpperCase();

    // ── 401: clear auth and redirect to login ──
    // EXCEPT for login/register endpoints themselves
    if (status === 401 && !url.includes("/Auth")) {
      localStorage.removeItem("token");
      localStorage.removeItem("authUser");
      localStorage.removeItem("userId");
      localStorage.removeItem("userName");
      localStorage.removeItem("userRole");
      localStorage.removeItem("customerId");
      localStorage.removeItem("restaurantUserId");
      localStorage.removeItem("deliveryUserId");
      localStorage.removeItem("adminId");
      window.location.replace("/login");
      return Promise.reject(error);
    }

    // ── Network error (no response at all) ──
    if (!error.response) {
      window.location.replace("/error");
      return Promise.reject(error);
    }

    // ── Everything else (400, 403, 404, 500, etc.) ──
    // Let the calling component handle it — just pass the error through
    return Promise.reject(error);
  }
);

export default axiosInstance;