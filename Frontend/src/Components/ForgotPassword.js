import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ForgotPassword = ({ mode, showalert }) => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const API_BASE_URL =
      process.env.REACT_APP_API_BASE_URL || "http://localhost:4000";
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/forgotpassword`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await response.json();
      if (json.message) {
        showalert("Password reset link has been sent to your email", "success");
        navigate("/login");
      } else {
        showalert("Error sending password reset link", "danger");
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
      <h2 className="text-center">Forgot Password</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Enter your registered email:
          </label>
          <input
            type="email"
            className="form-control"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            id="email"
            required
          />
        </div>
        <button type="submit" className="btn btn-outline-primary w-100">
          Send Reset Link
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
