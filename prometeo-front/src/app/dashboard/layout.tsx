import Link from "next/link"; // Importar Link de Next
import styles from "./Dashboard.module.css";
import Header from "./header"; 
import { FaFolderOpen,FaChartLine,FaEnvelopeOpenText } from "react-icons/fa";
import { FaClipboardList,FaUsersBetweenLines,FaSchoolCircleCheck} from "react-icons/fa6";

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
           <div className={styles.navItem}>
           <FaChartLine/>
           <span>Metricas</span>
           </div>
          </Link>
          
          <Link href="/dashboard/radicar" className={styles.navLink}>
            <div className={styles.navItem}>
              <FaEnvelopeOpenText/>
            <span>Radicacion</span>
            </div>
          </Link>

          <Link href="/dashboard/document.management" className={styles.navLink}>
          <div className={styles.navItem}>
          <FaFolderOpen/> 
          <span>Gestion documental</span>
          </div>
          </Link>

          <Link href="/dashboard/pending.activities" className={styles.navLink}>
          <div className={styles.navItem}>
            <FaClipboardList/>
            <span>Actividades Pendientes</span>
            </div>
          </Link>

          <Link href="/dashboard/user.management" className={styles.navLink}>
          <div className={styles.navItem}>
            <FaUsersBetweenLines/>
          <span>Gestion de usuarios</span> 
          </div>
          </Link>

          <Link href="/dashboard/create.dependencies" className={styles.navLink}>
         <div className={styles.navItem}>
          <FaSchoolCircleCheck/>
         <span>Crear dependencias</span>  
         </div>
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
