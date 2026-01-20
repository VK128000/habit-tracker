import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import authRoutes from "./src/routes/auth.js";
import relapseRoutes from "./src/routes/relapse.js";
import statsRoutes from "./src/routes/stats.js";
import cleanRoutes from "./src/routes/clean.js";

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = "mongodb://127.0.0.1:27017/nofap_pro";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((e) => console.log("Mongo Error:", e));

app.get("/", (req, res) => res.json({ msg: "NoFap Tracker Pro Backend Running" }));

app.use("/api/auth", authRoutes);
app.use("/api/relapse", relapseRoutes);
app.use("/api/clean", cleanRoutes);
app.use("/api/stats", statsRoutes);

app.listen(5000, () => console.log("Server running on http://localhost:5000"));
