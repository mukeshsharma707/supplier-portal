const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
app.use("/uploads", express.static(uploadDir));

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB successfully Connected"))
.catch(err => console.log(err));

app.use("/api/suppliers", require("./routes/supplierRoutes"));
app.use("/api/queries", require("./routes/queryRoutes"));

app.listen(5000, () => console.log("Server running on port 5000"));