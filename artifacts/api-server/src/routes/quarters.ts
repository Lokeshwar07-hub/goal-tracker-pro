// @ts-nocheck
import express from "express";

const router = express.Router();

router.get("/", async (_req, res) => {
  res.json({
    success: true,
    quarters: [],
    data: [],
  });
});

export default router;