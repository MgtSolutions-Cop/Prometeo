import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

pool.on("connect", () => {
    console.log("Conectado exitosamente a la DB de Prometeo en el VPS");
});

// Función para verificar la conexión inicial
export async function InitDb() {  
    try {
        const res = await pool.query("SELECT NOW()");
        console.log("Hora del servidor DB:", res.rows[0].now);
    } catch (err) {
        console.error("Error conectando a la DB:", err.message);
        process.exit(1);
    }
}