"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import styles from "./Dashboard.module.css";
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
} from "react-icons/fa";

const navItems = [
  { href: "/dashboard",                     icon: FaHome,     label: "Home" },
  { href: "/dashboard/metrics",             icon: FaChartBar, label: "Métricas" },
  { href: "/dashboard/radicar",             icon: FaEnvelope, label: "Radicación" },
  { href: "/dashboard/document.management", icon: FaFolder,   label: "Gestión Documental" },
  { href: "/dashboard/pending.activities",  icon: FaTasks,    label: "Actividades Pendientes" },
  { href: "/dashboard/user.management",     icon: FaUserCog,  label: "Gestión de Usuarios" },
  { href: "/dashboard/create.dependencies", icon: FaBuilding, label: "Crear Dependencias" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
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

        <Link href="/login" className={styles.logout} onClick={() => setOpen(false)}>
          <FaSignOutAlt className={styles.logoutIcon} />
          <span>Cerrar sesión</span>
        </Link>
      </aside>

      {/* ── MAIN ── */}
      <main className={styles.main}>
        {/* Header lleva el botón toggle */}
        <Header userName="Jaider" onMenuClick={() => setOpen((v) => !v)} />
        <div className={styles.pageContent}>{children}</div>
      </main>
    </div>
  );
}