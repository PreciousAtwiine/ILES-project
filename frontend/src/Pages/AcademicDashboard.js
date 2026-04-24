import { useEffect, useState } from "react";
import axios from "axios";
import "./Dashboard.css";

export default function AcademicDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("access");

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await axios.get(
        "http://127.0.0.1:8000/api/supervisor/academic/dashboard/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setData(res.data);
      setLoading(false);
    } catch (err) {
      console.log("Error:", err.response?.status, err.response?.data);
      setError(`Failed to load dashboard: ${err.response?.status} - ${JSON.stringify(err.response?.data)}`);
      setLoading(false);
    }
  };

  const reviewLog = async (logId, status) => {
    try {
      await axios.put(
        `http://127.0.0.1:8000/logs/${logId}/review/`,
        {
          status: status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchDashboard(); // refresh
    } catch (err) {
      alert("Failed to review log");
    }
  };

  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="dashboard-container">

      {/* HEADER */}
      <div className="dashboard-header">
        <h2>Academic Supervisor Dashboard</h2>
        <p>
          Welcome {data.first_name} {data.last_name}
        </p>
        <p>Department: {data.department}</p>
        <p>Staff ID: {data.staff_id}</p>
      </div>

      {/* ASSIGNED STUDENTS */}
      <section>
        <h3>🎓 Assigned Students</h3>

        {data.assigned_students?.length === 0 ? (
          <p>No students assigned</p>
        ) : (
          data.assigned_students.map((p) => (
            <div key={p.id} className="card">
              <p><strong>Student:</strong> {p.student_name}</p>
              <p><strong>Student ID:</strong> {p.student_id}</p>
              <p><strong>Company:</strong> {p.company_name}</p>
              <p><strong>Status:</strong> {p.status}</p>
              <p><strong>Duration:</strong> {p.start_date} → {p.end_date}</p>
            </div>
          ))
        )}
      </section>

      
      <section>
        <h3>⏳ Pending Logs (Review Required)</h3>

        {data.pending_logs?.length === 0 ? (
          <p>No pending logs</p>
        ) : (
          data.pending_logs.map((log) => (
            <div key={log.id} className="card pending">

              <p><strong>Student:</strong> {log.student_name}</p>
              <p><strong>Week:</strong> {log.week_number}</p>

              <p><strong>Activities:</strong> {log.activities}</p>
              <p><strong>Challenges:</strong> {log.challenges || "None"}</p>
              <p><strong>Working Hours:</strong> {log.working_hours}</p>

              {log.attachment && (
                <p>
                  <strong>Attachment:</strong>{" "}
                  <a href={log.attachment} target="_blank" rel="noreferrer">
                    View File
                  </a>
                </p>
              )}

              <p><strong>Status:</strong> {log.status}</p>
              <p><strong>Submitted:</strong> {log.submission_date}</p>

              {/* ACTION BUTTONS */}
              <div className="actions">
                <button
                  className="approve-btn"
                  onClick={() => reviewLog(log.id, "approved")}
                >
                  Approve
                </button>

                <button
                  className="reject-btn"
                  onClick={() => reviewLog(log.id, "rejected")}
                >
                  Reject
                </button>
              </div>
            </div>
          ))
        )}
      </section>

      {/* REVIEWED LOGS */}
      <section>
        <h3>✅ Reviewed Logs</h3>

        {data.reviewed_logs?.length === 0 ? (
          <p>No reviewed logs</p>
        ) : (
          data.reviewed_logs.map((log) => (
            <div key={log.id} className="card reviewed">

              <p><strong>Student:</strong> {log.student_name}</p>
              <p><strong>Week:</strong> {log.week_number}</p>

              <p><strong>Status:</strong> {log.status}</p>
              <p><strong>Score:</strong> {log.score}/100</p>
              <p><strong>Feedback:</strong> {log.feedback}</p>

              <p><strong>Reviewed At:</strong> {log.reviewed_at}</p>
            </div>
          ))
        )}
      </section>

    </div>
  );
}