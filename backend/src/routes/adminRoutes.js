import express from "express";
import {
  getApplications,
  getNextApplication,
  verifyOtpAndFinishByUser}
  from "../controllers/admincontroller.js"



const router = express.Router();

router.get("/applications", getApplications);
router.get("/applications/next", getNextApplication);

router.post("/admin/otp/verify", verifyOtpAndFinishByUser);

router.post("/admin/otp/reveal", revealTokenOtpToApplicant);

export default router;
