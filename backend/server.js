require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const outletRoutes = require("./routes/outletRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const staffRoutes = require("./routes/staffRoutes");
const auditRoutes = require("./routes/auditRoutes");
const marketingRoutes = require("./routes/marketingRoutes");
const intelligenceRoutes = require("./routes/intelligenceRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const { startWorkflowDaemon } = require("./services/workflowEngine");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/outlets", outletRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/marketing", marketingRoutes);
app.use("/api/intelligence", intelligenceRoutes);
app.use("/api/notifications", notificationRoutes);

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server Running on Port ${PORT}`);
    startWorkflowDaemon(60000);
  });
}

module.exports = app;