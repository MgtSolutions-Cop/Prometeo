"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = () => {
    if (email === "admin@prometeo.com" && password === "123456") {
      router.push("/dashboard"); // Redirige al dashboard
    } else {
      alert("Usuario o contraseña incorrectos");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <h2 className={styles.title}>Iniciar Sesión</h2>
        <input
          className={styles.inputField}
          type="text"
          placeholder="Usuario"
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
        <button className={styles.loginButton} onClick={handleLogin}>
          Ingresar
        </button>
        <p className={styles.footerText}><a href="/register" className="text-prometeo-pink">Registrarme</a></p>
        <p className={styles.footerText}>¿Olvidaste tu contraseña? </p>
        
      </div>
    </div>
  );
}
