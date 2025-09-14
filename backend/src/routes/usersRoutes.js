import express from "express";
import { createUser, getUserOtp  } from "../controllers/usersController.js";

const usersRoutes = express.Router();
usersRoutes.post("/users", createUser);
usersRoutes.get("/users/:user_id/otp", getUserOtp);

export default usersRoutes;
