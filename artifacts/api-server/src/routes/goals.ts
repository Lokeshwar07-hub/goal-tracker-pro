// @ts-nocheck
import express from "express";

const router = express.Router();

router.get("/", async (_req, res) => {
  res.send({
    success: true,
    goals: [],
  });
});

router.get("/:id", async (_req, res) => {
  res.send({
    success: true,
    goal: null,
  });
});

router.post("/", async (_req, res) => {
  res.send({
    success: true,
    message: "Goal created",
  });
});

router.put("/:id", async (_req, res) => {
  res.send({
    success: true,
    message: "Goal updated",
  });
});

router.delete("/:id", async (_req, res) => {
  res.send({
    success: true,
    message: "Goal deleted",
  });
});

export default router;