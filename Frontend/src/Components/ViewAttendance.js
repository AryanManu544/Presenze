import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AttendancePieCharts from './AttendancePieCharts';
import EditAttendanceModal from './EditAttendanceModal';

const ViewAttendance = ({ mode, showalert }) => {
  const [records, setRecords] = useState([]);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [expandedSubjects, setExpandedSubjects] = useState({}); // tracks which subject is expanded

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
        return "rgba(0,128,0,0.5)";
      case "yellow":
        return "rgba(255,255,0,0.5)";
      case "red":
        return "rgba(255,0,0,0.5)";
      default:
        return "transparent";
    }
  };

  // Toggle subject expansion
  const toggleSubjectExpand = (subject) => {
    setExpandedSubjects((prev) => ({
      ...prev,
      [subject]: !prev[subject]
    }));
  };

  // Individual record edit handler
  const handleEditClick = (record) => {
    setSelectedAttendance(record);
    setShowModal(true);
  };

  // Individual record delete handler
  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/api/attendance/delete/${id}`, {
        headers: { "auth-token": token }
      });
      setRecords(records.filter(r => r._id !== id));
      showalert("Record deleted", "success");
    } catch (err) {
      console.error(err);
      showalert("Error deleting record", "danger");
    }
  };

  const containerClass = mode === "dark" ? "bg-dark text-light" : "bg-light text-dark";
  const borderColor = mode === "dark" ? "white" : "black";
  const titleColor = mode === "dark" ? "white" : "black";

  return (
    <div className={containerClass}>
      <h2>Attendance Records</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      
      {/* Render grouped records with expandable raw records */}
      {Object.entries(groupedRecords).map(([subject, subjectRecords]) => {
        const total = subjectRecords.length;
        const presentCount = subjectRecords.filter(r => r.status.toLowerCase() === "present").length;
        const percentage = (presentCount / total) * 100;
        const attColor = getAttendanceColor(percentage);
        const bgColor = getTranslucentColor(attColor);
        const isExpanded = expandedSubjects[subject];

        return (
          <div key={subject} style={{ marginBottom: "10px" }}>
            {/* Subject Header (clickable to expand/collapse) */}
            <div
              style={{
                backgroundColor: bgColor,
                border: `2px solid ${borderColor}`,
                borderRadius: "5px",
                padding: "10px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer"
              }}
              onClick={() => toggleSubjectExpand(subject)}
            >
              <h4 style={{ color: titleColor, margin: 0 }}>{subject}</h4>
              <i
                className={`fa-solid fa-chevron-${isExpanded ? "up" : "down"}`}
                style={{ color: titleColor, cursor: "pointer" }}
              ></i>
            </div>
            {/* Expanded Records Table */}
            {isExpanded && (
              <div style={{ padding: "10px", borderLeft: `2px solid ${attColor}`, marginTop: "5px", color: mode === "dark" ? "white" : "black" }}>
                <table className="table table-sm table-bordered">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjectRecords.map(record => (
                      <tr key={record._id}>
                        <td>{new Date(record.date).toLocaleDateString()}</td>
                        <td style={{ color: record.status.toLowerCase() === "present" ? "green" : "red", fontWeight: "bold" }}>
                          {record.status}
                        </td>
                        <td>
                          <i
                            className="fa-regular fa-pen-to-square mx-2"
                            style={{ cursor: "pointer", color: mode === "dark" ? "white" : "black" }}
                            onClick={() => handleEditClick(record)}
                          ></i>
                          <i
                            className="fa-solid fa-trash-can mx-2"
                            style={{ cursor: "pointer", color: mode === "dark" ? "white" : "black" }}
                            onClick={() => handleDelete(record._id)}
                          ></i>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
      
      <hr />
      <h3>Attendance Summary</h3>
      <AttendancePieCharts attendanceRecords={records} mode={mode} />

      {/* Edit Attendance Modal */}
      {selectedAttendance && (
        <EditAttendanceModal
          show={showModal}
          color={titleColor}
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