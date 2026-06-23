import { pool } from './src/config/db.js';

async function probarConsultas() {
    try {
        console.log("Consultando tablas de Prometeo...\n");

        // Esta consulta nos trae los roles que insertamos al inicio
        const query = "SELECT role_id, name, description FROM roles";
        
        const result = await pool.query(query);

        // Imprimimos los resultados en una tabla bonita
        console.table(result.rows);

    } catch (error) {
        console.error("Error en la consulta:", error.message);
    } finally {
        // Cerramos la conexión para que el proceso termine
        await pool.end();
        console.log("\nPrueba terminada y conexión cerrada.");
    }
}

probarConsultas();