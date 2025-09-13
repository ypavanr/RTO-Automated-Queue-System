import express from "express";
import { selectTimeSlot } from "../controllers/slotsController.js";
const slotsRouter = express.Router();
slotsRouter.post("/slots", selectTimeSlot); 
export default slotsRouter  