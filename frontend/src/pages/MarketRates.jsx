import { useState } from "react";
import "../styles/MarketRates.css";

const API = "http://127.0.0.1:8000/market";
const OCR_API = "http://127.0.0.1:8000/ocr/upload";

export default function MarketRates() {
  const [form, setForm] = useState({
    date: "",
    vegetable: "",
    packing: "",
    min_price: "",
    max_price: "",
  });

  const [rates, setRates] = useState([]);
  const [preview, setPreview] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // ===============================
  // Handle form change
  // ===============================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ===============================
  // Load rates
  // ===============================
  const loadRates = async () => {
    if (!form.date) return alert("Select date");

    const res = await fetch(`${API}/${form.date}`);
    const data = await res.json();
    setRates(data);
  };

  // ===============================
  // Manual entry save
  // ===============================
  const submitManual = async () => {
    if (!form.date) return alert("Select date");

    await fetch(`${API}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        min_price: Number(form.min_price),
        max_price: Number(form.max_price),
      }),
    });

    alert("Saved ✅");
    loadRates();
  };

  // ===============================
  // Upload & parse
  // ===============================
  const uploadImage = async () => {
    if (!file) return alert("Choose file");
    if (!form.date) return alert("Select date first");

    const fd = new FormData();
    fd.append("file", file);

    try {
      setLoading(true);

      const res = await fetch(OCR_API, {
        method: "POST",
        body: fd,
      });

      const data = await res.json();

      const withDate = data.map((r) => ({
        ...r,
        date: form.date,
      }));

      setPreview(withDate);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // Save OCR data
  // ===============================
  const saveOCRData = async () => {
    setLoading(true);

    for (const r of preview) {
      await fetch(`${API}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...r,
          min_price: Number(r.min_price),
          max_price: Number(r.max_price),
        }),
      });
    }

    alert("Saved to DB ✅");
    setPreview([]);
    setLoading(false);
    loadRates();
  };

  return (
    <div className="market-page">
      <h1>📊 Market Rate Control Center</h1>

      {/* ================= DATE ================= */}
      <div className="section">
        <label>Date</label>
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
        />
      </div>

      {/* ================= MANUAL ================= */}
      <div className="section">
        <h3>✍ Manual Entry</h3>

        <div className="market-form">
          <input
            name="vegetable"
            placeholder="Vegetable"
            onChange={handleChange}
          />
          <input
            name="packing"
            placeholder="Packing"
            onChange={handleChange}
          />
          <input
            name="min_price"
            placeholder="Min"
            onChange={handleChange}
          />
          <input
            name="max_price"
            placeholder="Max"
            onChange={handleChange}
          />

          <button onClick={submitManual}>Save Manual</button>
        </div>
      </div>

      {/* ================= OCR ================= */}
      <div className="section">
        <h3>📷 Upload Market Sheet</h3>

        <div className="ocr-controls">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
          />

          <button onClick={uploadImage} disabled={!file || loading}>
            {loading ? "Processing..." : "Upload & Parse"}
          </button>
        </div>
      </div>

      {/* ================= PREVIEW ================= */}
      {preview.length > 0 && (
        <div className="section">
          <h3>🧠 AI Extracted – Verify</h3>

          <table className="market-table">
            <thead>
              <tr>
                <th>Vegetable</th>
                <th>Packing</th>
                <th>Min</th>
                <th>Max</th>
              </tr>
            </thead>
            <tbody>
              {preview.map((r, i) => (
                <tr key={i}>
                  <td>{r.vegetable}</td>
                  <td>{r.packing}</td>
                  <td>{r.min_price}</td>
                  <td>{r.max_price}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <button className="save-all" onClick={saveOCRData}>
            Save All
          </button>
        </div>
      )}

      {/* ================= EXISTING ================= */}
      <div className="section">
        <h3>📋 Stored Rates</h3>

        <button className="load-btn" onClick={loadRates}>
          Load
        </button>

        <table className="market-table">
          <thead>
            <tr>
              <th>Vegetable</th>
              <th>Packing</th>
              <th>Min</th>
              <th>Max</th>
            </tr>
          </thead>
          <tbody>
            {rates.map((r) => (
              <tr key={r.id}>
                <td>{r.vegetable}</td>
                <td>{r.packing}</td>
                <td>₹{r.min_price}</td>
                <td>₹{r.max_price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
