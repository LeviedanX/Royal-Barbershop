// src/pages/DashboardCustomer.jsx
import React, { useEffect, useMemo, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { Canvas, useFrame } from "@react-three/fiber";
import { motion } from "framer-motion";
import * as THREE from "three";

import MainLayout from "../components/Layout/MainLayout";
import { http } from "../api/http";
import { useAuth } from "../hooks/useAuth";
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

// === VISUAL ATMOSPHERE (MATCH DASHBOARD ADMIN) =============================

// 1. Slow Rising Gold Dust
const FloatingParticles = () => {
  const particles = Array.from({ length: 32 });
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
            scale: 0.4,
          }}
          animate={{
            y: [null, Math.random() * -90],
            opacity: [0, 0.45, 0],
            scale: [0.4, 1, 0.4],
          }}
          transition={{
            duration: Math.random() * 18 + 14,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 6,
          }}
          className="absolute rounded-full blur-[1.5px]"
          style={{
            width: Math.random() * 3 + 1 + "px",
            height: Math.random() * 3 + 1 + "px",
            background:
              "radial-gradient(circle at 30% 0%, rgba(252,246,189,0.95), rgba(191,149,63,0.4))",
            boxShadow: "0 0 14px rgba(191, 149, 63, 0.55)",
          }}
        />
      ))}
    </div>
  );
};

// 2. Scanner Beam
const ScannerBeam = () => (
  <motion.div
    initial={{ top: "-15%" }}
    animate={{ top: "115%" }}
    transition={{
      duration: 16,
      repeat: Infinity,
      ease: "linear",
      repeatDelay: 2,
    }}
    className="absolute left-[6%] right-[6%] h-[200px] bg-gradient-to-b from-transparent via-amber-500/12 to-transparent pointer-events-none z-0 mix-blend-screen"
  />
);

// 3. Ambient Glow
const AmbientGlow = () => (
  <motion.div
    animate={{ opacity: [0.22, 0.58, 0.22], scale: [1, 1.08, 1] }}
    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
    className="absolute top-[-18%] left-[-10%] w-[75vw] h-[75vw] bg-[#bf953f] rounded-full blur-[230px] opacity-25 pointer-events-none z-0 mix-blend-screen"
  />
);

// 4. CRT Scanline Overlay
const ScanlineOverlay = () => (
  <div className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-soft-light bg-[repeating-linear-gradient(to_bottom,rgba(255,255,255,0.16)_0px,rgba(255,255,255,0.16)_1px,transparent_1px,transparent_3px)]" />
);

