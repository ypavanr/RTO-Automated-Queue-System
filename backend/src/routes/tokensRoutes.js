import express from "express";
import { issueToken, getActiveTokenForUser } from "../controllers/tokensController.js";

const router = express.Router();
router.post("/tokens/issue", issueToken);
router.get("/tokens/active", getActiveTokenForUser);

export default router;
