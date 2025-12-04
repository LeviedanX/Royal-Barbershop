// src/api/bookingApi.js
import { http } from "./http";

export const bookingApi = {
  // Public/global queue board
  async queue() {
    const { data } = await http.get("/queue");
    return data;
  },

  // New booking (customer)
  async create(payload) {
    // payload: { barber_id, service_id, hairstyle_id, scheduled_at, coupon_code, note }
    const { data } = await http.post("/bookings", payload);
    return data; // includes selected barber/service + queue info
  },

  // Bookings for the current user (customer / barber / admin depending on backend)
  async myBookings() {
    const { data } = await http.get("/bookings/my");
    return data;
  },

  // Update booking status (barber/admin)
  async updateStatus(id, status) {
    const { data } = await http.patch(`/bookings/${id}/status`, { status });
    return data;
  },

  // Add review after completion
  async addReview(bookingId, payload) {
    // payload: { rating, comment }
    const { data } = await http.post(`/bookings/${bookingId}/review`, payload);
    return data;
  },
};

export default bookingApi;
