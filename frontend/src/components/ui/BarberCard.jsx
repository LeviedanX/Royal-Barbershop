// src/components/ui/BarberCard.jsx
import React from "react";

// --- ICONS (Custom Styled for Vintage Theme) ---
const VerifiedIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.498 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.491 4.491 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
  </svg>
);

const StarIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
  </svg>
);

export default function BarberCard({ barber, onSelect }) {
  if (!barber) return null;

  const avgRating = barber.avg_rating ?? barber.rating ?? 0;
  const totalOrders = barber.total_completed ?? barber.total_orders ?? 0;
  const price = Number((barber.base_price ?? barber.price ?? 0) || 0);
  const name = barber.display_name || barber.user?.name || "Unknown Barber";
  const initials = name.match(/\b(\w)/g).join("").slice(0, 2) || "BR";
  const avatarUrl = barber.avatar_url || barber.user.avatar_url;

  const handleSelect = () => {
    if (onSelect) onSelect(barber);
  };

  return (
    <div
      className="group relative h-full w-full cursor-pointer select-none perspective-1000"
      onClick={handleSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleSelect()}
    >
      {/* --- MAIN CARD CONTAINER --- */}
      <div className="relative flex h-full flex-col overflow-hidden rounded-xl border border-[#451a03] bg-[#181411] shadow-[0_10px_20px_-5px_rgba(0,0,0,0.5)] transition-all duration-500 ease-out group-hover:-translate-y-2 group-hover:shadow-[0_20px_30px_-10px_rgba(0,0,0,0.6),0_0_15px_rgba(217,119,6,0.1)]">
        
        {/* --- VINTAGE TEXTURE BACKGROUND --- */}
        {/* Leather Texture Overlay */}
        <div className="absolute inset-0 opacity-[0.08] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')]" />
        
        {/* Pinstripe Pattern (Subtle Wall Effect) */}
        <div className="absolute inset-0 opacity-[0.03]" 
             style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 19px, #d97706 20px)' }} 
        />

        {/* Top Metallic Sheen (Reflection) */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

        {/* --- HEADER: RANK & STATUS --- */}
        <div className="relative z-10 flex items-center justify-between p-4 pb-2">
           {/* Rank Badge (Brass Tag Style) */}
           <div className="flex items-center gap-1.5 rounded-sm border border-amber-700/50 bg-gradient-to-b from-[#2a221d] to-[#181411] px-2.5 py-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
             <span className="font-serif text-[10px] font-bold uppercase tracking-wider text-amber-500">
               #{barber.rank || "-"}
             </span>
             <span className="h-2.5 w-[1px] bg-amber-900/50"></span>
             <span className="font-serif text-[9px] font-medium text-amber-200/60 uppercase tracking-wide">Master Barber</span>
           </div>

           {/* Status Indicator (Vintage Lamp Style) */}
           <div className="flex items-center gap-1.5">
             <span className="relative flex h-2.5 w-2.5">
               <span className="absolute inline-flex h-full w-full animate-pulse rounded-full bg-green-500/40"></span>
               <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-[0_0_5px_rgba(34,197,94,0.6)] border border-green-300/20"></span>
             </span>
             <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-green-500/80">Available</span>
           </div>
        </div>

        {/* --- PROFILE SECTION (Photo Frame) --- */}
        <div className="relative z-10 flex flex-col items-center px-4 pt-4 pb-3">
          
          {/* Avatar Container with Brass Frame */}
          <div className="relative mb-3 group-hover:scale-105 transition-transform duration-500">
            {/* Outer Frame Ring */}
            <div className="absolute -inset-[3px] rounded-full bg-gradient-to-br from-amber-300 via-amber-600 to-amber-900 opacity-80 shadow-[0_2px_4px_rgba(0,0,0,0.4)]" />
            
            {/* Main Avatar */}
            <div className="relative h-20 w-20 overflow-hidden rounded-full border-[3px] border-[#181411] bg-[#0f0c0a] shadow-inner">
              {avatarUrl ? (
                <img src={avatarUrl} alt={name} className="h-full w-full object-cover sepia-[0.2] contrast-110" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_center,#451a03,#181411)]">
                  <span className="font-serif text-2xl font-bold text-amber-500/70">{initials}</span>
                </div>
              )}
            </div>

            {/* Verified Badge (Wax Seal Style) */}
            <div className="absolute bottom-0 right-0 translate-x-1 translate-y-1">
               <div className="relative flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border border-blue-300/30 shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                  <VerifiedIcon className="h-3.5 w-3.5 text-blue-50 drop-shadow-sm" />
               </div>
            </div>
          </div>

          {/* Name & Role */}
          <div className="text-center mt-2">
            <h3 className="font-serif text-lg font-bold text-[#e7e5e4] group-hover:text-amber-100 transition-colors tracking-tight">
              {name}
            </h3>
            <p className="mt-1 text-xs font-medium text-amber-200/50 uppercase tracking-widest font-sans">
              {barber.skill_level || "Professional Groomer"}
            </p>
          </div>
        </div>

        {/* --- STATS WIDGETS (Dashboard Gauges) --- */}
        <div className="relative z-10 grid grid-cols-2 gap-3 px-4 py-3 bg-[#110e0c]/50 border-y border-amber-900/20">
          {/* Rating */}
          <div className="flex flex-col items-center justify-center p-1.5">
             <div className="flex items-center gap-1 text-amber-400">
                <StarIcon className="h-3.5 w-3.5 drop-shadow-[0_0_3px_rgba(251,191,36,0.4)]" />
                <span className="font-mono text-sm font-bold">{Number(avgRating).toFixed(1)}</span>
             </div>
             <span className="text-[9px] text-stone-500 uppercase tracking-wide font-sans mt-0.5">{barber.reviews_count} Reviews</span>
          </div>
          
          {/* Orders (Separated by vertical divider) */}
          <div className="relative flex flex-col items-center justify-center p-1.5">
             <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-px bg-amber-900/30" /> {/* Divider */}
             <div className="flex items-center gap-1 text-amber-100">
                <span className="font-mono text-sm font-bold">{totalOrders}</span>
                <span className="text-[9px] font-bold uppercase text-amber-500/80 tracking-wider">Cuts</span>
             </div>
             <span className="text-[9px] text-stone-500 uppercase tracking-wide font-sans mt-0.5">Completed</span>
          </div>
        </div>

        {/* --- FOOTER ACTION --- */}
        <div className="relative mt-auto p-4 bg-gradient-to-b from-[#181411] to-[#0f0c0a]">
          <div className="flex items-center justify-between gap-3">
            
            {/* Price Tag */}
            <div className="flex flex-col">
               <span className="font-sans text-[9px] font-bold uppercase tracking-wider text-stone-500">Starting Price</span>
               <div className="flex items-baseline gap-1 text-amber-100 mt-0.5">
                 <span className="font-serif text-xs text-amber-500 font-bold">Rp</span>
                 <span className="font-mono text-lg font-bold tracking-tight">{Number(price).toLocaleString("id-ID")}</span>
               </div>
            </div>

            {/* Book Button (Polished Brass/Gold Style) */}
            <button className="group/btn relative flex h-10 px-6 items-center justify-center overflow-hidden rounded-md bg-gradient-to-b from-amber-500 to-amber-700 font-bold text-[#3a1f04] shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_2px_4px_rgba(0,0,0,0.4)] transition-all duration-300 hover:from-amber-400 hover:to-amber-600 hover:shadow-[0_0_15px_rgba(217,119,6,0.5)] active:scale-95">
               {/* Metallic Shine Effect */}
               <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-[120%] skew-x-[-20deg] transition-transform duration-700 ease-in-out group-hover/btn:translate-x-[120%]" />
               
               <span className="relative z-10 flex items-center gap-1 font-serif uppercase tracking-wider text-sm">
                 Book Now
               </span>
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}
