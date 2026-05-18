// @ts-nocheck
import express from "express";

const router = express.Router();

router.get("/", async (_req, res) => {
  res.send({
    success: true,
    sharedGoals: [],
  });
});

router.post("/", async (_req, res) => {
  res.send({
    success: true,
    message: "Shared goal created",
  });
});

export default router;