// @ts-nocheck
import express from "express";

const router = express.Router();

router.get("/dashboard-summary", (_req, res) => {
  res.json({
    totalGoals: 12,
    completedGoals: 5,
    pendingGoals: 7,
    progress: 42,
  });
});

router.get("/pending-actions", (_req, res) => {
  res.json([
    {
      id: 1,
      title: "Review goals",
      status: "pending",
    },
  ]);
});

router.get("/", (_req, res) => {
  res.json([]);
});

export default router;