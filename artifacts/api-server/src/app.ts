import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

// BUG FIX: `cors()` with no options defaults to Access-Control-Allow-Origin: *
// which works for simple GET requests but BLOCKS requests that include an
// Authorization header (credentials).  Browsers refuse credentialed requests
// to a wildcard origin.
//
// On Replit the frontend (port 18913 / external-3000) calls the backend API
// (port 8080 / external-8080) from a different origin, so every authenticated
// request was silently rejected by the browser's CORS preflight.
//
// Fix: reflect the requesting origin back (allow all origins) while explicitly
// permitting the Authorization header and common methods.  In production you
// would lock this down to the known Replit .replit.dev domain(s).
app.use(
  cors({
    origin: true, // reflect the request Origin
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
