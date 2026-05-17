import app from "./app";
import { logger } from "./lib/logger";

// Vercel serverless imports this module and invokes the Express app directly.
export default app;

function startServer() {
  const rawPort = process.env["PORT"] ?? "8080";
  const port = Number(rawPort);

  if (Number.isNaN(port) || port <= 0) {
    throw new Error(`Invalid PORT value: "${rawPort}"`);
  }

  app.listen(port, (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }

    logger.info({ port }, "Server listening");
  });
}

// When bundled for Node (local/Replit), listen on PORT. On Vercel, only export the app.
if (!process.env["VERCEL"]) {
  startServer();
}
