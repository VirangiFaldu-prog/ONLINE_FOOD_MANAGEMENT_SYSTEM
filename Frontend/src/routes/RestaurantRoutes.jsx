// import { Routes, Route, Navigate } from "react-router-dom";
// import RestaurantLogin from "../pages/restaurant/Login";
// import RestaurantDashboard from "../pages/restaurant/Dashboard";
// import RestaurantMenu from "../pages/restaurant/Menu";
// import RestaurantOrders from "../pages/restaurant/Orders";
// import RestaurantLayout from "../components/restaurant/RestaurantLayout";

// const RestaurantRoutes = () => {
//   // Check if restaurant is logged in (simple check for now)
//   const isAuthenticated = localStorage.getItem("restaurantId") !== null;

//   return (
//     <Routes>
//       <Route path="/login" element={<RestaurantLogin />} />
//       <Route
//         path="/*"
//         element={
//           isAuthenticated ? (
//             <RestaurantLayout>
//               <Routes>
//                 <Route path="/dashboard" element={<RestaurantDashboard />} />
//                 <Route path="/menu" element={<RestaurantMenu />} />
//                 <Route path="/orders" element={<RestaurantOrders />} />
//                 <Route path="/" element={<Navigate to="/restaurant/dashboard" replace />} />
//               </Routes>
//             </RestaurantLayout>
//           ) : (
//             <Navigate to="/restaurant/login" replace />
//           )
//         }
//       />
//     </Routes>
//   );
// };

// export default RestaurantRoutes;

import { Routes, Route, Navigate } from "react-router-dom";
import RestaurantSelect from "../pages/restaurant/RestaurantSelect";
import RestaurantDashboard from "../pages/restaurant/Dashboard";
import RestaurantMenu from "../pages/restaurant/Menu";
import RestaurantOrders from "../pages/restaurant/Orders";
import RestaurantLayout from "../components/restaurant/RestaurantLayout";

const RestaurantRoutes = () => {
  const restaurantId = localStorage.getItem("restaurantId");

  return (
    <Routes>
      {/* Selection always allowed */}
      <Route path="select" element={<RestaurantSelect />} />

      {/* Protected after selection */}
      <Route
        element={
          restaurantId ? (
            <RestaurantLayout />
          ) : (
            <Navigate to="/restaurant/select" replace />
          )
        }
      >
        <Route path="dashboard" element={<RestaurantDashboard />} />
        <Route path="menu" element={<RestaurantMenu />} />
        <Route path="orders" element={<RestaurantOrders />} />
      </Route>

      {/* Default */}
      <Route path="*" element={<Navigate to="select" replace />} />
    </Routes>
  );
};

export default RestaurantRoutes;