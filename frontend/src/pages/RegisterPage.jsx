// src/pages/RegisterPage.jsx
import React, { useState, useMemo, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Canvas, useFrame } from "@react-three/fiber";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import { useAuth } from "../hooks/useAuth";

// --- VISUAL ASSETS (SAMA UNIVERSE DENGAN LOGIN) ---

// 1. Slow Rising Gold Dust
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

// 2. Ambient Aurora
const AmbientGlow = () => (
  <motion.div
    animate={{ opacity: [0.25, 0.6, 0.25], scale: [1, 1.08, 1] }}
    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
    className="absolute top-[-10%] left-[-10%] w-[70vw] h-[70vw] bg-[#bf953f] rounded-full blur-[200px] opacity-20 pointer-events-none z-0 mix-blend-screen"
  />
);

// 3. CRT Scanline Overlay
const ScanlineOverlay = () => (
  <div className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-soft-light bg-[repeating-linear-gradient(to_bottom,rgba(255,255,255,0.12)_0px,rgba(255,255,255,0.12)_1px,transparent_1px,transparent_3px)]" />
);

// --- 3D BARBERSHOP POLE (SAMA DENGAN LOGIN) ---

function useBarberPoleTexture() {
  return useMemo(() => {
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);

    ctx.save();
    ctx.translate(size / 2, size / 2);
    ctx.rotate(-Math.PI / 4);
    const stripe = 70;

    for (let x = -size * 2; x < size * 2; x += stripe * 3) {
      ctx.fillStyle = "#ef4444";
      ctx.fillRect(x, -size * 2, stripe, size * 4);

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

    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.25;
      groupRef.current.position.y = Math.sin(t * 1.1) * 0.12;
    }

    if (poleRef.current?.material?.map) {
      poleRef.current.material.map.offset.y -= delta * 0.25;
    }

    if (glassRef.current?.material) {
      const mat = glassRef.current.material;
      mat.opacity = 0.34 + Math.sin(t * 2.2) * 0.08;
      mat.emissive = new THREE.Color("#fefce8");
      mat.emissiveIntensity = 0.16 + Math.sin(t * 3.1) * 0.08;
    }
  });

  return (
    <group ref={groupRef}>
      {/* pole stripes */}
      <mesh ref={poleRef}>
        <cylinderGeometry args={[0.3, 0.3, 3.2, 96, 1, true]} />
        <meshStandardMaterial
          map={stripeTexture}
          metalness={0.5}
          roughness={0.22}
        />
      </mesh>

      {/* warm inner cylinder */}
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

      {/* glass */}
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

      {/* caps & base */}
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
    </group>
  );
}

const RegisterHero3D = () => (
  <div className="relative h-56 sm:h-64 md:h-auto md:flex-1 w-full min-h-[220px]">
    <Canvas camera={{ position: [0.15, 0.2, 4.8], fov: 45 }}>
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
      <LuxuryPole3D />
    </Canvas>

    {/* vignette & gold glow */}
    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent" />
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0,#fbbf2433,transparent_55%)] mix-blend-screen" />
  </div>
);

