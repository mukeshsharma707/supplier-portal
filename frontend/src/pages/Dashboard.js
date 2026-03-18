import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";
import "./Dashboard.css";

const statusColors = {
  Pending: "#f6c23e",
  "In Review": "#36b9cc",
  Resolved: "#1cc88a",
  Rejected: "#e74a3b",
  Unknown: "#6c757d"
};

function Dashboard() {
  const [queries, setQueries] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      axios.get("http://localhost:5000/api/queries"),
      axios.get("http://localhost:5000/api/suppliers")
    ])
      .then(([qRes, sRes]) => {
        setQueries(qRes.data);
        setSuppliers(sRes.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Dashboard data fetch error", err);
        setError("Cannot load dashboard data; check backend.");
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="dashboard"><h2>Supplier Dashboard</h2><p>Loading…</p></div>;
  if (error) return <div className="dashboard"><h2>Supplier Dashboard</h2><p className="error">{error}</p></div>;

  const statusCounts = queries.reduce((acc, q) => {
    const key = q.status || "Unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const statusData = Object.entries(statusCounts).map(([status, value]) => ({ name: status, value }));

  const riskCounts = suppliers.reduce((acc, s) => {
    const level = (s.riskLevel || "Unknown").toLowerCase();
    if (level === "high") acc.High += 1;
    else if (level === "medium") acc.Medium += 1;
    else if (level === "low") acc.Low += 1;
    else acc.Unknown += 1;
    return acc;
  }, { High: 0, Medium: 0, Low: 0, Unknown: 0 });

  const riskData = Object.entries(riskCounts).map(([name, value]) => ({ name, value }));

  const highRisk = riskCounts.High;
  const expiringCerts = suppliers.reduce((total, s) => {
    const soon = s.certificates?.filter(c => new Date(c.expiryDate) < new Date(Date.now() + 30 * 24 * 3600 * 1000));
    return total + (soon?.length || 0);
  }, 0);

  const supplierQueryCount = suppliers.map((s) => ({
    supplier: s,
    queries: queries.filter((q) => q.supplierId?._id === s._id)
  }));

  const topSuppliers = supplierQueryCount
    .map((item) => ({
      name: item.supplier.name || "Unknown",
      queries: item.queries.length
    }))
    .sort((a, b) => b.queries - a.queries)
    .slice(0, 5);

  const topByRiskData = supplierQueryCount
    .map((item) => ({
      name: item.supplier.name || "Unknown",
      openQueries: item.queries.filter(q => q.status === "Pending" || q.status === "In Review").length
    }))
    .sort((a, b) => b.openQueries - a.openQueries)
    .slice(0, 5);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Supplier Food Safety Dashboard</h2>
        <div className="actions">
          <Link to="/new-query" className="btn">Raise new query</Link>
          <Link to="/queries" className="btn btn-light">Track queries</Link>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <h3>Query status overview</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={35} label>
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${entry.name}`} fill={statusColors[entry.name] || statusColors.Unknown} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>

          <div className="status-list">
            {statusData.map((x) => (
              <div key={x.name} className="status-item">
                <span className="dot" style={{ background: statusColors[x.name] || statusColors.Unknown }} />
                <span>{x.name}</span>
                <strong>{x.value}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="metric-card">
          <h3>Supplier risk distribution</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={riskData} margin={{ top: 10, right: 15, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#4e73df" radius={[8, 8, 0, 0]}>
                {riskData.map((entry, index) => (
                  <Cell key={`cell-risk-${index}`} fill={index === 0 ? "#e74a3b" : index === 1 ? "#f6c23e" : index === 2 ? "#1cc88a" : "#858796"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="small-metrics">
            <p>Total suppliers: <b>{suppliers.length}</b></p>
            <p>High risk: <b>{highRisk}</b></p>
            <p>Certificates expiring within 30 days: <b>{expiringCerts}</b></p>
            <p>Open queries: <b>{(statusCounts.Pending || 0) + (statusCounts["In Review"] || 0)}</b></p>
          </div>
        </div>
      </div>

      <div className="details-grid">
        <div className="detail-card">
          <h3>Top suppliers by total queries</h3>
          {topSuppliers.length === 0 ? <p>No data</p> : (
            <ul>
              {topSuppliers.map((item, i) => (
                <li key={i}>{item.name} <span>{item.queries}</span></li>
              ))}
            </ul>
          )}
        </div>

        <div className="detail-card">
          <h3>Top suppliers by open queries</h3>
          {topByRiskData.length === 0 ? <p>No data</p> : (
            <ul>
              {topByRiskData.map((item, i) => (
                <li key={i}>{item.name} <span>{item.openQueries}</span></li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <h3>Supplier cards</h3>
      {supplierQueryCount.length === 0 && <p>No suppliers found</p>}
      <div className="supplier-grid">
        {supplierQueryCount.map(({ supplier, queries }) => (
          <div key={supplier._id} className="supplier-card">
            <h4>{supplier.name}</h4>
            <p><strong>Risk</strong>: {supplier.riskLevel || "Unknown"}</p>
            <p><strong>Open queries</strong>: {queries.filter(q => q.status === "Pending" || q.status === "In Review").length}</p>
            <p><strong>Certs</strong>: {supplier.certificates?.length || 0}</p>
            <Link to={`/query/${queries[0]?._id || ""}`} className="link">Latest query</Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;