import express from "express";
import { createUser, getUserOtp,cancelApplication  } from "../controllers/usersController.js";

const usersRoutes = express.Router();
usersRoutes.post("/users", createUser);
usersRoutes.get("/users/:user_id/otp", getUserOtp);
usersRoutes.post("/users/cancel", cancelApplication);

export default usersRoutes;
