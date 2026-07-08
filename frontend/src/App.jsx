import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const revenueData = [
  { month: "Jan", revenue: 42000 },
  { month: "Feb", revenue: 56000 },
  { month: "Mar", revenue: 61000 },
  { month: "Apr", revenue: 75000 },
  { month: "May", revenue: 92000 },
];

function App() {
  const [invoices, setInvoices] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [inventorySearch, setInventorySearch] = useState("");
  const [migrationResult, setMigrationResult] = useState(null);

  const [formData, setFormData] = useState({
    vendor: "",
    invoice_number: "",
    amount: "",
    status: "Pending",
  });

  const [inventoryForm, setInventoryForm] = useState({
    item_code: "",
    item_name: "",
    warehouse: "",
    quantity: "",
    reorder_level: "",
    status: "Available",
  });

  const totalRevenue = invoices.reduce(
    (sum, invoice) => sum + Number(invoice.amount),
    0
  );

  const pendingInvoices = invoices.filter(
    (invoice) => invoice.status === "Pending"
  ).length;

  const paidInvoices = invoices.filter(
    (invoice) => invoice.status === "Paid"
  ).length;

  const vendorCount = new Set(invoices.map((invoice) => invoice.vendor)).size;

  const lowStockItems = inventory.filter(
    (item) => item.status === "Low Stock"
  ).length;

  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.vendor.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
      invoice.invoice_number.toLowerCase().includes(invoiceSearch.toLowerCase())
  );

  const filteredInventory = inventory.filter(
    (item) =>
      item.item_code.toLowerCase().includes(inventorySearch.toLowerCase()) ||
      item.item_name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
      item.warehouse.toLowerCase().includes(inventorySearch.toLowerCase())
  );

  const fetchInvoices = async () => {
    const response = await axios.get("https://fusionerp-mini.onrender.com/invoices");
    setInvoices(response.data);
  };

  const fetchInventory = async () => {
    const response = await axios.get("https://fusionerp-mini.onrender.com/inventory");
    setInventory(response.data);
  };

  useEffect(() => {
    fetchInvoices();
    fetchInventory();
  }, []);

  const exportInvoicesCSV = () => {
    const headers = ["Vendor", "Invoice Number", "Amount", "Status"];

    const rows = filteredInvoices.map((invoice) => [
      invoice.vendor,
      invoice.invoice_number,
      invoice.amount,
      invoice.status,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((value) => `"${value}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "fusionerp_invoices.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await axios.post("https://fusionerp-mini.onrender.com/invoices", {
      vendor: formData.vendor,
      invoice_number: formData.invoice_number,
      amount: Number(formData.amount),
      status: formData.status,
    });

    setInvoices([...invoices, response.data]);

    setFormData({
      vendor: "",
      invoice_number: "",
      amount: "",
      status: "Pending",
    });
  };

  const handleInventorySubmit = async (e) => {
    e.preventDefault();

    const response = await axios.post("https://fusionerp-mini.onrender.com/inventory", {
      item_code: inventoryForm.item_code,
      item_name: inventoryForm.item_name,
      warehouse: inventoryForm.warehouse,
      quantity: Number(inventoryForm.quantity),
      reorder_level: Number(inventoryForm.reorder_level),
      status: inventoryForm.status,
    });

    setInventory([...inventory, response.data]);

    setInventoryForm({
      item_code: "",
      item_name: "",
      warehouse: "",
      quantity: "",
      reorder_level: "",
      status: "Available",
    });
  };

  const handleMigrationUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append("file", file);

    const response = await axios.post(
      "https://fusionerp-mini.onrender.com/migration/upload",
      data
    );

    setMigrationResult(response.data);
    await fetchInvoices();
  };

  const deleteInvoice = async (id) => {
    await axios.delete(`https://fusionerp-mini.onrender.com/invoices/${id}`);
    fetchInvoices();
  };

  const deleteInventory = async (id) => {
    await axios.delete(`https://fusionerp-mini.onrender.com/inventory/${id}`);
    fetchInventory();
  };

  const updateInvoiceStatus = async (id, status) => {
    await axios.put(`https://fusionerp-mini.onrender.com/invoices/${id}/status`, null, {
      params: { status },
    });

    fetchInvoices();
  };

  const updateInventoryStatus = async (id, status) => {
    await axios.put(`https://fusionerp-mini.onrender.com/inventory/${id}/status`, null, {
      params: { status },
    });

    fetchInventory();
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>FusionERP</h2>
        <p>Oracle Migration Simulator</p>

        <nav>
          <a href="#dashboard">Dashboard</a>
          <a href="#ledger">General Ledger</a>
          <a href="#accounts-payable">Accounts Payable</a>
          <a href="#inventory">Inventory</a>
          <a href="#migration">EBS Migration</a>
        </nav>
      </aside>

      <main className="main" id="dashboard">
        <h1>Enterprise Financial Dashboard</h1>
        <p className="subtitle">
          Oracle Fusion Financials-style ERP monitoring dashboard
        </p>

        <section className="cards">
          <div className="card">
            <h2>${totalRevenue.toLocaleString()}</h2>
            <p>Total Invoice Value</p>
          </div>

          <div className="card">
            <h2>{pendingInvoices}</h2>
            <p>Pending Invoices</p>
          </div>

          <div className="card">
            <h2>{paidInvoices}</h2>
            <p>Paid Invoices</p>
          </div>

          <div className="card">
            <h2>{vendorCount}</h2>
            <p>Vendors</p>
          </div>

          <div className="card">
            <h2>{lowStockItems}</h2>
            <p>Low Stock Items</p>
          </div>
        </section>

        <section className="grid">
          <div className="panel">
            <h3>Revenue Trend</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={revenueData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="panel" id="migration">
            <h3>Oracle EBS Migration Tool</h3>
            <input type="file" accept=".csv" onChange={handleMigrationUpload} />

            {migrationResult && (
              <div className="migration-result">
                <p><b>File:</b> {migrationResult.file_name}</p>
                <p><b>Total Records:</b> {migrationResult.total_records}</p>
                <p><b>Imported Records:</b> {migrationResult.imported_records}</p>
                <p><b>Failed Records:</b> {migrationResult.failed_records}</p>
                <p><b>Duplicate Records:</b> {migrationResult.duplicate_records}</p>
                <p><b>Status:</b> {migrationResult.status}</p>
              </div>
            )}
          </div>
        </section>

        <section className="panel" id="ledger">
          <h3>General Ledger</h3>
          <p>
            Journal entries and trial balance module planned for next release.
          </p>
        </section>

        <section className="panel">
          <h3>Add Inventory Item</h3>

          <form className="inventory-form" onSubmit={handleInventorySubmit}>
            <input type="text" placeholder="Item Code" value={inventoryForm.item_code} onChange={(e) => setInventoryForm({ ...inventoryForm, item_code: e.target.value })} required />
            <input type="text" placeholder="Item Name" value={inventoryForm.item_name} onChange={(e) => setInventoryForm({ ...inventoryForm, item_name: e.target.value })} required />
            <input type="text" placeholder="Warehouse" value={inventoryForm.warehouse} onChange={(e) => setInventoryForm({ ...inventoryForm, warehouse: e.target.value })} required />
            <input type="number" placeholder="Quantity" value={inventoryForm.quantity} onChange={(e) => setInventoryForm({ ...inventoryForm, quantity: e.target.value })} required />
            <input type="number" placeholder="Reorder Level" value={inventoryForm.reorder_level} onChange={(e) => setInventoryForm({ ...inventoryForm, reorder_level: e.target.value })} required />

            <select
              value={inventoryForm.status}
              onChange={(e) =>
                setInventoryForm({ ...inventoryForm, status: e.target.value })
              }
            >
              <option>Available</option>
              <option>Low Stock</option>
              <option>Out of Stock</option>
            </select>

            <button type="submit">Add Item</button>
          </form>
        </section>

        <section className="panel" id="inventory">
          <h3>Inventory Management</h3>

          <input
            className="search-input"
            type="text"
            placeholder="Search inventory by item code, name, or warehouse..."
            value={inventorySearch}
            onChange={(e) => setInventorySearch(e.target.value)}
          />

          <table>
            <thead>
              <tr>
                <th>Item Code</th>
                <th>Item Name</th>
                <th>Warehouse</th>
                <th>Quantity</th>
                <th>Reorder Level</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan="7">No inventory items found.</td>
                </tr>
              ) : (
                filteredInventory.map((item) => (
                  <tr key={item.id}>
                    <td>{item.item_code}</td>
                    <td>{item.item_name}</td>
                    <td>{item.warehouse}</td>
                    <td>{item.quantity}</td>
                    <td>{item.reorder_level}</td>
                    <td>
                      <select
                        value={item.status}
                        onChange={(e) =>
                          updateInventoryStatus(item.id, e.target.value)
                        }
                      >
                        <option>Available</option>
                        <option>Low Stock</option>
                        <option>Out of Stock</option>
                      </select>
                    </td>
                    <td>
                      <button
                        className="delete-btn"
                        onClick={() => deleteInventory(item.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        <section className="panel">
          <h3>Add Accounts Payable Invoice</h3>

          <form className="invoice-form" onSubmit={handleSubmit}>
            <input type="text" placeholder="Vendor" value={formData.vendor} onChange={(e) => setFormData({ ...formData, vendor: e.target.value })} required />
            <input type="text" placeholder="Invoice Number" value={formData.invoice_number} onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })} required />
            <input type="number" placeholder="Amount" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required />

            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
            >
              <option>Pending</option>
              <option>Paid</option>
              <option>Rejected</option>
            </select>

            <button type="submit">Add Invoice</button>
          </form>
        </section>

        <section className="panel" id="accounts-payable">
          <h3>Recent Accounts Payable Invoices</h3>

          <button className="export-btn" onClick={exportInvoicesCSV}>
            Export Invoices Report
          </button>

          <input
            className="search-input"
            type="text"
            placeholder="Search invoices by vendor or invoice number..."
            value={invoiceSearch}
            onChange={(e) => setInvoiceSearch(e.target.value)}
          />

          <table>
            <thead>
              <tr>
                <th>Vendor</th>
                <th>Invoice</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan="5">No matching invoices found.</td>
                </tr>
              ) : (
                filteredInvoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td>{invoice.vendor}</td>
                    <td>{invoice.invoice_number}</td>
                    <td>${Number(invoice.amount).toLocaleString()}</td>
                    <td>
                      <select
                        value={invoice.status}
                        onChange={(e) =>
                          updateInvoiceStatus(invoice.id, e.target.value)
                        }
                      >
                        <option>Pending</option>
                        <option>Paid</option>
                        <option>Rejected</option>
                      </select>
                    </td>
                    <td>
                      <button
                        className="delete-btn"
                        onClick={() => deleteInvoice(invoice.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        <footer className="footer">
  <p>
    <strong>FusionERP Mini</strong> | Oracle Fusion Financials Migration
    Simulator
  </p>

  <p>Built with React • FastAPI • SQLAlchemy • SQLite • Recharts</p>

  <p>© 2026 Naga Prem Sai Nellure.</p>
</footer>
      </main>
    </div>
  );
}

export default App;