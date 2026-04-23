import React from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { BookOpen, ClipboardList, Calendar, LogOut } from "lucide-react";

const Dashboard = ({ user }) => {
  const navigate = useNavigate();

 const name = user
  ? `${user.first_name} ${user.last_name}`
  : "User";

  const handleLogout = () => {
    localStorage.removeItem("token");
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
        <h2>Welcome, {name}</h2>
        <p>Manage your internship activities below</p>
      </div>

      {/* Cards Section */}
      <div className="cards-container">

        <div className="card">
          <BookOpen size={30} />
          <h3>Weekly Log</h3>
          <p>Record your internship activities</p>
          <button
            className="card-btn"
            onClick={() => navigate("/logbook")}
          >
            Go to Logbook
          </button>
        </div>

        <div className="card">
          <Calendar size={30} />
          <h3>Attendance</h3>
          <p>Submit and view your attendance records</p>
          <button
            className="card-btn"
            onClick={() => navigate("/attendance")}
          >
            Check Attendance
          </button>
        </div>

        <div className="card">
          <ClipboardList size={30} />
          <h3>Weekly Report</h3>
          <p>Submit and view your weekly internship report</p>
          <button
            className="card-btn"
            onClick={() => navigate("/weekly-report")}
          >
            View Weekly Report
          </button>
        </div>
  
      </div>

      {/* Recent Activity */}
     recent_logs = WeeklyLog.objects...

    
   </div>
  );
};

export default Dashboard;