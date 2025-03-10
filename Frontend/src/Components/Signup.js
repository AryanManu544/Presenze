import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

const Signup = ({ mode, showalert }) => {
  const [credentials, setCredentials] = useState({ name: "", email: "", password: "", cpassword: "" });
  const navigate = useNavigate();

  useEffect(() => {
    document.body.setAttribute("data-theme", mode);

    // Set background image on the body
    const backgroundImage =
      mode === "dark"
        ? "/assets/darkmode.jpg"
        : "/assets/lightmode.jpg";

    document.body.style.backgroundImage = `url(${backgroundImage})`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundRepeat = "no-repeat";
    document.body.style.height = "100vh"; 
    document.body.style.margin = "0"; 

    /*return () => {
      // Clean up styles on component unmount
      document.body.style.backgroundImage = "";
      document.body.style.backgroundSize = "";
      document.body.style.backgroundPosition = "";
      document.body.style.backgroundRepeat = "";
      document.body.style.height = "";
      document.body.style.margin = "";
    };*/
  }, [mode]);

  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (credentials.password !== credentials.cpassword) {
      showalert("Passwords do not match", "danger");
      return;
    }
    try {
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:4000";
      const { name, email, password } = credentials;
      const response = await fetch(`${API_BASE_URL}/api/auth/createuser`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const json = await response.json();
      if (json.authtoken) {
        localStorage.setItem("token", json.authtoken);
        showalert("Account created successfully", "success");
        navigate("/");
      } else {
        showalert("Invalid credentials", "danger");
      }
    } catch (error) {
      console.error("Error:", error);
      showalert("An error occurred", "danger");
    }
  };

  return (
    <div
      className={`container ${mode === 'dark' ? 'text-light' : ''}`}
      style={{
        maxWidth: "400px",
        margin: "4rem auto",
        padding: "1rem",
        borderRadius: "8px",
        backgroundColor: mode === 'dark' ? "#222222cc" : "#ffffffcc", // Semi-transparent card
        boxShadow:
          mode === 'dark'
            ? "0px 4px 10px rgba(0,0,0,0.8)"
            : "0px 4px 10px rgba(0,0,0,0.2)",
      }}
    >
      <h2 className="text-center">Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Name</label>
          <input type="text" className="form-control" name="name" value={credentials.name} onChange={onChange} id="name" />
        </div>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email address</label>
          <input type="email" className="form-control" name="email" value={credentials.email} onChange={onChange} id="email" />
          <div className="form-text">We'll never share your email with anyone else.</div>
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Password</label>
          <input type="password" className="form-control" name="password" value={credentials.password} onChange={onChange} id="password" />
        </div>
        <div className="mb-3">
          <label htmlFor="cpassword" className="form-label">Confirm Password</label>
          <input type="password" className="form-control" name="cpassword" value={credentials.cpassword} onChange={onChange} id="cpassword" />
        </div>
        <button type="submit" className="btn btn-outline-primary w-100">Sign Up</button>
      </form>
      <div className="text-center mt-3">
        Already have an account? <Link to="/login">Login</Link>
      </div>
    </div>
  );
};

export default Signup;