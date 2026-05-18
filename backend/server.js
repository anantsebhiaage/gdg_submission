import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { Poll, User } from "./models/Database.js";
import { generateLivePoll, generateHypeCommentary } from "./services/geminiService.js";

dotenv.config();

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

// ─── REST: Leaderboard ─────────────────────────────────────────────────────
app.get("/api/leaderboard", async (req, res) => {
  try {
    const leaders = await User.find().sort({ points: -1 }).limit(10).select("username points -_id");
    res.json(leaders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── REST: Get or create guest user ────────────────────────────────────────
app.post("/api/users/guest", async (req, res) => {
  try {
    const { username } = req.body;
    let user = await User.findOne({ username });
    if (!user) user = await User.create({ username });
    res.json({ username: user.username, points: user.points });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── REST: Latest active poll ───────────────────────────────────────────────
app.get("/api/polls/active", async (req, res) => {
  try {
    const poll = await Poll.findOne({ isActive: true }).sort({ createdAt: -1 });
    res.json(poll);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Live match minute tracker (demo state) ─────────────────────────────────
let currentMatchMinute = 0;
setInterval(() => {
  currentMatchMinute = Math.min(currentMatchMinute + 1, 90);
}, 60000);

// ─── Socket.io ───────────────────────────────────────────────────────────────
io.on("connection", (socket) => {
  console.log(`[+] Client connected: ${socket.id}`);

  // Send current match minute on join
  socket.emit("MATCH_MINUTE_UPDATE", { minute: currentMatchMinute });

  // ── ADMIN_TRIGGER_MOMENT ─────────────────────────────────────────────────
  socket.on("ADMIN_TRIGGER_MOMENT", async (matchContext) => {
    if (!matchContext || typeof matchContext !== "string") return;

    console.log(`[AI] Triggering moment: "${matchContext}"`);
    io.emit("AI_LOADING", { loading: true });

    try {
      // Call both Gemini services concurrently
      const [pollData, commentaryData] = await Promise.all([
        generateLivePoll(matchContext),
        generateHypeCommentary(matchContext),
      ]);

      // Deactivate any existing active polls
      await Poll.updateMany({ isActive: true }, { isActive: false });

      // Save the new poll to MongoDB
      const newPoll = await Poll.create({
        matchMinute: currentMatchMinute,
        matchContext,
        question: pollData.question,
        options: pollData.options.map((o) => ({ text: o.text, votes: 0 })),
        isActive: true,
        totalVotes: 0,
      });

      io.emit("AI_LOADING", { loading: false });

      // Broadcast poll and commentary
      io.emit("NEW_POLL_ACTIVE", {
        pollId: newPoll._id.toString(),
        question: newPoll.question,
        options: newPoll.options.map((o) => ({
          id: o._id.toString(),
          text: o.text,
          votes: 0,
          pct: 0,
        })),
        matchMinute: newPoll.matchMinute,
      });

      io.emit("NEW_COMMENTARY_DROP", {
        commentary: commentaryData.commentary,
        context: matchContext,
        minute: currentMatchMinute,
      });
    } catch (err) {
      io.emit("AI_LOADING", { loading: false });
      io.emit("AI_ERROR", { message: err.message });
      console.error("[AI ERROR]", err.message);
    }
  });

  // ── SUBMIT_VOTE ──────────────────────────────────────────────────────────
  socket.on("SUBMIT_VOTE", async ({ pollId, optionId, username }) => {
    try {
      const poll = await Poll.findById(pollId);
      if (!poll || !poll.isActive) {
        socket.emit("VOTE_ERROR", { message: "Poll is no longer active." });
        return;
      }

      const option = poll.options.id(optionId);
      if (!option) {
        socket.emit("VOTE_ERROR", { message: "Invalid option." });
        return;
      }

      option.votes += 1;
      poll.totalVotes += 1;
      await poll.save();

      // Award points to the user
      await User.findOneAndUpdate(
        { username },
        { $inc: { points: 10 }, $addToSet: { votedPolls: poll._id } },
        { upsert: true, new: true }
      );

      // Broadcast updated vote counts and percentages to all clients
      const updatedOptions = poll.options.map((o) => ({
        id: o._id.toString(),
        text: o.text,
        votes: o.votes,
        pct: poll.totalVotes > 0 ? Math.round((o.votes / poll.totalVotes) * 100) : 0,
      }));

      io.emit("LIVE_VOTE_UPDATE", {
        pollId: poll._id.toString(),
        options: updatedOptions,
        totalVotes: poll.totalVotes,
      });

      // Send updated points back to voter
      const updatedUser = await User.findOne({ username });
      socket.emit("POINTS_UPDATE", { points: updatedUser?.points ?? 0 });
    } catch (err) {
      console.error("[VOTE ERROR]", err.message);
      socket.emit("VOTE_ERROR", { message: err.message });
    }
  });

  // ── SEND_VIBE ────────────────────────────────────────────────────────────
  socket.on("SEND_VIBE", ({ x, y, emoji }) => {
    // Validate and broadcast to ALL clients instantly
    if (typeof x === "number" && typeof y === "number" && typeof emoji === "string") {
      io.emit("RENDER_VIBE", {
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        x,
        y,
        emoji,
      });
    }
  });

  socket.on("disconnect", () => {
    console.log(`[-] Client disconnected: ${socket.id}`);
  });
});

// ─── MongoDB + Server Bootstrap ──────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("[DB] MongoDB connected");
    httpServer.listen(PORT, () => {
      console.log(`[SERVER] NextGen FanZone running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("[DB ERROR]", err.message);
    process.exit(1);
  });
