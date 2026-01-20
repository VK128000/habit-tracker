import mongoose from "mongoose";

const relapseSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    actress: { type: String, required: true },
    note: { type: String, default: "" }
  },
  { timestamps: true }
);

export default mongoose.model("Relapse", relapseSchema);
