import React, { useState } from 'react';

export default function StudentPlacement({ 
  studentId, 
  approvedCompanies, 
  selectedCompanyId, 
  newCompanyName,
  onCompanyChange,
  onNewCompanyChange,
  onSubmit 
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCompanies = approvedCompanies.filter((company) =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h1>Apply for Internship Placement</h1>
      <div className="form-card">
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label>Student ID</label>
            <input type="text" value={studentId} readOnly className="readonly-input" />
          </div>
          
          <div className="form-group">
            <label>Search company:</label>
            <input
              type="text"
              placeholder="Type to filter companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>