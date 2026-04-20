import { useState } from "react";
import axios from "axios";
import "./Auth.css";

function Register() {
  const [data, setData] = useState({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    role: "student",
    student_id: "",
    staff_id: "",
    department: ""
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
    // Clear field error when user starts typing
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setLoading(true);

    try {
      await axios.post(
        "http://127.0.0.1:8000/users/register/",
        data
      );

      setSuccess("Registration successful! Please login.");
      setError("");

      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);

    } catch (err) {
      if (err.response?.data) {
        const backendError = err.response.data;
        
        // Handle different error formats
        if (typeof backendError === 'object') {
          // Check if it's field-specific errors
          if (backendError.student_id || backendError.staff_id || 
              backendError.username || backendError.email || 
              backendError.password || backendError.role) {
            setFieldErrors(backendError);
            
            // Display first error as general message
            const firstErrorField = Object.keys(backendError)[0];
            const firstError = backendError[firstErrorField];
            setError(Array.isArray(firstError) ? firstError[0] : firstError);
          } 
          else if (backendError.detail) {
            setError(backendError.detail);
          }
          else {
            // Show all errors combined
            const allErrors = Object.values(backendError).flat();
            setError(allErrors.join(', '));
          }
        } else if (typeof backendError === 'string') {
          setError(backendError);
        } else {
          setError("Registration failed. Please check your inputs.");
        }
      } else {
        setError("Network error. Please make sure the server is running.");
      }
      setSuccess("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container split">
      <div className="auth-left">
        <h1>Welcome to ILES</h1>
        <p>Internship & Logging Evaluation System</p>
        <p>Please register to continue</p>
      </div>

      <div className="auth-right">
        <form className="auth-card" onSubmit={handleSubmit}>
          <h2>Register</h2>

          <div className="form-group">
            <input 
              name="username" 
              placeholder="Username" 
              onChange={handleChange} 
              required 
            />
            {fieldErrors.username && <p className="field-error">{fieldErrors.username[0]}</p>}
          </div>

          <div className="form-group">
            <input 
              name="email" 
              placeholder="Email" 
              type="email" 
              onChange={handleChange} 
              required 
            />
            {fieldErrors.email && <p className="field-error">{fieldErrors.email[0]}</p>}
          </div>

          <div className="form-group">
            <input 
              name="first_name" 
              placeholder="First Name" 
              onChange={handleChange} 
            />
          </div>

          <div className="form-group">
            <input 
              name="last_name" 
              placeholder="Last Name" 
              onChange={handleChange} 
            />
          </div>

          <div className="form-group">
            <select name="role" onChange={handleChange} value={data.role}>
              <option value="student">Student</option>
              <option value="workplace">Workplace Supervisor</option>
              <option value="academic">Academic Supervisor</option>
            </select>
            {fieldErrors.role && <p className="field-error">{fieldErrors.role[0]}</p>}
          </div>

          {data.role === "student" && (
            <div className="form-group">
              <input
                name="student_id"
                placeholder="Student ID"
                onChange={handleChange}
                required
              />
              {fieldErrors.student_id && <p className="field-error">{fieldErrors.student_id[0]}</p>}
            </div>
          )}

          {data.role !== "student" && (
            <div className="form-group">
              <input
                name="staff_id"
                placeholder="Staff ID"
                onChange={handleChange}
                required
              />
              {fieldErrors.staff_id && <p className="field-error">{fieldErrors.staff_id[0]}</p>}
            </div>
          )}

          <div className="form-group">
            <input 
              name="department" 
              placeholder="Department" 
              onChange={handleChange} 
            />
          </div>

          <div className="form-group">
            <input
              name="password"
              type="password"
              placeholder="Password (min 8 characters)"
              onChange={handleChange}
              required
            />
            {fieldErrors.password && <p className="field-error">{fieldErrors.password[0]}</p>}
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>

          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}
        </form>
      </div>
    </div>
  );
}

export default Register;
