// ReviewLogPage.jsx
import axios from "axios";
import { useParams } from "react-router-dom";
import "./SupervisorDashboard.css";
export default function ReviewLogPage() {
  const { id } = useParams();

  const reviewLog = (status) => {
    axios.put(`http://127.0.0.1:8000/logs/${id}/review/`, { status })
      .then(() => alert(`Log ${status}`))
      .catch(err => console.log(err));
  };

  return (
    <div>
      <h2>Review Log</h2>
      <button onClick={() => reviewLog("approved")}>Approve</button>
      <button onClick={() => reviewLog("rejected")}>Reject</button>
    </div>
  );
}