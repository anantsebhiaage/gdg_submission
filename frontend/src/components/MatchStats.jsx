import { motion } from "framer-motion";

export default function MatchStats({ id, hoveredSection, setHoveredSection }) {
  const isActive = hoveredSection === id;
  const isDimmed = hoveredSection !== null && hoveredSection !== id;

  const topStats = [
    { label: "Possession", home: 62, away: 38, homeColor: "bg-[#A7F3D0]", awayColor: "bg-[#E9D5FF]" },
    { label: "Pass Accuracy", home: 88, away: 74, homeColor: "bg-[#A7F3D0]", awayColor: "bg-[#E9D5FF]" },
    { label: "Shots on Target", home: 7, away: 3, homeMax: 10, awayMax: 10, homeColor: "bg-[#A7F3D0]", awayColor: "bg-[#E9D5FF]" }
  ];

  const denseStats = [
    { label: "Duels Won", home: 45, away: 32 },
    { label: "Interceptions", home: 12, away: 8 },
    { label: "Tackles", home: 18, away: 22 },
    { label: "Clearances", home: 5, away: 15 },
    { label: "Corner Kicks", home: 8, away: 2 },
    { label: "Fouls Committed", home: 9, away: 14 },
    { label: "Yellow Cards", home: 1, away: 3 },
    { label: "Red Cards", home: 0, away: 0 },
    { label: "Offsides", home: 3, away: 1 },
    { label: "Key Passes", home: 14, away: 5 },
    { label: "Big Chances Missed", home: 2, away: 0 },
    { label: "Goalkeeper Saves", home: 2, away: 5 },
    { label: "Crosses", home: 18, away: 12 },
    { label: "Throw-ins", home: 22, away: 25 },
    { label: "Free Kicks", home: 14, away: 9 },
  ];

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
      className="bg-[#1E1E1E] rounded-[2rem] p-6 flex flex-col border border-white/5 relative overflow-hidden basis-1/2 min-h-0"
    >
      <div className="flex justify-between items-center mb-5 shrink-0">
        <h3 className="text-white/90 text-lg font-medium tracking-tight">Match Stats</h3>
        <div className="flex gap-4 text-xs font-bold uppercase tracking-wider">
          <span className="text-[#A7F3D0]">Home</span>
          <span className="text-[#E9D5FF]">Away</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-3 -mr-3 flex flex-col gap-6 hide-scroll pb-4">
        <div className="flex flex-col gap-5">
          {topStats.map((stat, i) => {
            const homePct = stat.homeMax ? (stat.home / Math.max(stat.homeMax, stat.home)) * 100 : stat.home;
            const awayPct = stat.awayMax ? (stat.away / Math.max(stat.awayMax, stat.away)) * 100 : stat.away;
            return (
              <motion.div 
                key={i} 
                whileHover={{ scale: 1.02 }}
                className="flex flex-col gap-2 p-2 rounded-2xl hover:bg-white/5 transition-colors cursor-default"
              >
                <div className="flex justify-between text-xs text-white/60 font-medium px-1">
                  <span className="text-white/90 font-bold">{stat.home}</span>
                  <span className="uppercase tracking-widest text-[10px]">{stat.label}</span>
                  <span className="text-white/90 font-bold">{stat.away}</span>
                </div>
                <div className="flex gap-1 h-3 w-full">
                  <div className="flex-1 bg-[#121212] rounded-full overflow-hidden flex justify-end">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${homePct}%` }}
                      transition={{ type: "spring", bounce: 0.2, duration: 1.5 }}
                      className={`h-full ${stat.homeColor} rounded-full`}
                    />
                  </div>
                  <div className="flex-1 bg-[#121212] rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${awayPct}%` }}
                      transition={{ type: "spring", bounce: 0.2, duration: 1.5 }}
                      className={`h-full ${stat.awayColor} rounded-full`}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <hr className="border-white/5" />

        <div className="flex flex-col gap-1">
          {denseStats.map((stat, i) => (
            <motion.div 
              key={i}
              whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
              className="flex justify-between items-center py-2 px-3 rounded-xl transition-colors cursor-default group"
            >
              <span className="w-8 text-left text-xs font-bold text-white/80 group-hover:text-[#A7F3D0] transition-colors">{stat.home}</span>
              <span className="text-[11px] font-medium text-white/40 uppercase tracking-widest">{stat.label}</span>
              <span className="w-8 text-right text-xs font-bold text-white/80 group-hover:text-[#E9D5FF] transition-colors">{stat.away}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
