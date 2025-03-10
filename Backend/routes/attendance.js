const express = require("express");
const { body, validationResult } = require("express-validator");
const Attendance = require("../models/Attendance");
const fetchuser = require("../middleware/fetchuser");

const router = express.Router();

// Route to mark attendance for the logged-in user
router.post(
  "/mark",
  fetchuser,
  [
    body("className", "Class name is required").notEmpty(),
    body("status", "Status must be either present or absent").isIn(["present", "absent"]),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      // Create a new attendance record linked to the logged-in user
      const attendanceRecord = new Attendance({
        student: req.user.id,
        className: req.body.className,
        status: req.body.status,
      });
      const savedRecord = await attendanceRecord.save();
      res.json(savedRecord);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Route to fetch attendances for the logged-in user
router.get("/view", fetchuser, async (req, res) => {
  try {
    // Find attendance records only for the current user
    const attendanceRecords = await Attendance.find({ student: req.user.id });
    res.json(attendanceRecords);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Route to edit attendances for the logged-in user
router.put("/edit/:id", fetchuser, async (req, res) => {
  try {
    const { className, status } = req.body;
    const newAttendance = {};

    if (className) newAttendance.className = className;
    if (status) newAttendance.status = status;

    // Find the attendance record by ID
    let attendance = await Attendance.findById(req.params.id);
    if (!attendance) {
      return res.status(404).send("Attendance not found");
    }

    // Ensure the logged-in user owns the attendance record
    // (Assuming you stored the user ID in the 'student' field when creating the record)
    if (attendance.student.toString() !== req.user.id) {
      return res.status(401).send("Not allowed");
    }

    // Update the attendance record and return the updated record
    attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      { $set: newAttendance },
      { new: true }
    );
    res.json(attendance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Route to delete an attendance record for the logged-in user
router.delete("/delete/:id", fetchuser, async (req, res) => {
  try {
    // Find the attendance record by ID
    let attendance = await Attendance.findById(req.params.id);
    if (!attendance) {
      return res.status(404).send("Attendance not found");
    }
    // Ensure the logged-in user owns the attendance record
    if (attendance.student.toString() !== req.user.id) {
      return res.status(401).send("Not allowed");
    }
    // Delete the attendance record
    await Attendance.findByIdAndDelete(req.params.id);
    res.json({ success: "Attendance record deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Fetch attendance records for a specific subject
router.get("/view/:subject", fetchuser, async (req, res) => {
  try {
    const { subject } = req.params;
    const records = await Attendance.find({
      student: req.user.id,
      className: subject,
    });
    res.json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/mark-multiple", fetchuser, async (req, res) => {
  try {
    const { className, dates } = req.body;

    await Promise.all(
      dates.map(async ({ date, status }) => {
        let record = await Attendance.findOne({
          student: req.user.id,
          className,
          date,
        });

        if (!record) {
          record = new Attendance({
            student: req.user.id,
            className,
            date,
            status,
          });
          await record.save();
        } else {
          record.status = status; // Update existing record's status
          await record.save();
        }
      })
    );

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
