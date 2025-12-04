// src/pages/QueueScreen.jsx
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import MainLayout from "../components/Layout/MainLayout";
import RealtimeClock from "../components/ui/RealtimeClock";
import AnnouncementBanner from "../components/ui/AnnouncementBanner";
import useQueuePolling from "../hooks/useQueuePolling";

// --- VISUAL ASSETS (FROM GALLERY PAGE) ---

// 1. Gold Dust Particles
const FloatingParticles = () => {
  const particles = Array.from({ length: 25 });
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            opacity: 0,
          }}
          animate={{
            y: [null, Math.random() * -150],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: Math.random() * 15 + 10,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 5,
          }}
          className="absolute w-[2px] h-[2px] bg-amber-400 rounded-full blur-[0.5px] shadow-[0_0_5px_#fbbf24]"
        />
      ))}
    </div>
  );
};

// 2. The Scanning Beam Effect
const ScannerBeam = () => (
  <motion.div
    initial={{ top: "-10%" }}
    animate={{ top: "110%" }}
    transition={{ duration: 8, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
    className="absolute left-0 right-0 h-[200px] bg-gradient-to-b from-transparent via-amber-500/5 to-transparent pointer-events-none z-0 mix-blend-screen"
  />
);

// --- ANIMATION VARIANTS ---
const revealVar = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1, 
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
  },
};

const containerStagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

