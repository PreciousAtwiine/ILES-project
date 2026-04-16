import { useEffect, useState, useCallback } from "react";
import axios from "axios";

export default function WorkplaceSupervisorDashboard() {
  const [data, setData] = useState(null);
  const [students, setStudents] = useState([]);
  const [logs, setLogs] = useState([]);
  const [view, setView] = useState("dashboard");

  const BASE_URL = "http://127.0.0.1:8000/api";

  const getToken = () => localStorage.getItem("access");

  
  const loadDashboard = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/supervisor/dashboard/`, {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });

      setData(res.data);
      setView("dashboard");
    } catch (err) {
      console.log(err);
    }
  }, []);

  const loadStudents = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/supervisor/assigned-students/`, {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });

      setStudents(res.data);
      setView("students");
    } catch (err) {
      console.log(err);
    }
  };

  const loadLogs = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/supervisor/pending-logs/`, {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });

      setLogs(res.data);
      setView("logs");
    } catch (err) {
      console.log(err);
    }
  };

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    window.location.href = "/login";
  };

  
  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return (
    <div style={{ display: "flex" }}>

      
      <div style={{ width: "220px", background: "#1f2937", color: "white", height: "100vh", padding: "10px" }}>
        <h3>Supervisor</h3>

        <button onClick={loadDashboard}>Dashboard</button>
        <button onClick={loadStudents}>Students</button>
        <button onClick={loadLogs}>Pending Logs</button>
        <button onClick={logout}>Logout</button>
      </div>

      
      <div style={{ padding: "20px", flex: 1 }}>

        {view === "dashboard" && data && (
          <>
            <h2>Dashboard</h2>
            <p>Students: {data.assigned_students.length}</p>
            <p>Pending Logs: {data.pending_reviews.length}</p>
          </>
        )}

        {view === "students" && (
          <>
            <h2>Assigned Students</h2>
            {students.map((s) => (
              <div key={s.id}>
                {s.student_name} - {s.company_name}
              </div>
            ))}
          </>
        )}

        {view === "logs" && (
          <>
            <h2>Pending Logs</h2>
            {logs.map((l) => (
              <div key={l.id}>
                Week {l.week_number} - {l.activities}
              </div>
            ))}
          </>
        )}

      </div>
    </div>
  );
}