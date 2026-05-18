import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    points: {
      type: Number,
      default: 0,
    },
    votedPolls: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Poll",
      },
    ],
  },
  { timestamps: true }
);

userSchema.index({ points: -1 });

const pollOptionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  votes: { type: Number, default: 0 },
});

const pollSchema = new mongoose.Schema(
  {
    matchMinute: { type: Number, required: true },
    matchContext: { type: String, required: true },
    question: { type: String, required: true },
    options: [pollOptionSchema],
    isActive: { type: Boolean, default: true },
    totalVotes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

pollSchema.index({ isActive: 1, createdAt: -1 });

const User = mongoose.model("User", userSchema);
const Poll = mongoose.model("Poll", pollSchema);

export { User, Poll };
