const express = require("express");
const router = express.Router();
const Supplier = require("../models/Supplier");

// Create Supplier
router.post("/", async (req, res) => {
  const supplier = new Supplier(req.body);
  await supplier.save();
  res.json(supplier);
});

// Get all suppliers
router.get("/", async (req, res) => {
  const suppliers = await Supplier.find();
  res.json(suppliers);
});

// Get single supplier
router.get("/:id", async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);
  res.json(supplier);
});

// Update supplier
router.put("/:id", async (req, res) => {
  const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(supplier);
});

// Delete supplier
router.delete("/:id", async (req, res) => {
  await Supplier.findByIdAndDelete(req.params.id);
  res.json({ message: "Supplier deleted" });
});

module.exports = router;