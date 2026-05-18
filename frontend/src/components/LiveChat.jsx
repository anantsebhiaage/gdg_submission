import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MOCK_USERS = ["CricketFan88", "Dhoni_is_God", "RCB_Forever", "Virat_fan", "Mahi_Magic", "Hitman_Rulez", "YorkerKing", "SpinnerPro"];
const MOCK_MESSAGES = [
  "Huge six!", 
  "What a delivery 🤯", 
  "Review that!", 
  "Match over!", 
  "He is playing beautifully today.", 
  "Catch dropped! Unbelievable.", 
  "Need boundaries right now.", 
  "Classic cover drive ❤️", 
  "That's out!", 
  "What a tense over..."
];

export default function LiveChat({ id, hoveredSection, setHoveredSection }) {
  const isActive = hoveredSection === id;
  const isDimmed = hoveredSection !== null && hoveredSection !== id;

  const [messages, setMessages] = useState([
    { id: 1, text: "Let's gooo! What a start.", user: "CricketFan88", isMe: false },
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef(null);

  useEffect(() => {
    const minDelay = 2000;
    const maxDelay = 5000;

    let timeoutId;
    const generateMessage = () => {
      const randomUser = MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)];
      const randomText = MOCK_MESSAGES[Math.floor(Math.random() * MOCK_MESSAGES.length)];
      
      setMessages(prev => [...prev.slice(-40), { 
        id: Date.now(), 
        text: randomText, 
        user: randomUser, 
        isMe: false 
      }]);

      const nextDelay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
      timeoutId = setTimeout(generateMessage, nextDelay);
    };

    timeoutId = setTimeout(generateMessage, minDelay);
    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages(prev => [...prev, { id: Date.now(), text: input, user: "Me", isMe: true }]);
    setInput("");
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
      className="bg-[#1E1E1E] rounded-[2rem] p-5 lg:p-6 flex flex-col border border-white/5 basis-1/2 min-h-0 overflow-hidden"
    >
      <div className="flex justify-between items-center mb-4 shrink-0">
        <h3 className="text-white/90 text-lg font-medium tracking-tight px-1">Live Chat</h3>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#A7F3D0] animate-pulse"></span>
          <span className="text-xs text-[#A7F3D0]/70 font-bold tracking-wider uppercase">Live</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto px-1 flex flex-col gap-3 hide-scroll pb-2">
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div 
              key={m.id}
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", bounce: 0.4 }}
              className={`flex flex-col group ${m.isMe ? 'items-end' : 'items-start'}`}
            >
              {!m.isMe && <span className="text-[10px] font-medium text-white/40 ml-3 mb-1 uppercase tracking-wider">{m.user}</span>}
              <div className="flex items-center gap-2">
                <div 
                  className={`px-4 py-2.5 text-[13px] leading-snug shadow-sm max-w-[240px] break-words transition-transform group-hover:scale-[1.02] ${
                    m.isMe 
                      ? 'bg-[#E9D5FF] text-[#121212] rounded-2xl rounded-br-none font-semibold' 
                      : 'bg-[#252525] text-white/87 rounded-2xl rounded-bl-none border border-white/5'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={endRef} />
      </div>

      <form onSubmit={send} className="mt-4 relative shrink-0">
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Send a message..."
          className="w-full bg-[#121212] text-white/90 text-sm rounded-full py-3.5 pl-5 pr-14 outline-none border border-white/10 focus:border-[#E9D5FF]/50 transition-colors shadow-inner"
        />
        <button 
          type="submit" 
          disabled={!input.trim()}
          className="absolute right-1.5 top-1.5 bottom-1.5 bg-[#E9D5FF] disabled:bg-white/10 disabled:text-white/40 text-[#121212] rounded-full px-4 text-xs font-bold hover:bg-[#d8baff] transition-colors"
        >
          Send
        </button>
      </form>
    </motion.div>
  );
}
