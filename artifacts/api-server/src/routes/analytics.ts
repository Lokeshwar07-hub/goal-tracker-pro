// @ts-nocheck
import express from "express";

const router = express.Router();

// Dashboard summary
router.get("/dashboard-summary", (_req, res) => {
  res.json({
    totalGoals: 12,
    completedGoals: 5,
    pendingGoals: 7,
    progress: 42,
    goals: [],
  });
});

// Pending actions
router.get("/pending-actions", (_req, res) => {
  res.json([
    {
      id: 1,
      title: "Review quarterly goals",
      status: "pending",
    },
    {
      id: 2,
      title: "Complete analytics review",
      status: "pending",
    },
  ]);
});

// Main analytics route
router.get("/", (_req, res) => {
  res.json([]);
});

export default router;