// Utility functions for restaurant authentication

export const getRestaurantId = () => {
  return localStorage.getItem("restaurantId");
};

export const getRestaurantName = () => {
  return localStorage.getItem("restaurantName");
};

export const getUserId = () => {
  return localStorage.getItem("userId");
};

export const isRestaurantAuthenticated = () => {
  return getRestaurantId() !== null;
};

export const logoutRestaurant = () => {
  localStorage.removeItem("restaurantId");
  localStorage.removeItem("restaurantName");
  localStorage.removeItem("userId");
  sessionStorage.clear();
};

export const getCurrentRestaurant = () => {
  return {
    id: getRestaurantId(),
    name: getRestaurantName(),
    userId: getUserId()
  };
};