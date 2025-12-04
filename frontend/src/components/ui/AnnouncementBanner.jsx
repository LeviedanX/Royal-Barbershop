// src/components/ui/AnnouncementBanner.jsx
import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../../hooks/useAuth";
import { fetchAnnouncements } from "../../api/announcementApi";

// --- ICONS (Styled as Brass Objects) ---
const BellIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

const ClockIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

// --- HELPER: Relative Time ---
const timeAgo = (dateStr) => {
  if (!dateStr) return "Just now";
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "y ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "mo ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m ago";
  return "Just now";
};

export default function AnnouncementBanner() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const containerRef = useRef(null);

  // === FETCH (via fetchAnnouncements + polling) ===
  useEffect(() => {
    let isMounted = true;

    const loadAnnouncements = async () => {
      try {
        const data = await fetchAnnouncements();
        if (!isMounted) return;
        setAnnouncements(data || []);
      } catch (err) {
        console.error("Failed to fetch announcements:", err);
      }
    };

    // pertama kali
    loadAnnouncements();

    // polling tiap 10 detik
    const intervalId = setInterval(loadAnnouncements, 10000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  // === FILTER ===
  const now = new Date();
  const visible = announcements.filter((a) => {
    if (!a.is_active) return false;

    if (a.target_role && a.target_role !== "all") {
      if (!user || user.role !== a.target_role) return false;
    }

    const start = a.starts_at ? new Date(a.starts_at) : null;
    const end = a.ends_at ? new Date(a.ends_at) : null;
    if (start && now < start) return false;
    if (end && now > end) return false;
    return true;
  });

  // === SHADER MOUSE TRACKING (Golden Spotlight) ===
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      container.style.setProperty("--mouse-x", `${x}px`);
      container.style.setProperty("--mouse-y", `${y}px`);
    };

    container.addEventListener("mousemove", handleMove);
    return () => container.removeEventListener("mousemove", handleMove);
  }, []);

  if (!visible.length) return null;

  return (
    <section
      ref={containerRef}
      className="group relative w-full overflow-hidden rounded-xl border border-amber-900/40 bg-[#14100c] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.8)] transition-all duration-500 hover:border-amber-600/50"
    >
      {/* --- ATMOSPHERE LAYERS --- */}

      {/* 1. Mouse Spotlight (Golden Glow) */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500 group-hover:opacity-100 mix-blend-screen"
        style={{
          background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(217, 119, 6, 0.15), transparent 40%)`,
        }}
      />

      {/* 2. Leather Texture / Noise */}
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      ></div>

      {/* 3. Top Reflection Line (Metallic Sheen) */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-200/20 to-transparent" />

      <div className="relative flex min-h-[110px]">
        {/* --- LEFT SIDE: BRASS PLATE --- */}
        <div className="hidden w-20 flex-col items-center justify-center border-r border-amber-900/30 bg-[#1c1917] py-4 sm:flex relative overflow-hidden">
          {/* Background Highlight for Left Panel */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

          <div className="relative mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#451a03] to-black shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_4px_10px_rgba(0,0,0,0.5)] border border-amber-800/60">
            <BellIcon className="relative z-10 h-5 w-5 text-amber-500 drop-shadow-md animate-[swing_3s_ease-in-out_infinite]" />

            {/* Glow behind icon */}
            <span className="absolute inset-0 rounded-full bg-amber-500/10 blur-md" />
          </div>

          <span className="font-serif text-[8px] font-bold uppercase tracking-[0.2em] text-stone-500 group-hover:text-amber-600 transition-colors">
            NOTICE
          </span>
        </div>

        {/* --- RIGHT SIDE: CONTENT FEED (Digital Paper) --- */}
        <div className="flex-1">
          {/* Mobile Header */}
          <div className="flex items-center gap-3 border-b border-amber-900/30 px-5 py-3 sm:hidden bg-[#1c1917]">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-amber-900/20 ring-1 ring-amber-800/50">
              <BellIcon className="h-4 w-4 text-amber-500" />
            </div>
            <span className="text-xs font-serif font-bold uppercase tracking-widest text-amber-100/80">
              Updates
            </span>
          </div>

          <div className="flex flex-col">
            {visible.map((item, idx) => (
              <article
                key={item.id}
                className={`group/item relative px-6 py-4 transition-all duration-300 ${
                  idx !== visible.length - 1
                    ? "border-b border-amber-900/20"
                    : ""
                } hover:bg-[#2a2420]/40`}
              >
                {/* Vintage "Paper" Highlight on Hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent opacity-0 transition-opacity duration-500 group-hover/item:opacity-100" />

                {/* Left Active Indicator Bar */}
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-amber-500 scale-y-0 transition-transform duration-300 group-hover/item:scale-y-100 origin-bottom shadow-[0_0_8px_rgba(245,158,11,0.8)]" />

                <div className="relative flex items-start justify-between gap-4 pl-2 transition-transform duration-300 group-hover/item:translate-x-1">
                  <div className="space-y-2">
                    <div className="flex items-center flex-wrap gap-2.5">
                      <h4 className="font-serif text-[0.95rem] font-medium text-stone-200 group-hover/item:text-amber-100 transition-colors tracking-wide">
                        {item.title}
                      </h4>

                      {/* === BADGES (Wax Seal / Brass Tag Style) === */}
                      {idx === 0 && (
                        <span className="inline-flex items-center rounded-sm bg-amber-900/60 border border-amber-700/60 px-1.5 py-[2px] text-[9px] font-bold uppercase tracking-widest text-amber-400 shadow-[0_2px_5px_rgba(0,0,0,0.5)] backdrop-blur-sm">
                          New
                          <span className="ml-1 h-1 w-1 rounded-full bg-amber-400 animate-pulse" />
                        </span>
                      )}

                      {item.target_role && item.target_role !== "all" && (
                        <span className="inline-flex items-center px-1.5 py-[2px] text-[9px] font-mono uppercase text-stone-500 border border-stone-800 rounded bg-black/40">
                          Target: {item.target_role}
                        </span>
                      )}
                    </div>

                    <p className="font-sans text-xs leading-relaxed text-stone-400 group-hover/item:text-stone-300 max-w-2xl font-light tracking-wide">
                      {item.content}
                    </p>
                  </div>

                  {/* Timestamp - Digital Nixie Tube Style */}
                  <div className="flex shrink-0 items-center gap-1.5 pt-1 text-[10px] font-mono text-stone-600 transition-colors group-hover/item:text-amber-500/60">
                    <ClockIcon className="h-3 w-3 opacity-70" />
                    <span className="tracking-tighter">
                      {timeAgo(
                        item.created_at || item.starts_at || new Date()
                      )}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      {/* --- CUSTOM KEYFRAMES FOR SWING ANIMATION --- */}
      <style>{`
        @keyframes swing {
          0% { transform: rotate(0deg); }
          10% { transform: rotate(10deg); }
          30% { transform: rotate(-10deg); }
          50% { transform: rotate(5deg); }
          70% { transform: rotate(-5deg); }
          100% { transform: rotate(0deg); }
        }
      `}</style>
    </section>
  );
}
