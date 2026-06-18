import bcrypt from "bcrypt";

async function generar() {
    const clave = "123456";
    // Genera el hash con la misma configuración que usa tu auth.service.js
    const hash = await bcrypt.hash(clave, 10);
    console.log("\n--- COPIA ESTE HASH ---");
    console.log(hash);
    console.log("-----------------------\n");
}

generar();