import React, { useState } from 'react';
import axios from 'axios';

const StudentAttendanceTracker = () => {
  const [studentName, setStudentName] = useState('');
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [error, setError] = useState('');

  // Fetch attendance records for the given student name and group them by class
  const fetchAttendance = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:4000";
      const res = await axios.get(`${API_BASE_URL}/api/attendance?studentName=${encodeURIComponent(studentName)}`);
      
      const records = res.data;
      
      // Group records by className
      const grouped = records.reduce((acc, record) => {
        if (!acc[record.className]) {
          acc[record.className] = [];
        }
        acc[record.className].push(record);
        return acc;
      }, {});
      
      setAttendanceRecords(grouped);
    } catch (err) {
      console.error(err);
      setError('Error fetching attendance. Please try again.');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Student Attendance Tracker</h1>
      <form onSubmit={fetchAttendance} style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Enter your name"
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
          required
          style={{ marginRight: '1rem' }}
        />
        <button type="submit">View Attendance</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {Object.keys(attendanceRecords).length > 0 ? (
        <div>
          {Object.keys(attendanceRecords).map((className) => (
            <div key={className} style={{ marginBottom: '2rem' }}>
              <h2>Class: {className}</h2>
              <ul>
                {attendanceRecords[className].map((record) => (
                  <li key={record._id}>
                    {new Date(record.date).toLocaleDateString()} - {record.status}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <p>No attendance records to display.</p>
      )}
    </div>
  );
};

export default StudentAttendanceTracker;
