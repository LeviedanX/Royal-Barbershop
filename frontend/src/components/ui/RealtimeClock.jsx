// src/components/ui/RealtimeClock.jsx
import React, { useEffect, useState } from "react";

function formatFull(date) {
  const hari = [
    "Minggu",
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jumat",
    "Sabtu",
  ];
  const namaHari = hari[date.getDay()];
  const tgl = date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const jam = date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  return { namaHari, tgl, jam };
}

export default function RealtimeClock({ compact = false, className = "" }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const { namaHari, tgl, jam } = formatFull(now);

  // 🏷️ MODE COMPACT: Seperti label harga vintage atau tag kuningan kecil
  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-3 rounded-md border border-amber-700/50 bg-neutral-900 px-4 py-1.5 shadow-[0_2px_10px_rgba(0,0,0,0.5)] ${className}`}
        style={{
          background: "linear-gradient(180deg, #262626 0%, #171717 100%)", // Efek metal gelap
        }}
      >
        {/* Lampu Indikator "Open" (Merah redup, bukan neon) */}
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-pulse rounded-full bg-red-800 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-red-600 shadow-[0_0_5px_rgba(220,38,38,0.8)]" />
        </span>

        <div className="flex items-baseline gap-2 font-serif text-amber-100/90">
          <span className="text-sm font-bold tracking-widest tabular-nums text-amber-500 drop-shadow-sm">
            {jam}
          </span>
          <span className="h-3 w-px bg-amber-800/40" />
          <span className="text-[11px] tracking-wide text-amber-200/60 uppercase">
            {tgl}
          </span>
        </div>
      </div>
    );
  }

  // 💈 MODE PENUH: Papan Tanda Barbershop Klasik (Signage)
  return (
    <div
      className={`relative inline-flex flex-col items-center overflow-hidden rounded-lg border-2 border-neutral-800 bg-neutral-900 px-5 py-3 text-center text-amber-50 shadow-2xl ${className}`}
      style={{
        // Gradient halus untuk mensimulasikan permukaan melengkung/3D lembut
        background: "radial-gradient(circle at top, #2a2a2a, #1a1a1a)", 
        boxShadow: "0 20px 50px -12px rgba(0, 0, 0, 1), 0 0 0 1px #451a03", // Shadow dalam & border kulit
      }}
    >
      {/* -----------------------------------------------------------
          DEKORASI BACKGROUND 
      ------------------------------------------------------------ */}
      {/* Garis-garis halus "Pinstripe" khas jas mahal */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-10" 
        style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 19px, #d97706 20px)" }}
      />
      
      {/* Frame Emas (Brass/Gold Border Effect) */}
      <div className="pointer-events-none absolute inset-0 rounded-lg border border-amber-600/30 shadow-[inset_0_1px_0_rgba(251,191,36,0.2)]" />
      
      {/* Aksen Barber Pole (Merah & Biru Gelap) di sisi kiri & kanan */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-red-900 via-neutral-900 to-blue-900 opacity-80" />
      <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-red-900 via-neutral-900 to-blue-900 opacity-80" />


      {/* -----------------------------------------------------------
          KONTEN UTAMA
      ------------------------------------------------------------ */}

      {/* Header Hari */}
      <div className="mb-1 flex items-center justify-center gap-2">
        {/* Garis dekoratif kiri */}
        <div className="h-[1px] w-4 bg-gradient-to-r from-transparent to-amber-700/80" />
        
        <span className="font-serif text-[10px] font-bold uppercase tracking-[0.3em] text-amber-600/80 shadow-black drop-shadow-sm">
          {namaHari}
        </span>

        {/* Garis dekoratif kanan */}
        <div className="h-[1px] w-4 bg-gradient-to-l from-transparent to-amber-700/80" />
      </div>

      {/* Jam Utama - Tampilan seperti angka timbul (Embossed) */}
      <div className="relative z-10 my-1 rounded bg-black/40 px-3 py-1 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] border-b border-white/5">
        <span 
          className="font-serif text-2xl font-bold tracking-widest text-amber-100 tabular-nums"
          style={{ textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}
        >
          {jam}
        </span>
      </div>

      {/* Tanggal */}
      <div className="mt-1 text-[11px] font-medium tracking-wide text-neutral-400 font-serif italic">
        {tgl}
      </div>

      {/* Baut/Sekrup Hiasan di pojok (Vintage Detail) */}
      <div className="absolute top-1.5 left-1.5 h-1 w-1 rounded-full bg-neutral-700 shadow-[inset_-1px_-1px_1px_rgba(0,0,0,1),1px_1px_0_rgba(255,255,255,0.1)]" />
      <div className="absolute top-1.5 right-1.5 h-1 w-1 rounded-full bg-neutral-700 shadow-[inset_-1px_-1px_1px_rgba(0,0,0,1),1px_1px_0_rgba(255,255,255,0.1)]" />
      <div className="absolute bottom-1.5 left-1.5 h-1 w-1 rounded-full bg-neutral-700 shadow-[inset_-1px_-1px_1px_rgba(0,0,0,1),1px_1px_0_rgba(255,255,255,0.1)]" />
      <div className="absolute bottom-1.5 right-1.5 h-1 w-1 rounded-full bg-neutral-700 shadow-[inset_-1px_-1px_1px_rgba(0,0,0,1),1px_1px_0_rgba(255,255,255,0.1)]" />

    </div>
  );
}