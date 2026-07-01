"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import styles from "./login.module.css";
import { loginUser } from "../services/api";

export default function Login() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      toast.warning("Por favor ingresa tu usuario y contraseña");
      return;
    }
    try {
      setLoading(true);
      await loginUser(email, password);
      toast.success("¡Bienvenido a Prometeo!");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error("Credenciales incorrectas. Verifica tu usuario y contraseña.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
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
              onKeyDown={handleKeyDown}
            />
          </div>

          <div className={styles.inputGroup}>
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
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