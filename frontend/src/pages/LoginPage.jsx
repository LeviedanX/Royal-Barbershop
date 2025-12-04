// src/pages/LoginPage.jsx
import React, { useState, useMemo, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Canvas, useFrame } from "@react-three/fiber";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import { useAuth } from "../hooks/useAuth";

// --- VISUAL ASSETS ---

// 1. Slow Rising Gold Dust (Lebih lambat & elegan)
const FloatingParticles = () => {
  const particles = Array.from({ length: 30 });
  const w = typeof window !== "undefined" ? window.innerWidth : 1280;
  const h = typeof window !== "undefined" ? window.innerHeight : 720;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: Math.random() * w,
            y: Math.random() * h,
            opacity: 0,
            scale: 0.5,
          }}
          animate={{
            y: [null, Math.random() * -60],
            opacity: [0, 0.4, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: Math.random() * 15 + 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 5,
          }}
          className="absolute rounded-full blur-[1px]"
          style={{
            width: Math.random() * 3 + 1 + "px",
            height: Math.random() * 3 + 1 + "px",
            background: "linear-gradient(to bottom right, #bf953f, #fcf6ba)",
            boxShadow: "0 0 10px rgba(191, 149, 63, 0.35)",
          }}
        />
      ))}
    </div>
  );
};

// 2. Ambient Aurora (soft aurora glow)
const AmbientGlow = () => (
  <motion.div
    animate={{ opacity: [0.25, 0.6, 0.25], scale: [1, 1.08, 1] }}
    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
    className="absolute top-[-10%] left-[-10%] w-[70vw] h-[70vw] bg-[#bf953f] rounded-full blur-[200px] opacity-20 pointer-events-none z-0 mix-blend-screen"
  />
);

// 3. Subtle CRT Scanline Overlay
const ScanlineOverlay = () => (
  <div className="pointer-events-none absolute inset-0 opacity-[0.1] mix-blend-soft-light bg-[repeating-linear-gradient(to_bottom,rgba(255,255,255,0.16)_0px,rgba(255,255,255,0.16)_1px,transparent_1px,transparent_3px)]" />
);

// --- 3D BARBERSHOP POLE (CLASSIC + LUXURY NOIR EDITION) ---

// Diagonal red-white-blue stripes (barbershop klasik)
function useBarberPoleTexture() {
  return useMemo(() => {
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    // base white
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);

    ctx.save();
    ctx.translate(size / 2, size / 2);
    ctx.rotate(-Math.PI / 4);
    const stripe = 70;

    for (let x = -size * 2; x < size * 2; x += stripe * 3) {
      // red stripe
      ctx.fillStyle = "#ef4444";
      ctx.fillRect(x, -size * 2, stripe, size * 4);

      // blue stripe
      ctx.fillStyle = "#2563eb";
      ctx.fillRect(x + stripe * 2, -size * 2, stripe, size * 4);
    }

    ctx.restore();

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.anisotropy = 16;
    texture.repeat.set(1.4, 1);
    return texture;
  }, []);
}

