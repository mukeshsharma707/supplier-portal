const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const Query = require("../models/Query");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "..", "uploads")),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const cleanName = file.originalname.replace(/\s+/g, "_");
    cb(null, `${uniqueSuffix}-${cleanName}`);
  }
});

const upload = multer({ storage });

// Create Query
router.post("/", async (req, res) => {
  try {
    const { supplierId, type, category, message, priority } = req.body;

    if (!type || !message) {
      return res.status(400).json({ error: "type and message are required" });
    }

    const payload = {
      type,
      category: category || "Food Safety",
      message,
      priority: priority || "Medium",
      status: "Pending",
      timeline: [{ status: "Pending", note: "Query created" }]
    };

    if (supplierId) {
      if (!mongoose.Types.ObjectId.isValid(supplierId)) {
        return res.status(400).json({ error: "supplierId must be a valid ObjectId" });
      }
      payload.supplierId = supplierId;
    }

    const query = new Query(payload);
    await query.save();
    const saved = await Query.findById(query._id).populate("supplierId");
    res.json(saved);
  } catch (error) {
    console.error("Create query error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// Query list with optional status filter
router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;
    const queries = await Query.find(filter).populate("supplierId").sort({ createdAt: -1 });
    res.json(queries);
  } catch (error) {
    console.error("Get queries error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// Get single query
router.get("/:id", async (req, res) => {
  try {
    const query = await Query.findById(req.params.id).populate("supplierId");
    if (!query) return res.status(404).json({ error: "Query not found" });
    res.json(query);
  } catch (error) {
    console.error("Get query error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// Add comment
router.post("/:id/comment", async (req, res) => {
  try {
    const query = await Query.findById(req.params.id);
    if (!query) return res.status(404).json({ error: "Query not found" });
    query.comments.push({ sender: req.body.sender || "QA Team", text: req.body.text });
    query.timeline.push({ status: query.status, note: `Comment added: ${req.body.text}` });
    await query.save();
    const updated = await Query.findById(req.params.id).populate("supplierId");
    res.json(updated);
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// Update status
router.put("/:id/status", async (req, res) => {
  try {
    const { status, note } = req.body;
    const valid = ["Pending", "In Review", "Resolved", "Rejected"];
    if (!valid.includes(status)) return res.status(400).json({ error: "Invalid status" });

    const query = await Query.findById(req.params.id);
    if (!query) return res.status(404).json({ error: "Query not found" });

    query.status = status;
    query.timeline.push({ status, note: note || `Status set to ${status}` });
    await query.save();
    const updated = await Query.findById(req.params.id).populate("supplierId");
    res.json(updated);
  } catch (error) {
    console.error("Update status error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});
// Upload attachment
router.post("/:id/attachment", upload.single("file"), async (req, res) => {
  try {
    const query = await Query.findById(req.params.id);
    if (!query) return res.status(404).json({ error: "Query not found" });
    if (!req.file) return res.status(400).json({ error: "File is required" });

    const url = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    query.attachments.push({ name: req.file.originalname, url });
    query.timeline.push({ status: query.status, note: `Attachment uploaded: ${req.file.originalname}` });
    await query.save();

    const updated = await Query.findById(req.params.id).populate("supplierId");
    res.json(updated);
  } catch (error) {
    console.error("Upload attachment error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
module.exports = router;