const mongoose = require("mongoose");

const querySchema = new mongoose.Schema({
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" },
  type: { type: String, required: true },
  category: { type: String, default: "General" },
  priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
  message: { type: String, required: true },
  status: { type: String, enum: ["Pending", "In Review", "Resolved", "Rejected"], default: "Pending" },
  attachments: [
    {
      name: String,
      url: String,
      uploadedAt: { type: Date, default: Date.now }
    }
  ],
  comments: [
    {
      sender: { type: String, default: "QA Team" },
      text: String,
      date: { type: Date, default: Date.now }
    }
  ],
  timeline: [
    {
      status: String,
      date: { type: Date, default: Date.now },
      note: String
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("Query", querySchema);