// --- MAIN PAGE ---

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerCustomer, authLoading } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
  });
  const [error, setError] = useState("");
  const [localLoading, setLocalLoading] = useState(false);

  const loading = authLoading || localLoading;

  // --- Algoritma pengukur keamanan password (rendah / sedang / tinggi) ---
  const evaluatePasswordStrength = (password) => {
    if (!password || password.length === 0) {
      return { label: "", score: 0, level: "none" };
    }

    let score = 0;

    // panjang
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;

    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[^A-Za-z0-9]/.test(password);

    if (hasLower && hasUpper) score += 1;
    if (hasNumber) score += 1;
    if (hasSymbol) score += 1;

    if (score <= 2) {
      return { label: "Rendah", score, level: "low" };
    } else if (score <= 4) {
      return { label: "Sedang", score, level: "medium" };
    }

    return { label: "Tinggi", score, level: "high" };
  };

  const passwordStrength = useMemo(
    () => evaluatePasswordStrength(form.password),
    [form.password]
  );

  // style indikator strength (visual, selaras theme)
  const strengthStyles = {
    low: {
      bar: "bg-red-500/80 shadow-[0_0_8px_rgba(248,113,113,0.7)]",
      text: "text-red-300",
    },
    medium: {
      bar: "bg-amber-400/90 shadow-[0_0_8px_rgba(250,204,21,0.7)]",
      text: "text-amber-200",
    },
    high: {
      bar: "bg-emerald-400/90 shadow-[0_0_8px_rgba(52,211,153,0.7)]",
      text: "text-emerald-200",
    },
    none: {
      bar: "bg-slate-600/70",
      text: "text-slate-400",
    },
  };

  const strengthStyle =
    strengthStyles[passwordStrength.level] || strengthStyles.none;

  const handleChange = (e) => {
    setError("");
    const { name, value } = e.target;

    // Nama Lengkap: hanya alfabet + spasi, max 60 karakter
    if (name === "name") {
      let sanitized = value.replace(/[^A-Za-z\s]/g, "");
      if (sanitized.length > 60) sanitized = sanitized.slice(0, 60);
      setForm((prev) => ({ ...prev, name: sanitized }));
      return;
    }

    // Email: selalu lowercase, hapus spasi, max 60 karakter
    // Domain @barber.com diwajibkan lewat validasi di handleSubmit (bukan auto-append)
    if (name === "email") {
      let normalized = value.toLowerCase().replace(/\s/g, "");
      if (normalized.length > 60) normalized = normalized.slice(0, 60);
      setForm((prev) => ({ ...prev, email: normalized }));
      return;
    }

    // No. HP: hanya angka, max 30 digit
    if (name === "phone") {
      let digitsOnly = value.replace(/\D/g, "");
      if (digitsOnly.length > 30) {
        digitsOnly = digitsOnly.slice(0, 30);
      }
      setForm((prev) => ({ ...prev, phone: digitsOnly }));
      return;
    }

    // Password dan konfirmasi: bebas, nanti dicek minimal 8 karakter di handleSubmit
    if (name === "password" || name === "password_confirmation") {
      setForm((prev) => ({ ...prev, [name]: value }));
      return;
    }

    // default (jaga-jaga kalau ada field lain)
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validasi front-end sesuai requirement

    // Nama: hanya huruf + spasi, max 60 char
    if (
      !form.name ||
      form.name.length > 60 ||
      !/^[A-Za-z\s]+$/.test(form.name)
    ) {
      setError(
        "Nama lengkap hanya boleh berisi huruf dan spasi, dengan maksimal 60 karakter."
      );
      return;
    }

    // Email: lowercase, @barber.com, max 60 char
    const emailRegex = /^[a-z0-9._%+-]+@barber\.com$/;
    if (!emailRegex.test(form.email) || form.email.length > 60) {
      setError(
        "Email wajib huruf kecil, menggunakan domain @barber.com, dan maksimal 60 karakter."
      );
      return;
    }

    // Phone: optional, tapi kalau diisi hanya angka dan max 30 digit
    if (form.phone && !/^\d{1,30}$/.test(form.phone)) {
      setError("No. HP hanya boleh berisi angka dengan maksimal 30 digit.");
      return;
    }

    // Password: minimal 8 karakter
    if (!form.password || form.password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }

    setLocalLoading(true);
    try {
      await registerCustomer(form);
      navigate("/login", { replace: true });
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message ||
        "Registrasi gagal. Periksa kembali data yang diisi.";
      setError(msg);
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-8 sm:px-6 overflow-hidden bg-[#020202] selection:bg-[#bf953f] selection:text-black">
      {/* FONT & LUXURY CSS (SAMA DENGAN LOGIN) */}
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

      {/* BACKGROUND LAYERS */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#111111_0%,_#000000_100%)]" />
        <AmbientGlow />
        <div className="absolute bottom-0 right-0 w-[50vw] h-[50vw] bg-slate-900/25 blur-[150px] rounded-full mix-blend-color-dodge" />
        <FloatingParticles />
        <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(191,149,63,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(191,149,63,0.03)_1px,transparent_1px)] bg-[size:100px_100px] opacity-20" />
        <ScanlineOverlay />
      </div>

      {/* MAIN CARD */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[1100px] min-h-[640px] flex shadow-[0_20px_70px_-10px_rgba(0,0,0,0.9)]"
      >
        {/* glass container */}
        <div className="absolute inset-0 bg-[#0a0a0a]/75 backdrop-blur-xl rounded-sm border border-white/5" />
        {/* golden lines */}
        <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-[#bf953f] to-transparent opacity-55" />
        <div className="absolute bottom-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-[#bf953f] to-transparent opacity-55" />

        <div className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-[1.2fr_1fr]">
          {/* LEFT: BRANDING + 3D */}
          <div className="relative flex flex-col h-full border-b lg:border-b-0 lg:border-r border-white/5 bg-gradient-to-br from-black/45 via-black/30 to-transparent overflow-hidden">
            <div className="px-8 pt-8 pb-3 lg:px-12 lg:pt-10">
              <span className="font-tech text-[10px] tracking-[0.4em] uppercase text-[#bf953f]">
                Customer Enrollment
              </span>
              <h1 className="mt-3 font-vintage text-[2rem] md:text-[2.4rem] text-slate-100 tracking-[0.24em] leading-tight uppercase drop-shadow-[0_0_28px_rgba(15,23,42,1)]">
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
              <p className="relative mt-4 max-w-md pl-4 font-modern text-[11px] leading-relaxed text-slate-300">
                {/* garis gradien di kiri, lebih halus & classy */}
                <span className="pointer-events-none absolute left-0 top-1 bottom-1 w-[1px] rounded-full bg-gradient-to-b from-[#bf953f] via-[#bf953f]/40 to-transparent" />

                {/* label kecil di atas paragraf */}
                <span className="mb-1 block font-tech text-[9px] tracking-[0.32em] uppercase text-[#bf953f]">
                  Membership Benefits
                </span>

                {/* isi paragraf utama */}
                <span className="block text-slate-300/90">
                  Dengan mendaftar sebagai customer, Anda dapat melakukan pemesanan barber
                  favorit, memantau promo harian, serta mengumpulkan kupon loyalti yang
                  terakumulasi otomatis setiap 7 kali kunjungan.
                </span>
              </p>
            </div>

            <RegisterHero3D />

            <div className="px-8 pb-7 pt-3 lg:px-12 font-tech text-[10px] text-slate-400 flex items-center gap-3 border-t border-white/5 bg-black/40">

            </div>
          </div>

          {/* RIGHT: REGISTER FORM */}
          <div className="relative flex flex-col justify-center p-8 sm:p-10 lg:p-12 bg-[#050505]/40">
            {/* subtle aura */}
            <div className="pointer-events-none absolute -inset-6 rounded-[24px] bg-gradient-to-tr from-[#bf953f]/18 via-transparent to-sky-500/12 blur-xl opacity-80" />

            <div className="relative w-full max-w-sm mx-auto md:max-w-none">
              <div className="mb-8 text-left">
                <h2 className="relative inline-flex flex-col gap-1 font-royal text-slate-100">
                  <span className="relative inline-flex items-baseline gap-2 text-[1.5rem] md:text-[1.8rem] leading-none">
                    <span className="bg-gradient-to-r from-slate-50 via-slate-200 to-slate-400 bg-clip-text text-transparent">
                      Customer
                    </span>
                    <span className="relative text-gold-gradient drop-shadow-[0_0_18px_rgba(191,149,63,0.85)]">
                      Register
                      <span className="pointer-events-none absolute -inset-x-1 -bottom-1 h-[2px] bg-gradient-to-r from-transparent via-[#facc15] to-transparent blur-[3px] opacity-90" />
                    </span>
                  </span>
                  <span className="mt-2 h-[1px] w-24 bg-gradient-to-r from-transparent via-[#bf953f] to-transparent opacity-70" />
                </h2>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="mb-5 px-4 py-3 bg-red-900/15 border border-red-500/40 rounded-md flex items-start gap-3 shadow-[0_0_25px_rgba(127,29,29,0.5)]"
                  >
                    <div className="mt-0.5 h-7 w-1 bg-red-400/80" />
                    <p className="font-tech text-[10px] text-red-100 tracking-[0.14em] uppercase leading-relaxed">
                      {error}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <form
                onSubmit={handleSubmit}
                className="space-y-5 text-xs sm:text-sm"
              >
                {/* Nama */}
                <div className="group relative">
                  <label className="block mb-1.5 text-[10px] font-tech uppercase tracking-[0.24em] text-slate-500 group-focus-within:text-[#bf953f] transition-colors">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="w-full bg-transparent border-b border-white/10 py-2.5 text-sm text-slate-100 outline-none focus:border-[#bf953f] font-modern tracking-wide transition-all duration-300"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                  <div className="absolute bottom-0 left-1/2 w-0 h-[1px] bg-[#bf953f] transition-all duration-500 ease-out group-hover:w-full group-focus-within:w-full -translate-x-1/2 shadow-[0_0_12px_#bf953f]" />
                </div>

                {/* Email */}
                <div className="group relative">
                  <label className="block mb-1.5 text-[10px] font-tech uppercase tracking-[0.24em] text-slate-500 group-focus-within:text-[#bf953f] transition-colors">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="w-full bg-transparent border-b border-white/10 py-2.5 text-sm text-slate-100 outline-none focus:border-[#bf953f] font-modern tracking-wide transition-all duration-300"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                  <div className="absolute bottom-0 left-1/2 w-0 h-[1px] bg-[#bf953f] transition-all duration-500 ease-out group-hover:w-full group-focus-within:w-full -translate-x-1/2 shadow-[0_0_12px_#bf953f]" />
                </div>

                {/* Phone */}
                <div className="group relative">
                  <label className="block mb-1.5 text-[10px] font-tech uppercase tracking-[0.24em] text-slate-500 group-focus-within:text-[#bf953f] transition-colors">
                    No. HP
                  </label>
                  <input
                    type="text"
                    name="phone"
                    className="w-full bg-transparent border-b border-white/10 py-2.5 text-sm text-slate-100 outline-none focus:border-[#bf953f] font-modern tracking-wide transition-all duration-300 placeholder:text-slate-600"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Opsional, memudahkan admin menghubungi kamu"
                  />
                  <div className="absolute bottom-0 left-1/2 w-0 h-[1px] bg-[#bf953f] transition-all duration-500 ease-out group-hover:w-full group-focus-within:w-full -translate-x-1/2 shadow-[0_0_12px_#bf953f]" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Password */}
                  <div className="group relative">
                    <label className="mb-1.5 flex items-center justify-between text-[10px] font-tech uppercase tracking-[0.24em] text-slate-500 group-focus-within:text-[#bf953f] transition-colors">
                      <span>Password</span>
                      {form.password && (
                        <span className="inline-flex items-center gap-1.5 text-[9px] font-normal normal-case tracking-normal">
                          <span
                            className={`h-1 w-7 rounded-full ${strengthStyle.bar}`}
                          />
                          <span className={strengthStyle.text}>
                            {passwordStrength.label}
                          </span>
                        </span>
                      )}
                    </label>
                    <input
                      type="password"
                      name="password"
                      className="w-full bg-transparent border-b border-white/10 py-2.5 text-sm text-slate-100 outline-none focus:border-[#bf953f] font-modern tracking-wide transition-all duration-300"
                      value={form.password}
                      onChange={handleChange}
                      required
                      // indikator non-visual (tooltip + data attribute)
                      data-strength={passwordStrength.level}
                      title={
                        passwordStrength.label
                          ? `Keamanan password: ${passwordStrength.label}`
                          : undefined
                      }
                    />
                    <div className="absolute bottom-0 left-1/2 w-0 h-[1px] bg-[#bf953f] transition-all duration-500 ease-out group-hover:w-full group-focus-within:w-full -translate-x-1/2 shadow-[0_0_12px_#bf953f]" />
                  </div>

                  {/* Confirm Password */}
                  <div className="group relative">
                    <label className="block mb-1.5 text-[10px] font-tech uppercase tracking-[0.24em] text-slate-500 group-focus-within:text-[#bf953f] transition-colors">
                      Konfirmasi Password
                    </label>
                    <input
                      type="password"
                      name="password_confirmation"
                      className="w-full bg-transparent border-b border-white/10 py-2.5 text-sm text-slate-100 outline-none focus:border-[#bf953f] font-modern tracking-wide transition-all duration-300"
                      value={form.password_confirmation}
                      onChange={handleChange}
                      required
                    />
                    <div className="absolute bottom-0 left-1/2 w-0 h-[1px] bg-[#bf953f] transition-all duration-500 ease-out group-hover:w-full group-focus-within:w-full -translate-x-1/2 shadow-[0_0_12px_#bf953f]" />
                  </div>
                </div>

                {/* SUBMIT BUTTON (GOLD INGOT) */}
                <button
                  type="submit"
                  disabled={loading}
                  className="relative mt-4 w-full group overflow-hidden rounded-[18px] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#8e6e2b] via-[#bf953f] to-[#8e6e2b] opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute inset-[1px] bg-[#050505] transition-all duration-300 group-hover:bg-[#151515]" />
                  <div className="relative py-3.5 px-6 flex items-center justify-center gap-4">
                    {/* glow ellipse lembut di belakang konten */}
                    <span className="pointer-events-none absolute inset-x-6 -top-1 h-8 rounded-full bg-[radial-gradient(circle_at_center,rgba(252,246,186,0.45),transparent_70%)] blur-xl opacity-70 group-hover:opacity-95 transition-all duration-300" />

                    {/* teks utama + ikon */}
                    <span className="relative inline-flex items-center gap-3">
                      <span className="font-tech text-[11px] font-bold tracking-[0.38em] uppercase text-gold-gradient group-hover:text-[#fcf6ba] transition-colors">
                        {loading ? "Mendaftar..." : "Daftar sebagai Customer"}
                      </span>
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/12 to-transparent skew-x-[-20deg] animate-shimmer pointer-events-none" />
                </button>
              </form>

              {/* LINK KE LOGIN */}
              <div className="mt-7 text-center font-modern text-[11px] text-slate-400">
                <span className="mb-2 block text-slate-500">
                  Sudah punya akun?
                </span>

                <Link
                  to="/login"
                  className="
                    group relative inline-flex items-center gap-3
                    font-tech text-[10px] tracking-[0.32em] uppercase
                    cursor-pointer
                  "
                >
                  {/* highlight band tipis di belakang teks */}
                  <span
                    className="
                      pointer-events-none absolute inset-x-0 -bottom-0.5 h-[1px]
                      bg-gradient-to-r from-transparent via-[#bf953f] to-transparent
                      opacity-50 group-hover:opacity-100 group-hover:blur-[1px]
                      transition-all duration-300
                    "
                  />

                  {/* soft glow saat hover */}
                  <span
                    className="
                      pointer-events-none absolute inset-x-2 -top-2 h-7
                      bg-[radial-gradient(circle_at_center,rgba(250,204,21,0.20),transparent_70%)]
                      opacity-0 group-hover:opacity-80 group-hover:blur-lg
                      transition-all duration-300
                    "
                  />

                  {/* teks utama */}
                  <span
                    className="
                      relative
                      bg-gradient-to-r from-slate-200 via-[#facc15] to-slate-200
                      bg-clip-text text-transparent
                      group-hover:from-[#facc15] group-hover:via-[#fef9c3] group-hover:to-slate-100
                      transition-colors
                    "
                  >
                    Login di sini
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
