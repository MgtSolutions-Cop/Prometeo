"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./Dashboard.module.css";
import { logoutUser } from "../services/api";
import SessionProvider from "../components/SessionProvider";
import Header from "./header";
import {
  FaChartBar,
  FaEnvelope,
  FaFolder,
  FaTasks,
  FaUserCog,
  FaBuilding,
  FaSignOutAlt,
  FaHome,
  FaRegAddressCard,
} from "react-icons/fa";

const navItems = [
  { href: "/dashboard",                     icon: FaHome,     label: "Home" },
  { href: "/dashboard/metrics",             icon: FaChartBar, label: "Métricas" },
  { href: "/dashboard/radicar",             icon: FaEnvelope, label: "Radicación" },
  { href: "/dashboard/labels", icon: FaFolder,   label: "Rotulos" },
  { href: "/dashboard/pending.activities",  icon: FaTasks,    label: "Actividades Pendientes" },
  { href: "/dashboard/user.management",     icon: FaUserCog,  label: "Gestión de Usuarios" },
  { href: "/dashboard/create.rol", icon: FaRegAddressCard, label: "Crear Roles" },
  { href: "/dashboard/create.dependencies", icon: FaBuilding, label: "Crear Dependencias" },
 
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
//creamos la funcion para invocarla en el boton 
  const handleLogout = async () => {
    //invocamos la funcion del back 
   await logoutUser();
   //cerrarmos el menu lateral
    setOpen(false)
    //redirigimos al login 
    router.push("/login");
  };

  return (
    <SessionProvider>
    <div className={styles.container}>

      {/* Overlay — cierra el sidebar al hacer click fuera */}
      {open && (
        <div className={styles.overlay} onClick={() => setOpen(false)} />
      )}

      {/* ── SIDEBAR (drawer flotante) ── */}
      <aside className={`${styles.sidebar} ${open ? styles.sidebarOpen : ""}`}>
        <nav className={styles.nav}>
          {navItems.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
                onClick={() => setOpen(false)}
              >
                <div className={styles.navItem}>
                  <Icon className={styles.icon} />
                  <span>{label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className={styles.navDivider} />

        <button className={styles.logout} 
          onClick={handleLogout}
          style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }} // Puedes mover estos estilos a tu .module.css
        >
          <FaSignOutAlt className={styles.logoutIcon} />
          <span>Cerrar sesión</span>
        </button>
      </aside>

      {/* ── MAIN ── */}
      <main className={styles.main}>
        {/* Header lleva el botón toggle */}
        <Header userName="Jaider" onMenuClick={() => setOpen((v) => !v)} />
        <div className={styles.pageContent}>{children}</div>
      </main>
    </div>
    </SessionProvider>
  );
}