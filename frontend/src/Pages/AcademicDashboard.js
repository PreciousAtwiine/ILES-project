import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AcademicDashboard.css";

export default function AcademicDashboard() {
  const [data, setData] = useState(null);
  const [view, setView] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedLog, setSelectedLog] = useState(null);
  const [studentSearch, setStudentSearch] = useState("");
  const navigate = useNavigate();
  const BASE_URL = "http://127.0.0.1:8000";
  const getToken = () => localStorage.getItem("access");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${BASE_URL}/api/supervisor/academic/dashboard/`,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setData(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        loacalStorage.removeItem("access");
        localStorage.removeItem("refresh");
        window.location.href = "/login";
      } else {
        setError("Failed to load dashboard");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  const reviewLog = async (logId, status) => {
    try {
      await axios.put(
        `${BASE_URL}/logs/${logId}/review/`,
        { status },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      loadDashboard();
    } catch (err) {
      alert("Failed to review log");
    }
  };

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    window.location.href = "/login";
  };

  const initials = data
    ? `${data.first_name?.[0] || ""}${data.last_name?.[0] || ""}`.toUpperCase()
    : "AS";

  if (loading) return <div className="ac-loading">Loading...</div>;
  if (error) return <div className="ac-loading">{error}</div>;

  return (
    <div className="ac-shell">

      {/* SIDEBAR */}
      <div className="ac-sidebar">
        <div className="ac-brand">
          <h2>Academic Supervisor</h2>
          <p>ILES Platform</p>
        </div>
        <nav className="ac-nav">
          <button className={view === "dashboard" ? "ac-nav-item active" : "ac-nav-item"} onClick={() => setView("dashboard")}>Dashboard</button>
          <button className={view === "students" ? "ac-nav-item active" : "ac-nav-item"} onClick={() => setView("students")}>Students</button>
          <button className={view === "pending" ? "ac-nav-item active" : "ac-nav-item"} onClick={() => setView("pending")}>Pending Logs</button>
          <button className={view === "reviewed" ? "ac-nav-item active" : "ac-nav-item"} onClick={() => setView("reviewed")}>Reviewed Logs</button>
          <button className="ac-nav-item" onClick={() => navigate("/academic/evaluate")}>Evaluate Student</button>
        </nav>
        <div className="ac-sidebar-footer">
          <button className="ac-logout" onClick={logout}>Logout</button>
        </div>
      </div>

      {/* MAIN */}
      <div className="ac-main">

        {/* TOPBAR */}
        <div className="ac-topbar">
          <span className="ac-topbar-title">
            Dashboard <span>/ {view.charAt(0).toUpperCase() + view.slice(1)}</span>
          </span>
          <div className="ac-user">
            <div className="ac-avatar">{initials}</div>
            <span>{data.first_name} {data.last_name}</span>
          </div>
        </div>

        <div className="ac-content">

          {/* DASHBOARD VIEW */}
          {view === "dashboard" && (
            <>
              <div className="ac-stats">
                <div className="ac-stat blue">
                  <div className="ac-stat-label">Assigned Students</div>
                  <div className="ac-stat-value">{data.assigned_students?.length || 0}</div>
                  <div className="ac-stat-sub">Active placements</div>
                </div>
                <div className="ac-stat amber">
                  <div className="ac-stat-label">Pending Reviews</div>
                  <div className="ac-stat-value">{data.pending_logs?.length || 0}</div>
                  <div className="ac-stat-sub">Awaiting your review</div>
                </div>
                <div className="ac-stat green">
                  <div className="ac-stat-label">Reviewed Logs</div>
                  <div className="ac-stat-value">{data.reviewed_logs?.length || 0}</div>
                  <div className="ac-stat-sub">Completed reviews</div>
                </div>
              </div>

              <div className="ac-section-header">
                <span className="ac-section-title">Pending log reviews</span>
                <span className="ac-badge">{data.pending_logs?.length || 0} pending</span>
              </div>
              <div className="ac-table-wrap">
                <table>
                  <thead>
                    <tr><th>Student</th><th>Week</th><th>Activities</th><th>Hours</th><th>Submitted</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {data.pending_logs?.length === 0 ? (
                      <tr><td colSpan="7"><div className="ac-empty">No pending logs to review</div></td></tr>
                    ) : (
                      data.pending_logs.map((log) => (
                        <tr key={log.id} onClick={() => setSelectedLog(log)} style={{cursor: "pointer"}}>
                          <td>{log.student_name}</td>
                          <td>Week {log.week_number}</td>
                          <td>{log.activities?.substring(0, 50)}...</td>
                          <td>{log.working_hours}h</td>
                          <td>{new Date(log.submission_date).toLocaleDateString()}</td>
                          <td><span className="ac-pill submitted">Submitted</span></td>
                          <td>
                            <button className="ac-btn approve" onClick={(e) => { e.stopPropagation(); reviewLog(log.id, "approved"); }}>Approve</button>
                            <button className="ac-btn reject" onClick={(e) => { e.stopPropagation(); reviewLog(log.id, "rejected"); }}>Reject</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="ac-section-header">
                <span className="ac-section-title">Assigned students</span>
                <input
                  className="ac-search"
                  type="text"
                  placeholder="Search students..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                />
              </div>
              <div className="ac-table-wrap">
                <table>
                  <thead>
                    <tr><th>Student</th><th>Student ID</th><th>Company</th><th>Duration</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {data.assigned_students?.length === 0 ? (
                      <tr><td colSpan="5"><div className="ac-empty">No students assigned yet</div></td></tr>
                    ) : (
                      data.assigned_students
                        .filter(s =>
                          s.student_name.toLowerCase().includes(studentSearch.toLowerCase()) ||
                          s.company_name.toLowerCase().includes(studentSearch.toLowerCase()) ||
                          s.student_id?.toLowerCase().includes(studentSearch.toLowerCase())
                        )
                        .map((s) => (
                          <tr key={s.id}>
                            <td>{s.student_name}</td>
                            <td>{s.student_id}</td>
                            <td>{s.company_name}</td>
                            <td>{s.start_date} → {s.end_date}</td>
                            <td><span className={`ac-pill ${s.status}`}>{s.status}</span></td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* STUDENTS VIEW */}
          {view === "students" && (
            <>
              <div className="ac-section-header">
                <span className="ac-section-title">Assigned students</span>
                <input
                  className="ac-search"
                  type="text"
                  placeholder="Search students..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                />
              </div>
              <div className="ac-table-wrap">
                <table>
                  <thead>
                    <tr><th>Student</th><th>Student ID</th><th>Company</th><th>Duration</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {data.assigned_students?.length === 0 ? (
                      <tr><td colSpan="5"><div className="ac-empty">No students assigned yet</div></td></tr>
                    ) : (
                      data.assigned_students
                        .filter(s =>
                          s.student_name.toLowerCase().includes(studentSearch.toLowerCase()) ||
                          s.company_name.toLowerCase().includes(studentSearch.toLowerCase()) ||
                          s.student_id?.toLowerCase().includes(studentSearch.toLowerCase())
                        )
                        .map((s) => (
                          <tr key={s.id}>
                            <td>{s.student_name}</td>
                            <td>{s.student_id}</td>
                            <td>{s.company_name}</td>
                            <td>{s.start_date} → {s.end_date}</td>
                            <td><span className={`ac-pill ${s.status}`}>{s.status}</span></td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* PENDING LOGS VIEW */}
          {view === "pending" && (
            <>
              <div className="ac-section-header">
                <span className="ac-section-title">Pending log reviews</span>
                <span className="ac-badge">{data.pending_logs?.length || 0} pending</span>
              </div>
              <div className="ac-table-wrap">
                <table>
                  <thead>
                    <tr><th>Student</th><th>Week</th><th>Activities</th><th>Challenges</th><th>Hours</th><th>Submitted</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {data.pending_logs?.length === 0 ? (
                      <tr><td colSpan="7"><div className="ac-empty">No pending logs</div></td></tr>
                    ) : (
                      data.pending_logs.map((log) => (
                        <tr key={log.id} onClick={() => setSelectedLog(log)} style={{cursor: "pointer"}}>
                          <td>{log.student_name}</td>
                          <td>Week {log.week_number}</td>
                          <td>{log.activities?.substring(0, 50)}...</td>
                          <td>{log.challenges || "None"}</td>
                          <td>{log.working_hours}h</td>
                          <td>{new Date(log.submission_date).toLocaleDateString()}</td>
                          <td>
                            <button className="ac-btn approve" onClick={(e) => { e.stopPropagation(); reviewLog(log.id, "approved"); }}>Approve</button>
                            <button className="ac-btn reject" onClick={(e) => { e.stopPropagation(); reviewLog(log.id, "rejected"); }}>Reject</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* REVIEWED LOGS VIEW */}
          {view === "reviewed" && (
            <>
              <div className="ac-section-header">
                <span className="ac-section-title">Reviewed logs</span>
              </div>
              <div className="ac-table-wrap">
                <table>
                  <thead>
                    <tr><th>Student</th><th>Week</th><th>Status</th><th>Score</th><th>Feedback</th><th>Reviewed At</th></tr>
                  </thead>
                  <tbody>
                    {data.reviewed_logs?.length === 0 ? (
                      <tr><td colSpan="6"><div className="ac-empty">No reviewed logs yet</div></td></tr>
                    ) : (
                      data.reviewed_logs.map((log) => (
                        <tr key={log.id}>
                          <td>{log.student_name}</td>
                          <td>Week {log.week_number}</td>
                          <td><span className={`ac-pill ${log.status}`}>{log.status}</span></td>
                          <td>{log.score ?? "—"}/100</td>
                          <td>{log.feedback || "—"}</td>
                          <td>{log.reviewed_at ? new Date(log.reviewed_at).toLocaleDateString() : "—"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

        </div>
      </div>

      {/* LOG DETAIL MODAL */}
      {selectedLog && (
        <div className="ac-modal-overlay" onClick={() => setSelectedLog(null)}>
          <div className="ac-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ac-modal-header">
              <h2>Log Details — Week {selectedLog.week_number}</h2>
              <button className="ac-modal-close" onClick={() => setSelectedLog(null)}>✕</button>
            </div>
            <div className="ac-modal-body">
              <div className="ac-detail-row">
                <span className="ac-detail-label">Student</span>
                <span className="ac-detail-value">{selectedLog.student_name}</span>
              </div>
              <div className="ac-detail-row">
                <span className="ac-detail-label">Week</span>
                <span className="ac-detail-value">{selectedLog.week_number}</span>
              </div>
              <div className="ac-detail-row">
                <span className="ac-detail-label">Working Hours</span>
                <span className="ac-detail-value">{selectedLog.working_hours}h</span>
              </div>
              <div className="ac-detail-row">
                <span className="ac-detail-label">Submitted</span>
                <span className="ac-detail-value">{new Date(selectedLog.submission_date).toLocaleDateString()}</span>
              </div>
              <div className="ac-detail-section">
                <span className="ac-detail-label">Activities</span>
                <p className="ac-detail-text">{selectedLog.activities}</p>
              </div>
              <div className="ac-detail-section">
                <span className="ac-detail-label">Challenges</span>
                <p className="ac-detail-text">{selectedLog.challenges || "None reported"}</p>
              </div>
              {selectedLog.attachment && (
                <div className="ac-detail-row">
                  <span className="ac-detail-label">Attachment</span>
                  <a href={selectedLog.attachment} target="_blank" rel="noreferrer" className="ac-detail-link">View File</a>
                </div>
              )}
            </div>
            <div className="ac-modal-footer">
              <button className="ac-btn approve" onClick={() => { reviewLog(selectedLog.id, "approved"); setSelectedLog(null); }}>Approve</button>
              <button className="ac-btn reject" onClick={() => { reviewLog(selectedLog.id, "rejected"); setSelectedLog(null); }}>Reject</button>
              <button className="ac-btn-cancel" onClick={() => setSelectedLog(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}