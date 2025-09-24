"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./register.module.css";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();

  const handleRegister = () => {
    if (!email || !password || !confirmPassword) {
      alert("Por favor completa todos los campos");
      return;
    }
    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    // Aquí iría la lógica real de registro (API, DB, etc.)
    alert(`Cuenta creada para ${email}`);
    router.push("/login"); // Redirige al login
  };

  return (
    <div className={styles.container}>
      <div className={styles.registerBox}>
        <h2 className={styles.title}>Registrarse</h2>
        <input
          className={styles.inputField}
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className={styles.inputField}
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          className={styles.inputField}
          type="password"
          placeholder="Confirmar contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button className={styles.registerButton} onClick={handleRegister}>
          Registrarse
        </button>
        <p className={styles.footerText}>
          ¿Ya tienes cuenta? <a href="/login" className="text-prometeo-pink">Inicia sesión</a>
        </p>
      </div>
    </div>
  );
}
