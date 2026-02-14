"use client";

import Link from "next/link";
import styles from "./Dashboard.module.css";
import Header from "./header";
import {
  FaChartBar,
  FaEnvelope,
  FaFolder,       // reemplazo de FaFolderTree
  FaTasks,
  FaUserCog,      // reemplazo de FaUserGear
  FaBuilding,
  FaSignOutAlt,
  FaHome,          // nuevo ícono para el dashboard principal
} from "react-icons/fa";

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
          <img src="/logo.png" alt="Prometeo" width={48} height={48} />
          <h2>PROMETEO</h2>
        </div>

        <nav className={styles.nav}>
          <Link href="/dashboard" className={styles.navLink}>
            <div className={styles.navItem}>
              <FaHome className={styles.icon} />
              <span>Home</span>
            </div>
          </Link>


          <Link href="/dashboard/metrics" className={styles.navLink}>
            <div className={styles.navItem}>
              <FaChartBar className={styles.icon} />
              <span>Métricas</span>
            </div>
          </Link>

          <Link href="/dashboard/radicar" className={styles.navLink}>
            <div className={styles.navItem}>
              <FaEnvelope className={styles.icon} />
              <span>Radicación</span>
            </div>
          </Link>

          <Link href="/dashboard/document.management" className={styles.navLink}>
            <div className={styles.navItem}>
              <FaFolder className={styles.icon} />
              <span>Gestión Documental</span>
            </div>
          </Link>

          <Link href="/dashboard/pending.activities" className={styles.navLink}>
            <div className={styles.navItem}>
              <FaTasks className={styles.icon} />
              <span>Actividades Pendientes</span>
            </div>
          </Link>

          <Link href="/dashboard/user.management" className={styles.navLink}>
            <div className={styles.navItem}>
              <FaUserCog className={styles.icon} />
              <span>Gestión de Usuarios</span>
            </div>
          </Link>

          <Link href="/dashboard/create.dependencies" className={styles.navLink}>
            <div className={styles.navItem}>
              <FaBuilding className={styles.icon} />
              <span>Crear Dependencias</span>
            </div>
          </Link>
        </nav>

        <Link href="/login" className={styles.logout}>
          <FaSignOutAlt className={styles.logoutIcon} />
          <span>Cerrar sesión</span>
        </Link>

      </aside>

      {/* Main content */}
      <main className={styles.main}>
        <Header userName="Jaider" />
        <div className={styles.pageContent}>{children}</div>
      </main>
    </div>
  );
}
