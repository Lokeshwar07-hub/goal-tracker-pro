// @ts-nocheck
import express from "express";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email } = req.body || {};

  let role = "employee";
  let name = "Sarah Johnson";

  if (email?.includes("raj")) {
    role = "manager";
    name = "Raj Patel";
  }

  if (email?.includes("admin")) {
    role = "admin";
    name = "Admin User";
  }

  const user = {
    id: 1,
    name,
    email: email || "demo@atomquest.com",
    role,
  };

  res.json({
    success: true,
    token: "demo-token-123",
    accessToken: "demo-token-123",
    user,
    data: user,
  });
});

router.get("/me", async (_req, res) => {
  res.json({
    id: 1,
    name: "Raj Patel",
    email: "raj.patel@atomquest.com",
    role: "manager",
  });
});

router.post("/register", async (_req, res) => {
  res.json({
    success: true,
  });
});

export default router;