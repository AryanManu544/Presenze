import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar";
import ViewAttendance from "./Components/ViewAttendance";
import MarkAttendance from "./Components/MarkAttendance";
import Login from "./Components/Login";
import Signup from "./Components/Signup";
import PrivateRoute from "./Privateroute";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { Analytics } from "@vercel/analytics/react";
import Timetable from './Components/Timetable';
import ForgotPassword from "./Components/ForgotPassword";
import ResetPassword from "./Components/ResetPassword";

const App = () => {
  const [mode, setMode] = useState("light");
  const [alert, setAlert] = useState(null);

  const toggleMode = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  const showAlert = (msg, type) => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3000);
  };

  useEffect(() => {
    if (mode === "dark") {
      document.body.style.backgroundImage = `url("/assets/darkmode.jpg")`;
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundPosition = "center";
    } else {
      document.body.style.backgroundImage = `url("/assets/lightmode.jpg")`;
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundPosition = "center";
    }
  }, [mode]);

  return (
    <Router>
      <Navbar mode={mode} showalert={showAlert} toggleMode={toggleMode} />
      <div className="container mt-4">
        {alert && (
          <div className={`alert alert-${alert.type} alert-dismissible fade show`} role="alert">
            {alert.msg}
            <button type="button" className="btn-close" onClick={() => setAlert(null)} aria-label="Close"></button>
          </div>
        )}
        <Routes>
          <Route
            path="/"
            element={
              <PrivateRoute>
                <ViewAttendance mode={mode} showalert={showAlert} toggleMode={toggleMode}/>
              </PrivateRoute>
            }
          />
          <Route
            path="/mark"
            element={
              <PrivateRoute>
                <MarkAttendance mode={mode} showalert={showAlert} toggleMode={toggleMode}/>
              </PrivateRoute>
            }
          />
          <Route path="/login" element={<Login mode={mode} showalert={showAlert} toggleMode={toggleMode}/>} />
          <Route path="/signup" element={<Signup mode={mode} showalert={showAlert} toggleMode={toggleMode}/>} />
          <Route path="/timetable" element={<Timetable mode={mode} showalert={showAlert} toggleMode={toggleMode}/>} />
          <Route path="/forgotpassword" element={<ForgotPassword mode={mode} showalert={showAlert} toggleMode={toggleMode}/>} />
          <Route path="/resetpassword" element={<ResetPassword mode={mode} showalert={showAlert} toggleMode={toggleMode}/>} />
        </Routes>
        <Analytics />
      </div>
    </Router>
  );
};
export default App;