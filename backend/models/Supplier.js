const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema({
  name: String,
  riskLevel: String, // High, Medium, Low
  certificates: [
    {
      name: String,
      expiryDate: Date
    }
  ]
});

module.exports = mongoose.model("Supplier", supplierSchema);