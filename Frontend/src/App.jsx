import { Routes, Route, Navigate } from "react-router-dom";
import AdminRoutes from "./routes/AdminRoutes";
import RestaurantRoutes from "./routes/RestaurantRoutes";
import CustomerRoutes from "./routes/CustomerRoutes";
import DeliveryRoutes from "./routes/DeliveryRoutes";
import Login from "./pages/Login";
import CustomerRegister from "./pages/customer/Register";
import ErrorPage from "./pages/ErrorPage";
import { useAuth } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";

/* 🔐 Role-based route protection */
const RoleRoute = ({ role, children }) => {
  const { isAuthenticated, hasRole, loading } = useAuth();

  if (loading) return null;

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (role && !hasRole(role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  const { isAuthenticated, hasRole } = useAuth();

  return (
    <CartProvider>
      <Routes>
        {/* PUBLIC */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<CustomerRegister />} />
        <Route path="/error" element={<ErrorPage />} />

        {/* ADMIN */}
        <Route
          path="/admin/*"
          element={
            <RoleRoute role="Admin">
              <AdminRoutes />
            </RoleRoute>
          }
        />

        {/* RESTAURANT */}
        <Route
          path="/restaurant/*"
          element={
            <RoleRoute role="Restaurant">
              <RestaurantRoutes />
            </RoleRoute>
          }
        />

        {/* CUSTOMER */}
        <Route
          path="/customer/*"
          element={
            <RoleRoute role="Customer">
              <CustomerRoutes />
            </RoleRoute>
          }
        />

        {/* DELIVERY */}
        <Route
          path="/delivery/*"
          element={
            <RoleRoute role="Delivery">
              <DeliveryRoutes />
            </RoleRoute>
          }
        />

        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* 404 - Page Not Found */}
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </CartProvider>
  );
}

export default App;