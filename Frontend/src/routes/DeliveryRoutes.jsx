import { Routes, Route, Navigate } from "react-router-dom";
import DeliveryDashboard from "../pages/delivery/Dashboard";
import DeliveryDeliveries from "../pages/delivery/Deliveries";
import DeliveryDetail from "../pages/delivery/DeliveryDetail";
import DeliveryHistory from "../pages/delivery/History";
import DeliveryEarnings from "../pages/delivery/Earnings";
import DeliveryProfile from "../pages/delivery/Profile";
import DeliveryLayout from "../components/delivery/DeliveryLayout";
import { useAuth } from "../contexts/AuthContext";

const DeliveryRoutes = () => {
  const { isAuthenticated, hasRole } = useAuth();
  const isDelivery = isAuthenticated() && hasRole("Delivery");

  return (
    <Routes>
      <Route
        path="/*"
        element={
          isDelivery ? (
            <DeliveryLayout>
              <Routes>
                <Route path="/dashboard" element={<DeliveryDashboard />} />
                <Route path="/deliveries" element={<DeliveryDeliveries />} />
                <Route path="/deliveries/:deliveryId" element={<DeliveryDetail />} />
                <Route path="/history" element={<DeliveryHistory />} />
                <Route path="/earnings" element={<DeliveryEarnings />} />
                <Route path="/profile" element={<DeliveryProfile />} />
                <Route path="/" element={<Navigate to="/delivery/dashboard" replace />} />
              </Routes>
            </DeliveryLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
};

export default DeliveryRoutes;


