import express from "express";
import bodyParser from "body-parser";
import db from "./DB/pg.js";
import cors from "cors";
import env from "dotenv";
import path from "path";
import fs from "fs";
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
async function ensureSchema() {
  try {
    const schemaPath = path.join(__dirname, "DB", "schema.sql");
    const sql = fs.readFileSync(schemaPath, "utf8");
    await db.query(sql);
    console.log("database schema ensured");
  } catch (e) {
    console.error("failed to apply schema:", e);
  }
}

db.connect()
  .then(async () => {
    console.log("connected to database");
    await ensureSchema();
  })
  .catch((e) => {
    console.error("database connection error", e);
  });
app.use("/", usersRoutes);
app.use("/",slotsRouter)
app.use("/", tokensRoutes);
app.use("/", adminRoutes);

app.listen(3000,()=>{
    console.log("server listening on port 3000")
})
