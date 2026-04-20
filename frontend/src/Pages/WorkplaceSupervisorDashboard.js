import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "./WorkplaceSupervisorDashboard.css";

export default function WorkplaceSupervisorDashboard() {
  const [data, setData] = useState(null);
  const [students, setStudents] = useState([]);
  const [logs, setLogs] = useState([]);
  const [view, setView] = useState("dashboard");
  const [loading, setLoading] = useState(false);

  const BASE_URL = "http://127.0.0.1:8000";

  const getToken = () => localStorage.getItem("access");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/supervisor/dashboard/`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setData(res.data);
      setView("dashboard");
    } catch (err) {
      console.error("Error loading dashboard:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/supervisor/assigned-students/`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setStudents(res.data);
      setView("students");
    } catch (err) {
      console.error("Error loading students:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/supervisor/pending-logs/`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setLogs(res.data);
      setView("logs");
    } catch (err) {
      console.error("Error loading logs:", err);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="loading-container">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex" }}>
      {/* Sidebar */}
      <div className="sidebar">
        <h2>Supervisor</h2>
        <button onClick={loadDashboard}>Dashboard</button>
        <button onClick={loadStudents}>Students</button>
        <button onClick={loadLogs}>Pending Logs</button>
        <button onClick={logout}> Logout</button>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {view === "dashboard" && data && (
          <div>
            <h1 className="page-header">Dashboard</h1>
            <div className="dashboard-cards">
              <div className="card">
                <h3>Assigned Students</h3>
                <p>{data.assigned_students?.length || 0}</p>
              </div>
              <div className="card">
                <h3>Pending Reviews</h3>
                <p>{data.pending_reviews?.length || 0}</p>
              </div>
            </div>
          </div>
        )}

        {view === "students" && (
          <div>
            <h1 className="page-header">Assigned Students</h1>
            {students.length === 0 ? (
              <p className="empty-state">No students assigned yet.</p>
            ) : (
              students.map((s) => (
                <div key={s.id} className="student-card">
                  <strong>{s.student_name}</strong>
                  <p>{s.company_name}</p>
                </div>
              ))
            )}
          </div>
        )}

        {view === "logs" && (
          <div>
            <h1 className="page-header">Pending Logs</h1>
            {logs.length === 0 ? (
              <p className="empty-state">No pending logs to review.</p>
            ) : (
              logs.map((l) => (
                <div key={l.id} className="log-card">
                  <strong>Week {l.week_number}</strong>
                  <p>{l.activities}</p>
                  <small>Student: {l.student_name}</small>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
