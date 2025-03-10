import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = ({ mode, showalert, toggleMode }) => {
  const navigate = useNavigate();

  const handleSignout = () => {
    localStorage.removeItem("token");
    showalert("Signed out successfully", "success");
    navigate("/login");
  };

  // Dynamically set the logo based on the mode
  const logoSrc =
    mode === "dark"
      ? "/assets/attendance.jpg" 
      : "/assets/attendance-dark.jpg"; 

  return (
    <nav
      className={`navbar navbar-expand-lg ${
        mode === "dark" ? "navbar-dark" : "navbar-light bg-light"
      }`}
      style={mode === "dark" ? { backgroundColor: "#222222" } : {}}
    >
      <div className="container-fluid">
        {/* Brand logo and name */}
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <img
            src={logoSrc}
            alt="Attendance Logo"
            style={{
              width: "30px",
              height: "30px",
              marginRight: "8px",
              borderRadius: "50%", // Optional: Makes it circular
            }}
          />
          Presenze
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                View Attendance
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/mark">
                Mark Attendance
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/timetable">Timetable</Link>
            </li>
          </ul>
          <div className="d-flex align-items-center">
            {/* Dark mode toggle switch with icon */}
            <div className="form-check form-switch me-3">
              <input
                className="form-check-input"
                type="checkbox"
                id="darkModeSwitch"
                onChange={toggleMode}
                checked={mode === "dark"}
              />
              <label
                className="form-check-label"
                htmlFor="darkModeSwitch"
                style={{ color: mode === "dark" ? "white" : "black" }}
              >
                {mode === "dark" ? (
                  <i className="fa-solid fa-moon"></i>
                ) : (
                  <i className="fa-solid fa-sun"></i>
                )}
              </label>
            </div>
            {!localStorage.getItem("token") ? (
              <>
                <Link className="btn btn-outline-primary me-2" to="/login">
                  Login
                </Link>
                <Link className="btn btn-outline-primary" to="/signup">
                  Signup
                </Link>
              </>
            ) : (
              <button onClick={handleSignout} className="btn btn-outline-danger">
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;