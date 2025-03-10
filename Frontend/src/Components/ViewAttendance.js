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

  // Open Edit Modal (if needed)
  /*const handleEditClick = (record) => {
    setSelectedAttendance(record);
    setShowModal(true);
  };*/

  // Close Edit Modal
  const handleModalClose = () => {
    setShowModal(false);
    setSelectedAttendance(null);
  };

  const containerClass = mode === "dark" ? "bg-dark text-light" : "bg-light text-dark";

  return (
    <div className={containerClass}>
      {error && <div className="alert alert-danger">{error}</div>}
      
      {/* Toggle Raw Records Button */}
      <button className="btn btn-outline-info mb-3" onClick={() => setShowRawRecords(!showRawRecords)}>
        {showRawRecords ? "Hide Subjects List" : "Show Subjects List"}
      </button>
      
      {showRawRecords && (
        Object.entries(groupedRecords).map(([subject, subjectRecords]) => {
          const total = subjectRecords.length;
          // Adjust this filter if your data uses different values for presence.
          const presentCount = subjectRecords.filter(r => r.status.toLowerCase() === "present").length;
          const percentage = (presentCount / total) * 100;
          const bgColor = getAttendanceColor(percentage);

          return (
            <div
              key={subject}
              style={{
                backgroundColor: bgColor,
                padding: "10px",
                borderRadius: "5px",
                marginBottom: "10px"
              }}
            >
              <h4 style={{ color: "white", margin: 0 }}>{subject}</h4>
            </div>
          );
        })
      )}
      
      {/* Optionally include other components */}
      <hr />
      <AttendancePieCharts attendanceRecords={records} mode={mode} />

      {selectedAttendance && (
        <EditAttendanceModal
          show={showModal}
          color={mode === 'dark' ? 'white' : 'black'}
          handleClose={handleModalClose}
          attendanceRecord={selectedAttendance}
          onSave={() => {}}
          mode={mode}
        />      
      )}
    </div>
  );
};

export default ViewAttendance;