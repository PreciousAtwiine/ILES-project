import React, { useState } from 'react';
import './LoginPage.css';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true); 
  const [role, setRole] = useState('Student');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [email, setEmail] = useState('');
  const [id, setId] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    alert(`Logging in as ${role} with username: ${username}`);
   
  };

  const handleSignUp = (e) => {
    e.preventDefault();
    if (role === 'Student') {
      alert(`Student Sign Up:\nReg#: ${regNumber}\nEmail: ${email}\nUsername: ${username}`);
    } else {
      alert(`${role} Sign Up:\nID: ${id}\nUsername: ${username}`);
    }
    
  };

  return (
    <div className="login-container">
      {/* Left Side Branding */}
      <div className="branding-side">
        <div className="branding-content">
          <div className="icon">🎓</div>
          <h1>Internship Logging & Evaluation System</h1>
          <p>{isLogin ? 'Welcome! Please log in to continue.' : 'Sign up to create a new account.'}</p>
        </div>
      </div>

      {/* Right Side Form */}
      <div className="form-side">
        {isLogin ? (
          <form className="login-form" onSubmit={handleLogin}>
            <h2>Login</h2>

            <label>Role:</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="Student">Student</option>
              <option value="AcademicSupervisor"> Academic Supervisor</option>
              <option value="Admin">Admin</option>
              <option value="WorkplaceSupervisor">WorkplaceSupervisor</option>
            </select>

            <label>Username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

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
              <option value="Student">Student</option>
              <option value="Academic Supervisor"> Academic Supervisor</option>
              <option value="Admin">Admin</option>
              <option value="Workplace Supervisor">Workplace Supervisor</option>
            </select>

            {/* Dynamic Fields */}
            {role === 'Student' && (
              <>
                <label>Registration Number:</label>
                <input
                  type="text"
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value)}
                  required
                />

                <label>Email:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </>
            )}

            {(role === 'Admin' || role === 'Supervisor') && (
              <>
                <label>ID:</label>
                <input
                  type="text"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  required
                />
              </>
            )}

            {/* Common Fields */}
            <label>Username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

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