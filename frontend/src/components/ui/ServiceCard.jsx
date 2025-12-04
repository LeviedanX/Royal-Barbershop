// src/components/ui/ServiceCard.jsx
import React from "react";

export default function ServiceCard({ service, selected, onSelect }) {
  if (!service) return null;

  const price = (service.base_price ?? service.price ?? 0) || 0;
  const isBundle = !!service.is_bundle;
  const duration = service.duration_minutes;

  return (
    <button
      type="button"
      onClick={() => onSelect && onSelect(service)}
      className={[
        // Layout wrapper: max-w-sm agar tidak terlalu lebar (horizontal)
        "group relative w-full max-w-[360px] mx-auto text-left perspective-1000",
        "transition-all duration-300 ease-out",
        selected ? "scale-[1.02] z-10" : "hover:scale-[1.02] hover:z-10",
      ].join(" ")}
    >
      {/* --- 3D GLOW BACKDROP --- */}
      <div
        className={[
          "absolute -inset-[1px] rounded-lg opacity-0 transition-opacity duration-500 blur-sm",
          selected
            ? "opacity-100 bg-gradient-to-r from-amber-600/40 via-yellow-500/20 to-amber-600/40"
            : "group-hover:opacity-50 bg-gradient-to-r from-amber-900/20 via-amber-600/10 to-amber-900/20",
        ].join(" ")}
      />

      {/* --- MAIN CARD --- */}
      <div
        className={[
          "relative h-full overflow-hidden rounded-lg border transition-all duration-300",
          "bg-[#0a0a0a]", // Lebih gelap (Deep Black)
          selected
            ? "border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.1)] translate-y-[-1px]"
            : "border-neutral-800 group-hover:border-amber-500/30 group-hover:shadow-[0_4px_12px_rgba(0,0,0,0.6)]",
      ].join(" ")}
      >
        {/* --- TEXTURES --- */}
        <div className="pointer-events-none absolute inset-0 z-0">
           {/* Micro-grid pattern */}
          <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(to_right,#444_1px,transparent_1px),linear-gradient(to_bottom,#444_1px,transparent_1px)] [background-size:14px_14px]" />
          <div className="absolute inset-0 opacity-20 mix-blend-overlay [background-image:url('https://grainy-gradients.vercel.app/noise.svg')]" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/50 to-[#0a0a0a]/80" />
        </div>

        {/* --- BARBER POLE ACCENT (Right Edge) --- */}
        <div className="absolute right-0 top-0 bottom-0 w-[3px] overflow-hidden border-l border-white/5">
            <div className="absolute inset-0 w-full h-[200%] -translate-y-1/2 bg-[repeating-linear-gradient(45deg,#92400e_0px,#92400e_4px,#171717_4px,#171717_8px,#b91c1c_8px,#b91c1c_12px,#171717_12px,#171717_16px)] opacity-50 group-hover:opacity-90 transition-opacity duration-500 animate-[barberpole_12s_linear_infinite]" />
        </div>

        {/* --- GOLD SHEEN ANIMATION --- */}
        <div className="pointer-events-none absolute -inset-[150%] z-10 block opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden">
             <div className="absolute inset-0 rotate-[25deg] translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-[1.2s] ease-in-out bg-gradient-to-r from-transparent via-amber-200/5 to-transparent blur-[2px]" />
        </div>

        {/* --- CONTENT (Compact & Dense) --- */}
        <div className="relative z-20 flex flex-col p-2.5">
          
          {/* Top Row: Name & Badges */}
          <div className="flex justify-between items-start mb-1.5 gap-2">
             <div className="flex flex-col gap-0.5">
                <h3 className={[
                    "font-serif text-sm font-semibold tracking-wide transition-colors duration-300",
                    selected ? "text-amber-300 text-shadow-gold" : "text-neutral-200 group-hover:text-amber-100"
                ].join(" ")}>
                    {service.name}
                </h3>
                
                {/* Badges Row */}
                <div className="flex items-center gap-1.5">
                    {service.category && (
                        <span className="text-[8px] uppercase tracking-widest text-neutral-500 group-hover:text-amber-500/70 transition-colors">
                            {service.category}
                        </span>
                    )}
                    {isBundle && (
                        <span className="inline-flex items-center px-1 py-[0.5px] rounded-[1px] bg-amber-900/30 border border-amber-600/40 text-[8px] font-bold text-amber-500 tracking-wider">
                            BUNDLE
                        </span>
                    )}
                </div>
             </div>

             {/* Price (Moved to top right for ticket feel) */}
             <div className="text-right shrink-0 bg-neutral-900/50 px-2 py-1 rounded border border-white/5 backdrop-blur-sm group-hover:border-amber-500/20 transition-colors">
                <div className="text-[7px] uppercase tracking-wider text-neutral-500 mb-[1px]">Start From</div>
                <div className={[
                    "text-sm font-bold tabular-nums tracking-tight leading-none",
                    selected ? "text-amber-400" : "text-neutral-300 group-hover:text-amber-300"
                ].join(" ")}>
                    <span className="text-[10px] mr-0.5 font-normal text-neutral-500">Rp</span>
                    {Number(price).toLocaleString("id-ID")}
                </div>
             </div>
          </div>

          {/* Divider */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-neutral-800 to-transparent group-hover:via-amber-700/30 transition-colors duration-500 mb-2" />

          {/* Bottom Row: Desc & Duration */}
          <div className="flex items-center justify-between gap-3">
             <p className="text-[9px] leading-relaxed text-neutral-500 font-sans line-clamp-1 flex-1 group-hover:text-neutral-400 transition-colors">
              {service.description || "Premium grooming service."}
             </p>
             
             {duration && (
                <div className="flex items-center gap-1 text-[9px] font-medium text-amber-600/80 bg-amber-950/10 px-1.5 py-0.5 rounded border border-amber-900/20">
                    <svg className="w-2 h-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {duration}m
                </div>
             )}
          </div>

        </div>
      </div>
      
      <style>{`
        .text-shadow-gold {
          text-shadow: 0 0 10px rgba(251, 191, 36, 0.25);
        }
        @keyframes barberpole {
          from { background-position: 0 0; }
          to { background-position: 0 16px; }
        }
      `}</style>
    </button>
  );
}
