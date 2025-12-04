/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: "class", 
  theme: {
    extend: {
      // --- KONFIGURASI LAMA (TIDAK DIHAPUS) ---
      fontFamily: {
        sans: [
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Text",
          "Segoe UI",
          "sans-serif",
        ],
      },
      colors: {
        // nuansa neon hijau & biru untuk barbershop futuristik
        neon: {
          green: "#22c55e",
          blue: "#38bdf8",
        },
      },
      boxShadow: {
        "neon-card":
          "0 0 30px rgba(34,197,94,0.18), 0 0 60px rgba(56,189,248,0.16)",
      },

      // --- KONFIGURASI BARU (DITAMBAHKAN) ---
      keyframes: {
        // Efek kilau cahaya (shimmer)
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        // Efek barber pole bergerak (slide-left)
        'slide-left': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        }
      },
      animation: {
        shimmer: 'shimmer 2.5s infinite linear',
        'slide-left': 'slide-left 1s linear infinite',
      }
    },
  },
  plugins: [],
};