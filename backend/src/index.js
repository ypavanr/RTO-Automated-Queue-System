import express from "express";
import bodyParser from "body-parser";
import db from "./DB/pg.js";
import cors from "cors";
import env from "dotenv";
import usersRoutes from "./routes/usersRoutes.js";

const app=express()
env.config()
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({
    origin:process.env.CORS_ORIGIN_URL
}));
db.connect().then(()=>{
  console.log("connected to database")
})
app.use("/", usersRoutes);
app.listen(3000,()=>{
    console.log("server listening on port 3000")
})
