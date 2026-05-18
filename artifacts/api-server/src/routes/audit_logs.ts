// @ts-nocheck
import express from "express";

const router = express.Router();

router.get("/", (_req, res) => {
  res.json([]);
});

export default router;