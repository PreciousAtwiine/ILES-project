
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

  // Get the selected company name
  const selectedCompany = approvedCompanies.find(c => c.id === parseInt(selectedCompanyId));
  const selectedCompanyName = selectedCompany ? selectedCompany.name : '';

  const filteredCompanies = approvedCompanies.filter((company) =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  
  const handleCompanySelect = (e) => {
    const companyId = e.target.value;
    onCompanyChange(e);
    
    // Update search input with selected company name
    if (companyId) {
      const company = approvedCompanies.find(c => c.id === parseInt(companyId));
      if (company) {
        setSearchTerm(company.name);
      }
    } else {
     
      setSearchTerm('');
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    // Create a fake event to clear the selected company
    const fakeEvent = { target: { value: '', name: 'company' } };
    onCompanyChange(fakeEvent);
  };

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
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                placeholder="Type to filter companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
                style={{ flex: 1 }}
              />
              {searchTerm && (
                <button 
                  type="button" 
                  onClick={handleClearSearch}
                  style={{
                    padding: '8px 16px',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Clear
                </button>
              )}
            </div>
            
            {selectedCompanyId && (
              <div className="selected-company" style={{
                marginTop: '10px',
                background: '#e8f5e9',
                padding: '8px 12px',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span>✓ Selected: {selectedCompanyName}</span>
                <button 
                  type="button" 
                  onClick={handleClearSearch}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#f44336',
                    cursor: 'pointer'
                  }}
                >
                  
                </button>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Select existing company (approved):</label>
            <select 
              value={selectedCompanyId || ''} 
              onChange={handleCompanySelect} 
              size="5"
            >
              <option value="">-- Select Company --</option>
              {filteredCompanies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
            {filteredCompanies.length === 0 && searchTerm && (
              <small className="hint-text">No companies found. You can add a new one below.</small>
            )}
          </div>

          <div className="form-group">
            <label>Or enter new company name:</label>
            <input
              type="text"
              placeholder="New Company Name"
              value={newCompanyName}
              onChange={onNewCompanyChange}
              disabled={selectedCompanyId}
            />
            <small className="hint-text">
              {selectedCompanyId 
                ? "You have selected an existing company. Click 'Change' to enter a new one." 
                : "New companies will need admin approval"}
            </small>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Start Date *</label>
              <input type="date" id="start_date" name="start_date" required />
            </div>
            <div className="form-group">
              <label>End Date *</label>
              <input type="date" id="end_date" name="end_date" required />
            </div>
          </div>
          
          <button type="submit" className="submit-btn">Submit Application</button>
        </form>
      </div>
    </div>
  );
}