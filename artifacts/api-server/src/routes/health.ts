// @ts-nocheck
import express from "express";

const router = express.Router();

router.get("/health", (_req, res) => {
  res.send({
    status: "ok",
  });
});

export default router;