import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";
import  router from "./src/routes.js";
import { InitDb } from "./src/config/db.js";
//import para poder acceder a la imagen del radicado
import path from "path";
import { fileURLToPath } from "url";


dotenv.config();
await InitDb();
const app=express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
origin:"http://localhost:3000",
credentials:true,
}));

//creamos las constantes para poder obtener las imagen del radicado
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
//servimos la carpeta 
app.use("/stickers", express.static("public/stickers"));
app.use("/api",router);
app.get("/",(req, res)=>{
    res.send("Prometeo api Run");
});
const PORT= process.env.PORT || 4000;

app.listen(PORT,()=>{
console.log(`Servidor corriendo PORT,${PORT}`);

});