import { useScan } from "../context/ScanContext";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { session } = useScan();
  const navigate = useNavigate();

  if (!session) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <div
          style={{
            backgroundColor: "#1e293b",
            border: "1px solid #334155",
            borderRadius: "1rem",
            padding: "1.5rem",
            maxWidth: "500px",
            margin: "0 auto",
          }}
        >
          <h2
            style={{
              color: "#f1f5f9",
              fontSize: "1.25rem",
              fontWeight: "bold",
              marginBottom: "0.5rem",
            }}
          >
            No scan data yet
          </h2>
          <p
            style={{
              color: "#cbd5e1",
              fontSize: "0.875rem",
              marginBottom: "1rem",
            }}
          >
            Upload scanner results to see the risk dashboard.
          </p>
          <button
            onClick={() => navigate("/upload")}
            style={{
              backgroundColor: "#4f46e5",
              color: "white",
              padding: "0.625rem 1.25rem",
              borderRadius: "0.5rem",
              border: "none",
              fontSize: "0.875rem",
              fontWeight: "500",
              cursor: "pointer",
            }}
          >
            Upload Scan Results →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ color: "#f1f5f9" }}>
      <h1 style={{ fontSize: "1.875rem", fontWeight: "bold" }}>
        Risk Dashboard
      </h1>
      <p
        style={{ color: "#94a3b8", fontSize: "0.875rem", marginTop: "0.5rem" }}
      >
        Session: {session.session_id?.slice(0, 16)}…
      </p>
      <p style={{ color: "#cbd5e1", marginTop: "1rem" }}>
        Total Findings: {session.total_after_dedup}
      </p>
    </div>
  );
}
