// src/api/paymentApi.js
import { http } from "./http";

export const paymentApi = {
  // minta Snap token dari backend untuk 1 booking
  async createSnap(bookingId) {
    const { data } = await http.post(`/payments/${bookingId}/create`);
    return data; // { snap_token, payment: {...} }
  },

  // konfirmasi status ke backend setelah Snap selesai/pending
  async confirmStatus(bookingId, orderId) {
    const { data } = await http.post(`/payments/${bookingId}/confirm`, {
      order_id: orderId,
    });
    return data;
  },

  // callback Midtrans ditangani backend; biasanya public endpoint
  async midtransCallback(payload) {
    const { data } = await http.post("/midtrans/callback", payload);
    return data;
  },
};

export default paymentApi;
