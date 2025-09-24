import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const{Pool}=pg;

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

pool.on("connect",()=>{
    console.log("Connected to Supabase DB");
});
export async function InitDb(){  
try {
    const res = await pool.query("SELECT NOW()");
    console.log("DB Time:", res.rows[0].now);
  } catch (err) {
    console.error(" Error connecting to DB:", err.message);
    process.exit(1)
  }
}