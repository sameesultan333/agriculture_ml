import { useEffect, useState } from "react";
import { getVegetableAnalytics } from "../api/tradeApi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import "../styles/AnalyticsChart.css";

export default function AnalyticsChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    async function load() {
      const res = await getVegetableAnalytics();
      setData(res);
    }
    load();
  }, []);

  return (
    <div className="chart-page">
      <h1>📊 Profit by Vegetable</h1>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="vegetable" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total_profit" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
