import React, { useState, useEffect } from "react";
import axios from "axios";

const templates = [
  { type: "Allergen Information", message: "Please provide updated allergen data sheet for your products." },
  { type: "HACCP Certificate", message: "Requesting current HACCP certificate and expiry dates." },
  { type: "ISO22000 Documentation", message: "Requesting ISO22000 audit report and action plan." }
];

function NewQuery() {
  const [form, setForm] = useState({
    supplierId: "",
    type: "",
    category: "Food Safety",
    priority: "Medium",
    message: ""
  });
  const [suppliers, setSuppliers] = useState([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);
  const [supplierError, setSupplierError] = useState(null);

  const sampleSuppliers = [
    { _id: "65f1234567890abcdef12341", name: "ACME Foods", riskLevel: "Low" },
    { _id: "65f1234567890abcdef12342", name: "Global Harvest", riskLevel: "Medium" },
    { _id: "65f1234567890abcdef12343", name: "PureProduce Ltd.", riskLevel: "High" }
  ];

  useEffect(() => {
    axios
      .get("https://supplier-portal-v6ye.onrender.com/api/suppliers")
      .then((res) => {
        setSuppliers(res.data);
        setLoadingSuppliers(false);
      })
      .catch((err) => {
        console.error("Failed to load suppliers", err);
        setSupplierError("Could not load suppliers. You can still submit without supplier.");
        setLoadingSuppliers(false);
      });
  }, []);

  const applyTemplate = (template) => {
    setForm((prev) => ({ ...prev, type: template.type, message: template.message }));
  };

  const submit = async () => {
    if (!form.type.trim() || !form.message.trim()) {
      alert("Type and message are required");
      return;
    }

    try {
      const payload = {
        supplierId: form.supplierId || undefined,
        type: form.type,
        category: form.category,
        priority: form.priority,
        message: form.message
      };

      await axios.post("https://supplier-portal-v6ye.onrender.com/api/queries", payload);
      alert("Query Created");
      setForm({ supplierId: "", type: "", category: "Food Safety", priority: "Medium", message: "" });
    } catch (err) {
      console.error("Error submitting query", err);
      alert("Failed to create query: " + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="container py-4">
      <div className="card shadow-sm">
        <div className="card-body">
          <h2 className="card-title mb-3">Raise Food Safety Query</h2>
          {supplierError && <div className="alert alert-warning">{supplierError}</div>}

          <div className="mb-3">
            <label className="form-label">Supplier</label>
            <div>
              {loadingSuppliers ? (
                <div className="form-text">Loading supplier list...</div>
              ) : (
                <select
                  className="form-select"
                  value={form.supplierId}
                  onChange={(e) => setForm((prev) => ({ ...prev, supplierId: e.target.value }))}
                >
                  <option value="">(None) Select supplier</option>
                  {(suppliers.length ? suppliers : sampleSuppliers).map((supplier) => (
                    <option key={supplier._id} value={supplier._id}>
                      {supplier.name} ({supplier.riskLevel || "unknown"})
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Template</label>
            <div className="btn-group" role="group" aria-label="Query templates">
              {templates.map((tpl) => (
                <button
                  type="button"
                  key={tpl.type}
                  className="btn btn-outline-secondary"
                  onClick={() => applyTemplate(tpl)}
                >
                  {tpl.type}
                </button>
              ))}
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Type</label>
              <input
                type="text"
                className="form-control"
                value={form.type}
                onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
                placeholder="e.g. Allergen data update"
              />
            </div>

            <div className="col-md-3 mb-3">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={form.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
              >
                <option>Food Safety</option>
                <option>Regulatory</option>
                <option>Certification</option>
              </select>
            </div>

            <div className="col-md-3 mb-3">
              <label className="form-label">Priority</label>
              <select
                className="form-select"
                value={form.priority}
                onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value }))}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Message</label>
            <textarea
              className="form-control"
              value={form.message}
              onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
              rows="5"
              placeholder="Describe the issue or request to supplier"
            />
          </div>

          <div className="d-flex justify-content-end">
            <button className="btn btn-primary" onClick={submit}>
              Submit Query
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewQuery;