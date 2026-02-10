import { useEffect, useState } from "react";
import { getVegetableAnalytics } from "../api/tradeApi";
import "../styles/Analytics.css";

export default function Analytics() {
  const [data, setData] = useState([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const res = await getVegetableAnalytics();
    setData(res);
  }

  return (
    <div className="analytics">
      <h1>📈 Vegetable Analytics</h1>

      <table>
        <thead>
          <tr>
            <th>Vegetable</th>
            <th>Total Trades</th>
            <th>Total Profit</th>
          </tr>
        </thead>

        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>{item.vegetable}</td>
              <td>{item.total_trades}</td>
              <td>₹ {item.total_profit}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
