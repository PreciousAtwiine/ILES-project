import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import StudentDashboard from "./Pages/Dashboard";
import WorkplaceSupervisorDashboard from "./Pages/WorkplaceSupervisorDashboard";





import AcademicDashboard from "./Pages/AcademicDashboard";

import StudentsPage from "./Pages/StudentsPage";
import PendingLogsPage from "./Pages/PendingLogsPage";
import ReviewLogPage from "./Pages/ReviewLogPage";
import EvaluationPage from "./Pages/EvaluationPage";
import AdminDashboard from "./Pages/AdminDashboard";
import AcademicEvaluation from "./Pages/AcademicEvaluation";    
import StudentPlacement from "./Pages/Dashboards/StudentPlacementStatus";
import studentapplications from "./Pages/Dashboards/StudentApplications";
import ViewLogs from "./Pages/Dashboards/ViewLogs";
import SubmitLog from "./Pages/Dashboards/SubmitLog";
import Attendance from "./Pages/Dashboards/Attendance";
import studentlogsubmission from "./Pages/Dashboards/StudentLogSubmission";



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Student */}
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/student/placement-status" element={<StudentPlacement />} />
        <Route path="/student/view-logs" element={<ViewLogs />} />
        <Route path="/student/log-submission" element={<SubmitLog />} />
        <Route path="/student/applications" element={<Attendance />} />



         {/* Admin */}
        <Route path="/admin" element={<AdminDashboard />} />



        

        {/* Academic Supervisor*/}
        <Route path="/academic" element={<AcademicDashboard />} />
        <Route path="/pending-logs" element={<PendingLogs />} />
        <Route path="/academic/evaluate" element={<AcademicEvaluation/>} />

        {/* Workplace Supervisor */}
        <Route path="/workplace-supervisor" element={<WorkplaceSupervisorDashboard />} />
        <Route path="/workplace-supervisor" element={<WorkplaceSupervisorDashboard />} />
        <Route path="/supervisor" element={<AcademicDashboard />} />
        <Route path="/supervisor/dashboard" element={<WorkplaceSupervisorDashboard />} />
        <Route path="/supervisor/students" element={<StudentsPage />} />
        <Route path="/supervisor/pending-logs" element={<PendingLogsPage />} />
        <Route path="/supervisor/review/:id" element={<ReviewLogPage />} />
        <Route path="/supervisor/evaluations" element={<EvaluationPage />} />
        
        <Route path="/workplace-supervisor-dashboard" element={<WorkplaceSupervisorDashboard />} />

      </Routes>
    </Router>
  );
}

export default App;