// === 3D BARBERSHOP POLE ====================================================

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

    if (poleRef.current.material.map) {
      poleRef.current.material.map.offset.y -= delta * 0.25;
    }

    if (glassRef.current.material) {
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

// Versi header di dashboard customer
const DashboardPoleHeader = () => (
  <div className="relative h-24 w-44 sm:h-24 sm:w-48 md:h-28 md:w-52 overflow-hidden rounded-2xl border border-[#f5e6c3]/15 bg-[#020617]">
    <Canvas camera={{ position: [0.15, 0.25, 4.8], fov: 45 }}>
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
        color="#f97316"
      />
      <LuxuryPole3D />
    </Canvas>
    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent" />
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0,#fbbf2433,transparent_55%)] mix-blend-screen" />
  </div>
);

// === MAIN PAGE =============================================================

export default function DashboardCustomer() {
  const { user } = useAuth();
  const [barbers, setBarbers] = useState([]);
  const [services, setServices] = useState([]);
  const [hairstyles, setHairstyles] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [selectedBarber, setSelectedBarber] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedHairstyle, setSelectedHairstyle] = useState(null);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [note, setNote] = useState("");

  const [loadingBooking, setLoadingBooking] = useState(false);
  const [lastBooking, setLastBooking] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [viewBooking, setViewBooking] = useState(null);
  const [editDraft, setEditDraft] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);
  const [modalError, setModalError] = useState("");
  const portalTarget =
    typeof document !== "undefined" && document.body ? document.body : null;

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

  // --- Fetch awal ---
  useEffect(() => {
    http
      .get("/barbers")
      .then((res) => setBarbers(res.data))
      .catch(console.error);

    http
      .get("/services")
      .then((res) => setServices(res.data))
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

    reloadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

// --- Booking history polling ---
  useEffect(() => {
    const interval = setInterval(() => {
      reloadBookings();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const reloadBookings = async (bookingId) => {
    try {
      const { data } = await http.get("/bookings/my");
      setBookings(data);

      if (bookingId && Array.isArray(data)) {
        const found = data.find((b) => b.id === bookingId);
        if (found) setLastBooking(found);
      }
    } catch (err) {
      console.error(err);
    }
  };

// --- Loyalty & barber recommendations ---
  const completedCount = useMemo(
    () => bookings.filter((b) => b.status === "done").length,
    [bookings]
  );

  const loyaltyProgress = Math.min((completedCount / 7) * 100, 100);
  const hasLoyaltyCoupon = completedCount >= 7;

  const recommendedBarber = useMemo(() => {
    const counter = {};
    bookings.forEach((b) => {
      if (!b.barber) return;
      const id = b.barber.id;
      counter[id] = (counter[id] || 0) + 1;
    });

    let bestId = null;
    let max = 0;
    Object.entries(counter).forEach(([id, count]) => {
      if (count > max) {
        max = count;
        bestId = parseInt(id, 10);
      }
    });

    return barbers.find((b) => b.id === bestId) || null;
  }, [bookings, barbers]);

  const today = new Date().toISOString().slice(0, 10);

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

  const splitScheduledAt = (value) => {
    const raw =
      typeof value === "string"
        ? value
        : value instanceof Date
        ? value.toISOString()
        : "";
    if (!raw) return { date: "", time: "" };
    const normalized = raw.replace(" ", "T");
    const [datePart, timePartRaw] = normalized.split("T");
    return {
      date: datePart || "",
      time: (timePartRaw || "").slice(0, 5),
    };
  };

  const scrollToCreateForm = () => {
    const form = document.getElementById("bookingForm");
    if (form) {
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const openViewBooking = (booking) => {
    setModalError("");
    setEditDraft(null);
    setDeleteTarget(null);
    setViewBooking(booking);
  };

  const openEditBooking = (booking) => {
    const { date, time } = splitScheduledAt(booking.scheduled_at);
    setModalError("");
    setViewBooking(null);
    setDeleteTarget(null);
    setEditDraft({
      id: booking.id,
      barberId: booking.barber.id || booking.barber_id,
      serviceId: booking.service.id || booking.service_id,
      hairstyleId: booking.hairstyle.id || booking.hairstyle_id || "",
      date,
      time,
      couponCode: "",
    });
  };

  const openDeleteConfirm = (booking) => {
    setModalError("");
    setViewBooking(null);
    setEditDraft(null);
    setDeleteTarget(booking);
  };

  const handleUpdateBooking = async () => {
    if (!editDraft) return;
    if (!editDraft.barberId || !editDraft.serviceId || !editDraft.date || !editDraft.time) {
      setModalError("Fill barber, service, date, and time first.");
      return;
    }

    setSavingEdit(true);
    setModalError("");

    try {
      const scheduled_at = `${editDraft.date} ${editDraft.time}:00`;
      await http.put(`/bookings/${editDraft.id}`, {
        barber_id: editDraft.barberId,
        service_id: editDraft.serviceId,
        hairstyle_id: editDraft.hairstyleId || null,
        scheduled_at,
        coupon_code: editDraft.couponCode || null,
      });
      setEditDraft(null);
      await reloadBookings(editDraft.id);
    } catch (err) {
      const msg = err.response.data.message || "Failed to update booking.";
      setModalError(msg);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteBooking = async () => {
    if (!deleteTarget) return;
    setDeleteLoadingId(deleteTarget.id);
    setModalError("");

    try {
      await http.delete(`/bookings/${deleteTarget.id}`);
      setDeleteTarget(null);
      await reloadBookings();
    } catch (err) {
      const msg = err.response.data.message || "Failed to cancel booking.";
      setModalError(msg);
    } finally {
      setDeleteLoadingId(null);
    }
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    if (!selectedBarber || !selectedService || !scheduledDate || !scheduledTime)
      return;

    setLoadingBooking(true);
    setErrorMsg("");

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
      setLastBooking(data || null);
      await reloadBookings(data.id);
    } catch (err) {
      console.error(err);
      const msg =
        err.response.data.message ||
        "Failed to create a booking. Ensure the time is within operating hours (07:00-21:00).";
      setErrorMsg(msg);
    } finally {
      setLoadingBooking(false);
    }
  };

  const activeBooking = useMemo(() => {
    const activeStatuses = ["waiting", "in_progress", "ongoing"];
    const preferredPayment = ["unpaid", "pending"];

    return (
      bookings.find(
        (b) =>
          activeStatuses.includes(b.status) &&
          preferredPayment.includes(b.payment_status || "unpaid")
      ) || bookings.find((b) => activeStatuses.includes(b.status))
    );
  }, [bookings]);

  // === RENDER ==============================================================
  return (
    <MainLayout>
      <div className="relative min-h-screen bg-[#181411] text-amber-50 flex flex-col overflow-hidden pt-16 font-modern">
        {/* CSS INJECTION */}
        <style>{`
          @import url('https://fonts.googleapis.com/css2family=Cinzel:wght@400;700&family=Italiana&family=Manrope:wght@300;400;600;800&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap');

          .font-royal { 
            font-family: 'Cinzel', serif; 
            letter-spacing: 0.22em;
          }
          .font-vintage { 
            font-family: 'Italiana', serif; 
            letter-spacing: 0.28em;
          }
          .font-tech { 
            font-family: 'Space Mono', monospace; 
            text-transform: uppercase;
            letter-spacing: 0.24em;
          }
          .font-modern { 
            font-family: 'Manrope', sans-serif; 
          }

          .text-soft-gold { color: #f5e6c8; }
          .text-glow-gold {
            color: #fef3c7;
            text-shadow:
              0 0 6px rgba(252,211,77,0.45),
              0 0 18px rgba(180,83,9,0.85);
          }

          .text-gold-gradient {
            background: linear-gradient(to right, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            background-size: 200% auto;
            animation: shine 5s linear infinite;
          }
          @keyframes shine { to { background-position: 200% center; } }

          .custom-scroll::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }
          .custom-scroll::-webkit-scrollbar-track {
            background: rgba(15,15,10,0.7);
          }
          .custom-scroll::-webkit-scrollbar-thumb {
            background: rgba(191,149,63,0.5);
            border-radius: 999px;
          }
          .custom-scroll::-webkit-scrollbar-thumb:hover {
            background: rgba(191,149,63,0.85);
          }

          .header-glow { position: relative; overflow: hidden; }
          .header-glow::before {
            content: "";
            position: absolute;
            inset: -40%;
            background: radial-gradient(circle at 0% 0%, rgba(191,149,63,0.45), transparent 55%);
            opacity: 0.7;
            mix-blend-mode: soft-light;
            pointer-events: none;
            animation: headerGlowSweep 14s linear infinite;
          }
          @keyframes headerGlowSweep {
            0% { transform: translateX(-15%) translateY(0); opacity: 0.3; }
            50% { transform: translateX(10%) translateY(10%); opacity: 0.7; }
            100% { transform: translateX(-15%) translateY(0); opacity: 0.3; }
          }

          .frame-vignette { position: relative; }
          .frame-vignette::before {
            content: "";
            position: absolute;
            inset: 0;
            border-radius: 28px;
            border: 1px solid rgba(191,149,63,0.18);
            box-shadow:
              0 0 0 1px rgba(0,0,0,0.5) inset,
              0 0 45px rgba(0,0,0,0.85) inset;
            pointer-events: none;
            z-index: 0;
          }

          .card-lux {
            position: relative;
            transform-style: preserve-3d;
            overflow: hidden;
            transition:
              transform 0.25s ease,
              box-shadow 0.25s ease,
              border-color 0.25s ease,
              background 0.25s ease;
          }
          .card-lux:hover {
            transform: translateY(-2px);
            box-shadow: 0 20px 55px rgba(0,0,0,0.98);
            border-color: rgba(251,191,36,0.75);
          }
          .card-lux::before {
            content: "";
            position: absolute;
            inset: -1px;
            border-radius: inherit;
            background:
              radial-gradient(circle at 0% 0%, rgba(251,191,36,0.16), transparent 55%),
              radial-gradient(circle at 100% 100%, rgba(244,244,245,0.10), transparent 55%);
            opacity: 0.75;
            mix-blend-mode: soft-light;
            pointer-events: none;
          }
          .card-lux::after {
            content: "";
            position: absolute;
            inset-inline: -12%;
            top: -120%;
            height: 240%;
            background: linear-gradient(
              120deg,
              transparent 0%,
              rgba(252,246,189,0.12) 40%,
              rgba(252,246,189,0.45) 50%,
              rgba(252,246,189,0.12) 60%,
              transparent 100%
            );
            opacity: 0;
            transform: translate3d(-30%, 0, 0) rotate(8deg);
            pointer-events: none;
          }
          .card-lux:hover::after {
            opacity: 1;
            animation: cardSheen 1.6s ease-out forwards;
          }
          @keyframes cardSheen {
            0% { transform: translate3d(-40%, 0, 0) rotate(8deg); opacity: 0; }
            40% { opacity: 1; }
            100% { transform: translate3d(40%, 0, 0) rotate(8deg); opacity: 0; }
          }

          @media (max-width: 768px) {
            .font-vintage { letter-spacing: 0.18em; }
          }
        `}</style>

        {/* BACKGROUND LAYER */}
        <div className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#1b130f] via-[#0f0906] to-black" />
          <div className="absolute bottom-[-25%] right-[-15%] w-[520px] h-[520px] bg-amber-900/25 blur-[160px] rounded-full" />
          <FloatingParticles />
          <ScannerBeam />
          <AmbientGlow />
          <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:70px_70px] opacity-10" />
          <ScanlineOverlay />
        </div>

        {/* HEADER TOP */}
        <header className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 py-4 border-b border-amber-900/60 bg-black/70 backdrop-blur-2xl shadow-[0_18px_40px_rgba(0,0,0,0.9)] header-glow">
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="hidden sm:block rounded-[10px] border border-amber-500/50 bg-[#050509]/95 overflow-hidden shadow-[0_0_38px_rgba(251,191,36,0.4)]">
              <DashboardPoleHeader />
            </div>
            <div className="flex flex-col gap-2">
              <div>
                <div className="flex flex-wrap items-baseline gap-2 md:gap-3">
                  <span className="font-vintage text-2xl md:text-3xl tracking-[0.4em] text-gold-gradient text-glow-gold">
                    DASHBOARD CUSTOMER
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {user && (
                  <span className="text-[11px] text-amber-100/80 font-modern">
                    Halo,{" "}
                    <span className="text-soft-gold font-semibold">
                      {user.name}!
                    </span>
                  </span>
                )}
              </div>
              <div className="text-[11px] text-amber-100/75 font-modern max-w-xl">
                Book your slot, choose your favorite barber, and track your loyalty progress here.
              </div>
            </div>
          </motion.div>

          <motion.div
            className="flex flex-col items-end gap-2 text-right text-[11px] font-modern text-amber-100/80"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {/* TOMBOL KE BOOKINGPAGE.JSX */}
            <Link
              to="/booking"
              className="inline-flex items-center gap-1 rounded-full border border-amber-400/70 bg-amber-400/10 px-3 py-1 font-tech tracking-[0.2em] text-[9px] uppercase hover:bg-amber-400/20 hover:border-amber-300 transition-colors"
            >
              <span className="w-1 h-1 rounded-full bg-amber-300" />
              <span>OPEN BOOKING PAGE</span>
            </Link>
          </motion.div>
        </header>

        {/* MAIN CONTENT */}
        <main className="relative z-10 flex-1 p-4 md:p-6 overflow-y-auto custom-scroll frame-vignette rounded-[28px] mt-3">
          <div className="max-w-6xl mx-auto relative z-10 space-y-4">
            {/* Announcement */}
            <AnnouncementBanner />

            {/* Top stats row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              {/* Loyalty */}
              <motion.div
                className="relative rounded-xl border border-amber-500/40 bg-gradient-to-br from-[#1b130f]/95 via-[#130d0a]/95 to-black/90 p-3 shadow-[0_18px_40px_rgba(0,0,0,0.9)] overflow-hidden card-lux"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="pointer-events-none absolute -inset-10 bg-amber-500/10 blur-3xl opacity-40" />
                <div className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-[10px] font-tech tracking-[0.25em] text-amber-300/90">
                      LOYALTY PROGRESS
                    </div>
                    <span className="h-[1px] w-10 bg-gradient-to-r from-amber-500 to-transparent" />
                  </div>
                  <div className="font-semibold text-sm text-soft-gold">
                    {completedCount} / 7 visits
                  </div>
                  <div className="mt-2 w-full h-1.5 rounded-full bg-black/60 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 via-amber-200 to-emerald-400 shadow-[0_0_12px_rgba(251,191,36,0.9)]"
                      style={{ width: `${loyaltyProgress}%` }}
                    />
                  </div>
                  <div className="mt-1.5 text-[11px] text-amber-100/75 font-modern">
                    {hasLoyaltyCoupon ? (
                      <span className="text-emerald-300">
                        You qualify for a loyalty coupon! Check during payment.
                      </span>
                    ) : (
                      <>
                        Only{" "}
                        <span className="text-soft-gold font-semibold">
                          {Math.max(0, 7 - completedCount)}
                        </span>{" "}
                        more visits until your special coupon.
                      </>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Recommended barber */}
              <motion.div
                className="relative rounded-xl border border-amber-500/35 bg-gradient-to-br from-[#18110c] via-[#120c08] to-[#090605] p-3 shadow-[0_18px_40px_rgba(0,0,0,0.9)] overflow-hidden card-lux"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
              >
                <div className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-[10px] font-tech tracking-[0.25em] text-amber-200/80">
                      BARBER REKOMENDASI
                    </div>
                    <div className="flex gap-[3px]">
                      <span className="w-1 h-1 rounded-full bg-emerald-400/80" />
                      <span className="w-1 h-1 rounded-full bg-amber-400/70" />
                    </div>
                  </div>
                  <div className="font-modern text-soft-gold text-sm font-semibold">
                    {recommendedBarber
                      ? recommendedBarber.display_name || recommendedBarber.user?.name
                      : "No favorites yet"}
                  </div>
                  <div className="mt-1 text-[11px] text-amber-100/75">
                    {recommendedBarber
                      ? "Based on booking history."
                      : "Complete a few bookings to get a recommended barber."}
                  </div>
                </div>
              </motion.div>

              {/* Active booking status ringkas */}
              <motion.div
                className="relative rounded-xl border border-amber-500/40 bg-gradient-to-br from-[#18110c] via-[#130d0a] to-black p-3 shadow-[0_18px_40px_rgba(0,0,0,0.9)] overflow-hidden card-lux"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-[10px] font-tech tracking-[0.25em] text-amber-300/90">
                      QUEUE STATUS
                    </div>
                  </div>
                <div
                  className={`font-semibold text-sm ${
                    activeBooking ? "text-emerald-300" : "text-amber-200"
                  }`}
                >
                    {activeBooking
                      ? `#${activeBooking.queue_number || "-"}  ${activeBooking.status}`
                      : "No active booking"}
                </div>
                <div className="mt-1 text-[11px] text-amber-100/75">
                    {activeBooking
                      ? "Please arrive according to the schedule. Show your booking code at the counter."
                      : "Create a new booking from the panel below."}
                </div>
                </div>
              </motion.div>
            </div>

            {/* GRID: kiri booking, kanan status & history */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.3fr,0.9fr] gap-4 text-xs">
              {/* LEFT: Booking panel */}
              <section className="space-y-4">
                <motion.div
                  className="relative rounded-2xl border border-amber-900/60 bg-[#16100c]/95 backdrop-blur-xl p-4 sm:p-5 shadow-[0_24px_60px_rgba(0,0,0,0.95)] overflow-hidden card-lux"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-amber-500/50" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-amber-500/40" />
                  <div className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

                  <div className="relative z-10 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="font-vintage text-lg sm:text-xl text-gold-gradient text-glow-gold">
                          BOOKING PANEL
                        </div>
                        <p className="text-[11px] text-amber-100/70 font-modern max-w-md">
                          Choose a barber, service, and time.
                        </p>
                      </div>
                    </div>

                    {/* error message */}
                    {errorMsg && (
                      <div className="rounded-lg border border-red-500/70 bg-red-500/10 px-3 py-2 text-[11px] text-red-200 font-modern">
                        {errorMsg}
                      </div>
                    )}

                    <form
                      id="bookingForm"
                      onSubmit={handleSubmitBooking}
                      className="space-y-4 text-[11px]"
                    >
                      {/* Barber selection */}
                      <div className="space-y-1.5">
                        <label className="text-amber-100/85 font-tech">
                          Choose a barber
                        </label>
                        <div className="flex gap-2 overflow-x-auto custom-scroll pb-1">
                          {barbers.map((b) => (
                            <div
                              key={b.id}
                              onClick={() => setSelectedBarber(b)}
                              className={`min-w-[180px] max-w-[220px] rounded-xl border px-3 py-2 text-left bg-[#0b0705]/90 hover:border-amber-400/80 transition-colors cursor-pointer ${
                                selectedBarber?.id === b.id
                                  ? "border-amber-400 bg-amber-500/10 shadow-[0_0_18px_rgba(251,191,36,0.4)]"
                                  : "border-amber-900/70"
                              }`}
                            >
                              <BarberCard
                                barber={b}
                                selected={selectedBarber?.id === b.id}
                              />
                            </div>
                          ))}
                          {!barbers.length && (
                            <div className="text-amber-100/70">
                              No barbers available.
                            </div>
                          )}
                        </div>
                        {/* fallback select */}
                        <select
                          className="mt-1 w-full rounded-lg bg-[#0b0705]/90 px-3 py-1.5 border border-amber-900/70 text-xs text-soft-gold focus:border-amber-400 outline-none"
                          value={selectedBarber?.id || ""}
                          onChange={(e) => {
                            const id = Number(e.target.value || 0);
                            const found =
                              barbers.find((bb) => bb.id === id) || null;
                            setSelectedBarber(found);
                          }}
                        >
                          <option value=""> choose a barber </option>
                          {barbers.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.display_name || b.user?.name} (ID: {b.id})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Service selection */}
                      <div className="space-y-1.5">
                        <label className="text-amber-100/85 font-tech">
                          Choose a service
                        </label>
                        <div className="flex gap-2 overflow-x-auto custom-scroll pb-1">
                          {services.map((s) => (
                            <div
                              key={s.id}
                              onClick={() => setSelectedService(s)}
                              className={`min-w-[200px] max-w-[240px] rounded-xl border px-3 py-2 text-left bg-[#0b0705]/90 hover:border-amber-400/80 transition-colors cursor-pointer ${
                                selectedService?.id === s.id
                                  ? "border-amber-400 bg-amber-500/10 shadow-[0_0_18px_rgba(251,191,36,0.4)]"
                                  : "border-amber-900/70"
                              }`}
                            >
                              <ServiceCard
                                service={s}
                                selected={selectedService?.id === s.id}
                              />
                            </div>
                          ))}
                          {!services.length && (
                            <div className="text-amber-100/70">
                              No services available.
                            </div>
                          )}
                        </div>
                        {/* fallback select */}
                        <select
                          className="mt-1 w-full rounded-lg bg-[#0b0705]/90 px-3 py-1.5 border border-amber-900/70 text-xs text-soft-gold focus:border-amber-400 outline-none"
                          value={selectedService?.id || ""}
                          onChange={(e) => {
                            const id = Number(e.target.value || 0);
                            const found =
                              services.find((ss) => ss.id === id) || null;
                            setSelectedService(found);
                          }}
                        >
                          <option value=""> choose a service </option>
                          {services.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name} (ID: {s.id})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Hairstyle selection */}
                      <div className="space-y-1.5">
                        <label className="text-amber-100/85 font-tech">
                          CHOOSE A HAIRSTYLE (Optional)
                        </label>
                        <div className="rounded-xl border border-amber-900/70 bg-[#0b0705]/70 p-2 max-h-60 overflow-y-auto custom-scroll">
                          {hairstyles.length ? (
                            <HairstyleGallery
                              hairstyles={hairstyles}
                              onSelect={setSelectedHairstyle}
                              selectedId={selectedHairstyle?.id}
                            />
                          ) : (
                            <div className="text-amber-100/70">
                              No hairstyles available.
                            </div>
                          )}
                        </div>
                        {/* fallback select */}
                        <select
                          className="mt-1 w-full rounded-lg bg-[#0b0705]/90 px-3 py-1.5 border border-amber-900/70 text-xs text-soft-gold focus:border-amber-400 outline-none"
                          value={selectedHairstyle?.id || ""}
                          onChange={(e) => {
                            const id = e.target.value;
                            const found =
                              hairstyles.find((h) => String(h.id) === id) || null;
                            setSelectedHairstyle(found);
                          }}
                        >
                          <option value="">(Optional) choose a hairstyle</option>
                          {hairstyles.map((h) => (
                            <option key={h.id} value={h.id}>
                              {h.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Date & time */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-amber-100/85 font-tech">
                            DATE
                          </label>
                          <input
                            type="date"
                            min={today}
                            value={scheduledDate}
                            onChange={(e) => setScheduledDate(e.target.value)}
                            className="mt-1 w-full rounded-lg bg-[#0b0705]/90 px-3 py-1.5 border border-amber-900/70 text-xs text-soft-gold focus:border-amber-400 outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-amber-100/85 font-tech">
                            TIME
                          </label>
                          <input
                            type="time"
                            value={scheduledTime}
                            onChange={(e) => setScheduledTime(e.target.value)}
                            className="mt-1 w-full rounded-lg bg-[#0b0705]/90 px-3 py-1.5 border border-amber-900/70 text-xs text-soft-gold focus:border-amber-400 outline-none"
                            required
                          />
                          <p className="mt-1 text-[10px] text-amber-100/60">
                            Make sure it is between 07:00 and 21:00.
                          </p>
                        </div>
                      </div>

                      {/* Coupon & note */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-amber-100/85 font-tech">
                            COUPON CODE (Optional)
                          </label>
                          <input
                            type="text"
                            value={couponCode}
                            onChange={(e) => {
                              const onlyDigits = e.target.value
                                .replace(/\D/g, "")
                                .slice(0, 30);
                              setCouponCode(onlyDigits);
                            }}
                            placeholder="Enter a coupon code if you have one"
                            inputMode="numeric"
                            maxLength={30}
                            className="mt-1 w-full rounded-lg bg-[#0b0705]/90 px-3 py-1.5 border border-amber-900/70 text-xs text-soft-gold focus:border-amber-400 outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-amber-100/85 font-tech">
                            NOTE FOR BARBER
                          </label>
                          <input
                            type="text"
                            value={note}
                            onChange={(e) =>
                              setNote(e.target.value.slice(0, 255))
                            }
                            placeholder="e.g., Please tidy the beard"
                            maxLength={255}
                            className="mt-1 w-full rounded-lg bg-[#0b0705]/90 px-3 py-1.5 border border-amber-900/70 text-xs text-soft-gold focus:border-amber-400 outline-none"
                          />
                          <p className="mt-1 text-[10px] text-amber-100/60">
                            Max 255 characters.
                          </p>
                        </div>
                      </div>

                      <div className="rounded-lg border border-amber-900/70 bg-[#0b0705]/80 px-3 py-2 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-amber-100/75 font-medium">
                            Estimated total (barber + service)
                          </span>
                          <span className="text-amber-200 font-semibold text-sm">
                            {hasSelection
                              ? `Rp ${estimatedTotal.toLocaleString("id-ID")}`
                              : "-"}
                          </span>
                        </div>
                        <div className="text-[10px] text-amber-100/60">
                          {hasSelection
                            ? `Barber: Rp ${priceBreakdown.barberBase.toLocaleString("id-ID")}  Service: Rp ${priceBreakdown.serviceBase.toLocaleString("id-ID")}  Skill: +Rp ${priceBreakdown.skillPremium.toLocaleString("id-ID")}`
                            : "Select a barber & service to view the price estimate."}
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loadingBooking}
                        className="mt-2 inline-flex items-center justify-center rounded-xl bg-amber-400 px-4 py-1.5 text-[11px] font-tech tracking-[0.25em] text-[#2b190b] hover:bg-amber-300 disabled:opacity-60 uppercase shadow-[0_0_20px_rgba(251,191,36,0.5)]"
                      >
                        {loadingBooking ? "PROCESSING..." : "CREATE BOOKING"}
                      </button>
                    </form>
                  </div>
                </motion.div>

                {/* Last booking detail */}
                {lastBooking && (
                  <motion.div
                    className="relative rounded-xl border border-amber-900/60 bg-[#16100c]/95 backdrop-blur-xl p-4 shadow-[0_24px_60px_rgba(0,0,0,0.95)] overflow-hidden card-lux text-xs"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
                    <div className="relative z-10 space-y-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-vintage text-lg text-gold-gradient text-glow-gold">
                          Last Booking
                        </div>
                        {lastBooking && (
                          <span className="font-tech text-[9px] tracking-[0.22em] text-emerald-300 uppercase">
                            {lastBooking.status || "created"}
                          </span>
                        )}
                      </div>
                      <div className="text-amber-100/80 font-modern text-[11px] space-y-1.5">
                        <div>
                          Code:{" "}
                          <span className="text-soft-gold font-semibold">
                            {lastBooking.code || lastBooking.id}
                          </span>
                        </div>
                        <div>
                          Barber:{" "}
                          <span className="text-amber-200">
                            {lastBooking.barber?.display_name ||
                              lastBooking.barber?.user?.name ||
                              "-"}
                          </span>
                        </div>
                        <div>
                          Service:{" "}
                          <span className="text-amber-200">
                            {lastBooking.service?.name || "-"}
                          </span>
                        </div>
                        <div>
                          Hairstyle:{" "}
                          <span className="text-amber-200">
                            {lastBooking.hairstyle?.name || "Optional"}
                          </span>
                        </div>
                        <div>
                          Schedule:{" "}
                          <span className="text-amber-200">
                            {lastBooking.scheduled_at || "-"}
                          </span>
                        </div>
                        <div>
                          Total:{" "}
                          <span className="text-soft-gold font-semibold">
                            Rp {Number(lastBooking.total_price || 0).toLocaleString("id-ID")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </section>

              {/* RIGHT: Active booking + history dalam satu booking panel */}
              <section className="text-xs">
                <motion.div
                  className="relative rounded-2xl border border-amber-900/60 bg-[#16100c]/95 backdrop-blur-xl p-4 sm:p-5 shadow-[0_24px_60px_rgba(0,0,0,0.95)] overflow-hidden card-lux h-full"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-amber-500/50" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-amber-500/40" />
                  <div className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

                  <div className="relative z-10 flex flex-col gap-4">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="font-vintage text-lg sm:text-xl text-gold-gradient text-glow-gold">
                          BOOKING STATUS PANEL
                        </div>
                        <p className="text-[11px] text-amber-100/70 font-modern max-w-xs">
                          View your active booking and history.
                        </p>
                      </div>
                      <div className="flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          onClick={scrollToCreateForm}
                          className="rounded-full border border-amber-500/70 px-3 py-1 text-[10px] font-tech tracking-[0.2em] text-amber-100 hover:bg-amber-500/10"
                        >
                          Create
                        </button>
                        <button
                          type="button"
                          disabled={!activeBooking}
                          onClick={() => activeBooking && openViewBooking(activeBooking)}
                          className="rounded-full border border-amber-500/50 px-3 py-1 text-[10px] font-tech tracking-[0.2em] text-amber-100 hover:bg-amber-500/10 disabled:opacity-40"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          disabled={!activeBooking || activeBooking.status !== "waiting"}
                          onClick={() => activeBooking && openEditBooking(activeBooking)}
                          className="rounded-full border border-amber-400/60 px-3 py-1 text-[10px] font-tech tracking-[0.2em] text-amber-50 hover:bg-amber-400/10 disabled:opacity-40"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={!activeBooking}
                          onClick={() => activeBooking && openDeleteConfirm(activeBooking)}
                          className="rounded-full border border-red-500/60 px-3 py-1 text-[10px] font-tech tracking-[0.2em] text-red-200 hover:bg-red-500/10 disabled:opacity-40"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 h-full">
                      {/* BOX: Active booking & queue status */}
                      <div className="rounded-xl border border-emerald-600/70 bg-gradient-to-br from-[#051610]/95 via-[#04110c]/95 to-black/90 p-3 shadow-[0_18px_40px_rgba(0,0,0,0.9)]">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div>
                            <div className="font-tech text-[10px] text-emerald-300/90 tracking-[0.25em]">
                              ACTIVE BOOKING
                            </div>
                            <div className="font-vintage text-base text-gold-gradient text-glow-gold">
                              QUEUE STATUS
                            </div>
                          </div>
                        </div>

                        {activeBooking ? (
                          <>
                            <div className="text-emerald-100/90 font-modern text-[11px] space-y-1.5">
                              <div>
                                Code:{" "}
                                <span className="text-soft-gold font-semibold">
                                  {activeBooking.code || activeBooking.id}
                                </span>
                              </div>
                              <div>
                                Queue No.:{" "}
                                <span className="text-emerald-300 font-semibold">
                                  {activeBooking.queue_number || "-"}
                                </span>
                              </div>
                              <div>
                                Barber:{" "}
                                <span className="text-emerald-200">
                                  {activeBooking.barber?.display_name ||
                                    activeBooking.barber?.user?.name ||
                                    "-"}
                                </span>
                              </div>
                              <div>
                                Service:{" "}
                                <span className="text-emerald-200">
                                  {activeBooking.service?.name || "-"}
                                </span>
                              </div>
                              <div>
                                Hairstyle:{" "}
                                <span className="text-emerald-200">
                                  {activeBooking.hairstyle?.name || "Optional"}
                                </span>
                              </div>
                              <div>
                                Schedule:{" "}
                                <span className="text-emerald-200">
                                  {activeBooking.scheduled_at || "-"}
                                </span>
                              </div>
                              <div>
                                Total:{" "}
                                <span className="text-emerald-200 font-semibold">
                                  Rp {Number(activeBooking.total_price || 0).toLocaleString("id-ID")}
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-2 pt-1">
                                <span className="text-emerald-300">
                                  Status:{" "}
                                  <span className="font-semibold">
                                    {activeBooking.status}
                                  </span>
                                </span>

                                <span className="text-emerald-300">
                                  Payment:{" "}
                                  <span
                                    className={`font-semibold ${
                                      activeBooking.payment_status === "paid"
                                        ? "text-emerald-300"
                                        : activeBooking.payment_status ===
                                          "pending"
                                        ? "text-amber-300"
                                        : activeBooking.payment_status ===
                                          "failed"
                                        ? "text-red-300"
                                        : "text-slate-200"
                                    }`}
                                  >
                                    {activeBooking.payment_status || "unpaid"}
                                  </span>
                                </span>
                              </div>
                            </div>

                            {/* Show payment button only when unpaid */}
                            {activeBooking.payment_status !== "paid" && (
                              <div className="mt-3">
                                <PaymentButton
                                  booking={activeBooking}
                                  onFinish={() => reloadBookings(activeBooking.id)}
                                />
                              </div>
                            )}

                            {activeBooking.payment_status === "paid" && (
                              <div className="mt-3 text-[10px] text-emerald-200/80 font-modern">
                                Payment is{" "}
                                <span className="font-semibold">settled</span>.
                                Thank you!
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-emerald-50/80 text-[11px] font-modern">
                            No active booking. Create a new one from the left panel.
                          </div>
                        )}
                      </div>

                      {/* BOX: Booking History */}
                      <div className="rounded-xl border border-amber-900/60 bg-[#1b130f]/95 p-3">
                        <div className="flex items-center justify-between mb-2 gap-2">
                          <div className="font-vintage text-base text-gold-gradient text-glow-gold">
                            Booking History ({bookings.length})
                          </div>
                        </div>
                        <div className="max-h-[40vh] overflow-y-auto custom-scroll space-y-2 pr-1">
                          {bookings.map((b) => (
                            <div
                              key={b.id}
                              className="rounded-lg border border-amber-900/60 bg-[#1b130f]/90 px-3 py-2 flex justify-between gap-2"
                            >
                              <div className="space-y-0.5">
                                <div className="font-modern text-soft-gold text-[11px] font-semibold">
                              {b.code || `Booking #${b.id}`}
                            </div>
                            <div className="text-[11px] text-amber-100/80">
                              Barber:{" "}
                              <span className="text-amber-200">
                                {b.barber?.display_name ||
                                  b.barber?.user?.name ||
                                  "-"}
                              </span>
                            </div>
                            <div className="text-[11px] text-amber-100/80">
                              Service:{" "}
                              <span className="text-amber-200">
                                {b.service?.name || "-"}
                              </span>
                            </div>
                            <div className="text-[11px] text-amber-100/80">
                              Hairstyle:{" "}
                              <span className="text-amber-200">
                                {b.hairstyle?.name || "Optional"}
                              </span>
                            </div>
                              <div className="text-[10px] text-amber-100/70">
                                Schedule: {b.scheduled_at || "-"}
                              </div>
                              <div className="text-[11px] text-amber-100/80">
                                Total:{" "}
                                <span className="text-soft-gold font-semibold">
                                  Rp {Number(b.total_price || 0).toLocaleString("id-ID")}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end text-[10px] gap-1">
                              <span
                                className={`px-2 py-[2px] rounded-full font-tech tracking-[0.18em] ${
                                  b.status === "done"
                                    ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/70"
                                    : b.status === "cancelled"
                                    ? "bg-red-500/10 text-red-300 border border-red-500/60"
                                      : "bg-amber-500/10 text-amber-200 border border-amber-500/60"
                                  }`}
                                >
                                  {b.status}
                                </span>

                                <span
                                className={`px-2 py-[2px] rounded-full font-tech tracking-[0.18em] ${
                                  b.payment_status === "paid"
                                    ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/70"
                                      : b.payment_status === "pending"
                                    ? "bg-amber-500/10 text-amber-200 border border-amber-500/60"
                                      : b.payment_status === "failed"
                                    ? "bg-red-500/10 text-red-300 border border-red-500/60"
                                      : "bg-slate-500/10 text-slate-200 border border-slate-500/60"
                                  }`}
                              >
                                {b.payment_status || "unpaid"}
                              </span>

                              <div className="flex flex-wrap justify-end gap-1 pt-1">
                                <button
                                  type="button"
                                  onClick={() => openViewBooking(b)}
                                  className="rounded-full border border-amber-500/60 px-2 py-[2px] font-tech tracking-[0.16em] text-amber-100 hover:bg-amber-500/10"
                                >
                                  View
                                </button>
                                {b.status === "waiting" && b.payment_status !== "paid" && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => openEditBooking(b)}
                                      className="rounded-full border border-amber-400/60 px-2 py-[2px] font-tech tracking-[0.16em] text-amber-50 hover:bg-amber-400/10"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => openDeleteConfirm(b)}
                                      className="rounded-full border border-red-500/60 px-2 py-[2px] font-tech tracking-[0.16em] text-red-200 hover:bg-red-500/10"
                                    >
                                      Delete
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                          {!bookings.length && (
                            <div className="text-amber-100/75 font-modern text-[11px]">
                              No booking history yet.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </section>
            </div>
          </div>
        </main>
      </div>

      
      {portalTarget &&
        createPortal(
          <>
            {/* Modal: View booking detail */}
            {viewBooking && (
              <div className="fixed inset-0 z-[999] flex items-center justify-center px-4">
                <div
                  className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                  onClick={() => {
                    setViewBooking(null)
                    setModalError("")
                  }}
                />
                <div className="relative w-full max-w-lg rounded-2xl border border-amber-900/70 bg-[#0b0705]/95 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.95)]">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="font-vintage text-lg text-gold-gradient text-glow-gold">
                        Booking Details
                      </div>
                      <p className="text-[11px] text-amber-100/70 font-modern">
                        Review your order details.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setViewBooking(null)
                        setModalError("")
                      }}
                      className="text-amber-200 hover:text-amber-100"
                    >
                      x
                    </button>
                  </div>
                  <div className="space-y-1 text-[11px] text-amber-100/85 font-modern">
                    <div>
                      Code:{" "}
                      <span className="text-soft-gold font-semibold">
                        {viewBooking.code || viewBooking.id}
                      </span>
                    </div>
                    <div>
                      Barber:{" "}
                      <span className="text-amber-200">
                        {viewBooking.barber?.display_name ||
                          viewBooking.barber?.user?.name ||
                          "-"}
                      </span>
                    </div>
                    <div>
                        Service:{" "}
                        <span className="text-amber-200">
                          {viewBooking.service?.name || "-"}
                        </span>
                      </div>
                      <div>
                        Hairstyle:{" "}
                        <span className="text-amber-200">
                          {viewBooking.hairstyle?.name || "Optional"}
                        </span>
                      </div>
                    <div>
                      Schedule:{" "}
                      <span className="text-amber-200">
                        {viewBooking.scheduled_at || "-"}
                      </span>
                    </div>
                    <div>
                      Total:{" "}
                      <span className="text-soft-gold font-semibold">
                        Rp {Number(viewBooking.total_price || 0).toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div>
                      Status:{" "}
                      <span className="text-amber-200 font-semibold">
                        {viewBooking.status}
                      </span>{" "}
                      Payment:{" "}
                      <span className="text-amber-200 font-semibold">
                        {viewBooking.payment_status || "unpaid"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Modal: Edit Booking */}
            {editDraft && (
              <div className="fixed inset-0 z-[999] flex items-center justify-center px-4">
                <div
                  className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                  onClick={() => {
                    setEditDraft(null)
                    setModalError("")
                  }}
                />
                <div className="relative w-full max-w-xl rounded-2xl border border-amber-900/70 bg-[#0b0705]/95 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.95)]">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="font-vintage text-lg text-gold-gradient text-glow-gold">
                        Edit Booking
                      </div>
                      <p className="text-[11px] text-amber-100/70 font-modern">
                        Change barber, service, or schedule.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditDraft(null)
                        setModalError("")
                      }}
                      className="text-amber-200 hover:text-amber-100"
                    >
                      x
                    </button>
                  </div>

                  {modalError && (
                    <div className="mb-2 rounded-lg border border-red-500/70 bg-red-500/10 px-3 py-2 text-[11px] text-red-200 font-modern">
                      {modalError}
                    </div>
                  )}

                  <div className="space-y-3 text-[11px]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-amber-100/85 font-tech">
                          BARBER
                        </label>
                        <select
                          className="w-full rounded-lg bg-[#0b0705]/90 px-3 py-1.5 border border-amber-900/70 text-xs text-soft-gold focus:border-amber-400 outline-none"
                          value={editDraft.barberId || ""}
                          onChange={(e) =>
                            setEditDraft((prev) => ({
                              ...prev,
                              barberId: Number(e.target.value || 0),
                            }))
                          }
                        >
                          <option value="">- Choose a barber -</option>
                          {barbers.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.display_name || b.user?.name || `Barber #${b.id}`}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-amber-100/85 font-tech">
                          SERVICE
                        </label>
                        <select
                          className="w-full rounded-lg bg-[#0b0705]/90 px-3 py-1.5 border border-amber-900/70 text-xs text-soft-gold focus:border-amber-400 outline-none"
                          value={editDraft.serviceId || ""}
                          onChange={(e) =>
                            setEditDraft((prev) => ({
                              ...prev,
                              serviceId: Number(e.target.value || 0),
                            }))
                          }
                        >
                          <option value="">- Choose a service -</option>
                          {services.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name} (ID: {s.id})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-amber-100/85 font-tech">
                        HAIRSTYLE (Optional)
                      </label>
                      <select
                        className="w-full rounded-lg bg-[#0b0705]/90 px-3 py-1.5 border border-amber-900/70 text-xs text-soft-gold focus:border-amber-400 outline-none"
                        value={editDraft.hairstyleId || ""}
                        onChange={(e) =>
                          setEditDraft((prev) => ({
                            ...prev,
                            hairstyleId: e.target.value ? Number(e.target.value) : "",
                          }))
                        }
                      >
                        <option value="">- choose a hairstyle -</option>
                        {hairstyles.map((h) => (
                          <option key={h.id} value={h.id}>
                            {h.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-amber-100/85 font-tech">
                          DATE
                        </label>
                        <input
                          type="date"
                          min={today}
                          value={editDraft.date}
                          onChange={(e) =>
                            setEditDraft((prev) => ({
                              ...prev,
                              date: e.target.value,
                            }))
                          }
                          className="w-full rounded-lg bg-[#0b0705]/90 px-3 py-1.5 border border-amber-900/70 text-xs text-soft-gold focus:border-amber-400 outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-amber-100/85 font-tech">TIME</label>
                        <input
                          type="time"
                          value={editDraft.time}
                          onChange={(e) =>
                            setEditDraft((prev) => ({
                              ...prev,
                              time: e.target.value,
                            }))
                          }
                          className="w-full rounded-lg bg-[#0b0705]/90 px-3 py-1.5 border border-amber-900/70 text-xs text-soft-gold focus:border-amber-400 outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-amber-100/85 font-tech">
                        COUPON CODE (Optional)
                      </label>
                      <input
                        type="text"
                        value={editDraft.couponCode}
                        onChange={(e) =>
                          setEditDraft((prev) => ({
                            ...prev,
                            couponCode: e.target.value.replace(/[^0-9]/g, "").slice(0, 30),
                          }))
                        }
                        placeholder="Enter a new coupon code if needed"
                        className="w-full rounded-lg bg-[#0b0705]/90 px-3 py-1.5 border border-amber-900/70 text-xs text-soft-gold focus:border-amber-400 outline-none"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditDraft(null)
                          setModalError("")
                        }}
                        className="rounded-lg border border-amber-800/70 px-3 py-1 text-[10px] font-tech tracking-[0.18em] text-amber-100 hover:bg-amber-500/5"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={savingEdit}
                        onClick={handleUpdateBooking}
                        className="rounded-lg border border-emerald-500/70 bg-emerald-500/10 px-4 py-1 text-[10px] font-tech tracking-[0.18em] text-emerald-100 hover:bg-emerald-500/20 disabled:opacity-50"
                      >
                        {savingEdit ? "SAVING..." : "SAVE CHANGES"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Modal: Confirm cancellation */}
            {deleteTarget && (
              <div className="fixed inset-0 z-[999] flex items-center justify-center px-4">
                <div
                  className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                  onClick={() => {
                    setDeleteTarget(null)
                    setModalError("")
                  }}
                />
                <div className="relative w-full max-w-sm rounded-2xl border border-amber-900/70 bg-[#0b0705]/95 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.95)]">
                  <div className="font-vintage text-lg text-gold-gradient text-glow-gold mb-2">
                    Cancel Booking
                  </div>
                  <p className="text-[11px] text-amber-100/75 font-modern mb-3">
                    Order <span className="text-soft-gold font-semibold">{deleteTarget.code || deleteTarget.id}</span> will be cancelled. Continue?
                  </p>
                  {modalError && (
                    <div className="mb-2 rounded-lg border border-red-500/70 bg-red-500/10 px-3 py-2 text-[11px] text-red-200 font-modern">
                      {modalError}
                    </div>
                  )}
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteTarget(null)
                        setModalError("")
                      }}
                      className="rounded-lg border border-amber-800/70 px-3 py-1 text-[10px] font-tech tracking-[0.18em] text-amber-100 hover:bg-amber-500/5"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={deleteLoadingId === deleteTarget.id}
                      onClick={handleDeleteBooking}
                      className="rounded-lg border border-red-500/70 bg-red-500/10 px-4 py-1 text-[10px] font-tech tracking-[0.18em] text-red-100 hover:bg-red-500/20 disabled:opacity-50"
                    >
                      {deleteLoadingId === deleteTarget.id ? "CANCELLING..." : "YES, Delete"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>,
          portalTarget
        )}
    </MainLayout>
  );
}
