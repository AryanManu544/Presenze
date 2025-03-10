const mongoose = require("mongoose");
const { Schema } = mongoose;

const TimetableSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  day: { type: String, required: true },
  time: { type: String, required: true },
  subject: { type: String, required: true },
});

module.exports = mongoose.model("Timetable", TimetableSchema);