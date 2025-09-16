import express from "express";
import { createUser, getUserOtp,cancelApplication, loginUser, getPendingUsers  } from "../controllers/usersController.js";

const usersRoutes = express.Router();
usersRoutes.post("/users", createUser);
usersRoutes.get("/users/:user_id/otp", getUserOtp);
usersRoutes.post("/users/cancel", cancelApplication);
usersRoutes.post("/login", loginUser);
usersRoutes.get("/users/pending", getPendingUsers);

export default usersRoutes;
