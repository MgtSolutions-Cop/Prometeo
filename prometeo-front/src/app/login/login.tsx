import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";
import { loginUser } from "../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      const data = await loginUser(email, password);

      // Puedes guardar info del usuario si viene en la respuesta:
      console.log("Login exitoso:", data);

      router.push("/dashboard/metrics");
    } catch (error: any) {
      alert(error.message || "Credenciales incorrectas");
    } finally {
      setLoading(false);
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
  );
}
