// ─────────────────────────────────────────────
// layout.tsx — Layout principal del dashboard
// Renderiza el sidebar con los items filtrados
// según los permisos del usuario logueado.
// El filtrado ocurre en cliente después de
// leer localStorage (sin petición al servidor)
// ─────────────────────────────────────────────
"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import styles from "./Dashboard.module.css";
import { logoutUser, getCurrentUser, getMe } from "../services/api";
import type { StoredUser } from "../services/api";
import SessionProvider from "../components/SessionProvider";
import Header from "./header";
import {
  FaChartBar, FaEnvelope, FaFolder, FaTasks,
  FaUserCog, FaBuilding, FaSignOutAlt, FaHome,
  FaRegAddressCard, FaFilePdf
} from "react-icons/fa";

// ─────────────────────────────────────────────
// DEFINICIÓN DE ITEMS DEL NAVBAR
// Cada item tiene una prop `permission` que
// indica qué permiso del rol necesita el usuario
// para verlo. Si permission es null, el item
// es visible para TODOS los roles (ej: Home)
// ─────────────────────────────────────────────
const navItems = [
  {
    href: "/dashboard",
    icon: FaHome,
    label: "Home",
    permission: null, // visible para todos
    sub: null,
  },
  {
    href: "/dashboard/metrics",
    icon: FaChartBar,
    label: "Métricas",
    permission: null, // visible para todos
    sub: null,
  },
  {
    href: "/dashboard/radicar",
    icon: FaEnvelope,
    label: "Radicación",
    // Solo usuarios con permiso de radicar ven este módulo
    permission: "can_radicate_documents",
    sub: [
      { href: "/dashboard/radicar/input",    label: "Entrada" },
      { href: "/dashboard/radicar/output",   label: "Salida" },
      { href: "/dashboard/radicar/internal", label: "Interno" },
    ],
  },
  {
    href: "/dashboard/labels",
    icon: FaFolder,
    label: "Rótulos",
    permission: null, // visible para todos los logueados
    sub: null,
  },
  {
    href: "/dashboard/pending.activities",
    icon: FaTasks,
    label: "Actividades Pendientes",
    permission: null, // visible para todos
    sub: null,
  },
  {
    href: "/dashboard/user.management",
    icon: FaUserCog,
    label: "Gestión de Usuarios",
    // Solo quien puede crear usuarios ve esta sección
    permission: "can_create_users",
    sub: null,
  },
  {
    href: "/dashboard/create.rol",
    icon: FaRegAddressCard,
    label: "Gestión de Roles",
    // Solo quien puede asignar roles ve esta sección
    permission: "can_assign_roles",
    sub: null,
  },
  {
    href: "/dashboard/create.dependencies",
    icon: FaBuilding,
    label: "Gestión de Dependencias",
    // Misma restricción que crear usuarios
    permission: "can_create_users",
    sub: null,
  },
  {
    href: "/dashboard/template",
    icon: FaFilePdf,
    label: "Modificar Plantilla",
    // Solo admins que configuran TRD
    permission: "can_configure_trd",
    sub: null,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [hoveredSub, setHoveredSub] = useState<string | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sidebarTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─────────────────────────────────────────────
  // Estado del usuario: se carga desde localStorage
  // al montar el componente. Si no hay usuario
  // guardado, redirige al login.
  // Usamos StoredUser | null para tener tipos
  // correctos en TypeScript.
  // ─────────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    // Leemos el usuario de localStorage al montar
    const user = getCurrentUser();

    if (!user) {
      // Si no hay usuario guardado, mandamos al login
      router.push("/login");
      return;
    }

    setCurrentUser(user);

    // ─────────────────────────────────────────────
    // Refrescamos los permisos desde el servidor
    // en segundo plano. Esto actualiza los permisos
    // si el admin los cambió mientras el usuario
    // tenía la sesión activa, sin interrumpir el UX.
    // ─────────────────────────────────────────────
    getMe()
      .then((freshUser) => setCurrentUser(freshUser))
      .catch(() => {
        // Si falla (sesión expirada), el SessionProvider
        // maneja la redirección vía evento SESSION_EXPIRED
        console.warn("No se pudo refrescar datos del usuario");
      });
  }, []);

  // ─────────────────────────────────────────────
  // filterNavItems
  // Filtra el array de navItems según los permisos
  // del usuario actual:
  // - Si el item no requiere permiso → siempre visible
  // - Si requiere permiso → visible solo si el
  //   usuario tiene ese permiso en true
  // ─────────────────────────────────────────────
  const filteredNavItems = navItems.filter((item) => {
    // Items sin restricción son visibles para todos
    if (!item.permission) return true;

    // Si no hay usuario cargado aún, ocultamos items restringidos
    if (!currentUser) return false;

    // Verificamos el permiso específico del item
    // en el objeto permissions del usuario
    const permissions = currentUser.permissions;
    return permissions[item.permission as keyof typeof permissions] === true;
  });

  const handleLogout = async () => {
    await logoutUser(); // limpia cookies + localStorage
    setOpen(false);
    router.push("/login");
  };

  // Sidebar: abre con hover
  const handleSidebarEnter = () => {
    if (sidebarTimer.current) clearTimeout(sidebarTimer.current);
    setOpen(true);
  };

  // Sidebar: cierra con delay al salir
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
            {/* ─────────────────────────────────────────────
              Renderizamos SOLO los items que pasaron
              el filtro de permisos. El usuario nunca
              ve opciones que no le corresponden.
              La protección real de los endpoints
              sigue estando en el backend con
              requirePermission() — esto es solo UI.
            ───────────────────────────────────────────── */}
            {filteredNavItems.map(({ href, icon: Icon, label, sub }) => {
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
                    className={`${styles.navLink} ${
                      isActive ? styles.navLinkActive : ""
                    }`}
                  >
                    <div className={styles.navItem}>
                      <div className={styles.iconBox}>
                        <Icon className={styles.icon} />
                      </div>
                      <span className={styles.navLabel}>{label}</span>
                      {sub && open && (
                        <svg
                          className={`${styles.chevron} ${
                            isSubOpen ? styles.chevronOpen : ""
                          }`}
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
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
                          className={`${styles.subLink} ${
                            pathname === s.href ? styles.subLinkActive : ""
                          }`}
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
            style={{
              background: "none",
              border: "none",
              width: "100%",
              textAlign: "left",
              cursor: "pointer",
            }}
          >
            <FaSignOutAlt className={styles.logoutIcon} />
            <span className={styles.logoutLabel}>Cerrar sesión</span>
          </button>
        </aside>

        <main
          className={`${styles.main} ${open ? styles.mainShifted : ""}`}
        >
          <Header userName={currentUser?.full_name ?? "Usuario"} />
          <div className={styles.pageContent}>{children}</div>
        </main>
      </div>
|    </SessionProvider>
  );
}