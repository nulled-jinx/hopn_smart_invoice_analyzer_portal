import { useState } from "react";
import axios from "axios";
import * as pdfjsLib from "pdfjs-dist";
import Tesseract from "tesseract.js";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

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
    invoiceType: "To Pay",
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [extracting, setExtracting] = useState(true);

  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5143/api";

  const extractFieldsFromText = (text) => {
    return {
      vendor:
        text
          .match(/Vendor[:\s]+([A-Za-z\s]+)/i)?.[1]
          ?.trim()
          .split(" ")[0] || "",
      date: text.match(/Date[:\s]+(\d{4}-\d{2}-\d{2})/)?.[1] || "",
      amount: text.match(/Amount[:\s]+\$?(\d+(\.\d{2})?)/)?.[1] || "",
      taxId: text.match(/Tax ID[:\s]+(\d+)/i)?.[1] || "",
      dueDate: text.match(/Due Date[:\s]+(\d{4}-\d{2}-\d{2})/)?.[1] || "",
      status: "pending",
      invoiceType: "To Pay",
    };
  };

  const parsePdf = async (pdfFile) => {
    setExtracting(true);
    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item) => item.str).join(" ") + "\n";
    }

    setExtracting(false);
    return text;
  };

  const parseImage = async (imgFile) => {
    setExtracting(true);
    const result = await Tesseract.recognize(imgFile, "eng");
    setExtracting(false);
    return result.data.text;
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setManualEntry(false);
    setError("");
    setSuccessMsg("");

    try {
      let text = "";

      if (selectedFile.type === "application/pdf") {
        text = await parsePdf(selectedFile);
      } else if (selectedFile.type.startsWith("image/")) {
        text = await parseImage(selectedFile);
      } else {
        throw new Error("Unsupported file type.");
      }

      const extracted = extractFieldsFromText(text);
      const isEmpty = Object.values(extracted).every((v) => !v);

      if (isEmpty) {
        throw new Error("No fields extracted.");
      }

      setFields(extracted);
      setManualEntry(true);
      setSuccessMsg("Text extracted. Please review and submit.");
    } catch (err) {
      setManualEntry(true);
      setError("Extraction failed. Please enter manually.");
    }
  };

  const handleFieldChange = (e) => {
    setFields({ ...fields, [e.target.name]: e.target.value });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploading(true);
    setError("");
    setSuccessMsg("");

    try {
      const payload = {
        ...fields,
        amount: parseFloat(fields.amount),
        anomalies: null,
      };

      await axios.post(`${BACKEND_URL}/invoices`, payload);

      setSuccessMsg("Invoice saved successfully!");
      setFields({
        vendor: "",
        date: "",
        amount: "",
        taxId: "",
        dueDate: "",
        status: "",
        invoiceType: "To Pay",
      });
      setFile(null);
      setManualEntry(false);
    } catch (err) {
      setError("Save failed: " + (err.response?.data?.message || err.message));
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
              Select Invoice (PDF or image):
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
            {["vendor", "date", "amount", "taxId", "dueDate"].map((field) => (
              <label key={field}>
                {field[0].toUpperCase() + field.slice(1)}:
                <br />
                <input
                  type={
                    field.includes("date")
                      ? "date"
                      : field === "amount"
                      ? "number"
                      : "text"
                  }
                  name={field}
                  value={fields[field]}
                  onChange={handleFieldChange}
                  required
                  style={{ width: "100%", marginBottom: 10 }}
                />
              </label>
            ))}
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

        <button type="submit" disabled={uploading || extracting}>
          {uploading
            ? "Processing..."
            : manualEntry
            ? "Save Invoice"
            : "Extract and Review"}
        </button>

        {error && <p style={{ color: "red", marginTop: 10 }}>{error}</p>}
        {successMsg && (
          <p style={{ color: "green", marginTop: 10 }}>{successMsg}</p>
        )}
      </form>
    </div>
  );
}
