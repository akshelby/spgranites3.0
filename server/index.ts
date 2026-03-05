import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.resolve(__dirname, "../dist");
const hasDistFolder = fs.existsSync(path.join(distPath, "index.html"));

const app = express();

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

if (hasDistFolder) {
  app.use(express.static(distPath));
}

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.use((err: Error, _req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON in request body' });
  }
  next(err);
});

const port = parseInt(process.env.PORT || '5000', 10);
const server = app.listen(port, "0.0.0.0", () => {
  console.log(`API server running on port ${port}`);
});

registerRoutes(app);

if (hasDistFolder) {
  app.get("/{*splat}", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  const statusCode = (err as any).statusCode || 500;
  const message = statusCode === 500 ? 'Internal server error' : err.message;
  console.error(`[Server Error] ${_req?.method} ${_req?.path}:`, err.message);
  if (statusCode === 500) {
    console.error(err.stack);
  }
  res.status(statusCode).json({ error: message });
});

process.on('uncaughtException', (error) => {
  console.error('[Uncaught Exception]:', error);
});

process.on('unhandledRejection', (reason) => {
  console.error('[Unhandled Rejection]:', reason);
});
