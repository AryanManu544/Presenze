import React, { useState, useEffect } from "react";
import axios from "axios";

const MarkMonthlyAttendance = ({ mode, showalert }) => {
  const [subjects, setSubjects] = useState([]); // List of subjects
  const [selectedSubject, setSelectedSubject] = useState(""); // Selected subject
  const [dates, setDates] = useState([]); // Dates of the selected subject
  const [attendance, setAttendance] = useState({}); // Attendance state
  const [timetable, setTimetable] = useState([]); // Timetable data

  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:4000";

  // Fetch timetable and subjects on mount
  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_BASE_URL}/api/timetable`, {
          headers: { "auth-token": token },
        });
        setTimetable(response.data);

        // Extract unique subjects from timetable
        const uniqueSubjects = [
          ...new Set(response.data.map((entry) => entry.subject)),
        ];
        setSubjects(uniqueSubjects);
      } catch (error) {
        console.error("Error fetching timetable:", error);
        showalert("Error fetching timetable.", "danger");
      }
    };

    fetchTimetable();
  }, [API_BASE_URL, showalert]);

  // Generate all dates in the current month that match the schedule
  // Helper function to format a date as YYYY-MM-DD in local time
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Generate all dates in the current month that match the schedule
  const generateDatesForSubject = (subjectEntries, markedDates) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const subjectDates = [];

    // Iterate over each day of the week from timetable
    subjectEntries.forEach((entry) => {
      const dayOfWeek = entry.day; // e.g., "Wednesday"

      // Find the first occurrence of this weekday in the current month
      let firstDayOfMonth = new Date(year, month, 1);
      while (firstDayOfMonth.getDay() !== getDayIndex(dayOfWeek)) {
        firstDayOfMonth.setDate(firstDayOfMonth.getDate() + 1);
      }

      // Generate all occurrences of this weekday in the current month
      for (
        let date = new Date(firstDayOfMonth);
        date.getMonth() === month;
        date.setDate(date.getDate() + 7) // Add 7 days to get the next occurrence
      ) {
        const formattedDate = formatDate(date); // Use local date formatting
        subjectDates.push({
          date: formattedDate,
          status: markedDates[formattedDate] || null, // Use status from markedDates or default to null
        });
      }
    });

    return subjectDates;
  };

  // Helper function to convert weekday name to index (e.g., "Sunday" -> 0)
  const getDayIndex = (dayName) => {
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return daysOfWeek.indexOf(dayName);
  };

  // Fetch dates for the selected subject
  const handleSubjectChange = async (e) => {
    const subject = e.target.value;
    setSelectedSubject(subject);

    if (!subject) return;

    try {
      const token = localStorage.getItem("token");

      // Fetch attendance records for the selected subject
      const attendanceResponse = await axios.get(
        `${API_BASE_URL}/api/attendance/view/${subject}`,
        { headers: { "auth-token": token } }
      );

      // Map attendance records to a dictionary with ISO date keys
      const markedDates = attendanceResponse.data.reduce((acc, record) => {
        const isoDate = new Date(record.date).toISOString().split("T")[0];
        acc[isoDate] = record.status; // Store status ("present" or "absent")
        return acc;
      }, {});

      // Filter timetable entries for this subject
      const subjectEntries = timetable.filter(
        (entry) => entry.subject === subject
      );

      // Generate dates based on timetable and attendance records
      const generatedDates = generateDatesForSubject(subjectEntries, markedDates);
      setDates(generatedDates);
    } catch (error) {
      console.error("Error fetching dates:", error);
      showalert("Error fetching dates.", "danger");
    }
  };

  // Toggle attendance status between "present", "absent", and null
  const toggleStatus = (date) => {
    setAttendance((prev) => ({
      ...prev,
      [date]:
        prev[date] === "present"
          ? "absent"
          : prev[date] === "absent"
          ? null
          : "present",
    }));
  };

  // Submit marked attendance
  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      const markedDates = Object.keys(attendance).map((date) => ({
        date,
        status: attendance[date],
      }));

      await axios.post(
        `${API_BASE_URL}/api/attendance/mark-multiple`,
        { className: selectedSubject, dates: markedDates },
        { headers: { "auth-token": token } }
      );

      showalert("Attendance marked successfully!", "success");
    } catch (error) {
      console.error("Error marking attendance:", error);
      showalert("Error marking attendance.", "danger");
    }
  };

  return (
    <div
      className={`container ${mode === "dark" ? "text-light" : ""}`}
      style={{
        maxWidth: "600px",
        margin: "4rem auto",
        padding: "1rem",
        borderRadius: "8px",
        backgroundColor: mode === "dark" ? "#222222" : "#ffffff",
        boxShadow:
          mode === "dark"
            ? "0px 4px 10px rgba(0,0,0,0.8)"
            : "0px 4px 10px rgba(0,0,0,0.2)",
      }}
    >
      <h2 className="text-center">Mark Monthly Attendance</h2>

      {/* Subject Dropdown */}
      <div className="mb-3">
        <label htmlFor="subject" className="form-label">
          Select Subject
        </label>
        <select
          id="subject"
          className="form-select"
          value={selectedSubject}
          onChange={handleSubjectChange}
        >
          <option value="">Select a subject</option>
          {subjects.map((subject) => (
            <option key={subject} value={subject}>
              {subject}
            </option>
          ))}
        </select>
      </div>

      {/* Dates Checkboxes */}
      {dates.length > 0 && (
        <div>
          <h5>Mark Attendance</h5>
          <ul className="list-group">
            {dates.map(({ date, status }) => (
              <li key={date} className="list-group-item d-flex justify-content-between align-items-center">
                <span>{date}</span>
                <span>
                  {status === "present" && (
                    <span style={{ color: "green", marginRight: "10px" }}>
                      ✅ Present
                    </span>
                  )}
                  {status === "absent" && (
                    <span style={{ color: "red", marginRight: "10px" }}>
                      ❌ Absent
                    </span>
                  )}
                  {!status && (
                    <span style={{ color: "#888", marginRight: "10px" }}>
                      ⬜ Not Marked
                    </span>
                  )}
                  <button
                    className={`btn btn-sm ${
                      attendance[date] === "present" || status === "present"
                        ? "btn-success"
                        : attendance[date] === "absent" || status === "absent"
                        ? "btn-danger"
                        : ""
                    }`}
                    onClick={() => toggleStatus(date)}
                  >
                    {attendance[date] === "present" || status === "present"
                      ? `✅`
                      : attendance[date] === "absent" || status === "absent"
                      ? `❌`
                      : `Mark`}
                  </button>
                </span>
              </li>
            ))}
          </ul>
          <button
            className="btn btn-primary mt-3"
            onClick={handleSubmit}
            disabled={!selectedSubject}
          >
            Submit Attendance
          </button>
        </div>
      )}
    </div>
  );
};

export default MarkMonthlyAttendance;