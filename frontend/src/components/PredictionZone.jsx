import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

export default function PredictionZone({ id, hoveredSection, setHoveredSection, poll, onVote }) {
  const isActive = hoveredSection === id;
  const isDimmed = hoveredSection !== null && hoveredSection !== id;

  const [localVote, setLocalVote] = useState(null);

  useEffect(() => {
    setLocalVote(null);
  }, [poll?.pollId]);

  const handleVote = (optionId) => {
    if (localVote || !poll) return;
    setLocalVote(optionId);
    onVote(optionId);

    const rect = document.getElementById(`opt-${optionId}`)?.getBoundingClientRect();
    const x = rect ? (rect.left + rect.width / 2) / window.innerWidth : 0.5;
    const y = rect ? rect.top / window.innerHeight : 0.7;

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x, y },
      colors: ['#A7F3D0', '#E9D5FF', '#FDBA74', '#ffffff'],
      disableForReducedMotion: true
    });
  };

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
      className="w-full h-full flex flex-col justify-end basis-auto min-h-0 relative origin-center"
    >
      <AnimatePresence mode="wait">
        {poll ? (
          <motion.div
            key={poll.pollId}
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", bounce: 0.35, duration: 0.8 }}
            className="w-full bg-[#1E1E1E] rounded-[2.5rem] p-6 lg:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] border border-white/10 relative overflow-hidden"
          >
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#A7F3D0]/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col gap-5 lg:gap-6">
              <div className="flex items-center justify-between">
                <div className="bg-[#A7F3D0]/10 text-[#A7F3D0] px-3.5 py-1.5 rounded-full text-[10px] lg:text-xs font-bold uppercase tracking-widest border border-[#A7F3D0]/20 flex items-center gap-2 shadow-inner">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#A7F3D0] animate-pulse shadow-[0_0_5px_#A7F3D0]" />
                  Live Prediction
                </div>
                <span className="text-white/40 text-xs font-bold uppercase tracking-wider">{poll.totalVotes || 0} Votes</span>
              </div>
              
              <h2 className="text-xl lg:text-3xl font-semibold text-white/90 leading-tight tracking-tight">
                {poll.question}
              </h2>

              <div className="flex flex-col gap-3 mt-2 lg:mt-4">
                {poll.options.map((opt) => {
                  const isSelected = localVote === opt.id || localVote === opt._id;
                  const pct = poll.totalVotes > 0 ? ((opt.votes / poll.totalVotes) * 100).toFixed(0) : 0;
                  
                  return (
                    <motion.button
                      key={opt.id || opt._id}
                      id={`opt-${opt.id || opt._id}`}
                      onClick={() => handleVote(opt.id || opt._id)}
                      disabled={!!localVote}
                      whileTap={!localVote ? { scale: 0.97 } : {}}
                      className={`relative w-full text-left rounded-full p-4 lg:p-5 overflow-hidden transition-all duration-300 border shadow-sm ${
                        isSelected 
                          ? 'border-[#A7F3D0]/50 ring-1 ring-[#A7F3D0]/30 bg-[#2A2A2A]' 
                          : 'border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      {localVote && (
                        <div 
                          className="absolute inset-y-0 left-0 bg-[#A7F3D0]/15"
                          style={{ width: `${pct}%`, transition: 'width 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                        />
                      )}
                      <div className="relative z-10 flex justify-between items-center">
                        <span className={`text-sm lg:text-base font-semibold ${isSelected ? 'text-[#A7F3D0]' : 'text-white/90'}`}>{opt.text}</span>
                        {localVote && (
                          <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className={`font-bold text-sm lg:text-base ${isSelected ? 'text-[#A7F3D0]' : 'text-white/60'}`}>
                            {pct}%
                          </motion.span>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="w-full bg-[#1E1E1E] rounded-[2.5rem] p-8 lg:p-10 border border-white/5 border-dashed flex flex-col items-center justify-center text-center gap-4 h-full min-h-[250px]">
            <div className="w-14 h-14 rounded-full bg-[#252525] flex items-center justify-center border border-white/10 shadow-inner">
              <span className="text-2xl">✨</span>
            </div>
            <div>
              <h3 className="text-white/80 font-medium mb-1.5 text-lg tracking-tight">Waiting for next moment</h3>
              <p className="text-xs lg:text-sm text-white/40 font-medium">Gemini is analyzing the pitch. A prediction will drop soon.</p>
            </div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
