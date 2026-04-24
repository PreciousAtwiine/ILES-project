import { useEffect, useState } from "react";
import axios from "axios";
import "./PendingLogs.css";
import { useNavigate } from "react-router-dom";
export default function PendingLogs() {
  const [logs, setLogs] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/supervisor/pending-logs/")
      .then((res) => setLogs(res.data))
      .catch((err) => console.log(err));
  }, []);

  return (
    <div className="pending-logs-container">
      
      <div className="top-navbar">
        <h3>Workplace Supervisor Pannel</h3>

            <button onClick={() => navigate("/workplace-supervisor-dashboard")}>
              ⬅ Back to Dashboard
         </button>
      </div>
    
      <div className="summary-boxes">
        <div className="box">
          <h3>{logs.length}</h3>
          <p>Total Pending Logs</p>
        </div>
        
        <div className="box">
          <h3>{logs.filter((l) => l.week_number >= 3).length}</h3>
          <p>Recent Submissions</p>
        </div>

        <div className="box">
          <h3>⚠</h3>
          <p>Needs Review</p>
        </div>
      </div>

      
      <h2>Pending Logs</h2>

      
      {logs.length === 0 ? (
        <p className="empty-text">No pending logs</p>
      ) : (
        <div className="logs-list">
          {logs.map((log) => (
            <div key={log.id} className="log-card">
              <strong>Week {log.week_number}</strong>
              <p>{log.activities}</p>
              <small>Student: {log.student_name}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}