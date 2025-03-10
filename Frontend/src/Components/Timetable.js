import React, { useState, useEffect } from "react";
import axios from "axios";

const Timetable = ({ mode, showalert }) => {
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const today = daysOfWeek[new Date().getDay()];

  const [timetableEntries, setTimetableEntries] = useState([]);
  const [newEntry, setNewEntry] = useState({
    day: "Monday",
    time: "",
    subject: "",
  });
  const [editEntry, setEditEntry] = useState(null); // For editing an entry
  const [viewAll, setViewAll] = useState(false); // Toggle between today's and all classes

  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:4000";

  // Fetch timetable entries on mount
  useEffect(() => {
    const fetchTimetableEntries = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_BASE_URL}/api/timetable`, {
          headers: { "auth-token": token },
        });
        setTimetableEntries(response.data);
      } catch (error) {
        console.error("Error fetching timetable entries:", error);
        showalert("Error fetching timetable entries.", "danger");
      }
    };

    fetchTimetableEntries();
  }, [API_BASE_URL, showalert]);

  // Handle input changes for adding/editing entries
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editEntry) {
      setEditEntry((prev) => ({ ...prev, [name]: value }));
    } else {
      setNewEntry((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Add a new timetable entry
  const handleAddEntry = async (e) => {
    e.preventDefault();
    if (!newEntry.time || !newEntry.subject) {
      showalert("Please fill in all fields.", "danger");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_BASE_URL}/api/timetable`,
        newEntry,
        { headers: { "auth-token": token } }
      );
      setTimetableEntries((prev) => [...prev, response.data]);
      setNewEntry({ day: "Monday", time: "", subject: "" });
      showalert("Timetable entry added successfully!", "success");
    } catch (error) {
      console.error("Error adding timetable entry:", error);
      showalert("Error adding timetable entry.", "danger");
    }
  };

  // Edit an existing timetable entry
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API_BASE_URL}/api/timetable/${editEntry._id}`,
        editEntry,
        { headers: { "auth-token": token } }
      );
      setTimetableEntries((prev) =>
        prev.map((entry) =>
          entry._id === editEntry._id ? response.data : entry
        )
      );
      setEditEntry(null);
      showalert("Timetable entry updated successfully!", "success");
    } catch (error) {
      console.error("Error updating timetable entry:", error);
      showalert("Error updating timetable entry.", "danger");
    }
  };

  // Delete a timetable entry
  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/api/timetable/${id}`, {
        headers: { "auth-token": token },
      });
      setTimetableEntries((prev) => prev.filter((entry) => entry._id !== id));
      showalert("Timetable entry deleted successfully!", "success");
    } catch (error) {
      console.error("Error deleting timetable entry:", error);
      showalert("Error deleting timetable entry.", "danger");
    }
  };

  // Filter today's entries or view all classes
  const displayedEntries = viewAll
    ? timetableEntries
    : timetableEntries.filter((entry) => entry.day === today);

  return (
    <div
      className={`container ${mode === "dark" ? "text-light" : ""}`}
      style={{
        marginTop: "4rem",
        padding: "2rem",
        backgroundColor: mode === "dark" ? "#222222" : "#ffffff",
        borderRadius: "8px",
        boxShadow:
          mode === "dark"
            ? "0px 4px 10px rgba(0,0,0,0.8)"
            : "0px 4px 10px rgba(0,0,0,0.2)",
      }}
    >
      <h2 className="text-center">Timetable</h2>

      {/* Form to add/edit a timetable entry */}
      <form onSubmit={editEntry ? handleEditSubmit : handleAddEntry} className="mb-4">
        <div className="row g-3">
          <div className="col-md-3">
            <select
              name="day"
              className="form-select"
              value={editEntry ? editEntry.day : newEntry.day}
              onChange={handleInputChange}
            >
              {daysOfWeek.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <input
              type="text"
              name="time"
              className="form-control"
              placeholder="Time (e.g., 9:00 - 9:50)"
              value={editEntry ? editEntry.time : newEntry.time}
              onChange={handleInputChange}
            />
          </div>
          <div className="col-md-4">
            <input
              type="text"
              name="subject"
              className="form-control"
              placeholder="Class Name"
              value={editEntry ? editEntry.subject : newEntry.subject}
              onChange={handleInputChange}
            />
          </div>
          <div className="col-md-2">
            <button type="submit" className="btn btn-primary w-100">
              {editEntry ? "Update Entry" : "Add Entry"}
            </button>
          </div>
        </div>
      </form>

      {/* Toggle View Button */}
      <button
        className="btn btn-outline-secondary mb-3"
        onClick={() => setViewAll(!viewAll)}
      >
        {viewAll ? "View Today's Classes" : "View All Classes"}
      </button>

      {/* Display Classes */}
      <h3 className="text-center">
        {viewAll ? "All Classes" : `Today's Classes (${today})`}
      </h3>
      {displayedEntries.length > 0 ? (
        <ul className="list-group">
          {displayedEntries.map((entry) => (
            <li
              key={entry._id}
              className={`list-group-item ${mode === "dark" ? "bg-dark text-light" : ""
                }`}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderColor: mode === "dark" ? "#444444" : "#dddddd",
              }}
            >
              <div>
                <strong>{entry.time}</strong> - {entry.subject} ({entry.day})
              </div>
              <div>
                <i
                  className="fa-regular fa-pen-to-square mx-2"
                  style={{ cursor: "pointer" }}
                  onClick={() => setEditEntry(entry)}
                ></i>

                <i
                  className="fa-solid fa-trash-can my-1 mx-2"
                  style={{ cursor: "pointer", color: mode === 'dark' ? 'white' : 'black' }}
                  onClick={() => handleDelete(entry._id)}>
                </i>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center">No classes scheduled!</p>
      )}
    </div>
  );
};

export default Timetable;