// @ts-nocheck
import express from "express";

const router = express.Router();

const sharedGoals = [
  {
    id: 1,
    primaryOwnerId: 1,
    primaryOwnerName: "Raj Patel",
    goalTitle: "Team Sales Growth",
    goalDescription: "Increase team sales by 25% in Q2 2026",
    thrustArea: "Revenue Growth",
    target: 100,
    unitOfMeasurement: "percentage",
    achievement: 60,
    linkedEmployeeIds: [2, 3],
    linkedEmployeeNames: ["Sarah Johnson", "Mike Chen"],
  },
  {
    id: 2,
    primaryOwnerId: 1,
    primaryOwnerName: "Raj Patel",
    goalTitle: "Customer Satisfaction",
    goalDescription: "Achieve 95% customer satisfaction rating",
    thrustArea: "Customer Excellence",
    target: 95,
    unitOfMeasurement: "percentage",
    achievement: 88,
    linkedEmployeeIds: [2, 3],
    linkedEmployeeNames: ["Sarah Johnson", "Mike Chen"],
  },
];

// GET /api/shared-goals - List all shared goals
// Returns array of SharedGoal objects
router.get("/", (_req, res) => {
  res.json(sharedGoals);
});

export default router;
