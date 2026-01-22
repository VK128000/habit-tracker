import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./src/routes/auth.js";
import relapseRoutes from "./src/routes/relapse.js";
import cleanRoutes from "./src/routes/clean.js";
import statsRoutes from "./src/routes/stats.js";

dotenv.config();

const app = express();

// ✅ Allowed Frontend Origins
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://habit-tracker-8z8z.vercel.app"
];

// ✅ CORS Setup
app.use(
  cors({
    origin: function (origin, cb) {
      // allow requests with no origin (like Postman / server-to-server)
      if (!origin) return cb(null, true);

      if (allowedOrigins.includes(origin)) return cb(null, true);

      return cb(new Error("Not allowed by CORS: " + origin));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// ✅ Preflight support
app.options("*", cors());

app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected (Atlas)"))
  .catch((err) => console.error("❌ Mongo Error:", err));

app.get("/", (req, res) => {
  res.send("NoFap Tracker Backend Running ✅");
});

// ✅ mount routes
app.use("/api/auth", authRoutes);
app.use("/api/relapse", relapseRoutes);
app.use("/api/clean", cleanRoutes);
app.use("/api/stats", statsRoutes);

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ msg: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
