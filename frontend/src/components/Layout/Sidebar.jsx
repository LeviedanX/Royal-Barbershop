// src/components/Layout/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";

/**
 * Sidebar dengan tema "Vintage Control Cabinet"
 * Cocok untuk dashboard Admin/Barber dengan nuansa mewah.
 */
export default function Sidebar({ items = [] }) {
  if (!items.length) return null;

  return (
    <aside
      role="complementary"
      aria-label="Sidebar Navigation"
      className="
        sb-scope relative top-0 h-screen min-w-[16rem] w-64
        border-r border-amber-900/30
        bg-[#181411] text-[#e7e5e4]
        px-4 py-6
        shadow-[5px_0_30px_rgba(0,0,0,0.5)]
        overflow-hidden
        flex flex-col
      "
    >
      {/* --- BACKGROUND TEXTURES --- */}
      {/* 1. Leather Texture Overlay */}
      <div 
        aria-hidden 
        className="pointer-events-none absolute inset-0 -z-30 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')]" 
      />
      
      {/* 2. Warm Vignette (Lighting) */}
      <div 
        aria-hidden 
        className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top_left,rgba(146,64,14,0.15),transparent_70%)]" 
      />

      {/* 3. Subtle Pinstripe (Vintage Wall) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20 opacity-[0.05]"
        style={{
            backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 39px, #d97706 40px)"
        }}
      />

      {/* --- HEADER: BRAND --- */}
      <div className="mb-8 px-2 relative group">
        <div className="flex items-center gap-4">
          {/* Logo Container: 3D Box Effect */}
          <div className="relative h-11 w-11 shrink-0 rounded-lg bg-gradient-to-br from-[#2a221d] to-black border border-amber-800/50 shadow-[0_4px_8px_rgba(0,0,0,0.6)] flex items-center justify-center overflow-hidden">
             {/* Barber Pole Abstract Animation inside Logo */}
             <div className="absolute inset-0 opacity-80">
                <div className="h-[200%] w-[200%] -translate-y-1/4 -translate-x-1/4 bg-[repeating-linear-gradient(45deg,#7f1d1d_0_5px,#fef3c7_5px_10px,#1e3a8a_10px_15px,#fef3c7_15px_20px)] animate-[spin_8s_linear_infinite]" />
             </div>
             {/* Glass overlay */}
             <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-lg" />
             <div className="relative z-10 font-serif font-bold text-amber-100 text-xl drop-shadow-md">B</div>
          </div>

          <div className="flex flex-col justify-center">
             <span className="sb-font-display text-lg font-bold tracking-tight text-stone-200 group-hover:text-amber-400 transition-colors">
               The BARBER<span className="text-amber-600">.</span>
             </span>
             <span className="sb-font-mono text-[9px] uppercase tracking-[0.25em] text-amber-700/80 font-bold">
               Management
             </span>
          </div>
        </div>
        
        {/* Divider Emas di bawah logo */}
        <div className="absolute -bottom-4 left-2 right-2 h-px bg-gradient-to-r from-transparent via-amber-700/40 to-transparent" />
      </div>

      {/* --- NAVIGATION --- */}
      <nav className="flex-1 space-y-2 overflow-y-auto pr-1 sb-scrollbar py-2">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              [
                "group relative flex items-center gap-3 rounded-md px-3 py-3",
                "transition-all duration-300 ease-out",
                "border border-transparent", // Placeholder border
                isActive
                  ? "bg-gradient-to-r from-amber-900/20 to-transparent border-l-amber-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                  : "hover:bg-white/[0.03] hover:text-amber-100 text-stone-400",
                isActive ? "text-amber-400" : "",
              ].join(" ")
            }
          >
            {({ isActive }) => (
                <>
                {/* 1. Active Indicator (Left Bar - Filament Style) */}
                {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r bg-amber-500 shadow-[0_0_10px_#d97706]" />
                )}

                {/* 2. Icon with Glow */}
                {item.icon && (
                  <span
                    className={`
                      relative flex h-6 w-6 items-center justify-center rounded transition-all duration-300
                      ${isActive ? "text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)] scale-110" : "text-stone-500 group-hover:text-amber-200"}
                    `}
                  >
                    {item.icon}
                  </span>
                )}

                {/* 3. Label Text */}
                <span
                  className={`
                    sb-font-sans text-sm font-medium tracking-wide transition-all duration-300
                    ${isActive ? "translate-x-1 font-semibold" : "group-hover:translate-x-1"}
                  `}
                >
                  {item.label}
                </span>

                {/* 4. Background Shine on Hover (Vintage Polish) */}
                <span 
                    className="pointer-events-none absolute inset-0 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                        background: "linear-gradient(120deg, transparent, rgba(255,255,255,0.03), transparent)"
                    }} 
                />
                </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* --- FOOTER: User / System Status --- */}
      <div className="mt-auto border-t border-amber-900/20 pt-4 px-2">
        <div className="rounded-lg bg-black/40 border border-white/5 p-3 flex items-center gap-3">
            {/* Status Indicator Lamp */}
            <div className="relative h-2 w-2 rounded-full bg-green-900 shadow-[0_0_0_1px_rgba(0,0,0,0.8)]">
                <div className="absolute inset-0 rounded-full bg-green-500 animate-pulse opacity-50" />
                <div className="absolute inset-[25%] rounded-full bg-green-400" />
            </div>
            
            <div className="flex flex-col">
                <span className="text-[10px] text-stone-500 uppercase tracking-wider font-bold">System Status</span>
                <span className="text-xs text-amber-500/80 font-mono tracking-widest">ONLINE</span>
            </div>
        </div>
        <div className="mt-2 text-center text-[10px] text-stone-600 sb-font-serif italic">
             Est. 2025 • Classic Cuts
        </div>
      </div>

      {/* --- STYLE INJECTION --- */}
      <style>{`
        /* Import Fonts if not globally available */
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:wght@300..800&family=JetBrains+Mono:wght@400&display=swap');

        .sb-scope {
            /* Palette Override */
            --sb-gold: #d97706;
            --sb-gold-light: #fbbf24;
        }
        
        .sb-font-display { font-family: "Playfair Display", serif; }
        .sb-font-sans { font-family: "Plus Jakarta Sans", sans-serif; }
        .sb-font-mono { font-family: "JetBrains Mono", monospace; }

        /* Custom Scrollbar (Dark & Slim) */
        .sb-scrollbar::-webkit-scrollbar { width: 4px; }
        .sb-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .sb-scrollbar::-webkit-scrollbar-thumb { background: #44403c; border-radius: 4px; }
        .sb-scrollbar::-webkit-scrollbar-thumb:hover { background: #d97706; }
      `}</style>
    </aside>
  );
}