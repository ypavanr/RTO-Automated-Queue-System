import express from "express";
import { createUser, getPendingUsers, getNextPendingUser  } from "../controllers/usersController.js";

const usersRoutes = express.Router();
usersRoutes.post("/users", createUser);
usersRoutes.get("/users/pending", getPendingUsers);       
usersRoutes.get("/users/pending/next", getNextPendingUser); 
export default usersRoutes;
