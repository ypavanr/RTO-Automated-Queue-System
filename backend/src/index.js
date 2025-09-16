import express from "express";
import bodyParser from "body-parser";
import db from "./DB/pg.js";
import cors from "cors";
import env from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import usersRoutes from "./routes/usersRoutes.js";
import slotsRouter from "./routes/slotRoutes.js";
import tokensRoutes from "./routes/tokensRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app=express()
const __dirname = path.dirname(fileURLToPath(import.meta.url));
env.config({ path: path.join(__dirname, "../.env") });
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({
    origin:'*'
}));
db.connect().then(()=>{
  console.log("connected to database")
})
app.use("/", usersRoutes);
app.use("/",slotsRouter)
app.use("/", tokensRoutes);
app.use("/", adminRoutes);

app.listen(3000,()=>{
    console.log("server listening on port 3000")
})
