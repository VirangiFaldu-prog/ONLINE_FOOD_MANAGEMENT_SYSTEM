const DELIVERY_API = "https://localhost:7217/api/Delivery";

import axiosInstance from "../../api/axiosInstance";

export const getDeliveryUserId = () => {
  const raw = localStorage.getItem("deliveryUserId");
  return raw ? parseInt(raw, 10) : null;
};

export const fetchDeliveries = async () => {
  const deliveryUserId = getDeliveryUserId();
  if (!deliveryUserId) {
    throw new Error("Delivery user ID not found");
  }

  const res = await axiosInstance.get(`${DELIVERY_API}/delivery-user/${deliveryUserId}`);
  return Array.isArray(res.data) ? res.data : [];
};

export const updateDeliveryStatus = async (deliveryId, deliveryStatus) => {
  const res = await axiosInstance.patch(`${DELIVERY_API}/${deliveryId}/status?status=${encodeURIComponent(deliveryStatus)}`);
  return true;
};


