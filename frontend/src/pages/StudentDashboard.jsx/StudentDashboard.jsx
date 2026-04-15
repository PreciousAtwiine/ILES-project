import React from "react";
import { useNavigate } from "react-router-dom";
import "./StudentDashboard.css";
import { BookOpen, ClipboardList, Calendar, LogOut } from "lucide-react";

const StudentDashboard = ({ user }) => {
  const navigate = useNavigate();
  const studentName = user?.name || "Student";

  const handleLogout = () => {
    localStorage.removeItem("token"); // or auth data
    navigate("/login");
  };

  return (
    <div className="dashboard-container">

      {/* Header */}
      <div className="dashboard-header">
        <h1>University Student Dashboard</h1>
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={18} /> Logout
        </button>
      </div>

      {/* Welcome Section */}
      <div className="welcome-section">
        <h2>Welcome, {studentName}</h2>
        <p>Manage your internship activities below</p>
      </div>

      {/* Cards Section */}
      <div className="cards-container">

        <div className="card">
          <BookOpen size={30} />
          <h3>Daily Logbook</h3>
          <p>Record your internship activities</p>
          <button
            className="card-btn"
            onClick={() => navigate("/logbook")}
          >
            Go to Logbook
          </button>
        </div>

        <div className="card">
          <ClipboardList size={30} />
          <h3>Reports</h3>
          <p>Submit and view your reports</p>
          <button
            className="card-btn"
            onClick={() => navigate("/reports")}
          >
            View Reports
          </button>
        </div>

        <div className="card">
          <Calendar size={30} />
          <h3>Attendance</h3>
          <p>Track your attendance</p>
          <button
            className="card-btn"
            onClick={() => navigate("/attendance")}
          >
            Check Attendance
          </button>
        </div>

      </div>

      {/* Recent Activity */}
      <div className="activity-section">
        <h2>Recent Activity</h2>
        <ul>
          <li>✔ Logged activity for April 10</li>
          <li>✔ Submitted weekly report</li>
          <li>✔ Supervisor reviewed your logbook</li>
        </ul>
      </div>

    </div>
  );
};

export default StudentDashboard;