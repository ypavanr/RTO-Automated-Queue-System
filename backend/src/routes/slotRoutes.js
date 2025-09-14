import express from "express";
import { selectTimeSlot,getSlotQueue,getSlotsAvailability } from "../controllers/slotsController.js";
const slotsRouter = express.Router();
slotsRouter.post("/slots", selectTimeSlot); 
slotsRouter.get("/slots/availability", getSlotsAvailability);
slotsRouter.get("/slots/queue", getSlotQueue);
export default slotsRouter  