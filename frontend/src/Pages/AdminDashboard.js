import { useEffect, useState } from "react";
import axios from "axios";
import "./AdminDashboard.css";

import StaffApprovals from "./StaffApprovals";
import Applications from "./Applications";
import PendingCompanies from "./PendingCompanies";
import ExceptionRequests from "./ExceptionRequests";
import AssignSupervisorModal from "./AssignSupervisorModal";

export default function AdminDashboard({ user }) {
  const [activeTab, setActiveTab] = useState("dashboard");

  const [dashboardData, setDashboardData] = useState({});
  const [pendingStaff, setPendingStaff] = useState([]);
  const [pendingApplications, setPendingApplications] = useState([]);
  const [pendingCompanies, setPendingCompanies] = useState([]);
  const [exceptionRequests, setExceptionRequests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedPlacement, setSelectedPlacement] = useState(null);

  const BASE_URL = "http://127.0.0.1:8000";
  const getToken = () => localStorage.getItem("access");

  useEffect(() => {
    fetchAllAdminData();
  }, []);

  const fetchAllAdminData = async () => {
    try {
      const token = getToken();

      const [dashboardRes, staffRes, applicationsRes, companiesRes, exceptionsRes] =
        await Promise.all([
          axios.get(`${BASE_URL}/api/admin/dashboard/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${BASE_URL}/users/pending_staff/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${BASE_URL}/placements/pending/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${BASE_URL}/api/admin/pending-companies/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${BASE_URL}/api/admin/pending-exceptions/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

      setDashboardData(dashboardRes.data);
      setPendingStaff(staffRes.data);
      setPendingApplications(applicationsRes.data);
      setPendingCompanies(companiesRes.data);
      setExceptionRequests(exceptionsRes.data);

    } catch (error) {
      console.error("Admin dashboard load error:", error);
    } finally {
      setLoading(false);
    }
  };

  const approveStaff = async (staff) => {
    const token = getToken();

    await axios.post(
      `${BASE_URL}/users/approve_staff/`,
      { user_id: staff.id, approve: true },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    fetchAllAdminData();
  };

  const rejectStaff = async (staff) => {
    const token = getToken();

    await axios.post(
      `${BASE_URL}/users/approve_staff/`,
      { user_id: staff.id, approve: false },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    fetchAllAdminData();
  };

  const approveCompany = async (id) => {
    const token = getToken();

    await axios.post(
      `${BASE_URL}/api/admin/approve-company/${id}/`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    fetchAllAdminData();
  };

  const rejectCompany = async (id) => {
    const token = getToken();

    await axios.post(
      `${BASE_URL}/api/admin/reject-company/${id}/`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    fetchAllAdminData();
  };

  const approveException = async (id) => {
    const token = getToken();

    await axios.post(
      `${BASE_URL}/api/admin/approve-exception/${id}/`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    fetchAllAdminData();
  };

  const rejectException = async (id) => {
    const token = getToken();

    await axios.post(
      `${BASE_URL}/api/admin/reject-exception/${id}/`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    fetchAllAdminData();
  };

  const openAssignModal = (app) => {
    setSelectedPlacement(app);
    setShowAssignModal(true);
  };

  if (loading) return <div>Loading Admin Dashboard...</div>;

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <h2>Admin Dashboard</h2>

        <button onClick={() => setActiveTab("dashboard")}>Dashboard</button>
        <button onClick={() => setActiveTab("staff")}>Staff Approvals</button>
        <button onClick={() => setActiveTab("applications")}>Applications</button>
        <button onClick={() => setActiveTab("companies")}>Pending Companies</button>
        <button onClick={() => setActiveTab("exceptions")}>Exception Requests</button>
      </div>

      <div className="main-content">
        {activeTab === "dashboard" && (
          <div className="dashboard-cards">
            <div className="card">
              <h3>Total Students</h3>
              <p>{dashboardData.total_students || 0}</p>
            </div>
            <div className="card">
              <h3>Total Supervisors</h3>
              <p>{dashboardData.total_supervisors || 0}</p>
            </div>
            <div className="card">
              <h3>Pending Applications</h3>
              <p>{dashboardData.pending_applications || 0}</p>
            </div>
            <div className="card">
              <h3>Active Internships</h3>
              <p>{dashboardData.active_internships || 0}</p>
            </div>
          </div>
        )}

        {activeTab === "staff" && (
          <StaffApprovals
            pendingStaff={pendingStaff}
            onApprove={approveStaff}
            onReject={rejectStaff}
          />
        )}

        {activeTab === "applications" && (
          <Applications
            pendingApplications={pendingApplications}
            onAssign={openAssignModal}
          />
        )}

        {activeTab === "companies" && (
          <PendingCompanies
            pendingCompanies={pendingCompanies}
            onApprove={approveCompany}
            onReject={rejectCompany}
          />
        )}

        {activeTab === "exceptions" && (
          <ExceptionRequests
            exceptionRequests={exceptionRequests}
            onApprove={approveException}
            onReject={rejectException}
          />
        )}
      </div>

      {showAssignModal && (
        <AssignSupervisorModal
          placement={selectedPlacement}
          onClose={() => setShowAssignModal(false)}
          onAssign={() => {
            fetchAllAdminData();
            setShowAssignModal(false);
          }}
        />
      )}
    </div>
  );
}