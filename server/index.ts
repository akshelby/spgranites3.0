import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.use((err: Error, _req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON in request body' });
  }
  next(err);
});

registerRoutes(app);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  const statusCode = (err as any).statusCode || 500;
  const message = statusCode === 500 ? 'Internal server error' : err.message;
  console.error(`[Server Error] ${_req?.method} ${_req?.path}:`, err.message);
  if (statusCode === 500) {
    console.error(err.stack);
  }
  res.status(statusCode).json({ error: message });
});

if (process.env.NODE_ENV === "production") {
  const distPath = path.resolve(__dirname, "../dist");
  app.use(express.static(distPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

process.on('uncaughtException', (error) => {
  console.error('[Uncaught Exception]:', error);
});

process.on('unhandledRejection', (reason) => {
  console.error('[Unhandled Rejection]:', reason);
});

const port = process.env.NODE_ENV === "production" ? 5000 : 3001;
app.listen(port, "0.0.0.0", () => {
  console.log(`API server running on port ${port}`);
});
