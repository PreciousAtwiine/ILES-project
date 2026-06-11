import { useEffect, useState } from "react";
import axios from "axios";
import SupervisorStudents from "./SupervisorStudents";
import SupervisorPendingLogs from "./SupervisorPendingLogs";
import ReviewLogModal from "./ReviewLogModal";
import EvaluationModal from "./EvaluationModal";
import "./SupervisorDashboard.css";
import notifications from "../utils/notifications";
import PendingApproval from "./PendingApproval";
import Notifications from "./Notifications";
import API_URL from '../utils/api';
import { 
  LuFileText, LuCheck, LuX, LuClock, LuArrowLeft, 
  LuUsers, LuClipboardList, LuLayoutDashboard, LuLogOut,
  LuInfo, LuBookOpen, LuAward
} from 'react-icons/lu';

const formatDate = (dateString) => {
  if (!dateString) return "Not submitted";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date";
    return date.toLocaleDateString();
  } catch (e) {
    return "Invalid date";
  }
};

const formatHours = (hours) => {
  if (hours === null || hours === undefined || hours === '') return "0";
  let numHours;
  if (typeof hours === 'object' && hours !== null) {
    numHours = parseFloat(hours.toString());
  } else if (typeof hours === 'string') {
    numHours = parseFloat(hours);
  } else if (typeof hours === 'number') {
    numHours = hours;
  } else {
    return "0";
  }
  if (isNaN(numHours)) return "0";
  if (numHours % 1 === 0) return numHours.toString();
  return numHours.toFixed(2).replace(/\.?0+$/, '');
};

