import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import router from "./routes";

// Load environment variables
dotenv.config();

const app = express();

// Middleware (think of these as security guards and helpers)
app.use(helmet()); // Adds security headers
app.use(
  cors({
    origin: "*", // Allow requests from anywhere (for development)
    credentials: true,
  })
);
app.use(morgan("combined")); // Log all requests
app.use(express.json({ limit: "10mb" })); // Parse JSON bodies up to 10MB
app.use(express.urlencoded({ extended: true })); // Parse form data

// Health check endpoint (to test if server is running)
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "Moqqins API",
    version: "1.0.0",
  });
});

// API routes will go here

app.use("/api/v1", router);

// Error handling middleware (catches all errors)
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Error occurred:", err.stack);
    res.status(500).json({
      error: "Something went wrong!",
      message:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Internal server error",
    });
  }
);

// Handle 404 - Route not found
app.use("/*splat", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

export default app;
