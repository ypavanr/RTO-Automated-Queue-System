import express from "express";
import { createUser } from "../controllers/usersController.js";

const usersRoutes = express.Router();
usersRoutes.post("/users", createUser);

export default usersRoutes;
