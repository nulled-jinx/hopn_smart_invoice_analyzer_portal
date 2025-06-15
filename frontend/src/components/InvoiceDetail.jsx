import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useRef } from "react";

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const pdfRef = useRef();
  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5143/api";

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const exportToPDF = () => {
    const pdf = new jsPDF();
    let y = 20;

    pdf.setFontSize(18);
    pdf.text("Invoice Summary", 14, y);
    y += 10;

    pdf.setFontSize(12);
    Object.entries(details).forEach(([label, value]) => {
      pdf.text(`${label}:`, 14, y);
      pdf.text(`${value}`, 80, y);
      y += 8;
    });

    y += 6;
    pdf.setFontSize(14);
    pdf.text("Anomalies", 14, y);
    y += 8;
    pdf.setFontSize(12);
    if (anomalies) {
      anomalies.split("; ").forEach((a) => {
        pdf.text(`• ${a}`, 18, y);
        y += 6;
      });
    } else {
      pdf.text("None", 18, y);
      y += 6;
    }

    y += 10;
    pdf.setFontSize(14);
    pdf.text("AI Output", 14, y);
    y += 8;
    pdf.setFontSize(11);
    const outputText = aiOutput || "No output.";
    const lines = pdf.splitTextToSize(outputText, 180);
    pdf.text(lines, 14, y);

    pdf.save(`invoice-${id}.pdf`);
  };

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/invoices/${id}`);
      setInvoice(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to load invoice");
      setLoading(false);
    }
  };

  if (loading) return <p>Loading invoice...</p>;
  if (error) return <p>{error}</p>;
  if (!invoice) return <p>Invoice not found</p>;

  const {
    vendor,
    date,
    amount,
    taxId,
    dueDate,
    status,
    invoiceType,
    anomalies,
    aiOutput,
  } = invoice;

  const details = {
    Vendor: vendor,
    Date: new Date(date).toLocaleDateString(),
    Amount: `$${amount.toFixed(2)}`,
    "Tax ID": taxId || "N/A",
    "Due Date": dueDate ? new Date(dueDate).toLocaleDateString() : "N/A",
    Status: status,
    Type: invoiceType,
  };

  return (
    <div>
      <button
        onClick={() => navigate("/invoices")}
        style={{
          marginBottom: "20px",
          cursor: "pointer",
          padding: "15px",
          borderRadius: "5px",
        }}
      >
        ← Back to List
      </button>

      <button
        onClick={exportToPDF}
        style={{
          marginBottom: "20px",
          marginLeft: "10px",
          cursor: "pointer",
          padding: "15px",
          borderRadius: "5px",
        }}
      >
        Export as PDF
      </button>

      <div ref={pdfRef} style={{ background: "white", padding: "20px" }}>
        <h2>Invoice Details</h2>
        <table style={{ marginBottom: "20px" }}>
          <tbody>
            {Object.entries(details).map(([label, value]) => (
              <tr key={label} style={{ borderBottom: "1px solid #eee" }}>
                <td
                  data-label={label}
                  style={{
                    fontWeight: "bold",
                    width: 140,
                    padding: 8,
                    marginRight: "auto",
                  }}
                >
                  {label}
                </td>
                <td style={{ padding: 8 }}>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3>Anomalies</h3>
        {anomalies ? (
          <ul>
            {anomalies.split("; ").map((a, idx) => (
              <li key={idx} className="anomaly" style={{ listStyle: "none" }}>
                {a}
              </li>
            ))}
          </ul>
        ) : (
          <p>No anomalies detected.</p>
        )}

        <h3>AI Analysis Output</h3>
        <p>{aiOutput || "No AI analysis available."}</p>
      </div>
    </div>
  );
};

export default InvoiceDetail;
