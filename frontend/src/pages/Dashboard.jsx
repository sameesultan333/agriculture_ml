import { useEffect, useState } from "react";
import { getDashboard } from "../api/tradeApi";
import "../styles/dashboard.css";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const res = await getDashboard();
      setData(res);
    } catch (err) {
      console.error("Failed to load dashboard", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <h2 className="dashboard">Loading dashboard...</h2>;

  return (
    <div className="dashboard">
      <h1 className="dashboard-title">📊 Market Dashboard</h1>

      <div className="card-container">
        <Card title="Total Trades" value={data.total_trades} />
        <Card title="In Transit" value={data.in_transit} />
        <Card title="Arrived" value={data.arrived} />
        <Card
          title="Total Profit"
          value={`₹${data.total_profit}`}
          highlight
        />
      </div>
    </div>
  );
}

/* ---------------- CARD COMPONENT ---------------- */

function Card({ title, value, highlight = false }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <p className={`card-value ${highlight ? "highlight" : ""}`}>
        {value}
      </p>
    </div>
  );
}
