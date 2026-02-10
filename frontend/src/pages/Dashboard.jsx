import { useEffect, useState } from "react";
import { getDashboard } from "../api/tradeApi";

const ML_API = "http://127.0.0.1:8000/ml/predict";

import "../styles/dashboard.css";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [ml, setML] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const res = await getDashboard();
      setData(res);

      // ⭐ Demo prediction → later dynamic
      const p = await fetch(
        `${ML_API}?vegetable=GINGER&arrival_date=2026-02-12&mumbai_price=10&qty=1000`
      );
      const mlData = await p.json();
      setML(mlData);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <h2 className="dashboard">Loading...</h2>;

  return (
    <div className="dashboard">
      <h1 className="dashboard-title">📊 AI Trading Dashboard</h1>

      {/* OLD CARDS */}
      <div className="card-container">
        <Card title="Total Trades" value={data.total_trades} />
        <Card title="In Transit" value={data.in_transit} />
        <Card title="Arrived" value={data.arrived} />
        <Card title="Total Profit" value={`₹${data.total_profit}`} highlight />
      </div>

      {/* NEW AI PANEL */}
      {ml && (
        <div className="ai-panel">
          <h2>🤖 Market Intelligence</h2>

          <div className="ai-grid">
            <AIItem label="Predicted Price" value={`₹${ml.predicted_price}`} />
            <AIItem label="Trend" value={ml.trend} />
            <AIItem label="Decision" value={ml.decision} />
            <AIItem label="Risk Band" value={`₹${ml.low} - ₹${ml.high}`} />
            <AIItem label="Expected Profit" value={`₹${ml.expected_profit}`} />
            <AIItem
              label="Anomaly"
              value={ml.anomaly ? "⚠ Unusual" : "Normal"}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- small components ---------- */

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

function AIItem({ label, value }) {
  return (
    <div className="ai-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}