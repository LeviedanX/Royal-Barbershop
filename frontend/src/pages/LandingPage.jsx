// src/pages/LandingPage.jsx
import React, { useState } from "react";
import Spline from "@splinetool/react-spline";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import RealtimeClock from "../components/ui/RealtimeClock";

//  URL Spline Robot
const SPLINE_SCENE_URL =
  "https://prod.spline.design/PtiqawGsIZxgX8o4/scene.splinecode";

// --- CUSTOM COMPONENTS ---

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
  hidden: { y: "100%", opacity: 0, rotateX: 20 },
  visible: {
    y: "0%",
    opacity: 1,
    rotateX: 0,
    transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
  },
};

const containerStagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

export default function LandingPage() {
  const hasSplineScene = Boolean(SPLINE_SCENE_URL);
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="relative w-full h-screen bg-[#050505] text-slate-200 overflow-hidden font-sans selection:bg-amber-500/30 selection:text-amber-100">
      {/* --- CSS INJECTION --- */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2family=Cinzel:wght@400;700&family=Italiana&family=Manrope:wght@300;400;600;800&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap');
        
        .font-royal { font-family: 'Cinzel', serif; }
        .font-vintage { font-family: 'Italiana', serif; }
        .font-tech { font-family: 'Space Mono', monospace; }
        .font-modern { font-family: 'Manrope', sans-serif; }

        /* Shine Animation for Button */
        @keyframes shine-wipe {
          0% { left: -100%; opacity: 0; }
          10% { opacity: 0.5; }
          50% { left: 100%; opacity: 0; }
          100% { left: 100%; opacity: 0; }
        }
        .animate-shine {
          animation: shine-wipe 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        /* Glitch Clip Path */
        .clip-cyber {
          clip-path: polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%);
        }
      `}</style>

      {/* =========================================
          LAYER 0: ATMOSPHERE & TEXTURE
         ========================================= */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#030303] to-[#000000]" />

        {/* Animated Scanner Beam */}
        <ScannerBeam />

        {/* Ambient Glows */}
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-amber-600/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-900/10 blur-[150px] rounded-full" />

        <FloatingParticles />

        {/* Cinematic Grain & Grid */}
        <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] opacity-10" />
      </div>

      {/* =========================================
          LAYER 1: HUD CLOCK  BOTTOM RIGHT, TOPMOST
         ========================================= */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="fixed bottom-0 right-0 z-[999] pointer-events-auto"
      >
        <div className="relative group">
          {/* Ambient Backlight */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-amber-600/20 blur-[40px] rounded-full opacity-50 group-hover:opacity-70 transition-opacity duration-700" />

          {/* Main Glass Panel */}
          <div className="relative bg-[#050505]/90 backdrop-blur-xl border border-white/10 rounded-tl-lg shadow-2xl overflow-hidden w-[250px] md:w-[300px]">
            {/* Background Texture */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay" />

            {/* Decorative Top Line */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50">
              <motion.div
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                className="w-1/2 h-full bg-amber-400 blur-[2px]"
              />
            </div>

            {/* CONTENT LAYOUT */}
            <div className="flex flex-col">
              {/* ROW 1: STATUS BAR (Location) */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/5">
              </div>

              {/* ROW 2: CLOCK AREA */}
              <div className="px-5 py-4 flex justify-center items-center relative">
                <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-amber-500/30" />
                <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-amber-500/30" />
                <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-amber-500/30" />
                <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-amber-500/30" />

                <div className="transform scale-110 drop-shadow-[0_0_10px_rgba(245,158,11,0.15)]">
                  <RealtimeClock compact />
                </div>
              </div>

              {/* ROW 3: FOOTER INFO */}
              <div className="px-4 py-1 bg-[#000000]/50 flex justify-center border-t border-white/5">
                <span className="font-tech text-[8px] text-slate-600 tracking-[0.5em]">
                  TIME
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* =========================================
          LAYER 2: 3D HERO (SPLINE)
         ========================================= */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="w-full h-full scale-90 sm:scale-100 lg:scale-110 translate-y-4 sm:translate-y-6 lg:translate-y-8 translate-x-0 lg:translate-x-10"
        >
          {hasSplineScene && (
            <Spline
              scene={SPLINE_SCENE_URL}
              onLoad={() => setIsLoaded(true)}
              className="w-full h-full"
            />
          )}
        </motion.div>

        {/* Futuristic Loading State */}
        <AnimatePresence>
          {!isLoaded && (
            <motion.div
              exit={{ opacity: 0, filter: "blur(10px)" }}
              className="absolute inset-0 bg-black flex items-center justify-center z-50"
            >
              <div className="flex flex-col items-center gap-6">
                {/* Spinner */}
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 border-4 border-slate-800 rounded-full" />
                  <div className="absolute inset-0 border-4 border-t-amber-500 rounded-full animate-spin" />
                </div>
                <div className="space-y-1 text-center">
                  <p className="font-tech text-xs text-amber-500 tracking-[0.4em] animate-pulse">
                    SYSTEM_BOOT
                  </p>
                  <p className="font-modern text-[10px] text-slate-600 tracking-widest">
                    LOADING 3D ASSETS...
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* =========================================
          LAYER 3: UI CONTENT (GLASS & TYPOGRAPHY)
         ========================================= */}
      <div className="relative z-20 w-full h-full pointer-events-none flex flex-col justify-between p-6 md:p-12 lg:p-16">
        {/* HEADER LOGO: OBSIDIAN & GOLD EDITION */}
        <motion.header
          variants={containerStagger}
          initial="hidden"
          animate="visible"
          className="flex items-center justify-between pointer-events-auto z-50"
        >
          <div className="flex flex-col gap-2">
            <motion.div
              variants={revealVar}
              className="flex items-center gap-3 sm:gap-5 group cursor-pointer"
            >
              {/* 1. Animated Emblem (Diamond Shape) */}
              <div className="relative w-14 h-14 flex items-center justify-center">
                {/* Glow effect behind */}
                <div className="absolute inset-0 bg-amber-600/30 blur-xl rounded-full group-hover:bg-amber-500/50 transition-all duration-500" />

                {/* Diamond Container */}
                <div className="relative w-full h-full bg-gradient-to-br from-[#1a1a1a] to-black border border-amber-600/30 shadow-[0_0_15px_rgba(245,158,11,0.15)] rotate-45 flex items-center justify-center overflow-hidden transition-transform duration-500 group-hover:rotate-[225deg]">
                  {/* Gold Texture Overlay */}
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20" />

                  {/* The Letter 'RBS' */}
                  <span className="font-royal text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-amber-500 to-amber-700 -rotate-45 group-hover:rotate-[-225deg] transition-transform duration-500 drop-shadow-sm">
                    RBS
                  </span>
                </div>

                {/* Decorative corner accents */}
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500/50 rounded-full blur-[1px]" />
                <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-amber-500/50 rounded-full blur-[1px]" />
              </div>

              {/* 2. Text Typography */}
              <div className="flex flex-col justify-center">
                <h2 className="font-vintage text-3xl text-slate-100 tracking-[0.1em] leading-none bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  BARBERSHOP
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-[1px] w-8 bg-amber-600/50" />
                  <span className="font-tech text-[9px] text-amber-500 tracking-[0.3em] uppercase shadow-amber-500/20 drop-shadow-lg">
                    Premium Cuts
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.header>

        {/* HERO TEXT AREA */}
        <motion.div
          variants={containerStagger}
          initial="hidden"
          animate="visible"
          className="max-w-2xl pointer-events-auto pl-2 md:pl-0"
        >
          {/* Accent Line */}
          <motion.div
            variants={revealVar}
            className="w-12 h-[2px] bg-amber-500 mb-6"
          />

          {/* Main Title */}
          <div className="overflow-hidden mb-2">
            <motion.h1
              variants={revealVar}
              className="font-vintage text-5xl sm:text-7xl md:text-8xl text-slate-100 leading-[0.9]"
            >
              Quality & Results <br />
              <span className="relative inline-block">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-500 to-amber-700 italic pr-2">
                  Refined
                </span>
                {/* Glow behind text */}
                <span className="absolute inset-0 bg-amber-500/20 blur-xl -z-10" />
              </span>
            </motion.h1>
          </div>

          {/* --- THE MANIFESTO TEXT BLOCK --- */}
          <div className="overflow-hidden mb-10 relative group">
            <motion.div
              variants={revealVar}
              className="relative pl-6 sm:pl-8"
            >
              {/* 1. The Golden Laser Line (Garis Kiri) */}
              <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-amber-500 via-amber-200 to-transparent shadow-[0_0_15px_#f59e0b] opacity-80" />

              {/* 2. Small Label (Tagline Kecil) */}
              <div className="mb-2 flex items-center gap-2">
                <span className="font-tech text-[9px] text-amber-500 tracking-[0.25em] uppercase">
                  OUR PHILOSOPHY
                </span>
                <div className="h-[1px] w-4 bg-amber-500/30" />
              </div>

              {/* 3. The Main Text */}
              <p className="font-modern text-sm sm:text-base md:text-lg text-slate-400 max-w-lg leading-[1.8] tracking-wide">
                Where timeless{" "}
                <span className="text-slate-200 font-serif italic">
                  classics
                </span>{" "}
                meet{" "}
                <span className="text-slate-200 font-tech text-xs align-middle">
                  FUTURISTIC
                </span>
                precision.
                <br className="hidden sm:block" />
                We do more than cut hair; we re-architect your{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500 font-bold drop-shadow-sm">
                  Charisma
                </span>{" "}
                &{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500 font-bold drop-shadow-sm">
                  Identity
                </span>{" "}
                through unmatched detail.
              </p>

              {/* 4. Background Ambience */}
              <div className="absolute inset-0 -left-4 -right-4 bg-gradient-to-r from-amber-900/10 to-transparent blur-xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </motion.div>
          </div>

          {/* --- MASTERPIECE BUTTONS --- */}
          <motion.div
            variants={revealVar}
            className="flex flex-wrap items-center gap-6"
          >
            {/* 1. BUTTON: THE CYBER-BLADE (Enter System) */}
            <Link to="/login" className="group relative focus:outline-none">
              {/* Glow Container */}
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-600 to-yellow-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-500 group-hover:duration-200" />

              {/* Main Button Shape */}
              <div className="relative clip-cyber bg-[#0f0f0f] border-l border-t border-amber-500/50 w-full sm:w-auto">
                {/* Hover Background Slide */}
                <div className="absolute inset-0 bg-amber-600 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300 ease-out origin-left" />

                {/* Shiny Wipe Effect */}
                <div className="absolute top-0 bottom-0 w-8 bg-white/20 skew-x-[-20deg] blur-md animate-shine" />

                <div className="relative px-8 py-4 flex items-center justify-center gap-3">
                  <span className="font-tech text-sm text-amber-500 font-bold tracking-[0.2em] uppercase group-hover:text-black transition-colors z-10">
                    ENTER
                  </span>
                  {/* Arrow Icon */}
                  <div className="w-5 h-5 flex items-center justify-center bg-amber-900/50 rounded-full group-hover:bg-black/20 transition-colors z-10">
                    <svg
                      className="w-3 h-3 text-amber-500 group-hover:text-black"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>

            {/* 2. BUTTON: SPECTRAL GLASS (View Gallery) */}
            <Link
              to="/gallery"
              className="group relative px-6 py-4 overflow-hidden rounded-lg"
            >
              {/* Glass Background */}
              <div className="absolute inset-0 bg-white/5 border border-white/10 backdrop-blur-sm group-hover:bg-white/10 transition-colors duration-300" />

              <div className="relative flex items-center gap-3">
                <div className="w-2 h-2 bg-slate-500 rounded-full group-hover:bg-amber-400 group-hover:shadow-[0_0_8px_#fbbf24] transition-all duration-300" />
                <span className="font-vintage text-lg text-slate-300 italic tracking-wide group-hover:text-white transition-colors">
                  View Gallery
                </span>
                <span className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-amber-400">
                  
                </span>
              </div>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* --- HUD DECORATIONS (CORNERS) --- */}
      {/* Bottom Right: Coordinates (di bawah clock karena z-index lebih kecil) */}
      <div className="fixed bottom-10 right-10 hidden md:flex flex-col items-end opacity-50 pointer-events-none">
        <div className="flex gap-1 mb-1">
          <div className="w-1 h-1 bg-amber-500" />
          <div className="w-1 h-1 bg-amber-500" />
          <div className="w-1 h-1 bg-slate-500" />
        </div>
      </div>

      {/* Bottom Left: Status Line */}
      <div className="fixed bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
    </div>
  );
}
