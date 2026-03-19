import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const statuses = ["Pending", "In Review", "Resolved", "Rejected"];

function QueryList() {
  const [queries, setQueries] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  // Wrapped in useCallback to prevent infinite loops and satisfy ESLint
  const fetchQueries = useCallback(() => {
    const params = {};
    if (statusFilter) params.status = statusFilter;
    if (priorityFilter) params.priority = priorityFilter;
    axios
      .get("https://supplier-portal-v6ye.onrender.com/api/queries", { params })
      .then((res) => setQueries(res.data))
      .catch((err) => console.error("Fetch error:", err));
  }, [statusFilter, priorityFilter]);

  useEffect(() => {
    fetchQueries();
  }, [fetchQueries]); // fetchQueries is now a stable dependency

  return (
    <div>
      <h2>Query Tracking</h2>
      <div style={{ marginBottom: "1rem" }}>
        <label>Status:</label>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All</option>
          {statuses.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <label style={{ marginLeft: "1rem" }}>Priority:</label>
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
          <option value="">All</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>

      <div>
        {queries.length === 0 && <p>No queries found.</p>}
        {queries.map((q) => (
          <div key={q._id} style={{ border: "1px solid #ddd", marginBottom: "0.5rem", padding: "0.7rem", borderRadius: 6 }}>
            <Link to={`/query/${q._id}`} style={{ fontWeight: 600, fontSize: "1rem" }}>
              {q.type} ({q.priority})
            </Link>
            <p>Status: <strong>{q.status}</strong></p>
            <p>Supplier: {q.supplierId?.name || "Unassigned"}</p>
            <p>{q.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default QueryList;