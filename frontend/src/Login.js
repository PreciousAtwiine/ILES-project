import { useState } from "react";
import axios from "axios";
import "./Login.css";
import notifications from "./utils/notifications"; 
import API_URL from './utils/api';

export default function Login() {
  const [data, setData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
        `${API_URL}/api/token/`,
        data
      );

      const token = res.data.access;
      localStorage.setItem("access", token);
      localStorage.setItem("refresh", res.data.refresh);

      const userRes = await axios.get(
        `${API_URL}/users/me/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const user = userRes.data.user;
      const role = user.role;
      
      localStorage.setItem("user_role", role);
      localStorage.setItem("user_id", user.id);
      localStorage.setItem("user_name", `${user.first_name || ""} ${user.last_name || ""}`);
      
      const needsApproval = role !== "student" && user.is_approved === false;
      localStorage.setItem("needs_approval", needsApproval);
      localStorage.setItem("is_approved", user.is_approved !== false);
      
      notifications.notifySuccess(`Welcome back, ${user.first_name || user.username}!`);

      if (role === "student") window.location.href = "/student";
      else if (role === "workplace") window.location.href = "/workplace-supervisor";
      else if (role === "academic") window.location.href = "/academic";
      else if (role === "admin") window.location.href = "/admin";
      else {
        notifications.notifyError("Unknown user role");
        setLoading(false);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        notifications.notifyError("Invalid username or password. Please check your credentials and try again.");
      } else if (err.code === "ERR_NETWORK") {
        notifications.notifyError("Cannot connect to server. Please check if the server is running.");
      } else {
        notifications.notifyError("Login failed. Please try again later.");
      }
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-left">
        <div className="overlay" />
        <div className="welcome-text">
          <h1>Internship Management System</h1>
          <p>
            Manage placements, logbooks, and evaluations efficiently in one platform.
          </p>
        </div>
      </div>

      <div className="login-right">
        <form className="login-card" onSubmit={handleSubmit}>
          <h2>Welcome </h2>
          <p className="subtitle">Please login to continue</p>

          <input
            name="username"
            placeholder="Username"
            value={data.username}
            onChange={handleChange}
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={data.password}
            onChange={handleChange}
          />

          <div className="login-options">
            <a href="/forgot-password">Forgot Password?</a>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="signup-text">
            Don't have an account?{" "}
            <a href="/register">Register here</a>
          </p>
        </form>
      </div>
    </div>
  );
}
