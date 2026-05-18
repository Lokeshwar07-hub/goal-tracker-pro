// @ts-nocheck
import express from "express";

const router = express.Router();

const sharedGoals = [
  {
    id: 1,
    title: "Team Sales Growth",
    progress: 60,
    status: "in-progress",
    assignedTo: "Raj Patel",
  },
];

router.get("/", (_req, res) => {
  res.json(sharedGoals);
});

export default router;