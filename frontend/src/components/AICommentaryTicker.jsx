import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot } from "lucide-react";

export default function AICommentaryTicker({ commentary }) {
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const intervalRef = useRef(null);
  const fallbackCommentary = "Gemini AI is analyzing the pitch dynamics. Stand by for insights.";

  useEffect(() => {
    const textToType = commentary || fallbackCommentary;
    clearInterval(intervalRef.current);
    setDisplayText("");
    setIsTyping(true);

    let i = 0;
    intervalRef.current = setInterval(() => {
      setDisplayText(textToType.slice(0, i + 1));
      i++;
      if (i >= textToType.length) {
        clearInterval(intervalRef.current);
        setIsTyping(false);
      }
    }, 25); // Fast typewriter

    return () => clearInterval(intervalRef.current);
  }, [commentary]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#232323]/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl p-4 lg:p-5 flex items-start gap-3 lg:gap-4 relative z-20 mx-4 lg:mx-10 w-[calc(100%-32px)] lg:w-auto mt-[-20px] lg:mt-[-30px]"
    >
      <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-[#A7F3D0]/10 flex items-center justify-center shrink-0 border border-[#A7F3D0]/20 relative shadow-inner">
        <Bot size={18} className="text-[#A7F3D0]" />
        {isTyping && (
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A7F3D0] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#A7F3D0]"></span>
          </span>
        )}
      </div>
      <div className="flex flex-col pt-0.5 lg:pt-1 min-w-0">
        <span className="text-[9px] lg:text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold mb-1">Gemini AI Insights</span>
        <p className={`text-white/90 text-xs lg:text-sm font-medium leading-relaxed ${isTyping ? 'typewriter-cursor' : ''}`}>
          {displayText}
        </p>
      </div>
    </motion.div>
  );
}
