// WorkplaceSupervisorDashboard.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./SupervisorDashboard.css";

export default function WorkplaceSupervisorDashboard() {
  const [pendingLogs, setPendingLogs] = useState([]);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/logs/pending/")
      .then(res => setPendingLogs(res.data))
      .catch(err => console.log(err));

    axios.get("http://127.0.0.1:8000/supervisor/students/")
      .then(res => setStudents(res.data))
      .catch(err => console.log(err));
  }, []);

  return (
    <div className="supervisor-dashboard">
      <aside className="sidebar">
        <h2>Supervisor Panel</h2>
        <nav>
          <Link to="/supervisor/dashboard">Dashboard</Link>
          <Link to="/supervisor/students">Students</Link>
          <Link to="/supervisor/pending-logs">Pending Logs</Link>
          <Link to="/supervisor/evaluations">Evaluations</Link>
          <Link to="/supervisor/reports">Reports</Link>
        </nav>
      </aside>

      <main className="main-content">
        <h1>Workplace Supervisor Dashboard</h1>

        <div className="summary-cards">
          <div className="card">
            <h3>Assigned Students</h3>
            <p>{students.length}</p>
          </div>

          <div className="card">
            <h3>Pending Logs</h3>
            <p>{pendingLogs.length}</p>
          </div>
        </div>
      </main>
    </div>
  );
}