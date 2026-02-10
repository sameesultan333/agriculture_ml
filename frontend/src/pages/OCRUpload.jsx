import { useState } from "react";

export default function OCRUpload() {
  const [rows, setRows] = useState([]);

  const handleUpload = async (e) => {
    const formData = new FormData();
    formData.append("file", e.target.files[0]);

    const res = await fetch("http://127.0.0.1:8000/ocr/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setRows(data);
  };

  const updateRow = (i, key, value) => {
    const newRows = [...rows];
    newRows[i][key] = value;
    setRows(newRows);
  };

  const saveAll = async () => {
    for (const r of rows) {
      await fetch("http://127.0.0.1:8000/market/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: new Date().toISOString().slice(0, 10),
          ...r,
        }),
      });
    }

    alert("Saved to database ✅");
  };

  return (
    <div>
      <h1>📷 Upload Market Sheet</h1>

      <input type="file" onChange={handleUpload} />

      {rows.length > 0 && (
        <>
          <table>
            <thead>
              <tr>
                <th>Vegetable</th>
                <th>Min</th>
                <th>Max</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td>
                    <input
                      value={r.vegetable}
                      onChange={(e) =>
                        updateRow(i, "vegetable", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      value={r.min_price}
                      onChange={(e) =>
                        updateRow(i, "min_price", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      value={r.max_price}
                      onChange={(e) =>
                        updateRow(i, "max_price", e.target.value)
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button onClick={saveAll}>Confirm & Save</button>
        </>
      )}
    </div>
  );
}
