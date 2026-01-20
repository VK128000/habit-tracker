import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passHash: { type: String, required: true },

    // for manual reset streak
    streakResetDate: { type: String, default: "" } // YYYY-MM-DD
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
