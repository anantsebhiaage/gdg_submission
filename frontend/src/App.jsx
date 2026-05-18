import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { LayoutGroup } from "framer-motion";
import MatchStats from "./components/MatchStats";
import Timeline from "./components/Timeline";
import Leaderboard from "./components/Leaderboard";
import LiveChat from "./components/LiveChat";
import LiveBroadcastMock from "./components/LiveBroadcastMock";
import AICommentaryTicker from "./components/AICommentaryTicker";
import PredictionZone from "./components/PredictionZone";
import AdminPanel from "./components/AdminPanel";

const SOCKET_URL = "http://localhost:5000";

function getGuestUser() {
  let u = localStorage.getItem("fanzone_username");
  if (!u) {
    u = `Fan_${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    localStorage.setItem("fanzone_username", u);
  }
  return u;
}

export default function App() {
  const [socket, setSocket] = useState(null);
  const [username] = useState(getGuestUser);
  const [activePoll, setActivePoll] = useState(null);
  const [commentary, setCommentary] = useState("");
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [vibes, setVibes] = useState([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [points, setPoints] = useState(0);
  const [matchMinute, setMatchMinute] = useState(0);

  // Global hover state for the elastic grid
  const [hoveredSection, setHoveredSection] = useState(null);

  useEffect(() => {
    const s = io(SOCKET_URL, { transports: ["websocket"] });
    setSocket(s);

    s.on("connect", () => {
      fetch(`${SOCKET_URL}/api/users/guest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username })
      }).then(r => r.json()).then(u => setPoints(u.points || 0)).catch(() => {});
    });

    s.on("MATCH_MINUTE_UPDATE", ({ minute }) => setMatchMinute(minute));
    s.on("AI_LOADING", ({ loading }) => setIsAiLoading(loading));
    
    s.on("NEW_POLL_ACTIVE", (poll) => { setActivePoll(poll); });
    s.on("LIVE_VOTE_UPDATE", ({ pollId, options, totalVotes }) => {
      setActivePoll(prev => {
        if (!prev || prev.pollId !== pollId) return prev;
        return { ...prev, options, totalVotes };
      });
    });
    s.on("NEW_COMMENTARY_DROP", ({ commentary }) => setCommentary(commentary));
    s.on("RENDER_VIBE", (vibe) => setVibes(prev => [...prev.slice(-30), vibe]));
    s.on("POINTS_UPDATE", ({ points }) => setPoints(points));

    const fetchLb = () => {
      fetch(`${SOCKET_URL}/api/leaderboard`)
        .then(r => r.json())
        .then(setLeaderboardData)
        .catch(() => {});
    };
    fetchLb();
    const interval = setInterval(fetchLb, 10000);

    return () => {
      s.disconnect();
      clearInterval(interval);
    };
  }, [username]);

  const handleVote = (optionId) => {
    if (socket && activePoll) {
      socket.emit("SUBMIT_VOTE", { pollId: activePoll.pollId, optionId, username });
    }
  };

  return (
    <div className="bg-[#121212] h-screen w-screen flex flex-col font-sans antialiased text-white/87 overflow-hidden">
      {socket && <AdminPanel socket={socket} isLoading={isAiLoading} />}

      {/* Top Navigation */}
      <header className="px-4 lg:px-8 py-3 lg:py-4 flex justify-between items-center bg-[#121212] z-50 shrink-0 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-[#1E1E1E] rounded-full flex items-center justify-center font-bold text-sm lg:text-lg border border-white/10 text-[#E9D5FF]">
            FZ
          </div>
          <h1 className="text-xl lg:text-2xl font-semibold tracking-tight text-white/90">FanZone</h1>
        </div>
        <div className="flex items-center gap-4 lg:gap-6">
          <div className="bg-[#1E1E1E] px-4 py-1.5 lg:py-2 rounded-full border border-white/5 flex items-center gap-2 shadow-inner">
            <span className="text-white/40 text-xs lg:text-sm font-medium uppercase tracking-wider">Points</span>
            <span className="text-[#A7F3D0] font-bold text-sm lg:text-lg">{points.toLocaleString()}</span>
          </div>
          <div className="hidden lg:flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#E9D5FF] text-[#121212] flex items-center justify-center font-bold text-sm shadow-md">
              {username.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white/90">{username}</span>
              <span className="text-[10px] text-[#A7F3D0] font-bold flex items-center gap-1.5 tracking-wider uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-[#A7F3D0] animate-pulse"></span> Live
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Responsive Grid with LayoutGroup */}
      <LayoutGroup>
        <main className="flex-1 overflow-y-auto lg:overflow-hidden lg:grid lg:grid-cols-[1.1fr_1.5fr_1.1fr] lg:gap-6 lg:p-6 w-full max-w-[1600px] mx-auto pb-6 lg:pb-0">
          
          {/* On Mobile: Video is sticky at the top. On Desktop: It's the center column. */}
          <div className="lg:hidden sticky top-0 z-40 bg-[#121212] pb-4 px-4 pt-4 shadow-[0_10px_30px_rgba(18,18,18,0.9)]">
            <LiveBroadcastMock id="mobile_video" hoveredSection={hoveredSection} setHoveredSection={setHoveredSection} socket={socket} vibes={vibes} setVibes={setVibes} matchMinute={matchMinute} />
            <AICommentaryTicker commentary={commentary} />
          </div>

          {/* Left Column (Stats & Timeline) */}
          <div className="flex flex-col gap-6 h-auto lg:h-full px-4 lg:px-0 mt-4 lg:mt-0 order-2 lg:order-1 lg:overflow-hidden">
            <MatchStats id="matchStats" hoveredSection={hoveredSection} setHoveredSection={setHoveredSection} />
            <Timeline id="timeline" hoveredSection={hoveredSection} setHoveredSection={setHoveredSection} />
          </div>

          {/* Center Column (Live Core) - Desktop only */}
          <div className="hidden lg:flex flex-col h-full gap-6 order-1 lg:order-2 overflow-hidden">
            <div className="relative shrink-0 flex flex-col basis-auto elastic-transition" style={{ flexGrow: (hoveredSection === 'broadcast') ? 1.2 : 1 }}>
              <LiveBroadcastMock id="broadcast" hoveredSection={hoveredSection} setHoveredSection={setHoveredSection} socket={socket} vibes={vibes} setVibes={setVibes} matchMinute={matchMinute} />
              <div className="absolute -bottom-6 left-0 right-0 z-30 flex justify-center">
                <AICommentaryTicker commentary={commentary} />
              </div>
            </div>
            
            <PredictionZone id="predictionZone" hoveredSection={hoveredSection} setHoveredSection={setHoveredSection} poll={activePoll} onVote={handleVote} />
          </div>

          {/* Mobile Prediction Zone (appears inline) */}
          <div className="lg:hidden px-4 mt-8 order-3 relative z-30 min-h-[300px]">
             <PredictionZone id="predictionZoneMobile" hoveredSection={hoveredSection} setHoveredSection={setHoveredSection} poll={activePoll} onVote={handleVote} />
          </div>

          {/* Right Column (Leaderboard & Chat) */}
          <div className="flex flex-col gap-6 h-auto lg:h-full px-4 lg:px-0 mt-6 lg:mt-0 order-4 lg:order-3 lg:overflow-hidden">
            <Leaderboard id="leaderboard" hoveredSection={hoveredSection} setHoveredSection={setHoveredSection} leaderboardData={leaderboardData} currentUsername={username} />
            <LiveChat id="liveChat" hoveredSection={hoveredSection} setHoveredSection={setHoveredSection} />
          </div>

        </main>
      </LayoutGroup>
    </div>
  );
}
