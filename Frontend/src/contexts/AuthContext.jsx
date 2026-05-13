// import { createContext, useContext, useState, useEffect } from "react";
// import axios from "axios";
// import axiosInstance from "../api/axiosInstance";

// const AuthContext = createContext(null);

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error("useAuth must be used within AuthProvider");
//   }
//   return context;
// };

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [token, setToken] = useState(localStorage.getItem("token") || null);
//   const [loading, setLoading] = useState(true);

//   // Load user from token on mount
//   useEffect(() => {
//     if (token) {
//       loadUserFromToken();
//     } else {
//       setLoading(false);
//     }
//   }, [token]);

//   const loadUserFromToken = async () => {
//     try {
//       const response = await axiosInstance.get("/User");
//       const users = response.data;
      
//       // Get user ID from token (stored in localStorage)
//       const userId = parseInt(localStorage.getItem("userId") || "0");
//       const currentUser = Array.isArray(users) 
//         ? users.find(u => u.userID === userId)
//         : null;
      
//       if (currentUser) {
//         setUser({
//           id: currentUser.userID,
//           userName: currentUser.userName,
//           email: currentUser.email,
//           role: currentUser.role,
//         });
//       }
//     } catch (error) {
//       console.error("Failed to load user:", error);
//       logout();
//     } finally {
//       setLoading(false);
//     }
//   };

//   const login = async (email, password) => {
//     try {
//       // Use plain axios for login (no token needed)
//       const response = await axios.post("https://localhost:7217/api/Auth/login", {
//         email,
//         password,
//       });

//       const data = response.data;
      
//       // Handle different possible response structures
//       const authToken = data.token || data.accessToken || data.jwtToken;
//       const userID = data.userID || data.userId || data.id;
//       const userName = data.userName || data.name || "";
//       const role = data.role || "";

//       if (!authToken || !userID) {
//         throw new Error("Invalid response from server");
//       }

//       // Store token and user info
//       localStorage.setItem("token", authToken);
//       localStorage.setItem("userId", userID.toString());
//       localStorage.setItem("userName", userName);
//       localStorage.setItem("userRole", role);

//       setToken(authToken);
//       setUser({
//         id: userID,
//         userName,
//         email,
//         role,
//       });

//       // Set role-specific storage
//       if (role === "Customer") {
//         localStorage.setItem("customerId", userID.toString());
//       } else if (role === "Restaurant") {
//         localStorage.setItem("restaurantUserId", userID.toString());
//       } else if (role === "Delivery") {
//         localStorage.setItem("deliveryUserId", userID.toString());
//         localStorage.setItem("deliveryUserName", userName);
//       } else if (role === "Admin") {
//         localStorage.setItem("adminId", userID.toString());
//       }

//       return { success: true, role };
//     } catch (error) {
//       console.error("Login error:", error);
//       const errorMessage = error.response?.data?.message || 
//                           error.response?.data || 
//                           error.message || 
//                           "Login failed";
//       return {
//         success: false,
//         error: typeof errorMessage === 'string' ? errorMessage : "Invalid email or password",
//       };
//     }
//   };

//   const register = async (userName, email, password, phone) => {
//     try {
//       // Use plain axios for register (no token needed)
//       await axios.post("https://localhost:7217/api/Auth/register", {
//         userName,
//         email,
//         password,
//         phone,
//       });
//       return { success: true };
//     } catch (error) {
//       console.error("Registration error:", error);
//       const errorMessage = error.response?.data?.message || 
//                           error.response?.data || 
//                           error.message || 
//                           "Registration failed";
//       return {
//         success: false,
//         error: typeof errorMessage === 'string' ? errorMessage : "Registration failed",
//       };
//     }
//   };

//   const logout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("userId");
//     localStorage.removeItem("userName");
//     localStorage.removeItem("userRole");
//     localStorage.removeItem("customerId");
//     localStorage.removeItem("restaurantId");
//     localStorage.removeItem("restaurantUserId");
//     localStorage.removeItem("deliveryUserId");
//     localStorage.removeItem("deliveryUserName");
//     localStorage.removeItem("adminId");
//     sessionStorage.clear();
    
//     setToken(null);
//     setUser(null);
//   };

//   const isAuthenticated = () => {
//     return !!token && !!user;
//   };

//   const hasRole = (role) => {
//     return user?.role === role;
//   };

//   const value = {
//     user,
//     token,
//     loading,
//     login,
//     register,
//     logout,
//     isAuthenticated,
//     hasRole,
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };

import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import axiosInstance from "../api/axiosInstance";

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  // 🔁 Restore session on refresh
  useEffect(() => {
    const storedUser = localStorage.getItem("authUser");

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, [token]);

  // Map numeric role codes from backend to readable role names
  const ROLE_MAP = {
    1: "Admin",
    2: "Customer",
    3: "Restaurant",
    4: "Delivery",
  };

  // 🔐 LOGIN
  const login = async (email, password) => {
    try {
      const response = await axios.post(
        "https://localhost:7217/api/Auth/login",
        { email, password }
      );

      const data = response.data;
      console.log("LOGIN RESPONSE:", data);

      const authToken =
        data.token || data.jwtToken || data.accessToken;

      const userObj = data.user || data;

      const rawRole = userObj.role;
      const roleLabel =
        typeof rawRole === "number" ? ROLE_MAP[rawRole] : String(rawRole || "");

      const user = {
        id: userObj.userID || userObj.userId || userObj.id,
        userName: userObj.userName || userObj.name || "",
        email: userObj.email || email,
        role: roleLabel,
      };

      if (!authToken || !user.id) {
        throw new Error("Invalid login response");
      }

      // 💾 Persist
      localStorage.setItem("token", authToken);
      localStorage.setItem("authUser", JSON.stringify(user));

      // Role-specific storage (store normalized label)
      localStorage.setItem("userId", user.id);
      localStorage.setItem("userRole", roleLabel);
      localStorage.setItem("userName", user.userName);

      if (roleLabel === "Restaurant") {
        localStorage.setItem("restaurantUserId", user.id);
      } else if (roleLabel === "Customer") {
        localStorage.setItem("customerId", user.id);
      } else if (roleLabel === "Delivery") {
        localStorage.setItem("deliveryUserId", user.id);
      } else if (roleLabel === "Admin") {
        localStorage.setItem("adminId", user.id);
      }

      // 🔥 IMPORTANT: set state BEFORE redirect
      setToken(authToken);
      setUser(user);

      return { success: true, role: user.role };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.response?.data ||
          error.message ||
          "Login failed",
        status: error.response?.status || 500,
      };
    }
  };

  // 🚪 LOGOUT
  const logout = () => {
    localStorage.clear();
    sessionStorage.clear();
    setToken(null);
    setUser(null);
  };

  // ✅ FIXED HELPERS
  const isAuthenticated = () => !!token;
  // const hasRole = (role) => user?.role === role;
  const hasRole = (role) =>
   user?.role === role ||
   localStorage.getItem("userRole") === role;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        isAuthenticated,
        hasRole,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

