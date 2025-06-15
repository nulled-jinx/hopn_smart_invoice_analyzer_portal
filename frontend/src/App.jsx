import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import UploadForm from "./components/UploadForm";
import Dashboard from "./components/Dashboard";
import InvoiceList from "./components/InvoiceList";
import InvoiceDetail from "./components/InvoiceDetail";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ProtectedRoute from "./components/ProtectedRoute";

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
            <Link to="/invoices" style={{ marginRight: 10 }}>
              Invoices
            </Link>
            <Link to="/login" style={{ marginRight: 10 }}>
              Login
            </Link>
            <Link to="/signup">Signup</Link>
          </nav>
        </header>

        <main>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/upload"
              element={
                <ProtectedRoute>
                  <UploadForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/invoices"
              element={
                <ProtectedRoute>
                  <InvoiceList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/invoices/:id"
              element={
                <ProtectedRoute>
                  <InvoiceDetail />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
