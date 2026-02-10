import { useState } from "react";
import { createTrade } from "../api/tradeApi";
import { getPrediction } from "../api/tradeApi";
import "../styles/CreateTrade.css";

export default function CreateTrade() {
  const [form, setForm] = useState({
    vegetable: "",
    mumbai_price: "",
    quantity: "",
    arrival_date: "",
  });

  const [prediction, setPrediction] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔮 Ask AI
  const checkPrediction = async () => {
    if (!form.vegetable || !form.arrival_date) {
      return alert("Enter vegetable & date");
    }

    const data = await getPrediction(form.vegetable, form.arrival_date);

    if (data.error) {
      alert(data.error);
      return;
    }

    setPrediction(data.predicted_price);
  };

  // 💾 Save trade
  const submit = async () => {
    await createTrade({
      ...form,
      mumbai_price: Number(form.mumbai_price),
      quantity: Number(form.quantity),
    });

    alert("Trade Created ✅");
  };

  // 💰 Expected Profit
  const expectedProfit =
    prediction && form.quantity && form.mumbai_price
      ? (prediction - form.mumbai_price) * form.quantity
      : null;

  // 🚨 Recommendation
  function getAdvice() {
    if (expectedProfit === null) return "";

    if (expectedProfit < 0) return "🔴 LOSS – Avoid Trade";
    if (expectedProfit < 50000) return "🟡 Low Margin";
    return "🟢 Good Opportunity";
  }

  return (
    <div className="create-trade">
      <h1>➕ Create Trade</h1>

      <div className="form">
        <input
          name="vegetable"
          placeholder="Vegetable"
          onChange={handleChange}
        />

        <input
          name="mumbai_price"
          type="number"
          placeholder="Buy Price"
          onChange={handleChange}
        />

        <input
          name="quantity"
          type="number"
          placeholder="Quantity"
          onChange={handleChange}
        />

        <input
          name="arrival_date"
          placeholder="YYYY-MM-DD"
          onChange={handleChange}
        />

        <button onClick={checkPrediction} className="predict-btn">
          🔮 Predict
        </button>

        {prediction && (
          <div className="prediction-box">
            <h3>Predicted Market Price: ₹{prediction.toFixed(2)}</h3>

            {expectedProfit !== null && (
              <>
                <h3>Expected Profit: ₹{expectedProfit.toFixed(0)}</h3>
                <h2 className="advice">{getAdvice()}</h2>
              </>
            )}
          </div>
        )}

        <button onClick={submit} className="save-btn">
          Save Trade
        </button>
      </div>
    </div>
  );
}
