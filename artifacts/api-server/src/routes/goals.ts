// @ts-nocheck
import express from "express";

const router = express.Router();

router.get("/", async (_req, res) => {
  res.json({
    success: true,
    goals: [],
    data: [],
  });
});

router.get("/:id", async (_req, res) => {
  res.json({
    success: true,
    goal: null,
    data: null,
  });
});

export default router;