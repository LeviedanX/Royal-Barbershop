// src/pages/DashboardBarber.jsx
import React, { useEffect, useMemo, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Canvas, useFrame } from "@react-three/fiber";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";

import MainLayout from "../components/Layout/MainLayout";
import { http } from "../api/http";
import { useAuth } from "../hooks/useAuth";
import RealtimeClock from "../components/ui/RealtimeClock";
import AnnouncementBanner from "../components/ui/AnnouncementBanner";

// ============================================================================
//  Visual atmosphere (mirrors the admin dashboard)
// ============================================================================

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

// 4. CRT Scanline
const ScanlineOverlay = () => (
  <div className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-soft-light bg-[repeating-linear-gradient(to_bottom,rgba(255,255,255,0.16)_0px,rgba(255,255,255,0.16)_1px,transparent_1px,transparent_3px)]" />
);

// ============================================================================
//  3D BARBERSHOP POLE (SAMA DENGAN DASHBOARD ADMIN/CUSTOMER)
// ============================================================================
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
      groupRef.current.position.y = Math.sin(t * 1.1) * 0.1;
    }

    if (poleRef.current.material.map) {
      poleRef.current.material.map.offset.y -= delta * 0.25;
    }

    if (glassRef.current.material) {
      const mat = glassRef.current.material;
      mat.opacity = 0.32 + Math.sin(t * 2.2) * 0.06;
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
          opacity={0.06}
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
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.38} />
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
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.32} />
      </mesh>
    </group>
  );
}

const DashboardPole3D = () => (
  <div className="relative h-24 w-40 sm:h-24 sm:w-44 md:h-28 md:w-48">
    <Canvas camera={{ position: [0.15, 0.4, 4.8], fov: 45 }}>
      <color attach="background" args={["#020617"]} />
      <fog attach="fog" args={["#020617", 4, 11]} />
      <ambientLight intensity={0.25} />
      <spotLight
        position={[5, 6, 6]}
        angle={0.5}
        penumbra={1}
        intensity={2.0}
        color="#bf953f"
        castShadow
      />
      <spotLight
        position={[-5, -4, 5]}
        angle={0.55}
        penumbra={1}
        intensity={1.6}
        color="#60a5fa"
      />
      <LuxuryPole3D />
    </Canvas>
    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent" />
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0,#fbbf2433,transparent_60%)] mix-blend-screen" />
  </div>
);

// ============================================================================
//  MAIN DASHBOARD BARBER
// ============================================================================

