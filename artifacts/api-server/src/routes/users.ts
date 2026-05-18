// @ts-nocheck
import express from "express";

const router = express.Router();

const users = [
  {
    id: 1,
    name: "Raj Patel",
    email: "raj.patel@atomquest.com",
    role: "manager",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah@atomquest.com",
    role: "employee",
  },
];

router.get("/", (_req, res) => {
  res.json(users);
});

router.get("/me", (_req, res) => {
  res.json(users[0]);
});

export default router;