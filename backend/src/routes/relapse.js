import express from "express";
import Relapse from "../models/relapse.js";
import CleanDay from "../models/CleanDay.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// add relapse
router.post("/", auth, async (req, res) => {
  try {
    const { date, actress, note } = req.body;
    if (!date || !actress) return res.status(400).json({ msg: "Missing fields" });

    // if relapse on date, remove clean day for that date
    await CleanDay.deleteOne({ userId: req.user.id, date });

    const log = await Relapse.create({
      userId: req.user.id,
      date,
      actress,
      note: note || ""
    });

    res.json(log);
  } catch (e) {
    res.status(500).json({ msg: "Server error" });
  }
});

// get all relapses
router.get("/", auth, async (req, res) => {
  const logs = await Relapse.find({ userId: req.user.id }).sort({ date: 1 });
  res.json(logs);
});

// delete relapse
router.delete("/:id", auth, async (req, res) => {
  await Relapse.deleteOne({ _id: req.params.id, userId: req.user.id });
  res.json({ msg: "Deleted" });
});

// export CSV (FIXED)
router.get("/export/csv", auth, async (req, res) => {
  const logs = await Relapse.find({ userId: req.user.id }).sort({ date: 1 });

  let csv = "date,actress,note\n";
  for (let l of logs) {
    const safeNote = (l.note || "").replaceAll('"', '""');
    const safeActress = (l.actress || "").replaceAll('"', '""');
    csv += `${l.date},"${safeActress}","${safeNote}"\n`;
  }

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=relapses.csv");
  res.send(csv);
});

export default router;
