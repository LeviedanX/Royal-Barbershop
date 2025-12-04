// src/pages/GalleryPage.jsx
import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import MainLayout from "../components/Layout/MainLayout";
import RealtimeClock from "../components/ui/RealtimeClock";
import HairstyleGallery from "../components/ui/HairstyleGallery";
import VideoSection from "../components/ui/VideoSection";
import { http } from "../api/http";

// --- VISUAL ASSETS (COPIED FROM LANDING PAGE) ---

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

export default function GalleryPage() {
  const [hairstyles, setHairstyles] = useState([]);

  useEffect(() => {
    http
      .get("/hairstyles")
      .then((res) => setHairstyles(res.data || []))
      .catch(console.error);
  }, []);

  // Optional: fallback lokal kalau backend belum ada data
  const fallbackHairstyles = useMemo(
    () => [
      {
        id: "local-1",
        name: "Neon Fade",
        image_url: "/images/hairstyles/fade-neon.jpg",
        default_service: { name: "Fade Cut + Styling" },
      },
      {
        id: "local-2",
        name: "UnderCut Clean",
        image_url: "/images/hairstyles/undercut-clean.jpg",
        default_service: { name: "Undercut + Wash" },
      },
      {
        id: "local-3",
        name: "Textured Crop",
        image_url: "/images/hairstyles/textured-crop.jpg",
        default_service: { name: "Crop + Styling Clay" },
      },
      {
        id: "local-4",
        name: "Slickback Modern",
        image_url: "/images/hairstyles/slickback-modern.jpg",
        default_service: { name: "Slickback + Pomade" },
      },
    ],
    []
  );

  const effectiveHairstyles =
    hairstyles && hairstyles.length ? hairstyles : fallbackHairstyles;

  const handleSelectHairstyle = (h) => {
    // nanti bisa dihubungkan ke form booking (prefill service, dsb)
    console.log("Selected hairstyle:", h);
  };

  return (
    <MainLayout>
      {/* --- CSS INJECTION (SHARED STYLES) --- */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2family=Cinzel:wght@400;700&family=Italiana&family=Manrope:wght@300;400;600;800&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap');
        
        .font-royal { font-family: 'Cinzel', serif; }
        .font-vintage { font-family: 'Italiana', serif; }
        .font-tech { font-family: 'Space Mono', monospace; }
        .font-modern { font-family: 'Manrope', sans-serif; }
        
        .clip-cyber {
          clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
        }
      `}</style>

      {/* --- BACKGROUND ATMOSPHERE (FIXED BEHIND CONTENT) --- */}
      <div className="fixed inset-0 z-0 bg-[#050505]">
         <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#030303] to-[#000000]" />
         <ScannerBeam />
         <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-amber-600/10 blur-[150px] rounded-full" />
         <FloatingParticles />
         <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
         <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] opacity-10" />
      </div>

      {/* --- MAIN CONTENT WRAPPER --- */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-10 space-y-12 pt-6 min-h-screen">
        
        {/* HEADER SECTION WITH MASTERPIECE CLOCK */}
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-white/5 pb-8 relative">
           
           {/* Text Content */}
           <motion.div
             variants={containerStagger}
             initial="hidden"
             animate="visible"
             className="flex-1"
           >
             {/* Decorative Label */}
             <motion.div variants={revealVar} className="flex items-center gap-2 mb-3">
                 <span className="font-tech text-xs text-amber-500 tracking-[0.3em] uppercase"></span>
             </motion.div>

             <motion.h1 variants={revealVar} className="font-vintage text-4xl md:text-5xl lg:text-6xl text-slate-100 leading-tight">
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-600">Hairstyle</span> Gallery
             </motion.h1>

             <motion.div variants={revealVar} className="mt-6 relative pl-6 group">
                
                {/* 1. The Glowing Pillar (Garis Kiri Bercahaya) */}
                <div className="absolute left-0 top-1 bottom-1 w-[3px] bg-gradient-to-b from-amber-300 via-amber-600 to-transparent shadow-[0_0_15px_rgba(251,191,36,0.5)] rounded-full opacity-80 group-hover:opacity-100 transition-opacity duration-500" />

                {/* 2. The Text Content */}
                <p className="font-modern text-sm md:text-base text-slate-400 leading-[1.8] max-w-2xl tracking-wide">
                    Explore a curated gallery of elevated cuts.
                    <br className="hidden md:block" />
                    Discover inspiration that not only refreshes your look but <span className="text-slate-200 font-vintage italic text-lg px-1">redefines</span> your <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 drop-shadow-sm tracking-wider">SIGNATURE STYLE</span>.
                </p>

                {/* 3. Subtle Background Glow (Efek saat hover) */}
                <div className="absolute inset-y-0 left-0 right-0 bg-gradient-to-r from-amber-500/5 to-transparent blur-xl -z-10 rounded-r-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            </motion.div>
           </motion.div>

           {/* MASTERPIECE CLOCK (Integrated) */}
           <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ duration: 0.8 }}
             className="relative group min-w-[300px]"
           >
              {/* Glow */}
              <div className="absolute inset-0 bg-amber-600/10 blur-xl rounded-lg" />
             
           </motion.div>
        </header>

        {/* --- VIDEO SECTION (CYBER FRAME) --- */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative group"
        >
           {/* Cyber Borders */}
           <div className="absolute -inset-[1px] bg-gradient-to-r from-amber-500/20 via-transparent to-amber-500/20 rounded-xl opacity-50" />
           
           <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black shadow-2xl">
              <div className="absolute top-0 left-0 px-4 py-1 bg-amber-600/20 backdrop-blur-md border-br border-white/10 z-10">
                 <span className="font-tech text-[10px] text-amber-400 tracking-widest">HAIRSTYLE</span>
              </div>
              <VideoSection />
           </div>
        </motion.div>

        {/* --- GALLERY SECTION (SPECTRAL GLASS) --- */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative rounded-sm border border-white/10 bg-[#080808]/80 backdrop-blur-xl p-6 md:p-8"
        >
          {/* Decorative Corner Brackets */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-amber-500/40" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-amber-500/40" />

          {/* Header Bar */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-4 border-b border-white/5">
            <div className="flex flex-col relative pl-2">

                  {/* 2. Main Title */}
                  <h3 className="relative z-10 font-vintage text-3xl md:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-slate-200 to-slate-400 tracking-wide drop-shadow-sm">
                    Signature Collection
                  </h3>

                  {/* 3. Subtitle with Gold Accent Line */}
                  <div className="relative z-10 flex items-center gap-3 mt-1">
                    {/* Garis aksen emas memudar */}
                    <div className="h-[1px] w-6 bg-gradient-to-r from-amber-500 to-transparent" />
                    
                    <span className="font-tech text-[10px] text-amber-500 tracking-[0.35em] uppercase font-semibold shadow-amber-500/20 drop-shadow-md">
                        Hairstyle & Haircut
                    </span>
                  </div>
            </div>
            
            <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded border border-white/5">
               <span className="font-modern text-xs text-slate-400 uppercase tracking-wider">TOP HAIRCUTS:</span>
               <span className="font-tech text-lg text-amber-400 font-bold">{effectiveHairstyles.length}</span>
               {hairstyles.length === 0 && (
                 <span className="ml-2 text-[10px] text-amber-500/80 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                   LOCAL MODE
                 </span>
               )}
            </div>
          </div>

          {/* Actual Gallery Grid */}
          <HairstyleGallery
            hairstyles={effectiveHairstyles}
            onSelect={handleSelectHairstyle}
          />

          {/* Footer Scanline */}
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
        </motion.section>

      </div>
    </MainLayout>
  );
}
