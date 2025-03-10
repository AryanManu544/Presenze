import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const ResetPassword = ({ mode, showalert }) => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const navigate = useNavigate();

  const onChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      showalert("Passwords do not match", "danger");
      return;
    }
    const API_BASE_URL =
      process.env.REACT_APP_API_BASE_URL || "http://localhost:4000";
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/resetpassword`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: passwords.newPassword }),
      });
      const json = await response.json();
      if (json.message) {
        showalert("Password has been reset successfully", "success");
        navigate("/login");
      } else {
        showalert("Error resetting password", "danger");
      }
    } catch (error) {
      console.error("Error:", error);
      showalert("An error occurred", "danger");
    }
  };

  return (
    <div
      className={`container ${mode === "dark" ? "text-light" : ""}`}
      style={{
        maxWidth: "400px",
        margin: "4rem auto",
        padding: "1rem",
        borderRadius: "8px",
        backgroundColor: mode === "dark" ? "#222222cc" : "#ffffffcc",
      }}
    >
      <h2 className="text-center">Reset Password</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="newPassword" className="form-label">
            New Password:
          </label>
          <input
            type="password"
            className="form-control"
            name="newPassword"
            value={passwords.newPassword}
            onChange={onChange}
            id="newPassword"
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="confirmPassword" className="form-label">
            Confirm Password:
          </label>
          <input
            type="password"
            className="form-control"
            name="confirmPassword"
            value={passwords.confirmPassword}
            onChange={onChange}
            id="confirmPassword"
            required
          />
        </div>
        <button type="submit" className="btn btn-outline-primary w-100">
          Reset Password
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
