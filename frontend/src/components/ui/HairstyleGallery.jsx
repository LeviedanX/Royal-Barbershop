// src/components/ui/HairstyleGallery.jsx
import React from "react";

const FALLBACK_IMG = "/images/hairstyles/fade-neon.jpg";

// --- ICONS ---
const ScissorsIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="6" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <line x1="20" y1="4" x2="8.12" y2="15.88" />
    <line x1="14.47" y1="14.48" x2="20" y2="20" />
    <line x1="8.12" y1="8.12" x2="12" y2="12" />
  </svg>
);

const ChairIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M7 13v-3a2 2 0 1 1 4 0v3" />
    <path d="M17 13v-3a2 2 0 1 0-4 0v3" />
    <path d="M5 14h14l-1 5H6l-1-5z" />
    <path d="M6 19v3" />
    <path d="M18 19v3" />
  </svg>
);

const ClockIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const TagIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);

// --- COMPONENTS ---

const EmptyState = () => (
  <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-xl border border-amber-900/30 bg-[#181411] px-6 py-24 text-center shadow-[inset_0_0_40px_rgba(0,0,0,0.6)]">
    <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
         style={{ backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 39px, #d97706 40px)` }} 
    />
    <div className="relative z-10 mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-amber-800/40 bg-[#1c1917] shadow-[0_0_30px_rgba(217,119,6,0.1)] group">
      <ChairIcon className="h-10 w-10 text-stone-600 group-hover:text-amber-500 transition-colors duration-500" />
      <div className="absolute inset-0 rounded-full border border-amber-500/20 animate-ping opacity-20" />
    </div>
    <h3 className="relative z-10 font-serif text-xl font-bold tracking-widest text-stone-300">
      NO STYLES AVAILABLE
    </h3>
    <p className="relative z-10 mt-3 max-w-xs font-sans text-sm font-light leading-relaxed text-stone-500">
      No hairstyle references available in your digital showcase.
    </p>
    <div className="absolute bottom-[-50px] left-1/2 h-[100px] w-[300px] -translate-x-1/2 rounded-full bg-amber-600/10 blur-[60px]" />
  </div>
);

export default function HairstyleGallery({ hairstyles = [], onSelect, selectedId }) {
  if (!hairstyles.length) return <EmptyState />;

  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 px-2 py-4">
      {hairstyles.map((style) => (
        <HairstyleCard
          key={style.id}
          style={style}
          onSelect={onSelect}
          selectedId={selectedId}
        />
      ))}
      {/* Inject custom scan animation */}
      <style>{`
        @keyframes scanline {
          0% { top: -10%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 110%; opacity: 0; }
        }
        .group:hover .animate-scan {
          animation: scanline 1.5s linear infinite;
        }
      `}</style>
    </div>
  );
}

function HairstyleCard({ style, onSelect, selectedId }) {
  const handleImgError = (e) => {
    e.target.src = FALLBACK_IMG;
  };

  const isSelected =
    selectedId !== undefined && String(selectedId) === String(style.id);

  // Fallback values when service details are missing
  const defaultService = style.default_service || {};
  const duration = defaultService.duration || "30m";
  const priceValue = defaultService.price;
  const price = priceValue
    ? `${Math.round(priceValue / 1000)}k`
    : "Starts 40k";

  return (
    <button
      type="button"
      onClick={() => onSelect && onSelect(style)}
      className={[
        "group relative flex aspect-[3/4.5] w-full flex-col bg-transparent perspective-1000 cursor-pointer transition-transform duration-200",
        isSelected ? "ring-2 ring-amber-400 shadow-[0_0_18px_rgba(251,191,36,0.35)]" : "hover:-translate-y-0.5",
      ].join(" ")}
      aria-pressed={isSelected}
    >
      {isSelected && (
        <div className="absolute top-2 right-2 z-20 inline-flex items-center gap-1 rounded-full bg-emerald-600/90 px-2 py-[2px] text-[9px] font-semibold text-emerald-50 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
          <span className="h-1.5 w-1.5 rounded-full bg-white" />
          Selected
        </div>
      )}
      {/* --- POLAROID SHADOW & STACK EFFECT --- */}
      <div className="absolute inset-0 translate-y-2 rounded-sm bg-[#110e0c] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8)] transition-transform duration-500 group-hover:translate-y-4 group-hover:rotate-1" />

      <div className="relative flex h-full w-full flex-col overflow-hidden rounded-sm border-[4px] border-[#e5e5e5] bg-[#e5e5e5] shadow-lg transition-all duration-500 group-hover:-translate-y-1 group-hover:rotate-[-1deg] group-hover:border-amber-100 group-hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)]">
        
        {/* --- IMAGE AREA --- */}
        <div className="relative h-[80%] w-full overflow-hidden bg-stone-900">
          
          <img
            src={style.image_url || FALLBACK_IMG}
            alt={style.name}
            onError={handleImgError}
            loading="lazy"
            className="h-full w-full object-cover grayscale-[0.6] sepia-[0.3] contrast-[1.1] transition-all duration-700 ease-in-out group-hover:scale-105 group-hover:grayscale-0 group-hover:sepia-0 group-hover:contrast-100"
          />
          
          {/* 1. Dust/Grain Texture Overlay (Always visible for vintage feel) */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-overlay" 
               style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
          />

          {/* 2. Vignette (Dark corners) */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.4)_100%)] opacity-60 group-hover:opacity-20 transition-opacity duration-500" />
          
          {/* 3. REPLACEMENT: "Scanner" Effect on Hover */}
          <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/80 to-transparent shadow-[0_0_8px_rgba(251,191,36,0.8)] opacity-0 animate-scan pointer-events-none z-20" />

          {/* 4. REPLACEMENT: HUD Info Overlay (Muncul di pojok bawah gambar) */}
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-2 opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 z-10">
              
              {/* Gradient background for text readability */}
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/80 to-transparent -z-10" />

              {/* Time Badge */}
              <div className="flex items-center gap-1 text-[10px] font-mono text-stone-300">
                 <ClockIcon className="h-3 w-3 text-amber-500" />
                 <span>{duration}</span>
              </div>

              {/* Price Badge */}
              <div className="flex items-center gap-1 rounded bg-amber-950/80 px-1.5 py-0.5 border border-amber-500/30 shadow-sm backdrop-blur-sm">
                 <TagIcon className="h-2.5 w-2.5 text-amber-400" />
                 <span className="text-[10px] font-mono font-bold text-amber-400 tracking-wide">{price}</span>
              </div>
          </div>

          {/* Top-Right Badge: Category (Paper Clip Style) */}
          <div className="absolute -right-6 top-3 w-28 rotate-45 bg-amber-700 shadow-md transition-colors group-hover:bg-amber-600">
            <p className="text-center text-[9px] font-bold uppercase leading-5 tracking-widest text-white drop-shadow-sm border-y border-white/20">
               {style.category || "TOP"}
            </p>
          </div>
        </div>

        {/* --- CAPTION AREA (Bottom of Polaroid) --- */}
        <div className="relative flex h-[20%] flex-col justify-center px-3 text-center bg-[#f5f5f4] group-hover:bg-[#fafaf9] transition-colors border-t border-stone-200">
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]" />

          <h4 className="relative z-10 truncate font-serif text-lg font-bold text-[#292524] transition-colors group-hover:text-amber-900">
             {style.name}
          </h4>
          
          {style.default_service && (
             <div className="relative z-10 mt-0.5 flex items-center justify-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
               <ScissorsIcon className="h-3 w-3 text-amber-700" />
               <p className="truncate font-sans text-[10px] font-medium uppercase tracking-wider text-stone-600">
                 {style.default_service.name}
               </p>
             </div>
          )}
        </div>
      </div>

      {/* --- DECORATIVE: Tape (Hilang saat diambil/hover) --- */}
      <div className="absolute -top-3 left-1/2 h-8 w-24 -translate-x-1/2 rotate-[-2deg] bg-white/40 backdrop-blur-[1px] shadow-sm opacity-70 transition-all duration-300 group-hover:opacity-0 group-hover:-translate-y-4" />
    </button>
  );
}
