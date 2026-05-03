// ExceptionRequestModal.jsx
import { useState } from "react";
import axios from "axios";
import "./ExceptionRequestModal.css";

export default function ExceptionRequestModal({ onClose, onComplete }) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const BASE_URL = "http://127.0.0.1:8000";
  const getToken = () => localStorage.getItem("access");

  const handleReasonChange = (e) => {
    const value = e.target.value;
    if (value.length <= 500) {
      setReason(value);
      setCharCount(value.length);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const trimmedReason = reason.trim();
    
    if (trimmedReason.length === 0) {
      alert("Please enter an explanation for missing weekly logs.");
      return;
    }
    
    if (trimmedReason.length < 10) {
      alert(`Explanation too short (${trimmedReason.length} chars). Minimum 10 characters required.`);
      return;
    }
    
    setLoading(true);
    
    try {
      const token = getToken();
      const response = await axios.post(
        `${BASE_URL}/api/student/request-exception/`,
        { reason: trimmedReason },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      
      if (response.status === 200) {
        alert("Exception request submitted! Admin will review your case.");
        onComplete();
        onClose();
      }
    } catch (error) {
      console.error("Error submitting exception request:", error);
      if (error.response?.data?.error) {
        alert(error.response.data.error);
      } else {
        alert("Failed to submit request. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>📢 Request Exception for Missing Logs</h2>
        <p className="modal-description">
          Please explain why you missed some weekly logs. The admin team will review your request.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Explanation <span className="required">*</span></label>
            <textarea
              rows="5"
              placeholder="e.g., technical issues with the logging system, personal emergency, or overlapping deadlines..."
              value={reason}
              onChange={handleReasonChange}
              required
            />
            <div className="char-counter">
              <span className={charCount >= 10 ? "valid" : charCount > 0 ? "invalid" : ""}>
                {charCount}
              </span> / 500 characters
              {charCount > 0 && charCount < 10 && (
                <span className="warning-text"> (minimum 10 required)</span>
              )}
              {charCount >= 10 && (
                <span className="valid-text"> ✓ valid</span>
              )}
            </div>
          </div>

          <div className="info-note">
            <span>ℹ️ Missing logs affect compliance. Provide a genuine explanation to proceed.</span>
          </div>

          <div className="modal-buttons">
            <button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Request"}
            </button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}