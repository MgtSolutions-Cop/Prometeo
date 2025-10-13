import styles from "./landing.module.css";

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-6">
      <img
        src="/logo.png"
        alt="Prometeo Logo"
        className="w-32 h-32 mb-6 object-contain"
      />

      <h1 className="text-4xl font-bold text-prometeo-white mb-2">PROMETEO</h1>
      <p className="text-prometeo-pink text-lg mb-8">
        Simplifica · Organiza · Optimiza
      </p>

      <div className="flex gap-4">
        <a href="/login" className={styles.button}>
          Iniciar sesión
        </a>
      </div>

      <footer className="mt-12 text-sm text-gray-400">
        © 2025 Prometeo. Todos los derechos reservados pa Miguel y Jaider.
      </footer>
    </div>
  );
}
