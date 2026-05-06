import { useEffect, useState } from "react";
import axios from "axios";
import "./StudentDashboard.css";
import StudentPlacement from "./StudentPlacement";
import StudentLogs from "./StudentLogs";
import ExceptionRequestModal from "./ExceptionRequestModal";
import notifications from "../utils/notifications";
import Notifications from "./Notifications";

export default function StudentDashboard() {
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showExceptionModal, setShowExceptionModal] = useState(false);

  const [approvedCompanies, setApprovedCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [newCompanyName, setNewCompanyName] = useState("");

  const BASE_URL = "http://127.0.0.1:8000";
  const getToken = () => localStorage.getItem("access");

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    notifications.notifyInfo("Logged out successfully");
    window.location.href = "/login";
  };

  const fetchStudentData = async () => {
    const token = getToken();
    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      const userRes = await axios.get(`${BASE_URL}/users/me/`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUser(userRes.data.user);

      const studentRes = await axios.get(`${BASE_URL}/api/student/dashboard/`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setDashboardData(studentRes.data);

      const companiesRes = await axios.get(`${BASE_URL}/api/companies/approved/`);
      setApprovedCompanies(companiesRes.data);

    } catch (error) {
      console.error("Error fetching student dashboard:", error.response?.data);
      notifications.notifyError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, []);

  const applyForPlacement = async (e) => {
    e.preventDefault();

    const start_date = document.getElementById("start_date").value;
    const end_date = document.getElementById("end_date").value;
    const student_id = user?.student_id;

    let company_name = "";
    if (selectedCompanyId) {
      const selectedCompany = approvedCompanies.find(
        c => c.id === parseInt(selectedCompanyId)
      );
      company_name = selectedCompany?.name || "";
    } else {
      company_name = newCompanyName;
    }

    try {
      const token = getToken();

      await axios.post(`${BASE_URL}/api/placements/apply/`, {
        student_id,
        company_name,
        start_date,
        end_date
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      notifications.notifySuccess("Placement application submitted successfully!");

      const dashboardRes = await axios.get(`${BASE_URL}/api/student/dashboard/`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setDashboardData(dashboardRes.data);
      setActiveTab("dashboard");

    } catch (error) {
      console.error("Placement error:", error.response?.data);
      notifications.notifyError(error.response?.data?.error || "Application failed");
    }
  };

  const submitWeeklyLog = async (e) => {
    e.preventDefault();

    if (!dashboardData?.placement?.id) {
      notifications.notifyError("You must have a placement before submitting logs.");
      return;
    }

    if (dashboardData?.placement?.status !== "approved") {
      notifications.notifyError("Your placement must be approved first.");
      return;
    }

    const formData = new FormData();

    formData.append("placement", dashboardData.placement.id);
    formData.append("week_number", document.getElementById("week_number").value);
    formData.append("activities", document.getElementById("activities").value);
    formData.append("challenges", document.getElementById("challenges").value);
    formData.append("working_hours", document.getElementById("working_hours").value);

    const fileInput = document.getElementById("attachment");
    if (fileInput && fileInput.files.length > 0) {
      formData.append("attachment", fileInput.files[0]);
    }

    try {
      const token = getToken();

      await axios.post(`${BASE_URL}/api/student/logs/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      notifications.notifySuccess("Weekly log submitted successfully!");

      const dashboardRes = await axios.get(`${BASE_URL}/api/student/dashboard/`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setDashboardData(dashboardRes.data);

    } catch (error) {
      console.error("LOG ERROR:", error.response?.data);
      notifications.notifyError(error.response?.data?.error || "Failed to submit log");
    }
  };

  const openExceptionModal = () => {
    setShowExceptionModal(true);
  };

  const handleExceptionComplete = async () => {
    await fetchStudentData();
    setShowExceptionModal(false);
  };

  if (loading) {
    return <div className="loading-container">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <h2>ILES System</h2>
        <div className="user-info">
          <p><strong>{user?.first_name} {user?.last_name}</strong></p>
          <p className="role-badge">student</p>
        </div>

        <nav className="sidebar-nav">
          <button onClick={() => setActiveTab("dashboard")}>Dashboard</button>
          <button onClick={() => setActiveTab("placement")}>Placement</button>
          <button onClick={() => setActiveTab("logs")}>Weekly Logs</button>
          <button onClick={logout} className="logout-btn">Logout</button>
        </nav>
      </div>

      <div className="main-content">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
          <Notifications 
            role="student"
            getToken={getToken}
            BASE_URL={BASE_URL}
            onNotificationClick={(notification) => {
              if (notification.type === 'placement') setActiveTab('placement');
              else if (notification.type === 'review') setActiveTab('logs');
            }}
          />
        </div>

        {activeTab === "dashboard" && (
          <div>
            <h1>Student Dashboard</h1>

            <div className="dashboard-cards">
              <div className="card">
                <h3>University Student ID</h3>
                <p>{user?.student_id || "Not set"}</p>
              </div>
              <div className="card">
                <h3>Department of Attachment</h3>
                <p>{user?.department_name || "Not set"}</p>
              </div>
              <div className="card">
                <h3>Email Address</h3>
                <p>{user?.email || "Not set"}</p>
              </div>
            </div>

            {dashboardData?.placement ? (
              <div className="placement-info">
                <h2>Placement Information</h2>
                <p><strong>Company:</strong> {dashboardData.placement.company_name}</p>
                <p><strong>Status:</strong> 
                  <span className={`status-badge ${dashboardData.placement.status}`}>
                    {dashboardData.placement.status}
                  </span>
                </p>
                <p><strong>Start Date:</strong> {dashboardData.placement.start_date}</p>
                <p><strong>End Date:</strong> {dashboardData.placement.end_date}</p>
                {dashboardData.placement.workplace_supervisor_name && (
                  <p><strong>Workplace Supervisor:</strong> {dashboardData.placement.workplace_supervisor_name}</p>
                )}
                {dashboardData.placement.academic_supervisor_name && (
                  <p><strong>Academic Supervisor:</strong> {dashboardData.placement.academic_supervisor_name}</p>
                )}
              </div>
            ) : (
              <div className="empty-placement">
                <p>No placement yet. <button onClick={() => setActiveTab("placement")}>Apply now</button></p>
              </div>
            )}

            {/* ✅ FIXED: EXCEPTION REQUEST SECTION - Only show if eligible AND not requested yet */}
            {dashboardData?.can_request_exception && !dashboardData?.log_exception_requested && (
              <div className="exception-request" style={{
                background: '#fef3c7',
                border: '1px solid #f59e0b',
                borderRadius: '8px',
                padding: '16px',
                marginTop: '20px'
              }}>
                <p>⚠️ You have missing weekly logs. The system cannot calculate your final grade.</p>
                <button 
                  className="exception-btn" 
                  onClick={openExceptionModal}
                  style={{
                    background: '#f59e0b',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    marginTop: '10px'
                  }}
                >
                  Request Exception for Missing Logs
                </button>
              </div>
            )}

            {/* ✅ FIXED: EXCEPTION STATUS DISPLAY - ONLY show if an exception was ACTUALLY requested */}
            {dashboardData?.log_exception_requested === true && dashboardData?.exception_status && (
              <>
                {dashboardData.exception_status === 'approved' && (
                  <div className="exception-status approved" style={{
                    background: '#dcfce7',
                    border: '1px solid #86efac',
                    borderRadius: '8px',
                    padding: '16px',
                    marginTop: '20px',
                    color: '#15803d'
                  }}>
                    <p>✅ Your exception request has been approved! Your grade will be calculated based on submitted logs.</p>
                  </div>
                )}
                
                {dashboardData.exception_status === 'rejected' && (
                  <div className="exception-status rejected" style={{
                    background: '#fee2e2',
                    border: '1px solid #fca5a5',
                    borderRadius: '8px',
                    padding: '16px',
                    marginTop: '20px',
                    color: '#b91c1c'
                  }}>
                    <p>❌ Your exception request was rejected. Please contact your Academic supervisor to resolve missing logs.</p>
                  </div>
                )}
                
                {dashboardData.exception_status === 'pending' && (
                  <div className="exception-status pending" style={{
                    background: '#eff6ff',
                    border: '1px solid #3b82f6',
                    borderRadius: '8px',
                    padding: '16px',
                    marginTop: '20px',
                    color: '#1e40af'
                  }}>
                    <p>⏳ Your exception request is pending admin review. You will be notified once a decision is made.</p>
                  </div>
                )}
              </>
            )}

            {/* FINAL EVALUATION DISPLAY */}
            {dashboardData?.evaluation && (
              <>
                <div className="section-title">
                  <h2>Final Evaluation Results</h2>
                </div>
                <div className="evaluation-card" style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '20px',
                  padding: '24px',
                  color: 'white',
                  marginTop: '20px'
                }}>
                  <div className="evaluation-scores" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '20px'
                  }}>
                    <div className="score-item" style={{
                      textAlign: 'center',
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.15)',
                      borderRadius: '12px'
                    }}>
                      <span>Workplace Score (40%)</span>
                      <strong style={{ fontSize: '24px', display: 'block' }}>
                        {dashboardData.evaluation.workplace_score || "Pending"}
                      </strong>
                    </div>
                    <div className="score-item" style={{
                      textAlign: 'center',
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.15)',
                      borderRadius: '12px'
                    }}>
                      <span>Academic Score (30%)</span>
                      <strong style={{ fontSize: '24px', display: 'block' }}>
                        {dashboardData.evaluation.academic_score || "Pending"}
                      </strong>
                    </div>
                    <div className="score-item" style={{
                      textAlign: 'center',
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.15)',
                      borderRadius: '12px'
                    }}>
                      <span>Log Average (30%)</span>
                      <strong style={{ fontSize: '24px', display: 'block' }}>
                        {dashboardData.evaluation.log_avg_score || "Pending"}
                      </strong>
                    </div>
                    <div className="score-item total" style={{
                      textAlign: 'center',
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.25)',
                      borderRadius: '12px'
                    }}>
                      <span>Final Score</span>
                      <strong style={{ fontSize: '28px', display: 'block' }}>
                        {dashboardData.evaluation.final_score || "Pending"}
                      </strong>
                    </div>
                    <div className="score-item grade" style={{
                      textAlign: 'center',
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.15)',
                      borderRadius: '12px'
                    }}>
                      <span>Grade</span>
                      <strong style={{
                        fontSize: '32px',
                        background: '#fbbf24',
                        color: '#1e293b',
                        padding: '4px 16px',
                        borderRadius: '40px',
                        display: 'inline-block'
                      }}>
                        {dashboardData.evaluation.grade || "Pending"}
                      </strong>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Recent Logs Section */}
            <div className="section-title">
              <h2>Recent Weekly Logs</h2>
            </div>
            {dashboardData?.recent_logs?.length > 0 ? (
              <div className="logs-list">
                {dashboardData.recent_logs.slice(0, 5).map((log, idx) => (
                  <div key={idx} className="log-item">
                    <div className="log-header">
                      <strong>Week {log.week_number}</strong>
                      <span className={`status-badge ${log.status}`}>{log.status}</span>
                      {log.is_late && <span className="status-badge late">Late</span>}
                      <span className="log-date">Submitted: {new Date(log.submission_date).toLocaleDateString()}</span>
                    </div>
                    <p className="log-activities">{log.activities}</p>
                    {log.score && <div className="log-score">Score: {log.score}/100</div>}
                    {log.feedback && (
                      <div className="log-feedback" style={{
                        background: '#f0fdf4',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        marginTop: '10px',
                        fontSize: '13px',
                        color: '#166534'
                      }}>
                        <strong>Feedback:</strong> {log.feedback}
                      </div>
                    )}
                    {log.late_reason && (
                      <div className="late-reason" style={{
                        marginTop: '8px',
                        padding: '8px 12px',
                        background: '#fffbeb',
                        borderLeft: '3px solid #f59e0b',
                        borderRadius: '6px',
                        fontSize: '12px',
                        color: '#92400e'
                      }}>
                        {log.late_reason}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p>No logs yet. Submit your first weekly log.</p>
            )}
          </div>
        )}

        {activeTab === "placement" && (
          <StudentPlacement
            studentId={user?.student_id || ""}
            approvedCompanies={approvedCompanies}
            selectedCompanyId={selectedCompanyId}
            newCompanyName={newCompanyName}
            onCompanyChange={(e) => setSelectedCompanyId(e.target.value)}
            onNewCompanyChange={(e) => setNewCompanyName(e.target.value)}
            onSubmit={applyForPlacement}
          />
        )}

        {activeTab === "logs" && (
          <StudentLogs
            recentLogs={dashboardData?.recent_logs}
            onSubmit={submitWeeklyLog}
          />
        )}
      </div>

      {showExceptionModal && (
        <ExceptionRequestModal
          onClose={() => setShowExceptionModal(false)}
          onComplete={handleExceptionComplete}
        />
      )}
    </div>
  );
}