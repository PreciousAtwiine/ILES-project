import { useEffect, useState } from "react";
import axios from "axios";

function StudentDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("access");

        const res = await axios.get(
          "http://127.0.0.1:8000/api/student/dashboard/",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setData(res.data);
      } catch (err) {
        setError("Failed to load dashboard");
        console.log(err);
      }
    };

    fetchDashboard();
  }, []);

  if (error) return <p>{error}</p>;
  if (!data) return <p>Loading dashboard...</p>;

  return (
    <div style={styles.container}>
      
      {/* HEADER */}
      <div style={styles.card}>
        <h2>🎓 Student Dashboard</h2>
        <h3>
          Welcome {data.first_name} {data.last_name}
        </h3>
        <p><b>Username:</b> {data.username}</p>
        <p><b>Student ID:</b> {data.student_id}</p>
        <p><b>Department:</b> {data.department}</p>
      </div>

      {/* PLACEMENT */}
      <div style={styles.card}>
        <h3>🏢 Internship Placement</h3>

        {data.placement ? (
          <>
            <p><b>Company:</b> {data.placement.company_name}</p>
            <p><b>Status:</b> {data.placement.status}</p>
            <p><b>Start:</b> {data.placement.start_date}</p>
            <p><b>End:</b> {data.placement.end_date}</p>
          </>
        ) : (
          <p>No placement yet</p>
        )}
      </div>

      {/* LOGS */}
      <div style={styles.card}>
        <h3>📘 Recent Weekly Logs</h3>

        {data.recent_logs?.length > 0 ? (
          data.recent_logs.map((log, index) => (
            <div key={index} style={styles.log}>
              <p><b>Week:</b> {log.week_number}</p>
              <p><b>Status:</b> {log.status}</p>
              <p><b>Activities:</b> {log.activities}</p>
              <p><b>Score:</b> {log.score ?? "Not graded"}</p>
            </div>
          ))
        ) : (
          <p>No logs yet</p>
        )}
      </div>

      {/* EVALUATION */}
      <div style={styles.card}>
        <h3>📊 Evaluation</h3>

        {data.evaluation ? (
          <>
            <p><b>Workplace Score:</b> {data.evaluation.workplace_score}</p>
            <p><b>Academic Score:</b> {data.evaluation.academic_score}</p>
            <p><b>Final Score:</b> {data.evaluation.final_score}</p>
            <p><b>Grade:</b> {data.evaluation.grade}</p>
          </>
        ) : (
          <p>No evaluation yet</p>
        )}
      </div>

    </div>
  );
}

const styles = {
  container: {
    padding: "20px",
    fontFamily: "Arial",
    background: "#f4f6f8",
    minHeight: "100vh"
  },
  card: {
    background: "white",
    padding: "15px",
    marginBottom: "15px",
    borderRadius: "10px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
  },
  log: {
    borderBottom: "1px solid #ddd",
    paddingBottom: "10px",
    marginBottom: "10px"
  }
};

export default StudentDashboard;