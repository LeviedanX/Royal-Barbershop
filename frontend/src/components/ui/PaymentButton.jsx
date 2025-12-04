// src/components/ui/PaymentButton.jsx
import React, { useEffect, useState } from "react";
import { http } from "../../api/http";

// --- ICONS (UANG & DOLAR) ---

// Icon Uang Kertas (Dollar Bill)
const BanknoteIcon = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <circle cx="12" cy="12" r="2" />
    <path d="M6 12h.01M18 12h.01" />
  </svg>
);

// Icon Koin Dolar (Dollar Coin)
const DollarCoinIcon = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v10" />
    <path d="M14.5 9a2.5 2.5 0 0 0-5 0v6a2.5 2.5 0 0 0 5 0" />
  </svg>
);

export default function PaymentButton({
  booking,
  bookingId: bookingIdProp,
  onFinish,
  className = "",
}) {
  const [loading, setLoading] = useState(false);
  const [snapReady, setSnapReady] = useState(
    typeof window !== "undefined" ? !!window.snap : false
  );
  const bookingId = booking?.id || bookingIdProp;

  // --- LOGIC ---
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.snap) {
      setSnapReady(true);
      return;
    }
    const id = setInterval(() => {
      if (window.snap) {
        setSnapReady(true);
        clearInterval(id);
      }
    }, 500);
    return () => clearInterval(id);
  }, []);

  const confirmPayment = async (orderId, tag) => {
    if (!orderId || !bookingId) return;
    try {
      await http.post(`/payments/${bookingId}/confirm`, {
        order_id: orderId,
      });
    } catch (e) {
      console.error(`Confirm payment error (${tag}):`, e);
    }
  };

  const handlePay = async () => {
    if (!bookingId) {
      alert("Booking is not available yet.");
      return;
    }
    if (!snapReady) {
      alert("Payment system is loading...");
      return;
    }

    setLoading(true);
    try {
      const { data } = await http.post(`/payments/${bookingId}/create`);
      const token = data.snap_token || data.payment.snap_token;

      if (!token) throw new Error("Snap token not found");

      window.snap.pay(token, {
        onSuccess: async (result) => {
          await confirmPayment(result.order_id, "success");
          onFinish && onFinish({ status: "success", snapResult: result, bookingId });
        },
        onPending: async (result) => {
          await confirmPayment(result.order_id, "pending");
          onFinish && onFinish({ status: "pending", snapResult: result, bookingId });
        },
        onError: (err) => {
          console.error("Snap error:", err);
          onFinish && onFinish({ status: "error", error: err, bookingId });
        },
        onClose: () => {
          console.log("Closed");
          onFinish && onFinish({ status: "closed", bookingId });
        },
      });
    } catch (err) {
      console.error("Payment Error:", err);
      alert("Failed to initialize payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handlePay}
      disabled={loading || !bookingId}
      className={`
        group relative w-full overflow-hidden rounded-xl
        border border-amber-900/40
        bg-[#0a0a0a]
        px-5 py-4
        text-left
        shadow-[0_8px_25px_-5px_rgba(0,0,0,0.5)]
        transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1)
        hover:border-amber-500/40 hover:shadow-[0_15px_35px_-5px_rgba(180,83,9,0.15)] hover:-translate-y-0.5
        active:translate-y-[1px] active:shadow-none active:scale-[0.99]
        disabled:opacity-60 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {/* --- BACKGROUND TEXTURE (Premium Leather/Grain) --- */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* --- ANIMATED SHEEN (Kilauan Emas Melintas) --- */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent -translate-x-[150%] skew-x-12 transition-transform duration-1000 ease-in-out group-hover:translate-x-[150%]" />

      {/* --- CONTENT LAYOUT --- */}
      <div className="relative flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          {/* Icon Box (Left) */}
          <div
            className={`
            relative flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border 
            transition-all duration-300
            ${
              loading
                ? "border-amber-500/50 bg-amber-950/30 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                : "border-neutral-800 bg-neutral-900 text-neutral-400 group-hover:border-amber-600/40 group-hover:bg-amber-950/10 group-hover:text-amber-400"
            }
          `}
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-[2px] border-current border-t-transparent" />
            ) : (
              <BanknoteIcon className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
            )}

            {/* Subtle Glow behind icon */}
            <div className="absolute inset-0 rounded-lg bg-amber-500/10 blur-md opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </div>

          {/* Text Info */}
          <div className="flex flex-col gap-0.5">
            <span className="font-serif text-[10px] font-bold uppercase tracking-[0.25em] text-amber-700 transition-colors group-hover:text-amber-600">
              {loading ? "Processing..." : "Total Payment"}
            </span>
            <span
              className={`
              text-[15px] font-bold tracking-tight transition-colors duration-300
              ${loading ? "text-amber-500" : "text-neutral-200 group-hover:text-white"}
            `}
            >
              {loading ? "Connecting..." : "Pay Now"}
            </span>
          </div>
        </div>

        {/* Right Side: Midtrans + Coin Icon */}
        <div className="flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-1.5 opacity-50 transition-opacity duration-300 group-hover:opacity-100">
            <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider">
              Midtrans
            </span>
            {/* Indikator Status (Titik Hijau/Amber) */}
            <div
              className={`h-1.5 w-1.5 rounded-full ${
                snapReady
                  ? "bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.8)]"
                  : "bg-amber-500 animate-pulse"
              }`}
            />
          </div>

          <div className="flex items-center gap-1 text-neutral-600 transition-colors duration-300 group-hover:text-amber-500">
            <span className="text-[10px] font-medium hidden sm:inline-block opacity-0 -translate-x-2 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
              Secure
            </span>
            <DollarCoinIcon className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* --- BARBER POLE LOADING ANIMATION (Bottom Strip) --- */}
      {/* Garis Merah-Putih-Biru berputar saat loading */}
      <div
        className={`
        absolute bottom-0 left-0 h-1.5 w-full overflow-hidden transition-all duration-500
        ${loading ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full"}
      `}
      >
        <div className="absolute inset-0 w-[200%] animate-[slide-left_1s_linear_infinite] bg-[repeating-linear-gradient(45deg,#b91c1c,#b91c1c_10px,#f8fafc_10px,#f8fafc_20px,#1d4ed8_20px,#1d4ed8_30px,#f8fafc_30px,#f8fafc_40px)]" />
      </div>

      {/* --- STATIC GOLD BORDER ACCENT (Idle State) --- */}
      <div
        className={`
        absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-amber-600/40 to-transparent transition-opacity duration-300
        ${loading ? "opacity-0" : "opacity-100 group-hover:via-amber-500/80"}
      `}
      />
    </button>
  );
}
