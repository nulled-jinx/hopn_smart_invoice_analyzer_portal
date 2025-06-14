import React, { useState } from "react";
import axios from "axios";

export default function UploadForm() {
  const [file, setFile] = useState(null);
  const [manualEntry, setManualEntry] = useState(false);
  const [fields, setFields] = useState({
    vendor: "",
    date: "",
    amount: "",
    taxId: "",
    dueDate: "",
    status: "",
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5143/api";

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setManualEntry(false);
    setError("");
    setSuccessMsg("");
  };

  const handleFieldChange = (e) => {
    setFields({ ...fields, [e.target.name]: e.target.value });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploading(true);
    setError("");
    setSuccessMsg("");

    if (file && !manualEntry) {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await axios.post(
          `${BACKEND_URL}/invoices/upload`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        if (res.data.extracted) {
          setSuccessMsg("Invoice uploaded and extracted successfully!");
          setManualEntry(false);
          setFile(null);
        } else {
          setManualEntry(true);
          setSuccessMsg("AI extraction failed, please enter fields manually.");
        }
      } catch (err) {
        setError(
          "Upload failed: " + (err.response?.data?.message || err.message)
        );
      }
    } else if (manualEntry) {
      try {
        const res = await axios.post("/api/invoices/manual", fields);
        setSuccessMsg("Invoice saved successfully!");
        setFields({
          vendor: "",
          date: "",
          amount: "",
          taxId: "",
          dueDate: "",
          status: "",
        });
      } catch (err) {
        setError(
          "Save failed: " + (err.response?.data?.message || err.message)
        );
      }
    } else {
      setError("Please select a file to upload or fill manual fields.");
    }

    setUploading(false);
  };

  return (
    <div style={{ maxWidth: 600, margin: "auto" }}>
      <h2>Upload Invoice</h2>
      <form onSubmit={handleUpload}>
        {!manualEntry && (
          <div style={{ marginBottom: 10 }}>
            <label>
              Select Invoice (PDF/Image):
              <br />
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={handleFileChange}
              />
            </label>
          </div>
        )}

        {manualEntry && (
          <div className="manual-fields" style={{ marginBottom: 20 }}>
            <label>
              Vendor:
              <br />
              <input
                name="vendor"
                value={fields.vendor}
                onChange={handleFieldChange}
                required
                style={{ width: "100%", marginBottom: 10 }}
              />
            </label>
            <label>
              Date:
              <br />
              <input
                type="date"
                name="date"
                value={fields.date}
                onChange={handleFieldChange}
                required
                style={{ width: "100%", marginBottom: 10 }}
              />
            </label>
            <label>
              Amount:
              <br />
              <input
                type="number"
                step="0.01"
                name="amount"
                value={fields.amount}
                onChange={handleFieldChange}
                required
                style={{ width: "100%", marginBottom: 10 }}
              />
            </label>
            <label>
              Tax ID:
              <br />
              <input
                name="taxId"
                value={fields.taxId}
                onChange={handleFieldChange}
                style={{ width: "100%", marginBottom: 10 }}
              />
            </label>
            <label>
              Due Date:
              <br />
              <input
                type="date"
                name="dueDate"
                value={fields.dueDate}
                onChange={handleFieldChange}
                required
                style={{ width: "100%", marginBottom: 10 }}
              />
            </label>
            <label>
              Status:
              <br />
              <select
                name="status"
                value={fields.status}
                onChange={handleFieldChange}
                required
                style={{ width: "100%", marginBottom: 10 }}
              >
                <option value="">Select Status</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </label>
          </div>
        )}

        <button type="submit" disabled={uploading}>
          {uploading
            ? "Processing..."
            : manualEntry
            ? "Save Invoice"
            : "Upload"}
        </button>

        {error && <p style={{ color: "red", marginTop: 10 }}>{error}</p>}
        {successMsg && (
          <p style={{ color: "green", marginTop: 10 }}>{successMsg}</p>
        )}
      </form>
    </div>
  );
}
