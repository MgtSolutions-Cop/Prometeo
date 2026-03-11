"use client";
import { useMemo, useState } from "react";
import styles from "./user-management.module.css";

export default function UserManagement() {
  const [users] = useState([
    { id: 1, name: "Carlos Pérez",  email: "carlos@empresa.com", role: "Entity Administrator" },
    { id: 2, name: "Laura Gómez",   email: "laura@empresa.com",  role: "Document Manager" },
  ]);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      [u.name, u.email, u.role].some((v) => v.toLowerCase().includes(q))
    );
  }, [users, query]);

  const handleAddUser    = () => console.log("Abrir modal para crear usuario");
  const handleEditUser   = (id: number) => console.log("Editar usuario", id);
  const handleDeleteUser = (id: number) => console.log("Eliminar usuario", id);

  return (
    <div className={styles.wrap}>
      <div className={styles.heading}>
        <div>
          <h1 className={styles.h1}>Gestión de usuarios</h1>
          <p className={styles.sub}>Crea, edita y administra roles de usuarios</p>
        </div>
        <span className={styles.badge}>
          {/* User icon */}
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          Admin
        </span>
      </div>

      <div className={styles.card}>
        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <input
              className={styles.search}
              type="search"
              placeholder="Buscar por nombre, email o rol..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <span className={styles.searchHint}>
              {filtered.length}/{users.length}
            </span>
          </div>
          <button className={styles.addButton} onClick={handleAddUser}>
            + Nuevo usuario
          </button>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead className={styles.thead}>
              <tr>
                <th className={styles.th}>#</th>
                <th className={styles.th}>Nombre</th>
                <th className={styles.th}>Email</th>
                <th className={styles.th}>Rol</th>
                <th className={styles.thRight}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className={styles.tr}>
                  <td className={styles.td}>{u.id}</td>
                  <td className={styles.td}>
                    <div className={styles.nameCell}>
                      <span className={styles.dot} />
                      {u.name}
                    </div>
                  </td>
                  <td className={styles.td}>
                    <span className={styles.mono}>{u.email}</span>
                  </td>
                  <td className={styles.td}>
                    <span className={styles.roleBadge}>{u.role}</span>
                  </td>
                  <td className={`${styles.td} ${styles.tdRight}`}>
                    {/* Editar */}
                    <button className={styles.iconBtn} onClick={() => handleEditUser(u.id)} aria-label="Editar">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    {/* Eliminar */}
                    <button className={`${styles.iconBtn} ${styles.danger}`} onClick={() => handleDeleteUser(u.id)} aria-label="Eliminar">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                        <path d="M10 11v6"/>
                        <path d="M14 11v6"/>
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr className={styles.tr}>
                  <td className={styles.empty} colSpan={5}>
                    No hay resultados para "{query}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className={styles.hint}>
          Tip: luego agregamos modal "Crear/Editar usuario" y confirmación de borrado.
        </p>
      </div>
    </div>
  );
}