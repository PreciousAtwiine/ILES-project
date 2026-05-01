import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import StudentDashboard from "./Pages/StudentDashboard";

import SupervisorDashboard from "./Pages/SupervisorDashboard";
import AcademicEvaluation from "./Pages/AcademicEvaluation";




import AcademicDashboard from "./Pages/AcademicDashboard";

import StudentsPage from "./Pages/StudentsPage";
import PendingLogsPage from "./Pages/PendingLogsPage";
import ReviewLogPage from "./Pages/ReviewLogPage";
import EvaluationPage from "./Pages/EvaluationPage";
import AdminDashboard from "./Pages/AdminDashboard";


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
  
        <Route path="/academic/evaluate" element={<AcademicEvaluation/>} />

        {/* Workplace Supervisor */}
         <Route path="/dashboard" element={<SupervisorDashboard />} />
        
        

      </Routes>
    </Router>
  );
}

export default App;