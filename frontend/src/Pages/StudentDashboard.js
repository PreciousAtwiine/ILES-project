import { useEffect, useState } from "react";
import axios from "axios";
import "./StudentDashboard.css";
import StudentPlacement from "./StudentPlacement";
import StudentLogs from "./StudentLogs";
import ExceptionRequestModal from "./ExceptionRequestModal";

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
    window.location.href = "/login";
  };

  useEffect(() => {
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
      } finally {
        setLoading(false);
      }
    };

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

      alert("Placement application submitted successfully!");

      const dashboardRes = await axios.get(`${BASE_URL}/api/student/dashboard/`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setDashboardData(dashboardRes.data);
      setActiveTab("dashboard");

    } catch (error) {
      console.error("Placement error:", error.response?.data);
      alert("Application failed");
    }
  };

  
  const submitWeeklyLog = async (e) => {
    e.preventDefault();

    // ✅ VALIDATION
    if (!dashboardData?.placement?.id) {
      alert("You must have a placement before submitting logs.");
      return;
    }

    
    if (dashboardData?.placement?.status !== "approved") {
      alert("Your placement must be approved first.");
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

      alert("Weekly log submitted successfully!");

      
      const dashboardRes = await axios.get(`${BASE_URL}/api/student/dashboard/`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setDashboardData(dashboardRes.data);

    } catch (error) {
      console.error("LOG ERROR:", error.response?.data); // 🔥 shows real backend error
      alert("Failed to submit log");
    }
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
        {activeTab === "dashboard" && (
          <div>
            <h1>Student Dashboard</h1>

            <div className="dashboard-cards">
              <div className="card">
                <h3>Student ID</h3>
                <p>{user?.student_id || "Not set"}</p>
              </div>
              <div className="card">
                <h3>Department</h3>
                <p>{user?.department_name || "Not set"}</p>
              </div>
              <div className="card">
                <h3>Email</h3>
                <p>{user?.email || "Not set"}</p>
              </div>
            </div>

            {dashboardData?.placement ? (
              <div className="placement-info">
                <h2>Placement Information</h2>
                <p><strong>Company:</strong> {dashboardData.placement.company_name}</p>
                <p><strong>Status:</strong> {dashboardData.placement.status}</p>
                <p><strong>Start Date:</strong> {dashboardData.placement.start_date}</p>
                <p><strong>End Date:</strong> {dashboardData.placement.end_date}</p>
              </div>
            ) : (
              <p>No placement yet. Apply under Placement tab.</p>
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
        />
      )}
    </div>
  );
}