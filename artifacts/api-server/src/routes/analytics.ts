// @ts-nocheck
import express from "express";

const router = express.Router();

router.get("/", async (_req, res) => {
  res.json({
    success: true,
    analytics: {
      totalGoals: 0,
      completedGoals: 0,
      progress: 0,
    },
    data: {
      totalGoals: 0,
      completedGoals: 0,
      progress: 0,
    },
  });
});

export default router;