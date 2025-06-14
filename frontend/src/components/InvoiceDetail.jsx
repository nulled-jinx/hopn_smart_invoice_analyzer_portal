import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5143/api";

  useEffect(() => {
    fetchInvoice();
  }, [id]);

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
    type,
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
    Type: type,
  };

  return (
    <div>
      <button
        onClick={() => navigate("/")}
        style={{
          marginBottom: "20px",
          cursor: "pointer",
          padding: "15px",
          borderRadius: "5px",
        }}
      >
        ← Back to List
      </button>

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
              ></td>
              <td style={{ padding: 8 }}>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Anomalies</h3>
      {anomalies && anomalies.length > 0 ? (
        <ul>
          {anomalies.map((a, idx) => (
            <li key={idx} className="anomaly">
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
  );
};

export default InvoiceDetail;
