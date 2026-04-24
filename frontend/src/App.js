import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import StudentDashboard from "./Pages/Dashboard";
import WorkplaceSupervisorDashboard from "./Pages/WorkplaceSupervisorDashboard";





import AcademicDashboard from "./Pages/AcademicDashboard";
import AcademicEvaluation from "./Pages/AcademicEvaluation";
import PendingLogs from "./Pages/PendingLogs";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Student */}
        <Route path="/student" element={<StudentDashboard />} />

        {/* Academic Supervisor*/}
        <Route path="/academic" element={<AcademicDashboard />} />
        <Route path="/pending-logs" element={<PendingLogs />} />
        <Route path="/academic/evaluate" element={<AcademicEvaluation/>} />

        {/* Workplace Supervisor */}
        <Route path="/workplace-supervisor" element={<WorkplaceSupervisorDashboard />} />
        <Route path="/workplace-supervisor" element={<WorkplaceSupervisorDashboard />} />
        <Route path="/supervisor" element={<AcademicDashboard />} />
        <Route path="/pending-logs" element={<PendingLogs />} />
        <Route path="/workplace-supervisor-dashboard" element={<WorkplaceSupervisorDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;