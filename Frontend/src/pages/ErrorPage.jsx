import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ERROR_CONFIG = {
  401: {
    title: "401",
    message: "You are not authorized. Please login again.",
  },
  403: {
    title: "403",
    message: "Access denied. You don't have permission.",
  },
  404: {
    title: "404",
    message: "This is not the web page you are looking for.",
  },
  500: {
    title: "500",
    message: "Something went wrong on the server.",
  },
};

const ErrorPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, hasRole } = useAuth();

  const status = location.state?.status || 404;
  const error = ERROR_CONFIG[status] || ERROR_CONFIG[404];

  const handleNavigation = () => {
    if (isAuthenticated()) {
      if (hasRole("Admin")) {
        navigate("/admin");
      } else if (hasRole("Customer")) {
        navigate("/customer/all-items");
      } else if (hasRole("Delivery")) {
        navigate("/delivery/dashboard");
      } else if (hasRole("Restaurant")) {
        const restaurantId = localStorage.getItem("restaurantId");
        if (restaurantId) {
          navigate("/restaurant/dashboard");
        } else {
          navigate("/restaurant/select");
        }
      } else {
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 text-center px-6">
      <h1 className="text-7xl font-black text-red-500 mb-4">
        {error.title}
      </h1>


      <p className="text-lg text-gray-600 mb-6">
        {error.message}
      </p>

      <button
        onClick={handleNavigation}
        className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-500 text-white font-semibold shadow-md hover:shadow-lg"
      >
        {isAuthenticated() ? "Go to Dashboard" : "Go to Login"}
      </button>
    </div>
  );
};

export default ErrorPage;