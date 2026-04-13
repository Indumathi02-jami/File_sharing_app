const cors = require("cors");
const express = require("express");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const fileRoutes = require("./routes/fileRoutes");
const shareRoutes = require("./routes/shareRoutes");
const { errorHandler, notFound } = require("./middleware/errorMiddleware");

const app = express();

const allowedOrigin = process.env.CLIENT_URL || "http://localhost:3000";

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/storage", express.static(path.join(process.cwd(), "storage")));

app.get("/api/health", (_req, res) => {
  res.json({ message: "Smart File Sharing API is running." });
});

app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/share", shareRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
