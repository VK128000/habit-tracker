import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/user.js";
import { JWT_SECRET } from "../middleware/auth.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, pass } = req.body;
    if (!name || !email || !pass) return res.status(400).json({ msg: "Missing fields" });

    const ex = await User.findOne({ email });
    if (ex) return res.status(400).json({ msg: "Email already exists" });

    const passHash = await bcrypt.hash(pass, 10);
    const user = await User.create({ name, email, passHash });

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: "30d" });

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (e) {
    res.status(500).json({ msg: "Server error" });
  }
});

// login
router.post("/login", async (req, res) => {
  try {
    const { email, pass } = req.body;
    if (!email || !pass) return res.status(400).json({ msg: "Missing fields" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const ok = await bcrypt.compare(pass, user.passHash);
    if (!ok) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: "30d" });

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (e) {
    res.status(500).json({ msg: "Server error" });
  }
});

// reset streak (today or custom date)
router.post("/reset-streak", auth, async (req, res) => {
  let { date } = req.body;

  if (!date) {
    date = new Date().toISOString().slice(0, 10);
  }

  await User.updateOne({ _id: req.user.id }, { $set: { streakResetDate: date } });

  res.json({ msg: "Streak reset saved", date });
});

export default router;
