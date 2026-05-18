import { useState } from "react";
import { Zap, Loader2 } from "lucide-react";

export default function AdminPanel({ socket, isLoading }) {
  const [context, setContext] = useState("");
  const [isSending, setIsSending] = useState(false);

  const trigger = (text) => {
    const val = (text || context).trim();
    if (!val || isLoading) return;
    setIsSending(true);
    socket.emit("ADMIN_TRIGGER_MOMENT", val);
    setContext("");
    setTimeout(() => setIsSending(false), 2000);
  };

  return (
    <div className="fixed top-20 lg:top-6 right-4 lg:right-6 z-[100] opacity-10 hover:opacity-100 transition-opacity duration-300 w-64 bg-[#1C1C1C]/95 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/10">
      <div className="flex items-center gap-2 mb-4 text-white/60">
        <Zap size={16} className="text-[#A7F3D0]" />
        <span className="text-xs font-bold tracking-widest uppercase">Admin Override</span>
      </div>
      <textarea
        value={context}
        onChange={(e) => setContext(e.target.value)}
        placeholder="Match moment..."
        className="w-full bg-[#101010] text-white/90 rounded-2xl p-3 text-sm resize-none outline-none border border-white/10 focus:border-[#A7F3D0]/50 transition-colors mb-3 shadow-inner"
        rows={2}
      />
      <button
        onClick={() => trigger()}
        disabled={!context.trim() || isLoading || isSending}
        className="w-full bg-[#E9D5FF] hover:bg-[#d8baff] disabled:bg-white/10 disabled:text-white/40 text-[#101010] rounded-full py-2.5 text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-md"
      >
        {isLoading || isSending ? <Loader2 size={16} className="animate-spin" /> : "Trigger AI Moment"}
      </button>
      
      <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-3">
        <button onClick={() => trigger("Penalty kick awarded")} className="text-xs text-left font-medium text-white/40 hover:text-[#A7F3D0] transition-colors truncate">↗ Penalty kick awarded</button>
        <button onClick={() => trigger("Amazing save by the goalie")} className="text-xs text-left font-medium text-white/40 hover:text-[#A7F3D0] transition-colors truncate">↗ Amazing save by the goalie</button>
        <button onClick={() => trigger("Red card for dangerous tackle")} className="text-xs text-left font-medium text-white/40 hover:text-[#A7F3D0] transition-colors truncate">↗ Red card for dangerous tackle</button>
      </div>
    </div>
  );
}
