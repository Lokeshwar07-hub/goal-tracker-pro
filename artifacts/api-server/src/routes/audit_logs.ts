// @ts-nocheck
import express from "express";

const router = express.Router();

router.get("/", async (_req, res) => {
  res.json({
    success: true,
    auditLogs: [],
    data: [],
  });
});

export default router;