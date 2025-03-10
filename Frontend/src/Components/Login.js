import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

const Login = ({ mode, showalert }) => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const navigate = useNavigate();

  useEffect(() => {
    document.body.setAttribute("data-theme", mode);
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
      document.body.style.backgroundImage = "";
      document.body.style.backgroundSize = "";
      document.body.style.backgroundPosition = "";
      document.body.style.backgroundRepeat = "";
      document.body.style.height = "";
      document.body.style.margin = "";
    };*/
  }, [mode]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCredentials({
      ...credentials,
      [name]: type === "checkbox" ? checked : value,
    });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:4000";

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    const json = await response.json();
    if (json.authtoken) {
      if (credentials.remember) {
        localStorage.setItem("token", json.authtoken);
      } else {
        sessionStorage.setItem("token", json.authtoken);
      }
      showalert("Logged in successfully", "success");
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
      className={`container ${mode === "dark" ? "text-light" : ""}`}
      style={{
        maxWidth: "400px",
        margin: "4rem auto",
        padding: "1rem",
        borderRadius: "8px",
        backgroundColor: mode === "dark" ? "#222222cc" : "#ffffffcc",
        boxShadow:
          mode === "dark"
            ? "0px 4px 10px rgba(0,0,0,0.8)"
            : "0px 4px 10px rgba(0,0,0,0.2)",
      }}
    >
      <h2 className="text-center">Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Email address
          </label>
          <input
            type="email"
            className="form-control"
            name="email"
            value={credentials.email}
            onChange={onChange}
            id="email"
            style={
              mode === "dark"
                ? { backgroundColor: "#222222", color: "#ffffff", borderColor: "#444" }
                : {}
            }
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            type="password"
            className="form-control"
            name="password"
            value={credentials.password}
            onChange={onChange}
            id="password"
            style={
              mode === "dark"
                ? { backgroundColor: "#222222", color: "#ffffff", borderColor: "#444" }
                : {}
            }
          />
        </div>
        <button type="submit" className="btn btn-outline-primary w-100">
          Sign In
        </button>
        <div className="d-flex justify-content-between align-items-center mt-3">
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              name="remember"
              id="remember"
              checked={credentials.remember}
              onChange={onChange}
            />
            <label className="form-check-label" htmlFor="remember">
              Remember Me
            </label>
          </div>
          <div>
            <Link to="/forgotpassword">Forgot Password?</Link>
          </div>
        </div>
      </form>
      <div className="text-center mt-3">
        Don't have an account? <Link to="/signup">Sign up</Link>
      </div>
    </div>
  );
};

export default Login;