// @ts-nocheck
import express from "express";

const router = express.Router();

router.post("/login", async (_req, res) => {
  res.send({
    success: true,
    message: "Temporary auth route for deployment",
  });
});

router.post("/register", async (_req, res) => {
  res.send({
    success: true,
    message: "Temporary register route for deployment",
  });
});

export default router;