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

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        "http://127.0.0.1:8000/api/register/",
        data
      );

      setSuccess("Registration successful! Please login.");
      setError("");

      // OPTIONAL redirect after 2 seconds
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);

    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Registration failed. Check your inputs."
      );
      setSuccess("");
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Register</h2>

        <input name="username" placeholder="Username" onChange={handleChange} />
        <input name="email" placeholder="Email" onChange={handleChange} />
        <input name="first_name" placeholder="First Name" onChange={handleChange} />
        <input name="last_name" placeholder="Last Name" onChange={handleChange} />

        <select name="role" onChange={handleChange}>
          <option value="student">Student</option>
          <option value="workplace">Workplace Supervisor</option>
          <option value="academic">Academic Supervisor</option>
        </select>

        {/* STUDENT ID */}
        {data.role === "student" && (
          <input
            name="student_id"
            placeholder="Student ID"
            onChange={handleChange}
          />
        )}

        {/* STAFF ID */}
        {data.role !== "student" && (
          <input
            name="staff_id"
            placeholder="Staff ID"
            onChange={handleChange}
          />
        )}

        <input name="department" placeholder="Department" onChange={handleChange} />

        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
        />

        <button type="submit">Register</button>

        {error && <p className="error">{error}</p>}
        {success && <p style={{ color: "green" }}>{success}</p>}
      </form>
    </div>
  );
}

export default Register;