function LuxuryPole3D() {
  const groupRef = useRef();
  const poleRef = useRef();
  const glassRef = useRef();
  const stripeTexture = useBarberPoleTexture();

  useFrame((_, delta) => {
    const t = performance.now() * 0.001;

    // slow spin + float
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.25;
      groupRef.current.position.y = Math.sin(t * 1.1) * 0.12;
    }

    // stripes scroll
    if (poleRef.current?.material?.map) {
      poleRef.current.material.map.offset.y -= delta * 0.25;
    }

    // breathing glow on glass
    if (glassRef.current?.material) {
      const mat = glassRef.current.material;
      mat.opacity = 0.34 + Math.sin(t * 2.2) * 0.08;
      mat.emissive = new THREE.Color("#fefce8");
      mat.emissiveIntensity = 0.16 + Math.sin(t * 3.1) * 0.08;
    }
  });

  return (
    <group ref={groupRef}>
      {/* classic barber stripes */}
      <mesh ref={poleRef}>
        <cylinderGeometry args={[0.3, 0.3, 3.2, 96, 1, true]} />
        <meshStandardMaterial
          map={stripeTexture}
          metalness={0.5}
          roughness={0.22}
        />
      </mesh>

      {/* inner soft warm cylinder untuk hint gold */}
      <mesh>
        <cylinderGeometry args={[0.305, 0.305, 3.22, 48, 1, true]} />
        <meshStandardMaterial
          color="#facc15"
          metalness={0.3}
          roughness={0.8}
          transparent
          opacity={0.04}
          emissive="#fbbf24"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* outer glass shell */}
      <mesh ref={glassRef}>
        <cylinderGeometry args={[0.4, 0.4, 3.4, 64, 1, true]} />
        <meshPhysicalMaterial
          color="#f9fafb"
          metalness={0.15}
          roughness={0.05}
          transmission={0.9}
          transparent
          opacity={0.35}
          thickness={0.24}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>

      {/* top cap (gold + black enamel) */}
      <mesh position={[0, 1.85, 0]}>
        <cylinderGeometry args={[0.46, 0.5, 0.3, 64]} />
        <meshStandardMaterial
          color="#020617"
          metalness={0.95}
          roughness={0.25}
        />
      </mesh>
      <mesh position={[0, 2.05, 0]}>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshStandardMaterial
          color="#bf953f"
          metalness={1}
          roughness={0.12}
          emissive="#facc15"
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* bottom cap (gold ring) */}
      <mesh position={[0, -1.85, 0]}>
        <cylinderGeometry args={[0.5, 0.46, 0.3, 64]} />
        <meshStandardMaterial
          color="#111827"
          metalness={0.9}
          roughness={0.25}
        />
      </mesh>
      <mesh position={[0, -2.03, 0]}>
        <ringGeometry args={[0.35, 0.55, 64]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.4} />
      </mesh>

      {/* floor plate + neon ring */}
      <mesh position={[0, -2.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.4, 64]} />
        <meshStandardMaterial
          color="#020617"
          metalness={0.8}
          roughness={0.4}
        />
      </mesh>
      <mesh position={[0, -2.19, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.95, 1.35, 64]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.35} />
      </mesh>

      {/* small floating light orbs */}
      <mesh position={[-0.9, 0.55, 0.8]}>
        <sphereGeometry args={[0.08, 18, 18]} />
        <meshBasicMaterial color="#f97316" />
      </mesh>
      <mesh position={[0.95, -0.25, -0.7]}>
        <sphereGeometry args={[0.07, 18, 18]} />
        <meshBasicMaterial color="#38bdf8" />
      </mesh>
    </group>
  );
}

// --- MAIN PAGE ---

