import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const EMOJIS = ["🔥", "⚡", "👏", "🤯", "🚀", "💚", "⚽"];

export default function LiveBroadcastMock({ id, hoveredSection, setHoveredSection, socket, vibes, setVibes, matchMinute }) {
  const isActive = hoveredSection === id;
  const isDimmed = hoveredSection !== null && hoveredSection !== id;

  const vibeAreaRef = useRef(null);

  const handleVibeClick = useCallback((e) => {
    if (!vibeAreaRef.current) return;
    const rect = vibeAreaRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    if(socket && socket.connected) {
        socket.emit("SEND_VIBE", { x, y, emoji });
    } else {
        setVibes((prev) => [...prev.slice(-20), { id: Date.now(), x, y, emoji, timestamp: Date.now() }]);
    }
  }, [socket, setVibes]);

  return (
    <motion.div 
      layout
      onMouseEnter={() => setHoveredSection(id)}
      onMouseLeave={() => setHoveredSection(null)}
      animate={{ 
        scale: isActive ? 1.02 : (isDimmed ? 0.97 : 1),
        opacity: isActive ? 1 : (isDimmed ? 0.7 : 1),
        boxShadow: isActive ? "0 25px 50px -12px rgba(0,0,0,0.5)" : "0 4px 6px -1px rgba(0,0,0,0.1)"
      }}
      transition={{ type: "tween", ease: "circOut", duration: 0.3 }}
      style={{ transformOrigin: "center center" }}
      className="bg-black rounded-[2.5rem] relative overflow-hidden shadow-[inset_0_0_80px_rgba(0,0,0,0.8)] h-48 lg:h-full w-full border border-white/5 flex items-center justify-center shrink-0 min-h-[300px]"
    >
      {/* Cinematic Gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1C1C1C]/20 via-[#101010]/60 to-[#101010] pointer-events-none" />
      
      {/* Pitch Grid Mock */}
      <div className="absolute inset-0 opacity-30 mix-blend-overlay" style={{
        backgroundImage: "linear-gradient(rgba(167,243,208,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(167,243,208,0.1) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
        transform: "perspective(800px) rotateX(60deg) scale(2.5) translateY(-20px)",
        transformOrigin: "top center",
      }} />

      {/* Scoreboard Overlay */}
      <div className="absolute top-4 lg:top-8 left-0 right-0 flex justify-center pointer-events-none z-10">
        <div className="bg-[#1C1C1C]/90 backdrop-blur-xl rounded-full px-4 lg:px-8 py-2 lg:py-3.5 flex items-center gap-4 lg:gap-8 border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-2 lg:gap-4">
            <span className="text-white/60 font-bold text-xs lg:text-sm tracking-widest">MCI</span>
            <span className="text-xl lg:text-3xl font-black text-white/90">2</span>
          </div>
          <div className="w-px h-5 lg:h-8 bg-white/10" />
          <div className="flex flex-col items-center justify-center min-w-[40px] lg:min-w-[60px]">
            <span className="text-[10px] lg:text-xs text-[#A7F3D0] font-bold tracking-widest">{matchMinute || 0}:12</span>
            <div className="w-full h-0.5 bg-[#252525] rounded-full mt-1 overflow-hidden">
              <div className="w-[82%] h-full bg-[#A7F3D0] rounded-full" />
            </div>
          </div>
          <div className="w-px h-5 lg:h-8 bg-white/10" />
          <div className="flex items-center gap-2 lg:gap-4">
            <span className="text-xl lg:text-3xl font-black text-white/90">1</span>
            <span className="text-white/60 font-bold text-xs lg:text-sm tracking-widest">ARS</span>
          </div>
        </div>
      </div>

      {/* Live Pill Indicator */}
      <div className="absolute top-4 lg:top-8 left-4 lg:left-8 flex items-center gap-2 bg-[#FECDD3]/10 border border-[#FECDD3]/20 rounded-full px-3 py-1.5 backdrop-blur-md z-10 shadow-lg">
        <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-[#FECDD3] animate-pulse shadow-[0_0_8px_#FECDD3]" />
        <span className="text-[#FECDD3] text-[9px] lg:text-[10px] font-bold uppercase tracking-widest">Live</span>
      </div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none mt-10">
        <p className="text-white/20 text-xs lg:text-sm font-bold tracking-widest uppercase bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm border border-white/5">Tap pitch to send vibes</p>
      </div>

      {/* Vibe Interaction Layer */}
      <div 
        ref={vibeAreaRef}
        onClick={handleVibeClick}
        className="absolute inset-0 cursor-pointer z-20"
      />

      {/* Vibe Floating Animations */}
      <AnimatePresence>
        {vibes.map((vibe) => (
          <motion.div
            key={vibe.id}
            initial={{ opacity: 0, y: 0, scale: 0.5 }}
            animate={{ opacity: [0, 1, 0.8, 0], y: -200, scale: 1.8 }}
            transition={{ duration: 2.5, ease: "easeOut" }}
            onAnimationComplete={() => setVibes(prev => prev.filter(v => v.id !== vibe.id))}
            className="absolute text-2xl lg:text-4xl pointer-events-none z-30 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
            style={{ left: `${vibe.x}%`, top: `${vibe.y}%`, transform: 'translate(-50%, -50%)' }}
          >
            {vibe.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
