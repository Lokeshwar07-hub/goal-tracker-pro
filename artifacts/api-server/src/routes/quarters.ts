// @ts-nocheck
import express from "express";

const router = express.Router();

const quarters = [
  {
    id: 1,
    name: "Q1 2026",
    startDate: "2026-01-01",
    endDate: "2026-03-31",
  },
];

router.get("/", (_req, res) => {
  res.json(quarters);
});

export default router;