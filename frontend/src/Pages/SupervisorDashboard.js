import { useEffect, useState } from "react";
import axios from "axios";
import SupervisorStudents from "./SupervisorStudents";
import SupervisorPendingLogs from "./SupervisorPendingLogs";
import ReviewLogModal from "./ReviewLogModal";
import EvaluationModal from "./EvaluationModal";
import "./SupervisorDashboard.css";
import { notifySuccess, notifyError, notifyInfo } from "../utils/notifications"; 

export default function SupervisorDashboard() {
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [viewLogsStudent, setViewLogsStudent] = useState(null);
  const [studentLogs, setStudentLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const BASE_URL = "http://127.0.0.1:8000";
  const getToken = () => localStorage.getItem("access");

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");


    notifyInfo("Logged out successfully"); 

    window.location.href = "/login";
  };

  const openReviewModal = (log) => {
    setSelectedLog(log);
    setShowReviewModal(true);
  };

  const openEvaluationModal = (placementId, studentName) => {
    setSelectedStudent({ id: placementId, name: studentName });
    setShowEvaluationModal(true);
  };

  const viewStudentLogs = async (studentId, studentName) => {
    setViewLogsStudent({ id: studentId, name: studentName });
    setActiveTab("viewLogs");
    setLoadingLogs(true);

    try {
      const token = getToken();
      const res = await axios.get(
        `${BASE_URL}/logs/?placement__student=${studentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStudentLogs(res.data);

      notifySuccess(`Loaded logs for ${studentName}`); 
    } catch (err) {
      console.error(err);
      setStudentLogs([]);
      notifyError("Failed to load student logs"); 
    } finally {
      setLoadingLogs(false);
    }
  };

  // Refresh dashboard data function
  const refreshDashboard = async () => {
    try {
      const token = getToken();
      const dashboardRes = await axios.get(
        `${BASE_URL}/api/supervisor/dashboard/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDashboardData(dashboardRes.data);
    } catch (err) {
      console.error("Error refreshing dashboard:", err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = getToken();
      if (!token) {
        window.location.href = "/login";
        return;
      }

      try {
        const userRes = await axios.get(`${BASE_URL}/users/me/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(userRes.data.user || userRes.data);

        const dashboardRes = await axios.get(
          `${BASE_URL}/api/supervisor/dashboard/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setDashboardData(dashboardRes.data);

        
        if (dashboardRes.data?.pending_reviews?.length > 0) {
          notifyInfo(
            `You have ${dashboardRes.data.pending_reviews.length} pending logs to review`
          );
        }

      } catch (err) {
        console.error(err);
        notifyError("Failed to load dashboard data"); // ✅ added
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="dashboard-container">

      {/* Sidebar */}
      <div className="sidebar">
        <h2>Workplace Supervisor Panel</h2>
        <p>
          {user?.first_name} {user?.last_name}
        </p>
        <p className="role-badge">Workplace Supervisor</p>

        <button onClick={() => setActiveTab("dashboard")}>Dashboard</button>
        <button onClick={() => setActiveTab("students")}>Students</button>
        <button onClick={() => setActiveTab("pending")}>Pending Logs</button>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="main-content">

        {/* DASHBOARD */}
        {activeTab === "dashboard" && (
          <div>
            <h1>Workplace Supervisor Dashboard</h1>

            <div className="dashboard-cards">
              <div className="card">
                <h3>Assigned Students</h3>
                <p>{dashboardData?.assigned_students?.length || 0}</p>
              </div>

              <div className="card">
                <h3>Pending Reviews</h3>
                <p>{dashboardData?.pending_reviews?.length || 0}</p>
              </div>
            </div>

            {/* Recent Activity */}
            {dashboardData?.assigned_students?.length > 0 && (
              <div className="recent-activity">
                <h3>Assigned Students Overview</h3>
                <div className="student-list">
                  {dashboardData.assigned_students.slice(0, 5).map((student) => (
                    <div key={student.id} className="student-item">
                      <strong>{student.student_name}</strong> - {student.company_name}
                      <span className={`status-badge ${student.status}`}>
                        {student.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STUDENTS */}
        {activeTab === "students" && (
          <SupervisorStudents
            assignedStudents={dashboardData?.assigned_students || []}
            role="workplace"
            onViewLogs={viewStudentLogs}
            onEvaluate={openEvaluationModal}
          />
        )}

        {/* PENDING LOGS */}
        {activeTab === "pending" && (
          <SupervisorPendingLogs
            pendingReviews={dashboardData?.pending_reviews || []}
            onReview={openReviewModal}
          />
        )}

        {/* VIEW STUDENT LOGS */}
        {activeTab === "viewLogs" && viewLogsStudent && (
          <div>
            <h1>Weekly Logs - {viewLogsStudent.name}</h1>

            <button
              className="back-btn"
              onClick={() => {
                setActiveTab("students");
                setViewLogsStudent(null);
              }}
            >
              ← Back to Students
            </button>

            {loadingLogs ? (
              <p>Loading logs...</p>
            ) : studentLogs.length > 0 ? (
              <div className="logs-list">
                {studentLogs.map((log) => (
                  <div key={log.id} className="log-item">
                    <div className="log-header">
                      <strong>Week {log.week_number}</strong>
                      <span className={`status-badge ${log.status}`}>
                        {log.status}
                      </span>
                      {log.is_late && <span className="status-badge late">Late</span>}
                      <span className="log-date">
                        Submitted: {new Date(log.submission_date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="log-activities">
                      <strong>Activities:</strong> {log.activities}
                    </p>
                    {log.challenges && (
                      <p><strong>Challenges:</strong> {log.challenges}</p>
                    )}
                    {log.working_hours && (
                      <p><strong>Hours:</strong> {log.working_hours}h</p>
                    )}
                    {log.attachment && (
                      <p>
                        <strong>Attachment:</strong>{" "}
                        <a href={log.attachment} target="_blank" rel="noopener noreferrer">
                          Download
                        </a>
                      </p>
                    )}
                    {log.feedback && (
                      <div className="log-feedback">
                        <strong>Feedback:</strong> {log.feedback}
                      </div>
                    )}
                    {log.score && (
                      <div className="log-score">
                        <strong>Score:</strong> {log.score}/100
                      </div>
                    )}
                    {log.late_reason && (
                      <div className="late-reason">{log.late_reason}</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p>No logs submitted yet.</p>
            )}
          </div>
        )}
      </div>

      {/* MODALS */}
      {showReviewModal && selectedLog && (
        <ReviewLogModal
          log={selectedLog}
          onClose={() => {
            setShowReviewModal(false);
            refreshDashboard();
          }}
        />
      )}

      {showEvaluationModal && selectedStudent && (
        <EvaluationModal
          student={selectedStudent}
          role="workplace"
          onClose={() => setShowEvaluationModal(false)}
          onComplete={() => {
            refreshDashboard();
            setShowEvaluationModal(false);
          }}
        />
      )}
    </div>
  );
}