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
  const listItemClass = mode === "dark" ? "list-group-item bg-dark text-light" : "list-group-item";

  return (
    <div className={containerClass}>
      <h2>Attendance Records</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      
      {/* Toggle Raw Records Button */}
      <button className="btn btn-outline-info mb-3" onClick={toggleRawRecords}>
        {showRawRecords ? "Hide Raw Records" : "Show Raw Records"}
      </button>
      
      {showRawRecords && (
        <ul className="list-group mb-3">
          {records.map(record => (
            <li key={record._id} className={`d-flex justify-content-between align-items-center ${listItemClass}`}>
              <div>
                <strong>Subject:</strong> {record.className} <br />
                <strong>Date:</strong> {new Date(record.date).toLocaleDateString()} <br />
                <strong>Status:</strong> {record.status}
              </div>
              <div>
                <i
                  className="fa-regular fa-pen-to-square mx-2"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleEditClick(record)}>
                </i>
                <i 
                  className="fa-solid fa-trash-can my-1 mx-2"
                  style={{ cursor: "pointer", color: mode === 'dark' ? 'white' : 'black' }}
                  onClick={() => handleDelete(record._id)}>
                </i>
              </div>
            </li>
          ))}
        </ul>
      )}
      
      <hr />
      <h3>Attendance Summary (by Subject)</h3>
      <AttendancePieCharts attendanceRecords={records} mode={mode} />

      {/* Edit Attendance Modal */}
      {selectedAttendance && (
        <EditAttendanceModal
          show={showModal}
          color={mode === 'dark' ? 'white' : 'black'}
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
