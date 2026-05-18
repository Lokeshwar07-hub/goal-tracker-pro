// @ts-nocheck
import express from "express";

const router = express.Router();

const mockGoals = [
  {
    id: 1,
    title: "Increase Sales",
    description: "Increase quarterly sales by 20%",
    status: "in-progress",
    progress: 40,
    assignedTo: "Raj Patel",
    dueDate: "2026-12-31",
  },
  {
    id: 2,
    title: "Improve Product Quality",
    description: "Reduce product defects",
    status: "pending",
    progress: 10,
    assignedTo: "Sarah Johnson",
    dueDate: "2026-11-30",
  },
];

// IMPORTANT: return ARRAY directly
router.get("/", (_req, res) => {
  res.json(mockGoals);
});

router.get("/:id", (_req, res) => {
  res.json(mockGoals[0]);
});

router.post("/", (_req, res) => {
  res.json({
    success: true,
  });
});

router.put("/:id", (_req, res) => {
  res.json({
    success: true,
  });
});

router.delete("/:id", (_req, res) => {
  res.json({
    success: true,
  });
});

export default router;