export default function QueueScreen() {
  const { queue, reload } = useQueuePolling({ autoStart: true, intervalMs: 4000 });

  useEffect(() => {
    // animasi setiap kali data queue berubah (Logika asli dipertahankan)
    if (!queue || queue.length === 0) return;
    gsap.from(".queue-row", {
      opacity: 0,
      y: 10,
      duration: 0.4,
      stagger: 0.03,
      ease: "power2.out",
    });
  }, [queue]);

  return (
    <MainLayout>
      {/* --- CSS INJECTION (SHARED STYLES) --- */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Italiana&family=Manrope:wght@300;400;600;800&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap');
        
        .font-royal { font-family: 'Cinzel', serif; }
        .font-vintage { font-family: 'Italiana', serif; }
        .font-tech { font-family: 'Space Mono', monospace; }
        .font-modern { font-family: 'Manrope', sans-serif; }
      `}</style>

      {/* --- BACKGROUND ATMOSPHERE (FIXED BEHIND CONTENT) --- */}
      <div className="fixed inset-0 z-0 bg-[#050505]">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#030303] to-[#000000]" />
          <ScannerBeam />
          <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-amber-600/10 blur-[150px] rounded-full" />
          <FloatingParticles />
          <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] opacity-10" />
      </div>

      {/* --- MAIN CONTENT WRAPPER --- */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 space-y-8 min-h-[calc(100vh-4rem)] flex flex-col">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-6 relative">
            <motion.div
              variants={containerStagger}
              initial="hidden"
              animate="visible"
              className="flex-1"
            >
              <motion.div variants={revealVar} className="flex items-center gap-2 mb-2">
                 <span className="font-tech text-xs text-amber-500 tracking-[0.3em] uppercase"> </span>
              </motion.div>

              <motion.h1 variants={revealVar} className="font-vintage text-4xl md:text-5xl text-slate-100 leading-tight">
                Papan Antrian <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-600">BARBERSHOP</span>
              </motion.h1>

            <motion.div variants={revealVar} className="mt-6 relative pl-6 group">
                
                {/* 1. The Cyber Spine (Garis Vertikal Neon) */}
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-amber-400 via-amber-600 to-transparent shadow-[0_0_12px_rgba(245,158,11,0.6)] rounded-full opacity-80 group-hover:opacity-100 transition-all duration-500" />
                
                {/* 2. Tech Label (Badge Kecil) */}
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-1 bg-amber-500 rounded-full animate-pulse" />
                    <span className="font-tech text-[9px] text-amber-500 tracking-[0.2em] uppercase bg-amber-900/20 px-2 py-[2px] rounded border border-amber-500/20">
                      Display Mode
                    </span>
                </div>

                {/* 3. The Content (Copywriting yang lebih Profesional) */}
                <p className="font-modern text-xs md:text-sm text-slate-400 max-w-xl leading-[1.8]">
                  Dioptimalkan untuk layanan anda  di <span className="text-slate-200 font-semibold border-b border-slate-600 border-dashed">BARBERSHOP</span> kami. 
                  Sistem melakukan sinkronisasi data antrian secara <span className="text-amber-400 font-tech text-[10px] tracking-wider font-bold">REAL-TIME</span> tanpa perlu intervensi manual.
                </p>

                {/* 4. Subtle Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent -z-10 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            </motion.div>
            </motion.div>
        </header>

        <AnnouncementBanner />

        {/* BOARD SECTION (SPECTRAL GLASS STYLE) */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative flex-1 rounded-sm border border-white/10 bg-[#080808]/80 backdrop-blur-xl p-6 md:p-8 overflow-hidden"
        >
          {/* Decorative Corner Brackets */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-amber-500/40" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-amber-500/40" />

          {/* Table Header Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
               <div className="flex items-center gap-3">
                 <div className="h-[1px] w-6 bg-gradient-to-r from-amber-500 to-transparent" />
                 <h3 className="font-vintage text-2xl text-slate-200">
                   Antrian Hari Ini
                 </h3>
               </div>
               <div className="font-tech text-[10px] text-amber-500/60 mt-1 pl-9 tracking-widest uppercase">
                 Total: {queue.length} • Auto Refresh 4s
               </div>
            </div>

            <button
              type="button"
              onClick={reload}
              className="group relative px-4 py-2 overflow-hidden rounded bg-transparent border border-amber-500/30 text-amber-100/80 text-[10px] font-tech uppercase tracking-widest hover:border-amber-400 transition-colors"
            >
               <span className="relative z-10 group-hover:text-white transition-colors">Refresh</span>
               <div className="absolute inset-0 bg-amber-500/10 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
            </button>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto rounded border border-white/5">
            <table className="min-w-full text-center">
              <thead className="bg-white/5 text-amber-500/80 font-tech uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-4 border-b border-white/10 text-left">No</th>
                  <th className="px-4 py-4 border-b border-white/10 text-left">Customer</th>
                  <th className="px-4 py-4 border-b border-white/10 text-left">Barber</th>
                  <th className="px-4 py-4 border-b border-white/10 text-left">Layanan</th>
                  <th className="px-4 py-4 border-b border-white/10 text-left">Jadwal</th>
                  <th className="px-4 py-4 border-b border-white/10 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="font-modern text-sm">
                {queue.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-slate-500 text-xs italic font-tech border-b border-white/5">
                      -- Belum ada antrian untuk hari ini --
                    </td>
                  </tr>
                )}
                {queue.map((q) => (
                  <tr
                    key={q.id}
                    className="queue-row border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-4 text-left font-vintage text-xl font-bold text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.3)]">
                      {q.queue_number}
                    </td>
                    <td className="px-4 py-4 text-left text-slate-200 font-semibold tracking-wide">
                      {q.customer?.name || "-"}
                    </td>
                    <td className="px-4 py-4 text-left text-slate-300">
                      {q.barber?.display_name || q.barber?.user?.name || "-"}
                    </td>
                    <td className="px-4 py-4 text-left text-slate-400 text-xs uppercase tracking-wide">
                      {q.service?.name || "-"}
                    </td>
                    <td className="px-4 py-4 text-left text-slate-400 font-tech text-xs">
                      {q.scheduled_at &&
                        new Date(q.scheduled_at).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                    </td>
                    <td className="px-4 py-4 text-left">
                      <span
                        className={`font-tech text-[10px] px-3 py-1 rounded border uppercase tracking-widest ${
                          q.status === "waiting"
                            ? "bg-amber-900/20 text-amber-200 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.1)]"
                            : q.status === "ongoing"
                            ? "bg-sky-900/20 text-sky-200 border-sky-500/30 shadow-[0_0_10px_rgba(14,165,233,0.1)]"
                            : "bg-emerald-900/20 text-emerald-200 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]"
                        }`}
                      >
                        {q.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

           {/* Footer Scanline */}
           <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
        </motion.section>

      </div>
    </MainLayout>
  );
}