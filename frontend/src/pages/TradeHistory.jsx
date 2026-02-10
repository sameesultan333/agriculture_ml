import { useEffect, useState, useMemo } from "react";
import { getTrades, updateArrival } from "../api/tradeApi";
import "../styles/TradeHistory.css";

export default function TradeHistory() {
  const [trades, setTrades] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priceMap, setPriceMap] = useState({});

  useEffect(() => {
    load();

    const interval = setInterval(() => {
      load();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const load = async () => {
    const data = await getTrades();
    setTrades(data);
  };

  const handlePriceChange = (id, value) => {
    setPriceMap({ ...priceMap, [id]: value });
  };

  const handleArrivalUpdate = async (id) => {
    const price = priceMap[id];
    if (!price) return alert("Enter price");

    await updateArrival(id, price);
    setPriceMap({ ...priceMap, [id]: "" });
    load();
  };

  // 🎯 Risk engine
  function getRisk(profit) {
    if (profit === null || profit === undefined) return "TRANSIT";
    if (profit < 0) return "LOSS";
    if (profit < 50000) return "LOW";
    return "SAFE";
  }

  // 🔍 Filter
  const filteredTrades = useMemo(() => {
    return trades.filter((t) => {
      const matchesSearch =
        t.vegetable.toLowerCase().includes(search.toLowerCase()) ||
        String(t.id).includes(search);

      const matchesStatus =
        statusFilter === "ALL" ? true : t.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [trades, search, statusFilter]);

  return (
    <div className="trade-history">
      <h1>📋 Trade History</h1>

      {/* Controls */}
      <div className="controls">
        <input
          placeholder="Search vegetable or id..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All</option>
          <option value="IN_TRANSIT">In Transit</option>
          <option value="ARRIVED">Arrived</option>
        </select>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Vegetable</th>
              <th>Mumbai</th>
              <th>Qty</th>
              <th>Arrival</th>
              <th>Market Min</th>
              <th>Market Max</th>
              <th>Actual</th>
              <th>Profit</th>
              <th>Status</th>
              <th>Risk</th>
            </tr>
          </thead>

          <tbody>
            {filteredTrades.map((t) => (
              <tr key={t.id} className={t.profit < 0 ? "row-loss" : ""}>
                <td>{t.id}</td>

                <td className="veg">{t.vegetable}</td>

                <td>₹{t.mumbai_price}</td>

                <td>{t.quantity}</td>

                <td>{t.arrival_date}</td>

                {/* Market */}
                <td>{t.market_min ? `₹${t.market_min}` : "-"}</td>
                <td>{t.market_max ? `₹${t.market_max}` : "-"}</td>

                {/* Actual */}
                <td>
                  {t.status === "IN_TRANSIT" ? (
                    <div className="arrival-input">
                      <input
                        type="number"
                        placeholder="Price"
                        value={priceMap[t.id] || ""}
                        onChange={(e) =>
                          handlePriceChange(t.id, e.target.value)
                        }
                      />
                      <button onClick={() => handleArrivalUpdate(t.id)}>
                        Update
                      </button>
                    </div>
                  ) : (
                    `₹${t.actual_price}`
                  )}
                </td>

                {/* Profit */}
                <td
                  className={
                    t.profit > 0
                      ? "profit positive"
                      : t.profit < 0
                      ? "profit negative"
                      : "profit"
                  }
                >
                  {t.profit ? `₹${t.profit}` : "-"}
                </td>

                {/* Status */}
                <td>
                  <span
                    className={
                      t.status === "ARRIVED"
                        ? "status arrived"
                        : "status transit"
                    }
                  >
                    {t.status}
                  </span>
                </td>

                {/* Risk */}
                <td>
                  {getRisk(t.profit) === "LOSS" && "🔴 LOSS"}
                  {getRisk(t.profit) === "LOW" && "🟡 LOW"}
                  {getRisk(t.profit) === "SAFE" && "🟢 SAFE"}
                  {getRisk(t.profit) === "TRANSIT" && "🚚"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
