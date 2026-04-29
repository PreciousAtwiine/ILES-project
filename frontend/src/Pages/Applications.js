// src/Pages/Applications.jsx
import React from 'react';

export default function Applications({ pendingApplications, onAssign }) {
  if (!pendingApplications || pendingApplications.length === 0) {
    return <p>No pending placement applications.</p>;
  }

  return (
    <div>
      <h1>Pending Applications</h1>
      <table className="data-table">
        <thead>
          <tr>
            <th>Student</th>
            <th>Company</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {pendingApplications.map((app) => (
            <tr key={app.id}>
              <td>{app.student_name}</td>
              <td>{app.company_name}</td>
              <td>{app.start_date}</td>
              <td>{app.end_date}</td>
              <td>
                <button className="assign-btn" onClick={() => onAssign(app)}>
                  Assign Supervisor
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}