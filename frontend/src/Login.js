import { useState } from "react";
import axios from "axios";
import "./Login.css";

export default function Login() {
  const [data, setData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      //  Correct login endpoint
      const res = await axios.post(
        "http://127.0.0.1:8000/api/token/",
        data
      );

      const token = res.data.access;
      localStorage.setItem("access", token);
      localStorage.setItem("refresh", res.data.refresh);

      //added: Get user info for me
      const userRes = await axios.get(
        "http://127.0.0.1:8000/users/me/",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      //add: role is inside 'user' object
      const role = userRes.data.user.role;

      if (role === "student") window.location.href = "/student";
      else if (role === "workplace") window.location.href = "/workplace-supervisor";
      else if (role === "academic") window.location.href = "/supervisor";
      else if (role === "admin") window.location.href = "/admin";
      else setError("Unknown role");
    } catch (err) {
      setError("Invalid username or password");
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
          <h2>Welcome Back</h2>
          <p className="subtitle">Please login to continue</p>

          <input
            name="username"
            placeholder="Username"
            onChange={handleChange}
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
          />

          <div className="login-options">
            <a href="/forgot-password">Forgot Password?</a>
          </div>

          <button type="submit">Login</button>

          <p className="signup-text">
            Don't have an account?{" "}
            <a href="/register">Register here</a>
          </p>

          {error && <p className="error">{error}</p>}
        </form>
      </div>
    </div>
  );
}