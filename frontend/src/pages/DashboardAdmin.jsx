// src/pages/DashboardAdmin.jsx
import { useEffect, useMemo, useState, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";

import MainLayout from "../components/Layout/MainLayout";
import { useAuth } from "../hooks/useAuth";
import RealtimeClock from "../components/ui/RealtimeClock";
import AnnouncementBanner from "../components/ui/AnnouncementBanner";

import { fetchTickets } from "../api/csApi";
import {
  fetchAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "../api/announcementApi";
import {
  getBarbers,
  createBarber,
  deleteBarber,
  getCustomers,
  createCustomer,
  deleteCustomer, // ⬅️ tambahkan ini
  changeMyPassword,
  adminChangeUserPassword,
} from "../api/adminUserApi";
import {
  getBusinessHours,
  updateBusinessHour,
  closeShop,
  openShopDefault,
} from "../api/adminBusinessHourApi";
import {
  getPayments,
  getPaymentDetail,
  updatePayment,
  deletePayment, // ⬅️ tambahkan ini
} from "../api/adminPaymentApi";
import {
  getAccessLogs,
  deleteAccessLog,
  clearAccessLogs,
} from "../api/adminAccessLogApi";
import {
  getAdminServices,
  createAdminService,
  deleteAdminService,
  getAdminHairstyles,
  createAdminHairstyle,
  deleteAdminHairstyle,
  getAdminCoupons,
  createAdminCoupon,
  deleteAdminCoupon,
  getAdminPromos,
  createAdminPromo,
  deleteAdminPromo,
  getAdminReviews,
  deleteAdminReview,
} from "../api/adminCatalogApi";
// Tambahan import untuk operasi update/CRUD lengkap
import { updateBarber, updateCustomer } from "../api/adminUserApi";
import {
  updateAdminService,
  updateAdminHairstyle,
  updateAdminCoupon,
  updateAdminPromo,
} from "../api/adminCatalogApi";

import AdminPayouts from "./AdminPayouts";

const dayNames = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];

// === ATMOSFER DASHBOARD: Partikel, Glow, Scanline ==========================
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

// === 3D BARBERSHOP POLE (REUSE STYLE DARI REGISTER) ========================
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

    if (poleRef.current?.material?.map) {
      poleRef.current.material.map.offset.y -= delta * 0.25;
    }

    if (glassRef.current?.material) {
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
      <OrbitControls enableZoom={false} enablePan={false} />
    </Canvas>
    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent" />
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0,#fbbf2433,transparent_60%)] mix-blend-screen" />
  </div>
);

// === MAIN COMPONENT ========================================================
export default function DashboardAdmin() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("overview");

  const [tickets, setTickets] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [newAnn, setNewAnn] = useState({ title: "", content: "" });
  const [editingAnnId, setEditingAnnId] = useState(null);
  const [loadingAnn, setLoadingAnn] = useState(false);

  // batas karakter pengumuman
  const ANNOUNCEMENT_TITLE_MAX = 50;
  const ANNOUNCEMENT_CONTENT_MAX = 255;

  // batas field barber
  const BARBER_NAME_MAX = 60;
  const BARBER_EMAIL_MAX = 60;
  const BARBER_PHONE_MAX = 16;
  const BARBER_DISPLAY_MAX = 60;

    // batas field customer
  const CUSTOMER_NAME_MAX = 60;
  const CUSTOMER_EMAIL_MAX = 60;
  const CUSTOMER_PHONE_MAX = 16;

    // batas field catalog
  const CATALOG_NAME_MAX = 60;
  const CATALOG_DESC_MAX = 255;
  const COUPON_CODE_MAX = 20;
  const COUPON_REASON_MAX = 100;

  const [barbers, setBarbers] = useState([]);
  const [editingBarberId, setEditingBarberId] = useState(null);
  const [newBarber, setNewBarber] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    display_name: "",
    skill_level: "",
    base_price: "",
  });

  const [customers, setCustomers] = useState([]);
  const [editingCustomerId, setEditingCustomerId] = useState(null);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [businessHours, setBusinessHours] = useState([]);
  const [businessLoading, setBusinessLoading] = useState(false);

  const [payments, setPayments] = useState([]);
  const [paymentDetail, setPaymentDetail] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [newPayment, setNewPayment] = useState({
    booking_id: "",
    gross_amount: "",
    transaction_status: "settlement",
    payment_type: "manual",
  });

  const [accessLogs, setAccessLogs] = useState([]);

  // Catalog
  const [services, setServices] = useState([]);
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [newService, setNewService] = useState({
    name: "",
    description: "",
    base_price: "",
    duration_minutes: "",
    is_bundle: false,
  });

  const [hairstyles, setHairstyles] = useState([]);
  const [editingHairstyleId, setEditingHairstyleId] = useState(null);
  const [newHairstyle, setNewHairstyle] = useState({
    name: "",
    image_url: "",
    description: "",
    default_service_id: "",
  });

  const [coupons, setCoupons] = useState([]);
  const [editingCouponId, setEditingCouponId] = useState(null);
  const [newCoupon, setNewCoupon] = useState({
    user_id: "",
    code: "",
    discount_percent: 25,
    expires_at: "",
    issued_reason: "LOYALTY_7_ORDERS",
  });

  const [promos, setPromos] = useState([]);
  const [editingPromoId, setEditingPromoId] = useState(null);
  const [newPromo, setNewPromo] = useState({
    name: "",
    description: "",
    day_of_week: "",
    discount_percent: 10,
    service_id: "",
    is_active: true,
  });

  const [reviews, setReviews] = useState([]);

  // Settings: password forms
  const [myPasswordForm, setMyPasswordForm] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });
  const [myPasswordLoading, setMyPasswordLoading] = useState(false);

  const [targetUserId, setTargetUserId] = useState("");
  const [targetNewPassword, setTargetNewPassword] = useState("");
  const [targetPasswordLoading, setTargetPasswordLoading] = useState(false);

  // === INIT LOAD ===
  useEffect(() => {
    fetchTickets().then(setTickets).catch(console.error);
    reloadAnnouncements();
    reloadBarbers();
    reloadCustomers();
    reloadBusinessHours();
    reloadPayments();
    reloadAccessLogs();
    reloadCatalog();
  }, []);

  const reloadAnnouncements = () => {
    fetchAnnouncements().then(setAnnouncements).catch(console.error);
  };

  const reloadBarbers = () => {
    getBarbers().then(setBarbers).catch(console.error);
  };

  const reloadCustomers = () => {
    getCustomers().then(setCustomers).catch(console.error);
  };

  const reloadBusinessHours = () => {
  getBusinessHours()
    .then((hours) => setBusinessHours(hours))
    .catch(console.error);
  };

  const reloadPayments = () => {
    getPayments()
      .then((res) => setPayments(res.data || res))
      .catch(console.error);
  };

  const reloadAccessLogs = () => {
    getAccessLogs()
      .then((res) => setAccessLogs(res.data || res))
      .catch(console.error);
  };

  const handleDeleteAccessLog = async (id) => {
    if (!confirm("Hapus log ini?")) return;
    try {
      await deleteAccessLog(id);
      reloadAccessLogs();
    } catch (err) {
      console.error(err);
      alert("Gagal hapus log");
    }
  };

  const handleClearAccessLogs = async () => {
    if (!confirm("Hapus semua access logs?")) return;
    try {
      await clearAccessLogs();
      reloadAccessLogs();
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus semua log");
    }
  };

  const reloadCatalog = () => {
    getAdminServices().then(setServices).catch(console.error);
    getAdminHairstyles().then(setHairstyles).catch(console.error);
    getAdminCoupons().then(setCoupons).catch(console.error);
    getAdminPromos().then(setPromos).catch(console.error);
    getAdminReviews().then(setReviews).catch(console.error);
  };

  // === ANNOUNCEMENTS HANDLER ===
  const handleSaveAnnouncement = async (e) => {
    e.preventDefault();
    if (!newAnn.title || !newAnn.content) return;
    // defensive check kalau ada yang bypass dari DevTools
    if (
      newAnn.title.length > ANNOUNCEMENT_TITLE_MAX ||
      newAnn.content.length > ANNOUNCEMENT_CONTENT_MAX
    ) {
      alert(
        `Judul maksimal ${ANNOUNCEMENT_TITLE_MAX} karakter dan isi maksimal ${ANNOUNCEMENT_CONTENT_MAX} karakter.`
      );
      return;
    }
    setLoadingAnn(true);
    try {
      if (editingAnnId) {
        await updateAnnouncement(editingAnnId, {
          title: newAnn.title,
          content: newAnn.content,
          target_role: "all",
        });
      } else {
        await createAnnouncement({
          title: newAnn.title,
          content: newAnn.content,
          target_role: "all",
          is_active: true,
        });
      }
      setNewAnn({ title: "", content: "" });
      setEditingAnnId(null);
      reloadAnnouncements();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAnn(false);
    }
  };

  const handleToggleActiveAnnouncement = async (a) => {
    try {
      await updateAnnouncement(a.id, { is_active: !a.is_active });
      reloadAnnouncements();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!confirm("Yakin hapus pengumuman?")) return;
    try {
      await deleteAnnouncement(id);
      reloadAnnouncements();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditAnnouncement = (ann) => {
    setEditingAnnId(ann.id);
    setNewAnn({ title: ann.title || "", content: ann.content || "" });
  };

  const handleCancelAnnouncement = () => {
    setEditingAnnId(null);
    setNewAnn({ title: "", content: "" });
  };

  // === BARBER HANDLER ===
  const handleCreateBarber = async (e) => {
    e.preventDefault();

    // Normalisasi dan trim
    const name = (newBarber.name || "").trim();
    const email = (newBarber.email || "").trim();
    const phone = (newBarber.phone || "").trim();
    const displayName = (newBarber.display_name || "").trim();
    const basePriceStr = (newBarber.base_price ?? "").toString().trim();

    // 1) NAMA USER (LOGIN)
    //   - huruf A-Z / a-z dan spasi
    //   - maksimal 60 karakter
    if (!/^[A-Za-z ]{1,60}$/.test(name)) {
      alert(
        "Nama user hanya boleh berisi huruf A-Z (lowercase/uppercase) dan spasi, maksimal 60 karakter."
      );
      return;
    }

    // 2) DISPLAY NAME
    //   - huruf A-Z / a-z dan spasi
    //   - maksimal 60 karakter
    if (!/^[A-Za-z ]{1,60}$/.test(displayName)) {
      alert(
        "Display name hanya boleh berisi huruf A-Z (lowercase/uppercase) dan spasi, maksimal 60 karakter."
      );
      return;
    }

    // Jika sedang edit barber: cukup update display_name / skill_level / base_price
    if (editingBarberId) {
      const basePriceStr = (newBarber.base_price ?? "").toString().trim();
      if (basePriceStr !== "" && !/^[0-9]+$/.test(basePriceStr)) {
        alert("Base price hanya boleh berisi angka 0-9 (tanpa titik, koma, atau spasi).");
        return;
      }
      const numericBasePrice =
        basePriceStr === "" ? 0 : Number(basePriceStr);

      try {
        await updateBarber(editingBarberId, {
          display_name: displayName,
          skill_level: (newBarber.skill_level || "").toLowerCase(),
          base_price: numericBasePrice,
        });
        setEditingBarberId(null);
        setNewBarber({
          name: "",
          email: "",
          phone: "",
          password: "",
          display_name: "",
          skill_level: "",
          base_price: "",
        });
        reloadBarbers();
      } catch (err) {
        console.error(err);
        alert("Gagal memperbarui barber");
      }
      return;
    }

    // 3) EMAIL
    //   - maksimal 60 karakter
    //   - huruf lowercase saja
    //   - harus domain @barber.com
    //   - hanya a-z, 0-9, titik, underscore, dash sebelum @
    if (!email) {
      alert("Email wajib diisi.");
      return;
    }
    if (email.length > BARBER_EMAIL_MAX) {
      alert("Email maksimal 60 karakter.");
      return;
    }
    if (!/^[a-z0-9._-]+@barber\.com$/.test(email)) {
      alert(
        "Email harus menggunakan domain @barber.com, huruf lowercase, dan hanya boleh berisi a-z, 0-9, titik (.), underscore (_), atau strip (-)."
      );
      return;
    }

    // 4) NO. HP (opsional tapi kalau diisi harus valid)
    //   - hanya angka 0-9
    //   - maksimal 16 karakter
    if (phone && !/^[0-9]{1,16}$/.test(phone)) {
      alert("No. HP hanya boleh berisi angka 0-9 dan maksimal 16 digit.");
      return;
    }

    // 5) BASE PRICE
    //   - hanya angka 0-9
    //   - minimal 0
    //   - tidak boleh ada titik, koma, spasi, minus, dsb.
    if (basePriceStr !== "" && !/^[0-9]+$/.test(basePriceStr)) {
      alert("Base price hanya boleh berisi angka 0-9 (tanpa titik, koma, atau spasi).");
      return;
    }
    const numericBasePrice =
      basePriceStr === "" ? 0 : Number(basePriceStr);

    if (Number.isNaN(numericBasePrice) || numericBasePrice < 0) {
      alert("Base price minimal 0 dan harus berupa angka bulat.");
      return;
    }

    if (!newBarber.password || newBarber.password.length < 8) {
      alert("Password barber minimal 8 karakter.");
      return;
    }

    try {
      await createBarber({
        ...newBarber,
        name,
        email,
        phone,
        display_name: displayName,
        base_price: numericBasePrice,
      });

      setNewBarber({
        name: "",
        email: "",
        phone: "",
        password: "",
        display_name: "",
        skill_level: "",
        base_price: "",
      });
      reloadBarbers();
    } catch (err) {
      console.error(err);
      alert("Gagal menambah barber");
    }
  };

  const handleDeleteBarber = async (barberId) => {
    if (!confirm("Yakin hapus barber ini?")) return;
    try {
      await deleteBarber(barberId);
      reloadBarbers();
    } catch (err) {
      console.error(err);
      alert("Gagal hapus barber");
    }
  };

  const handleEditBarber = (barber) => {
    setEditingBarberId(barber.id);
    setNewBarber({
      name: barber.user?.name || "",
      email: barber.user?.email || "",
      phone: barber.user?.phone || "",
      password: "",
      display_name: barber.display_name || "",
      skill_level: barber.skill_level || "",
      base_price: barber.base_price || "",
    });
  };

  const handleCancelBarber = () => {
    setEditingBarberId(null);
    setNewBarber({
      name: "",
      email: "",
      phone: "",
      password: "",
      display_name: "",
      skill_level: "",
      base_price: "",
    });
  };

  // === CUSTOMER HANDLER ===
  const handleCreateCustomer = async (e) => {
    e.preventDefault();

    // Normalisasi & trim
    const name = (newCustomer.name || "").trim();
    const email = (newCustomer.email || "").trim();
    const phone = (newCustomer.phone || "").trim();
    const password = newCustomer.password || "";

    // 1) NAMA
    //    - hanya huruf A-Z / a-z dan spasi
    //    - maksimal 60 karakter
    if (!/^[A-Za-z ]{1,60}$/.test(name)) {
      alert(
        "Nama customer hanya boleh berisi huruf A-Z (lowercase/uppercase) dan spasi, maksimal 60 karakter."
      );
      return;
    }

    // Jika mode edit customer: hanya update name/phone
    if (editingCustomerId) {
      if (phone && !/^[0-9]{1,16}$/.test(phone)) {
        alert("No. HP customer hanya boleh berisi angka 0-9 dan maksimal 16 digit.");
        return;
      }
      try {
        await updateCustomer(editingCustomerId, { name, phone });
        setEditingCustomerId(null);
        setNewCustomer({ name: "", email: "", phone: "", password: "" });
        reloadCustomers();
      } catch (err) {
        console.error(err);
        alert("Gagal memperbarui customer");
      }
      return;
    }

    // 2) EMAIL
    //    - wajib diisi
    //    - maksimal 60 karakter
    //    - huruf lowercase saja
    //    - harus domain @barber.com
    if (!email) {
      alert("Email customer wajib diisi.");
      return;
    }
    if (email.length > CUSTOMER_EMAIL_MAX) {
      alert("Email customer maksimal 60 karakter.");
      return;
    }
    if (!/^[a-z]+@barber\.com$/.test(email)) {
      alert(
        "Email customer harus menggunakan huruf kecil (a-z) dan domain @barber.com, contoh: johndoe@barber.com."
      );
      return;
    }

    // 3) NO. HP (opsional, tapi kalau diisi harus valid)
    //    - hanya angka 0-9
    //    - maksimal 16 digit
    if (phone && !/^[0-9]{1,16}$/.test(phone)) {
      alert("No. HP customer hanya boleh berisi angka 0-9 dan maksimal 16 digit.");
      return;
    }

    // 4) PASSWORD MINIMAL 8 KARAKTER
    if (!password || password.length < 8) {
      alert("Password customer minimal 8 karakter.");
      return;
    }

    try {
      await createCustomer({
        name,
        email,
        phone,
        password,
      });
      setNewCustomer({
        name: "",
        email: "",
        phone: "",
        password: "",
      });
      reloadCustomers();
    } catch (err) {
      console.error(err);
      alert("Gagal menambah customer");
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    if (!confirm("Yakin hapus customer ini?")) return;
    try {
      await deleteCustomer(customerId);
      reloadCustomers();
    } catch (err) {
      console.error(err);
      alert("Gagal hapus customer");
    }
  };

  const handleEditCustomer = (cust) => {
    setEditingCustomerId(cust.id);
    setNewCustomer({
      name: cust.name || "",
      email: cust.email || "",
      phone: cust.phone || "",
      password: "",
    });
  };

  const handleCancelCustomer = () => {
    setEditingCustomerId(null);
    setNewCustomer({ name: "", email: "", phone: "", password: "" });
  };

  // === BUSINESS HOURS HANDLER ===
  const handleUpdateHourToggle = async (h, field, value) => {
    setBusinessLoading(true);
    try {
      await updateBusinessHour(h.id, { [field]: value });
      reloadBusinessHours();
    } catch (err) {
      console.error(err);
      alert("Gagal update jam buka");
    } finally {
      setBusinessLoading(false);
    }
  };

  const handleCloseShop = async () => {
    if (!confirm("Tutup toko sementara? Semua hari akan closed.")) return;

    setBusinessLoading(true);
    try {
      await closeShop();          // 🔹 pakai endpoint khusus
      await reloadBusinessHours(); // refresh tabel
    } catch (err) {
      console.error(err);
      alert("Gagal menutup toko");
    } finally {
      setBusinessLoading(false);
    }
  };

  const handleOpenShopDefault = async () => {
    if (!confirm("Buka toko dengan jam default 07:00–21:00 untuk semua hari?"))
      return;

    setBusinessLoading(true);
    try {
      await openShopDefault();      // 🔹 pakai endpoint khusus
      await reloadBusinessHours();  // refresh tabel (jam & status)
    } catch (err) {
      console.error(err);
      alert("Gagal membuka toko");
    } finally {
      setBusinessLoading(false);
    }
  };

  const isShopClosed =
    businessHours.length > 0 &&
    businessHours.every((h) => h.is_closed === true);

  // === PAYMENTS HANDLER ===
  const handleOpenPaymentDetail = async (paymentId) => {
    try {
      const detail = await getPaymentDetail(paymentId);
      setPaymentDetail(detail);
      setEditingPayment({
        id: detail.id,
        transaction_status: detail.transaction_status || "",
        payment_type: detail.payment_type || "",
        gross_amount: detail.gross_amount || "",
        fraud_status: detail.fraud_status || "",
      });
      setPaymentModalOpen(true);
    } catch (err) {
      console.error(err);
      alert("Gagal mengambil detail payment");
    }
  };

  const handleClosePaymentModal = () => {
    setPaymentModalOpen(false);
    setPaymentDetail(null);
    setEditingPayment(null);
  };

  const handleDeletePayment = async (paymentId) => {
    if (!confirm("Yakin hapus payment ini?")) return;
    try {
      await deletePayment(paymentId);
      reloadPayments();
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus payment");
    }
  };

  const handleUpdatePayment = async () => {
    if (!editingPayment?.id) return;
    try {
      await updatePayment(editingPayment.id, {
        transaction_status: editingPayment.transaction_status,
        payment_type: editingPayment.payment_type,
        gross_amount: editingPayment.gross_amount,
        fraud_status: editingPayment.fraud_status,
      });
      reloadPayments();
      setPaymentDetail(null);
      setPaymentModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Gagal memperbarui payment");
    }
  };

  // === CATALOG HANDLER ===
  const handleCreateService = async (e) => {
    e.preventDefault();

    const name = (newService.name || "").trim();
    const description = (newService.description || "").trim();
    const basePriceStr = (newService.base_price ?? "").toString().trim();
    const durationStr = (newService.duration_minutes ?? "").toString().trim();

    if (!/^[A-Za-z ]{1,60}$/.test(name)) {
      alert(
        "Nama service hanya boleh berisi huruf A-Z (lowercase/uppercase) dan spasi, maksimal 60 karakter."
      );
      return;
    }

    if (description.length > CATALOG_DESC_MAX) {
      alert("Deskripsi service maksimal 255 karakter.");
      return;
    }

    if (basePriceStr === "") {
      alert("Harga service wajib diisi (minimal 0).");
      return;
    }
    if (!/^[0-9]+$/.test(basePriceStr)) {
      alert("Harga hanya boleh berisi angka 0-9 tanpa titik (.) atau koma (,).");
      return;
    }
    const basePriceNum = Number(basePriceStr);
    if (Number.isNaN(basePriceNum) || basePriceNum < 0) {
      alert("Harga minimal 0 dan harus berupa angka bulat.");
      return;
    }

    if (!/^[0-9]+$/.test(durationStr)) {
      alert("Durasi hanya boleh berisi angka 0-9.");
      return;
    }
    const durationNum = Number(durationStr);
    if (durationNum < 1 || durationNum > 180) {
      alert("Durasi service harus antara 1 sampai 180 menit.");
      return;
    }

    try {
      if (editingServiceId) {
        await updateAdminService(editingServiceId, {
          name,
          description,
          base_price: basePriceNum,
          duration_minutes: durationNum,
          is_bundle: newService.is_bundle,
        });
      } else {
        await createAdminService({
          ...newService,
          name,
          description,
          base_price: basePriceNum,
          duration_minutes: durationNum,
        });
      }
      setEditingServiceId(null);
      setNewService({
        name: "",
        description: "",
        base_price: "",
        duration_minutes: "",
        is_bundle: false,
      });
      reloadCatalog();
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan service");
    }
  };

  const handleDeleteService = async (id) => {
    if (!confirm("Hapus service ini?")) return;
    try {
      await deleteAdminService(id);
      reloadCatalog();
    } catch (err) {
      console.error(err);
      alert("Gagal hapus service");
    }
  };

  const handleEditService = (service) => {
    setEditingServiceId(service.id);
    setNewService({
      name: service.name || "",
      description: service.description || "",
      base_price: service.base_price || "",
      duration_minutes: service.duration_minutes || "",
      is_bundle: !!service.is_bundle,
    });
  };

  const handleCancelService = () => {
    setEditingServiceId(null);
    setNewService({
      name: "",
      description: "",
      base_price: "",
      duration_minutes: "",
      is_bundle: false,
    });
  };

  const handleCreateHairstyle = async (e) => {
    e.preventDefault();

    const name = (newHairstyle.name || "").trim();
    const description = (newHairstyle.description || "").trim();
    const defaultServiceIdStr = (newHairstyle.default_service_id || "").toString().trim();

    if (!/^[A-Za-z ]{1,60}$/.test(name)) {
      alert("Nama hairstyle hanya boleh berisi huruf A-Z (lowercase/uppercase) dan spasi, maksimal 60 karakter.");
      return;
    }

    if (description.length > CATALOG_DESC_MAX) {
      alert("Deskripsi hairstyle maksimal 255 karakter.");
      return;
    }

    if (!newHairstyle.image_url) {
      alert("URL gambar wajib diisi.");
      return;
    }

    if (defaultServiceIdStr && !/^[0-9]+$/.test(defaultServiceIdStr)) {
      alert("Service default harus berupa angka ID service.");
      return;
    }

    try {
      if (editingHairstyleId) {
        await updateAdminHairstyle(editingHairstyleId, {
          name,
          description,
          image_url: newHairstyle.image_url,
          default_service_id: defaultServiceIdStr || null,
        });
      } else {
        await createAdminHairstyle({
          ...newHairstyle,
          name,
          description,
          default_service_id: defaultServiceIdStr || null,
        });
      }
      setEditingHairstyleId(null);
      setNewHairstyle({
        name: "",
        image_url: "",
        description: "",
        default_service_id: "",
      });
      reloadCatalog();
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan hairstyle");
    }
  };

  const handleDeleteHairstyle = async (id) => {
    if (!confirm("Hapus hairstyle ini?")) return;
    try {
      await deleteAdminHairstyle(id);
      reloadCatalog();
    } catch (err) {
      console.error(err);
      alert("Gagal hapus hairstyle");
    }
  };

  const handleEditHairstyle = (h) => {
    setEditingHairstyleId(h.id);
    setNewHairstyle({
      name: h.name || "",
      image_url: h.image_url || "",
      description: h.description || "",
      default_service_id:
        h.default_service_id || h.default_service?.id || "",
    });
  };

  const handleCancelHairstyle = () => {
    setEditingHairstyleId(null);
    setNewHairstyle({
      name: "",
      image_url: "",
      description: "",
      default_service_id: "",
    });
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();

    const code = (newCoupon.code || "").trim();
    const reason = (newCoupon.issued_reason || "").trim();
    const discountStr = (newCoupon.discount_percent ?? "").toString().trim();

    if (!code) {
      alert("Kode kupon wajib diisi.");
      return;
    }
    if (code.length > COUPON_CODE_MAX) {
      alert(`Kode kupon maksimal ${COUPON_CODE_MAX} karakter.`);
      return;
    }

    if (discountStr === "" || !/^[0-9]+$/.test(discountStr)) {
      alert("Diskon harus angka 0-99.");
      return;
    }
    const discNum = Number(discountStr);
    if (discNum < 1 || discNum > 99) {
      alert("Diskon harus 1-99%.");
      return;
    }

    if (reason.length > COUPON_REASON_MAX) {
      alert(`Alasan maksimal ${COUPON_REASON_MAX} karakter.`);
      return;
    }

    try {
      if (editingCouponId) {
        await updateAdminCoupon(editingCouponId, {
          code,
          discount_percent: discNum,
          issued_reason: reason,
          expires_at: newCoupon.expires_at || null,
          user_id: newCoupon.user_id || null,
        });
      } else {
        await createAdminCoupon({
          code,
          discount_percent: discNum,
          issued_reason: reason,
          expires_at: newCoupon.expires_at || null,
          user_id: newCoupon.user_id || null,
        });
      }
      setEditingCouponId(null);
      setNewCoupon({
        user_id: "",
        code: "",
        discount_percent: 25,
        expires_at: "",
        issued_reason: "LOYALTY_7_ORDERS",
      });
      reloadCatalog();
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan kupon");
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (!confirm("Hapus coupon ini?")) return;
    try {
      await deleteAdminCoupon(id);
      reloadCatalog();
    } catch (err) {
      console.error(err);
      alert("Gagal hapus coupon");
    }
  };

  const handleEditCoupon = (c) => {
    setEditingCouponId(c.id);
    setNewCoupon({
      user_id: c.user_id || "",
      code: c.code || "",
      discount_percent: c.discount_percent || 0,
      expires_at: c.expires_at || "",
      issued_reason: c.issued_reason || "",
    });
  };

  const handleCancelCoupon = () => {
    setEditingCouponId(null);
    setNewCoupon({
      user_id: "",
      code: "",
      discount_percent: 25,
      expires_at: "",
      issued_reason: "LOYALTY_7_ORDERS",
    });
  };

  const handleCreatePromo = async (e) => {
    e.preventDefault();

    const name = (newPromo.name || "").trim();
    const description = (newPromo.description || "").trim();
    const discountStr = (newPromo.discount_percent ?? "").toString().trim();

    if (!name) {
      alert("Nama promo wajib diisi.");
      return;
    }

    if (discountStr === "" || !/^[0-9]+$/.test(discountStr)) {
      alert("Diskon harus angka 0-99.");
      return;
    }
    const discNum = Number(discountStr);
    if (discNum < 1 || discNum > 99) {
      alert("Diskon harus 1-99%.");
      return;
    }

    try {
      if (editingPromoId) {
        await updateAdminPromo(editingPromoId, {
          name,
          description,
          discount_percent: discNum,
          day_of_week: newPromo.day_of_week || null,
          service_id: newPromo.service_id || null,
          is_active: newPromo.is_active,
        });
      } else {
        await createAdminPromo({
          name,
          description,
          discount_percent: discNum,
          day_of_week: newPromo.day_of_week || null,
          service_id: newPromo.service_id || null,
          is_active: newPromo.is_active,
        });
      }
      setEditingPromoId(null);
      setNewPromo({
        name: "",
        description: "",
        day_of_week: "",
        discount_percent: 10,
        service_id: "",
        is_active: true,
      });
      reloadCatalog();
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan promo");
    }
  };

  const handleDeletePromo = async (id) => {
    if (!confirm("Hapus promo ini?")) return;
    try {
      await deleteAdminPromo(id);
      reloadCatalog();
    } catch (err) {
      console.error(err);
      alert("Gagal hapus promo");
    }
  };

  const handleEditPromo = (p) => {
    setEditingPromoId(p.id);
    setNewPromo({
      name: p.name || "",
      description: p.description || "",
      day_of_week: p.day_of_week ?? "",
      discount_percent: p.discount_percent ?? 0,
      service_id: p.service_id || "",
      is_active: p.is_active ?? true,
    });
  };

  const handleCancelPromo = () => {
    setEditingPromoId(null);
    setNewPromo({
      name: "",
      description: "",
      day_of_week: "",
      discount_percent: 10,
      service_id: "",
      is_active: true,
    });
  };

  const handleDeleteReview = async (id) => {
    if (!confirm("Hapus review ini?")) return;
    try {
      await deleteAdminReview(id);
      reloadCatalog();
    } catch (err) {
      console.error(err);
      alert("Gagal hapus review");
    }
  };

  // === SETTINGS HANDLER: PASSWORD ===
  const handleMyPasswordSubmit = async (e) => {
    e.preventDefault();

    // ✅ 1. VALIDASI terlebih dulu (di sisi frontend)
    if (!myPasswordForm.new_password || myPasswordForm.new_password.length < 8) {
      alert("Password baru minimal 8 karakter.");
      return;
    }

    if (
      myPasswordForm.new_password !==
      myPasswordForm.new_password_confirmation
    ) {
      alert("Konfirmasi password baru tidak sama.");
      return;
    }

    // ✅ 2. Baru mulai proses loading & call API
    setMyPasswordLoading(true);
    try {
      await changeMyPassword({
        current_password: myPasswordForm.current_password,
        password_current: myPasswordForm.current_password,
        new_password: myPasswordForm.new_password,
        password: myPasswordForm.new_password,
        new_password_confirmation: myPasswordForm.new_password_confirmation,
        password_confirmation: myPasswordForm.new_password_confirmation,
      });
      alert("Password berhasil diganti");
      setMyPasswordForm({
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
      });
    } catch (err) {
      console.error(err);
      alert("Gagal mengganti password (cek current password / format payload)");
    } finally {
      setMyPasswordLoading(false);
    }
  };

  const handleTargetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!targetUserId) {
      alert("Pilih user dulu");
      return;
    }
    setTargetPasswordLoading(true);
    try {
      await adminChangeUserPassword(targetUserId, {
        new_password: targetNewPassword,
        password: targetNewPassword,
      });
      alert("Password user berhasil diganti");
      setTargetNewPassword("");
    } catch (err) {
      console.error(err);
      alert("Gagal mengganti password user");
    } finally {
      setTargetPasswordLoading(false);
    }
  };

  // === COMBINED USER LIST UNTUK SETTINGS ===
  const allUsersForSettings = useMemo(() => {
    const barberUsers =
      barbers.map((b) => ({
        id: b.user?.id,
        name: `${b.user?.name || "Barber"} (${b.display_name || "-"})`,
        role: "barber",
      })) || [];

    const customerUsers =
      customers.map((c) => ({
        id: c.id,
        name: `${c.name} (${c.email})`,
        role: "customer",
      })) || [];

    return [...barberUsers, ...customerUsers].filter((u) => u.id != null);
  }, [barbers, customers]);

  // === PANEL RENDERERS =====================================================
  const renderOverview = () => (
    <section className="space-y-4 text-xs">
      <AnnouncementBanner />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Status Toko */}
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
                STATUS TOKO
              </div>
              <span className="h-[1px] w-10 bg-gradient-to-r from-amber-500 to-transparent" />
            </div>
            <div
              className={`font-semibold text-sm ${
                isShopClosed ? "text-red-300" : "text-emerald-300"
              }`}
            >
              {isShopClosed
                ? "Tutup sementara"
                : "Buka (07:00–21:00)"}
            </div>
            <div className="mt-2 text-[11px] text-amber-100/70 font-modern leading-relaxed">
              Diatur dari menu{" "}
              <span className="text-soft-gold font-semibold">
                Business Hours
              </span>
              . Kamu bisa tutup sementara atau buka toko.
            </div>
          </div>
        </motion.div>

        {/* Tiket CS */}
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
                TIKET CS
              </div>
              <div className="flex gap-[3px]">
                <span className="w-1 h-1 rounded-full bg-emerald-400/80" />
                <span className="w-1 h-1 rounded-full bg-amber-400/70" />
              </div>
            </div>
            <div className="text-emerald-300 font-semibold text-lg font-modern text-glow-gold">
              {tickets.length} tiket
            </div>
            <div className="mt-1 text-[11px] text-amber-100/70">
              Data real-time pengguna service tiket.
            </div>
          </div>
        </motion.div>

        {/* Pengumuman aktif */}
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
                PENGUMUMAN AKTIF
              </div>
            </div>
            <div className="text-amber-300 font-semibold text-lg text-glow-gold">
              {announcements.filter((a) => a.is_active).length} aktif
            </div>
            <div className="mt-1 text-[11px] text-amber-100/75">
              Papan pengumuman untuk semua user.
            </div>
          </div>
        </motion.div>
      </div>

      {/* BROADCAST: Kelola Pengumuman */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr,1fr] gap-4 mt-4">
        <div className="relative rounded-xl border border-amber-900/60 bg-[#16100c]/95 backdrop-blur-xl p-4 shadow-[0_24px_60px_rgba(0,0,0,0.95)] overflow-hidden card-lux">
          <div className="absolute inset-0 opacity-[0.07] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
          <div className="relative z-10 flex items-center justify-between mb-3">
            <div className="flex flex-col">
              <span className="font-tech text-[10px] tracking-[0.25em] text-amber-500/80">
                BROADCAST
              </span>
              <div className="font-vintage text-lg text-gold-gradient text-glow-gold">
                Kelola Pengumuman
              </div>
            </div>
          </div>

          <div className="relative z-10 space-y-2 max-h-72 overflow-y-auto pr-1 custom-scroll">
            {announcements.map((a) => (
              <div
                key={a.id}
                className="rounded-lg bg-[#1b130f]/90 px-3 py-2 flex flex-col gap-1 border border-amber-900/60 hover:border-amber-500/60 transition-colors"
              >
                <div className="flex justify-between items-center gap-2">
                  <span className="font-semibold text-soft-gold font-modern">
                    {a.title}
                  </span>
                  <div className="flex gap-2 items-center text-[10px]">
                    <button
                      onClick={() => handleEditAnnouncement(a)}
                      className="px-2 py-0.5 rounded-full border border-amber-500/70 text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 font-tech tracking-[0.18em]"
                    >
                      EDIT
                    </button>
                    <button
                      onClick={() => handleToggleActiveAnnouncement(a)}
                      className={`px-2 py-0.5 rounded-full border font-tech tracking-[0.18em] ${
                        a.is_active
                          ? "border-emerald-400 text-emerald-300 bg-emerald-500/10"
                          : "border-amber-700 text-amber-300/80 bg-black/40"
                      }`}
                    >
                      {a.is_active ? "AKTIF" : "NONAKTIF"}
                    </button>
                    <button
                      onClick={() => handleDeleteAnnouncement(a.id)}
                      className="px-2 py-0.5 rounded-full border border-red-500/70 text-red-300 hover:bg-red-500/10 font-tech tracking-[0.18em]"
                    >
                      HAPUS
                    </button>
                  </div>
                </div>
                <div className="text-amber-100/80 text-[11px] font-modern leading-relaxed">
                  {a.content}
                </div>
              </div>
            ))}
            {!announcements.length && (
              <div className="text-amber-100/70 font-modern text-[11px]">
                Belum ada pengumuman. Tambahkan di form kanan.
              </div>
            )}
          </div>
        </div>

        <form
          onSubmit={handleSaveAnnouncement}
          className="relative rounded-xl border border-amber-900/60 bg-[#16100c]/95 backdrop-blur-xl p-4 space-y-2 shadow-[0_24px_60px_rgba(0,0,0,0.95)] overflow-hidden card-lux"
        >
          <div className="absolute inset-0 opacity-[0.07] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div className="font-vintage text-lg text-gold-gradient text-glow-gold">
                {editingAnnId ? "Edit Pengumuman" : "Tambah Pengumuman"}
              </div>
              <div className="h-[1px] w-16 bg-gradient-to-r from-amber-500 to-transparent" />
            </div>

            <div>
              <label className="text-amber-100/80 text-[11px] font-tech">
                JUDUL
              </label>
              <input
                type="text"
                className="mt-1 w-full rounded-lg bg-[#0b0705]/90 px-3 py-1.5 text-xs text-soft-gold border border-amber-900/70 focus:border-amber-400 outline-none font-modern tracking-wide"
                value={newAnn.title}
                maxLength={ANNOUNCEMENT_TITLE_MAX}
                onChange={(e) =>
                  setNewAnn((prev) => ({
                    ...prev,
                    title: e.target.value.slice(0, ANNOUNCEMENT_TITLE_MAX),
                  }))
                }
              />
              <p className="mt-1 text-[10px] text-amber-100/60 text-right">
                {newAnn.title.length}/{ANNOUNCEMENT_TITLE_MAX} karakter
              </p>
            </div>

            <div>
              <label className="text-amber-100/80 text-[11px] font-tech">
                ISI PENGUMUMAN
              </label>
              <textarea
                className="mt-1 w-full rounded-lg bg-[#0b0705]/90 px-3 py-1.5 text-xs text-soft-gold border border-amber-900/70 focus:border-amber-400 outline-none min-h-[90px]"
                value={newAnn.content}
                maxLength={ANNOUNCEMENT_CONTENT_MAX}
                onChange={(e) =>
                  setNewAnn((prev) => ({
                    ...prev,
                    content: e.target.value.slice(0, ANNOUNCEMENT_CONTENT_MAX),
                  }))
                }
              />
              <p className="mt-1 text-[10px] text-amber-100/60 text-right">
                {newAnn.content.length}/{ANNOUNCEMENT_CONTENT_MAX} karakter
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={loadingAnn}
                className="rounded-xl bg-amber-400 px-4 py-1.5 text-[11px] font-tech tracking-[0.25em] text-[#2b190b] hover:bg-amber-300 disabled:opacity-60 uppercase shadow-[0_0_20px_rgba(251,191,36,0.5)]"
              >
                {loadingAnn
                  ? "MENYIMPAN..."
                  : editingAnnId
                  ? "UPDATE PENGUMUMAN"
                  : "SIMPAN PENGUMUMAN"}
              </button>
              {editingAnnId && (
                <button
                  type="button"
                  onClick={handleCancelAnnouncement}
                  className="rounded-xl border border-amber-500/70 px-4 py-1.5 text-[11px] font-tech tracking-[0.25em] text-amber-200 hover:bg-amber-500/10"
                >
                  BATAL
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </section>
  );

  const renderBarbers = () => (
    <section className="grid grid-cols-1 lg:grid-cols-[1.1fr,1fr] gap-4 text-xs">
      <div className="relative rounded-xl border border-amber-900/60 bg-[#16100c]/95 backdrop-blur-xl p-4 shadow-[0_24px_60px_rgba(0,0,0,0.95)] overflow-hidden card-lux">
        <div className="absolute inset-0 opacity-[0.07] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="font-vintage text-lg text-gold-gradient text-glow-gold">
                Daftar Barber ({barbers.length})
              </div>
            </div>
          </div>

          <div className="max-h-[60vh] overflow-y-auto space-y-2 pr-1 custom-scroll">
            {barbers.map((b) => (
              <div
                key={b.id}
                className="rounded-lg bg-[#1b130f]/90 px-3 py-2 flex justify-between items-start gap-3 border border-amber-900/60 hover:border-amber-500/60 transition-colors"
              >
                <div className="space-y-0.5">
                  <div className="font-semibold text-soft-gold font-modern">
                    {b.display_name}
                  </div>
                  <div className="text-amber-100/75 text-[11px]">
                    User: {b.user?.name} ({b.user?.email})
                  </div>
                  <div className="text-amber-100/70 text-[11px]">
                    {b.skill_level || "Skill level belum diisi"} ·{" "}
                    <span className="text-amber-300">
                      Rp{" "}
                      {Number(b.base_price || 0).toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-2">
                  <button
                    type="button"
                    onClick={() => handleEditBarber(b)}
                    className="text-[11px] rounded-lg border border-amber-400/70 px-2 py-1 text-amber-200 hover:bg-amber-500/10 font-tech tracking-[0.18em]"
                  >
                    EDIT
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteBarber(b.id)}
                    className="text-[11px] rounded-lg border border-red-500/70 px-2 py-1 text-red-300 hover:bg-red-500/10 font-tech tracking-[0.18em]"
                  >
                    HAPUS
                  </button>
                </div>
              </div>
            ))}
            {!barbers.length && (
              <div className="text-amber-100/75 font-modern">
                Belum ada barber.
              </div>
            )}
          </div>
        </div>
      </div>

      <form
        onSubmit={handleCreateBarber}
        className="relative rounded-xl border border-amber-900/60 bg-[#16100c]/95 backdrop-blur-xl p-4 space-y-2 shadow-[0_24px_60px_rgba(0,0,0,0.95)] overflow-hidden card-lux"
      >
        <div className="absolute inset-0 opacity-[0.07] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-2 gap-3">
            <div>
              <div className="font-vintage text-lg text-gold-gradient text-glow-gold">
                {editingBarberId ? "Edit Barber" : "Tambah Barber Baru"}
              </div>
              {editingBarberId && (
                <div className="mt-1 text-[11px] text-amber-100/80 font-modern">
                  Mengubah display name, level, atau base price. Tekan batal untuk kembali menambah barber baru.
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {editingBarberId && (
                <button
                  type="button"
                  onClick={handleCancelBarber}
                  className="rounded-lg border border-amber-400/70 px-3 py-1 text-[10px] font-tech tracking-[0.2em] text-amber-200 hover:bg-amber-400/10"
                >
                  BATAL
                </button>
              )}
              <div className="h-[1px] w-12 bg-gradient-to-r from-amber-500 to-transparent" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <div>
              <label className="text-[11px] text-amber-100/80 font-tech">
                NAMA USER (LOGIN)
              </label>
              <input
                className="mt-1 w-full rounded-lg bg-[#0b0705]/90 px-3 py-1.5 text-xs text-soft-gold border border-amber-900/70 focus:border-amber-400 outline-none font-modern tracking-wide"
                value={newBarber.name}
                maxLength={BARBER_NAME_MAX}
                disabled={!!editingBarberId}
                onChange={(e) => {
                  // hanya huruf A-Z / a-z + spasi
                  let value = e.target.value.replace(/[^A-Za-z ]/g, "");
                  if (value.length > BARBER_NAME_MAX) {
                    value = value.slice(0, BARBER_NAME_MAX);
                  }
                  setNewBarber((p) => ({ ...p, name: value }));
                }}
                required
              />
            </div>
              <div>
                <label className="text-[11px] text-amber-100/80 font-tech">
                  EMAIL
                </label>
                <input
                  type="text"
                  className="mt-1 w-full rounded-lg bg-[#0b0705]/90 px-3 py-1.5 text-xs text-soft-gold border border-amber-900/70 focus:border-amber-400 outline-none font-modern tracking-wide"
                  value={newBarber.email}
                  maxLength={BARBER_EMAIL_MAX}
                  disabled={!!editingBarberId}
                  onChange={(e) => {
                    // paksa lowercase + hanya karakter yang diizinkan
                    let value = e.target.value.toLowerCase();
                    value = value.replace(/[^a-z0-9@._-]/g, "");
                    if (value.length > BARBER_EMAIL_MAX) {
                      value = value.slice(0, BARBER_EMAIL_MAX);
                    }
                    setNewBarber((p) => ({ ...p, email: value }));
                  }}
                  required
                />
              </div>
                <div>
                  <label className="text-[11px] text-amber-100/80 font-tech">
                    NO. HP
                  </label>
                  <input
                    className="mt-1 w-full rounded-lg bg-[#0b0705]/90 px-3 py-1.5 text-xs text-soft-gold border border-amber-900/70 focus:border-amber-400 outline-none font-modern tracking-wide"
                    value={newBarber.phone}
                    inputMode="numeric"
                    maxLength={BARBER_PHONE_MAX}
                    disabled={!!editingBarberId}
                    onChange={(e) => {
                      // hanya angka 0-9, maksimal 16 digit
                      let value = e.target.value.replace(/\D/g, "");
                      if (value.length > BARBER_PHONE_MAX) {
                        value = value.slice(0, BARBER_PHONE_MAX);
                      }
                      setNewBarber((p) => ({ ...p, phone: value }));
                    }}
                  />
                </div>
            <div>
              <label className="text-[11px] text-amber-100/80 font-tech">
                PASSWORD
              </label>
                <input
                  type="password"
                  className="mt-1 w-full rounded-lg bg-[#0b0705]/90 px-3 py-1.5 text-xs text-soft-gold border border-amber-900/70 focus:border-amber-400 outline-none font-modern tracking-wide"
                  value={newBarber.password}
                  disabled={!!editingBarberId}
                  onChange={(e) =>
                    setNewBarber((p) => ({ ...p, password: e.target.value }))
                  }
                  minLength={8}
                  required={!editingBarberId}
                />
            </div>
              <div>
                <label className="text-[11px] text-amber-100/80 font-tech">
                  DISPLAY NAME (DI FRONTEND)
                </label>
                <input
                  className="mt-1 w-full rounded-lg bg-[#0b0705]/90 px-3 py-1.5 text-xs text-soft-gold border border-amber-900/70 focus:border-amber-400 outline-none font-modern tracking-wide"
                  value={newBarber.display_name}
                  maxLength={BARBER_DISPLAY_MAX}
                  onChange={(e) => {
                    // hanya huruf A-Z / a-z + spasi
                    let value = e.target.value.replace(/[^A-Za-z ]/g, "");
                    if (value.length > BARBER_DISPLAY_MAX) {
                      value = value.slice(0, BARBER_DISPLAY_MAX);
                    }
                    setNewBarber((p) => ({
                      ...p,
                      display_name: value,
                    }));
                  }}
                  required
                />
              </div>
            <div>
              <label className="text-[11px] text-amber-100/80 font-tech">
                SKILL LEVEL
              </label>
              {/* ⬅️ sekarang pakai select tingkatan barber */}
              <select
                className="mt-1 w-full rounded-lg bg-[#0b0705]/90 px-3 py-1.5 text-xs text-soft-gold border border-amber-900/70 focus:border-amber-400 outline-none font-modern tracking-wide"
                value={newBarber.skill_level}
                onChange={(e) =>
                  setNewBarber((p) => ({
                    ...p,
                    skill_level: e.target.value,
                  }))
                }
              >
                <option value="">Pilih level</option>
                <option value="TOP RATED">TOP RATED</option>
                <option value="Senior Barber">Senior Barber</option>
                <option value="Barber">Barber</option>
                <option value="Junior Barber">Junior Barber</option>
                <option value="Apprentice">Apprentice</option>
              </select>
            </div>
              <div>
                <label className="text-[11px] text-amber-100/80 font-tech">
                  BASE PRICE (RUPIAH)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  className="mt-1 w-full rounded-lg bg-[#0b0705]/90 px-3 py-1.5 text-xs text-soft-gold border border-amber-900/70 focus:border-amber-400 outline-none font-modern tracking-wide"
                  value={newBarber.base_price}
                  onChange={(e) => {
                    // hanya angka 0-9, tanpa titik/koma/spasi
                    let value = e.target.value.replace(/\D/g, "");
                    setNewBarber((p) => ({
                      ...p,
                      base_price: value,
                    }));
                  }}
                />
              </div>
          </div>
          <div className="mt-2 flex gap-2">
            <button
              type="submit"
              className="rounded-xl bg-emerald-500 px-4 py-1.5 text-[11px] font-tech font-semibold text-[#061308] hover:bg-emerald-400 tracking-[0.18em] uppercase shadow-[0_0_20px_rgba(16,185,129,0.55)]"
            >
              {editingBarberId ? "UPDATE BARBER" : "SIMPAN BARBER"}
            </button>
            {editingBarberId && (
              <button
                type="button"
                onClick={handleCancelBarber}
                className="rounded-xl border border-amber-400/70 px-4 py-1.5 text-[11px] font-tech font-semibold text-amber-200 hover:bg-amber-400/10 tracking-[0.18em] uppercase"
              >
                BATAL EDIT
              </button>
            )}
          </div>
        </div>
      </form>
    </section>
  );

  const renderCustomers = () => (
    <section className="grid grid-cols-1 lg:grid-cols-[1.1fr,1fr] gap-4 text-xs">
      <div className="relative rounded-xl border border-amber-900/60 bg-[#16100c]/95 backdrop-blur-xl p-4 shadow-[0_24px_60px_rgba(0,0,0,0.95)] overflow-hidden card-lux">
        <div className="absolute inset-0 opacity-[0.07] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="font-vintage text-lg text-gold-gradient text-glow-gold">
                Daftar Pelanggan ({customers.length})
              </div>
            </div>
          </div>

          <div className="max-h-[60vh] overflow-y-auto space-y-2 pr-1 custom-scroll">
            {customers.map((c) => (
              <div
                key={c.id}
                className="rounded-lg bg-[#1b130f]/90 px-3 py-2 border border-amber-900/60 hover:border-amber-500/60 transition-colors flex justify-between items-start gap-3"
              >
                <div>
                  <div className="font-semibold text-soft-gold font-modern">
                    {c.name}
                  </div>
                  <div className="text-amber-100/75 text-[11px]">
                    {c.email} · {c.phone || "No. HP belum diisi"}
                  </div>
                  <div className="text-amber-100/70 text-[11px]">
                    ID: {c.id}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-2">
                  <button
                    type="button"
                    onClick={() => handleEditCustomer(c)}
                    className="h-fit text-[10px] rounded-lg border border-amber-400/70 px-2 py-1 text-amber-200 hover:bg-amber-500/10 font-tech tracking-[0.18em]"
                  >
                    EDIT
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteCustomer(c.id)}
                    className="h-fit text-[10px] rounded-lg border border-red-500/70 px-2 py-1 text-red-300 hover:bg-red-500/10 font-tech tracking-[0.18em]"
                  >
                    HAPUS
                  </button>
                </div>
              </div>
            ))}
            {!customers.length && (
              <div className="text-amber-100/75 font-modern">
                Belum ada customer.
              </div>
            )}
          </div>
        </div>
      </div>

      <form
        onSubmit={handleCreateCustomer}
        className="relative rounded-xl border border-amber-900/60 bg-[#16100c]/95 backdrop-blur-xl p-4 space-y-2 shadow-[0_24px_60px_rgba(0,0,0,0.95)] overflow-hidden card-lux"
      >
        <div className="absolute inset-0 opacity-[0.07] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-2 gap-3">
            <div>
              <div className="font-vintage text-lg text-gold-gradient text-glow-gold">
                {editingCustomerId ? "Edit Customer" : "Tambah Customer"}
              </div>
              {editingCustomerId && (
                <div className="mt-1 text-[11px] text-amber-100/80 font-modern">
                  Hanya nama dan no. HP yang bisa diubah di sini. Tekan batal untuk kembali ke mode tambah.
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {editingCustomerId && (
                <button
                  type="button"
                  onClick={handleCancelCustomer}
                  className="rounded-lg border border-amber-400/70 px-3 py-1 text-[10px] font-tech tracking-[0.2em] text-amber-200 hover:bg-amber-400/10"
                >
                  BATAL
                </button>
              )}
              <div className="h-[1px] w-12 bg-gradient-to-r from-amber-500 to-transparent" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <div>
              <label className="text-[11px] text-amber-100/80 font-tech">
                NAMA
              </label>
              <input
                className="mt-1 w-full rounded-lg bg-[#0b0705]/90 px-3 py-1.5 text-xs text-soft-gold border border-amber-900/70 focus:border-amber-400 outline-none font-modern tracking-wide"
                value={newCustomer.name}
                maxLength={CUSTOMER_NAME_MAX}
                onChange={(e) => {
                  // hanya huruf A-Z / a-z + spasi
                  let value = e.target.value.replace(/[^A-Za-z ]/g, "");
                  if (value.length > CUSTOMER_NAME_MAX) {
                    value = value.slice(0, CUSTOMER_NAME_MAX);
                  }
                  setNewCustomer((p) => ({ ...p, name: value }));
                }}
                required
              />
            </div>
            <div>
              <label className="text-[11px] text-amber-100/80 font-tech">
                EMAIL
              </label>
              <input
                type="text"
                className="mt-1 w-full rounded-lg bg-[#0b0705]/90 px-3 py-1.5 text-xs text-soft-gold border border-amber-900/70 focus:border-amber-400 outline-none font-modern tracking-wide"
                value={newCustomer.email}
                maxLength={CUSTOMER_EMAIL_MAX}
                disabled={!!editingCustomerId}
                onChange={(e) => {
                  // paksa lowercase, hanya a-z + @ + .
                  let value = e.target.value.toLowerCase();
                  value = value.replace(/[^a-z@.]/g, "");
                  if (value.length > CUSTOMER_EMAIL_MAX) {
                    value = value.slice(0, CUSTOMER_EMAIL_MAX);
                  }
                  setNewCustomer((p) => ({ ...p, email: value }));
                }}
                placeholder="contoh: johndoe@barber.com"
                required={!editingCustomerId}
              />
            </div>
            <div>
              <label className="text-[11px] text-amber-100/80 font-tech">
                NO. HP
              </label>
              <input
                className="mt-1 w-full rounded-lg bg-[#0b0705]/90 px-3 py-1.5 text-xs text-soft-gold border border-amber-900/70 focus:border-amber-400 outline-none font-modern tracking-wide"
                value={newCustomer.phone}
                inputMode="numeric"
                maxLength={CUSTOMER_PHONE_MAX}
                onChange={(e) => {
                  // hanya angka 0-9, maksimal 16 digit
                  let value = e.target.value.replace(/\D/g, "");
                  if (value.length > CUSTOMER_PHONE_MAX) {
                    value = value.slice(0, CUSTOMER_PHONE_MAX);
                  }
                  setNewCustomer((p) => ({ ...p, phone: value }));
                }}
              />
            </div>
            <div>
              <label className="text-[11px] text-amber-100/80 font-tech">
                PASSWORD
              </label>
                <input
                  type="password"
                  className="mt-1 w-full rounded-lg bg-[#0b0705]/90 px-3 py-1.5 text-xs text-soft-gold border border-amber-900/70 focus:border-amber-400 outline-none font-modern tracking-wide"
                  value={newCustomer.password}
                  disabled={!!editingCustomerId}
                  onChange={(e) =>
                    setNewCustomer((p) => ({
                      ...p,
                      password: e.target.value,
                    }))
                  }
                  minLength={8}
                  required={!editingCustomerId}
                />
            </div>
          </div>

          <div className="mt-2 flex gap-2">
            <button
              type="submit"
              className="rounded-xl bg-amber-400 px-4 py-1.5 text-[11px] font-tech font-semibold text-[#2b190b] hover:bg-amber-300 tracking-[0.18em] uppercase shadow-[0_0_20px_rgba(251,191,36,0.55)]"
            >
              {editingCustomerId ? "UPDATE CUSTOMER" : "SIMPAN CUSTOMER"}
            </button>
            {editingCustomerId && (
              <button
                type="button"
                onClick={handleCancelCustomer}
                className="rounded-xl border border-amber-400/70 px-4 py-1.5 text-[11px] font-tech font-semibold text-amber-200 hover:bg-amber-400/10 tracking-[0.18em] uppercase"
              >
                BATAL EDIT
              </button>
            )}
          </div>
        </div>
      </form>
    </section>
  );

  const renderBusinessHours = () => (
    <section className="space-y-4 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="font-tech text-[10px] text-amber-500/90">
            KONFIGURASI JAM OPERASIONAL
          </div>
          <div className="font-vintage text-lg text-gold-gradient text-glow-gold">
            Business Hours
          </div>
          <div className="text-[11px] text-amber-100/75 font-modern max-w-xl">
            Atur jam buka/tutup per hari.
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCloseShop}
            disabled={businessLoading}
            className="rounded-full border border-red-500/70 bg-red-500/10 px-3 py-1 text-[11px] font-tech tracking-[0.18em] text-red-200 hover:bg-red-500/20 disabled:opacity-60"
          >
            TUTUP SEMENTARA
          </button>
          <button
            type="button"
            onClick={handleOpenShopDefault}
            disabled={businessLoading}
            className="rounded-full border border-emerald-500/70 bg-emerald-500/10 px-3 py-1 text-[11px] font-tech tracking-[0.18em] text-emerald-200 hover:bg-emerald-500/20 disabled:opacity-60"
          >
            BUKA 07:00–21:00
          </button>
        </div>
      </div>

      <div className="relative rounded-xl border border-amber-900/60 bg-[#16100c]/95 backdrop-blur-xl p-4 shadow-[0_24px_60px_rgba(0,0,0,0.95)] overflow-hidden card-lux">
        <div className="absolute inset-0 opacity-[0.07] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        <div className="relative z-10 overflow-x-auto custom-scroll">
          <table className="min-w-full text-[11px] font-modern">
            <thead>
              <tr className="text-amber-300/90 border-b border-amber-900/60">
                <th className="text-left py-2 pr-3 font-normal">Hari</th>
                <th className="text-left py-2 pr-3 font-normal">Buka</th>
                <th className="text-left py-2 pr-3 font-normal">Tutup</th>
                <th className="text-left py-2 pr-3 font-normal">Closed</th>
                <th className="text-left py-2 pr-3 font-normal">Override</th>
              </tr>
            </thead>
            <tbody>
              {businessHours.map((h) => (
                <tr
                  key={h.id}
                  className="border-b border-amber-900/40 last:border-b-0"
                >
                  <td className="py-2 pr-3 text-soft-gold">
                    {dayNames[h.day_of_week] ?? `Hari ${h.day_of_week}`}
                  </td>
                  <td className="py-2 pr-3">
                    <input
                      type="time"
                      value={h.open_time || ""}
                      disabled={h.is_closed}
                      onChange={(e) =>
                        handleUpdateHourToggle(
                          h,
                          "open_time",
                          e.target.value
                        )
                      }
                      className="bg-[#0b0705]/90 border border-amber-900/70 rounded px-2 py-1 text-xs text-soft-gold outline-none focus:border-amber-400"
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <input
                      type="time"
                      value={h.close_time || ""}
                      disabled={h.is_closed}
                      onChange={(e) =>
                        handleUpdateHourToggle(
                          h,
                          "close_time",
                          e.target.value
                        )
                      }
                      className="bg-[#0b0705]/90 border border-amber-900/70 rounded px-2 py-1 text-xs text-soft-gold outline-none focus:border-amber-400"
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <input
                      type="checkbox"
                      checked={!!h.is_closed}
                      onChange={(e) =>
                        handleUpdateHourToggle(
                          h,
                          "is_closed",
                          e.target.checked
                        )
                      }
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <input
                      type="checkbox"
                      checked={!!h.is_override}
                      onChange={(e) =>
                        handleUpdateHourToggle(
                          h,
                          "is_override",
                          e.target.checked
                        )
                      }
                    />
                  </td>
                </tr>
              ))}
              {!businessHours.length && (
                <tr>
                  <td
                    colSpan={5}
                    className="py-3 text-amber-100/75 text-center"
                  >
                    Belum ada konfigurasi jam buka.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {businessLoading && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-[11px] font-tech tracking-[0.25em] text-amber-200">
            UPDATING...
          </div>
        )}
      </div>
    </section>
  );

  const renderPayments = () => (
    <section className="space-y-4 text-xs">
      <div>
        <div className="font-tech text-[10px] text-amber-500/90">
          TRANSAKSI ONLINE
        </div>
        <div className="font-vintage text-lg text-gold-gradient text-glow-gold">
          Payments
        </div>
        <div className="text-[11px] text-amber-100/75 font-modern max-w-xl">
          Daftar pembayaran dari gateway (Midtrans).
        </div>
      </div>

      <div className="relative rounded-xl border border-amber-900/60 bg-[#16100c]/95 backdrop-blur-xl p-4 shadow-[0_24px_60px_rgba(0,0,0,0.95)] overflow-hidden card-lux">
        <div className="absolute inset-0 opacity-[0.07] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        <div className="relative z-10 overflow-x-auto custom-scroll">
          <table className="min-w-full text-[11px] font-modern">
            <thead>
              <tr className="text-amber-300/90 border-b border-amber-900/60">
                <th className="text-left py-2 pr-3 font-normal">ID</th>
                <th className="text-left py-2 pr-3 font-normal">
                  Order / Booking
                </th>
                <th className="text-left py-2 pr-3 font-normal">Status</th>
                <th className="text-left py-2 pr-3 font-normal">Amount</th>
                <th className="text-left py-2 pr-3 font-normal">Tipe</th>
                <th className="text-left py-2 pr-3 font-normal">Waktu</th>
                <th className="text-left py-2 pr-3 font-normal">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-amber-900/40 last:border-b-0"
                >
                  <td className="py-2 pr-3 text-soft-gold">{p.id}</td>
                  <td className="py-2 pr-3 text-amber-100/80">
                    {p.midtrans_order_id || (p.booking && p.booking.code) || "-"}
                  </td>
                  <td className="py-2 pr-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-tech tracking-[0.18em] ${
                        (p.transaction_status || p.status) === "settlement"
                          ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/70"
                          : "bg-amber-500/10 text-amber-200 border border-amber-500/60"
                      }`}
                    >
                      {p.transaction_status || p.status || "N/A"}
                    </span>
                  </td>
                  <td className="py-2 pr-3 text-amber-100/80">
                    {p.gross_amount || p.amount
                      ? "Rp " +
                        Number(
                          p.gross_amount || p.amount
                        ).toLocaleString("id-ID")
                      : "-"}
                  </td>
                  <td className="py-2 pr-3 text-amber-100/80">
                    {p.payment_type || "-"}
                  </td>
                  <td className="py-2 pr-3 text-amber-100/70">
                    {p.created_at || "-"}
                  </td>
                  <td className="py-2 pr-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenPaymentDetail(p.id)}
                        className="rounded-full border border-amber-500/70 bg-amber-500/10 px-3 py-1 text-[10px] font-tech tracking-[0.18em] text-amber-200 hover:bg-amber-500/20"
                      >
                        DETAIL
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePayment(p.id)}
                        className="rounded-full border border-red-500/70 bg-red-500/10 px-3 py-1 text-[10px] font-tech tracking-[0.18em] text-red-200 hover:bg-red-500/20"
                      >
                        HAPUS
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!payments.length && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-3 text-center text-amber-100/75"
                  >
                    Belum ada data pembayaran.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Detail Modal */}
      <AnimatePresence>
        {paymentModalOpen && paymentDetail && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.92, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 10, opacity: 0 }}
              className="w-full max-w-lg rounded-2xl border border-amber-900/70 bg-[#17100c]/95 p-4 shadow-[0_24px_60px_rgba(0,0,0,0.95)] relative overflow-hidden text-xs card-lux"
            >
              <div className="absolute inset-0 opacity-[0.07] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
              <div className="relative z-10 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-tech text-[10px] text-amber-500/90">
                      PAYMENT DETAIL
                    </div>
                    <div className="font-vintage text-lg text-gold-gradient text-glow-gold">
                      {paymentDetail.midtrans_order_id ||
                        paymentDetail.booking?.code ||
                        "Detail Pembayaran"}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleClosePaymentModal}
                    className="rounded-full border border-amber-500/60 bg-amber-500/10 px-2 py-1 text-[10px] font-tech tracking-[0.18em] text-amber-200 hover:bg-amber-500/20"
                  >
                    CLOSE
                  </button>
                </div>
                <div className="h-px bg-gradient-to-r from-amber-500/50 via-amber-500/10 to-transparent my-2" />
                <div className="space-y-2 text-amber-100/80 font-modern">
                  {editingPayment && (
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <label className="text-amber-100/80 font-tech text-[10px]">
                          Status
                        </label>
                        <input
                          className="mt-1 w-full rounded-lg bg-[#0b0705]/90 px-3 py-1.5 text-xs text-soft-gold border border-amber-900/70 focus:border-amber-400 outline-none"
                          value={editingPayment.transaction_status || ""}
                          onChange={(e) =>
                            setEditingPayment((p) => ({
                              ...p,
                              transaction_status: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <label className="text-amber-100/80 font-tech text-[10px]">
                          Tipe
                        </label>
                        <input
                          className="mt-1 w-full rounded-lg bg-[#0b0705]/90 px-3 py-1.5 text-xs text-soft-gold border border-amber-900/70 focus:border-amber-400 outline-none"
                          value={editingPayment.payment_type || ""}
                          onChange={(e) =>
                            setEditingPayment((p) => ({
                              ...p,
                              payment_type: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <label className="text-amber-100/80 font-tech text-[10px]">
                          Gross Amount
                        </label>
                        <input
                          className="mt-1 w-full rounded-lg bg-[#0b0705]/90 px-3 py-1.5 text-xs text-soft-gold border border-amber-900/70 focus:border-amber-400 outline-none"
                          value={editingPayment.gross_amount || ""}
                          onChange={(e) =>
                            setEditingPayment((p) => ({
                              ...p,
                              gross_amount: e.target.value.replace(/\\D/g, ""),
                            }))
                          }
                        />
                      </div>
                      <div>
                        <label className="text-amber-100/80 font-tech text-[10px]">
                          Fraud Status
                        </label>
                        <input
                          className="mt-1 w-full rounded-lg bg-[#0b0705]/90 px-3 py-1.5 text-xs text-soft-gold border border-amber-900/70 focus:border-amber-400 outline-none"
                          value={editingPayment.fraud_status || ""}
                          onChange={(e) =>
                            setEditingPayment((p) => ({
                              ...p,
                              fraud_status: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="col-span-2 flex gap-2">
                        <button
                          type="button"
                          onClick={handleUpdatePayment}
                          className="rounded-lg bg-emerald-500 px-3 py-1.5 text-[10px] font-tech tracking-[0.18em] text-[#061308] hover:bg-emerald-400"
                        >
                          SIMPAN PERUBAHAN
                        </button>
                        <button
                          type="button"
                          onClick={handleClosePaymentModal}
                          className="rounded-lg border border-amber-500/60 px-3 py-1.5 text-[10px] font-tech text-amber-200 hover:bg-amber-500/10"
                        >
                          BATAL
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="max-h-80 overflow-y-auto custom-scroll">
                    <pre className="whitespace-pre-wrap break-all text-[11px] bg-black/30 rounded-lg p-2 border border-amber-900/70">
                      {JSON.stringify(paymentDetail, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );

  const renderAccessLogs = () => (
    <section className="space-y-4 text-xs">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="font-tech text-[10px] text-amber-500/90">
            KEAMANAN & AUDIT
          </div>
          <div className="font-vintage text-lg text-gold-gradient text-glow-gold">
            Access Logs ({accessLogs.length})
          </div>
          <div className="text-[11px] text-amber-100/75 font-modern max-w-xl">
            Daftar akses login / aktivitas penting, termasuk IP dan user agent.
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={reloadAccessLogs}
            className="rounded-lg border border-amber-400/70 px-3 py-1 text-[10px] font-tech tracking-[0.2em] text-amber-200 hover:bg-amber-400/10"
          >
            REFRESH
          </button>
          <button
            type="button"
            onClick={handleClearAccessLogs}
            className="rounded-lg border border-red-500/70 px-3 py-1 text-[10px] font-tech tracking-[0.2em] text-red-200 hover:bg-red-500/10"
          >
            HAPUS SEMUA
          </button>
        </div>
      </div>

      <div className="relative rounded-xl border border-amber-900/60 bg-[#16100c]/95 backdrop-blur-xl p-4 shadow-[0_24px_60px_rgba(0,0,0,0.95)] overflow-hidden card-lux">
        <div className="absolute inset-0 opacity-[0.07] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        <div className="relative z-10 max-h-[65vh] overflow-y-auto custom-scroll space-y-2">
          {accessLogs.map((log) => (
            <div
              key={log.id}
              className="rounded-lg border border-amber-900/60 bg-[#1b130f]/90 px-3 py-2"
            >
              <div className="flex flex-wrap justify-between gap-2">
                <div className="font-modern text-soft-gold text-[11px]">
                  {log.user_name || "-"}{" "}
                  <span className="text-amber-300/80">
                    ({log.user_email || "unknown"})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-[10px] font-tech text-amber-200/90">
                    {log.created_at || "-"}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteAccessLog(log.id)}
                    className="rounded-lg border border-red-500/70 px-2 py-1 text-[10px] font-tech tracking-[0.18em] text-red-300 hover:bg-red-500/10"
                  >
                    HAPUS
                  </button>
                </div>
              </div>
              <div className="text-[10px] text-amber-100/70 mt-0.5">
                {log.method || "-"} · {log.path || "-"}
              </div>
              <div className="text-[11px] text-amber-100/80">
                IP: {log.ip_address || "-"}
              </div>
              <div className="text-[10px] text-amber-100/70 mt-0.5 break-all">
                Agent: {log.user_agent || "-"}
              </div>
            </div>
          ))}
          {!accessLogs.length && (
            <div className="text-amber-100/75 font-modern">
              Belum ada log akses.
            </div>
          )}
        </div>
      </div>
    </section>
  );

  const renderCatalog = () => (
    <section className="space-y-4 text-xs">
      <div>
        <div className="font-tech text-[10px] text-amber-500/90">
          KATALOG LAYANAN
        </div>
        <div className="font-vintage text-lg text-gold-gradient text-glow-gold">
          Catalog
        </div>
        <div className="text-[11px] text-amber-100/75 font-modern max-w-3xl">
          Atur layanan, gaya rambut, kupon, dan promo dari satu tempat.
        </div>
      </div>

      {/* SERVICES */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr,1fr] gap-4">
        <div className="relative rounded-xl border border-amber-900/60 bg-[#16100c]/95 p-4 shadow-[0_24px_60px_rgba(0,0,0,0.95)] overflow-hidden card-lux">
          <div className="absolute inset-0 opacity-[0.07] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div className="font-vintage text-lg text-gold-gradient text-glow-gold">
                Services ({services.length})
              </div>
            </div>
            <div className="max-h-[40vh] overflow-y-auto custom-scroll space-y-2">
              {services.map((s) => (
                <div
                  key={s.id}
                  className="rounded-lg border border-amber-900/60 bg-[#1b130f]/90 px-3 py-2 flex justify-between gap-2"
                >
                  <div>
                    <div className="font-modern text-soft-gold text-[11px] font-semibold">
                      {s.name}
                    </div>
                    <div className="text-[11px] text-amber-100/75">
                      {s.description}
                    </div>
                    <div className="text-[11px] text-amber-100/80 mt-1">
                      Durasi:{" "}
                      <span className="text-amber-300">
                        {s.duration_minutes} menit
                      </span>{" "}
                      · Harga:{" "}
                      <span className="text-emerald-300">
                        Rp{" "}
                        {Number(s.base_price || 0).toLocaleString("id-ID")}
                      </span>{" "}
                      {s.is_bundle && (
                        <span className="ml-1 text-[10px] px-2 py-[1px] rounded-full border border-amber-500/60 bg-amber-500/10 text-amber-200">
                          Bundle
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditService(s)}
                      className="h-fit text-[10px] rounded-lg border border-amber-400/70 px-2 py-1 text-amber-200 hover:bg-amber-500/10 font-tech tracking-[0.18em]"
                    >
                      EDIT
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteService(s.id)}
                      className="h-fit text-[10px] rounded-lg border border-red-500/70 px-2 py-1 text-red-300 hover:bg-red-500/10 font-tech tracking-[0.18em]"
                    >
                      HAPUS
                    </button>
                  </div>
                </div>
              ))}
              {!services.length && (
                <div className="text-amber-100/75 font-modern">
                  Belum ada service terdaftar.
                </div>
              )}
            </div>
          </div>
        </div>

        <form
          onSubmit={handleCreateService}
          className="relative rounded-xl border border-amber-900/60 bg-[#16100c]/95 p-4 shadow-[0_24px_60px_rgba(0,0,0,0.95)] overflow-hidden space-y-2 card-lux"
        >
          <div className="absolute inset-0 opacity-[0.07] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-2 gap-3">
              <div>
                <div className="font-vintage text-lg text-gold-gradient text-glow-gold">
                  {editingServiceId ? "Edit Service" : "Tambah Service"}
                </div>
                {editingServiceId && (
                  <div className="mt-1 text-[11px] text-amber-100/80 font-modern">
                    Ubah nama, deskripsi, harga, durasi, atau bundle. Tekan batal untuk kembali ke mode tambah.
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {editingServiceId && (
                  <button
                    type="button"
                    onClick={handleCancelService}
                    className="rounded-lg border border-amber-400/70 px-3 py-1 text-[10px] font-tech tracking-[0.2em] text-amber-200 hover:bg-amber-400/10"
                  >
                    BATAL
                  </button>
                )}
                <div className="h-[1px] w-12 bg-gradient-to-r from-amber-500 to-transparent" />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <div>
                <label className="text-[11px] text-amber-100/80 font-tech">
                  NAMA
                </label>
                <input
                  className="mt-1 w-full rounded-lg bg-[#0b0705]/90 px-3 py-1.5 text-xs text-soft-gold border border-amber-900/70 focus:border-amber-400 outline-none"
                  value={newService.name}
                  maxLength={CATALOG_NAME_MAX}
                  onChange={(e) => {
                    let value = e.target.value.replace(/[^A-Za-z ]/g, "");
                    if (value.length > CATALOG_NAME_MAX) {
                      value = value.slice(0, CATALOG_NAME_MAX);
                    }
                    setNewService((p) => ({ ...p, name: value }));
                  }}
                  required
                />
              </div>
              <div>
                <label className="text-[11px] text-amber-100/80 font-tech">
                  DESKRIPSI
                </label>
                <textarea
                  className="mt-1 w-full rounded-lg bg-[#0b0705]/90 px-3 py-1.5 text-xs text-soft-gold border border-amber-900/70 focus:border-amber-400 outline-none min-h-[60px]"
                  value={newService.description}
                  maxLength={CATALOG_DESC_MAX}
                  onChange={(e) => {
                    let value = e.target.value;
                    if (value.length > CATALOG_DESC_MAX) {
                      value = value.slice(0, CATALOG_DESC_MAX);
                    }
                    setNewService((p) => ({
                      ...p,
                      description: value,
                    }));
                  }}
                />
                <p className="mt-1 text-[10px] text-amber-100/60 text-right">
                  {newService.description.length}/{CATALOG_DESC_MAX} karakter
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {/* HARGA */}
                <div>
                  <label className="text-[11px] text-amber-100/80 font-tech">
                    HARGA (RP)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="mt-1 w-full rounded-lg bg-[#0b0705]/90 px-3 py-1.5 text-xs text-soft-gold border border-amber-900/70 focus:border-amber-400 outline-none"
                    value={newService.base_price}
                    onChange={(e) => {
                      // hanya angka 0-9
                      let value = e.target.value.replace(/\D/g, "");
                      setNewService((p) => ({
                        ...p,
                        base_price: value,
                      }));
                    }}
                    placeholder="contoh: 75000"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] text-amber-100/80 font-tech">
                    DURASI (MENIT)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="mt-1 w-full rounded-lg bg-[#0b0705]/90 px-3 py-1.5 text-xs text-soft-gold border border-amber-900/70 focus:border-amber-400 outline-none"
                    value={newService.duration_minutes}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, "");
                      // biar nggak kepanjangan, optional batasi 3 digit
                      if (value.length > 3) value = value.slice(0, 3);
                      setNewService((p) => ({
                        ...p,
                        duration_minutes: value,
                      }));
                    }}
                    placeholder="1–180"
                    required
                  />
                  <p className="mt-1 text-[10px] text-amber-100/60">
                    Minimal 1 menit, maksimal 180 menit.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-amber-100/80">
                <input
                  type="checkbox"
                  checked={newService.is_bundle}
                  onChange={(e) =>
                    setNewService((p) => ({
                      ...p,
                      is_bundle: e.target.checked,
                    }))
                  }
                />
                <span>Jadikan paket / bundle</span>
              </div>
            </div>
            <div className="mt-2 flex gap-2">
              <button
                type="submit"
                className="rounded-xl bg-emerald-500 px-4 py-1.5 text-[11px] font-tech font-semibold text-[#061308] hover:bg-emerald-400 tracking-[0.18em] uppercase shadow-[0_0_20px_rgba(16,185,129,0.55)]"
              >
                {editingServiceId ? "UPDATE SERVICE" : "SIMPAN SERVICE"}
              </button>
              {editingServiceId && (
                <button
                  type="button"
                  onClick={handleCancelService}
                  className="rounded-xl border border-amber-400/70 px-4 py-1.5 text-[11px] font-tech font-semibold text-amber-200 hover:bg-amber-400/10 tracking-[0.18em] uppercase"
                >
                  BATAL EDIT
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* HAIRSTYLES */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr,1fr] gap-4">
        <div className="relative rounded-xl border border-amber-900/60 bg-[#16100c]/95 p-4 shadow-[0_24px_60px_rgba(0,0,0,0.95)] overflow-hidden card-lux">
          <div className="absolute inset-0 opacity-[0.07] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div className="font-vintage text-lg text-gold-gradient text-glow-gold">
                Hairstyles ({hairstyles.length})
              </div>
            </div>
            <div className="max-h-[40vh] overflow-y-auto custom-scroll space-y-2">
              {hairstyles.map((h) => (
                <div
                  key={h.id}
                  className="rounded-lg border border-amber-900/60 bg-[#1b130f]/90 px-3 py-2 flex gap-3"
                >
                  {h.image_url && (
                    <div className="w-14 h-14 rounded-md overflow-hidden border border-amber-900/60 bg-black/40 flex-shrink-0">
                      <img
                        src={h.image_url}
                        alt={h.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between gap-2">
                      <div>
                        <div className="font-modern text-soft-gold text-[11px] font-semibold">
                          {h.name}
                        </div>
                        <div className="text-[11px] text-amber-100/75">
                          {h.description}
                        </div>
                        <div className="text-[11px] text-amber-100/80 mt-1">
                          Service:{" "}
                          <span className="text-amber-300">
                            {h.default_service?.name ||
                              h.default_service_id ||
                              "-"}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditHairstyle(h)}
                          className="h-fit text-[10px] rounded-lg border border-amber-400/70 px-2 py-1 text-amber-200 hover:bg-amber-500/10 font-tech tracking-[0.18em]"
                        >
                          EDIT
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteHairstyle(h.id)}
                          className="h-fit text-[10px] rounded-lg border border-red-500/70 px-2 py-1 text-red-300 hover:bg-red-500/10 font-tech tracking-[0.18em]"
                        >
                          HAPUS
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {!hairstyles.length && (
                <div className="text-amber-100/75 font-modern">
                  Belum ada hairstyle terdaftar.
                </div>
              )}
            </div>
          </div>
        </div>

        <form
          onSubmit={handleCreateHairstyle}
          className="relative rounded-xl border border-amber-900/60 bg-[#16100c]/95 p-4 shadow-[0_24px_60px_rgba(0,0,0,0.95)] overflow-hidden space-y-2 card-lux"
        >
          <div className="absolute inset-0 opacity-[0.07] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-2 gap-3">
              <div>
                <div className="font-vintage text-lg text-gold-gradient text-glow-gold">
                  {editingHairstyleId ? "Edit Hairstyle" : "Tambah Hairstyle"}
                </div>
                {editingHairstyleId && (
                  <div className="mt-1 text-[11px] text-amber-100/80 font-modern">
                    Ubah nama, deskripsi, gambar, atau service default. Tekan batal untuk kembali ke mode tambah.
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {editingHairstyleId && (
                  <button
                    type="button"
                    onClick={handleCancelHairstyle}
                    className="rounded-lg border border-amber-400/70 px-3 py-1 text-[10px] font-tech tracking-[0.2em] text-amber-200 hover:bg-amber-400/10"
                  >
                    BATAL
                  </button>
                )}
                <div className="h-[1px] w-12 bg-gradient-to-r from-amber-500 to-transparent" />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {/* NAMA */}
              <div>
                <label className="text-[11px] text-amber-100/80 font-tech">
                  NAMA
                </label>
                <input
                  className="mt-1 w-full rounded-lg bg-[#0b0705]/90 px-3 py-1.5 text-xs text-soft-gold border border-amber-900/70 focus:border-amber-400 outline-none"
                  value={newHairstyle.name}
                  maxLength={CATALOG_NAME_MAX}
                  onChange={(e) => {
                    let value = e.target.value.replace(/[^A-Za-z ]/g, "");
                    if (value.length > CATALOG_NAME_MAX) {
                      value = value.slice(0, CATALOG_NAME_MAX);
                    }
                    setNewHairstyle((p) => ({ ...p, name: value }));
                  }}
                  required
                />
              </div>

              {/* IMAGE URL */}
              <div>
                <label className="text-[11px] text-amber-100/80 font-tech">
                  IMAGE URL
                </label>
                <input
                  className="mt-1 w-full rounded-lg bg-[#0b0705]/90 px-3 py-1.5 text-xs text-soft-gold border border-amber-900/70 focus:border-amber-400 outline-none"
                  value={newHairstyle.image_url}
                  onChange={(e) =>
                    setNewHairstyle((p) => ({
                      ...p,
                      image_url: e.target.value,
                    }))
                  }
                />
              </div>

              {/* DESKRIPSI */}
              <div>
                <label className="text-[11px] text-amber-100/80 font-tech">
                  DESKRIPSI
                </label>
                <textarea
                  className="mt-1 w-full rounded-lg bg-[#0b0705]/90 px-3 py-1.5 text-xs text-soft-gold border border-amber-900/70 focus:border-amber-400 outline-none min-h-[60px]"
                  value={newHairstyle.description}
                  maxLength={CATALOG_DESC_MAX}
                  onChange={(e) => {
                    let value = e.target.value;
                    if (value.length > CATALOG_DESC_MAX) {
                      value = value.slice(0, CATALOG_DESC_MAX);
                    }
                    setNewHairstyle((p) => ({
                      ...p,
                      description: value,
                    }));
                  }}
                />
                <p className="mt-1 text-[10px] text-amber-100/60 text-right">
                  {newHairstyle.description.length}/{CATALOG_DESC_MAX} karakter
                </p>
              </div>

              {/* DEFAULT SERVICE (dropdown dari services) */}
              <div>
                <label className="text-[11px] text-amber-100/80 font-tech">
                  SERVICE
                </label>
                <select
                  className="mt-1 w-full rounded-lg bg-[#0b0705]/90 px-3 py-1.5 text-xs text-soft-gold border border-amber-900/70 focus:border-amber-400 outline-none"
                  value={newHairstyle.default_service_id}
                  onChange={(e) =>
                    setNewHairstyle((p) => ({
                      ...p,
                      default_service_id: e.target.value,
                    }))
                  }
                >
                  <option value="">— Tidak ada (None) —</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (ID: {s.id})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-2 flex gap-2">
              <button
                type="submit"
                className="rounded-xl bg-amber-400 px-4 py-1.5 text-[11px] font-tech font-semibold text-[#2b190b] hover:bg-amber-300 tracking-[0.18em] uppercase shadow-[0_0_20px_rgba(251,191,36,0.55)]"
              >
                {editingHairstyleId ? "UPDATE HAIRSTYLE" : "SIMPAN HAIRSTYLE"}
              </button>
              {editingHairstyleId && (
                <button
                  type="button"
                  onClick={handleCancelHairstyle}
                  className="rounded-xl border border-amber-400/70 px-4 py-1.5 text-[11px] font-tech font-semibold text-amber-200 hover:bg-amber-400/10 tracking-[0.18em] uppercase"
                >
                  BATAL EDIT
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* COUPONS & PROMOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Coupons */}
        <div className="relative rounded-xl border border-amber-900/60 bg-[#16100c]/95 p-4 shadow-[0_24px_60px_rgba(0,0,0,0.95)] overflow-hidden space-y-2 card-lux">
          <div className="absolute inset-0 opacity-[0.07] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div className="font-vintage text-lg text-gold-gradient text-glow-gold">
                Coupons ({coupons.length})
              </div>
            </div>
            <div className="max-h-[32vh] overflow-y-auto custom-scroll space-y-2 mb-2">
              {coupons.map((c) => {
                const cust = customers.find((cu) => cu.id === c.user_id);
                return (
                  <div
                    key={c.id}
                    className="rounded-lg border border-amber-900/60 bg-[#1b130f]/90 px-3 py-2 flex justify-between gap-2"
                  >
                    <div>
                      <div className="font-modern text-soft-gold text-[11px] font-semibold">
                        {c.code}
                      </div>
                      <div className="text-[11px] text-amber-100/80">
                        {cust ? (
                          <>
                            Customer:{" "}
                            <span className="text-soft-gold">
                              {cust.name} ({cust.email})
                            </span>
                          </>
                        ) : (
                          <>User ID: {c.user_id || "-"}</>
                        )}{" "}
                        · Diskon:{" "}
                        <span className="text-emerald-300">
                          {c.discount_percent}%
                        </span>
                      </div>
                      <div className="text-[10px] text-amber-100/70">
                        Expires: {c.expires_at || "-"} · Reason:{" "}
                        {c.issued_reason || "-"}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditCoupon(c)}
                        className="h-fit text-[10px] rounded-lg border border-amber-400/70 px-2 py-1 text-amber-200 hover:bg-amber-500/10 font-tech tracking-[0.18em]"
                      >
                        EDIT
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCoupon(c.id)}
                        className="h-fit text-[10px] rounded-lg border border-red-500/70 px-2 py-1 text-red-300 hover:bg-red-500/10 font-tech tracking-[0.18em]"
                      >
                        HAPUS
                      </button>
                    </div>
                  </div>
                );
              })}
              {!coupons.length && (
                <div className="text-amber-100/75 font-modern">
                  Belum ada coupon.
                </div>
              )}
            </div>

            <form
              onSubmit={handleCreateCoupon}
              className="grid grid-cols-1 gap-2 text-[11px]"
            >
              <div className="flex items-start justify-between gap-3 mb-1">
                <div>
                  <div className="font-modern text-amber-200/90 text-[11px]">
                    {editingCouponId ? "Edit Coupon" : "Tambah Coupon"}
                  </div>
                  {editingCouponId && (
                    <div className="text-amber-100/80 text-[10px]">
                      Ubah kode, diskon, masa berlaku, atau customer. Tekan batal untuk kembali tambah.
                    </div>
                  )}
                </div>
                {editingCouponId && (
                  <button
                    type="button"
                    onClick={handleCancelCoupon}
                    className="rounded-lg border border-amber-400/70 px-3 py-1 text-[10px] font-tech tracking-[0.2em] text-amber-200 hover:bg-amber-400/10"
                  >
                    BATAL
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {/* CUSTOMER */}
                <div>
                  <label className="text-amber-100/80 font-tech">
                    CUSTOMER
                  </label>
                  <select
                    className="mt-1 w-full rounded-lg bg-[#0b0705]/90 px-2 py-1.5 border border-amber-900/70 text-xs text-soft-gold focus:border-amber-400 outline-none"
                    value={newCoupon.user_id}
                    onChange={(e) =>
                      setNewCoupon((p) => ({
                        ...p,
                        user_id: e.target.value,
                      }))
                    }
                    required
                  >
                    <option value="">-- pilih customer --</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.email})
                      </option>
                    ))}
                  </select>
                </div>

                {/* CODE */}
                <div>
                  <label className="text-amber-100/80 font-tech">
                    CODE
                  </label>
                  <input
                    className="mt-1 w-full rounded-lg bg-[#0b0705]/90 px-2 py-1.5 border border-amber-900/70 text-xs text-soft-gold focus:border-amber-400 outline-none"
                    value={newCoupon.code}
                    inputMode="numeric"
                    maxLength={COUPON_CODE_MAX}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, "");
                      if (value.length > COUPON_CODE_MAX) {
                        value = value.slice(0, COUPON_CODE_MAX);
                      }
                      setNewCoupon((p) => ({ ...p, code: value }));
                    }}
                    placeholder="contoh: 123456"
                    required
                  />
                  <p className="mt-1 text-[10px] text-amber-100/60">
                    Hanya angka 0-9, maksimal {COUPON_CODE_MAX} karakter.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* DISKON */}
                <div>
                  <label className="text-amber-100/80 font-tech">
                    DISKON (%)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="mt-1 w-full rounded-lg bg-[#0b0705]/90 px-2 py-1.5 border border-amber-900/70 text-xs text-soft-gold focus:border-amber-400 outline-none"
                    value={newCoupon.discount_percent}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, "");
                      if (value.length > 3) value = value.slice(0, 3);
                      setNewCoupon((p) => ({
                        ...p,
                        discount_percent: value,
                      }));
                    }}
                    placeholder="0–100"
                    required
                  />
                </div>

                {/* EXPIRES AT */}
                <div>
                  <label className="text-amber-100/80 font-tech">
                    EXPIRES AT
                  </label>
                  <input
                    type="datetime-local"
                    className="mt-1 w-full rounded-lg bg-[#0b0705]/90 px-2 py-1.5 border border-amber-900/70 text-xs text-soft-gold focus:border-amber-400 outline-none"
                    value={newCoupon.expires_at}
                    onChange={(e) =>
                      setNewCoupon((p) => ({
                        ...p,
                        expires_at: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>

              {/* REASON */}
              <div>
                <label className="text-amber-100/80 font-tech">
                  REASON
                </label>
                <input
                  className="mt-1 w-full rounded-lg bg-[#0b0705]/90 px-2 py-1.5 border border-amber-900/70 text-xs text-soft-gold focus:border-amber-400 outline-none"
                  value={newCoupon.issued_reason}
                  maxLength={COUPON_REASON_MAX}
                  onChange={(e) => {
                    let value = e.target.value;
                    if (value.length > COUPON_REASON_MAX) {
                      value = value.slice(0, COUPON_REASON_MAX);
                    }
                    setNewCoupon((p) => ({
                      ...p,
                      issued_reason: value,
                    }));
                  }}
                />
                <p className="mt-1 text-[10px] text-amber-100/60 text-right">
                  {newCoupon.issued_reason.length}/{COUPON_REASON_MAX} karakter
                </p>
              </div>

              <button
                type="submit"
                className="mt-1 rounded-xl bg-emerald-500 px-4 py-1.5 text-[11px] font-tech font-semibold text-[#061308] hover:bg-emerald-400 tracking-[0.18em] uppercase shadow-[0_0_20px_rgba(16,185,129,0.55)]"
              >
                {editingCouponId ? "UPDATE COUPON" : "SIMPAN COUPON"}
              </button>
              {editingCouponId && (
                <button
                  type="button"
                  onClick={handleCancelCoupon}
                  className="rounded-xl border border-amber-400/70 px-4 py-1.5 text-[11px] font-tech font-semibold text-amber-200 hover:bg-amber-400/10 tracking-[0.18em] uppercase"
                >
                  BATAL EDIT
                </button>
              )}
            </form>
          </div>
        </div>

        {/* Promos */}
        <div className="relative rounded-xl border border-amber-900/60 bg-[#16100c]/95 p-4 shadow-[0_24px_60px_rgba(0,0,0,0.95)] overflow-hidden space-y-2 card-lux">
          <div className="absolute inset-0 opacity-[0.07] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div className="font-vintage text-lg text-gold-gradient text-glow-gold">
                Promos ({promos.length})
              </div>
            </div>
            <div className="max-h-[32vh] overflow-y-auto custom-scroll space-y-2 mb-2">
              {promos.map((p) => (
                <div
                  key={p.id}
                  className="rounded-lg border border-amber-900/60 bg-[#1b130f]/90 px-3 py-2 flex justify-between gap-2"
                >
                  <div>
                    <div className="font-modern text-soft-gold text-[11px] font-semibold">
                      {p.name}
                    </div>
                    <div className="text-[11px] text-amber-100/75">
                      {p.description}
                    </div>
                    <div className="text-[11px] text-amber-100/80 mt-1">
                      Diskon:{" "}
                      <span className="text-emerald-300">
                        {p.discount_percent}%
                      </span>{" "}
                      · Day:{" "}
                      <span className="text-amber-300">
                        {p.day_of_week != null
                          ? dayNames[p.day_of_week]
                          : "Semua hari"}
                      </span>{" "}
                      · Service ID: {p.service_id || "-"}
                    </div>
                    <div className="text-[10px] text-amber-100/70 mt-1">
                      Status:{" "}
                      <span className="text-amber-200">
                        {p.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditPromo(p)}
                      className="h-fit text-[10px] rounded-lg border border-amber-400/70 px-2 py-1 text-amber-200 hover:bg-amber-500/10 font-tech tracking-[0.18em]"
                    >
                      EDIT
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePromo(p.id)}
                      className="h-fit text-[10px] rounded-lg border border-red-500/70 px-2 py-1 text-red-300 hover:bg-red-500/10 font-tech tracking-[0.18em]"
                    >
                      HAPUS
                    </button>
                  </div>
                </div>
              ))}
              {!promos.length && (
                <div className="text-amber-100/75 font-modern">
                  Belum ada promo.
                </div>
              )}
            </div>

            <form
              onSubmit={handleCreatePromo}
              className="grid grid-cols-1 gap-2 text-[11px]"
            >
              <div className="flex items-start justify-between gap-3 mb-1">
                <div>
                  <div className="font-modern text-amber-200/90 text-[11px]">
                    {editingPromoId ? "Edit Promo" : "Tambah Promo"}
                  </div>
                  {editingPromoId && (
                    <div className="text-amber-100/80 text-[10px]">
                      Ubah nama, deskripsi, diskon, hari, service, atau status. Tekan batal untuk kembali tambah.
                    </div>
                  )}
                </div>
                {editingPromoId && (
                  <button
                    type="button"
                    onClick={handleCancelPromo}
                    className="rounded-lg border border-amber-400/70 px-3 py-1 text-[10px] font-tech tracking-[0.2em] text-amber-200 hover:bg-amber-400/10"
                  >
                    BATAL
                  </button>
                )}
              </div>

              {/* NAMA */}
              <div>
                <label className="text-amber-100/80 font-tech">
                  NAMA
                </label>
                <input
                  className="mt-1 w-full rounded-lg bg-[#0b0705]/90 px-2 py-1.5 border border-amber-900/70 text-xs text-soft-gold focus:border-amber-400 outline-none"
                  value={newPromo.name}
                  maxLength={CATALOG_NAME_MAX}
                  onChange={(e) => {
                    let value = e.target.value.replace(/[^A-Za-z ]/g, "");
                    if (value.length > CATALOG_NAME_MAX) {
                      value = value.slice(0, CATALOG_NAME_MAX);
                    }
                    setNewPromo((p) => ({ ...p, name: value }));
                  }}
                  required
                />
              </div>

              {/* DESKRIPSI */}
              <div>
                <label className="text-amber-100/80 font-tech">
                  DESKRIPSI
                </label>
                <textarea
                  className="mt-1 w-full rounded-lg bg-[#0b0705]/90 px-2 py-1.5 border border-amber-900/70 text-xs text-soft-gold focus:border-amber-400 outline-none min-h-[60px]"
                  value={newPromo.description}
                  maxLength={CATALOG_DESC_MAX}
                  onChange={(e) => {
                    let value = e.target.value;
                    if (value.length > CATALOG_DESC_MAX) {
                      value = value.slice(0, CATALOG_DESC_MAX);
                    }
                    setNewPromo((p) => ({
                      ...p,
                      description: value,
                    }));
                  }}
                />
                <p className="mt-1 text-[10px] text-amber-100/60 text-right">
                  {newPromo.description.length}/{CATALOG_DESC_MAX} karakter
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* DISKON */}
                <div>
                  <label className="text-amber-100/80 font-tech">
                    DISKON (%)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="mt-1 w-full rounded-lg bg-[#0b0705]/90 px-2 py-1.5 border border-amber-900/70 text-xs text-soft-gold focus:border-amber-400 outline-none"
                    value={newPromo.discount_percent}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, "");
                      if (value.length > 3) value = value.slice(0, 3);
                      setNewPromo((p) => ({
                        ...p,
                        discount_percent: value,
                      }));
                    }}
                    placeholder="0–100"
                    required
                  />
                </div>

                {/* DAY OF WEEK */}
                <div>
                  <label className="text-amber-100/80 font-tech">
                    DAY OF WEEK
                  </label>
                  <select
                    className="mt-1 w-full rounded-lg bg-[#0b0705]/90 px-2 py-1.5 border border-amber-900/70 text-xs text-soft-gold focus:border-amber-400 outline-none"
                    value={newPromo.day_of_week}
                    onChange={(e) =>
                      setNewPromo((p) => ({
                        ...p,
                        day_of_week: e.target.value,
                      }))
                    }
                  >
                    <option value="">Semua</option>
                    {dayNames.map((d, idx) => (
                      <option key={idx} value={idx}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* SERVICE ID (dropdown dari services, boleh none) */}
              <div>
                <label className="text-amber-100/80 font-tech">
                  SERVICE (OPTIONAL)
                </label>
                <select
                  className="mt-1 w-full rounded-lg bg-[#0b0705]/90 px-2 py-1.5 border border-amber-900/70 text-xs text-soft-gold focus:border-amber-400 outline-none"
                  value={newPromo.service_id}
                  onChange={(e) =>
                    setNewPromo((p) => ({
                      ...p,
                      service_id: e.target.value,
                    }))
                  }
                >
                  <option value="">— Berlaku untuk semua service —</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (ID: {s.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 text-amber-100/80">
                <input
                  type="checkbox"
                  checked={newPromo.is_active}
                  onChange={(e) =>
                    setNewPromo((p) => ({
                      ...p,
                      is_active: e.target.checked,
                    }))
                  }
                />
                <span>Aktif</span>
              </div>

              <button
                type="submit"
                className="mt-1 rounded-xl bg-amber-400 px-4 py-1.5 text-[11px] font-tech font-semibold text-[#2b190b] hover:bg-amber-300 tracking-[0.18em] uppercase shadow-[0_0_20px_rgba(251,191,36,0.55)]"
              >
                {editingPromoId ? "UPDATE PROMO" : "SIMPAN PROMO"}
              </button>
              {editingPromoId && (
                <button
                  type="button"
                  onClick={handleCancelPromo}
                  className="rounded-xl border border-amber-400/70 px-4 py-1.5 text-[11px] font-tech font-semibold text-amber-200 hover:bg-amber-400/10 tracking-[0.18em] uppercase"
                >
                  BATAL EDIT
                </button>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* REVIEWS */}
      <div className="relative rounded-xl border border-amber-900/60 bg-[#16100c]/95 p-4 shadow-[0_24px_60px_rgba(0,0,0,0.95)] overflow-hidden card-lux">
        <div className="absolute inset-0 opacity-[0.07] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <div className="font-vintage text-lg text-gold-gradient text-glow-gold">
              Reviews ({reviews.length})
            </div>
          </div>
          <div className="max-h-[40vh] overflow-y-auto custom-scroll space-y-2 text-[11px]">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="rounded-lg border border-amber-900/60 bg-[#1b130f]/90 px-3 py-2 flex justify-between gap-2"
              >
                <div>
                  <div className="font-modern text-soft-gold">
                    {r.customer?.name || "Customer"} →{" "}
                    <span className="text-amber-300">
                      {r.barber?.display_name || "Barber"}
                    </span>
                  </div>
                  <div className="text-amber-100/75 mt-0.5">
                    Rating:{" "}
                    <span className="text-emerald-300">{r.rating}/5</span>
                  </div>
                  <div className="text-amber-100/80 mt-1">
                    {r.comment || "(tanpa komentar)"}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteReview(r.id)}
                  className="h-fit text-[10px] rounded-lg border border-red-500/70 px-2 py-1 text-red-300 hover:bg-red-500/10 font-tech tracking-[0.18em]"
                >
                  HAPUS
                </button>
              </div>
            ))}
            {!reviews.length && (
              <div className="text-amber-100/75 font-modern">
                Belum ada review.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );

  const renderSettings = () => (
    <section className="space-y-4 text-xs">
      <div>
        <div className="font-tech text-[10px] text-amber-500/90">
          KEAMANAN AKUN
        </div>
        <div className="font-vintage text-lg text-gold-gradient text-glow-gold">
          Settings
        </div>
        <div className="text-[11px] text-amber-100/75 font-modern max-w-xl">
          Ganti password akun admin dan atur reset password untuk user lain
          (barber / customer).
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* My password */}
        <form
          onSubmit={handleMyPasswordSubmit}
          className="relative rounded-xl border border-amber-900/60 bg-[#16100c]/95 p-4 shadow-[0_24px_60px_rgba(0,0,0,0.95)] overflow-hidden space-y-2 card-lux"
        >
          <div className="absolute inset-0 opacity-[0.07] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
          <div className="relative z-10">
            <div className="font-vintage text-lg text-gold-gradient text-glow-gold mb-2">
              Ganti Password Saya
            </div>
            <div className="grid grid-cols-1 gap-2 text-[11px]">
              <div>
                <label className="text-amber-100/80 font-tech">
                  CURRENT PASSWORD
                </label>
                <input
                  type="password"
                  className="mt-1 w-full rounded-lg bg-[#0b0705]/90 px-3 py-1.5 border border-amber-900/70 text-xs text-soft-gold focus:border-amber-400 outline-none"
                  value={myPasswordForm.current_password}
                  onChange={(e) =>
                    setMyPasswordForm((p) => ({
                      ...p,
                      current_password: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div>
                <label className="text-amber-100/80 font-tech">
                  NEW PASSWORD
                </label>
                  <input
                    type="password"
                    className="mt-1 w-full rounded-lg bg-[#0b0705]/90 px-3 py-1.5 border border-amber-900/70 text-xs text-soft-gold focus:border-amber-400 outline-none"
                    value={myPasswordForm.new_password}
                    onChange={(e) =>
                      setMyPasswordForm((p) => ({
                        ...p,
                        new_password: e.target.value,
                      }))
                    }
                    minLength={8}
                    required
                  />
              </div>
              <div>
                <label className="text-amber-100/80 font-tech">
                  KONFIRMASI NEW PASSWORD
                </label>
                  <input
                    type="password"
                    className="mt-1 w-full rounded-lg bg-[#0b0705]/90 px-3 py-1.5 border border-amber-900/70 text-xs text-soft-gold focus:border-amber-400 outline-none"
                    value={myPasswordForm.new_password_confirmation}
                    onChange={(e) =>
                      setMyPasswordForm((p) => ({
                        ...p,
                        new_password_confirmation: e.target.value,
                      }))
                    }
                    minLength={8}
                    required
                  />
              </div>
              <button
                type="submit"
                disabled={myPasswordLoading}
                className="mt-1 rounded-xl bg-amber-400 px-4 py-1.5 text-[11px] font-tech font-semibold text-[#2b190b] hover:bg-amber-300 tracking-[0.18em] uppercase shadow-[0_0_20px_rgba(251,191,36,0.55)] disabled:opacity-60"
              >
                {myPasswordLoading ? "UPDATING..." : "UPDATE PASSWORD"}
              </button>
            </div>
          </div>
        </form>

        {/* Target user password */}
        <form
          onSubmit={handleTargetPasswordSubmit}
          className="relative rounded-xl border border-amber-900/60 bg-[#16100c]/95 p-4 shadow-[0_24px_60px_rgba(0,0,0,0.95)] overflow-hidden space-y-2 card-lux"
        >
          <div className="absolute inset-0 opacity-[0.07] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
          <div className="relative z-10">
            <div className="font-vintage text-lg text-gold-gradient text-glow-gold mb-2">
              Reset Password User
            </div>
            <div className="grid grid-cols-1 gap-2 text-[11px]">
              <div>
                <label className="text-amber-100/80 font-tech">
                  PILIH USER
                </label>
                <select
                  className="mt-1 w-full rounded-lg bg-[#0b0705]/90 px-3 py-1.5 border border-amber-900/70 text-xs text-soft-gold focus:border-amber-400 outline-none"
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                >
                  <option value="">-- pilih user --</option>
                  {allUsersForSettings.map((u) => (
                    <option key={u.id} value={u.id}>
                      [{u.role}] {u.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-amber-100/80 font-tech">
                  NEW PASSWORD
                </label>
                  <input
                    type="password"
                    className="mt-1 w-full rounded-lg bg-[#0b0705]/90 px-3 py-1.5 border border-amber-900/70 text-xs text-soft-gold focus:border-amber-400 outline-none"
                    value={targetNewPassword}
                    onChange={(e) => setTargetNewPassword(e.target.value)}
                    minLength={8}
                    required
                  />
              </div>
              <button
                type="submit"
                disabled={targetPasswordLoading}
                className="mt-1 rounded-xl bg-emerald-500 px-4 py-1.5 text-[11px] font-tech font-semibold text-[#061308] hover:bg-emerald-400 tracking-[0.18em] uppercase shadow-[0_0_20px_rgba(16,185,129,0.55)] disabled:opacity-60"
              >
                {targetPasswordLoading
                  ? "UPDATING..."
                  : "UPDATE PASSWORD USER"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );

  // === MAIN RENDER =========================================================
  return (
    <MainLayout>
      <div className="relative min-h-screen bg-[#181411] text-amber-50 flex flex-col overflow-hidden pt-16 font-modern">
        {/* --- CSS INJECTION --- */}
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Italiana&family=Manrope:wght@300;400;600;800&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap');
          
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

          /* CARD LUX – shimmer tetap di dalam box */
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
                <div className="font-royal text-[10px] md:text-xs text-amber-500/80">
                  CONTROL PANEL
                </div>
                <div className="flex flex-wrap items-baseline gap-2 md:gap-3">
                  <span className="font-vintage text-2xl md:text-3xl tracking-[0.4em] text-gold-gradient text-glow-gold">
                    DASHBOARD ADMIN
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/60 bg-emerald-500/10 px-2 py-[2px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#22c55e]" />
                  <span className="font-tech text-[9px] tracking-[0.2em] text-emerald-200">
                    ONLINE
                  </span>
                </span>
              </div>
              <div className="text-[11px] text-amber-100/75 font-modern max-w-xl">
                Panel kontrol untuk mengelola barbershop.
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
              <span>MENU ADMIN</span>
              <span className="w-8 h-[1px] bg-gradient-to-r from-amber-500 to-transparent" />
            </div>

            {[
              ["overview", "Overview"],
              ["barbers", "Barbers"],
              ["customers", "Customers"],
              ["hours", "Business Hours"],
              ["catalog", "Catalog"],
              ["payments", "Payments"],
              ["payouts", "Payouts"],
              ["logs", "Access Logs"],
              ["settings", "Settings"],
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
                  {activeTab === "barbers" && renderBarbers()}
                  {activeTab === "customers" && renderCustomers()}
                  {activeTab === "hours" && renderBusinessHours()}
                  {activeTab === "catalog" && renderCatalog()}
                  {activeTab === "payments" && renderPayments()}
                  {activeTab === "payouts" && (
                    <div className="mt-1">
                      {/* barber list diteruskan ke payouts supaya id-barber nyambung */}
                      <AdminPayouts barbers={barbers} />
                    </div>
                  )}
                  {activeTab === "logs" && renderAccessLogs()}
                  {activeTab === "settings" && renderSettings()}
                </motion.div>
              </AnimatePresence>
            </div>
          </section>
        </main>
      </div>
    </MainLayout>
  );
}
