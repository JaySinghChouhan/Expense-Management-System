const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const authRoutes = require("./routes/auth.routes");
const expenseRoutes = require("./routes/expense.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const reportRoutes = require("./routes/report.routes");
const { notFound, errorHandler } = require("./middleware/error.middleware");

const app = express();
// Render (and other reverse proxies) set X-Forwarded-For. Trust one hop so rate limiting uses the client IP.
app.set("trust proxy", 1);
app.use(helmet());

const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, false);
  },
  credentials: true
}));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));
app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: true, legacyHeaders: false }));
app.get("/api/health", (_req, res) => res.json({ success: true, message: "Expense API is healthy" }));
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/expenses", expenseRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/reports", reportRoutes);
app.use(notFound);
app.use(errorHandler);
module.exports = app;
