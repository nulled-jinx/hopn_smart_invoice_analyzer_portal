import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import UploadForm from "./components/UploadForm";
import Dashboard from "./components/Dashboard";
import InvoiceList from "./components/InvoiceList";
import InvoiceDetail from "./components/InvoiceDetail";

export default function App() {
  return (
    <Router>
      <div
        className="app-container"
        style={{ maxWidth: 960, margin: "auto", padding: 20 }}
      >
        <header style={{ marginBottom: 20 }}>
          <h1>Smart Invoice Analyzer</h1>
          <nav style={{ marginBottom: 20 }}>
            <Link to="/" style={{ marginRight: 10 }}>
              Dashboard
            </Link>
            <Link to="/upload" style={{ marginRight: 10 }}>
              Upload Invoice
            </Link>
            <Link to="/invoices">Invoices</Link>
          </nav>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<UploadForm />} />
            <Route path="/invoices" element={<InvoiceList />} />
            <Route path="/invoices/:id" element={<InvoiceDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
