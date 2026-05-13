import axiosInstance from "./axiosInstance";
const ORDER_API = "/Order";

export const createOrder = async (orderData) => {
  try {
    console.log("Creating order with data:", JSON.stringify(orderData, null, 2));

    const response = await axiosInstance.post(
      `${ORDER_API}`,
      orderData
    );

    console.log("Order creation response:", response);

    return {
      success: true,
      data: response.data,
      status: response.status,
    };
  } catch (error) {
    console.error("Order creation error:", error);

    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.response?.data ||
        error.message ||
        "Failed to create order",
      status: error.response?.status,
    };
  }
};

export const createOrderItem = async (orderId, orderItemData) => {
  try {
    const response = await axiosInstance.post(
      `${ORDER_API}Item/${orderId}`,
      orderItemData
    );
    return {
      success: true,
      data: response.data,
      status: response.status,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      status: error.response?.status,
    };
  }
};


export const getUserOrders = async () => {
  try {
    const response = await axiosInstance.get(`${ORDER_API}/user`);
    return {
      success: true,
      data: response.data,
      status: response.status,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      status: error.response?.status,
    };
  }
};

export const getRestaurantOrders = async (restaurantId) => {
  try {
    const response = await axiosInstance.get(
      `${ORDER_API}/restaurant/${restaurantId}`
    );
    return {
      success: true,
      data: response.data,
      status: response.status,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      status: error.response?.status,
    };
  }
};


export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await axiosInstance.patch(
      `${ORDER_API}/${orderId}/status?status=${status}`,
      {}
    );
    return {
      success: true,
      data: response.data,
      status: response.status,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      status: error.response?.status,
    };
  }
};


export const cancelOrder = async (orderId) => {
  try {
    const response = await axiosInstance.delete(`${ORDER_API}/${orderId}`);
    return {
      success: true,
      data: response.data,
      status: response.status,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      status: error.response?.status,
    };
  }
};


export const getOrderItems = async (orderId) => {
  try {
    const response = await axiosInstance.get(`/OrderItem/order/${orderId}`);
    return {
      success: true,
      data: response.data,
      status: response.status,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      status: error.response?.status,
    };
  }
};


export const updateOrderItem = async (orderItemId, quantity) => {
  try {
    const response = await axiosInstance.put(`/OrderItem/${orderItemId}`, {
      quantity,
    });
    return {
      success: true,
      data: response.data,
      status: response.status,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      status: error.response?.status,
    };
  }
};


export const deleteOrderItem = async (orderItemId) => {
  try {
    const response = await axiosInstance.delete(`/OrderItem/${orderItemId}`);
    return {
      success: true,
      data: response.data,
      status: response.status,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      status: error.response?.status,
    };
  }
};