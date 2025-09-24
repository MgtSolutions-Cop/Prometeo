import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";
import  router from "./src/routes.js";
import { InitDb } from "./src/config/db.js";
dotenv.config();
await InitDb();
const app=express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
origin:"http://localhost:3000",
credentials:true,
}));

app.use("/api",router);
app.get("/",(res,req)=>{
    res.send("Prometeo api Run");
});
const PORT= process.env.PORT || 4000;

app.listen(PORT,()=>{
console.log(`Servidor corriendo PORT,${PORT}`);

});