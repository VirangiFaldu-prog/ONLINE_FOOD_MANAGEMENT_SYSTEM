import { Routes, Route, Navigate } from "react-router-dom";
import CustomerRegister from "../pages/customer/Register";
import AllItems from "../pages/customer/AllItems";
import RestaurantDetail from "../pages/customer/RestaurantDetail";
import Cart from "../pages/customer/Cart";
import Checkout from "../pages/customer/Checkout";
import Orders from "../pages/customer/Orders";
import Profile from "../pages/customer/Profile";
import CustomerLayout from "../components/customer/CustomerLayout";
import { useAuth } from "../contexts/AuthContext";
import CustomerRestaurants from "../pages/customer/CustomerRestaurants";

const CustomerRoutes = () => {
  const { isAuthenticated, hasRole } = useAuth();
  const isCustomer = isAuthenticated() && hasRole("Customer");

  if (!isCustomer) {
    return <Navigate to="/login" replace />;
  }

  return (
    <CustomerLayout>
      <Routes>
        <Route path="register" element={<CustomerRegister />} />
        <Route path="all-items" element={<AllItems />} />
        <Route path="restaurant/:id" element={<RestaurantDetail />} />
        <Route path="cart" element={<Cart />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="orders" element={<Orders />} />
        <Route path="profile" element={<Profile />} />
        <Route path="restaurants" element={<CustomerRestaurants />} />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="all-items" replace />} />
      </Routes>
    </CustomerLayout>
  );
};

export default CustomerRoutes;