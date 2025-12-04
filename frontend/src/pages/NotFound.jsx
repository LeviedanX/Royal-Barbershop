// src/pages/NotFound.jsx

import React, { useState, useEffect, useMemo } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useSpring,
} from "framer-motion";
import { Link } from "react-router-dom";
import MainLayout from "../components/Layout/MainLayout";

// ============================================================================
// SMALL HOOKS & UTILITIES
// ============================================================================

const useGlitchPulse = (intervalMs = 4200, durationMs = 220) => {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setActive(true);
      setTimeout(() => setActive(false), durationMs);
    }, intervalMs);

    return () => clearInterval(id);
  }, [intervalMs, durationMs]);

  return active;
};

const useTypewriter = (text, speed = 40) => {
  const [value, setValue] = useState("");

  useEffect(() => {
    if (!text) return;
    setValue("");
    let index = 0;

    const tick = () => {
      index++;
      setValue(text.slice(0, index));
      if (index < text.length) {
        timeout = setTimeout(tick, speed);
      }
    };

    let timeout = setTimeout(tick, 600);

    return () => clearTimeout(timeout);
  }, [text, speed]);

  return value;
};

const QUOTES = [
  "Every cut bends the timeline a little.",
  "Time fades, but a sharp fade is eternal.",
  "In some branches, the haircut never finishes.",
  "The cut you’re looking for exists in another chair.",
];

// ============================================================================
// 3D CARD SHELL – tilt + sheen
// ============================================================================

