// src/pages/HelpCenterPage.jsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MainLayout from "../components/Layout/MainLayout";
import AnnouncementBanner from "../components/ui/AnnouncementBanner";
import { useAuth } from "../hooks/useAuth";
import csApi from "../api/csApi";

// --- VISUAL ASSETS ---

// 1. Gold Dust Particles (Ambient Background)
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

// 2. Scanning Beam (Cyber Effect)
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
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

const containerStagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

export default function HelpCenterPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [activeTicket, setActiveTicket] = useState(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // --- DATA FETCHING ---
  const loadTickets = async () => {
    try {
      const data = await csApi.list();
      setTickets(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!subject || !message) return;
    setLoading(true);
    try {
      await csApi.createTicket({ subject, message });
      setSubject("");
      setMessage("");
      await loadTickets();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenTicket = async (ticket) => {
    setActiveTicket(null);
    setReplyMessage("");
    try {
      const data = await csApi.detail(ticket.id);
      setActiveTicket(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyMessage || !activeTicket) return;
    setLoading(true);
    try {
      await csApi.reply(activeTicket.id, { message: replyMessage });
      setReplyMessage("");
      const data = await csApi.detail(activeTicket.id);
      setActiveTicket(data);
      await loadTickets();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = user.role === "admin";

  return (
    <MainLayout>
      {/* --- GLOBAL STYLES & FONTS --- */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2family=Cinzel:wght@400;700&family=Italiana&family=Manrope:wght@300;400;600;800&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap');

        .font-royal { font-family: 'Cinzel', serif; }
        .font-vintage { font-family: 'Italiana', serif; }
        .font-tech { font-family: 'Space Mono', monospace; }
        .font-modern { font-family: 'Manrope', sans-serif; }

        /* Elegant Scrollbar */
        .custom-scroll::-webkit-scrollbar { width: 5px; }
        .custom-scroll::-webkit-scrollbar-track { background: rgba(0,0,0,0.3); }
        .custom-scroll::-webkit-scrollbar-thumb { 
          background: linear-gradient(to bottom, #78350f, #d97706); 
          border-radius: 10px; 
          border: 1px solid #000;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: #fbbf24; }
      `}</style>

      {/* --- BACKGROUND LAYER --- */}
      <div className="fixed inset-0 z-0 bg-[#030303]">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#050505] to-[#000000]" />
        <ScannerBeam />
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-amber-700/5 blur-[120px] rounded-full mix-blend-screen" />
        <FloatingParticles />
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        {/* Hexagon Grid Overlay */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/hexellence.png')] opacity-[0.03]" />
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-12 space-y-8 pt-8 min-h-screen flex flex-col">
        
        {/* HEADER SECTION */}
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-amber-500/10 pb-6 relative">
          <motion.div
            variants={containerStagger}
            initial="hidden"
            animate="visible"
            className="flex-1"
          >
            
            <motion.h1
              variants={revealVar}
              className="font-vintage text-4xl md:text-5xl lg:text-6xl text-slate-100 leading-none drop-shadow-lg"
            >
              Helper{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-700 font-royal">
                Service
              </span>
            </motion.h1>

            <motion.p variants={revealVar} className="mt-4 font-modern text-sm text-slate-400 max-w-xl leading-relaxed border-l-2 border-amber-900/30 pl-4">
              {isAdmin
                ? "Exclusive admin access. Manage client requests with precision and speed."
                : "Priority support for you. Share issues, we deliver instant solutions."}
            </motion.p>
          </motion.div>
        </header>

        {/* ANNOUNCEMENT BANNER */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
           <AnnouncementBanner />
        </motion.div>

        {/* --- GRID SYSTEM --- */}
        <div className="grid grid-cols-1 lg:grid-cols-[380px,1fr] gap-6 items-start h-[calc(100vh-300px)] min-h-[600px]">
          
          {/* LEFT COLUMN: LIST & FORM */}
          <div className="flex flex-col gap-5 h-full">
            
            {/* 1. TICKET LIST */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1 flex flex-col bg-[#080808]/80 backdrop-blur-md border border-amber-500/10 rounded-t-sm rounded-b-xl overflow-hidden relative group"
            >
               {/* Decorative Border Glow */}
               <div className="absolute inset-0 border border-amber-500/20 rounded-xl pointer-events-none group-hover:border-amber-500/40 transition-colors duration-500" />
               
               {/* Header List */}
               <div className="bg-gradient-to-r from-amber-950/20 to-transparent p-4 border-b border-amber-500/10 flex justify-between items-center">
                  <h3 className="font-vintage text-lg text-amber-100 tracking-wide">
                    {isAdmin ? "Client Inquiries" : "My Requests"}
                  </h3>
                  <span className="font-tech text-[10px] text-amber-400 bg-black/40 px-2 py-1 border border-amber-900/50 rounded shadow-inner">
                    Total: {tickets.length}
                  </span>
               </div>

               {/* Scrollable List */}
               <div className="flex-1 overflow-y-auto custom-scroll p-2 space-y-1 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
                  {tickets.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-2 opacity-50">
                      <div className="text-4xl"></div>
                      <span className="font-modern text-xs">No active tickets</span>
                    </div>
                  )}
                  
                  {tickets.map((t) => {
                    const isActive = activeTicket?.id === t.id;
                    return (
                      <motion.button
                        key={t.id || Math.random()}
                        onClick={() => handleOpenTicket(t)}
                        className={`w-full text-left p-3.5 rounded transition-all duration-300 relative overflow-hidden group/item border-l-2 ${
                          isActive
                            ? "bg-gradient-to-r from-amber-900/20 to-transparent border-l-amber-500"
                            : "bg-transparent hover:bg-white/5 border-l-transparent hover:border-l-slate-600"
                        }`}
                      >
                         <div className="flex justify-between items-start mb-1.5">
                           <span className={`font-tech text-[10px] tracking-wider uppercase ${isActive ? 'text-amber-400' : 'text-slate-500'}`}>
                             ID: {t.id ?? "-"}
                           </span>
                           <span className={`text-[9px] px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-widest border ${
                             t.status === 'open' ? 'text-emerald-400 border-emerald-900 bg-emerald-900/10' : 
                             'text-slate-400 border-slate-800 bg-slate-900/30'
                           }`}>
                             {t.status || "open"}
                           </span>
                         </div>
                         <h4 className={`font-modern font-semibold text-sm truncate ${isActive ? 'text-amber-50' : 'text-slate-300 group-hover/item:text-white'}`}>
                           {t.subject || "Untitled"}
                         </h4>
                      </motion.button>
                    )
                  })}
               </div>
            </motion.div>

            {/* 2. CREATE TICKET FORM (User Only) */}
            {!isAdmin && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-[#0a0a0a] border border-amber-500/20 rounded-xl p-5 relative overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]"
              >
                {/* Visual Flair */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-bl-3xl pointer-events-none" />
                
                <h3 className="font-royal text-sm text-amber-200/80 mb-4 border-b border-amber-500/10 pb-2">
                  Make New Request
                </h3>

                <form onSubmit={handleCreateTicket} className="space-y-4">
                  <div className="group relative">
                    <input
                      type="text"
                      className="w-full bg-[#050505] border border-white/10 rounded px-4 py-3 text-sm text-amber-50 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-900/30 transition-all font-modern placeholder-slate-700 peer"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder=" " // Trick for peer-placeholder-shown
                      required
                    />
                    <label className="absolute left-4 top-3 text-slate-500 text-xs font-tech uppercase tracking-widest transition-all peer-focus:-top-2.5 peer-focus:left-2 peer-focus:text-[9px] peer-focus:text-amber-500 peer-focus:bg-[#0a0a0a] peer-focus:px-1 peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-[9px] peer-[:not(:placeholder-shown)]:text-amber-500 peer-[:not(:placeholder-shown)]:bg-[#0a0a0a] peer-[:not(:placeholder-shown)]:px-1 pointer-events-none">
                      Subject
                    </label>
                  </div>
                  
                  <div className="group relative">
                    <textarea
                      rows={3}
                      className="w-full bg-[#050505] border border-white/10 rounded px-4 py-3 text-sm text-amber-50 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-900/30 transition-all font-modern resize-none custom-scroll placeholder-slate-700 peer"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder=" "
                      required
                    />
                    <label className="absolute left-4 top-3 text-slate-500 text-xs font-tech uppercase tracking-widest transition-all peer-focus:-top-2.5 peer-focus:left-2 peer-focus:text-[9px] peer-focus:text-amber-500 peer-focus:bg-[#0a0a0a] peer-focus:px-1 peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-[9px] peer-[:not(:placeholder-shown)]:text-amber-500 peer-[:not(:placeholder-shown)]:bg-[#0a0a0a] peer-[:not(:placeholder-shown)]:px-1 pointer-events-none">
                      Message
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-amber-50 font-bold font-tech text-xs tracking-[0.2em] uppercase rounded shadow-[0_4px_15px_rgba(180,83,9,0.2)] transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:grayscale"
                >
                  {loading ? "Transmitting..." : "Submit Ticket"}
                </button>
              </form>
              </motion.div>
            )}
          </div>

          {/* RIGHT COLUMN: CONVERSATION */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-full flex flex-col bg-[#080808] border border-white/10 rounded-xl relative overflow-hidden shadow-2xl"
          >
             {/* Tech Accents */}
             <div className="absolute top-0 left-0 w-16 h-[1px] bg-gradient-to-r from-amber-500 to-transparent" />
             <div className="absolute top-0 left-0 h-16 w-[1px] bg-gradient-to-b from-amber-500 to-transparent" />
             <div className="absolute bottom-0 right-0 w-16 h-[1px] bg-gradient-to-l from-amber-500 to-transparent" />
             <div className="absolute bottom-0 right-0 h-16 w-[1px] bg-gradient-to-t from-amber-500 to-transparent" />

             {/* HEADER DETAIL */}
             <div className="p-6 border-b border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent flex justify-between items-end z-10">
                <div>
                   <h2 className="font-vintage text-3xl text-slate-100 tracking-wide">
                      {activeTicket?.subject || "Communication Board"}
                   </h2>
                  <div className="flex items-center gap-4 mt-2">

                     {activeTicket && (
                       <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                         activeTicket.status === 'open'
                           ? 'border-emerald-500/30 text-emerald-400'
                           : 'border-slate-700 text-slate-500'
                       }`}>
                         {activeTicket?.status || "open"}
                       </span>
                     )}
                  </div>
               </div>
               {activeTicket && (
                 <div className="hidden md:block text-right">
                   <div className="font-tech text-4xl text-white/5 font-bold leading-none">
                     #{(activeTicket?.id ?? 0).toString().padStart(3, "0")}
                   </div>
                 </div>
               )}
             </div>

             {/* CHAT AREA */}
             <div className="flex-1 overflow-y-auto custom-scroll p-6 space-y-6 relative bg-[#050505]">
                {/* Dotted Grid Background */}
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:20px_20px] opacity-20 pointer-events-none" />
                
                {!activeTicket ? (
                 <div className="h-full flex flex-col items-center justify-center text-slate-700 space-y-4">
                    <div className="w-24 h-24 rounded-full border border-dashed border-slate-800 flex items-center justify-center animate-[spin_10s_linear_infinite]">
                      <div className="w-20 h-20 rounded-full border border-slate-800" />
                    </div>
                    <p className="font-tech text-xs tracking-[0.3em] uppercase opacity-50">Loading...</p>
                  </div>
               ) : (
                  <>
                    <AnimatePresence>
                      {(activeTicket?.messages || []).map((m) => {
                        const isAdminMsg = m.sender.role === "admin";
                        return (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={m.id}
                            className={`flex ${isAdminMsg ? "justify-end" : "justify-start"}`}
                          >
                            <div className={`max-w-[80%] relative`}>
                               {/* Message Label */}
                               <div className={`flex items-center gap-2 mb-1.5 text-[9px] font-tech uppercase tracking-widest ${isAdminMsg ? 'text-amber-500 justify-end' : 'text-slate-500'}`}>
                                 {isAdminMsg ? (
                                   <>
                                     <span>{new Date(m.created_at).toLocaleString("id-ID")}</span>
                                     <span className="font-bold text-amber-400">ADMIN</span>
                                   </>
                                 ) : (
                                   <>
                                     <span className="font-bold text-slate-300">{m.sender.name}</span>
                                     <span>{new Date(m.created_at).toLocaleString("id-ID")}</span>
                                   </>
                                 )}
                               </div>

                              {/* Bubble */}
                              <div className={`
                                p-5 backdrop-blur-md border relative
                                ${isAdminMsg 
                                   ? "bg-gradient-to-br from-[#1a1500] to-black border-amber-900/40 rounded-t-xl rounded-bl-xl text-amber-50 shadow-[0_5px_15px_rgba(251,191,36,0.05)]" 
                                   : "bg-[#111] border-slate-800 rounded-t-xl rounded-br-xl text-slate-300"
                                }
                              `}>
                                 <p className="font-modern text-sm leading-7 whitespace-pre-wrap">
                                   {m.message}
                                 </p>
                               </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </>
                )}
             </div>

             {/* REPLY INPUT AREA */}
             {activeTicket && (
               <div className="p-4 bg-black border-t border-white/10 z-20">
                 <form onSubmit={handleReply} className="flex flex-col gap-3">
                   <div className="relative group">
                      {/* Animated Glow Border on Focus */}
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-600 to-amber-900 rounded-lg blur opacity-0 group-focus-within:opacity-40 transition duration-500" />
                      
                      <div className="relative flex gap-0 bg-[#0a0a0a] rounded-lg border border-white/10 overflow-hidden">
                        <textarea
                          rows={1}
                          className="flex-1 bg-transparent px-4 py-4 text-sm text-slate-100 focus:outline-none font-modern resize-none placeholder-slate-700 custom-scroll"
                          value={replyMessage}
                          onChange={(e) => setReplyMessage(e.target.value)}
                          placeholder={isAdmin ? "Type response..." : "Write a reply..."}
                          style={{ minHeight: "60px" }}
                        />
                        <button
                           type="submit"
                           disabled={loading || !replyMessage}
                           className="px-6 border-l border-white/10 text-amber-500 hover:bg-amber-900/20 hover:text-amber-400 font-tech text-xs tracking-widest uppercase transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          Send
                        </button>
                      </div>
                   </div>
                 </form>
               </div>
             )}
          </motion.div>

        </div>
      </div>
    </MainLayout>
  );
}
