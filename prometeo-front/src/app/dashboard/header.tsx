// src/app/dashboard/header.tsx
"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "./header.module.css";
import { getCurrentUser, logoutUser, getInboundRadications, changePassword } from "../services/api";

interface User {
  id: number;
  full_name: string;
  email: string;
  role_id: number;
}

interface Radicado {
  radication_number: string;
  subject: string;
  created_at: string;
  status: string;
  remitente: string;
}

function getInitials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join("");
}

function getAvatarColor(name: string) {
  const colors = ["#E53935","#8B5CF6","#3B82F6","#10B981","#F59E0B","#EC4899","#06B6D4"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "ahora mismo";
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `hace ${hrs}h`;
  return `hace ${Math.floor(hrs / 24)}d`;
}

const ROLE_LABELS: Record<number, string> = {
  1: "Administrador",
  2: "Gestor Documental",
  3: "Radicador",
  4: "Lector",
};

export default function Header() {
  const router  = useRouter();
  const [user, setUser] = useState<User | null>(null);

  // Búsqueda
  const [query,       setQuery]       = useState("");
  const [results,     setResults]     = useState<Radicado[]>([]);
  const [allRads,     setAllRads]     = useState<Radicado[]>([]);
  const [searchOpen,  setSearchOpen]  = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Notificaciones
  const [notifOpen,   setNotifOpen]   = useState(false);
  const [notifs,      setNotifs]      = useState<Radicado[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);

  // Avatar dropdown
  const [dropOpen,    setDropOpen]    = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  // Modal cambio de contraseña
  const [pwModal,     setPwModal]     = useState(false);
  const [pwCurrent,   setPwCurrent]   = useState("");
  const [pwNew,       setPwNew]       = useState("");
  const [pwConfirm,   setPwConfirm]   = useState("");
  const [pwLoading,   setPwLoading]   = useState(false);
  const [pwError,     setPwError]     = useState("");
  const [pwSuccess,   setPwSuccess]   = useState(false);

  useEffect(() => {
    setUser(getCurrentUser());
    // Cargar radicados para búsqueda y notificaciones
    getInboundRadications()
      .then((data: Radicado[]) => {
        setAllRads(data);
        setNotifs(data.slice(0, 5)); // últimos 5 como notificaciones
      })
      .catch(() => {});
  }, []);

  // Búsqueda en tiempo real
  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const q = query.toLowerCase();
    setResults(
      allRads.filter(r =>
        r.radication_number.toLowerCase().includes(q) ||
        r.subject?.toLowerCase().includes(q) ||
        r.remitente?.toLowerCase().includes(q)
      ).slice(0, 6)
    );
  }, [query, allRads]);

  // Cerrar panels al click fuera
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    router.push("/login");
  };

  const handleSearchSelect = (r: Radicado) => {
    setQuery("");
    setSearchOpen(false);
    router.push("/dashboard/radicar");
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    if (pwNew !== pwConfirm) { setPwError("Las contraseñas no coinciden"); return; }
    if (pwNew.length < 6)    { setPwError("Mínimo 6 caracteres"); return; }
    try {
      setPwLoading(true);
      await changePassword(pwCurrent, pwNew);
      setPwSuccess(true);
      setTimeout(() => {
        setPwModal(false);
        setPwSuccess(false);
        setPwCurrent(""); setPwNew(""); setPwConfirm("");
      }, 1800);
    } catch (err: any) {
      setPwError(err.message || "Error al cambiar contraseña");
    } finally {
      setPwLoading(false);
    }
  };

  const displayName  = user?.full_name ?? "Usuario";
  const firstName    = displayName.split(" ")[0];
  const initials     = getInitials(displayName);
  const avatarColor  = getAvatarColor(displayName);
  const roleLabel    = user ? (ROLE_LABELS[user.role_id] ?? `Rol ${user.role_id}`) : "";

  return (
    <>
      <header className={styles.header}>
        <div className={styles.left}>
          <div className={styles.brand}>
            <img src="/logo.png" alt="Prometeo" className={styles.logo} />
            <span className={styles.logoText}>
              PROM<span className={styles.logoAccent}>ETEO</span>
            </span>
          </div>
          <div className={styles.divider} />
          <div className={styles.titles}>
            <h2 className={styles.title}>
              Bienvenido, <span className={styles.username}>{firstName}</span>
            </h2>
            <p className={styles.subtitle}>Panel de control — administra tus archivos</p>
          </div>
        </div>

        <div className={styles.right}>

          {/* ── Búsqueda ── */}
          <div className={styles.searchWrap} ref={searchRef}>
            <div className={styles.searchBox}>
              <svg className={styles.searchIcon} width="14" height="14"
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                className={styles.searchInput}
                placeholder="Buscar radicados..."
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSearchOpen(true); }}
                onFocus={() => setSearchOpen(true)}
              />
              {query && (
                <button className={styles.searchClear} onClick={() => setQuery("")}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              )}
            </div>

            {/* Resultados */}
            {searchOpen && results.length > 0 && (
              <div className={styles.searchDropdown}>
                <p className={styles.searchLabel}>Radicados encontrados</p>
                {results.map((r) => (
                  <button
                    key={r.radication_number}
                    className={styles.searchResult}
                    onClick={() => handleSearchSelect(r)}
                  >
                    <span className={styles.searchResultNum}>{r.radication_number}</span>
                    <span className={styles.searchResultSub}>{r.subject}</span>
                  </button>
                ))}
              </div>
            )}
            {searchOpen && query && results.length === 0 && (
              <div className={styles.searchDropdown}>
                <p className={styles.searchEmpty}>Sin resultados para "{query}"</p>
              </div>
            )}
          </div>

          {/* ── Notificaciones ── */}
          <div className={styles.notifWrap} ref={notifRef}>
            <button
              className={styles.iconButton}
              onClick={() => { setNotifOpen(v => !v); setDropOpen(false); }}
              aria-label="Notificaciones"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              {notifs.length > 0 && (
                <span className={styles.notifBadge}>
                  {notifs.length > 9 ? "9+" : notifs.length}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className={styles.notifDropdown}>
                <div className={styles.notifHeader}>
                  <span className={styles.notifTitle}>Últimos radicados</span>
                  <span className={styles.notifCount}>{notifs.length}</span>
                </div>
                <div className={styles.notifList}>
                  {notifs.length === 0 && (
                    <p className={styles.notifEmpty}>Sin actividad reciente</p>
                  )}
                  {notifs.map((n) => (
                    <button
                      key={n.radication_number}
                      className={styles.notifItem}
                      onClick={() => { setNotifOpen(false); router.push("/dashboard/radicar"); }}
                    >
                      <div className={styles.notifDot} />
                      <div className={styles.notifContent}>
                        <p className={styles.notifNum}>{n.radication_number}</p>
                        <p className={styles.notifSub}>{n.subject}</p>
                        <p className={styles.notifTime}>{timeAgo(n.created_at)}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <button
                  className={styles.notifFooter}
                  onClick={() => { setNotifOpen(false); router.push("/dashboard/radicar"); }}
                >
                  Ver todos los radicados →
                </button>
              </div>
            )}
          </div>

          {/* ── Avatar + dropdown ── */}
          <div className={styles.avatarWrap} ref={dropRef}>
            <button
              className={styles.avatarBtn}
              onClick={() => { setDropOpen(v => !v); setNotifOpen(false); }}
            >
              <div className={styles.avatarCircle} style={{ background: avatarColor }}>
                {initials}
              </div>
              <div className={styles.avatarInfo}>
                <span className={styles.avatarName}>
                  {displayName.split(" ").slice(0, 2).join(" ")}
                </span>
                <span className={styles.avatarRole}>{roleLabel}</span>
              </div>
              <svg
                className={`${styles.avatarChevron} ${dropOpen ? styles.avatarChevronOpen : ""}`}
                width="12" height="12" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            {dropOpen && (
              <div className={styles.dropdown}>
                {/* Info */}
                <div className={styles.dropUser}>
                  <div className={styles.dropAvatar} style={{ background: avatarColor }}>
                    {initials}
                  </div>
                  <div className={styles.dropUserInfo}>
                    <p className={styles.dropName}>{displayName}</p>
                    <p className={styles.dropEmail}>{user?.email ?? "—"}</p>
                    <span className={styles.dropRoleBadge}>{roleLabel}</span>
                  </div>
                </div>

                <div className={styles.dropDivider} />

                <button className={styles.dropItem}
                  onClick={() => { setDropOpen(false); setPwModal(true); }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  Cambiar contraseña
                </button>

                <div className={styles.dropDivider} />

                <button className={`${styles.dropItem} ${styles.dropItemDanger}`}
                  onClick={handleLogout}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* ══ MODAL CAMBIO DE CONTRASEÑA ══ */}
      {pwModal && (
        <div className={styles.pwOverlay} onClick={() => setPwModal(false)}>
          <div className={styles.pwModal} onClick={e => e.stopPropagation()}>
            <div className={styles.pwHeader}>
              <div>
                <p className={styles.pwEyebrow}>Seguridad de cuenta</p>
                <h3 className={styles.pwTitle}>Cambiar contraseña</h3>
              </div>
              <button className={styles.pwClose} onClick={() => setPwModal(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {pwSuccess ? (
              <div className={styles.pwSuccess}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
                  stroke="#10b981" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="9 12 11 14 15 10"/>
                </svg>
                <p>¡Contraseña actualizada correctamente!</p>
              </div>
            ) : (
              <form onSubmit={handleChangePassword} className={styles.pwForm}>
                <div className={styles.pwField}>
                  <label className={styles.pwLabel}>Contraseña actual</label>
                  <input
                    type="password"
                    className={styles.pwInput}
                    value={pwCurrent}
                    onChange={e => setPwCurrent(e.target.value)}
                    required
                    placeholder="••••••••"
                  />
                </div>
                <div className={styles.pwField}>
                  <label className={styles.pwLabel}>Nueva contraseña</label>
                  <input
                    type="password"
                    className={styles.pwInput}
                    value={pwNew}
                    onChange={e => setPwNew(e.target.value)}
                    required
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
                <div className={styles.pwField}>
                  <label className={styles.pwLabel}>Confirmar nueva contraseña</label>
                  <input
                    type="password"
                    className={styles.pwInput}
                    value={pwConfirm}
                    onChange={e => setPwConfirm(e.target.value)}
                    required
                    placeholder="Repite la nueva contraseña"
                  />
                </div>

                {pwError && <p className={styles.pwError}>{pwError}</p>}

                <div className={styles.pwActions}>
                  <button type="button" className={styles.pwBtnSecondary}
                    onClick={() => setPwModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className={styles.pwBtnPrimary} disabled={pwLoading}>
                    {pwLoading ? "Guardando..." : "Guardar contraseña"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}