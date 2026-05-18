// @ts-nocheck
import express from "express";

const router = express.Router();

router.get("/", async (_req, res) => {
  res.send({
    success: true,
    quarters: [],
  });
});

router.post("/", async (_req, res) => {
  res.send({
    success: true,
    message: "Quarter created",
  });
});

export default router;