/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: "class", 
  theme: {
    extend: {
      // --- LEGACY CONFIG (KEPT) ---
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
        // Neon green and blue palette for a futuristic barbershop feel
        neon: {
          green: "#22c55e",
          blue: "#38bdf8",
        },
      },
      boxShadow: {
        "neon-card":
          "0 0 30px rgba(34,197,94,0.18), 0 0 60px rgba(56,189,248,0.16)",
      },

      // --- NEW CONFIG (ADDED) ---
      keyframes: {
        // Shimmer light effect
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        // Animated barber pole stripes (slide-left)
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
