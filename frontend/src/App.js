import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Pages/Dashboard";  
import AdminDashboard from './Pages/AdminDashboard';
import StudentDashboard from './Pages/StudentDashboard'; 
import AcademicDashboard from './Pages/AcademicDashboard';


import AcademicEvaluation from './Pages/AcademicEvaluation';
import SupervisorDashboard from './Pages/SupervisorDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/admin" element={<AdminDashboard />} />
        {/* Student */}
        <Route path="/student" element={<StudentDashboard />} />

        {/* Academic Supervisor*/}
        <Route path="/academic" element={<AcademicDashboard />} />
  
        <Route path="/academic/evaluate" element={<AcademicEvaluation/>} />

        {/* Workplace Supervisor */}
         <Route path="/workplace-supervisor" element={<SupervisorDashboard />} />
        


        <Route path="/dashboard" element={<Dashboard />} />

      </Routes>
    </Router>
  );
}

export default App;