"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";
import { loginUser } from "../services/api";

export default function Login() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    try {
      setLoading(true);
      const data = await loginUser(email, password);
      console.log("Login exitoso:", data);
      router.push("/dashboard");
    } catch (error: any) {
      alert(error.message || "Credenciales incorrectas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>

      {/* ── Botón volver ── */}
      <button className={styles.backBtn} onClick={() => router.push("/")}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Volver
      </button>

      <div className={styles.card}>
        {/* Panel izquierdo */}
        <div className={styles.leftPanel}>
          <h2>BIENVENIDO!</h2>
          <p>
            Gestiona y protege tus archivos
            <br />
            desde un solo lugar con prometeo.
          </p>
        </div>

        {/* Panel derecho */}
        <div className={styles.rightPanel}>
          <h2 className={styles.formTitle}>Sign In</h2>
          <div className={styles.inputGroup}>
            <input
              type="text"
              placeholder="Usuario"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className={styles.inputGroup}>
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            className={styles.loginButton}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
          <p className={styles.footerText}>¿Olvidaste tu contraseña?</p>
        </div>
      </div>
    </div>
  );
}