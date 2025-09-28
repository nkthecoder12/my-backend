const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();
const { connectDB } = require("./config/db");

// Initialize Express
const app = express();

// ===== Middleware =====
app.use(cors({
  origin: ["https://vpacademy.in", "https://www.vpacademy.in"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(morgan("dev"));

// Handle raw body for webhook validation
app.use((req, res, next) => {
  if (req.originalUrl.startsWith("/api/webhook")) {
    req.setEncoding("utf8");
    let data = "";
    req.on("data", (chunk) => { data += chunk; });
    req.on("end", () => {
      req.rawBody = Buffer.from(data);
      try {
        req.body = JSON.parse(data || "{}");
      } catch (_) {
        req.body = {};
      }
      next();
    });
  } else {
    express.json()(req, res, next); // Normal JSON parser
  }
});

// ===== DB Connection =====
connectDB()
  .then(() => console.log("✅ DB connected"))
  .catch((err) => {
    console.error("❌ DB connection failed:", err);
    process.exit(1); // Exit if DB fails at startup
  });

// ===== Routes =====
app.use("/api", require("./routes/enroll"));
app.use("/api", require("./routes/webhook"));

app.get("/api/health", (req, res) => res.json({ ok: true }));

// ===== Start Server =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
