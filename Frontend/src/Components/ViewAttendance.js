import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AttendancePieCharts from './AttendancePieCharts';
import EditAttendanceModal from './EditAttendanceModal';

const ViewAttendance = ({ mode, showalert }) => {
  const [records, setRecords] = useState([]);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [showRawRecords, setShowRawRecords] = useState(true);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:4000";

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_BASE_URL}/api/attendance/view`, {
          headers: { "auth-token": token }
        });
        setRecords(response.data);
      } catch (err) {
        setError("Error fetching attendance records.");
        console.error(err);
      }
    };
    fetchAttendance();
  }, [API_BASE_URL]);

  // Group records by subject (assuming subject is in record.className)
  const groupedRecords = records.reduce((groups, record) => {
    const subject = record.className;
    if (!groups[subject]) {
      groups[subject] = [];
    }
    groups[subject].push(record);
    return groups;
  }, {});

  // Determine background color based on attendance percentage
  const getAttendanceColor = (percentage) => {
    if (percentage >= 90) return "green";
    else if (percentage >= 75) return "yellow";
    else return "red";
  };

  // Example handler to delete all records for a subject
  const handleDeleteSubject = async (subject) => {
    // This is an example: adjust according to your API.
    try {
      const token = localStorage.getItem("token");
      // Assume you have an API endpoint to delete all records for a subject
      await axios.delete(`${API_BASE_URL}/api/attendance/deleteSubject/${subject}`, {
        headers: { "auth-token": token }
      });
      // Filter out the records for that subject
      setRecords(records.filter(record => record.className !== subject));
      showalert(`Deleted all records for ${subject}`, "success");
    } catch (err) {
      console.error(err);
      showalert("Error deleting subject records", "danger");
    }
  };

  // Example handler to edit a subject group – you might decide how to handle group edits
  const handleEditSubject = (subject) => {
    // For example, select the first record from that group to edit
    const subjectRecords = groupedRecords[subject];
    if (subjectRecords && subjectRecords.length > 0) {
      setSelectedAttendance(subjectRecords[0]);
      setShowModal(true);
    }
  };

  const toggleRawRecords = () => {
    setShowRawRecords(!showRawRecords);
  };

  const containerClass = mode === "dark" ? "bg-dark text-light" : "bg-light text-dark";

  return (
    <div className={containerClass}>
      <h2>Attendance Records</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      
      {/* Toggle Raw Records Button */}
      <button className="btn btn-outline-info mb-3" onClick={toggleRawRecords}>
        {showRawRecords ? "Hide Subjects List" : "Show Subjects List"}
      </button>
      
      {showRawRecords && (
        // Render grouped records with container colors and borders
        Object.entries(groupedRecords).map(([subject, subjectRecords]) => {
          const total = subjectRecords.length;
          // Count records with status "present" (case-insensitive)
          const presentCount = subjectRecords.filter(r => r.status.toLowerCase() === "present").length;
          const percentage = (presentCount / total) * 100;
          const bgColor = getAttendanceColor(percentage);
          const borderColor = mode === "dark" ? "white" : "black";
          const titleColor = mode === "dark" ? "white" : "black";

          return (
            <div
              key={subject}
              style={{
                backgroundColor: bgColor,
                border: `2px solid ${borderColor}`,
                borderRadius: "5px",
                padding: "10px",
                marginBottom: "10px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <h4 style={{ color: titleColor, margin: 0 }}>{subject}</h4>
              <div>
                <i
                  className="fa-regular fa-pen-to-square mx-2"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleEditSubject(subject)}
                ></i>
                <i
                  className="fa-solid fa-trash-can mx-2"
                  style={{ cursor: "pointer", color: mode === 'dark' ? 'white' : 'black' }}
                  onClick={() => handleDeleteSubject(subject)}
                ></i>
              </div>
            </div>
          );
        })
      )}
      
      <hr />
      <h3>Attendance Summary</h3>
      <AttendancePieCharts attendanceRecords={records} mode={mode} />

      {/* Edit Attendance Modal */}
      {selectedAttendance && (
        <EditAttendanceModal
          show={showModal}
          color={mode === 'dark' ? 'white' : 'black'}
          handleClose={() => {
            setShowModal(false);
            setSelectedAttendance(null);
          }}
          attendanceRecord={selectedAttendance}
          onSave={() => {}}
          mode={mode}
        />      
      )}
    </div>
  );
};

export default ViewAttendance;