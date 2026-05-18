// @ts-nocheck
import express from "express";

const router = express.Router();

const users = [
  {
    id: 1,
    name: "Raj Patel",
    email: "raj.patel@atomquest.com",
    role: "manager",
    department: "Sales",
    createdAt: "2025-01-01T00:00:00Z",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah@atomquest.com",
    role: "employee",
    department: "Engineering",
    createdAt: "2025-01-01T00:00:00Z",
  },
  {
    id: 3,
    name: "Mike Chen",
    email: "mike.chen@atomquest.com",
    role: "employee",
    department: "Sales",
    createdAt: "2025-01-01T00:00:00Z",
  },
];

router.get("/", (_req, res) => {
  res.json(users);
});

router.get("/me", (_req, res) => {
  res.json(users[0]);
});

// GET /api/users/my-team - Get team members for current manager
// Returns array of User objects for the manager's direct reports
router.get("/my-team", (_req, res) => {
  // In a real app, filter by current user's managerId
  // For now, return all non-manager users as "team members"
  const teamMembers = users.filter(u => u.role === "employee");
  res.json(teamMembers);
});

export default router;
