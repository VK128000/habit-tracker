import express from "express";
import CleanDay from "../models/CleanDay.js";
import Relapse from "../models/relapse.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// mark clean day
router.post("/", auth, async (req, res) => {
  try {
    const { date } = req.body;
    if (!date) return res.status(400).json({ msg: "Missing date" });

    // if clean day, remove relapse on that date (optional)
    await Relapse.deleteMany({ userId: req.user.id, date });

    const day = await CleanDay.create({ userId: req.user.id, date });
    res.json(day);
  } catch (e) {
    // duplicate clean day
    res.status(200).json({ msg: "Already marked clean" });
  }
});

// get clean days
router.get("/", auth, async (req, res) => {
  const days = await CleanDay.find({ userId: req.user.id }).sort({ date: 1 });
  res.json(days);
});

// delete clean day
router.delete("/:date", auth, async (req, res) => {
  await CleanDay.deleteOne({ userId: req.user.id, date: req.params.date });
  res.json({ msg: "Deleted clean day" });
});

export default router;
