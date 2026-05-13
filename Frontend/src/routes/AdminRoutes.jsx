import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "../pages/admin/Dashboard";
import Users from "../pages/admin/Users";
import Categories from "../pages/admin/Categories";
import Restaurants from "../pages/admin/Restaurants";
import MenuItems from "../pages/admin/MenuItems";
import Orders from "../pages/admin/Orders";
import Deliveries from "../pages/admin/Deliveries";
import Payments from "../pages/admin/Payments";
import Reviews from "../pages/admin/Reviews";
import UsersAdmin from "../pages/admin/Users";
import AdminLayout from "../components/admin/AdminLayout";
import { useAuth } from "../contexts/AuthContext";


const AdminRoutes = () => {
  const { isAuthenticated, hasRole } = useAuth();
  const isAdmin = isAuthenticated() && hasRole("Admin");

  return (
    <Routes>
      <Route
        path="/*"
        element={
          isAdmin ? (
            <AdminLayout />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="users" element={<UsersAdmin />} />
        <Route path="restaurants" element={<Restaurants />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="payments" element={<Payments />} />
        <Route path="orders" element={<Orders />} />
        <Route path="menu-items" element={<MenuItems />} />
        <Route path="deliveries" element={<Deliveries />} />
        <Route path="categories" element={<Categories />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
