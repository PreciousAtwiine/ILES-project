import React, { useState } from 'react';
import './LoginPage.css';

import { loginUser, registerUser } from '../api/auth';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  // Common fields
  const [role, setRole] = useState('student');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('');

  // Role-based fields
  const [studentId, setStudentId] = useState('');
  const [staffId, setStaffId] = useState('');

  // 🔐 LOGIN + ROLE REDIRECT
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await loginUser({
        username,
        password,
        role,
      });

      const token = res.data.token;
      const userRole = res.data.role;

      localStorage.setItem('token', token);
      localStorage.setItem('role', userRole);

      alert('Login successful ✔');

      // 🔥 ROLE-BASED REDIRECT
      if (userRole === 'student') {
        window.location.href = '/student/dashboard';
      } 
      else if (userRole === 'academic') {
        window.location.href = '/academic/dashboard';
      } 
      else if (userRole === 'workplace') {
        window.location.href = '/workplace/dashboard';
      } 
      else if (userRole === 'admin') {
        window.location.href = '/admin/dashboard';
      }

    } catch (error) {
      alert('Login failed ❌');
    }
  };

  // 🔐 REGISTER
  const handleSignUp = async (e) => {
    e.preventDefault();

    const payload = {
      role,
      firstName,
      lastName,
      username,
      email,
      password,
      department,
      student_id: role === 'student' ? studentId : null,
      staff_id: role !== 'student' ? staffId : null,
    };

    try {
      await registerUser(payload);

      alert('Account created successfully ✔');
      setIsLogin(true);

    } catch (error) {
      alert('Signup failed ❌');
    }
  };

  return (
    <div className="login-container">

      {/* Left Side */}
      <div className="branding-side">
        <div className="branding-content">
          <div className="icon">🎓</div>
          <h1>Internship Logging & Evaluation System</h1>
          <p>
            {isLogin
              ? 'Welcome! Please log in to continue.'
              : 'Sign up to create a new account.'}
          </p>
        </div>
      </div>

      {/* Right Side */}
      <div className="form-side">

        {isLogin ? (
          <form className="login-form" onSubmit={handleLogin}>
            <h2>Login</h2>

            <label>Role:</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="student">Student</option>
              <option value="workplace">Workplace Supervisor</option>
              <option value="academic">Academic Supervisor</option>
              <option value="admin">Administrator</option>
            </select>

            <label>Username:</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} required />

            <label>Password:</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

            <button type="submit">Login</button>

            <p className="switch-form">
              Don't have an account?{' '}
              <span onClick={() => setIsLogin(false)} className="switch-link">
                Sign Up
              </span>
            </p>
          </form>

        ) : (

          <form className="login-form" onSubmit={handleSignUp}>
            <h2>Sign Up</h2>

            <label>Role:</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="student">Student</option>
              <option value="workplace">Workplace Supervisor</option>
              <option value="academic">Academic Supervisor</option>
              <option value="admin">Administrator</option>
            </select>

            <label>First Name:</label>
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />

            <label>Last Name:</label>
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} required />

            <label>Username:</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} required />

            <label>Email:</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

            <label>Password:</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

            <label>Department:</label>
            <input value={department} onChange={(e) => setDepartment(e.target.value)} required />

            {/* Role-based fields */}
            {role === 'student' && (
              <>
                <label>Student ID:</label>
                <input value={studentId} onChange={(e) => setStudentId(e.target.value)} required />
              </>
            )}

            {(role === 'academic' || role === 'workplace' || role === 'admin') && (
              <>
                <label>Staff ID:</label>
                <input value={staffId} onChange={(e) => setStaffId(e.target.value)} required />
              </>
            )}

            <button type="submit">Sign Up</button>

            <p className="switch-form">
              Already have an account?{' '}
              <span onClick={() => setIsLogin(true)} className="switch-link">
                Login
              </span>
            </p>
          </form>

        )}
      </div>
    </div>
  );
};

export default LoginPage;