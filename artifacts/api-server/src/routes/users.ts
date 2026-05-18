// @ts-nocheck
import express from "express";

const router = express.Router();

router.get("/", async (_req, res) => {
  res.send({
    success: true,
    users: [],
  });
});

router.get("/:id", async (_req, res) => {
  res.send({
    success: true,
    user: null,
  });
});

export default router;