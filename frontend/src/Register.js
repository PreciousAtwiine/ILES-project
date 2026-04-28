import { useState, useEffect } from "react";
import axios from "axios";
import "./Auth.css";

function Register() {
  const [data, setData] = useState({
    username: "",
    email: "",
    password: "",
	confirm_password:"",
    first_name: "",
    last_name: "",
    role: "student",
    student_id: "",
    staff_id: "",
    department_fk: "",
    company: "",
    company_name: ""
  });

  const [departments, setDepartments] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [companySearch, setCompanySearch] = useState("");

  const BASE_URL = "http://127.0.0.1:8000";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deptRes, companyRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/departments/`),
          axios.get(`${BASE_URL}/api/companies/`),
        ]);
        setDepartments(deptRes.data);
        const approvedCompanies = companyRes.data.filter(c => c.is_approved === true);
        setCompanies(approvedCompanies);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, []);

  
  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(companySearch.toLowerCase())
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "company") {
      setData({ 
        ...data, 
        [name]: value,
        company_name: ""
      });
      setCompanySearch("");
    } 
    else if (name === "company_name") {
      setData({ 
        ...data, 
        [name]: value,
        company: ""
      });
      setCompanySearch("");
    } 
    else {
      setData({ ...data, [name]: value });
    }
    
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: null });
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setFieldErrors({});
  setLoading(true);

  if (data.password !== data.confirm_password) {
  setError("Passwords are not matching");
  setLoading(false);
  return;
}

const submitData = {
  username: data.username,
  email: data.email,
  password: data.password,
  confirm_password: data.confirm_password,
  first_name: data.first_name,
  last_name: data.last_name,
  role: data.role,
};

try {
  await axios.post(
    "http://127.0.0.1:8000/users/register/",
    submitData
  );
  setSuccess("Registration successful! Please wait for approval.");
  setLoading(false);
} catch (err) {
  setError("Registration failed. Please try again.");
  setLoading(false);
}
  if (data.role === "student") {
    submitData.student_id = data.student_id;
    submitData.department_fk = data.department_fk;
  } else if (data.role === "academic") {
    submitData.staff_id = data.staff_id;
    submitData.department_fk = data.department_fk;
  } else if (data.role === "workplace") {
    submitData.staff_id = data.staff_id;
    if (data.company) {
      submitData.company = parseInt(data.company);
    } else if (data.company_name) {
      submitData.company_name = data.company_name;
    }
  } else if (data.role === "admin") {
    submitData.staff_id = data.staff_id;
    submitData.department_fk = data.department_fk;
  }

  try {
    await axios.post(`${BASE_URL}/users/register/`, submitData);
    setSuccess("Registration successful! Please login.");
    setError("");

    setTimeout(() => {
      window.location.href = "/login";
    }, 2000);
  } catch (err) {
    if (err.response?.data) {
      const backendError = err.response.data;

      if (typeof backendError === "object") {
        setFieldErrors(backendError);

        const firstErrorField = Object.keys(backendError)[0];
        const firstError = backendError[firstErrorField];
        setError(Array.isArray(firstError) ? firstError[0] : firstError);
      } else {
        setError("Registration failed.");
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

          <div className="form-row">
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
          </div>

          <div className="form-group">
            <select name="role" onChange={handleChange} value={data.role}>
              <option value="student">Student</option>
              <option value="academic">Academic Supervisor</option>
              <option value="workplace">Workplace Supervisor</option>
              <option value="admin">Administrator</option>
            </select>
            {fieldErrors.role && <p className="field-error">{fieldErrors.role[0]}</p>}
          </div>

          
          {data.role === "student" && (
            <>
              <div className="form-group">
                <input
                  name="student_id"
                  placeholder="Student ID (e.g., 2500703582)"
                  onChange={handleChange}
                  required
                />
                {fieldErrors.student_id && <p className="field-error">{fieldErrors.student_id[0]}</p>}
              </div>
              <div className="form-group">
                <select
                  name="department_fk"
                  onChange={handleChange}
                  value={data.department_fk}
                  required
                >
                  <option value="">-- Select Department --</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} ({dept.code})
                    </option>
                  ))}
                </select>
                {fieldErrors.department_fk && <p className="field-error">{fieldErrors.department_fk[0]}</p>}
              </div>
            </>
          )}

          {/* Academic Supervisor Fields */}
          {data.role === "academic" && (
            <>
              <div className="form-group">
                <input
                  name="staff_id"
                  placeholder="Staff ID"
                  onChange={handleChange}
                  required
                />
                {fieldErrors.staff_id && <p className="field-error">{fieldErrors.staff_id[0]}</p>}
              </div>
              <div className="form-group">
                <select
                  name="department_fk"
                  onChange={handleChange}
                  value={data.department_fk}
                  required
                >
                  <option value="">-- Select Department --</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} ({dept.code})
                    </option>
                  ))}
                </select>
                {fieldErrors.department_fk && <p className="field-error">{fieldErrors.department_fk[0]}</p>}
              </div>
            </>
          )}

          
		{/* Workplace Supervisor Fields */}
		{data.role === "workplace" && (
		  <>
			<div className="form-group">
			  <input
				name="staff_id"
				placeholder="Staff ID (e.g., STAFF001)"
				onChange={handleChange}
				required
			  />
			  {fieldErrors.staff_id && <p className="field-error">{fieldErrors.staff_id[0]}</p>}
			</div>
			
			<div className="form-group">
			  <label>Company Name *</label>
			  <input
				type="text"
				name="company_search"
				placeholder="Start typing company name..."
				value={companySearch}
				onChange={(e) => setCompanySearch(e.target.value)}
				autoComplete="off"
				className="company-search-input"
			  />
			</div>

			{companySearch && filteredCompanies.length > 0 && (
			  <div className="company-suggestions">
				{filteredCompanies.slice(0, 8).map((company) => (
				  <div
					key={company.id}
					className="company-suggestion-item"
					onClick={() => {
					  setData({ ...data, company: company.id, company_name: "" });
					  setCompanySearch("");
					}}
				  >
					<span className="company-name">{company.name}</span>
					<span className="company-check">✓</span>
				  </div>
				))}
				{filteredCompanies.length > 8 && (
				  <div className="company-more">+ {filteredCompanies.length - 8} more companies...</div>
				)}
			  </div>
			)}

			{data.company && (
			  <div className="selected-company">
				<span>✓ Selected: {companies.find(c => c.id === parseInt(data.company))?.name}</span>
				<button 
				  type="button" 
				  className="clear-company"
				  onClick={() => setData({ ...data, company: "" })}
				>
				  ✕ Change
				</button>
			  </div>
			)}

			<div className="form-group">
			  <label>Or enter new company name:</label>
			  <input
				name="company_name"
				placeholder="New Company Name"
				onChange={handleChange}
				value={data.company_name}
				disabled={data.company}
			  />
			  <small className="hint-text">
				{data.company 
				  ? "You have selected an existing company. Clear selection to enter a new one." 
				  : "Leave blank if you selected a company above"}
			  </small>
			</div>
			
			{fieldErrors.company && <p className="field-error">{fieldErrors.company}</p>}
		  </>
		)}
          {/* Admin Fields */}
          {data.role === "admin" && (
            <>
              <div className="form-group">
                <input
                  name="staff_id"
                  placeholder="Staff ID"
                  onChange={handleChange}
                  required
                />
                {fieldErrors.staff_id && <p className="field-error">{fieldErrors.staff_id[0]}</p>}
              </div>
              <div className="form-group">
                <select
                  name="department_fk"
                  onChange={handleChange}
                  value={data.department_fk}
                  required
                >
                  <option value="">-- Select Department --</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} ({dept.code})
                    </option>
                  ))}
                </select>
                {fieldErrors.department_fk && <p className="field-error">{fieldErrors.department_fk[0]}</p>}
              </div>
            </>
          )}

          <div className="form-group">
            <input
              name="password"
              type="password"
              
              placeholder="Password (min 12 characters)"

              onChange={handleChange}
              required
            />
            {fieldErrors.password && <p className="field-error">{fieldErrors.password[0]}</p>}
          </div>
          
          <div className="form-group">
           <input
             name="confirm_password"
             type="password"
             placeholder="Confirm Password"
             onChange={handleChange}
             required
           />
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