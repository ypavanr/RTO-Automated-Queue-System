import express from "express";
import { issueToken } from "../controllers/tokensController.js";

const router = express.Router();
router.post("/tokens/issue", issueToken);

export default router;
