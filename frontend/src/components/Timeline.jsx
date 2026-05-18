import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Timeline({ id, hoveredSection, setHoveredSection }) {
  const isActive = hoveredSection === id;
  const isDimmed = hoveredSection !== null && hoveredSection !== id;

  const [events, setEvents] = useState([
    { id: 1, time: "19.2", text: "SIX! Huge hit by Virat", type: "action", color: "bg-[#FDBA74]", active: true },
    { id: 2, time: "18.5", text: "WICKET - Clean bowled!", type: "card", color: "bg-[#A7F3D0]" },
    { id: 3, time: "17.1", text: "FOUR - Classic cover drive", type: "action", color: "bg-[#E9D5FF]" },
    { id: 4, time: "15.0", text: "Fifty partnership comes up", type: "info", color: "bg-white/40" },
    { id: 5, time: "12.3", text: "Dropped! Tough chance", type: "card", color: "bg-white/40" },
    { id: 6, time: "10.0", text: "Drinks break", type: "info", color: "bg-white/20" },
    { id: 7, time: "8.4", text: "SIX - Over long on", type: "action", color: "bg-[#FDBA74]" },
    { id: 8, time: "5.2", text: "WICKET - Caught behind", type: "card", color: "bg-[#A7F3D0]" },
    { id: 9, time: "1.1", text: "First boundary of the innings", type: "action", color: "bg-white/40" },
    { id: 10, time: "0.0", text: "Match Begins", type: "info", color: "bg-white/20" }
  ]);

  return (
    <motion.div 
      layout
      onMouseEnter={() => setHoveredSection(id)}
      onMouseLeave={() => setHoveredSection(null)}
      animate={{ 
        flexGrow: isActive ? 1.5 : (isDimmed ? 0.8 : 1),
        scale: isActive ? 1.02 : (isDimmed ? 0.97 : 1),
        opacity: isActive ? 1 : (isDimmed ? 0.7 : 1),
        boxShadow: isActive ? "0 25px 50px -12px rgba(0,0,0,0.5)" : "0 4px 6px -1px rgba(0,0,0,0.1)"
      }}
      transition={{ type: "tween", ease: "circOut", duration: 0.3 }}
      style={{ transformOrigin: "center center" }}
      className="bg-[#1E1E1E] rounded-[2rem] p-6 flex flex-col border border-white/5 basis-1/2 min-h-0 overflow-hidden"
    >
      <h3 className="text-white/90 text-lg font-medium tracking-tight mb-5 shrink-0">Live Timeline</h3>
      
      <div className="flex-1 overflow-y-auto pr-3 -mr-3 relative hide-scroll">
        <div className="absolute left-[13px] top-3 bottom-0 w-px bg-white/10" />
        
        <div className="flex flex-col gap-5 pb-4">
          <AnimatePresence>
            {events.map((ev, i) => (
              <motion.div 
                key={ev.id} 
                initial={ev.active ? { opacity: 0, x: -20, scale: 0.9 } : false}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ type: "spring", bounce: 0.4 }}
                className="flex gap-4 relative z-10 group"
              >
                <div className="flex flex-col items-center mt-1.5 shrink-0">
                  <div className="relative flex h-3 w-3">
                    {ev.active && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-40 bg-[#A7F3D0]"></span>
                    )}
                    <span className={`relative inline-flex rounded-full h-3 w-3 ${ev.color}`}></span>
                  </div>
                </div>
                
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-xs font-bold ${ev.active ? 'text-[#A7F3D0]' : 'text-white/40 group-hover:text-white/60 transition-colors'}`}>Over {ev.time}</span>
                  </div>
                  <div className="bg-[#121212] px-3.5 py-2.5 rounded-2xl rounded-tl-sm text-sm text-white/80 border border-white/5 shadow-sm inline-flex w-fit group-hover:bg-[#1a1a1a] group-hover:border-white/10 transition-colors">
                    {ev.text}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
