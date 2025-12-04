// src/components/Layout/MainLayout.jsx
import React from "react";
import Navbar from "./Navbar";

export default function MainLayout({ children }) {
  return (
    <div className="relative min-h-screen bg-[#181411] text-amber-50 antialiased selection:bg-amber-900/50 selection:text-amber-100 overflow-x-hidden isolate">
      {/* ===== CSS: Textures & Vintage Animations ===== */}
      <style>{`
        /* Animasi debu halus yang melayang di cahaya lampu */
        @keyframes dustFloat {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          20% { opacity: 0.8; }
          80% { opacity: 0.8; }
          100% { transform: translateY(-40px) translateX(20px); opacity: 0; }
        }
        
        /* Pattern Pinstripe Halus (Background) */
        .bg-pinstripe {
          background-image: repeating-linear-gradient(
            90deg,
            transparent,
            transparent 39px,
            rgba(146, 64, 14, 0.08) 40px
          );
        }
      `}</style>

      {/* ------------------------------------------------
          BACKGROUND LAYERS (ATMOSPHERE)
      ------------------------------------------------ */}

      {/* 1. Base Gradient */}
      <div className="fixed inset-0 -z-50 bg-gradient-to-b from-[#231e1a] to-[#0f0c0a]" />

      {/* 2. Texture: Pinstripe Wall */}
      <div className="fixed inset-0 -z-40 bg-pinstripe opacity-60" />

      {/* 3. Vignette */}
      <div
        className="pointer-events-none fixed inset-0 -z-30"
        style={{
          background:
            "radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.8) 100%)",
        }}
      />

      {/* 4. Film Grain / Noise */}
      <svg className="pointer-events-none fixed inset-0 -z-20 opacity-[0.07] mix-blend-overlay">
        <filter id="noiseFilter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="3"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>

      {/* 5. Lighting: Ambient Warm Glow */}
      <div
        className="pointer-events-none fixed top-[-20%] left-1/2 -z-10 h-[600px] w-[800px] -translate-x-1/2 rounded-full opacity-40 mix-blend-screen"
        style={{
          background:
            "radial-gradient(circle, rgba(217, 119, 6, 0.4) 0%, rgba(146, 64, 14, 0.1) 40%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      {/* ------------------------------------------------
          DEKORASI ANIMASI
      ------------------------------------------------ */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-amber-200/20 blur-[1px]"
            style={{
              width: Math.random() * 4 + 1 + "px",
              height: Math.random() * 4 + 1 + "px",
              top: Math.random() * 100 + "%",
              left: Math.random() * 100 + "%",
              animation: `dustFloat ${10 + Math.random() * 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* ------------------------------------------------
          STRUCTURE (LAYOUT)
      ------------------------------------------------ */}

      {/* Top Trim */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-1 bg-gradient-to-r from-[#451a03] via-[#92400e] to-[#451a03] shadow-md opacity-80" />

      {/* Navbar */}
      <div className="sticky top-0 z-50">
        <div className="absolute inset-0 bg-[#1c1917]/90 backdrop-blur-md border-b border-amber-800/30 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.8)]" />
        <div className="relative">
          <Navbar />
        </div>
      </div>

      {/* Konten Halaman */}
      <main className="relative pt-8 pb-10 px-4 md:px-0">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/20 to-transparent"
          aria-hidden="true"
        />
        {children}
      </main>

      {/* Bottom Trim */}
      <div className="fixed bottom-0 left-0 right-0 z-[60] h-2 bg-[#0f0c0a] border-t border-white/5" />
    </div>
  );
}
