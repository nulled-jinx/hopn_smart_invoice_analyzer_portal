import { useEffect, useState } from "react";
import axios from "../utils/axiosConfig";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalInvoices: 0,
    anomalies: 0,
    toPay: 0,
    toCollect: 0,
  });
  const [loading, setLoading] = useState(true);
  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5143/api";

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await axios.get(`${BACKEND_URL}/invoices/summary`);
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div>
      <h2>Dashboard</h2>
      <div
        style={{
          display: "flex",
          gap: 20,
          flexWrap: "wrap",
          justifyContent: "space-around",
        }}
      >
        <div
          style={{
            border: "1px solid #ccc",
            borderRadius: 8,
            padding: 20,
            flex: "1 1 200px",
            textAlign: "center",
          }}
        >
          <h3>Total Invoices</h3>
          <p style={{ fontSize: 24, fontWeight: "bold" }}>
            {stats.totalInvoices}
          </p>
        </div>

        <div
          style={{
            border: "1px solid #ccc",
            borderRadius: 8,
            padding: 20,
            flex: "1 1 200px",
            textAlign: "center",
            color: stats.anomalies > 0 ? "red" : "black",
          }}
        >
          <h3>Anomalies</h3>
          <p style={{ fontSize: 24, fontWeight: "bold" }}>{stats.anomalies}</p>
        </div>

        <div
          style={{
            border: "1px solid #ccc",
            borderRadius: 8,
            padding: 20,
            flex: "1 1 200px",
            textAlign: "center",
          }}
        >
          <h3>To Pay</h3>
          <p style={{ fontSize: 24, fontWeight: "bold" }}>{stats.toPay}</p>
        </div>

        <div
          style={{
            border: "1px solid #ccc",
            borderRadius: 8,
            padding: 20,
            flex: "1 1 200px",
            textAlign: "center",
          }}
        >
          <h3>To Collect</h3>
          <p style={{ fontSize: 24, fontWeight: "bold" }}>{stats.toCollect}</p>
        </div>
      </div>
    </div>
  );
}
