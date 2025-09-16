import express from "express";
import {
  getApplications,
  getNextApplication,
  verifyOtpAndFinishByUser,
  getTodayStats,
  revealOtpToUser
} from "../controllers/admincontroller.js"



const router = express.Router();
import requireAdmin from "../middleware/requireAdmin.js";

router.get("/applications", requireAdmin, getApplications);
router.get("/applications/next", requireAdmin, getNextApplication);
router.get("/stats/today", requireAdmin, getTodayStats);
router.post("/admin/otp/verify", requireAdmin, verifyOtpAndFinishByUser);
router.post("/admin/otp/reveal", requireAdmin, revealOtpToUser);


export default router;
