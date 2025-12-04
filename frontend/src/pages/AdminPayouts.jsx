// src/pages/AdminPayouts.jsx (adjust the path if your structure differs)
import React, { useEffect, useState, useMemo, useRef } from "react";
import adminPayoutApi from "../api/adminPayoutApi";
import { getBarbers } from "../api/adminUserApi"; //  ambil list barber
import { Canvas, useFrame } from "@react-three/fiber";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";

// === VISUAL ASSETS (PARTICLES & BACKGROUNDS KHUSUS PANEL) ===

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
            background:
              "radial-gradient(circle at 30% 0%, rgba(252,246,189,0.95), rgba(191,149,63,0.4))",
            boxShadow: "0 0 14px rgba(191, 149, 63, 0.55)",
          }}
        />
      ))}
    </div>
  );
};

const AmbientGlow = () => (
  <motion.div
    animate={{ opacity: [0.22, 0.58, 0.22], scale: [1, 1.08, 1] }}
    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
    className="absolute top-[-18%] left-[-10%] w-[75vw] h-[75vw] bg-[#bf953f] rounded-full blur-[230px] opacity-25 pointer-events-none z-0 mix-blend-screen"
  />
);

const ScanlineOverlay = () => (
  <div className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-soft-light bg-[repeating-linear-gradient(to_bottom,rgba(255,255,255,0.16)_0px,rgba(255,255,255,0.16)_1px,transparent_1px,transparent_3px)]" />
);

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

// === 3D BARBERSHOP POLE ===

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

// Komponen 3D Wrapper (menjadi panel kiri dalam kartu)
const PayoutHero3D = () => (
  <div className="relative w-full min-h-[220px] h-[240px] lg:h-[260px] rounded-xl overflow-hidden border border-amber-900/60 bg-[#020617] shadow-[0_18px_40px_rgba(0,0,0,0.9)]">
    <Canvas camera={{ position: [0.15, 0.35, 4.8], fov: 45 }}>
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

    {/* VIGNETTE & GLOW OVERLAYS */}
    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent" />
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0,#fbbf2433,transparent_60%)] mix-blend-screen" />
  </div>
);

// === MAIN COMPONENT (VERSI EMBEDDED DI DASHBOARD) ===

