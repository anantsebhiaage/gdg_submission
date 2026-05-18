import { useState } from "react";
import { motion } from "framer-motion";

export default function Leaderboard({ id, hoveredSection, setHoveredSection, leaderboardData, currentUsername }) {
  const isActive = hoveredSection === id;
  const isDimmed = hoveredSection !== null && hoveredSection !== id;

  const data = leaderboardData?.length > 0 ? leaderboardData : [
    { username: "CricketFan88", points: 14250, tier: "Diamond", streak: 12 },
    { username: "Dhoni_is_God", points: 13800, tier: "Diamond", streak: 8 },
    { username: "MiaStats", points: 12500, tier: "Platinum", streak: 5 },
    { username: "GuestUser", points: 11200, tier: "Gold", streak: 3 },
    { username: "Fanatic_01", points: 9800, tier: "Gold", streak: 2 },
    { username: "BlueMoon", points: 8400, tier: "Silver", streak: 0 },
    { username: "Gunners4Life", points: 7900, tier: "Silver", streak: 4 },
    { username: "TacticsNerd", points: 6500, tier: "Bronze", streak: 1 },
    { username: "WeekendWarrior", points: 5200, tier: "Bronze", streak: 0 },
    { username: "NewFan2026", points: 1100, tier: "Rookie", streak: 0 },
  ];

  const getRankStyle = (index) => {
    if (index === 0) return { bg: "bg-[#A7F3D0]/10", text: "text-[#A7F3D0]", border: "border-[#A7F3D0]/20" };
    if (index === 1) return { bg: "bg-[#E9D5FF]/10", text: "text-[#E9D5FF]", border: "border-[#E9D5FF]/20" };
    if (index === 2) return { bg: "bg-[#FDBA74]/10", text: "text-[#FDBA74]", border: "border-[#FDBA74]/20" };
    return { bg: "bg-white/5", text: "text-white/40", border: "border-transparent" };
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
      className="bg-[#1E1E1E] rounded-[2rem] p-6 flex flex-col border border-white/5 basis-1/2 min-h-0 overflow-hidden"
    >
      <div className="flex justify-between items-center mb-5 shrink-0">
        <h3 className="text-white/90 text-lg font-medium tracking-tight">Leaderboard</h3>
        <span className="bg-[#121212] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white/60 border border-white/5">Global</span>
      </div>
      
      <div className="flex flex-col gap-2 overflow-y-auto pr-2 hide-scroll pb-2">
        {data.map((user, i) => {
          const isMe = user.username === currentUsername;
          const style = getRankStyle(i);
          return (
            <motion.div 
              key={user.username}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`flex items-center gap-3 p-2.5 rounded-2xl border transition-colors cursor-default ${
                isMe ? 'bg-[#252525] border-white/10 ring-1 ring-white/5' : `hover:bg-[#121212] ${style.border}`
              }`}
            >
              <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${style.bg} ${style.text}`}>
                {i + 1}
              </div>
              
              <div className="flex-1 flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white/90 font-semibold truncate">
                    {user.username}
                  </span>
                  {isMe && <span className="bg-white/10 text-white/80 text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">You</span>}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-white/40 font-medium uppercase tracking-wider bg-black/20 px-1.5 rounded-full">{user.tier || "Silver"}</span>
                  {(user.streak || 0) > 2 && <span className="text-[10px] text-[#FDBA74] font-bold flex items-center gap-0.5">🔥 {user.streak}</span>}
                </div>
              </div>

              <div className="text-sm font-bold text-white/90 bg-[#121212] px-3 py-1.5 rounded-full border border-white/5 shadow-inner">
                {user.points.toLocaleString()}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
