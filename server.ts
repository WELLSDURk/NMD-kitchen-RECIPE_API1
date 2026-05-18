import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import connectDB from "./src/server/db";
import recipeRoutes from "./src/server/routes/recipeRoutes";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  console.log(`[INIT] Starting Kitchen Server in ${process.env.NODE_ENV || 'development'} mode`);

  // Middleware
  app.use(express.json());

  // Logging Middleware
  app.use((req, res, next) => {
    if (req.url.startsWith('/api')) {
      console.log(`[API REQUEST] ${req.method} ${req.url}`);
    }
    next();
  });

  // Health check - defined BEFORE any other logic
  app.get("/api/health", (req, res) => {
    console.log("[HEALTH] Responding to health check");
    res.status(200).json({ 
      status: "ok", 
      message: "Kitchen API is operational", 
      env: process.env.NODE_ENV || 'development',
      time: new Date().toISOString()
    });
  });

  // API Routes
  app.use("/api/recipes", recipeRoutes);

  // API 404
  app.use("/api", (req, res) => {
    console.log(`[API 404] ${req.method} ${req.url}`);
    res.status(404).json({ error: "API Route Not Found" });
  });

  // Vite/Static
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server listening at http://0.0.0.0:${PORT}`);
    connectDB().catch(err => console.error("Database connection failed:", err));
  });
}

startServer();
