import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import usersRouter from "./users.js";
import goalsRouter from "./goals.js";
import sharedGoalsRouter from "./shared_goals.js";
import quartersRouter from "./quarters.js";
import notificationsRouter from "./notifications.js";
import auditLogsRouter from "./audit_logs.js";
import analyticsRouter from "./analytics.js";
import adminRouter from "./admin.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/goals", goalsRouter);
router.use("/shared-goals", sharedGoalsRouter);
router.use("/quarters", quartersRouter);
router.use("/notifications", notificationsRouter);
router.use("/audit-logs", auditLogsRouter);
router.use("/analytics", analyticsRouter);
router.use("/reports", analyticsRouter);
router.use("/admin", adminRouter);

export default router;
