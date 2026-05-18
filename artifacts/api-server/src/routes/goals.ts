// @ts-nocheck
import express from "express";

const router = express.Router();

const mockGoals = [
  {
    id: 1,
    employeeId: 2,
    employeeName: "Sarah Johnson",
    thrustArea: "Revenue Growth",
    goalTitle: "Increase Sales",
    goalDescription: "Increase quarterly sales by 20%",
    unitOfMeasurement: "percentage",
    scoreType: "performance",
    target: 100,
    deadline: "2026-12-31",
    weightage: 25,
    achievement: 40,
    progressScore: 40,
    approvalStatus: "approved",
    lockStatus: false,
    quarter: "Q2 2026",
    quarterlyUpdates: [
      {
        id: 1,
        goalId: 1,
        progressStatus: "on_track",
        achievement: 40,
        comments: "Making steady progress",
        updatedAt: "2026-05-18T00:00:00Z",
      },
    ],
    comments: [],
    isShared: false,
    sharedGoalId: null,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-05-18T00:00:00Z",
  },
  {
    id: 2,
    employeeId: 3,
    employeeName: "Mike Chen",
    thrustArea: "Product Quality",
    goalTitle: "Improve Product Quality",
    goalDescription: "Reduce product defects by 30%",
    unitOfMeasurement: "percentage",
    scoreType: "performance",
    target: 100,
    deadline: "2026-11-30",
    weightage: 30,
    achievement: 10,
    progressScore: 10,
    approvalStatus: "approved",
    lockStatus: false,
    quarter: "Q2 2026",
    quarterlyUpdates: [
      {
        id: 2,
        goalId: 2,
        progressStatus: "behind",
        achievement: 10,
        comments: "Need to accelerate",
        updatedAt: "2026-05-18T00:00:00Z",
      },
    ],
    comments: [],
    isShared: false,
    sharedGoalId: null,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-05-18T00:00:00Z",
  },
  {
    id: 3,
    employeeId: 2,
    employeeName: "Sarah Johnson",
    thrustArea: "Team Development",
    goalTitle: "Team Training Program",
    goalDescription: "Complete 40 hours of training",
    unitOfMeasurement: "numeric",
    scoreType: "performance",
    target: 40,
    deadline: "2026-09-30",
    weightage: 20,
    achievement: 25,
    progressScore: 62.5,
    approvalStatus: "approved",
    lockStatus: false,
    quarter: "Q2 2026",
    quarterlyUpdates: [
      {
        id: 3,
        goalId: 3,
        progressStatus: "on_track",
        achievement: 25,
        comments: "Making good progress",
        updatedAt: "2026-05-18T00:00:00Z",
      },
    ],
    comments: [],
    isShared: true,
    sharedGoalId: 1,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-05-18T00:00:00Z",
  },
];

// GET /api/goals - List goals (filtered by role context)
// Returns array of Goal objects
router.get("/", (_req, res) => {
  res.json(mockGoals);
});

// GET /api/goals/:id - Get a single goal
router.get("/:id", (_req, res) => {
  const goal = mockGoals.find(g => g.id === parseInt(_req.params.id));
  if (!goal) {
    return res.status(404).json({ error: "Goal not found" });
  }
  res.json(goal);
});

// POST /api/goals - Create a new goal
router.post("/", (_req, res) => {
  res.json({
    success: true,
  });
});

// PUT /api/goals/:id - Update a goal
router.put("/:id", (_req, res) => {
  res.json({
    success: true,
  });
});

// DELETE /api/goals/:id - Delete a goal
router.delete("/:id", (_req, res) => {
  res.json({
    success: true,
  });
});

export default router;
