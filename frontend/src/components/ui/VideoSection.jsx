// src/components/ui/VideoSection.jsx
import React from "react";
import { motion } from "framer-motion";

export default function VideoSection() {
  const videos = [
    {
      src: "/videos/barber1.mp4",
      title: "Taper Fade",
      description: "Gradasi cukuran presisi dengan sentuhan styling modern. Menciptakan tampilan rapi yang tajam, elegan, dan cocok untuk segala suasana.",
      duration: "13:26",
    },
    {
      src: "/videos/barber2.mp4",
      title: "Commar Hair",
      description: "Kombinasi tekstur bervolume dengan penataan poni inward-curling yang presisi. Gaya ini membingkai wajah dengan sempurna untuk tampilan yang chic dan sophisticated.",
      duration: "07:40",
    },
  ];

  return (
    <section className="relative overflow-hidden rounded-3xl border border-neutral-800 bg-[#080808] p-6 md:p-8 space-y-8 shadow-2xl">
      {/* --- BACKGROUND AMBIENCE --- */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(66,32,6,0.15),transparent_70%)]" />
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
      </div>

      {/* --- HEADER --- */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-800/60 pb-6">
        <div className="space-y-2">
          <h2 className="font-serif text-2xl md:text-3xl text-amber-500 tracking-wide drop-shadow-md">
            The <span className="text-neutral-100">Showcase</span>
          </h2>
          <p className="text-xs md:text-sm text-neutral-400 max-w-lg font-light leading-relaxed">
            Saksikan proses transformasi di <span className="text-amber-600 font-medium">Galeri Kami</span>. 
          </p>
        </div>
        
        {/* Digital Badge */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-800 bg-neutral-900/80 backdrop-blur-sm">
           <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
           <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase">Video</span>
        </div>
      </div>

      {/* --- VIDEO GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        {videos.map((v, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: idx * 0.2 }}
            className="group relative"
          >
            {/* === THE MONITOR FRAME (CONTAINER) === 
                Frame luar tebal (Bezel) + Shadow 3D
            */}
            <div className="relative rounded-xl bg-neutral-900 p-1.5 shadow-[0_20px_50px_-12px_rgba(0,0,0,1)] ring-1 ring-white/5">
                
                {/* Metallic Bezel Texture */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-neutral-700 via-neutral-900 to-black opacity-100" />
                
                {/* Inner Bezel (Gold Accent) */}
                <div className="absolute inset-[2px] rounded-[10px] border border-amber-900/40 bg-black z-0" />

                {/* --- SCREEN AREA --- */}
                <div className="relative z-10 overflow-hidden rounded-lg aspect-video bg-black group-hover:shadow-[0_0_30px_rgba(217,119,6,0.15)] transition-shadow duration-500">
                    
                    {/* The Video */}
                    <video
                        src={v.src}
                        controls
                        className="h-full w-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500"
                        poster="/images/poster-placeholder.jpg" // Opsional: tambahkan poster
                    >
                        Browser Anda tidak mendukung tag video.
                    </video>

                    {/* === DIGITAL OVERLAYS (HUD) === */}
                    <div className="pointer-events-none absolute inset-0 z-20">
                        {/* 1. Scanlines (CRT Effect) */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] opacity-20" />
                        
                        {/* 2. Vignette (Dark Corners) */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.6)_100%)]" />

                        {/* 3. Corner Brackets (Futuristic UI) */}
                        <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-amber-500/40 rounded-tl-sm" />
                        <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-amber-500/40 rounded-tr-sm" />
                        <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-amber-500/40 rounded-bl-sm" />
                        <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-amber-500/40 rounded-br-sm" />

                        {/* 4. REC Indicator */}
                        <div className="absolute top-4 right-6 flex items-center gap-2">
                             <span className="font-mono text-[9px] text-amber-500/80 tracking-widest uppercase">REC</span>
                             <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                        </div>
                        
                        {/* 5. Play Overlay Icon (Hilang saat controls aktif/diklik biasanya, ini visual saja) */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                            <div className="w-12 h-12 rounded-full border border-amber-500/50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                                <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-amber-500 border-b-[6px] border-b-transparent ml-1"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- MONITOR GLOW (Backlight) --- */}
                <div className="absolute -inset-4 bg-amber-500/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none -z-10" />
            </div>

            {/* --- METADATA (Bawah Video) --- */}
            <div className="mt-4 flex items-start justify-between px-1">
                <div className="space-y-1">
                    <h3 className="text-sm font-serif font-bold text-neutral-200 tracking-wide group-hover:text-amber-400 transition-colors">
                        {v.title}
                    </h3>
                    <p className="text-[11px] text-neutral-500 max-w-[90%] leading-relaxed">
                        {v.description}
                    </p>
                </div>
                {/* Techy Duration Badge */}
                <div className="shrink-0 px-2 py-1 rounded bg-neutral-900 border border-neutral-800">
                    <span className="font-mono text-[10px] text-amber-600/80">
                        {v.duration || "00:00"}
                    </span>
                </div>
            </div>
          </motion.div>
        ))}
      </div>

      <style jsx>{`
         /* Opsional: Kustomisasi scrollbar video jika browser mendukung */
         video::-webkit-media-controls-panel {
            background-image: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
         }
      `}</style>
    </section>
  );
}