// src/pages/BookingPage.jsx
import React, { useEffect, useState, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { motion } from "framer-motion";
import * as THREE from "three";

import MainLayout from "../components/Layout/MainLayout";
import RealtimeClock from "../components/ui/RealtimeClock";
import AnnouncementBanner from "../components/ui/AnnouncementBanner";
import BarberCard from "../components/ui/BarberCard";
import ServiceCard from "../components/ui/ServiceCard";
import PaymentButton from "../components/ui/PaymentButton";
import HairstyleGallery from "../components/ui/HairstyleGallery";
import {
  calculateBookingPrice,
  getBarberBasePrice,
  getServiceBasePrice,
  getSkillPremium,
} from "../utils/price";
import { http } from "../api/http";

// --- VISUAL ASSETS: SAMA UNIVERSE DENGAN REGISTER & LOGIN ---

// 1. Slow Rising Gold Dust
const FloatingParticles = () => {
  const particles = Array.from({ length: 30 });
  // Fallback safe for SSR/initial render
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

// --- 3D BARBERSHOP POLE (LUXURY VERSION) ---

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

const BookingHero3D = () => (
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

// --- MAIN PAGE LOGIC ---

export default function BookingPage() {
  const [barbers, setBarbers] = useState([]);
  const [services, setServices] = useState([]);
  const [hairstyles, setHairstyles] = useState([]);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedHairstyle, setSelectedHairstyle] = useState(null);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [bookingResult, setBookingResult] = useState(null);

  const fallbackHairstyles = useMemo(
    () => [
      {
        id: "style-local-1",
        name: "Neon Fade",
        image_url: "/images/hairstyles/fade-neon.jpg",
      },
      {
        id: "style-local-2",
        name: "UnderCut Clean",
        image_url: "/images/hairstyles/undercut-clean.jpg",
      },
      {
        id: "style-local-3",
        name: "Textured Crop",
        image_url: "/images/hairstyles/textured-crop.jpg",
      },
      {
        id: "style-local-4",
        name: "Slickback Modern",
        image_url: "/images/hairstyles/slickback-modern.jpg",
      },
    ],
    []
  );

  useEffect(() => {
    http
      .get("/barbers")
      .then((res) => setBarbers(res.data || []))
      .catch(console.error);
    http
      .get("/services")
      .then((res) => setServices(res.data || []))
      .catch(console.error);
    http
      .get("/hairstyles")
      .then((res) => {
        const list = res.data || [];
        setHairstyles(list.length ? list : fallbackHairstyles);
      })
      .catch((err) => {
        console.error(err);
        setHairstyles(fallbackHairstyles);
      });
  }, [fallbackHairstyles]);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const priceBreakdown = useMemo(() => {
    const serviceBase = getServiceBasePrice(selectedService);
    const barberBase = getBarberBasePrice(selectedBarber);
    const skillPremium = getSkillPremium(selectedBarber, selectedService);
    return { serviceBase, barberBase, skillPremium };
  }, [selectedBarber, selectedService]);

  const estimatedTotal = useMemo(
    () => calculateBookingPrice(selectedBarber, selectedService),
    [selectedBarber, selectedService]
  );

  const hasSelection = !!(selectedBarber && selectedService);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBarber || !selectedService || !scheduledDate || !scheduledTime)
      return;

    setSubmitting(true);
    setErrorMsg("");
    setBookingResult(null);

    try {
      const scheduled_at = `${scheduledDate} ${scheduledTime}:00`;
      const payload = {
        barber_id: selectedBarber.id,
        service_id: selectedService.id,
        hairstyle_id: selectedHairstyle?.id || null,
        scheduled_at,
        coupon_code: couponCode || null,
        note,
      };

      const { data } = await http.post("/bookings", payload);
      setBookingResult(data);
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message ||
        "Gagal membuat booking. Pastikan waktu dalam jam buka (07:00–21:00).";
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Ambil booking yang sudah dibuat (normalize bentuk respons)
  const createdBooking = bookingResult?.booking ?? bookingResult;
  const createdBookingTotal = createdBooking
    ? Number(createdBooking.total_price ?? estimatedTotal ?? 0)
    : 0;

  const refreshBookingStatus = async (id) => {
    if (!id) return;
    try {
      const { data } = await http.get("/bookings/my");
      const found = Array.isArray(data)
        ? data.find((b) => b.id === id)
        : null;
      if (found) setBookingResult(found);
    } catch (err) {
      console.error("Gagal refresh status booking:", err);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen relative flex items-center justify-center px-4 py-8 sm:px-6 overflow-hidden bg-[#020202] selection:bg-[#bf953f] selection:text-black">
        {/* FONT & LUXURY CSS */}
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

          /* Custom Scrollbar for inner lists */
          .custom-scroll::-webkit-scrollbar { width: 4px; }
          .custom-scroll::-webkit-scrollbar-track { background: rgba(15, 23, 42, 0.5); }
          .custom-scroll::-webkit-scrollbar-thumb { background: rgba(51, 65, 85, 0.8); border-radius: 4px; }
          .custom-scroll::-webkit-scrollbar-thumb:hover { background: #bf953f; }
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

        {/* MAIN CARD CONTAINER */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full max-w-[1100px] min-h-[640px] flex flex-col lg:flex-row shadow-[0_20px_70px_-10px_rgba(0,0,0,0.9)]"
        >
          {/* glass container */}
          <div className="absolute inset-0 bg-[#0a0a0a]/85 backdrop-blur-xl rounded-sm border border-white/5" />
          {/* golden lines */}
          <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-[#bf953f] to-transparent opacity-55" />
          <div className="absolute bottom-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-[#bf953f] to-transparent opacity-55" />

          {/* === LEFT SIDE: BRANDING + 3D === */}
          <div className="relative z-10 w-full lg:w-[40%] flex flex-col border-b lg:border-b-0 lg:border-r border-white/5 bg-gradient-to-br from-black/45 via-black/30 to-transparent overflow-hidden">
            <div className="px-8 pt-8 pb-3 lg:px-12 lg:pt-10">
              <span className="font-tech text-[10px] tracking-[0.4em] uppercase text-[#bf953f]">
                Booking Plan
              </span>
              <h1 className="mt-3 font-vintage text-[2rem] md:text-[2.4rem] text-slate-100 tracking-[0.24em] leading-tight uppercase drop-shadow-[0_0_28px_rgba(15,23,42,1)] relative">
                {/* shiny sweep */}
                <span className="pointer-events-none absolute inset-x-[-40px] -top-2 h-10 bg-gradient-to-r from-transparent via-white/25 to-transparent blur-md opacity-60 animate-shimmer" />
                {/* glow ellipse */}
                <span className="pointer-events-none absolute inset-x-[-60px] top-1 h-10 bg-[radial-gradient(circle_at_center,#facc1550,transparent_65%)] blur-xl" />

                <span className="relative inline-flex flex-col gap-1">
                  <span className="inline-flex items-baseline gap-3">
                    <span className="bg-gradient-to-r from-slate-50 via-slate-200 to-slate-400 bg-clip-text text-transparent">
                      ROYAL
                    </span>
                    <span className="relative text-gold-gradient font-royal italic pr-1 drop-shadow-[0_0_20px_rgba(191,149,63,0.9)]">
                      Barber
                      <span className="pointer-events-none absolute -inset-x-1 -bottom-1 h-[2px] bg-gradient-to-r from-transparent via-[#facc15] to-transparent blur-[3px] opacity-90" />
                    </span>
                  </span>
                </span>
              </h1>

              <p className="relative mt-4 max-w-md pl-4 font-modern text-[11px] leading-relaxed text-slate-300">
                <span className="pointer-events-none absolute left-0 top-1 bottom-1 w-[1px] rounded-full bg-gradient-to-b from-[#bf953f] via-[#bf953f]/40 to-transparent" />
                <span className="mb-1 block font-tech text-[9px] tracking-[0.32em] uppercase text-[#bf953f]">
                  Queue & Schedule
                </span>
                <span className="block text-slate-300/90">
                  Kelola barber favorit, layanan, jadwal, dan kupon diskon
                  dalam satu layar.
                </span>
              </p>
            </div>

            <BookingHero3D />

            <div className="px-8 pb-7 pt-3 lg:px-12 font-tech text-[10px] text-slate-400 flex items-center gap-3 border-t border-white/5 bg-black/40">
              <span className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#bf953f] to-transparent opacity-60" />
              <span className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#bf953f] to-transparent opacity-60" />
            </div>
          </div>

          {/* === RIGHT SIDE: FORM + SUMMARY === */}
          <div className="relative z-10 w-full lg:w-[60%] flex flex-col p-6 sm:p-8 lg:p-10 bg-[#050505]/40 overflow-y-auto custom-scroll max-h-[90vh] lg:max-h-auto">
            {/* subtle aura */}
            <div className="pointer-events-none absolute -inset-6 rounded-[24px] bg-gradient-to-tr from-[#bf953f]/18 via-transparent to-sky-500/12 blur-xl opacity-80" />

            <div className="relative w-full">
              {/* HEADER + CLOCK */}
              <header className="mb-5 flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                  <div className="font-tech text-[10px] uppercase tracking-[0.32em] text-slate-500">
                    Booking Detail
                  </div>
                  <h2 className="mt-2 inline-flex flex-col gap-1 font-royal text-slate-100">
                    <span className="relative inline-flex items-baseline gap-2 text-[1.4rem] md:text-[1.7rem] leading-none">
                      <span className="bg-gradient-to-r from-slate-50 via-slate-200 to-slate-400 bg-clip-text text-transparent">
                        Order
                      </span>
                      <span className="relative text-gold-gradient drop-shadow-[0_0_18px_rgba(191,149,63,0.85)]">
                        Booking
                        <span className="pointer-events-none absolute -inset-x-1 -bottom-1 h-[2px] bg-gradient-to-r from-transparent via-[#facc15] to-transparent blur-[3px] opacity-90" />
                      </span>
                    </span>
                  </h2>
                </div>
              </header>

              <div className="mb-4">
                <AnnouncementBanner />
              </div>

              {/* CONTENT GRID */}
              <div className="grid grid-cols-1 xl:grid-cols-[1.45fr,1.05fr] gap-6 text-xs">
                {/* --- KOLOM FORM --- */}
                <motion.section
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="relative rounded-xl md:rounded-2xl border border-white/10 bg-[#080808]/85 backdrop-blur-xl p-4 md:p-5 space-y-4 shadow-[0_22px_70px_rgba(0,0,0,0.95)] overflow-hidden"
                >
                  {/* dekorasi glow ala gallery */}
                  <div className="pointer-events-none absolute -top-16 -left-10 w-[280px] h-[280px] bg-amber-600/10 blur-[90px] rounded-full" />
                  <div className="pointer-events-none absolute -bottom-24 right-0 w-[260px] h-[260px] bg-amber-400/10 blur-[100px] rounded-full" />
                  <div className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:60px_60px]" />

                  {/* header step seperti label di Gallery */}
                  <div className="flex justify-between items-center mb-2 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-full border border-amber-500/60 bg-black/70 flex items-center justify-center shadow-[0_0_16px_rgba(245,158,11,0.6)]">
                      </div>
                      <div className="flex flex-col">
                      <h2 className="font-vintage text-base md:text-lg leading-tight">
                        <span className="relative inline-flex flex-col gap-1">
                          <span className="inline-flex items-baseline gap-2">
                            <span className="bg-gradient-to-r from-slate-50 via-slate-200 to-slate-400 bg-clip-text text-transparent">
                              Pilih
                            </span>
                            <span className="text-gold-gradient drop-shadow-[0_0_18px_rgba(191,149,63,0.85)]">
                              Barber
                            </span>
                            <span className="bg-gradient-to-r from-slate-200 via-slate-50 to-slate-300 bg-clip-text text-transparent">
                              &amp; Layanan
                            </span>
                          </span>
                        </span>
                      </h2>
                      <span className="relative font-tech text-[10px] tracking-[0.34em] uppercase text-amber-100/80">
                        <span className="pointer-events-none absolute -inset-x-2 -top-1 h-5 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.22),transparent_70%)] blur-md" />
                        <span className="relative">
                          Booking Session
                        </span>
                      </span>
                      </div>
                       <div className="h-7 w-7 rounded-full border border-amber-500/60 bg-black/70 flex items-center justify-center shadow-[0_0_16px_rgba(245,158,11,0.6)]">
                      </div>
                    </div>
                  </div>

                  {/* BARBERS GRID */}
                  <div className="space-y-2 relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-[1px] w-6 bg-gradient-to-r from-amber-500 to-transparent" />
                        <div className="text-[10px] font-tech text-amber-500 tracking-[0.35em] uppercase">
                          Barber
                        </div>
                      </div>
                      <span className="text-[10px] font-modern text-slate-500 italic">
                        Pilih barber favorit Anda
                      </span>
                    </div>

                    <div className="relative rounded-xl border border-white/10 bg-black/40 backdrop-blur-lg p-3 space-y-2">
                      {/* corner bracket ala Gallery */}
                      <div className="absolute -top-[1px] left-0 w-6 h-6 border-t border-l border-amber-500/40" />
                      <div className="absolute -bottom-[1px] right-0 w-6 h-6 border-b border-r border-amber-500/40" />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto custom-scroll pr-1">
                        {barbers.map((b) => (
                          <div
                            key={b.id}
                            className={
                              selectedBarber?.id === b.id
                                ? "relative rounded-xl border border-amber-400/70 bg-gradient-to-br from-amber-500/15 via-black/80 to-emerald-500/10 shadow-[0_0_25px_rgba(245,158,11,0.45)] transition-all duration-300 scale-[1.01]"
                                : "relative rounded-xl border border-white/5 bg-slate-900/70 hover:border-amber-400/50 hover:-translate-y-[1px] hover:shadow-[0_10px_25px_rgba(0,0,0,0.7)] opacity-90 hover:opacity-100 transition-all duration-200"
                            }
                          >
                            {selectedBarber?.id === b.id && (
                              <div className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-[2px] border border-amber-400/70">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.9)]" />
                                <span className="font-tech text-[9px] tracking-[0.2em] text-amber-50 uppercase">
                                  Selected
                                </span>
                              </div>
                            )}
                            <BarberCard barber={b} onSelect={setSelectedBarber} />
                          </div>
                        ))}
                        {!barbers.length && (
                          <div className="text-slate-500 text-[11px] font-modern italic col-span-full text-center py-4">
                            Belum ada barber tersedia.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* SERVICES LIST */}
                  <div className="space-y-2 relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-[1px] w-6 bg-gradient-to-r from-amber-500 to-transparent" />
                        <div className="text-[10px] font-tech text-amber-500 tracking-[0.35em] uppercase">
                          Layanan
                        </div>
                      </div>
                      <span className="text-[10px] font-modern text-slate-500 italic">
                        Haircut, shave, styling, dan lainnya
                      </span>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/45 backdrop-blur-lg p-3 max-h-60 overflow-y-auto custom-scroll pr-1 space-y-2">
                      {services.map((s) => (
                        <ServiceCard
                          key={s.id}
                          service={s}
                          selected={selectedService?.id === s.id}
                          onSelect={setSelectedService}
                        />
                      ))}
                      {!services.length && (
                        <div className="text-slate-500 text-[11px] font-modern italic text-center py-4">
                          Belum ada layanan tersedia.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* HAIRSTYLE LIST */}
                  <div className="space-y-2 relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-[1px] w-6 bg-gradient-to-r from-amber-500 to-transparent" />
                        <div className="text-[10px] font-tech text-amber-500 tracking-[0.35em] uppercase">
                          Hairstyle
                        </div>
                      </div>
                      <span className="text-[10px] font-modern text-slate-500 italic">
                        Opsional: pilih referensi gaya rambut
                      </span>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/45 backdrop-blur-lg p-3 max-h-60 overflow-y-auto custom-scroll pr-1">
                      {hairstyles.length ? (
                        <HairstyleGallery
                          hairstyles={hairstyles}
                          onSelect={setSelectedHairstyle}
                          selectedId={selectedHairstyle?.id}
                        />
                      ) : (
                        <div className="text-slate-500 text-[11px] font-modern italic text-center py-4">
                          Belum ada referensi hairstyle.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* DATE & TIME & COUPON */}
                  <div className="pt-3 border-t border-white/10 space-y-3 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="flex items-center gap-2 text-[10px] font-tech text-slate-400 uppercase tracking-[0.3em]">
                          <span className="h-[1px] w-5 bg-gradient-to-r from-amber-500 to-transparent" />
                          Kupon
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={30}                         // 🔒 maksimal 30 karakter
                          placeholder="Kode promo (opsional)"
                          className="mt-1 w-full rounded-lg bg-[#050816] px-3 py-2.5 text-[11px] text-slate-100 border border-white/10 shadow-inner shadow-black/60 focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/80 outline-none font-modern placeholder:text-slate-600 transition-all"
                          value={couponCode}
                          onChange={(e) => {
                            // 🔒 hanya angka 0–9 + hard limit 30 karakter
                            const numeric = e.target.value.replace(/[^0-9]/g, "");
                            setCouponCode(numeric.slice(0, 30));
                          }}
                        />
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-[10px] font-tech text-slate-400 uppercase tracking-[0.3em]">
                          <span className="h-[1px] w-5 bg-gradient-to-r from-amber-500 to-transparent" />
                          Catatan
                        </label>
                        <textarea
                          rows={1}
                          maxLength={255}                        // 🔒 maksimal 255 karakter
                          className="mt-1 w-full rounded-lg bg-[#050816] px-3 py-2.5 text-[11px] text-slate-100 border border-white/10 shadow-inner shadow-black/60 focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/80 outline-none font-modern placeholder:text-slate-600 transition-all resize-none"
                          value={note}
                          onChange={(e) => setNote(e.target.value.slice(0, 255))}
                          placeholder="Contoh: Fade tipis, jangan terlalu pendek..."
                        />
                      </div>
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="mt-2 rounded-lg border border-red-500/40 bg-red-900/20 px-3 py-2 text-[10px] text-red-200 font-tech tracking-[0.2em] uppercase flex items-center gap-2 relative z-10">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.9)]" />
                      ⚠️ {errorMsg}
                    </div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
                    type="submit"
                    onClick={handleSubmit}
                    disabled={
                      submitting ||
                      !selectedBarber ||
                      !selectedService ||
                      !scheduledDate ||
                      !scheduledTime
                    }
                    className="mt-1 w-full rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 px-4 py-3 text-[11px] font-bold text-slate-950 shadow-[0_0_26px_rgba(245,158,11,0.7)] hover:shadow-[0_0_40px_rgba(245,158,11,0.95)] disabled:opacity-50 disabled:grayscale font-tech tracking-[0.28em] uppercase transition-all"
                  >
                    {submitting ? "Memproses..." : "Konfirmasi Booking"}
                  </motion.button>
                </motion.section>

                {/* --- KOLOM SUMMARY --- */}
                <motion.section
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                  className="relative h-fit rounded-xl md:rounded-2xl border border-white/10 bg-[#080808]/90 backdrop-blur-xl p-4 md:p-5 space-y-4 shadow-[0_22px_70px_rgba(0,0,0,0.95)] overflow-hidden"
                >
                  {/* glow & grain ala Gallery */}
                  <div className="pointer-events-none absolute -top-16 right-[-10%] w-[260px] h-[260px] bg-amber-600/15 blur-[90px] rounded-full" />
                  <div className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
                  <div className="pointer-events-none absolute inset-0 opacity-[0.05] bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:60px_60px]" />

                  <h2 className="font-modern text-sm text-slate-100 flex items-center gap-3 relative z-10">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black/60 border border-amber-500/70 shadow-[0_0_18px_rgba(245,158,11,0.8)]">
                      <span className="h-[2px] w-3 rounded-full bg-gradient-to-r from-amber-300 via-amber-500 to-amber-300" />
                    </span>
                    <span className="font-vintage text-base tracking-wide">
                      Ringkasan Booking
                    </span>
                  </h2>

                  <div className="relative rounded-xl bg-black/50 border border-white/10 p-4 text-xs space-y-3 font-modern shadow-[0_16px_45px_rgba(0,0,0,0.9)] z-10">
                    {/* corner bracket vibe */}
                    <div className="absolute top-0 left-0 w-7 h-7 border-t border-l border-amber-500/40" />
                    <div className="absolute bottom-0 right-0 w-7 h-7 border-b border-r border-amber-500/40" />

                    <div className="flex justify-between items-center border-b border-white/10 pb-2">
                      <span className="text-[11px] text-slate-400">Barber</span>
                      <span className="text-[11px] text-slate-100 font-medium text-right">
                        {selectedBarber
                          ? selectedBarber.display_name || selectedBarber.user?.name
                          : "-"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/10 pb-2">
                      <span className="text-[11px] text-slate-400">Layanan</span>
                      <span className="text-[11px] text-slate-100 font-medium text-right">
                        {selectedService ? selectedService.name : "-"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/10 pb-2">
                      <span className="text-[11px] text-slate-400">Hairstyle</span>
                      <span className="text-[11px] text-slate-100 font-medium text-right">
                        {selectedHairstyle ? selectedHairstyle.name : "Opsional"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/10 pb-2">
                      <span className="text-[11px] text-slate-400">Tanggal</span>
                      <div className="text-right">
                        <div className="text-[11px] text-slate-100">
                          {scheduledDate || "-"}
                        </div>
                        {scheduledTime && (
                          <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-[1px] text-[10px] text-amber-200 border border-amber-500/50">
                            <span className="h-1 w-1 rounded-full bg-amber-400" />
                            {scheduledTime}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 border-b border-white/10 pb-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] text-slate-400">Harga Barber</span>
                        <span className="text-[11px] text-slate-100 font-semibold">
                          {selectedBarber
                            ? `Rp ${priceBreakdown.barberBase.toLocaleString("id-ID")}`
                            : "-"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] text-slate-400">Harga Service</span>
                        <span className="text-[11px] text-slate-100 font-semibold">
                          {selectedService
                            ? `Rp ${priceBreakdown.serviceBase.toLocaleString("id-ID")}`
                            : "-"}
                        </span>
                      </div>
                      <div className="col-span-2 flex justify-between items-center">
                        <span className="text-[11px] text-slate-400">Premium skill</span>
                        <span className="text-[11px] text-slate-100 font-semibold">
                          {hasSelection
                            ? `+ Rp ${priceBreakdown.skillPremium.toLocaleString("id-ID")}`
                            : "-"}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-[11px] text-slate-200 font-semibold">
                        Total Estimasi
                      </span>
                      <span className="text-emerald-400 font-bold text-sm tracking-wide">
                        {hasSelection && estimatedTotal
                          ? `Rp ${estimatedTotal.toLocaleString("id-ID")}`
                          : "-"}
                      </span>
                    </div>
                  </div>

                  {createdBooking && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative rounded-xl border border-emerald-500/35 bg-gradient-to-br from-emerald-500/20 via-black/85 to-emerald-500/10 p-4 text-xs space-y-2 font-modern overflow-hidden shadow-[0_18px_55px_rgba(16,185,129,0.5)] z-10"
                    >
                      <div className="pointer-events-none absolute -top-12 right-0 w-28 h-28 bg-emerald-400/40 blur-3xl" />
                      <div className="flex justify-between items-center relative z-10">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 flex items-center justify-center rounded-full bg-black/70 border border-emerald-400/80">
                            <span className="h-[2px] w-3 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.9)]" />
                          </div>
                          <div className="font-tech text-[10px] uppercase tracking-[0.28em] text-emerald-200">
                            Booking Sukses
                          </div>
                        </div>
                        <div className="text-[10px] text-emerald-50 font-tech tracking-[0.22em] uppercase border border-emerald-500/40 px-2 py-0.5 rounded-full bg-black/40">
                          #{createdBooking.queue_number}
                        </div>
                      </div>
                      <div className="text-slate-200 relative z-10 text-[11px]">
                        Status:{" "}
                        <span className="uppercase text-white font-semibold">
                          {createdBooking.status}
                        </span>
                      </div>
                      <div className="text-slate-200 relative z-10 text-[11px]">
                        Total:{" "}
                        <span className="text-emerald-200 font-semibold">
                          Rp {createdBookingTotal.toLocaleString("id-ID")}
                        </span>
                      </div>
                      {createdBooking?.hairstyle && (
                        <div className="text-slate-200 relative z-10 text-[11px]">
                          Hairstyle:{" "}
                          <span className="text-emerald-100 font-semibold">
                            {createdBooking.hairstyle.name}
                          </span>
                        </div>
                      )}
                      <div className="mt-3 relative z-10">
                        <PaymentButton
                          booking={createdBooking}
                          onFinish={() => refreshBookingStatus(createdBooking.id)}
                        />
                      </div>
                    </motion.div>
                  )}

                  {!bookingResult && (
                    <p className="text-[10px] text-slate-500 font-modern text-center leading-relaxed px-2 relative z-10">
                      Info pembayaran Midtrans (QRIS/VA) akan muncul otomatis setelah tombol{" "}
                      <span className="font-semibold text-amber-300">Konfirmasi Booking</span>{" "}
                      ditekan. Jangan tutup halaman sebelum instruksi muncul.
                    </p>
                  )}
                </motion.section>
              </div>

            </div>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
}
