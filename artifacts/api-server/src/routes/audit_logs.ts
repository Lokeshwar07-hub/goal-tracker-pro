// @ts-nocheck
import express from "express";

const router = express.Router();

router.get("/", async (_req, res) => {
  res.send({
    success: true,
    auditLogs: [],
  });
});

export default router;