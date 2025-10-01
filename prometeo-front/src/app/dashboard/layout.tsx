

import Link from "next/link"; // Importar Link de Next


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

          <Link href="/dashboard/metrics" className={styles.navLink}>
            📈 Metricas
          </Link>
          <Link href="/dashboard/radicar" className={styles.navLink}>
            📨 Radicacion
          </Link>
          <Link href="/dashboard/document.management" className={styles.navLink}>
            🗃️ Gestion documental
          </Link>
          <Link href="/dashboard/pending.activities" className={styles.navLink}>
            📝 Actividades Pendientes
          </Link>
          <Link href="/dashboard/user.management" className={styles.navLink}>
          👥 Gestion de usuarios 
          </Link>
          <Link href="/dashboard/create.dependencies" className={styles.navLink}>
          🏬 Crear dependencias 
          </Link>
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
