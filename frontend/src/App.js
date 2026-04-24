import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import StudentDashboard from "./Pages/StudentDashboard";
import WorkplaceSupervisorDashboard from "./Pages/WorkplaceSupervisorDashboard";
import AcademicDashboard from "./Pages/AcademicDashboard";
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

        {/* Workplace Supervisor */}
        <Route path="/workplace-supervisor" element={<WorkplaceSupervisorDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;