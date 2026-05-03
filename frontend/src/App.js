import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Pages/Dashboard";  // ← Fixed: ./Pages/Dashboard (capital P)

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
<<<<<<< HEAD
        <Route path="/admin" element={<AdminDashboard />} />
        {/* Student */}
        <Route path="/student" element={<StudentDashboard />} />

        {/* Academic Supervisor*/}
        <Route path="/academic" element={<AcademicDashboard />} />
  
        <Route path="/academic/evaluate" element={<AcademicEvaluation/>} />

        {/* Workplace Supervisor */}
         <Route path="/dashboard" element={<SupervisorDashboard />} />
        
        

=======
        <Route path="/dashboard" element={<Dashboard />} />
		
>>>>>>> joel-frontend
      </Routes>
    </Router>
  );
}

export default App;