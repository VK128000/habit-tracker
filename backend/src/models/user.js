import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passHash: { type: String, required: true },

    // Manual streak reset
    streakResetDate: { type: String, default: "" }, // YYYY-MM-DD

    // Password reset
    // Only the hash of the reset token is stored.
    passwordResetTokenHash: {
      type: String,
      default: ""
    },

    passwordResetExpires: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);