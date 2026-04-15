import { useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "./Auth.css";

function Login() {
  const [data, setData] = useState({
    username: "",
    password: ""
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/token/",
        data
      );

      const token = res.data.access;

      
      localStorage.setItem("access", token);
      localStorage.setItem("refresh", res.data.refresh);

  
      const user = jwtDecode(token);

      console.log("USER DATA:", user);

      
      if (user.role === "student") {
        window.location.href = "/student";
      } 
      else if (user.role === "workplace") {
        window.location.href ="/workplace-supervisor";
      } 
      else if (user.role === "academic") {
        window.location.href = "/supervisor";
      } 
      else if (user.role === "admin") {
        window.location.href = "/admin";
      } 
      else {
        setError("Unknown user role");
      }

    } catch (err) {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Login</h2>

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

        <button type="submit">Login</button>

        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
}

export default Login;