const Luxury404CardShell = ({ children }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 120, damping: 18, mass: 0.7 });
  const springY = useSpring(y, { stiffness: 120, damping: 18, mass: 0.7 });

  const rotateX = useTransform(springY, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-12, 12]);
  const sheenPos = useTransform(springX, [-0.5, 0.5], [0, 200]);

  const handleMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(px);
    y.set(py);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div
      className="perspective-1500 w-full max-w-4xl lg:max-w-5xl mx-auto"
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative w-full"
      >
        <div className="relative bg-[#080808]/95 border border-amber-500/25 rounded-2xl p-[1px] shadow-[0_40px_90px_rgba(0,0,0,0.9)] overflow-hidden">
          <div className="absolute -inset-[1px] bg-gradient-to-b from-amber-300/18 via-amber-700/12 to-amber-900/25 blur-md opacity-80 pointer-events-none" />
          <div className="relative rounded-[18px] bg-gradient-to-b from-[#101010] via-[#050507] to-black overflow-hidden clip-diamond">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(212,175,55,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(212,175,55,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.25] pointer-events-none" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-[0.35] mix-blend-overlay pointer-events-none" />

            <div className="absolute top-6 left-6 w-16 h-16 border-t border-l border-amber-500/60" />
            <div className="absolute top-6 right-6 w-16 h-16 border-t border-r border-amber-500/60" />
            <div className="absolute bottom-6 left-6 w-16 h-16 border-b border-l border-amber-500/60" />
            <div className="absolute bottom-6 right-6 w-16 h-16 border-b border-r border-amber-500/60" />

            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-amber-500/70 to-transparent" />
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-amber-500/70 to-transparent" />

            <motion.div
              style={{
                background:
                  "linear-gradient(105deg, transparent 0%, rgba(212,175,55,0.04) 25%, rgba(255,255,255,0.18) 45%, rgba(212,175,55,0.04) 65%, transparent 100%)",
                backgroundSize: "200% 100%",
                backgroundPosition: sheenPos.get() + "% center",
              }}
              className="absolute inset-0 mix-blend-color-dodge opacity-70 pointer-events-none"
            />

            <div className="relative z-10 px-8 md:px-12 lg:px-16 py-10 md:py-14">
              {children}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ============================================================================
// MICRO FX DI DALAM ALTAR 404
// ============================================================================

const BarberPoleGlow = () => {
  return (
    <div className="pointer-events-none absolute inset-x-[18%] md:inset-x-[22%] -top-10 md:-top-16 bottom-6 opacity-40">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-400/8 to-transparent blur-xl" />
      <div className="absolute inset-8 bg-[repeating-linear-gradient(135deg,rgba(248,250,252,0.06)_0,rgba(248,250,252,0.06)_8px,rgba(15,23,42,0.0)_8px,rgba(15,23,42,0.0)_16px)] opacity-40 [mask-image:radial-gradient(circle_at_center,white,transparent)] animate-pole-scroll" />
    </div>
  );
};

const RazorSpark = () => {
  return (
    <div className="pointer-events-none absolute top-1/2 left-[19%] md:left-[23%] w-[62%] h-px -rotate-[12deg] overflow-visible">
      <motion.div
        className="absolute -left-6 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-amber-200 shadow-[0_0_25px_rgba(253,224,171,0.9)]"
        initial={{ x: 0, opacity: 0 }}
        animate={{ x: "120%", opacity: [0, 1, 0] }}
        transition={{
          repeat: Infinity,
          duration: 1.4,
          ease: "linear",
          repeatDelay: 1.2,
        }}
      />
    </div>
  );
};

const HairDust = () => {
  const particles = useMemo(
    () =>
      Array.from({ length: 26 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 8,
        size: Math.random() * 2 + 0.4,
      })),
    []
  );

  return (
    <div className="pointer-events-none absolute -bottom-6 left-0 right-0 h-10 overflow-visible">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute bg-amber-500/40 rounded-full blur-[1px]"
          style={{
            width: `${p.size}px`,
            height: `${p.size * 0.6}px`,
            left: `${p.x}%`,
          }}
          initial={{ y: 0, opacity: 0.15 }}
          animate={{ y: -4, opacity: [0.2, 0.5, 0.1] }}
          transition={{
            repeat: Infinity,
            duration: 3 + p.size,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

// ============================================================================
// BACKGROUND FX – animasi, efek, “shader” di belakang card
// ============================================================================

const BackgroundFX = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* halo emas di tengah (di belakang card) */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full bg-[radial-gradient(circle,#facc15_0,rgba(0,0,0,0)_55%)] mix-blend-soft-light blur-3xl"
        animate={{
          opacity: [0.25, 0.5, 0.25],
          scale: [0.95, 1.08, 0.95],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* aurora kiri-kanan */}
      <motion.div
        className="absolute -left-40 top-[-10%] w-[420px] h-[130%] bg-[linear-gradient(115deg,transparent,rgba(251,191,36,0.22),transparent)] opacity-55 mix-blend-screen blur-3xl"
        animate={{
          x: ["0%", "6%", "-4%", "0%"],
          opacity: [0.3, 0.6, 0.25, 0.3],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-40 top-[-15%] w-[420px] h-[130%] bg-[linear-gradient(-115deg,transparent,rgba(96,165,250,0.3),transparent)] opacity-45 mix-blend-screen blur-3xl"
        animate={{
          x: ["0%", "-8%", "5%", "0%"],
          opacity: [0.25, 0.55, 0.2, 0.25],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* orb cahaya kanan atas */}
      <motion.div
        className="absolute right-[10%] top-[16%] w-40 h-40 rounded-full bg-[radial-gradient(circle_at_30%_20%,rgba(252,211,77,0.9),rgba(17,24,39,0))] mix-blend-screen blur-2xl"
        animate={{
          y: [0, 14, -8, 0],
          rotate: [0, 10, -6, 0],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* orb kebiruan kiri bawah */}
      <motion.div
        className="absolute left-[8%] bottom-[8%] w-48 h-48 rounded-full bg-[radial-gradient(circle_at_60%_70%,rgba(59,130,246,0.85),rgba(15,23,42,0))] mix-blend-screen blur-3xl"
        animate={{
          y: [0, -10, 6, 0],
          opacity: [0.1, 0.4, 0.2, 0.1],
        }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* scanline bergerak halus di seluruh layar */}
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, rgba(148,163,184,0.16) 1px, transparent 1px)",
          backgroundSize: "100% 3px",
          mixBlendMode: "soft-light",
        }}
        animate={{ backgroundPositionY: [0, 6] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
      />

      {/* ring tipis sangat besar, kayak shader vignette terprogram */}
      <motion.div
        className="absolute inset-[-20%] rounded-full border border-amber-500/10"
        style={{
          boxShadow:
            "0 0 120px rgba(15,23,42,0.9), 0 0 260px rgba(15,23,42,1)",
        }}
        animate={{ rotate: [0, 6, -4, 0] }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
};

// ============================================================================
// MAIN 404 SCREEN
// ============================================================================

export default function NotFound() {
  const glitchActive = useGlitchPulse();
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setQuoteIndex((idx) => (idx + 1) % QUOTES.length),
      9000
    );
    return () => clearInterval(id);
  }, []);

  const loreText =
    "THE CUT YOU’RE LOOKING FOR EXISTS IN ANOTHER BRANCH.";
  const typedLore = useTypewriter(loreText, 35);

  return (
    <MainLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;800&family=Italiana&family=Manrope:wght@300;400;600;800&family=Space+Mono:wght@400;700&display=swap');

        .font-royal { font-family: 'Cinzel', serif; }
        .font-vintage { font-family: 'Italiana', serif; }
        .font-modern { font-family: 'Manrope', sans-serif; }
        .font-tech { font-family: 'Space Mono', monospace; }

        .perspective-1500 { perspective: 1500px; }
        .clip-diamond {
          clip-path: polygon(18px 0, 100% 0, 100% calc(100% - 18px), calc(100% - 18px) 100%, 0 100%, 0 18px);
        }

        /* background grid & noise */
        .bg-barber-grid {
          background-image:
            linear-gradient(rgba(148,163,184,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148,163,184,0.08) 1px, transparent 1px);
          background-size: 72px 72px;
        }

        @keyframes bg-pan {
          0% { background-position: 0 0, 0 0; }
          100% { background-position: 0 72px, 72px 0; }
        }

        .animate-bg-pan {
          animation: bg-pan 26s linear infinite;
        }

        /* liquid metal gold */
        @keyframes liquid-gold {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .text-luxury-gold {
          background: linear-gradient(
            90deg,
            #bf953f 10%,
            #fcf6ba 25%,
            #b38728 45%,
            #fbf5b7 60%,
            #aa771c 90%
          );
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          background-size: 200% auto;
          animation: liquid-gold 4s linear infinite;
          filter: drop-shadow(0 0 18px rgba(212,175,55,0.5));
        }

        .razor-cut {
          position: relative;
        }
        .razor-cut::after {
          content: "";
          position: absolute;
          top: 49%;
          left: 18%;
          right: 18%;
          height: 1px;
          background: rgba(255,255,255,0.9);
          box-shadow:
            0 0 12px rgba(255,255,255,1),
            0 0 26px rgba(59,130,246,0.4);
          transform: rotate(-12deg);
          z-index: 10;
        }

        .glitch-layer {
          position: relative;
        }
        .glitch-active .glitch-layer {
          animation: glitch-shake 0.2s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes glitch-shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }

        .clip-top-half {
          clip-path: polygon(0 0, 100% 0, 100% 50%, 0 50%);
        }

        .scanlines {
          background-image: linear-gradient(
            to bottom,
            rgba(255,255,255,0.03) 1px,
            transparent 1px
          );
          background-size: 100% 3px;
        }

        @keyframes pole-scroll {
          0% { background-position: 0 0; }
          100% { background-position: 80px 80px; }
        }
        .animate-pole-scroll {
          animation: pole-scroll 24s linear infinite;
        }

        @keyframes badge-pulse {
          0%, 100% { box-shadow: 0 0 0 rgba(251,191,36,0.0); }
          50% { box-shadow: 0 0 22px rgba(251,191,36,0.45); }
        }
        .badge-pulse {
          animation: badge-pulse 4.5s ease-in-out infinite;
        }

        @keyframes button-press {
          0% { transform: translateY(0); box-shadow: 0 18px 40px rgba(0,0,0,0.8); }
          50% { transform: translateY(1px); box-shadow: 0 8px 20px rgba(0,0,0,0.6); }
          100% { transform: translateY(0); box-shadow: 0 18px 40px rgba(0,0,0,0.8); }
        }
        .btn-pressing {
          animation: button-press 0.18s ease-out;
        }

        /* shine untuk strip di button */
        @keyframes shine-wipe {
          0% { transform: translateX(-120%); opacity: 0; }
          40% { opacity: 1; }
          100% { transform: translateX(220%); opacity: 0; }
        }

        .noise-fallback {
          background-image: radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px);
          background-size: 3px 3px;
        }
      `}</style>

      {/* BACKGROUND */}
      <div className="relative min-h-[calc(100vh-4rem)] w-full overflow-hidden bg-[#050508] text-slate-100 flex items-center justify-center px-4 py-10">
        {/* grid dasar + noise */}
        <div className="absolute inset-0 bg-barber-grid animate-bg-pan opacity-40" />
        <div className="absolute inset-0 noise-fallback opacity-[0.12] mix-blend-soft-light" />

        {/* layer FX animasi */}
        <BackgroundFX />

        {/* vignette paling atas */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(15,23,42,0)_0%,rgba(15,23,42,0.4)_55%,rgba(0,0,0,0.95)_100%)]" />

        {/* garis dekor pojok kiri atas */}
        <div className="pointer-events-none absolute top-5 left-6 md:top-7 md:left-10 opacity-60">
          <div className="w-24 h-px bg-gradient-to-r from-amber-500/70 to-transparent" />
          <div className="w-px h-16 mt-2 bg-gradient-to-b from-amber-500/70 to-transparent" />
        </div>

        {/* CARD 404 */}
        <div className="relative z-10 w-full max-w-5xl">
          <Luxury404CardShell>
            <div className={glitchActive ? "glitch-active relative" : "relative"}>
              <BarberPoleGlow />
              <HairDust />
              <RazorSpark />

              {/* 404 HERO */}
              <div className="relative flex flex-col items-center mb-10">
                <div className="pointer-events-none absolute top-8">
                  <h1 className="font-royal text-[7rem] md:text-[10rem] leading-none text-white/5 scale-y-[-0.5] origin-bottom blur-sm clip-top-half">
                    404
                  </h1>
                </div>

                <div className="relative">
                  <h1 className="font-royal text-[7rem] md:text-[10rem] leading-none text-luxury-gold razor-cut glitch-layer select-none">
                    404
                  </h1>
                </div>
              </div>

              {/* JUDUL + QUOTE */}
              <div className="flex flex-col items-center text-center mb-8">
                <h2 className="font-vintage text-3xl md:text-5xl tracking-wide text-slate-100 drop-shadow-[0_10px_40px_rgba(0,0,0,0.9)]">
                  Halaman Tidak Ditemukan
                </h2>

                <div className="flex items-center justify-center gap-6 mt-5 opacity-75">
                  <div className="h-px w-14 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
                  <span className="font-royal text-amber-500 text-xl scanlines rounded-full px-2">
                    ✦
                  </span>
                  <div className="h-px w-14 bg-gradient-to-l from-transparent via-amber-500 to-transparent" />
                </div>

                <AnimatePresence mode="wait">
                  <motion.p
                    key={quoteIndex}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 0.9, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.4 }}
                    className="mt-4 font-tech text-[10px] md:text-[11px] uppercase tracking-[0.26em] text-amber-300/90 px-5"
                  >
                    {QUOTES[quoteIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>

              {/* PARAGRAF */}
              <div className="max-w-xl mx-auto text-center mb-8">
                <p className="font-modern text-[13px] md:text-[14px] text-slate-300 leading-relaxed md:leading-loose px-4">
                  Seperti potongan rambut yang hilang tersapu angin, halaman
                  yang Anda cari telah lenyap dari eksistensi digital kami.
                  Koordinat ini kosong, hanya menyisakan gema dari apa yang
                  mungkin pernah ada.
                </p>
              </div>

              {/* LORE LINE */}
              <div className="flex justify-center mb-12">
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-amber-500/30 bg-black/40 backdrop-blur-sm">
                  <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)]" />
                  <span className="font-tech text-[10px] tracking-[0.18em] text-amber-200 whitespace-nowrap overflow-hidden">
                    {typedLore}
                  </span>
                  <motion.span
                    className="font-tech text-[10px] text-amber-300"
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.9, repeat: Infinity }}
                  >
                    █
                  </motion.span>
                </div>
              </div>

              {/* BUTTONS */}
              <ButtonsRow />
            </div>
          </Luxury404CardShell>
        </div>
      </div>
    </MainLayout>
  );
}

// ============================================================================
// BUTTONS ROW – Kembali ke Lobby & Staff Login
// ============================================================================

const ButtonsRow = () => {
  const [pressing, setPressing] = useState(false);

  const handlePress = () => {
    setPressing(true);
    setTimeout(() => setPressing(false), 180);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 md:gap-8">
      {/* PRIMARY BUTTON – kembali ke lobby */}
      <Link
        to="/"
        className="group relative w-full sm:w-auto"
        onMouseDown={handlePress}
      >
        <div className="absolute -inset-[3px] bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 rounded-[14px] blur-md opacity-50 group-hover:opacity-80 transition-opacity duration-300" />
        <div
          className={`relative flex items-center justify-center gap-4 px-10 md:px-12 py-4 md:py-4.5 rounded-[12px] clip-diamond border border-amber-500/80 bg-gradient-to-r from-[#0f0b03] via-[#221506] to-[#3b2206] shadow-[0_18px_40px_rgba(0,0,0,0.85)] group-hover:shadow-[0_24px_60px_rgba(245,158,11,0.55)] transition-all duration-300 ${
            pressing ? "btn-pressing" : ""
          }`}
        >
          <div className="pointer-events-none absolute top-0 bottom-0 left-[-80%] w-24 bg-white/15 skew-x-[-18deg] group-hover:animate-[shine-wipe_1.1s_ease-in-out]" />

          <div className="flex flex-col items-start">
            <span className="font-tech text-[9px] tracking-[0.26em] uppercase text-amber-200">
              Kembali ke HOME
            </span>
            <span className="font-modern text-[11px] md:text-[12px] tracking-[0.18em] uppercase text-amber-50/95">
              BARBERSHOP BRS
            </span>
          </div>

          <div className="relative flex items-center justify-center w-8 h-8 rounded-full border border-amber-400/70 bg-black/30">
            <svg
              className="w-4 h-4 text-amber-200 group-hover:translate-y-0.5 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </div>
        </div>
      </Link>

      {/* SECONDARY BUTTON – staff login */}
      <Link to="/login" className="group w-full sm:w-auto relative">
        <div className="relative flex items-center justify-center gap-3 px-10 md:px-11 py-4 md:py-4.5 rounded-[10px] border border-slate-500/35 bg-white/[0.02] hover:bg-white/[0.06] hover:border-amber-400/70 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.75)]">
          <span className="font-modern text-[11px] tracking-[0.22em] uppercase text-slate-300 group-hover:text-amber-50">
            LOGIN
          </span>
          <span className="font-tech text-xs text-amber-400 opacity-0 translate-x-[-6px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-400">
            →
          </span>
          <div className="pointer-events-none absolute -bottom-[3px] left-4 right-4 h-px bg-gradient-to-r from-transparent via-amber-400/70 to-transparent opacity-0 group-hover:opacity-80 transition-opacity" />
        </div>
      </Link>
    </div>
  );
};