export default function LoginPage() {
  const { login, authLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [localLoading, setLocalLoading] = useState(false);

  const loading = authLoading || localLoading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLocalLoading(true);
    try {
      const user = await login(email, password);
      setTimeout(() => {
        if (user.role === "admin")
          navigate("/dashboard/admin", { replace: true });
        else if (user.role === "barber")
          navigate("/dashboard/barber", { replace: true });
        else navigate("/dashboard/customer", { replace: true });
      }, 900);
    } catch (err) {
      console.error(err);
      setError("Akses Ditolak. Periksa kredensial Anda.");
      setLocalLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 overflow-hidden bg-[#020202] selection:bg-[#bf953f] selection:text-black">
      {/* --- LUXURY CSS INJECTION --- */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Italiana&family=Manrope:wght@300;400;500;600&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap');
        
        .font-royal { font-family: 'Cinzel', serif; }
        .font-vintage { font-family: 'Italiana', serif; }
        .font-tech { font-family: 'Space Mono', monospace; }
        .font-modern { font-family: 'Manrope', sans-serif; }
        
        .text-gold-gradient {
          background: linear-gradient(to right, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          background-size: 200% auto;
          animation: shine 5s linear infinite;
        }

        @keyframes shine {
          to { background-position: 200% center; }
        }

        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active{
            -webkit-box-shadow: 0 0 0 30px #0a0a0a inset !important;
            -webkit-text-fill-color: #e2e8f0 !important;
            transition: background-color 5000s ease-in-out 0s;
        }

        @keyframes shimmer {
          0% { transform: translateX(-150%) skewX(-20deg); }
          50% { transform: translateX(150%) skewX(-20deg); }
          100% { transform: translateX(150%) skewX(-20deg); }
        }
        .animate-shimmer { animation: shimmer 3s infinite; }
      `}</style>

      {/* --- BACKGROUND LAYERS --- */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#111111_0%,_#000000_100%)]" />
        <AmbientGlow />
        <div className="absolute bottom-0 right-0 w-[50vw] h-[50vw] bg-slate-900/25 blur-[150px] rounded-full mix-blend-color-dodge" />
        <FloatingParticles />
        <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(191,149,63,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(191,149,63,0.03)_1px,transparent_1px)] bg-[size:100px_100px] opacity-20" />
        <ScanlineOverlay />
      </div>

      {/* --- MAIN CARD (THE OBSIDIAN MONOLITH) --- */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[1100px] min-h-[600px] flex shadow-[0_20px_70px_-10px_rgba(0,0,0,0.85)]"
      >
        {/* glass container */}
        <div className="absolute inset-0 bg-[#0a0a0a]/75 backdrop-blur-xl rounded-sm border border-white/5" />

        {/* golden border accents */}
        <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-[#bf953f] to-transparent opacity-55" />
        <div className="absolute bottom-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-[#bf953f] to-transparent opacity-55" />

        <div className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-[1.2fr_1fr]">
          {/* LEFT: VISUAL EXPERIENCE */}
          <div className="relative hidden lg:flex flex-col items-center justify-center p-12 border-r border-white/5 bg-gradient-to-br from-black/45 via-black/30 to-transparent overflow-hidden">
            {/* branding top */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.75 }}
              className="absolute top-10 w-full flex flex-col items-center z-20"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="h-[1px] w-12 bg-[#bf953f]/55" />
                <span className="font-tech text-[10px] text-[#bf953f] tracking-[0.4em] uppercase">
                  Est. 2025
                </span>
                <div className="h-[1px] w-12 bg-[#bf953f]/55" />
              </div>
              <h1 className="relative font-vintage text-[2.7rem] md:text-[3.1rem] text-slate-100 tracking-[0.32em] leading-none uppercase drop-shadow-[0_0_32px_rgba(15,23,42,1)]">
                {/* shiny sweep di atas teks */}
                <span className="pointer-events-none absolute inset-x-[-40px] -top-2 h-10 bg-gradient-to-r from-transparent via-white/25 to-transparent blur-md opacity-60 animate-shimmer" />

                {/* glow ellipse di belakang teks */}
                <span className="pointer-events-none absolute inset-x-[-60px] top-1 h-10 bg-[radial-gradient(circle_at_center,#facc1550,transparent_65%)] blur-xl" />

                <span className="relative inline-flex items-baseline gap-3">
                  {/* ROYAL dengan gradient putih kebiruan */}
                  <span className="bg-gradient-to-r from-slate-50 via-slate-200 to-slate-400 bg-clip-text text-transparent">
                    ROYAL
                  </span>

                  {/* Barber emas + underline glow */}
                  <span className="relative text-gold-gradient font-royal italic pr-1 drop-shadow-[0_0_20px_rgba(191,149,63,0.9)]">
                    Barber
                    {/* garis emas glow di bawah kata Barber */}
                    <span className="pointer-events-none absolute -inset-x-1 -bottom-1 h-[2px] bg-gradient-to-r from-transparent via-[#facc15] to-transparent blur-[3px] opacity-90" />
                  </span>
                </span>
              </h1>
            </motion.div>

            {/* 3D Centerpiece */}
            <div className="w-full h-[400px] relative z-10">
              <Canvas camera={{ position: [0.1, 0.2, 4.8], fov: 45 }}>
                <color attach="background" args={["#020617"]} />
                <fog attach="fog" args={["#020617", 4, 11]} />
                <ambientLight intensity={0.25} />
                <spotLight
                  position={[5, 6, 6]}
                  angle={0.5}
                  penumbra={1}
                  intensity={2.2}
                  color="#bf953f"
                  castShadow
                />
                <spotLight
                  position={[-5, -4, 5]}
                  angle={0.55}
                  penumbra={1}
                  intensity={1.8}
                  color="#60a5fa"
                />
                <pointLight
                  position={[0, 2, 3]}
                  intensity={0.7}
                  color="#f97316"
                />
                <LuxuryPole3D />
              </Canvas>
            </div>

            {/* branding bottom */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.75 }}
              className="absolute bottom-10 w-full text-center z-20"
            >
            <p className="relative font-modern text-[11px] text-slate-300/90 max-w-sm mx-auto leading-relaxed">
              {/* garis tipis gold di atas */}
              <span className="pointer-events-none absolute -top-3 left-1/2 h-[1px] w-24 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#bf953f] to-transparent opacity-80" />
              {/* garis tipis biru di bawah */}
              <span className="pointer-events-none absolute -bottom-2 left-1/2 h-[1px] w-32 -translate-x-1/2 bg-gradient-to-r from-transparent via-sky-400/70 to-transparent opacity-60" />

              {/* label kecil di atas quote */}
              <span className="mb-1 block font-tech text-[9px] tracking-[0.32em] text-[#bf953f] uppercase drop-shadow-[0_0_12px_rgba(191,149,63,0.8)]">
                Signature Motto
              </span>

              {/* teks quote utama dengan sedikit glow & gradient */}
              <span className="block italic bg-gradient-to-r from-slate-100 via-slate-200 to-slate-300 bg-clip-text text-transparent drop-shadow-[0_0_14px_rgba(15,23,42,0.9)]">
                “Elegance is not standing out, but being remembered.”
              </span>
            </p>
            </motion.div>
          </div>

          {/* RIGHT: ACCESS PORTAL */}
          <div className="relative flex flex-col justify-center p-8 sm:p-12 lg:p-16 bg-[#050505]/40">
            <div className="max-w-md mx-auto w-full relative">
              {/* subtle form aura */}
              <div className="pointer-events-none absolute -inset-6 rounded-[24px] bg-gradient-to-tr from-[#bf953f]/15 via-transparent to-sky-500/10 blur-xl opacity-80" />

              <div className="relative">
                <div className="mb-10 text-left">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="relative inline-flex flex-col gap-1 font-royal text-slate-100">
                      {/* label kecil di atas: kesan futuristik */}

                      {/* judul utama */}
                      <span className="relative inline-flex items-baseline gap-2 text-[1.55rem] md:text-[1.9rem] leading-none">
                        {/* kata Member dengan gradient lembut */}
                        <span className="bg-gradient-to-r from-slate-50 via-slate-200 to-slate-400 bg-clip-text text-transparent">
                          LOGIN
                        </span>

                        {/* kata Access dengan gold + glow */}
                        <span className="relative text-gold-gradient drop-shadow-[0_0_18px_rgba(191,149,63,0.85)]">
                          PAGE
                          {/* underline glow tipis di bawah Access */}
                          <span className="pointer-events-none absolute -inset-x-1 -bottom-1 h-[2px] bg-gradient-to-r from-transparent via-[#facc15] to-transparent blur-[3px] opacity-90" />
                        </span>
                      </span>

                      {/* garis tipis dekoratif di bawah judul */}
                      <span className="mt-2 h-[1px] w-24 bg-gradient-to-r from-transparent via-[#bf953f] to-transparent opacity-70" />
                    </h2>
                  </div>
                  <p className="relative inline-flex items-center gap-3 font-tech text-[10px] tracking-[0.32em] text-slate-300 uppercase">
                    {/* bullet emas kecil di kiri */}
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#bf953f]/70 bg-black/60 shadow-[0_0_16px_rgba(191,149,63,0.7)]">
                      <span className="h-2 w-2 rounded-full bg-[#bf953f] shadow-[0_0_10px_rgba(191,149,63,0.9)]" />
                    </span>

                    {/* teks utama dengan garis kiri + gradient tipis */}
                    <span className="relative border-l border-[#bf953f]/70 pl-3">
                      <span className="bg-gradient-to-r from-slate-200 via-[#facc15] to-slate-200 bg-clip-text text-transparent">
                        Masukkan Email & Password dengan Benar
                      </span>

                      {/* glow garis bawah halus */}
                      <span className="pointer-events-none absolute -bottom-1 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-[#bf953f] to-transparent opacity-70 blur-[1px]" />
                    </span>
                  </p>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="mb-6 px-4 py-3 bg-red-900/10 border border-red-900/30 rounded-sm flex items-center gap-3"
                    >
                      <div className="w-1 h-8 bg-red-500/50" />
                      <p className="font-tech text-[10px] text-red-300 uppercase tracking-wide">
                        {error}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-10">
                  {/* EMAIL INPUT */}
                  <div className="group relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="peer w-full bg-transparent border-b border-white/10 py-3 text-sm text-slate-100 placeholder-transparent focus:outline-none focus:border-[#bf953f] transition-all duration-500 font-modern tracking-wide z-10 relative"
                      placeholder="Email"
                    />
                    <label className="absolute left-0 -top-4 text-[10px] text-[#bf953f] font-tech uppercase tracking-[0.2em] transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-600 peer-placeholder-shown:top-3 peer-placeholder-shown:tracking-normal peer-focus:-top-4 peer-focus:text-[10px] peer-focus:text-[#bf953f] peer-focus:tracking-[0.2em]">
                      Email (example@barber.com)
                    </label>
                    <div className="absolute bottom-0 left-1/2 w-0 h-[1px] bg-[#bf953f] transition-all duration-500 ease-out group-hover:w-full group-focus-within:w-full -translate-x-1/2 shadow-[0_0_15px_#bf953f]" />
                  </div>

                  {/* PASSWORD INPUT */}
                  <div className="group relative">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="peer w-full bg-transparent border-b border-white/10 py-3 text-sm text-slate-100 placeholder-transparent focus:outline-none focus:border-[#bf953f] transition-all duration-500 font-modern tracking-wide z-10 relative"
                      placeholder="Password"
                    />
                    <label className="absolute left-0 -top-4 text-[10px] text-[#bf953f] font-tech uppercase tracking-[0.2em] transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-600 peer-placeholder-shown:top-3 peer-placeholder-shown:tracking-normal peer-focus:-top-4 peer-focus:text-[10px] peer-focus:text-[#bf953f] peer-focus:tracking-[0.2em]">
                      Password
                    </label>
                    <div className="absolute bottom-0 left-1/2 w-0 h-[1px] bg-[#bf953f] transition-all duration-500 ease-out group-hover:w-full group-focus-within:w-full -translate-x-1/2 shadow-[0_0_15px_#bf953f]" />
                  </div>

                  {/* SUBMIT BUTTON (GOLD INGOT STYLE) */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="relative w-full group overflow-hidden mt-6"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#8e6e2b] via-[#bf953f] to-[#8e6e2b] opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute inset-[1px] bg-[#0a0a0a] transition-all duration-300 group-hover:bg-[#151515]" />

                    <div className="relative py-4 flex items-center justify-center gap-3">
                      <span className="font-tech text-xs font-bold tracking-[0.3em] uppercase text-gold-gradient group-hover:text-[#fcf6ba] transition-colors">
                        {loading ? "Mengverifikasi..." : "KONFIRMASI"}
                      </span>
                      <svg
                        className="w-4 h-4 text-[#bf953f] transform group-hover:translate-x-1 transition-transform"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/12 to-transparent skew-x-[-20deg] animate-shimmer pointer-events-none" />
                  </button>
                </form>

                {/* LINKS */}
                <div className="mt-12 flex flex-col items-center gap-4">
                <Link
                  to="/register"
                  className="group relative inline-flex items-center gap-3 font-tech text-[10px] uppercase tracking-[0.32em] text-slate-400"
                >

                  {/* text + underline glow */}
                  <span className="relative">
                    <span className="bg-gradient-to-r from-slate-200 via-[#facc15] to-slate-200 bg-clip-text text-transparent group-hover:from-[#facc15] group-hover:via-[#fef9c3] group-hover:to-slate-100 transition-colors">
                      Create New Membership
                    </span>

                    {/* underline gold shimmer */}
                    <span className="pointer-events-none absolute -bottom-1 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-[#bf953f] to-transparent opacity-0 group-hover:opacity-100 group-hover:blur-[1.5px] transition-all duration-400" />
                  </span>
                </Link>
                  <button
                    onClick={() => navigate("/")}
                    className="text-slate-700 hover:text-slate-400 transition-colors"
                  >
                  <span className="relative inline-flex flex-col items-start">
                  <span
                    className="
                      group relative inline-flex items-center justify-center
                      px-6 py-2.5 rounded-full
                      bg-gradient-to-r from-[#050505] via-[#020202] to-[#060606]
                      border border-amber-500/45
                      shadow-[0_0_18px_rgba(15,10,0,0.9)]
                      hover:shadow-[0_0_26px_rgba(245,158,11,0.95)]
                      transition-all duration-300
                    "
                  >
                    {/* outline glow utama (gold) */}
                    <span
                      className="
                        pointer-events-none absolute -inset-[1px] rounded-full
                        border border-amber-300/50
                        opacity-70 blur-[1.2px]
                      "
                    />
                    {/* outline glow kedua saat hover */}
                    <span
                      className="
                        pointer-events-none absolute -inset-[4px] rounded-full
                        border border-amber-400/35
                        opacity-0 group-hover:opacity-100 group-hover:blur-[3px]
                        transition-all duration-300
                      "
                    />

                    {/* inner glow dark-gold */}
                    <span
                      className="
                        pointer-events-none absolute inset-[3px] rounded-full
                        bg-[radial-gradient(circle_at_center,rgba(250,204,21,0.32),transparent_70%)]
                        opacity-80
                      "
                    />

                    {/* shiny sweep di atas kapsul */}
                    <span
                      className="
                        pointer-events-none absolute inset-x-4 -top-1 h-7
                        bg-gradient-to-r from-transparent via-white/18 to-transparent
                        opacity-0 group-hover:opacity-80 blur-md
                        animate-shimmer
                      "
                    />

                    {/* teks utama */}
                    <span
                      className="
                        relative font-vintage
                        text-[11px] md:text-[12px]
                        tracking-[0.28em] uppercase
                        bg-gradient-to-r from-[#fefce8] via-[#fde68a] to-[#fbbf24]
                        bg-clip-text text-transparent
                        drop-shadow-[0_0_10px_rgba(15,10,0,0.9)]
                      "
                    >
                      Back to Home
                    </span>

                    {/* garis tipis gold di bawah teks */}
                    <span
                      className="
                        pointer-events-none absolute bottom-[4px] left-5 right-5 h-[1px]
                        bg-gradient-to-r from-transparent via-amber-300 to-transparent
                        opacity-70 blur-[1.2px]
                      "
                    />
                  </span>
                  </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
