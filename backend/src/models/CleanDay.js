import mongoose from "mongoose";

const cleanDaySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: String, required: true } // YYYY-MM-DD
  },
  { timestamps: true }
);

// unique clean day per user per date
cleanDaySchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model("CleanDay", cleanDaySchema);