export default function SupervisorDashboard() {
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isApproved, setIsApproved] = useState(true);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [viewLogsStudent, setViewLogsStudent] = useState(null);
  const [studentLogs, setStudentLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

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
        `${API_URL}/logs/?placement__student=${studentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const formattedLogs = res.data.map(log => {
        let workingHours = 0;
        if (log.working_hours !== null && log.working_hours !== undefined) {
          if (typeof log.working_hours === 'object' && log.working_hours !== null) {
            workingHours = parseFloat(log.working_hours.toString());
          } else {
            workingHours = parseFloat(log.working_hours);
          }
        }
        return {
          ...log,
          submission_date: log.submission_date ? new Date(log.submission_date) : null,
          formatted_date: formatDate(log.submission_date),
          working_hours: isNaN(workingHours) ? 0 : workingHours
        };
      });
      setStudentLogs(formattedLogs);
      notifications.notifySuccess(`Loaded logs for ${studentName}`);
    } catch (err) {
      console.error(err);
      setStudentLogs([]);
      notifications.notifyError("Failed to load student logs");
    } finally {
      setLoadingLogs(false);
    }
  };

  const refreshDashboard = async () => {
    try {
      const token = getToken();
      const dashboardRes = await axios.get(
        `${API_URL}/api/supervisor/dashboard/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (dashboardRes.data?.pending_reviews) {
        dashboardRes.data.pending_reviews = dashboardRes.data.pending_reviews.map(log => ({
          ...log,
          formatted_hours: formatHours(log.working_hours)
        }));
      }
      setDashboardData(dashboardRes.data);
      if (dashboardRes.data?.pending_late_requests && dashboardRes.data.pending_late_requests.length > 0) {
        notifications.notifyInfo(`You have ${dashboardRes.data.pending_late_requests.length} late submission request(s) to review`);
      }
    } catch (err) {
      console.error("Error refreshing dashboard:", err);
    }
  };

  const handleLateDecision = async (request, decision, reason) => {
    try {
      const token = getToken();
      await axios.post(`${API_URL}/api/workplace/late-decision/${request.id}/`, {
        decision: decision,
        reason: reason || ""
      }, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      notifications.notifySuccess(`Late submission ${decision}d successfully`);
      refreshDashboard();
    } catch (error) {
      console.error("Error submitting decision:", error);
      notifications.notifyError(error.response?.data?.error || "Failed to submit decision");
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
        const userRes = await axios.get(`${API_URL}/users/me/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = userRes.data.user || userRes.data;
        setUser(userData);
        
        const approved = userData.is_approved !== false;
        setIsApproved(approved);
        
        if (approved) {
          const dashboardRes = await axios.get(
            `${API_URL}/api/supervisor/dashboard/`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (dashboardRes.data?.pending_reviews) {
            dashboardRes.data.pending_reviews = dashboardRes.data.pending_reviews.map(log => ({
              ...log,
              formatted_hours: formatHours(log.working_hours)
            }));
          }
          setDashboardData(dashboardRes.data);
          if (dashboardRes.data?.pending_reviews?.length > 0) {
            notifications.notifyInfo(`You have ${dashboardRes.data.pending_reviews.length} pending logs to review`);
          }
        }
      } catch (err) {
        console.error(err);
        if (err.response?.status === 401) {
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          window.location.href = "/login";
        } else {
          notifications.notifyError("Failed to load dashboard data");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Loading...</p>;
  
  if (!isApproved && user) {
    const userName = `${user.first_name || ""} ${user.last_name || ""}`;
    return <PendingApproval role="workplace" userName={userName} />;
  }

  // Helper to check if any data exists
  const hasAssignedStudents = dashboardData?.assigned_students && dashboardData.assigned_students.length > 0;
  const hasCompletedStudents = dashboardData?.completed_students && dashboardData.completed_students.length > 0;
  const hasPendingReviews = dashboardData?.pending_reviews && dashboardData.pending_reviews.length > 0;

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <h2>Workplace Supervisor Panel</h2>
        <p>{user?.first_name} {user?.last_name}</p>
        <p className="role-badge">Workplace Supervisor</p>

        <button onClick={() => setActiveTab("dashboard")}>
          <LuLayoutDashboard size={14} /> Dashboard
        </button>
        <button onClick={() => setActiveTab("students")}>
          <LuUsers size={14} /> Students
        </button>
        <button onClick={() => setActiveTab("pending")}>
          <LuClipboardList size={14} /> Pending Logs
        </button>
        <button className="logout-btn" onClick={handleLogout}>
          <LuLogOut size={14} /> Logout
        </button>
      </div>

      <div className="main-content">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
          <Notifications 
            role="workplace"
            getToken={getToken}
            onNotificationClick={(notification) => {
              if (notification.type === 'log') setActiveTab('pending');
              else if (notification.type === 'late_submission') setActiveTab('dashboard');
            }}
          />
        </div>

        {activeTab === "dashboard" && (
          <div>
            <h1><LuLayoutDashboard size={24} /> Workplace Supervisor Dashboard</h1>
            
            {/* Welcome and info section */}
            <div className="welcome-card" style={{ background: '#f0f9ff', borderRadius: '16px', padding: '20px', marginBottom: '24px', borderLeft: '4px solid #3b82f6' }}>
              <h3 style={{ margin: '0 0 8px 0' }}>Welcome, {user?.first_name} {user?.last_name}!</h3>
              <p style={{ margin: 0, color: '#475569' }}>
                As a workplace supervisor, you can review intern's weekly logs, provide scores and feedback, and submit the final evaluation.
              </p>
            </div>

            <div className="dashboard-cards">
              <div className="card">
                <h3><LuUsers size={16} /> Assigned Students</h3>
                <p>{dashboardData?.assigned_students?.length || 0}</p>
                {!hasAssignedStudents && <small style={{ color: '#64748b' }}>No active interns assigned yet.</small>}
              </div>
              <div className="card">
                <h3><LuClipboardList size={16} /> Pending Reviews</h3>
                <p>{dashboardData?.pending_reviews?.length || 0}</p>
                {!hasPendingReviews && <small style={{ color: '#64748b' }}>No logs waiting for review.</small>}
              </div>
              {hasCompletedStudents && (
                <div className="card">
                  <h3><LuAward size={16} /> Completed Evaluations</h3>
                  <p>{dashboardData?.completed_students?.length || 0}</p>
                </div>
              )}
            </div>

            {/* Helpful placeholder when no assigned students */}
            {!hasAssignedStudents && !hasCompletedStudents && (
              <div className="empty-placeholder" style={{ background: 'white', borderRadius: '16px', padding: '40px', textAlign: 'center', border: '1px dashed #cbd5e1', marginTop: '20px' }}>
                <LuInfo size={48} style={{ color: '#94a3b8', marginBottom: '16px' }} />
                <h3 style={{ color: '#1e293b', marginBottom: '8px' }}>No students assigned yet</h3>
                <p style={{ color: '#64748b', maxWidth: '500px', margin: '0 auto' }}>
                  Students will appear here once the admin assigns them to you. 
                  You can then review their logs and submit evaluations.
                </p>
                <button 
                  onClick={() => setActiveTab("students")} 
                  style={{ marginTop: '20px', background: '#3b82f6', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer' }}
                >
                  View Students
                </button>
              </div>
            )}

            {/* Helpful tip when assigned but no pending logs */}
            {hasAssignedStudents && !hasPendingReviews && !hasCompletedStudents && (
              <div className="info-card" style={{ background: '#fefce8', borderRadius: '16px', padding: '20px', marginTop: '20px', borderLeft: '4px solid #eab308' }}>
                <h3 style={{ margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}><LuBookOpen size={18} /> Waiting for student submissions</h3>
                <p style={{ margin: 0, color: '#475569' }}>
                  Your assigned students have not yet submitted any weekly logs. Once they submit, logs will appear in the "Pending Logs" tab for you to review.
                </p>
              </div>
            )}

            {/* Late submission requests section (existing) */}
            {dashboardData?.pending_late_requests && dashboardData.pending_late_requests.length > 0 && (
              <div style={{ marginTop: '24px' }}>
                <div className="section-title">
                  <h2><LuFileText size={20} /> Pending Late Submission Requests</h2>
                  <p>Students have requested to submit missing logs late. Please review and make a decision.</p>
                </div>
                {dashboardData.pending_late_requests.map((request) => (
                  <div key={request.id} className="exception-card pending" style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '16px',
                    border: '1px solid #e2e8f0',
                    borderLeft: '4px solid #f59e0b'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', marginBottom: '12px' }}>
                      <h3 style={{ margin: 0, color: '#1e293b' }}>{request.student_name}</h3>
                      <span style={{ background: '#fef3c7', color: '#92400e', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <LuClock size={12} /> Awaiting Your Decision
                      </span>
                    </div>
                    <p style={{ margin: '5px 0', color: '#64748b', fontSize: '14px' }}>
                      <strong>Company:</strong> {request.company_name}
                    </p>
                    <div style={{ margin: '10px 0', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                      <strong>Student's Explanation:</strong>
                      <p style={{ marginTop: '8px', fontSize: '14px', color: '#334155' }}>{request.exception_reason}</p>
                    </div>
                    <div style={{ margin: '10px 0' }}>
                      <p><strong>Missing Weeks:</strong> Week {request.missing_weeks.join(', ')}</p>
                      <p><strong>Submitted Weeks:</strong> Week {request.submitted_weeks.join(', ')}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                      <button 
                        onClick={() => {
                          const reason = prompt("Optional: Add a reason for approval");
                          handleLateDecision(request, 'approve', reason);
                        }}
                        style={{ background: '#10b981', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <LuCheck size={14} /> Approve Late Submission
                      </button>
                      <button 
                        onClick={() => {
                          const reason = prompt("Please provide a reason for rejection:");
                          if (reason) handleLateDecision(request, 'reject', reason);
                          else alert("A reason is required for rejection");
                        }}
                        style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <LuX size={14} /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quick overview of assigned students (if any) */}
            {hasAssignedStudents && (
              <div className="recent-activity" style={{ marginTop: '24px' }}>
                <h3>Assigned Students Overview</h3>
                <div className="student-list">
                  {dashboardData.assigned_students.slice(0, 5).map((student) => (
                    <div key={student.id} className="student-item" style={{ background: 'white', padding: '12px', borderRadius: '8px', marginBottom: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong>{student.student_name}</strong> - {student.company_name}
                      </div>
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

        {activeTab === "students" && (
          <SupervisorStudents
            assignedStudents={dashboardData?.assigned_students || []}
            role="workplace"
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
            <h1>Weekly Logs - {viewLogsStudent.name}</h1>
            <button
              className="back-btn"
              onClick={() => {
                setActiveTab("students");
                setViewLogsStudent(null);
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <LuArrowLeft size={14} /> Back to Students
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
                        Submitted: {log.formatted_date}
                      </span>
                    </div>
                    <p className="log-activities">
                      <strong>Activities:</strong> {log.activities || "—"}
                    </p>
                    {log.challenges && (
                      <p><strong>Challenges:</strong> {log.challenges}</p>
                    )}
                    <p><strong>Hours:</strong> {formatHours(log.working_hours)}h</p>
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
              <div className="empty-placeholder" style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '16px' }}>
                <LuFileText size={48} style={{ color: '#94a3b8' }} />
                <p>No logs submitted yet by this student.</p>
              </div>
            )}
          </div>
        )}
      </div>

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
