// src/app/dashboard/layout.tsx
import styles from "./Dashboard.module.css";
import Header from "./header"; 

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <img src="/logo.png" alt="Prometeo" width={40} height={40} />
          <h2>Prometeo</h2>
        </div>

        <nav className={styles.nav}>
          <a href="#" className={styles.navLink}>
            📂 Archivos
          </a>
          <a href="#" className={styles.navLink}>
            ⭐ Favoritos
          </a>
          <a href="#" className={styles.navLink}>
            ⚙️ Configuración
          </a>
        </nav>

        <a href="/login" className={styles.logout}>
          Cerrar sesión
        </a>
      </aside>

      {/* Main content */}
      <main className={styles.main}>
        {/* Header con "Bienvenido" + icono + avatar */}
        <Header userName="Jaider" />

        {/* Contenido de la página debajo del header */}
        <div className={styles.pageContent}>{children}</div>
      </main>
    </div>
  );
}
