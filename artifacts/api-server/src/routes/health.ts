import { HealthCheckResponse } from "@workspace/api-zod";
import { createRouter } from "../lib/router.js";

const router = createRouter();

router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

export default router;
