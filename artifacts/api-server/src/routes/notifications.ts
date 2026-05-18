// @ts-nocheck
import express from "express";

const router = express.Router();

router.get("/", async (_req, res) => {
  res.send({
    success: true,
    notifications: [],
  });
});

export default router;