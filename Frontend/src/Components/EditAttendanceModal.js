import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const EditAttendanceModal = ({ show, handleClose, attendanceRecord, onSaveSuccess, mode }) => {
  const [className, setClassName] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (attendanceRecord) {
      setClassName(attendanceRecord.className);
      setStatus(attendanceRecord.status);
    }
  }, [attendanceRecord]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!attendanceRecord || !attendanceRecord._id) {
      console.error("Invalid attendance record");
      return;
    }

    const updatedRecord = {
      className,
      status,
    };

    try {
      const response = await fetch(`https://attendance-tracker-rp7u.onrender.com/api/attendance/edit/${attendanceRecord._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': localStorage.getItem('token'), // Adjust if you're not using auth
        },
        body: JSON.stringify(updatedRecord),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Attendance updated:", data);
        if (onSaveSuccess) onSaveSuccess(); // Refresh parent list if needed
        handleClose();
      } else {
        const errorText = await response.text();
        console.error("Failed to update attendance:", errorText);
      }
    } catch (error) {
      console.error("Error during update:", error);
    }
  };

  const inputStyle = mode === 'dark' 
    ? { backgroundColor: "#222222", color: "white", borderColor: "#444" }
    : {};

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      contentClassName={mode === 'dark' ? 'bg-dark text-light' : ''}
      dialogClassName={mode === 'dark' ? 'modal-dark' : ''}
    >
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Attendance</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="formClassName" className="mb-3">
            <Form.Label style={{ color: mode === 'dark' ? 'white' : 'black' }}>Class Name</Form.Label>
            <Form.Control
              type="text"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="Enter class name"
              required
              style={inputStyle}
            />
          </Form.Group>
          <Form.Group controlId="formStatus">
            <Form.Label style={{ color: mode === 'dark' ? 'white' : 'black' }}>Status</Form.Label>
            <Form.Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              required
              style={inputStyle}
            >
              <option value="">Select status</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" className="btn btn-danger" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Save Changes
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default EditAttendanceModal;