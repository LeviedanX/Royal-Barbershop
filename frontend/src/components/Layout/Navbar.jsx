// src/components/Layout/Navbar.jsx
import React from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import RealtimeClock from "../ui/RealtimeClock"; // Pastikan path ini benar sesuai file sebelumnya
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

/* ========== Magnetic Link (Digital Physics preserved) ========== */
function MagneticLink({ to, children, className, end, disabled = false, ...rest }) {
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });
  const onMove = (e) => {
    if (disabled) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - (r.left + r.width / 2)) / r.width) * 12; // Reduced elasticity for weight
    const y = ((e.clientY - (r.top + r.height / 2)) / r.height) * 8;
    setOffset({ x, y });
  };
  const onLeave = () => setOffset({ x: 0, y: 0 });

  return (
    <NavLink
      to={to}
      className={className}
      end={end}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      {...rest}
    >
      <motion.span
        className="relative z-10 inline-block will-change-transform"
        animate={disabled ? { x: 0, y: 0 } : { x: offset.x, y: offset.y }}
        transition={{ type: "spring", stiffness: 200, damping: 15, mass: 0.5 }} // Heavier mass for "expensive" feel
      >
        {children}
      </motion.span>
    </NavLink>
  );
}

/* ========== Animated Brass Barber Pole Icon ========== */
function BrandIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 36 36" className="pointer-events-none select-none drop-shadow-md">
      <defs>
        {/* Brass/Gold Gradient */}
        <linearGradient id="brass" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fcd34d" />
          <stop offset="50%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>
        
        {/* Glass Reflection */}
        <linearGradient id="glass" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.8)" />
          <stop offset="50%" stopColor="rgba(255,255,255,0.1)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.6)" />
        </linearGradient>

        <pattern id="stripes" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="4" height="12" fill="#991b1b" /> {/* Deep Red */}
          <rect x="4" width="4" height="12" fill="#fef3c7" /> {/* Cream White */}
          <rect x="8" width="4" height="12" fill="#1e3a8a" /> {/* Royal Blue */}
          <animateTransform attributeName="patternTransform" type="translate" from="0 0" to="12 0" dur="3s" repeatCount="indefinite" additive="sum"/>
        </pattern>
      </defs>

      {/* Main Cylinder */}
      <rect x="10" y="6" width="16" height="24" rx="2" fill="url(#stripes)" />
      
      {/* Glass Overlay (Cylindrical effect) */}
      <rect x="10" y="6" width="16" height="24" rx="2" fill="url(#glass)" opacity="0.4" />
      
      {/* Brass Caps */}
      <path d="M8 6h20v-2a2 2 0 00-2-2H10a2 2 0 00-2 2v2z" fill="url(#brass)" /> {/* Top Cap */}
      <path d="M8 30h20v2a2 2 0 01-2 2H10a2 2 0 01-2-2v-2z" fill="url(#brass)" /> {/* Bottom Cap */}
      
      {/* Shine/Reflection Line */}
      <rect x="13" y="7" width="2" height="22" fill="white" opacity="0.3" />
    </svg>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);

  // Fonts check (Optional/Simulated)
  const SERIF_FONT = '"Playfair Display", Georgia, serif';
  const SANS_FONT = '"Plus Jakarta Sans", sans-serif';

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // --- Styles Definition ---
  
  // Link Style: Teks Emas Pudar, berubah menjadi Emas Terang saat aktif
  const navLinkClass = ({ isActive }) =>
    [
      "relative px-4 py-2 text-sm tracking-wide transition-all duration-300 font-serif italic",
      isActive
        ? "text-amber-400 font-semibold drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
        : "text-stone-400 hover:text-amber-200",
    ].join(" ");

  // Button Style: Fisik 3D, inset shadow, border emas tipis
  const buttonBase = "relative overflow-hidden px-5 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all duration-300 transform active:scale-95";
  
  const primaryBtn = `${buttonBase} bg-amber-700 text-amber-50 border border-amber-600/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(0,0,0,0.5)] hover:bg-amber-600 hover:shadow-[0_0_15px_rgba(217,119,6,0.4)]`;
  
  const secondaryBtn = `${buttonBase} bg-stone-900 text-stone-300 border border-stone-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] hover:text-white hover:border-stone-500`;

  const dashboardPath = user?.role === "admin" ? "/dashboard/admin" : user?.role === "barber" ? "/dashboard/barber" : "/dashboard/customer";

  return (
    <>
      {/* --- Main Navbar Container --- */}
      <nav
        className={[
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          scrolled 
            ? "bg-[#1c1917]/95 backdrop-blur-md py-2 border-b border-amber-800/40 shadow-xl" 
            : "bg-transparent py-4 border-b border-transparent",
        ].join(" ")}
        style={{ fontFamily: SANS_FONT }}
      >
        {/* Filament Line (Top Accent) - Like an Edison Bulb filament */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
          
          {/* 1. BRAND LOGO */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-stone-800 to-black border border-stone-700 shadow-inner overflow-hidden">
               {/* Background Noise Texture inside logo box */}
               <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')]"></div>
               <BrandIcon />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-[0.3em] text-amber-600/80 font-bold">The</span>
              <span className="text-xl leading-none font-bold text-stone-200 tracking-tight font-serif group-hover:text-amber-400 transition-colors duration-300">
                BARBER<span className="text-amber-600">.</span>
              </span>
            </div>
          </Link>

          {/* 2. CENTER LINKS (Desktop) */}
          <div className="hidden md:flex items-center gap-1 rounded-full bg-black/20 px-2 py-1 border border-white/5 backdrop-blur-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]">
             {[
               { to: "/", label: "Home", end: true },
               { to: "/gallery", label: "Gallery" },
               { to: "/queue", label: "Queue" },
               { to: "/help", label: "Service" },
             ].map((link) => (
                <MagneticLink key={link.to} to={link.to} end={link.end} className={navLinkClass}>
                  {link.label}
                  {/* Active Indicator: Golden underline */}
                  <span className="absolute bottom-1 left-1/2 h-[1px] w-0 -translate-x-1/2 bg-amber-500 transition-all duration-300 group-hover:w-1/2 aria-[current=page]:w-3/4" />
                </MagneticLink>
             ))}
          </div>

          {/* 3. RIGHT ACTIONS */}
          <div className="flex items-center gap-4">
            
            {/* Clock Widget (Only visible on larger screens) */}
            <div className="hidden lg:block transform scale-90 opacity-90 hover:opacity-100 transition-opacity">
               <RealtimeClock compact />
            </div>

            <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-stone-800">
              {!user ? (
                <>
                   <Link to="/login" className="text-sm font-medium text-stone-400 hover:text-amber-400 transition-colors">
                     Login
                   </Link>
                   <Link to="/register" className={primaryBtn}>
                     <span className="relative z-10">Book Now</span>
                     {/* Shine effect animation */}
                     <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shine" />
                   </Link>
                </>
              ) : (
                <>
                   <Link to={dashboardPath} className={secondaryBtn}>
                     Dashboard
                   </Link>
                   <button onClick={logout} className="text-stone-500 hover:text-red-500 transition-colors p-2">
                     <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                   </button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-stone-300 hover:text-amber-400 transition-colors"
            >
              <div className="flex flex-col gap-1.5">
                <span className={`block h-0.5 w-6 bg-current transition-transform ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
                <span className={`block h-0.5 w-6 bg-current transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
                <span className={`block h-0.5 w-6 bg-current transition-transform ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* --- Mobile Drawer (Leather Menu Style) --- */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-64 bg-[#181411] border-l border-amber-900/30 shadow-2xl p-6 md:hidden"
              style={{ 
                 // Leather texture simulation
                 backgroundImage: "radial-gradient(circle at top right, #2a221d, #181411)",
              }}
            >
              <div className="flex flex-col h-full">
                <div className="mb-8 pt-4 border-b border-white/5 pb-4">
                  <h3 className="text-amber-500 font-serif text-lg italic">Menu</h3>
                </div>
                
                <div className="flex flex-col gap-4">
                  {[
                    { to: "/", label: "Home" },
                    { to: "/gallery", label: "Gallery" },
                    { to: "/queue", label: "Queue" },
                    { to: "/help", label: "Help Center" },
                  ].map((l) => (
                    <NavLink 
                      key={l.to} 
                      to={l.to}
                      onClick={() => setMenuOpen(false)}
                      className={({isActive}) => `text-lg font-medium transition-colors ${isActive ? "text-amber-400 translate-x-2" : "text-stone-400 hover:text-stone-200"}`}
                    >
                      {l.label}
                    </NavLink>
                  ))}
                </div>

                <div className="mt-auto pt-6 border-t border-white/5 space-y-4">
                  {!user ? (
                    <div className="grid gap-3">
                      <Link to="/login" className="text-center text-stone-400 py-2">Login</Link>
                      <Link to="/register" className={`${primaryBtn} text-center py-3`}>Book Appointment</Link>
                    </div>
                  ) : (
                    <div className="grid gap-3">
                       <Link to={dashboardPath} className={`${secondaryBtn} text-center py-3`}>My Dashboard</Link>
                       <button onClick={logout} className="text-center text-red-400 text-sm">Sign Out</button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}