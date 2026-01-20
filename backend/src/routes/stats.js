import express from "express";
import Relapse from "../models/relapse.js";
import CleanDay from "../models/CleanDay.js";
import User from "../models/user.js";
import auth from "../middleware/auth.js";

const router = express.Router();

function daysBetween(a, b) {
  const d1 = new Date(a + "T00:00:00");
  const d2 = new Date(b + "T00:00:00");
  return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
}

router.get("/", auth, async (req, res) => {
  const logs = await Relapse.find({ userId: req.user.id }).sort({ date: 1 });
  const cleanDays = await CleanDay.find({ userId: req.user.id }).sort({ date: 1 });
  const user = await User.findById(req.user.id);

  const totalRelapses = logs.length;

  const actressCount = {};
  const monthlyCount = {};

  for (let log of logs) {
    actressCount[log.actress] = (actressCount[log.actress] || 0) + 1;
    const month = log.date.slice(0, 7);
    monthlyCount[month] = (monthlyCount[month] || 0) + 1;
  }

  const today = new Date().toISOString().slice(0, 10);

  // baseDate = latest of (last relapse date, streakResetDate)
  let lastRelapseDate = logs.length ? logs[logs.length - 1].date : "";
  let resetDate = user?.streakResetDate || "";

  let baseDate = "";
  if (lastRelapseDate && resetDate) baseDate = lastRelapseDate > resetDate ? lastRelapseDate : resetDate;
  else baseDate = lastRelapseDate || resetDate || "";

  // streak rules:
  // - if baseDate is today => streak = 0
  // - else streak = daysBetween(baseDate, today)
  let streak = 0;
  if (baseDate) streak = Math.max(0, daysBetween(baseDate, today));

  res.json({
    totalRelapses,
    streak,
    baseDate,
    lastRelapseDate,
    streakResetDate: resetDate,
    actressCount,
    monthlyCount,
    cleanDays: cleanDays.map((x) => x.date)
  });
});

export default router;
