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
  const [error, setError] = useState("");

  // ===============================
  // Handle form change
  // ===============================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  // ===============================
  // Load rates
  // ===============================
  const loadRates = async () => {
    if (!form.date) {
      setError("Please select a date first");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API}/${form.date}`);
      if (!res.ok) throw new Error("Failed to load rates");
      const data = await res.json();
      setRates(data);
      setError("");
    } catch (err) {
      setError("Failed to load rates. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // Manual entry save
  // ===============================
  const submitManual = async () => {
    if (!form.date) {
      setError("Please select a date first");
      return;
    }
    if (!form.vegetable || !form.min_price || !form.max_price) {
      setError("Please fill vegetable, min and max price");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          min_price: Number(form.min_price),
          max_price: Number(form.max_price),
        }),
      });

      if (!response.ok) throw new Error("Failed to save");

      setError("");
      alert("Saved ✅");
      loadRates();
      
      // Clear form fields except date
      setForm({
        ...form,
        vegetable: "",
        packing: "",
        min_price: "",
        max_price: "",
      });
    } catch (err) {
      setError("Failed to save manual entry");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // Upload & parse
  // ===============================
  const uploadImage = async () => {
    if (!file) {
      setError("Please choose an image file first");
      return;
    }
    if (!form.date) {
      setError("Please select a date first");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch(OCR_API, {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`OCR failed: ${res.status} - ${errorText}`);
      }

      const data = await res.json();
      
      // Add date to each extracted item and ensure proper structure
      const withDate = data.map((r, index) => ({
        ...r,
        date: form.date,
        // Ensure we have sl_no, fallback to index + 1
        sl_no: r.sl_no || index + 1,
      }));

      setPreview(withDate);
      
      if (withDate.length === 0) {
        setError("No vegetables found in image. Please check image quality.");
      }
    } catch (err) {
      setError(`Upload failed: ${err.message}`);
      console.error("Upload error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // Save OCR data
  // ===============================
  const saveOCRData = async () => {
    if (!form.date) {
      setError("Please select a date first");
      return;
    }

    if (preview.length === 0) {
      setError("No data to save");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Save each item
      for (const r of preview) {
        if (!r.vegetable) continue;

        await fetch(`${API}/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: r.date,
            vegetable: r.vegetable,
            packing: r.packing || "N/A",
            min_price: Number(r.min_price),
            max_price: Number(r.max_price),
          }),
        });
      }

      alert(`Saved ${preview.length} items to DB ✅`);
      setPreview([]);
      loadRates();
    } catch (err) {
      setError("Failed to save data to database");
      console.error("Save OCR error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // UPDATE PREVIEW ROW
  // ===============================
  const updatePreviewRow = (index, field, value) => {
    const updatedPreview = [...preview];
    updatedPreview[index][field] = value;
    setPreview(updatedPreview);
  };

  // ===============================
  // ADD NEW ROW
  // ===============================
  const addRow = () => {
    const newRow = {
      sl_no: preview.length + 1,
      vegetable: "",
      packing: "",
      min_price: "",
      max_price: "",
      date: form.date,
    };
    setPreview([...preview, newRow]);
  };

  // ===============================
  // DELETE ROW
  // ===============================
  const deleteRow = (index) => {
    const updatedPreview = preview.filter((_, i) => i !== index);
    // Re-number serial numbers after deletion
    const renumberedPreview = updatedPreview.map((item, idx) => ({
      ...item,
      sl_no: idx + 1,
    }));
    setPreview(renumberedPreview);
  };

  return (
    <div className="market-page">
      <h1>📊 Market Rate Control Center</h1>

      {/* Error Display */}
      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      {/* ================= DATE ================= */}
      <div className="section">
        <label>Date *</label>
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          required
        />
      </div>

      {/* ================= MANUAL ================= */}
      <div className="section">
        <h3>✍ Manual Entry</h3>

        <div className="market-form">
          <input
            name="vegetable"
            placeholder="Vegetable *"
            value={form.vegetable}
            onChange={handleChange}
            required
          />
          <input
            name="packing"
            placeholder="Packing (e.g., 4 KG / BAG)"
            value={form.packing}
            onChange={handleChange}
          />
          <input
            name="min_price"
            placeholder="Min Price *"
            type="number"
            step="0.01"
            value={form.min_price}
            onChange={handleChange}
            required
          />
          <input
            name="max_price"
            placeholder="Max Price *"
            type="number"
            step="0.01"
            value={form.max_price}
            onChange={handleChange}
            required
          />

          <button 
            onClick={submitManual} 
            disabled={loading || !form.date || !form.vegetable}
          >
            {loading ? "Saving..." : "Save Manual"}
          </button>
        </div>
      </div>

      {/* ================= OCR ================= */}
      <div className="section">
        <h3>📷 Upload Market Sheet</h3>

        <div className="ocr-controls">
          <input
            type="file"
            accept="image/*,.jpg,.jpeg,.png"
            onChange={(e) => {
              setFile(e.target.files[0]);
              setError("");
            }}
            disabled={loading}
          />

          <button 
            onClick={uploadImage} 
            disabled={!file || !form.date || loading}
            className={loading ? "loading" : ""}
          >
            {loading ? "🔄 Processing..." : "Upload & Parse"}
          </button>
        </div>
        
        <small className="hint">
          Supported: JPG, PNG. Ensure text is clear and not rotated.
        </small>
      </div>

      {/* ================= PREVIEW ================= */}
      {preview.length > 0 && (
        <div className="section">
          <div className="preview-header">
            <h3>🧠 AI Extracted – Verify & Edit</h3>
            <p>Found {preview.length} items. Verify and edit if needed.</p>
            <button className="add-btn" onClick={addRow}>
              ➕ Add Missing Row
            </button>
          </div>

          <div className="table-container">
            <table className="market-table">
              <thead>
                <tr>
                  <th width="60">S.No</th>
                  <th>Vegetable</th>
                  <th>Packing</th>
                  <th width="100">Min (AED)</th>
                  <th width="100">Max (AED)</th>
                  <th width="80">Action</th>
                </tr>
              </thead>

              <tbody>
                {preview.map((r, i) => (
                  <tr key={i}>
                    <td className="serial-cell">
                      {r.sl_no || i + 1}
                    </td>
                    
                    <td>
                      <input
                        value={r.vegetable}
                        onChange={(e) => updatePreviewRow(i, "vegetable", e.target.value)}
                        placeholder="e.g., GINGER"
                      />
                    </td>

                    <td>
                      <input
                        value={r.packing}
                        onChange={(e) => updatePreviewRow(i, "packing", e.target.value)}
                        placeholder="e.g., 4 KG / BAG"
                      />
                    </td>

                    <td>
                      <input
                        type="number"
                        step="0.01"
                        value={r.min_price}
                        onChange={(e) => updatePreviewRow(i, "min_price", e.target.value)}
                        placeholder="0.00"
                        className="price-input"
                      />
                    </td>

                    <td>
                      <input
                        type="number"
                        step="0.01"
                        value={r.max_price}
                        onChange={(e) => updatePreviewRow(i, "max_price", e.target.value)}
                        placeholder="0.00"
                        className="price-input"
                      />
                    </td>

                    <td className="action-cell">
                      <button
                        className="delete-btn"
                        onClick={() => deleteRow(i)}
                        title="Delete row"
                      >
                        ❌
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="preview-footer">
            <button
              className="save-all"
              onClick={saveOCRData}
              disabled={loading || preview.length === 0}
            >
              {loading ? "🔄 Saving..." : `💾 Save All (${preview.length} items)`}
            </button>
            
            <button
              className="cancel-btn"
              onClick={() => setPreview([])}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ================= EXISTING RATES ================= */}
      <div className="section">
        <div className="section-header">
          <h3>📋 Stored Rates for {form.date || "selected date"}</h3>
          <button 
            className="load-btn" 
            onClick={loadRates}
            disabled={!form.date || loading}
          >
            {loading ? "Loading..." : "Load Rates"}
          </button>
        </div>

        {rates.length > 0 ? (
          <div className="table-container">
            <table className="market-table">
              <thead>
                <tr>
                  <th width="60">S.No</th>
                  <th>Vegetable</th>
                  <th>Packing</th>
                  <th width="100">Min (AED)</th>
                  <th width="100">Max (AED)</th>
                </tr>
              </thead>
              <tbody>
                {rates.map((r, index) => (
                  <tr key={r.id || r.vegetable}>
                    <td className="serial-cell">{index + 1}</td>
                    <td>{r.vegetable}</td>
                    <td>{r.packing}</td>
                    <td>AED {r.min_price}</td>
                    <td>AED {r.max_price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="count">Showing {rates.length} records</p>
          </div>
        ) : form.date ? (
          <p className="no-data">No rates found for this date. Add some above.</p>
        ) : (
          <p className="no-data">Select a date to view rates</p>
        )}
      </div>
    </div>
  );
}