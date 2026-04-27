import React from 'react';

export default function StudentLogs({ recentLogs, onSubmit }) {
  return (
    <div>
      <h1>Weekly Logs</h1>
      
      <div className="form-card">
        <h3>Submit Weekly Log</h3>
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label>Week Number *</label>
            <input type="number" id="week_number" placeholder="Week number" min="1" required />
          </div>