export default function DashboardBarber() {
  const { user } = useAuth();

  // Tab untuk layout mirip admin
  const [activeTab, setActiveTab] = useState("overview");

  // Data untuk barber (silakan sesuaikan endpoint & shape respon dengan backendmu)
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    todayQueue: 0,
    todayFinished: 0,
    todayIncome: 0,
    avgRating: null,
  });
  const [todayBookings, setTodayBookings] = useState([]);
  const [historyBookings, setHistoryBookings] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        // example endpoint - adjust to your backend
        const { data } = await http.get("/barber/dashboard");
        // asumsi bentuk data:
        // {
        //   stats: { todayQueue, todayFinished, todayIncome, avgRating },
        //   todayBookings: [...],
        //   historyBookings: [...],
        //   reviews: [...]
        // }
        setStats(data.stats || {});
        setTodayBookings(data.todayBookings || []);
        setHistoryBookings(data.historyBookings || []);
        setReviews(data.reviews || []);
      } catch (err) {
        console.error("Failed to load barber dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // ====================== RENDER PANEL  MIRIP DASHBOARD ADMIN =================

  const renderOverview = () => (
    <section className="space-y-4 text-xs">
      <AnnouncementBanner />

      {/* cards ringkas status hari ini */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Active queue */}
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
                TODAY'S QUEUE
              </div>
              <span className="h-[1px] w-8 bg-gradient-to-r from-amber-500 to-transparent" />
            </div>
            <div className="font-modern text-soft-gold text-2xl font-semibold text-glow-gold">
              {stats.todayQueue ?? 0}
            </div>
          </div>
        </motion.div>

        {/* Selesai */}
        <motion.div
          className="relative rounded-xl border border-emerald-500/40 bg-gradient-to-br from-[#081711]/95 via-[#07120d]/95 to-black/90 p-3 shadow-[0_18px_40px_rgba(0,0,0,0.9)] overflow-hidden card-lux"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <div className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-1">
              <div className="text-[10px] font-tech tracking-[0.25em] text-emerald-300/90">
                COMPLETED ORDERS
              </div>
            </div>
            <div className="font-modern text-emerald-300 text-2xl font-semibold text-glow-gold">
              {stats.todayFinished ?? 0}
            </div>
          </div>
        </motion.div>

        {/* Pendapatan hari ini */}
        <motion.div
          className="relative rounded-xl border border-amber-500/40 bg-gradient-to-br from-[#18110c] via-[#130d0a] to-[#090605] p-3 shadow-[0_18px_40px_rgba(0,0,0,0.9)] overflow-hidden card-lux"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
          <div className="relative z-10">
            <div className="text-[10px] font-tech tracking-[0.25em] text-amber-300/90 mb-1">
              TOTAL REVENUE
            </div>
            <div className="font-modern text-soft-gold text-xl font-semibold text-glow-gold">
              Rp{" "}
              {Number(stats.todayIncome || 0).toLocaleString("id-ID", {
                minimumFractionDigits: 0,
              })}
            </div>
          </div>
        </motion.div>

        {/* Rating */}
        <motion.div
          className="relative rounded-xl border border-amber-500/40 bg-gradient-to-br from-[#14121d] via-[#0b0a11] to-black p-3 shadow-[0_18px_40px_rgba(0,0,0,0.9)] overflow-hidden card-lux"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
          <div className="relative z-10">
            <div className="text-[10px] font-tech tracking-[0.25em] text-amber-300/90 mb-1">
              RATING
            </div>
              <div className="flex items-baseline gap-1">
                <div className="font-modern text-soft-gold text-2xl font-semibold text-glow-gold">
                  {stats.avgRating != null ? stats.avgRating.toFixed(1) : "-"}
                </div>
                <span className="text-[11px] text-amber-200/80">/ 5.0</span>
              </div>
          </div>
        </motion.div>
      </div>

      {/* TODAY QUEUE LIST */}
      <div className="relative rounded-xl border border-amber-900/60 bg-[#16100c]/95 backdrop-blur-xl p-4 shadow-[0_24px_60px_rgba(0,0,0,0.95)] overflow-hidden card-lux">
        <div className="absolute inset-0 opacity-[0.07] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="font-tech text-[10px] text-amber-500/90 tracking-[0.25em]">
                TOTAL QUEUE
              </div>
              <div className="font-vintage text-lg text-gold-gradient text-glow-gold">
                Queue Overview
              </div>
            </div>
          </div>

          <div className="max-h-[60vh] overflow-y-auto custom-scroll text-[11px] font-modern space-y-2">
            {todayBookings.map((b) => (
              <div
                key={b.id}
                className="rounded-lg border border-amber-900/60 bg-[#1b130f]/90 px-3 py-2 flex justify-between gap-2"
              >
                <div>
                  <div className="font-semibold text-soft-gold">
                    {b.customer_name || "Customer"}
                  </div>
                  <div className="text-amber-100/75">
                    {b.service_name || "Service"} {" "}
                    <span className="text-amber-300">
                      {b.time_label || b.time || "-"}
                    </span>
                  </div>
                  <div className="text-amber-100/70 text-[10px] mt-0.5">
                    Code: {b.code || "-"}  Queue:{" "}
                    {b.queue_number ?? "-"}
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <span className="text-[10px] px-2 py-[2px] rounded-full border border-emerald-500/70 bg-emerald-500/10 text-emerald-200 font-tech tracking-[0.18em]">
                    {b.status || "PENDING"}
                  </span>
                  {b.amount && (
                    <div className="text-emerald-300 text-[11px] mt-1">
                      Rp {Number(b.amount).toLocaleString("id-ID")}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {!todayBookings.length && (
              <div className="text-amber-100/75 font-modern">
                No queue entries for you today.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );

  const renderQueue = () => (
    <section className="space-y-4 text-xs">
      <div>
        <div className="font-tech text-[10px] text-amber-500/90">ACTIVE QUEUE</div>
        <div className="font-vintage text-lg text-gold-gradient text-glow-gold">
          My Queue
        </div>
      </div>

      <div className="relative rounded-xl border border-amber-900/60 bg-[#16100c]/95 backdrop-blur-xl p-4 shadow-[0_24px_60px_rgba(0,0,0,0.95)] overflow-hidden card-lux">
        <div className="absolute inset-0 opacity-[0.07] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        <div className="relative z-10 max-h-[65vh] overflow-y-auto custom-scroll space-y-2">
          {todayBookings.map((b) => (
            <div
              key={b.id}
              className="rounded-lg border border-amber-900/60 bg-[#1b130f]/90 px-3 py-2 flex justify-between gap-2"
            >
              <div>
                <div className="font-modern text-soft-gold text-[11px] font-semibold">
                  #{b.queue_number ?? "-"}  {b.customer_name || "Customer"}
                </div>
                <div className="text-[11px] text-amber-100/80">
                  {b.service_name || "Service"} {" "}
                  {b.time_label || b.time || "-"}
                </div>
                <div className="text-[10px] text-amber-100/70 mt-0.5">
                  Code: {b.code || "-"}  Payment method:{" "}
                  {b.payment_type || "-"}
                </div>
              </div>
              <div className="flex flex-col items-end justify-between">
                <span className="text-[10px] px-2 py-[2px] rounded-full border border-amber-500/70 bg-amber-500/10 text-amber-200 font-tech tracking-[0.18em]">
                  {b.status || "PENDING"}
                </span>
                {b.amount && (
                  <div className="text-emerald-300 text-[11px] mt-1">
                    Rp {Number(b.amount).toLocaleString("id-ID")}
                  </div>
                )}
              </div>
            </div>
          ))}
          {!todayBookings.length && (
            <div className="text-amber-100/75 font-modern">
              No active queue.
            </div>
          )}
        </div>
      </div>
    </section>
  );

  const renderHistory = () => (
    <section className="space-y-4 text-xs">
      <div>
        <div className="font-tech text-[10px] text-amber-500/90">BOOKING HISTORY</div>
        <div className="font-vintage text-lg text-gold-gradient text-glow-gold">
          History
        </div>
      </div>

      <div className="relative rounded-xl border border-amber-900/60 bg-[#16100c]/95 backdrop-blur-xl p-4 shadow-[0_24px_60px_rgba(0,0,0,0.95)] overflow-hidden card-lux">
        <div className="absolute inset-0 opacity-[0.07] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        <div className="relative z-10 overflow-x-auto custom-scroll">
          <table className="min-w-full text-[11px] font-modern">
            <thead>
              <tr className="text-amber-300/90 border-b border-amber-900/60">
                <th className="text-left py-2 pr-3 font-normal">Date</th>
                <th className="text-left py-2 pr-3 font-normal">Customer</th>
                <th className="text-left py-2 pr-3 font-normal">Service</th>
                <th className="text-left py-2 pr-3 font-normal">Status</th>
                <th className="text-left py-2 pr-3 font-normal">Amount</th>
              </tr>
            </thead>
            <tbody>
              {historyBookings.map((b) => (
                <tr
                  key={b.id}
                  className="border-b border-amber-900/40 last:border-b-0"
                >
                  <td className="py-2 pr-3 text-amber-100/80">
                    {b.date_label || b.date || "-"}
                  </td>
                  <td className="py-2 pr-3 text-soft-gold">
                    {b.customer_name || "Customer"}
                  </td>
                  <td className="py-2 pr-3 text-amber-100/80">
                    {b.service_name || "-"}
                  </td>
                  <td className="py-2 pr-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-tech tracking-[0.18em] bg-emerald-500/10 text-emerald-300 border border-emerald-500/70">
                      {b.status || "DONE"}
                    </span>
                  </td>
                  <td className="py-2 pr-3 text-emerald-300">
                    {b.amount
                      ? "Rp " +
                        Number(b.amount).toLocaleString("id-ID")
                      : "-"}
                  </td>
                </tr>
              ))}
              {!historyBookings.length && (
                <tr>
                  <td
                    colSpan={5}
                    className="py-3 text-center text-amber-100/75"
                  >
                    No booking history yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );

  const renderReviews = () => (
    <section className="space-y-4 text-xs">
      <div>
        <div className="font-tech text-[10px] text-amber-500/90">
          REVIEW CUSTOMER
        </div>
        <div className="font-vintage text-lg text-gold-gradient text-glow-gold">
          Reviews
        </div>
      </div>

      <div className="relative rounded-xl border border-amber-900/60 bg-[#16100c]/95 backdrop-blur-xl p-4 shadow-[0_24px_60px_rgba(0,0,0,0.95)] overflow-hidden card-lux">
        <div className="absolute inset-0 opacity-[0.07] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        <div className="relative z-10 max-h-[65vh] overflow-y-auto custom-scroll space-y-2 text-[11px]">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="rounded-lg border border-amber-900/60 bg-[#1b130f]/90 px-3 py-2 flex justify-between gap-2"
            >
              <div>
                <div className="font-modern text-soft-gold">
                  {r.customer_name || "Customer"}
                </div>
                <div className="text-amber-100/75 mt-0.5">
                  Rating:{" "}
                  <span className="text-emerald-300">
                    {r.rating ?? "-"} / 5
                  </span>
                </div>
                <div className="text-amber-100/80 mt-1">
                  {r.comment || "(tanpa komentar)"}
                </div>
                {r.service_name && (
                  <div className="text-[10px] text-amber-100/70 mt-1">
                    Service: {r.service_name}
                  </div>
                )}
              </div>
            </div>
          ))}
          {!reviews.length && (
            <div className="text-amber-100/75 font-modern">
              No reviews yet.
            </div>
          )}
        </div>
      </div>
    </section>
  );

  const renderProfile = () => (
    <section className="space-y-4 text-xs">
      <div>
        <div className="font-tech text-[10px] text-amber-500/90">
          BARBER PROFILE
        </div>
        <div className="font-vintage text-lg text-gold-gradient text-glow-gold">
          My Profile
        </div>
      </div>

      <div className="relative rounded-xl border border-amber-900/60 bg-[#16100c]/95 backdrop-blur-xl p-4 shadow-[0_24px_60px_rgba(0,0,0,0.95)] overflow-hidden card-lux">
        <div className="absolute inset-0 opacity-[0.07] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        <div className="relative z-10 text-[11px] font-modern space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
            <div>
              <div className="font-modern text-soft-gold text-base">
                {user.name || "Barber"}
              </div>
              <div className="text-amber-100/75">
                {user.email || "-"}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full border border-amber-500/70 bg-amber-500/10 text-[10px] font-tech tracking-[0.18em] text-amber-200">
                ROLE: {user.role.toUpperCase() || "BARBER"}
              </span>
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-amber-500/40 via-amber-500/10 to-transparent my-2" />

          <div className="text-amber-100/80">
            Profile summary (dummy):
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Personal preferred working hours.</li>
              <li>Specialized cuts / favorite styles.</li>
              <li>Portfolio / social media links if available.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );

  // ========================================================================
  //  MAIN RENDER  COPY KONSEP DARI DASHBOARD ADMIN
  // ========================================================================
  return (
    <MainLayout>
      <div className="relative min-h-screen bg-[#181411] text-amber-50 flex flex-col overflow-hidden pt-16 font-modern">
        {/* --- CSS INJECTION (PERSIS DARI DASHBOARD ADMIN) --- */}
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

          .text-soft-gold {
            color: #f5e6c8;
          }
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

          @keyframes shine {
            to { background-position: 200% center; }
          }

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

          .header-glow {
            position: relative;
            overflow: hidden;
          }
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

          .frame-vignette {
            position: relative;
          }
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

          .tab-button {
            position: relative;
            overflow: hidden;
          }
          .tab-button::before {
            content: "";
            position: absolute;
            inset-y: 4px;
            left: 0;
            width: 2px;
            border-radius: 999px;
            background: linear-gradient(to bottom, #fbbf24, #facc15, #f97316);
            opacity: 0;
            transform: translateX(-6px);
            transition: opacity 0.25s ease, transform 0.25s ease;
          }
          .tab-button:hover::before {
            opacity: 0.6;
            transform: translateX(0);
          }
          .tab-active::before {
            opacity: 0.95;
            transform: translateX(0);
          }

          @media (max-width: 768px) {
            .font-vintage {
              letter-spacing: 0.18em;
            }
          }
        `}</style>

        {/* LAYER 0: BACKGROUND ATMOSPHERE */}
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
              <DashboardPole3D />
            </div>
            <div className="flex flex-col gap-2">
              <div>
                <div className="flex flex-wrap items-baseline gap-2 md:gap-3">
                  <span className="font-vintage text-2xl md:text-3xl tracking-[0.4em] text-gold-gradient text-glow-gold">
                    DASHBOARD BARBER
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
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
                Monitor queues, revenue, and customer reviews here.
              </div>
            </div>
          </motion.div>

          <motion.div
            className="flex flex-col items-end gap-1 text-right text-[11px] font-modern text-amber-100/80"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
          >
          </motion.div>
        </header>

        {/* BODY: sidebar + content */}
        <main className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-[260px,1fr]">
          {/* SIDEBAR */}
          <aside className="border-r border-amber-900/60 bg-[#120c08]/95 px-4 py-4 text-xs space-y-3 backdrop-blur-2xl">
            <div className="text-amber-300/90 mb-1 font-tech text-[10px] flex items-center justify-between">
              <span>MENU BARBER</span>
              <span className="w-8 h-[1px] bg-gradient-to-r from-amber-500 to-transparent" />
            </div>

            {[
              ["overview", "Overview"],
              ["queue", "My Queue"],
              ["history", "History"],
              ["reviews", "Reviews"],
              ["profile", "Profile"],
            ].map(([key, label]) => {
              const active = activeTab === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveTab(key)}
                  className={`w-full text-left rounded-md px-3 py-2 transition-all font-modern text-[11px] flex items-center justify-between relative overflow-hidden tab-button ${
                    active
                      ? "bg-gradient-to-r from-amber-500/25 via-amber-500/10 to-transparent text-soft-gold border border-amber-500/70 shadow-[0_0_24px_rgba(251,191,36,0.35)] tab-active"
                      : "border border-transparent hover:border-amber-800/70 hover:bg-amber-500/5 text-amber-100/75"
                  }`}
                >
                  {active && (
                    <span className="absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-amber-500/20 via-transparent to-transparent opacity-80 pointer-events-none" />
                  )}
                  <span className="relative z-10">{label}</span>
                  <span className="relative z-10 flex items-center gap-1">
                    {active && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)]" />
                    )}
                  </span>
                </button>
              );
            })}
          </aside>

          {/* CONTENT PANEL */}
          <section className="p-4 md:p-6 overflow-y-auto custom-scroll frame-vignette">
            <div className="max-w-[1200px] mx-auto relative z-10">
              {loading && (
                <div className="mb-3 text-[10px] font-tech tracking-[0.25em] text-amber-200">
                  LOADING DASHBOARD...
                </div>
              )}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  {activeTab === "overview" && renderOverview()}
                  {activeTab === "queue" && renderQueue()}
                  {activeTab === "history" && renderHistory()}
                  {activeTab === "reviews" && renderReviews()}
                  {activeTab === "profile" && renderProfile()}
                </motion.div>
              </AnimatePresence>
            </div>
          </section>
        </main>
      </div>
    </MainLayout>
  );
}
