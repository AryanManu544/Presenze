const express = require("express");
const router = express.Router();
const fetchuser = require("../middleware/fetchuser");
const Timetable = require("../models/Timetable");

// Create a new timetable entry
router.post("/", fetchuser, async (req, res) => {
  try {
    const { day, time, subject } = req.body;
    const entry = new Timetable({
      student: req.user.id,
      day,
      time,
      subject,
    });
    const savedEntry = await entry.save();
    res.json(savedEntry);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get timetable entries for the logged-in user
router.get("/", fetchuser, async (req, res) => {
  try {
    const entries = await Timetable.find({ student: req.user.id });
    res.status(200).json(entries);
  } catch (error) {
    console.error("Error fetching timetable entries:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Update a timetable entry
router.put("/:id", fetchuser, async (req, res) => {
  try {
    const { day, time, subject } = req.body;
    const updatedEntry = {};

    if (day) updatedEntry.day = day;
    if (time) updatedEntry.time = time;
    if (subject) updatedEntry.subject = subject;

    let entry = await Timetable.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ error: "Timetable entry not found" });
    }

    // Ensure the logged-in user owns the timetable entry
    if (entry.student.toString() !== req.user.id) {
      return res.status(401).json({ error: "Not authorized" });
    }

    entry = await Timetable.findByIdAndUpdate(
      req.params.id,
      { $set: updatedEntry },
      { new: true }
    );
    res.json(entry);
  } catch (error) {
    console.error("Error updating timetable entry:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete a timetable entry
router.delete("/:id", fetchuser, async (req, res) => {
  try {
    let entry = await Timetable.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ error: "Timetable entry not found" });
    }

    // Ensure the logged-in user owns the timetable entry
    if (entry.student.toString() !== req.user.id) {
      return res.status(401).json({ error: "Not authorized" });
    }

    await Timetable.findByIdAndDelete(req.params.id);
    res.json({ success: "Timetable entry deleted" });
  } catch (error) {
    console.error("Error deleting timetable entry:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;