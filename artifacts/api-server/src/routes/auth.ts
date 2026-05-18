// @ts-nocheck
import express from "express";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email } = req.body || {};

  let role = "employee";
  let name = "User";

  if (email?.includes("raj")) {
    role = "manager";
    name = "Raj Patel";
  }

  if (email?.includes("admin")) {
    role = "admin";
    name = "Admin User";
  }

  res.send({
    success: true,
    token: "demo-token",
    user: {
      id: 1,
      name,
      email: email || "demo@atomquest.com",
      role,
    },
  });
});

router.post("/register", async (_req, res) => {
  res.send({
    success: true,
  });
});

export default router;