import { useEffect, useState } from "react";
import axios from "axios";
import SupervisorStudents from "./SupervisorStudents";
import SupervisorPendingLogs from "./SupervisorPendingLogs";
import ReviewLogModal from "./ReviewLogModal";
import EvaluationModal from "./EvaluationModal";
import "./SupervisorDashboard.css";
import notifications from "../utils/notifications"; 

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
    notifications.notifyInfo("Logged out successfully");
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
      notifications.notifySuccess(`Loaded logs for ${studentName}`);
    } catch (err) {
      console.error(err);
      setStudentLogs([]);
      notifications.notifyError("Failed to load student logs");
    } finally {
      setLoadingLogs(false);
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
          notifications.notifyInfo(
            `You have ${dashboardRes.data.pending_reviews.length} pending logs to review`
          );
        }
      } catch (err) {
        console.error(err);
        notifications.notifyError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <h2>Supervisor Panel</h2>
        <p>
          {user?.first_name} {user?.last_name}
        </p>
        <button onClick={() => setActiveTab("dashboard")}>Dashboard</button>
        <button onClick={() => setActiveTab("students")}>Students</button>
        <button onClick={() => setActiveTab("pending")}>Pending Logs</button>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="main-content">
        {activeTab === "dashboard" && (
          <div>
            <h1>Supervisor Dashboard</h1>
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
          </div>
        )}

        {activeTab === "students" && (
          <SupervisorStudents
            assignedStudents={dashboardData?.assigned_students || []}
            onViewLogs={viewStudentLogs}
            onEvaluate={openEvaluationModal}
          />
        )}

        {activeTab === "pending" && (
          <SupervisorPendingLogs
            pendingReviews={dashboardData?.pending_reviews || []}
            onReview={openReviewModal}
          />
        )}

        {activeTab === "viewLogs" && viewLogsStudent && (
          <div>
            <h1>Logs - {viewLogsStudent.name}</h1>
            <button
              onClick={() => {
                setActiveTab("students");
                setViewLogsStudent(null);
              }}
            >
              Back
            </button>
            {loadingLogs ? (
              <p>Loading...</p>
            ) : studentLogs.length > 0 ? (
              studentLogs.map((log) => (
                <div key={log.id} className="log-item">
                  <h4>Week {log.week_number}</h4>
                  <p>{log.activities}</p>
                  <p>Status: {log.status}</p>
                </div>
              ))
            ) : (
              <p>No logs found</p>
            )}
          </div>
        )}
      </div>

      {showReviewModal && selectedLog && (
        <ReviewLogModal
          log={selectedLog}
          onClose={() => setShowReviewModal(false)}
        />
      )}

      {showEvaluationModal && selectedStudent && (
        <EvaluationModal
          student={selectedStudent}
          onClose={() => setShowEvaluationModal(false)}
        />
      )}
    </div>
  );
}