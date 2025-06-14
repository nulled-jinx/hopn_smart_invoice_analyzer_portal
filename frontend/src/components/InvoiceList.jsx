import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./InvoiceList.css";

const InvoiceList = () => {
  const [allInvoices, setAllInvoices] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [filters, setFilters] = useState({
    vendor: "",
    status: "",
    fromDate: "",
    toDate: "",
  });

  const navigate = useNavigate();
  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5143/api";

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/invoices`);
      setAllInvoices(response.data);
      setInvoices(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    let filtered = allInvoices;

    if (filters.vendor.trim() !== "") {
      filtered = filtered.filter((inv) =>
        inv.vendor.toLowerCase().includes(filters.vendor.toLowerCase())
      );
    }

    if (filters.status) {
      filtered = filtered.filter(
        (inv) => inv.status.toLowerCase() === filters.status.toLowerCase()
      );
    }

    if (filters.fromDate) {
      filtered = filtered.filter(
        (inv) => new Date(inv.date) >= new Date(filters.fromDate)
      );
    }

    if (filters.toDate) {
      filtered = filtered.filter(
        (inv) => new Date(inv.date) <= new Date(filters.toDate)
      );
    }

    setInvoices(filtered);
  }, [filters, allInvoices]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div>
      <h2>Invoices</h2>

      <div className="filters">
        <input
          type="text"
          placeholder="Filter by vendor"
          name="vendor"
          value={filters.vendor}
          onChange={handleFilterChange}
          style={{ flexGrow: 1, minWidth: "150px" }}
        />
        <select
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Paid">Paid</option>
          <option value="Overdue">Overdue</option>
        </select>
        <input
          type="date"
          name="fromDate"
          value={filters.fromDate}
          onChange={handleFilterChange}
          title="From date"
        />
        <input
          type="date"
          name="toDate"
          value={filters.toDate}
          onChange={handleFilterChange}
          title="To date"
        />
      </div>

      <table>
        <thead>
          <tr>
            <th>Vendor</th>
            <th>Date</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          {invoices.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ textAlign: "center", padding: "15px" }}>
                No invoices found
              </td>
            </tr>
          ) : (
            invoices.map((inv) => (
              <tr
                key={inv.id}
                onClick={() => navigate(`${inv.id}`)}
                style={{ cursor: "pointer" }}
              >
                <td data-label="Vendor">{inv.vendor}</td>
                <td data-label="Date">
                  {new Date(inv.date).toLocaleDateString()}
                </td>
                <td data-label="Amount">${inv.amount.toFixed(2)}</td>
                <td data-label="Status">
                  {inv.status.toLowerCase().charAt(0).toUpperCase() +
                    inv.status.toLowerCase().slice(1)}
                </td>
                <td data-label="Type">{inv.type}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default InvoiceList;
