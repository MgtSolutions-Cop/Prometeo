// src/app/dashboard/layout.tsx
"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef } from "react";
import styles from "./Dashboard.module.css";
import { logoutUser } from "../services/api";
import SessionProvider from "../components/SessionProvider";
import Header from "./header";
import {
  FaChartBar, FaEnvelope, FaFolder, FaTasks,
  FaUserCog, FaBuilding, FaSignOutAlt, FaHome, FaRegAddressCard,
} from "react-icons/fa";

const navItems = [
  { href: "/dashboard",                     icon: FaHome,           label: "Home",                   sub: null },
  { href: "/dashboard/metrics",             icon: FaChartBar,       label: "Métricas",               sub: null },
  {
    href: "/dashboard/radicar",
    icon: FaEnvelope,
    label: "Radicación",
    sub: [
      { href: "/dashboard/radicar/input",    label: "Entrada" },
      { href: "/dashboard/radicar/output",   label: "Salida" },
      { href: "/dashboard/radicar/internal", label: "Interno" },
    ],
  },
  { href: "/dashboard/labels",              icon: FaFolder,         label: "Rotulos",                sub: null },
  { href: "/dashboard/pending.activities",  icon: FaTasks,          label: "Actividades Pendientes", sub: null },
  { href: "/dashboard/user.management",     icon: FaUserCog,        label: "Gestión de Usuarios",    sub: null },
  { href: "/dashboard/create.rol",          icon: FaRegAddressCard, label: "Crear Roles",            sub: null },
  { href: "/dashboard/create.dependencies", icon: FaBuilding,       label: "Crear Dependencias",     sub: null },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [hoveredSub, setHoveredSub] = useState<string | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sidebarTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLogout = async () => {
    await logoutUser();
    setOpen(false);
    router.push("/login");
  };

  // Sidebar: abre con hover sobre el aside
  const handleSidebarEnter = () => {
    if (sidebarTimer.current) clearTimeout(sidebarTimer.current);
    setOpen(true);
  };

  // Sidebar: cierra con un delay al salir del aside
  const handleSidebarLeave = () => {
    sidebarTimer.current = setTimeout(() => {
      setOpen(false);
      setHoveredSub(null);
    }, 300);
  };

  const showSub = (href: string) => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setHoveredSub(href);
  };

  const hideSub = () => {
    hideTimer.current = setTimeout(() => setHoveredSub(null), 150);
  };

  return (
    <SessionProvider>
      <div className={styles.container}>
        <aside
          className={`${styles.sidebar} ${open ? styles.sidebarOpen : ""}`}
          onMouseEnter={handleSidebarEnter}
          onMouseLeave={handleSidebarLeave}
        >
          <nav className={styles.nav}>
            {navItems.map(({ href, icon: Icon, label, sub }) => {
              const isActive =
                href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname === href || pathname.startsWith(href + "/");
              const isSubOpen = hoveredSub === href;

              return (
                <div
                  key={href}
                  className={styles.navGroup}
                  onMouseEnter={() => sub && showSub(href)}
                  onMouseLeave={() => sub && hideSub()}
                >
                  <Link
                    href={href}
                    className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
                  >
                    <div className={styles.navItem}>
                      <div className={styles.iconBox}>
                        <Icon className={styles.icon} />
                      </div>
                      <span className={styles.navLabel}>{label}</span>
                      {sub && open && (
                        <svg
                          className={`${styles.chevron} ${isSubOpen ? styles.chevronOpen : ""}`}
                          width="12" height="12" viewBox="0 0 24 24"
                          fill="none" stroke="currentColor" strokeWidth="2"
                        >
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      )}
                    </div>
                  </Link>

                  {sub && isSubOpen && open && (
                    <div
                      className={styles.subMenu}
                      onMouseEnter={() => showSub(href)}
                      onMouseLeave={() => hideSub()}
                    >
                      {sub.map((s) => (
                        <Link
                          key={s.href}
                          href={s.href}
                          className={`${styles.subLink} ${pathname === s.href ? styles.subLinkActive : ""}`}
                          onClick={() => setHoveredSub(null)}
                        >
                          <span className={styles.subDot} />
                          {s.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className={styles.navDivider} />

          <button
            className={styles.logout}
            onClick={handleLogout}
            style={{ background: "none", border: "none", width: "100%", textAlign: "left", cursor: "pointer" }}
          >
            <FaSignOutAlt className={styles.logoutIcon} />
            <span className={styles.logoutLabel}>Cerrar sesión</span>
          </button>
        </aside>

        <main className={`${styles.main} ${open ? styles.mainShifted : ""}`}>
          <Header userName="Jaider" />
          <div className={styles.pageContent}>{children}</div>
        </main>
      </div>
    </SessionProvider>
  );
}