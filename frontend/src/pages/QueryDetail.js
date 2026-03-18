import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
const statusOptions = ["Pending", "In Review", "Resolved", "Rejected"];

function QueryDetail() {
  const { id } = useParams();
  const [query, setQuery] = useState(null);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState("");

  const loadQuery = () => {
    axios.get(`${API_BASE}/api/queries/${id}`).then((res) => {
      setQuery(res.data);
      setStatus(res.data.status);
    }).catch((err) => {
      console.error("Load query error", err?.response?.data || err.message);
    });
  };

  useEffect(() => {
    loadQuery();
  }, [id]);

  const [file, setFile] = useState(null);

  const sendComment = async () => {
    if (!comment.trim()) return;
    try {
      await axios.post(`${API_BASE}/api/queries/${id}/comment`, {
        text: comment,
        sender: "QA Team"
      });
      setComment("");
      loadQuery();
    } catch (err) {
      console.error("Send comment error", err?.response?.data || err.message);
      alert("Could not send comment: " + (err.response?.data?.error || err.message));
    }
  };

  const updateStatus = async () => {
    try {
      await axios.put(`${API_BASE}/api/queries/${id}/status`, {
        status,
        note: `Status changed to ${status}`
      });
      loadQuery();
    } catch (err) {
      console.error("Update status error", err?.response?.data || err.message);
      alert("Could not update status: " + (err.response?.data?.error || err.message));
    }
  };

  const uploadAttachment = async () => {
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post(`${API_BASE}/api/queries/${id}/attachment`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setFile(null);
      loadQuery();
      alert("Attachment uploaded successfully.");
    } catch (err) {
      console.error("Upload attachment error", err?.response?.data || err.message);
      alert("File upload failed: " + (err.response?.data?.error || err.message));
    }
  };

  if (!query) return <div className="container py-5"><h2>Loading query detail...</h2></div>;

  return (
    <div className="container py-4">
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h2 className="h5 mb-0">{query.type}</h2>
          <span className={`badge ${query.status === 'Resolved' ? 'bg-success' : query.status === 'Rejected' ? 'bg-danger' : query.status === 'In Review' ? 'bg-info text-dark' : 'bg-warning text-dark'}`}>{query.status}</span>
        </div>

        <div className="card-body">
          <div className="row mb-3">
            <div className="col-md-4">
              <strong>Supplier</strong>
              <p className="mb-1">{query.supplierId?.name || 'Unassigned'}</p>
            </div>
            <div className="col-md-4">
              <strong>Priority</strong>
              <p className="mb-1">{query.priority}</p>
            </div>
            <div className="col-md-4">
              <strong>Category</strong>
              <p className="mb-1">{query.category}</p>
            </div>
          </div>

          <div className="mb-4">
            <strong>Message</strong>
            <p className="bg-light p-3 rounded">{query.message}</p>
          </div>

          <div className="row">
            <div className="col-lg-6 mb-4">
              <h5>Timeline</h5>
              <ul className="list-group">
                {query.timeline?.length > 0 ? query.timeline.map((item, i) => (
                  <li key={i} className="list-group-item d-flex justify-content-between align-items-start">
                    <div>
                      <div className="fw-semibold">{item.status}</div>
                      <div>{item.note}</div>
                    </div>
                    <small className="text-muted">{new Date(item.date).toLocaleString()}</small>
                  </li>
                )) : <li className="list-group-item">No timeline entries yet.</li>}
              </ul>
            </div>

            <div className="col-lg-6 mb-4">
              <h5>Update status</h5>
              <div className="input-group">
                <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                  {statusOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
                <button className="btn btn-outline-primary" onClick={updateStatus}>Update</button>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h5>Comments</h5>
            <div className="list-group mb-3">
              {query.comments?.length > 0 ? query.comments.map((c, i) => (
                <div key={i} className="list-group-item">
                  <div className="d-flex justify-content-between">
                    <small className="text-muted">{c.sender || 'QA'}</small>
                    <small className="text-muted">{new Date(c.date).toLocaleString()}</small>
                  </div>
                  <p className="mb-0">{c.text}</p>
                </div>
              )) : <div className="list-group-item">No comments yet.</div>}
            </div>

            <div className="mb-3">
              <textarea className="form-control" value={comment} onChange={(e) => setComment(e.target.value)} rows="3" placeholder="Write a comment..."></textarea>
            </div>
            <button className="btn btn-primary" onClick={sendComment}>Send Comment</button>
          </div>

          <div className="mb-4">
            <h5>Upload Document</h5>
            <div className="input-group mb-2">
              <input type="file" className="form-control" onChange={(e) => setFile(e.target.files[0])} />
              <button className="btn btn-secondary" onClick={uploadAttachment}>Upload</button>
            </div>
            {file && <small className="text-muted">Selected: {file.name}</small>}
          </div>

          <div>
            <h5>Attachments</h5>
            <ul className="list-group">
              {query.attachments?.length ? query.attachments.map((a, i) => (
                <li key={i} className="list-group-item">
                  <a href={a.url} target="_blank" rel="noreferrer" className="text-decoration-none">{a.name}</a>
                </li>
              )) : <li className="list-group-item">No attachments</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QueryDetail;