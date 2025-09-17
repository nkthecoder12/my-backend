const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();
const { connectDB } = require("./config/db");

// Initialize Express
const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
app.use(morgan("dev"));

// Use rawBody for webhook signature validation
app.use((req, res, next) => {
  if (req.originalUrl.startsWith("/api/webhook")) {
    req.setEncoding("utf8");
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
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
    express.json()(req, res, next);
  }
});

// Connect DB once before handling requests
let dbReady = false;
async function ensureDB() {
  if (!dbReady) {
    await connectDB();
    dbReady = true;
  }
}

app.use(async (req, res, next) => {
  try {
    await ensureDB();
    next();
  } catch (e) {
    console.error("DB connection error", e);
    res.status(500).json({ message: "DB connection failed" });
  }
});

// Routes
app.use("/api", require("./routes/enroll"));
app.use("/api", require("./routes/webhook"));

app.get("/api/health", (req, res) => res.json({ ok: true }));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
