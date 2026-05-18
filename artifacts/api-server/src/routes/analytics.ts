// @ts-nocheck
import express from "express";

const router = express.Router();

// Mock data for analytics
const mockDepartmentPerformance = [
  {
    department: "Sales",
    avgScore: 78,
    totalEmployees: 5,
    totalGoals: 12,
    completedGoals: 8,
  },
  {
    department: "Engineering",
    avgScore: 82,
    totalEmployees: 8,
    totalGoals: 20,
    completedGoals: 16,
  },
  {
    department: "Marketing",
    avgScore: 75,
    totalEmployees: 4,
    totalGoals: 10,
    completedGoals: 7,
  },
  {
    department: "HR",
    avgScore: 85,
    totalEmployees: 3,
    totalGoals: 8,
    completedGoals: 7,
  },
];

const mockQuarterTrend = [
  {
    quarter: "Q1 2026",
    avgScore: 65,
    completed: 15,
    total: 35,
  },
  {
    quarter: "Q2 2026",
    avgScore: 72,
    completed: 22,
    total: 40,
  },
  {
    quarter: "Q3 2026",
    avgScore: 78,
    completed: 28,
    total: 40,
  },
  {
    quarter: "Q4 2026",
    avgScore: 81,
    completed: 35,
    total: 42,
  },
];

const mockUomBreakdown = [
  {
    uom: "percentage",
    count: 15,
    avgScore: 76,
  },
  {
    uom: "numeric",
    count: 18,
    avgScore: 79,
  },
  {
    uom: "timeline",
    count: 8,
    avgScore: 82,
  },
  {
    uom: "zero_based",
    count: 5,
    avgScore: 88,
  },
];

const mockGoalCompletion = [
  {
    label: "Completed",
    total: 46,
    completed: 38,
    percentage: 82.6,
  },
  {
    label: "On Track",
    total: 40,
    completed: 35,
    percentage: 87.5,
  },
  {
    label: "Behind",
    total: 20,
    completed: 12,
    percentage: 60.0,
  },
  {
    label: "Not Started",
    total: 5,
    completed: 0,
    percentage: 0.0,
  },
];

// GET /api/analytics/dashboard-summary - Get summary statistics
router.get("/dashboard-summary", (_req, res) => {
  res.json({
    totalGoals: 111,
    completedGoals: 85,
    pendingGoals: 26,
    progress: 76.6,
  });
});

// GET /api/analytics/pending-actions - Get pending actions
router.get("/pending-actions", (_req, res) => {
  res.json([
    {
      id: 1,
      title: "Review goals",
      status: "pending",
    },
    {
      id: 2,
      title: "Update quarterly progress",
      status: "pending",
    },
  ]);
});

// GET /api/analytics/department-performance - Get department performance stats
// Returns array of DeptPerformance objects
router.get("/department-performance", (_req, res) => {
  res.json(mockDepartmentPerformance);
});

// GET /api/analytics/quarter-trend - Get quarterly trend data
// Returns array of TrendPoint objects
router.get("/quarter-trend", (_req, res) => {
  res.json(mockQuarterTrend);
});

// GET /api/analytics/uom-breakdown - Get unit of measurement breakdown
// Returns array of UomStat objects
router.get("/uom-breakdown", (_req, res) => {
  res.json(mockUomBreakdown);
});

// GET /api/analytics/goal-completion - Get goal completion statistics
// Returns array of CompletionStat objects
router.get("/goal-completion", (_req, res) => {
  res.json(mockGoalCompletion);
});

// Default route - returns empty array
router.get("/", (_req, res) => {
  res.json([]);
});

export default router;
