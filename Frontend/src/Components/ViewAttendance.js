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

  // Determine border (attendance) color based on percentage
  const getAttendanceColor = (percentage) => {
    if (percentage >= 90) return "green";
    else if (percentage >= 75) return "yellow";
    else return "red";
  };

  // Return a translucent version of the color using RGBA values
  const getTranslucentColor = (color) => {
    switch (color) {
      case "green":
        return "rgba(0,128,0,0.3)";
      case "yellow":
        return "rgba(255,255,0,0.3)";
      case "red":
        return "rgba(255,0,0,0.3)";
      default:
        return "transparent";
    }
  };

  // Open Edit Modal
  const handleEditClick = (record) => {
    setSelectedAttendance(record);
    setShowModal(true);
  };

  // Close Edit Modal
  const handleModalClose = () => {
    setShowModal(false);
    setSelectedAttendance(null);
  };

  const handleSaveChanges = async (updatedRecord) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API_BASE_URL}/api/attendance/edit/${updatedRecord._id}`,
        updatedRecord,
        { headers: { "auth-token": token } }
      );
      setRecords(records.map(r => r._id === updatedRecord._id ? response.data : r));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/api/attendance/delete/${id}`, {
        headers: { "auth-token": token }
      });
      setRecords(records.filter(r => r._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleRawRecords = () => {
    setShowRawRecords(!showRawRecords);
  };

  const containerClass = mode === "dark" ? "bg-dark text-light" : "bg-light text-dark";
  const borderColor = mode === "dark" ? "white" : "black";
  const titleColor = mode === "dark" ? "white" : "black";

  return (
    <div className={containerClass}>
      <h2>Attendance Records</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      
      {/* Toggle Raw Records Button */}
      <button className="btn btn-outline-info mb-3" onClick={toggleRawRecords}>
        {showRawRecords ? "Hide Subjects List" : "Show Subjects List"}
      </button>
      
      {showRawRecords && (
        // Render grouped records with translucent background and colored borders
        Object.entries(groupedRecords).map(([subject, subjectRecords]) => {
          const total = subjectRecords.length;
          const presentCount = subjectRecords.filter(r => r.status.toLowerCase() === "present").length;
          const percentage = (presentCount / total) * 100;
          const attColor = getAttendanceColor(percentage);
          const bgColor = getTranslucentColor(attColor);

          return (
            <div
              key={subject}
              style={{
                backgroundColor: bgColor,
                border: `2px solid ${attColor}`,
                borderRadius: "5px",
                padding: "10px",
                marginBottom: "10px"
              }}
            >
              <h4 style={{ color: titleColor, margin: 0 }}>{subject}</h4>
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
          color={titleColor}
          handleClose={handleModalClose}
          attendanceRecord={selectedAttendance}
          onSave={handleSaveChanges}          
          mode={mode}
        />      
      )}
    </div>
  );
};

export default ViewAttendance;