// src/Pages/ExceptionRequests.jsx
import React from 'react';

export default function ExceptionRequests({ exceptionRequests, loadingExceptions, onApprove, onReject }) {
  if (loadingExceptions) {
    return <p>Loading requests...</p>;
  }

  if (!exceptionRequests || exceptionRequests.length === 0) {
    return (
      <div className="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6" />
          <path d="M12 16V2" />
          <path d="m8 6 4-4 4 4" />
        </svg>
        <p>No exception requests found</p>
      </div>
    );
  }

  const pendingRequests = exceptionRequests.filter(function(req) { return req.status === 'pending'; });
  const approvedRequests = exceptionRequests.filter(function(req) { return req.status === 'approved'; });
  const rejectedRequests = exceptionRequests.filter(function(req) { return req.status === 'rejected'; });

  return (
    <div>
      <div className="exceptions-header">
        <h1>Exception Requests</h1>
        <p className="subtitle">Review and manage student requests for missing weekly logs</p>
      </div>

      {pendingRequests.length > 0 && (
        <>
          <div className="exception-tabs">
            <button className="exception-tab active">
              Pending
              <span className="badge">{pendingRequests.length}</span>
            </button>
          </div>
          {pendingRequests.map(function(req) {
            return (
              <div key={req.id} className="exception-card pending">
                <div className="exception-card-header">
                  <div className="student-info">
                    <span className="student-name">{req.student_name}</span>
                    <span className="student-id">{req.student_id}</span>
                  </div>
                  <span className="request-date">
                    {new Date(req.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="exception-card-body">
                  <div className="info-row">
                    <span className="info-label">Placement</span>
                    <span className="info-value">{req.company_name}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Reason</span>
                    <div className="reason-text">{req.reason || req.exception_reason}</div>
                  </div>
                </div>
                <div className="exception-card-footer">
                  <button className="btn-approve" onClick={function() { onApprove(req.id); }}>
                    Approve
                  </button>
                  <button className="btn-reject" onClick={function() { onReject(req.id); }}>
                    Reject
                  </button>
                </div>
              </div>
            );
          })}
        </>
      )}

      {approvedRequests.length > 0 && (
        <>
          <div className="exception-tabs">
            <button className="exception-tab">
              Approved
              <span className="badge">{approvedRequests.length}</span>
            </button>
          </div>
          {approvedRequests.map(function(req) {
            return (
              <div key={req.id} className="exception-card approved">
                <div className="exception-card-header">
                  <div className="student-info">
                    <span className="student-name">{req.student_name}</span>
                    <span className="student-id">{req.student_id}</span>
                    <span className="status-badge-sm approved">✓ Approved</span>
                  </div>
                  <span className="request-date">
                    {new Date(req.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="exception-card-body">
                  <div className="info-row">
                    <span className="info-label">Reason</span>
                    <div className="reason-text">{req.reason || req.exception_reason}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </>
      )}

      {rejectedRequests.length > 0 && (
        <>
          <div className="exception-tabs">
            <button className="exception-tab">
              Rejected
              <span className="badge">{rejectedRequests.length}</span>
            </button>
          </div>
          {rejectedRequests.map(function(req) {
            return (
              <div key={req.id} className="exception-card rejected">
                <div className="exception-card-header">
                  <div className="student-info">
                    <span className="student-name">{req.student_name}</span>
                    <span className="student-id">{req.student_id}</span>
                    <span className="status-badge-sm rejected">✗ Rejected</span>
                  </div>
                  <span className="request-date">
                    {new Date(req.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="exception-card-body">
                  <div className="info-row">
                    <span className="info-label">Reason</span>
                    <div className="reason-text">{req.reason || req.exception_reason}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}