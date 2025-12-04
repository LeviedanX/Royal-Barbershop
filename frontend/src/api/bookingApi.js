// src/api/bookingApi.js
import { http } from "./http";

export const bookingApi = {
  // papan antrian publik / global
  async queue() {
    const { data } = await http.get("/queue");
    return data;
  },

  // booking baru (customer)
  async create(payload) {
    // payload: { barber_id, service_id, hairstyle_id?, scheduled_at, coupon_code?, note? }
    const { data } = await http.post("/bookings", payload);
    return data; // berisi barber/service terpilih + queue info
  },

  // booking milik user saat ini (customer / barber / admin tergantung backend)
  async myBookings() {
    const { data } = await http.get("/bookings/my");
    return data;
  },

  // update status booking (barber/admin)
  async updateStatus(id, status) {
    const { data } = await http.patch(`/bookings/${id}/status`, { status });
    return data;
  },

  // tambah review setelah selesai
  async addReview(bookingId, payload) {
    // payload: { rating, comment }
    const { data } = await http.post(
      `/bookings/${bookingId}/review`,
      payload
    );
    return data;
  },
};

export default bookingApi;
