// src/components/ui/QueueList.jsx
import React, { useEffect, useState } from "react";
import { http } from "../../api/http";

// --- ICONS (Minimalist & Sharp) ---
const ScissorIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="6" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <line x1="20" y1="4" x2="8.12" y2="15.88" />
    <line x1="14.47" y1="14.48" x2="20" y2="20" />
    <line x1="8.12" y1="8.12" x2="12" y2="12" />
  </svg>
);

const UserIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const ClockIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const HourglassIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 22h14" />
    <path d="M5 2h14" />
    <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22" />
    <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" />
  </svg>
);

// --- HELPER COMPONENTS ---

// 1. Status Badge (Modern Pill Style)
const StatusBadge = ({ status }) => {
  const s = (status || "").toLowerCase();
  
  let bg = "bg-neutral-800/50";
  let text = "text-neutral-500";
  let border = "border-neutral-700";
  let icon = null;

  if (s.includes("done") || s.includes("selesai")) {
    bg = "bg-emerald-950/20";
    text = "text-emerald-500";
    border = "border-emerald-900/40";
    icon = <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />;
  } else if (s.includes("process") || s.includes("ongoing")) {
    bg = "bg-amber-950/20";
    text = "text-amber-500";
    border = "border-amber-900/40";
    icon = <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />;
  } else if (s.includes("cancel")) {
    bg = "bg-rose-950/20";
    text = "text-rose-500";
    border = "border-rose-900/40";
  } else {
    // Waiting
    bg = "bg-blue-950/20";
    text = "text-blue-400";
    border = "border-blue-900/40";
    icon = <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${border} ${bg} px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${text}`}>
      {icon}
      {status}
    </span>
  );
};

// 2. Active Ticket (The Main Focus)
const ActiveTicket = ({ item }) => (
  <div className="relative overflow-hidden rounded-xl border border-amber-800/40 bg-[#16120f] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] transition-all duration-300 hover:border-amber-600/50 group">
    
    {/* Background Texture (Subtle Noise) */}
    <div className="absolute inset-0 opacity-[0.1] pointer-events-none mix-blend-overlay" 
         style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
    />
    
    {/* Amber Glow Gradient */}
    <div className="absolute right-0 top-0 h-64 w-64 translate-x-1/3 -translate-y-1/3 rounded-full bg-amber-600/10 blur-[80px]" />
    
    {/* Moving Light Shimmer on Border (CSS Animation) */}
    <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-[-100%] h-full w-[50%] skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_3s_infinite]" />
    </div>

    <div className="relative z-10 flex flex-col sm:flex-row">
      
      {/* LEFT: Ticket Number (Perforated Effect) */}
      <div className="flex flex-col items-center justify-center border-b border-dashed border-amber-900/40 bg-[#1f1a16] p-6 sm:w-32 sm:border-b-0 sm:border-r">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600/60">Ticket</span>
        <div className="my-1 font-mono text-4xl font-bold text-amber-500 drop-shadow-[0_2px_10px_rgba(245,158,11,0.25)]">
           {item.queue_number}
        </div>
        <div className="mt-1 flex items-center gap-1.5 rounded-full bg-amber-950/40 px-2 py-0.5 border border-amber-900/30">
           <span className="relative flex h-1.5 w-1.5">
             <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
             <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-500" />
           </span>
           <span className="text-[9px] font-semibold text-amber-400 uppercase">Now Serving</span>
        </div>
        
        {/* Ticket Cutouts (Visual Flair) */}
        <div className="absolute -left-1.5 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-[#0a0a0a]" /> 
        <div className="absolute -right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-[#0a0a0a] sm:hidden" />
      </div>

      {/* RIGHT: Details */}
      <div className="flex-1 p-5 sm:p-6">
         <div className="flex items-start justify-between">
            <div>
               <div className="flex items-center gap-2 mb-1">
                 <UserIcon className="h-3.5 w-3.5 text-stone-500" />
                 <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Guest Client</span>
               </div>
               <h3 className="font-serif text-2xl font-bold text-stone-200 tracking-wide group-hover:text-amber-100 transition-colors">
                  {item.customer.name || "Anonymous"}
               </h3>
               <div className="mt-1 text-xs font-medium text-stone-400">
                  {item.service.name || "Premium Cut"}
               </div>
            </div>
            
            {/* Barber Info Badge */}
            <div className="text-right hidden sm:block">
               <div className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1">Stylist</div>
               <div className="flex items-center justify-end gap-2 text-stone-300">
                  <span className="text-sm font-medium">{item.barber.display_name || "Staff"}</span>
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-stone-800 border border-stone-700">
                    <ScissorIcon className="h-3 w-3 text-stone-400" />
                  </div>
               </div>
            </div>
         </div>

         {/* Mobile Barber Info */}
         <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3 sm:hidden">
            <div className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Stylist</div>
            <div className="text-xs font-medium text-stone-300">{item.barber.display_name || "Staff"}</div>
         </div>
      </div>

    </div>
  </div>
);

// --- MAIN COMPONENT ---
export default function QueueList({ items, autoFetch = false, intervalMs = 4000 }) {
  const [queue, setQueue] = useState(items || []);

  useEffect(() => {
    if (!autoFetch) return;
    const load = () => {
      http.get("/queue").then((res) => setQueue(res.data || [])).catch(console.error);
    };
    load();
    const id = setInterval(load, intervalMs);
    return () => clearInterval(id);
  }, [autoFetch, intervalMs]);

  useEffect(() => {
    if (!autoFetch && items) setQueue(items);
  }, [items, autoFetch]);

  // Logic Filter
  const activeSessions = queue.filter(q => 
    q.status.toLowerCase().includes('process') || q.status.toLowerCase().includes('ongoing')
  );
  
  const upcomingQueue = queue.filter(q => 
    !q.status.toLowerCase().includes('process') && 
    !q.status.toLowerCase().includes('ongoing') && 
    !q.status.toLowerCase().includes('done') &&
    !q.status.toLowerCase().includes('cancel')
  );

  const historyQueue = queue.filter(q => 
    q.status.toLowerCase().includes('done') || q.status.toLowerCase().includes('cancel')
  );

  // Combine waiting + history for the list (Waiting first)
  const listQueue = [...upcomingQueue, ...historyQueue];

  return (
    <div className="flex flex-col gap-8 font-sans">
      
      {/* 1. HERO AREA: ACTIVE SESSIONS */}
      <section aria-label="Active Sessions">
        <div className="mb-3 flex items-center gap-2">
           <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
           <h2 className="font-serif text-sm font-bold uppercase tracking-widest text-stone-400">Currently Serving</h2>
        </div>
        
        {activeSessions.length > 0  (
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
             {activeSessions.map(session => (
               <ActiveTicket key={session.id} item={session} />
             ))}
          </div>
        ) : (
          // Empty State (Shop is Idle)
          <div className="flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-stone-800 bg-[#0f0c0a] py-10 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-stone-900/50 text-stone-600">
               <ClockIcon className="h-5 w-5" />
            </div>
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest">No Active Sessions</h3>
            <p className="text-[10px] text-stone-600 mt-1 font-mono">Floor is clear. Waiting for assignments.</p>
          </div>
        )}
      </section>

      {/* 2. LIST AREA: UPCOMING & HISTORY */}
      <section aria-label="Queue List">
         <div className="mb-3 flex items-center justify-between">
           <h2 className="font-serif text-sm font-bold uppercase tracking-widest text-stone-400">Upcoming & History</h2>
           <span className="font-mono text-xs text-stone-600">Total: {listQueue.length}</span>
         </div>

        <div className="relative overflow-hidden rounded-lg border border-[#2a221d] bg-[#120f0d] shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-stone-800 bg-[#1a1613] text-stone-500">
                <tr>
                  <th className="px-6 py-3 font-bold uppercase tracking-wider font-mono">Ticket</th>
                  <th className="px-6 py-3 font-bold uppercase tracking-wider font-mono">Customer</th>
                  <th className="px-6 py-3 font-bold uppercase tracking-wider font-mono">Stylist</th>
                  <th className="px-6 py-3 font-bold uppercase tracking-wider font-mono text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/40">
                {listQueue.length > 0  (
                  listQueue.map((item, idx) => {
                     // Check if this is the VERY NEXT person waiting
                     const isNext = idx === 0 && !item.status.toLowerCase().includes('done') && !item.status.toLowerCase().includes('cancel'); 
                     
                     return (
                      <tr key={item.id} className={`group transition-colors hover:bg-stone-800/20 ${isNext  'bg-amber-950/10' : ''}`}>
                        <td className="px-6 py-4">
                          <span className={`font-mono text-sm font-bold ${isNext  'text-amber-500' : 'text-stone-400'}`}>
                            #{item.queue_number}
                          </span>
                          {isNext && (
                             <div className="mt-1 flex items-center gap-1 text-[9px] text-amber-600 font-bold uppercase tracking-tighter">
                                <HourglassIcon className="h-2.5 w-2.5" />
                                Next Up
                             </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {/* Avatar Placeholder */}
                            <div className={`flex h-8 w-8 items-center justify-center rounded-md border transition-colors ${isNext  'border-amber-900/40 bg-amber-950/20 text-amber-500' : 'border-stone-800 bg-stone-900 text-stone-600'}`}>
                              <span className="font-serif font-bold">{item.customer.name.charAt(0) || "G"}</span>
                            </div>
                            <div>
                              <div className={`font-medium ${isNext  'text-stone-200' : 'text-stone-400'}`}>{item.customer.name}</div>
                              <div className="text-[10px] text-stone-600">{item.service.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-stone-500 font-mono text-[11px]">
                          {item.barber.display_name || <span className="text-stone-700 italic">Unassigned</span>}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <StatusBadge status={item.status} />
                        </td>
                      </tr>
                     );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center opacity-40">
                         <div className="h-px w-12 bg-stone-700 mb-3" />
                         <span className="text-stone-500 italic font-serif">Queue is currently empty.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      
      {/* Keyframe for Shimmer Animation */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-150%) skewX(-20deg); }
          50% { transform: translateX(150%) skewX(-20deg); }
          100% { transform: translateX(150%) skewX(-20deg); }
        }
      `}</style>
    </div>
  );
}