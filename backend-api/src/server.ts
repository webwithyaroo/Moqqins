import app from "./app";
import dotenv from "dotenv";
import { initializeDatabase, closeDatabase } from "./database/init";

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || "development";

async function startServer() {
  try {
    // Initialize database first
    await initializeDatabase();

    const server = app.listen(PORT, () => {
      console.log(`🚀 Moqqins API server running on port ${PORT}`);
      console.log(`📊 Environment: ${NODE_ENV}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`📚 API docs: http://localhost:${PORT}/api/v1`);
      console.log(`💾 Database: SQLite initialized`);
      console.log(`⚡ Ready to handle Figma plugin requests!`);
    });

    // Graceful shutdown
    process.on("SIGTERM", async () => {
      console.log("🛑 SIGTERM received, shutting down gracefully...");
      server.close(async () => {
        await closeDatabase();
        process.exit(0);
      });
    });

    process.on("SIGINT", async () => {
      console.log("🛑 SIGINT received, shutting down gracefully...");
      server.close(async () => {
        await closeDatabase();
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