export default function AdminPayouts() {
  const [payouts, setPayouts] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);

  const [barbers, setBarbers] = useState([]); //  list barber untuk dropdown

  const [form, setForm] = useState({
    barber_id: "",
    amount: "",
    channel: "manual",
    account_name: "",
    account_number: "",
    bank_name: "",
    note: "",
  });

  const [errorMsg, setErrorMsg] = useState("");

  // --- API LOGIC ---
  const loadPayouts = async (page = 1) => {
    try {
      setLoading(true);
      const res = await adminPayoutApi.list({ page });
      setPayouts(res.data || res);
      setMeta(res.meta || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadBarbers = async () => {
    try {
      const res = await getBarbers();
      setBarbers(res.data || res || []);
    } catch (err) {
      console.error("Failed to load barbers for payout:", err);
    }
  };

  useEffect(() => {
    loadPayouts();
    loadBarbers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => {
      let v = value;

      // Amount: digits only (0-9), no dots/commas
      if (name === "amount") {
        v = value.replace(/[^0-9]/g, "");
        return { ...prev, [name]: v };
      }

      // Account name: letters + spaces only, max 60
      if (name === "account_name") {
        v = value.replace(/[^a-zA-Z\s]/g, "");
        if (v.length > 60) v = v.slice(0, 60);
        return { ...prev, [name]: v };
      }

      // Account number / phone: digits only, max 22
      if (name === "account_number") {
        v = value.replace(/[^0-9]/g, "");
        if (v.length > 22) v = v.slice(0, 22);
        return { ...prev, [name]: v };
      }

      // Bank / Provider: letters + spaces only, max 30
      if (name === "bank_name") {
        v = value.replace(/[^a-zA-Z\s]/g, "");
        if (v.length > 30) v = v.slice(0, 30);
        return { ...prev, [name]: v };
      }

      // Transaction note: max 255 characters (free text)
      if (name === "note") {
        if (v.length > 255) v = v.slice(0, 255);
        return { ...prev, [name]: v };
      }

      // barber_id & channel & lainnya: langsung set
      return { ...prev, [name]: v };
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    // Validasi minimum sebelum kirim ke API
    if (!form.barber_id) {
      setErrorMsg("Silakan Select Barber terlebih dahulu.");
      return;
    }

    const amountValue = Number(form.amount || 0);
    if (Number.isNaN(amountValue) || amountValue < 0) {
      setErrorMsg("Amount must be at least 0 and digits only.");
      return;
    }

    try {
      await adminPayoutApi.create({
        barber_id: Number(form.barber_id),
        amount: amountValue,
        channel: form.channel || "manual",
        account_name: form.account_name || null,
        account_number: form.account_number || null,
        bank_name: form.bank_name || null,
        note: form.note || null,
      });

      setForm({
        barber_id: "",
        amount: "",
        channel: "manual",
        account_name: "",
        account_number: "",
        bank_name: "",
        note: "",
      });

      loadPayouts();
    } catch (err) {
      console.error(err);
      const msg =
        err.response.data.message || "Failed to create payout simulation.";
      setErrorMsg(msg);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await adminPayoutApi.updateStatus(id, { status });
      loadPayouts();
    } catch (err) {
      console.error(err);
      alert("Failed to change payout status.");
    }
  };

// === DELETE PAYOUT ===
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this payout from history")) {
      return;
    }
    try {
      // SESUAIKAN nama fungsi ini dengan API-mu kalau berbeda:
      await adminPayoutApi.delete(id); // e.g., adminPayoutApi.destroy(id)
      loadPayouts();
    } catch (err) {
      console.error(err);
      alert("Failed to delete payout.");
    }
  };

  return (
    <>
      {/* Extra CSS needed for payout panel (text gradient, local scrollbar) */}
      <style>{`
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

        .custom-scrollbar::-webkit-scrollbar {
          height: 6px;
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(191, 149, 63, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(191, 149, 63, 0.6);
        }

        @keyframes shimmer {
          0% { transform: translateX(-150%) skewX(-20deg); }
          50% { transform: translateX(150%) skewX(-20deg); }
          100% { transform: translateX(150%) skewX(-20deg); }
        }
        .animate-shimmer { animation: shimmer 3s infinite; }
      `}</style>

      <section className="space-y-4 text-xs">
        {/* Payout header aligned with other dashboard sections */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-tech text-[10px] text-amber-500/90 uppercase tracking-[0.25em]">
              SIMULASI
            </div>
            <div className="font-vintage text-lg text-gold-gradient text-glow-gold">
              Payouts
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-tech tracking-[0.25em] text-emerald-300/80 uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.9)]" />
            <span>Sandbox Mode</span>
          </div>
        </div>

        {/* Main payout card, aligned with other dashboard cards */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-xl border border-amber-900/60 bg-[#16100c]/95 backdrop-blur-xl p-4 sm:p-5 lg:p-6 shadow-[0_24px_60px_rgba(0,0,0,0.95)] overflow-hidden card-lux"
        >
          {/* Internal card atmosphere matching the dashboard style */}
          <div className="pointer-events-none absolute inset-0">
            <AmbientGlow />
            <ScannerBeam />
            <FloatingParticles />
            <ScanlineOverlay />
          </div>
          <div className="absolute inset-0 opacity-[0.07] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1.1fr,1.6fr] gap-5 lg:gap-6">
            {/* LEFT PANEL: branding + 3D pole */}
            <div className="flex flex-col border-b border-amber-900/60 lg:border-b-0 lg:border-r lg:pr-5 pb-4 lg:pb-0">
              <div className="mb-4">
                <span className="font-tech text-[10px] tracking-[0.25em] text-amber-500/80 uppercase">
                  Admin Payout Console
                </span>
                <div className="mt-2 font-vintage text-[1.4rem] text-soft-gold leading-tight">
                  <span className="block text-gold-gradient text-glow-gold">
                    Royal Barber
                  </span>
                  <span className="block text-[0.9rem] text-amber-200/80 font-tech tracking-[0.25em] uppercase">
                    Simulasi Pencairan Saldo
                  </span>
                </div>
                <div className="mt-3 text-[11px] text-amber-100/75 font-modern leading-relaxed">
                  Data in this panel is for{" "}
                  <span className="text-soft-gold font-semibold">
                    simulasi alur withdraw
                  </span>{" "}
                  (approve, paid, rejected) dan{" "}
                  <span className="text-soft-gold font-semibold">
                    payout history
                  </span>{" "}
                  for barbers.
                </div>
              </div>

              <PayoutHero3D />
            </div>

            {/* RIGHT PANEL: FORM + TABLE */}
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <div className="font-vintage text-lg text-gold-gradient text-glow-gold">
                    Barber Payouts
                  </div>
                  <div className="font-tech text-[10px] text-amber-100/70 tracking-[0.22em] uppercase">
                    Create - Simulate - Review
                  </div>
                </div>
              </div>

              {/* Error Notification */}
              <AnimatePresence>
                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 py-2 bg-red-500/10 border border-red-500/60 rounded-lg text-[11px] text-red-200 font-modern mb-1">
                      {errorMsg}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* FORM */}
              <form
                onSubmit={handleCreate}
                className="rounded-xl border border-amber-900/60 bg-[#1a110c]/95 p-3 sm:p-4 space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  {/* Barber (select) */}
                  <div>
                    <label className="block text-[11px] text-amber-100/80 font-tech uppercase tracking-[0.18em]">
                      BARBER
                    </label>
                    <select
                      name="barber_id"
                      value={form.barber_id}
                      onChange={handleChange}
                      className="mt-1 w-full rounded-lg bg-[#0b0705]/90 px-3 py-1.5 text-xs text-soft-gold border border-amber-900/70 focus:border-amber-400 outline-none"
                      required
                    >
                      <option
                        value=""
                        disabled
                        className="bg-[#0b0705] text-slate-400"
                      >
                        Select Barber
                      </option>
                      {barbers.map((b) => (
                        <option
                          key={b.id}
                          value={b.id}
                          className="bg-[#0b0705] text-soft-gold"
                        >
                          {b.display_name || b.name || `Barber #${b.id}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block text-[11px] text-amber-100/80 font-tech uppercase tracking-[0.18em]">
                      AMOUNT
                    </label>
                    <input
                      type="text"
                      name="amount"
                      value={form.amount}
                      onChange={handleChange}
                      className="mt-1 w-full rounded-lg bg-[#0b0705]/90 px-3 py-1.5 text-xs text-soft-gold border border-amber-900/70 focus:border-amber-400 outline-none placeholder:text-amber-900/60"
                      placeholder="0"
                      required
                    />
                  </div>

                  {/* Channel */}
                  <div>
                    <label className="block text-[11px] text-amber-100/80 font-tech uppercase tracking-[0.18em]">
                      CHANNEL
                    </label>
                    <select
                      name="channel"
                      value={form.channel}
                      onChange={handleChange}
                      className="mt-1 w-full rounded-lg bg-[#0b0705]/90 px-3 py-1.5 text-xs text-soft-gold border border-amber-900/70 focus:border-amber-400 outline-none"
                    >
                      <option
                        value="manual"
                        className="bg-[#0b0705] text-soft-gold"
                      >
                        Manual (Default)
                      </option>
                      <option
                        value="bank_transfer"
                        className="bg-[#0b0705] text-soft-gold"
                      >
                        Bank Transfer
                      </option>
                      <option
                        value="e_wallet"
                        className="bg-[#0b0705] text-soft-gold"
                      >
                        E-Wallet
                      </option>
                      <option
                        value="cash"
                        className="bg-[#0b0705] text-soft-gold"
                      >
                        Cash
                      </option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  {/* Nama Rekening */}
                  <div>
                    <label className="block text-[11px] text-amber-100/80 font-tech uppercase tracking-[0.18em]">
                      A.N. REKENING
                    </label>
                    <input
                      type="text"
                      name="account_name"
                      value={form.account_name}
                      onChange={handleChange}
                      className="mt-1 w-full rounded-lg bg-[#0b0705]/90 px-3 py-1.5 text-xs text-soft-gold border border-amber-900/70 focus:border-amber-400 outline-none"
                      placeholder="Account holder name"
                    />
                  </div>

                  {/* No Rek / HP */}
                  <div>
                    <label className="block text-[11px] text-amber-100/80 font-tech uppercase tracking-[0.18em]">
                      NO. REK / HP
                    </label>
                    <input
                      type="text"
                      name="account_number"
                      value={form.account_number}
                      onChange={handleChange}
                      className="mt-1 w-full rounded-lg bg-[#0b0705]/90 px-3 py-1.5 text-xs text-soft-gold border border-amber-900/70 focus:border-amber-400 outline-none"
                      placeholder="Maksimal 22 digit"
                    />
                  </div>

                  {/* Bank / Provider */}
                  <div>
                    <label className="block text-[11px] text-amber-100/80 font-tech uppercase tracking-[0.18em]">
                      BANK / PROVIDER
                    </label>
                    <input
                      type="text"
                      name="bank_name"
                      value={form.bank_name}
                      onChange={handleChange}
                      className="mt-1 w-full rounded-lg bg-[#0b0705]/90 px-3 py-1.5 text-xs text-soft-gold border border-amber-900/70 focus:border-amber-400 outline-none"
                      placeholder="Example: BCA / DANA"
                    />
                  </div>
                </div>

                {/* Transaction Note */}
                <div>
                  <label className="block text-[11px] text-amber-100/80 font-tech uppercase tracking-[0.18em]">
                    TRANSACTION NOTE
                  </label>
                  <input
                    type="text"
                    name="note"
                    value={form.note}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-lg bg-[#0b0705]/90 px-3 py-1.5 text-xs text-soft-gold border border-amber-900/70 focus:border-amber-400 outline-none placeholder:text-amber-900/60"
                    placeholder="Example: Payout week 2 November"
                  />
                </div>

                <button
                  type="submit"
                  className="mt-1 inline-flex items-center justify-center rounded-xl bg-amber-400 px-4 py-1.5 text-[11px] font-tech font-semibold text-[#2b190b] hover:bg-amber-300 tracking-[0.25em] uppercase shadow-[0_0_20px_rgba(251,191,36,0.55)]"
                >
                  SAVE PAYOUT
                </button>
              </form>

              {/* TABEL DATA */}
              <div className="mt-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-modern font-semibold text-soft-gold">
                    History
                  </span>
                  <span className="text-[10px] font-tech text-amber-100/60 tracking-[0.18em] uppercase">
                    {(meta && meta.total) ? `Total: ${meta.total}` : "No Data"}
                  </span>
                </div>

                <div className="bg-[#1a110c]/95 border border-amber-900/60 rounded-xl overflow-hidden">
                  {loading ? (
                    <div className="p-4 text-center text-[11px] text-amber-100/70 font-tech tracking-[0.25em] animate-pulse">
                      PROCESSING DATA...
                    </div>
                  ) : payouts.length === 0 ? (
                    <div className="p-4 text-center text-[11px] text-amber-100/75 font-modern">
                      No payout data yet.
                    </div>
                  ) : (
                    <div className="overflow-x-auto custom-scrollbar">
                      <table className="min-w-full text-[11px] font-modern whitespace-nowrap">
                        <thead>
                          <tr className="text-amber-300/90 border-b border-amber-900/60 font-tech tracking-[0.18em] uppercase text-[9px]">
                            <th className="text-left py-2 px-3 font-normal">
                              ID
                            </th>
                            <th className="text-left py-2 px-3 font-normal">
                              Barber
                            </th>
                            <th className="text-right py-2 px-3 font-normal">
                              Amount
                            </th>
                            <th className="text-left py-2 px-3 font-normal">
                              Channel
                            </th>
                            <th className="text-left py-2 px-3 font-normal">
                              Status
                            </th>
                            <th className="text-center py-2 px-3 font-normal">
                              Aksi
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {payouts.map((p) => (
                            <tr
                              key={p.id}
                              className="border-b border-amber-900/40 last:border-b-0 hover:bg-amber-900/10 transition-colors"
                            >
                              <td className="py-2 px-3 text-amber-100/80">
                                #{p.id}
                              </td>
                              <td className="py-2 px-3 text-soft-gold">
                                {p.barber?.display_name || p.barber?.name || (p.barber_id ? `ID ${p.barber_id}` : "Unknown barber")}
                              </td>
                              <td className="py-2 px-3 text-right text-emerald-300 font-tech">
                                {Number(p.amount || 0).toLocaleString("id-ID")}
                              </td>
                              <td className="py-2 px-3 text-amber-100/80">
                                {p.channel}
                              </td>
                              <td className="py-2 px-3">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-tech tracking-[0.18em] uppercase border ${
                                    p.status === "paid"
                                      ? "border-emerald-500/70 text-emerald-300 bg-emerald-500/10"
                                      : p.status === "rejected"
                                      ? "border-red-500/70 text-red-300 bg-red-500/10"
                                      : "border-sky-500/70 text-sky-300 bg-sky-500/10"
                                  }`}
                                >
                                  {p.status}
                                </span>
                              </td>
                              <td className="py-2 px-3">
                                <div className="flex flex-wrap items-center justify-center gap-1.5">
                                  <button
                                    onClick={() =>
                                      handleStatusChange(p.id, "approved")
                                    }
                                    className="text-[10px] rounded-full border border-amber-500/60 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-0.5 text-amber-200 font-tech tracking-[0.18em]"
                                  >
                                    APV
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleStatusChange(p.id, "paid")
                                    }
                                    className="text-[10px] rounded-full border border-emerald-500/70 bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-0.5 text-emerald-200 font-tech tracking-[0.18em]"
                                  >
                                    PAY
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleStatusChange(p.id, "rejected")
                                    }
                                    className="text-[10px] rounded-full border border-red-500/70 bg-red-500/10 hover:bg-red-500/20 px-2.5 py-0.5 text-red-200 font-tech tracking-[0.18em]"
                                  >
                                    REJECT
                                  </button>
                                  <button
                                    onClick={() => handleDelete(p.id)}
                                    className="text-[10px] rounded-full border border-red-500/80 bg-red-900/40 hover:bg-red-800/70 px-2.5 py-0.5 text-red-100 font-tech tracking-[0.18em]"
                                    title="Delete this payout"
                                  >
                                    DEL
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </>
  );
}
